import os
import json
import re
import random
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
import stripe
import requests
import hmac
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import Depends, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session
from groq import Groq

from ..db.database import get_db
from .. import db
from ..db import models as db_models
from ..models import schemas
from ..utils.config import FRONTEND_URL
from ..utils import config, file_utils

# Initialize clients
stripe.api_key = config.STRIPE_SECRET_KEY
# Initialize AI service
from .ai_service import ai_generator

security = HTTPBearer(auto_error=False)

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

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
    request: Request = None
):
    print("==== Authentication Debug ====")
    
    # Check for token in Authorization header
    token = None
    if credentials:
        token = credentials.credentials
        print("Token found in Authorization header")
    
    # If no token in header, check for Clerk session cookie
    if not token and request:
        cookies = request.cookies
        session_cookie = cookies.get("__session")
        if session_cookie:
            token = session_cookie
            print("Token found in Clerk session cookie")
    
    if not token:
        print("No authentication token found")
        return None
    
    try:
        # Decode and verify the JWT token
        try:
            decoded_token = jwt.decode(
                token,
                options={"verify_signature": False}  # In production, should verify with Clerk's public key
            )
            
            # Print token details for debugging
            print(f"Decoded token: {decoded_token}")
            
            # Extract the clerk_id from the token
            clerk_id = decoded_token.get("sub")
            print(f"Extracted clerk_id: {clerk_id}")
            
            if not clerk_id:
                print("No clerk_id found in token")
                return None
            
            # Find user in database
            user = db.query(db_models.User).filter(db_models.User.clerk_id == clerk_id).first()
            print(f"Found user in DB: {user is not None}")
            
            # If user doesn't exist yet, create one (auto-registration)
            if not user:
                print("Creating new user in database")
                user = db_models.User(
                    clerk_id=clerk_id,
                    email=decoded_token.get("email"),
                    first_name=decoded_token.get("given_name", ""),
                    last_name=decoded_token.get("family_name", "")
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"New user created with ID: {user.id}")
            else:
                print(f"Existing user found with ID: {user.id}")
            
            return user
        except jwt.DecodeError as e:
            print(f"JWT decode error: {str(e)}")
            print(f"Token format issue, trying to handle as plain token: {token[:20]}...")
            # Maybe it's not a JWT format, try using the token as clerk_id directly
            user = db.query(db_models.User).filter(db_models.User.clerk_id == token).first()
            if user:
                print(f"Found user with token as clerk_id: {user.id}")
                return user
            return None
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return None


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

def update_flashcard(db: Session, flashcard_id: int, flashcard: schemas.FlashcardCreate) -> Optional[db_models.Flashcard]:
    db_flashcard = db.query(db_models.Flashcard).filter(db_models.Flashcard.id == flashcard_id).first()
    if db_flashcard:
        for key, value in flashcard.dict().items():
            setattr(db_flashcard, key, value)
        db.commit()
        db.refresh(db_flashcard)
    return db_flashcard

def delete_flashcard(db: Session, flashcard_id: int) -> bool:
    db_flashcard = db.query(db_models.Flashcard).filter(db_models.Flashcard.id == flashcard_id).first()
    if db_flashcard:
        db.delete(db_flashcard)
        db.commit()
        return True
    return False

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

# Legacy AI functions removed - now using enhanced ai_service module

async def generate_quiz(content: str, question_count: int, question_types: List[str], ai_provider: str = "groq") -> dict:
    """Enhanced quiz generation with better error handling and consistency"""
    from .ai_service import generate_quiz as ai_generate_quiz
    return await ai_generate_quiz(content, question_count, question_types, ai_provider)

