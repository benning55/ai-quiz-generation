import os
import json
import re
import stripe
import requests
import hmac
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import Depends, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session
from groq import Groq

from .. import db
from ..db import models as db_models
from ..models import schemas
from ..utils import config, file_utils

# Initialize clients
stripe.api_key = config.STRIPE_SECRET_KEY
groq_client = Groq(api_key=config.GROQ_API_KEY)

#
# User Services
#

def get_user_by_clerk_id(db: Session, clerk_id: str) -> Optional[db_models.User]:
    return db.query(db_models.User).filter(db_models.User.clerk_id == clerk_id).first()

def create_user(db: Session, user: schemas.UserCreate) -> db_models.User:
    db_user = db_models.User(**user.dict(), last_sign_in=datetime.now(timezone.utc))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, clerk_id: str, user_data: dict) -> Optional[db_models.User]:
    db_user = get_user_by_clerk_id(db, clerk_id)
    if db_user:
        for key, value in user_data.items():
            setattr(db_user, key, value)
        db_user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_user)
    return db_user

def get_or_create_user(db: Session, user_data: dict) -> db_models.User:
    clerk_id = user_data.get("id")
    db_user = get_user_by_clerk_id(db, clerk_id)
    if db_user:
        # Update user with latest sign-in time
        db_user.last_sign_in = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    # Create new user if not found
    user_schema = schemas.UserCreate(
        clerk_id=clerk_id,
        email=next((e["email_address"] for e in user_data.get("email_addresses", [])), None),
        first_name=user_data.get("first_name"),
        last_name=user_data.get("last_name"),
        image_url=user_data.get("image_url"),
    )
    return create_user(db, user_schema)


#
# Authentication Services
#

async def get_current_user(request: Request, db: Session = Depends(db.database.get_db)) -> db_models.User:
    # In a real app, you would validate the Clerk JWT here.
    # For this refactor, we are simplifying and assuming the header contains the clerk_id.
    # This is NOT secure and should be replaced with proper JWT validation.
    clerk_id = request.headers.get("Authorization") 
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # In a real app you'd get user info from the validated token payload.
    # Here we are simulating getting it from a header for simplicity.
    # For example: user_info_header = request.headers.get("X-User-Info")
    # user_info = json.loads(user_info_header)
    
    # This part is a placeholder for how you might get/create a user.
    # The actual implementation depends on how you pass user data from the frontend/gateway.
    # For the webhook-driven approach, the user should already exist.
    user = get_user_by_clerk_id(db, clerk_id)
    if not user:
        # This behavior might need adjustment. Should an API call from a non-existent user create them?
        # Or should creation only happen via webhook? For now, we raise an error.
        raise HTTPException(status_code=404, detail="User not found")
        
    return user


#
# Flashcard Services
#

def get_flashcards(db: Session, skip: int, limit: int, category: Optional[str], tag: Optional[str]) -> List[db_models.Flashcard]:
    query = db.query(db_models.Flashcard)
    if category:
        query = query.filter(db_models.Flashcard.category == category)
    if tag:
        query = query.filter(db_models.Flashcard.tags.contains([tag]))
    return query.offset(skip).limit(limit).all()

def get_flashcard(db: Session, flashcard_id: int) -> Optional[db_models.Flashcard]:
    return db.query(db_models.Flashcard).filter(db_models.Flashcard.id == flashcard_id).first()

def create_flashcard(db: Session, flashcard: schemas.FlashcardCreate) -> db_models.Flashcard:
    db_flashcard = db_models.Flashcard(**flashcard.dict())
    db.add(db_flashcard)
    db.commit()
    db.refresh(db_flashcard)
    return db_flashcard

def import_flashcards_from_json(db: Session, flashcards: List[schemas.FlashcardCreate]):
    db_flashcards = [db_models.Flashcard(**f.dict()) for f in flashcards]
    db.add_all(db_flashcards)
    db.commit()
    return {"message": f"{len(db_flashcards)} flashcards imported successfully"}


#
# Document & Text Extraction Services
#

def create_document(db: Session, name: str, content: str) -> db_models.Document:
    db_document = db_models.Document(name=name, content=content)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

async def extract_text_from_file(db: Session, file: UploadFile):
    file_ext = file.filename.split(".")[-1].lower()
    file_path = f"temp_{file.filename}"
    
    with open(file_path, "wb") as f:
        f.write(await file.read())

    text = file_utils.extract_text(file_path, file_ext)
    
    # Save document to DB and clean up file
    create_document(db, name=file.filename, content=text)
    file_utils.remove_temp_file(file_path)
    
    return {"filename": file.filename, "extracted_text": text}

#
# AI Quiz Generation Services
#

def _generate_questions_deepseek(content: str, question_count: int, types_str: str) -> dict:
    headers = {"Authorization": f"Bearer {config.DEEPSEEK_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": _get_quiz_prompt(content, question_count, types_str)}],
        "temperature": 0.6, "max_tokens": 4096, "top_p": 0.95
    }
    try:
        response = requests.post(config.DEEPSEEK_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        response_text = response.json()["choices"][0]["message"]["content"].strip()
        return _parse_ai_response(response_text)
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"API request failed: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

def _generate_questions_groq(content: str, question_count: int, types_str: str) -> dict:
    completion = groq_client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[{"role": "user", "content": _get_quiz_prompt(content, question_count, types_str)}],
        temperature=0.6, max_completion_tokens=4096, top_p=0.95, stream=False, stop=None
    )
    response_text = completion.choices[0].message.content.strip()
    return _parse_ai_response(response_text)