async def generate_quiz_from_flashcards_service(db: Session, request: schemas.QuizRequest, chapter_id: int = None) -> dict:
    """
    Generate quiz from flashcards with smart distribution:
    
    User Tiers:
    - Guest (not logged in): 3 questions
    - Free user (logged in): 5 questions
    - Premium user: 20 questions
    
    Distribution Logic:
    - Chapter-specific: Random selection from that chapter (respecting tier limit)
    - Mixed test (Premium/20Q): 2 questions per chapter, balanced across all 10 chapters
    - Mixed test (Free/Guest): Random selection from all chapters (respecting tier limit)
    """
    from .chapter_service import get_all_chapters
    
    requested_count = request.count
    max_questions = min(requested_count, 20)  # Cap at 20 questions max
    is_premium_test = requested_count >= 20  # Premium users request 20 questions
    
    # Case 1: Specific chapter selected (Premium users only)
    if chapter_id:
        flashcards = db.query(db_models.Flashcard).filter(
            db_models.Flashcard.chapter_id == chapter_id
        ).all()
        
        if not flashcards:
            raise HTTPException(
                status_code=404, 
                detail=f"No flashcards found for chapter ID {chapter_id}. This chapter may not have content yet."
            )
        
        # Randomly select up to requested count from this chapter
        selected_flashcards = random.sample(flashcards, min(len(flashcards), max_questions))
    
    # Case 2: Mixed test with premium distribution (20 questions)
    elif is_premium_test:
        all_chapters = get_all_chapters(db)
        selected_flashcards = []
        questions_per_chapter = 2  # Target 2 questions per chapter for premium
        
        # First pass: Try to get 2 questions from each chapter
        for chapter in all_chapters:
            chapter_flashcards = db.query(db_models.Flashcard).filter(
                db_models.Flashcard.chapter_id == chapter.id
            ).all()
            
            if chapter_flashcards:
                # Take up to 2 random questions from this chapter
                num_to_take = min(len(chapter_flashcards), questions_per_chapter)
                selected_from_chapter = random.sample(chapter_flashcards, num_to_take)
                selected_flashcards.extend(selected_from_chapter)
        
        # If we have fewer than 20, fill the rest randomly from all flashcards
        if len(selected_flashcards) < max_questions:
            # Get all flashcards not already selected
            selected_ids = {f.id for f in selected_flashcards}
            remaining_flashcards = db.query(db_models.Flashcard).filter(
                db_models.Flashcard.chapter_id.isnot(None),
                ~db_models.Flashcard.id.in_(selected_ids)
            ).all()
            
            if remaining_flashcards:
                needed = max_questions - len(selected_flashcards)
                additional = random.sample(remaining_flashcards, min(len(remaining_flashcards), needed))
                selected_flashcards.extend(additional)
        
        # If we have more than 20 (shouldn't happen with 2 per chapter and 10 chapters)
        # trim down to exactly 20
        if len(selected_flashcards) > max_questions:
            selected_flashcards = random.sample(selected_flashcards, max_questions)
        
        # Check if we have any flashcards at all
        if not selected_flashcards:
            raise HTTPException(
                status_code=404, 
                detail="No flashcards found with assigned chapters. Please assign flashcards to chapters first."
            )
    
    # Case 3: Mixed test for free/guest users (3 or 5 questions)
    else:
        # Just get random flashcards from all chapters
        all_flashcards = db.query(db_models.Flashcard).filter(
            db_models.Flashcard.chapter_id.isnot(None)
        ).all()
        
        if not all_flashcards:
            raise HTTPException(
                status_code=404, 
                detail="No flashcards found with assigned chapters. Please assign flashcards to chapters first."
            )
        
        # Randomly select the requested number of questions
        selected_flashcards = random.sample(all_flashcards, min(len(all_flashcards), max_questions))
    
    # Shuffle the final selection for randomness
    random.shuffle(selected_flashcards)
    
    # Combine selected flashcards into a text block for the AI
    content = "\n\n".join([f"Q: {f.question}\nA: {f.answer}" for f in selected_flashcards])
    
    # Generate exactly the number of questions we have flashcards for
    return await generate_quiz(content, len(selected_flashcards), request.question_types)


#
# Payment and Stripe Services
#

def get_user_active_payment(db: Session, user_id: int) -> Optional[db_models.Payment]:
    return db.query(db_models.Payment).filter(
        db_models.Payment.user_id == user_id,
        db_models.Payment.status == "succeeded",
        db_models.Payment.expires_at > datetime.utcnow()
    ).first()

def create_payment(db: Session, user_id: int, stripe_id: str, amount: int, tier: str, status: str, expires_at: datetime):
    payment = db_models.Payment(
        user_id=user_id,
        stripe_payment_intent_id=stripe_id,
        tier=tier,
        amount=amount,
        status=status,
        created_at=datetime.utcnow(),
        expires_at=expires_at
    )
    db.add(payment)
    db.commit()

def create_stripe_checkout_session(user: db_models.User, db: Session, tier: str = "1month", request=None):
    # Check if user already has an active subscription
    if get_user_active_payment(db, user.id):
        raise HTTPException(status_code=400, detail="User already has an active subscription.")

    # Define pricing tiers
    pricing_tiers = {
        "7days": {
            "amount": 2900,  # $29.00 CAD in cents
            "currency": "cad",
            "name": "7-Day Premium Access",
            "duration_days": 7
        },
        "1month": {
            "amount": 3900,  # $39.00 CAD in cents
            "currency": "cad", 
            "name": "1-Month Premium Access",
            "duration_days": 30
        }
    }
    
    if tier not in pricing_tiers:
        raise HTTPException(status_code=400, detail="Invalid pricing tier")
    
    tier_config = pricing_tiers[tier]

    print(tier_config)

    # Build dynamic URLs based on request or environment
    if request:
        # Use the request's host information
        scheme = request.url.scheme
        host = request.headers.get('host', 'localhost')
        base_url = f"{scheme}://{host}"
    else:
        # Fallback to environment variable
        base_url = FRONTEND_URL

    success_url = f"{base_url}/thank-you?payment_success=true&tier={tier}&days={tier_config['duration_days']}"
    cancel_url = f"{base_url}/thank-you?payment_canceled=true"

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': tier_config['currency'],
                    'product_data': {'name': tier_config['name']},
                    'unit_amount': tier_config['amount'],
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=user.email,
            metadata={
                'user_id': user.id,
                'tier': tier,
                'duration_days': str(tier_config['duration_days'])
            },
            # Disable Stripe Link - card payment only
            payment_intent_data={
                'setup_future_usage': None,  # Don't save payment method
            },
            # Optional: Add billing address collection for better fraud protection
            billing_address_collection='required'
        )
        print("====")
        print(checkout_session)
        return {"sessionUrl": checkout_session.url}
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
        tier = session.get('metadata', {}).get('tier', '1month')
        duration_days = int(session.get('metadata', {}).get('duration_days', '30'))
        
        if user_id:
            # Payment successful, grant access
            expires_at = datetime.utcnow() + timedelta(days=duration_days)
            create_payment(
                db=db,
                user_id=int(user_id),
                stripe_id=session.get('payment_intent'),
                amount=session.get('amount_total'),
                tier=tier,
                status='succeeded',
                expires_at=expires_at
            )
            
    # Add more event types as needed
    
    return {"status": "success"} 