def _get_quiz_prompt(content: str, question_count: int, types_str: str) -> str:
    # Reusable prompt function
    return f"""
You are a Quiz Master...
1. Summarize the key points of the content.
2. Generate a quiz with exactly {question_count} questions of types: [{types_str}].
3. Format the output in **pure JSON**.
### Content:
{content}
### Expected JSON Format:
{{
  "summary": "Brief summary.",
  "quiz": [ {{ "question": "...", "type": "...", "options": [], "answer": "..." }} ]
}}
"""

def _parse_ai_response(response_text: str) -> dict:
    match = re.search(r"\{.*\}", response_text, re.DOTALL)
    if match:
        json_text = match.group(0)
        try:
            result = json.loads(json_text)
            if "quiz" not in result or not isinstance(result["quiz"], list):
                raise ValueError("Invalid quiz format in AI response")
            return result
        except json.JSONDecodeError:
            raise ValueError("Failed to parse AI-generated JSON.")
    raise ValueError("No valid JSON found in AI response.")

def generate_quiz(content: str, question_count: int, question_types: List[str], ai_provider: str = "groq") -> dict:
    types_str = ", ".join(f'"{t}"' for t in question_types)
    try:
        if ai_provider == "deepseek":
            return _generate_questions_deepseek(content, question_count, types_str)
        else: # Default to groq
            return _generate_questions_groq(content, question_count, types_str)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_quiz_from_flashcards_service(db: Session, request: schemas.QuizRequest) -> dict:
    query = db.query(db_models.Flashcard)
    if request.category:
        query = query.filter(db_models.Flashcard.category == request.category)
    
    flashcards = query.limit(request.count).all()
    if not flashcards:
        raise HTTPException(status_code=404, detail="No flashcards found for the given criteria.")
        
    # Combine flashcards into a text block for the AI
    content = "\n\n".join([f"Q: {f.question}\nA: {f.answer}" for f in flashcards])
    
    return generate_quiz(content, len(flashcards), request.question_types)


#
# Payment and Stripe Services
#

def get_user_active_payment(db: Session, user_id: int) -> Optional[db_models.Payment]:
    return db.query(db_models.Payment).filter(
        db_models.Payment.user_id == user_id,
        db_models.Payment.status == "succeeded",
        db_models.Payment.expires_at > datetime.utcnow()
    ).first()

def create_payment(db: Session, user_id: int, stripe_id: str, amount: int, status: str, expires_at: datetime):
    payment = db_models.Payment(
        user_id=user_id,
        stripe_payment_intent_id=stripe_id,
        amount=amount,
        status=status,
        created_at=datetime.utcnow(),
        expires_at=expires_at
    )
    db.add(payment)
    db.commit()

def create_stripe_checkout_session(user: db_models.User, db: Session):
    # Check if user already has an active subscription
    if get_user_active_payment(db, user.id):
        raise HTTPException(status_code=400, detail="User already has an active subscription.")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': 'Premium Membership'},
                    'unit_amount': 1000, # $10.00
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='http://localhost:3000/dashboard?payment_success=true',
            cancel_url='http://localhost:3000/dashboard?payment_canceled=true',
            customer_email=user.email,
            metadata={'user_id': user.id}
        )
        return {"sessionId": checkout_session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#
# Webhook Services
#

async def handle_clerk_webhook(request: Request, db: Session):
    headers = request.headers
    payload = await request.body()
    
    # Verify webhook signature
    try:
        svix_id = headers.get("svix-id")
        svix_timestamp = headers.get("svix-timestamp")
        svix_signature = headers.get("svix-signature")
        if not svix_id or not svix_timestamp or not svix_signature:
            raise HTTPException(status_code=400, detail="Missing Svix headers")
        
        from svix.webhooks import Webhook
        wh = Webhook(config.CLERK_WEBHOOK_SECRET)
        evt = wh.verify(payload, headers)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    event_type = evt['type']
    user_data = evt['data']
    
    if event_type == 'user.created':
        get_or_create_user(db, user_data)
    elif event_type == 'user.updated':
        update_user(db, user_data['id'], {
            "email": next((e["email_address"] for e in user_data.get("email_addresses", [])), None),
            "first_name": user_data.get("first_name"),
            "last_name": user_data.get("last_name"),
            "image_url": user_data.get("image_url"),
        })
    # Add more event types as needed (e.g., user.deleted)
    
    return {"status": "success"}


async def handle_stripe_webhook(request: Request, db: Session):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, config.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload: {e}")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Invalid signature: {e}")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        
        if user_id:
            # Payment successful, grant access
            expires_at = datetime.utcnow() + timedelta(days=30)
            create_payment(
                db=db,
                user_id=int(user_id),
                stripe_id=session.get('payment_intent'),
                amount=session.get('amount_total'),
                status='succeeded',
                expires_at=expires_at
            )
            
    # Add more event types as needed
    
    return {"status": "success"} 