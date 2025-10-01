from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Request, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models import schemas
from ..services import service
from ..services import chapter_service
from ..db import models as db_models

router = APIRouter()

#
# Health Check Endpoint
#
@router.get("/health")
async def health_check():
    return {"status": "healthy"}

#
# Text Extraction Endpoint
#
@router.post("/extract-text")
@router.post("/extract-text/")
async def extract_text_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # This endpoint now handles file upload and calls the service for extraction and quiz generation.
    extraction_result = await service.extract_text_from_file(db, file)
    quiz_result = await service.generate_quiz(extraction_result["extracted_text"], 10, ["multiple_choice", "true_false"])
    
    return {
        "filename": extraction_result["filename"],
        "extracted_text": extraction_result["extracted_text"],
        "quiz": quiz_result
    }

#
# Flashcard Endpoints
#
@router.get("/flashcards/", response_model=List[schemas.Flashcard])
def get_flashcards_endpoint(skip: int = 0, limit: int = 100, category: Optional[str] = None, tag: Optional[str] = None, db: Session = Depends(get_db)):
    flashcards = service.get_flashcards(db, skip, limit, category, tag)
    return flashcards

@router.get("/flashcards/{flashcard_id}", response_model=schemas.Flashcard)
def get_flashcard_endpoint(flashcard_id: int, db: Session = Depends(get_db)):
    flashcard = service.get_flashcard(db, flashcard_id)
    if flashcard is None:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return flashcard

@router.post("/flashcards/")
def create_flashcard_endpoint(flashcard: schemas.FlashcardCreate, db: Session = Depends(get_db)):
    return service.create_flashcard(db, flashcard)

@router.put("/flashcards/{flashcard_id}")
def update_flashcard_endpoint(flashcard_id: int, flashcard: schemas.FlashcardCreate, db: Session = Depends(get_db)):
    updated_flashcard = service.update_flashcard(db, flashcard_id, flashcard)
    if updated_flashcard is None:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return updated_flashcard

@router.delete("/flashcards/{flashcard_id}")
def delete_flashcard_endpoint(flashcard_id: int, db: Session = Depends(get_db)):
    success = service.delete_flashcard(db, flashcard_id)
    if not success:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return {"message": "Flashcard deleted successfully"}

@router.post("/import-flashcards-json")
@router.post("/import-flashcards-json/")
async def import_flashcards_endpoint(data: schemas.FlashcardsImport, db: Session = Depends(get_db)):
    return service.import_flashcards_from_json(db, data.flashcards)

#
# User and Authentication Endpoints
#
@router.post("/users")
@router.post("/users/")
async def create_user_endpoint(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = service.get_user_by_clerk_id(db, user_data.clerk_id)
    if existing_user:
        # Update existing user with latest data
        updated_user = service.update_user(db, user_data.clerk_id, {
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "image_url": user_data.image_url,
        })
        active_payment = service.get_user_active_payment(db, updated_user.id)
        return schemas.UserResponse.from_orm(updated_user, active_payment)
    
    # Create new user
    new_user = service.create_user(db, user_data)
    return schemas.UserResponse.from_orm(new_user)

@router.get("/user")
@router.get("/user/")
async def get_current_user_info(current_user: db_models.User = Depends(service.get_current_user), db: Session = Depends(get_db)):
    existing_user = service.get_user_by_clerk_id(db, current_user.clerk_id)
    print(existing_user.email)
    active_payment = service.get_user_active_payment(db, current_user.id)
    return schemas.UserResponse.from_orm(existing_user, active_payment)

@router.get("/user/stats")
async def get_user_stats(current_user: db_models.User = Depends(service.get_current_user), db: Session = Depends(get_db)):
    """Get user quiz statistics from database"""
    try:
        from ..services.progress_service import get_user_stats
        stats = get_user_stats(db, current_user.id)
        return stats
    except Exception as e:
        # Fallback to mock data if progress tracking not yet implemented
        return {
            "total_quizzes": 0,
            "average_score": 0,
            "best_score": 0,
            "total_questions": 0,
            "correct_answers": 0,
            "study_streak": 0,
            "favorite_chapter": "Not available"
        }

# Progress Tracking Endpoints
@router.get("/quiz/can-start")
async def check_quiz_limits(
    current_user: db_models.User = Depends(service.get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user can start a new quiz based on their tier and test limits"""
    try:
        from ..services.progress_service import can_user_start_quiz
        
        # Get user's active payment to determine tier
        active_payment = service.get_user_active_payment(db, current_user.id)
        
        if not active_payment:
            # Free user - no tier-based limits (uses freeTestGate instead)
            return {
                "can_start": True,
                "tier": "free",
                "message": "Free access",
                "completed_tests": 0,
                "test_limit": 0,
                "remaining_tests": 0
            }
        
        # Check limits based on tier
        can_start, message, completed, limit = can_user_start_quiz(
            db, 
            current_user.id, 
            active_payment.tier,
            active_payment.created_at
        )
        
        return {
            "can_start": can_start,
            "tier": active_payment.tier,
            "message": message,
            "completed_tests": completed,
            "test_limit": limit,
            "remaining_tests": max(0, limit - completed) if limit > 0 else 0
        }
    except Exception as e:
        return {
            "can_start": True,
            "tier": "unknown",
            "message": f"Error checking limits: {str(e)}",
            "completed_tests": 0,
            "test_limit": 0,
            "remaining_tests": 0
        }

@router.post("/quiz/start")
async def start_quiz_tracking(
    quiz_type: str = "practice",
    chapter_id: int = None,
    current_user: db_models.User = Depends(service.get_current_user), 
    db: Session = Depends(get_db)
):
    """Start a new quiz attempt for progress tracking with limit checking"""
    try:
        from ..services.progress_service import start_quiz, can_user_start_quiz
        
        # Get user's active payment to check tier limits
        active_payment = service.get_user_active_payment(db, current_user.id)
        
        if active_payment:
            # Check if user can start a quiz based on tier limits
            can_start, message, completed, limit = can_user_start_quiz(
                db,
                current_user.id,
                active_payment.tier,
                active_payment.created_at
            )
            
            if not can_start:
                return {
                    "quiz_attempt_id": None,
                    "message": message,
                    "limit_reached": True,
                    "completed_tests": completed,
                    "test_limit": limit
                }
        
        # User can start quiz
        attempt_id = start_quiz(db, current_user.id, quiz_type, chapter_id)
        
        # Return with limit info if applicable
        if active_payment and limit > 0:
            return {
                "quiz_attempt_id": attempt_id,
                "message": message,
                "limit_reached": False,
                "completed_tests": completed + 1,  # +1 because we just started one
                "test_limit": limit
            }
        
        return {"quiz_attempt_id": attempt_id, "message": "Quiz started successfully"}
    except Exception as e:
        return {"quiz_attempt_id": None, "message": f"Failed to start quiz tracking: {str(e)}"}

@router.post("/quiz/{quiz_attempt_id}/answer")
async def record_quiz_answer(
    quiz_attempt_id: int,
    answer_data: dict,  # Should contain: flashcard_id, question_text, question_type, correct_answer, user_answer, is_correct
    current_user: db_models.User = Depends(service.get_current_user),
    db: Session = Depends(get_db)
):
    """Record a question answer during a quiz"""
    try:
        from ..services.progress_service import record_answer
        record_answer(
            db=db,
            quiz_attempt_id=quiz_attempt_id,
            flashcard_id=answer_data.get("flashcard_id"),
            question_text=answer_data.get("question_text", ""),
            question_type=answer_data.get("question_type", "multiple_choice"),
            correct_answer=answer_data.get("correct_answer", ""),
            user_answer=answer_data.get("user_answer", ""),
            is_correct=answer_data.get("is_correct", False),
            time_taken=answer_data.get("time_taken")
        )
        return {"message": "Answer recorded successfully"}
    except Exception as e:
        return {"message": f"Failed to record answer: {str(e)}"}

@router.post("/quiz/{quiz_attempt_id}/complete")
async def complete_quiz_tracking(
    quiz_attempt_id: int,
    completion_data: dict = {},  # Optional: total_time
    current_user: db_models.User = Depends(service.get_current_user),
    db: Session = Depends(get_db)
):
    """Complete a quiz attempt and update user statistics"""
    try:
        from ..services.progress_service import finish_quiz
        attempt = finish_quiz(db, quiz_attempt_id, completion_data.get("total_time"))
        return {
            "message": "Quiz completed successfully",
            "score": attempt.score_percentage if attempt else 0,
            "correct_answers": attempt.correct_answers if attempt else 0,
            "total_questions": attempt.total_questions if attempt else 0
        }
    except Exception as e:
        return {"message": f"Failed to complete quiz: {str(e)}"}

#
# Quiz Generation Endpoint
#
@router.post("/generate-quiz-from-flashcards")
@router.post("/generate-quiz-from-flashcards/")
async def generate_quiz_from_flashcards_endpoint(
    request: schemas.QuizRequest, 
    chapter_id: int = None,
    db: Session = Depends(get_db)
):
    quiz_data = await service.generate_quiz_from_flashcards_service(db, request, chapter_id)
    return {"quiz": quiz_data}

#
# User Management Endpoints (Admin)
#
@router.get("/users/")
def get_all_users_endpoint(db: Session = Depends(get_db)):
    """Get all users with payment information (admin only - add auth check in production)"""
    users = db.query(db_models.User).order_by(db_models.User.created_at.desc()).all()
    
    # Enrich each user with payment information using the same function as the rest of the system
    user_list = []
    for user in users:
        # Use the same get_user_active_payment function that the rest of the system uses
        active_payment = service.get_user_active_payment(db, user.id)
        
        # Build user data with payment info (same format as /api/user endpoint)
        user_data = {
            "id": user.id,
            "clerk_user_id": user.clerk_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": f"{user.first_name or ''} {user.last_name or ''}".strip() or "Unknown",
            "has_active_payment": bool(active_payment),
            "member_tier": active_payment.tier if active_payment else "free",
            "expires_at": active_payment.expires_at.isoformat() if active_payment else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        }
        user_list.append(user_data)
    
    return user_list

@router.put("/users/{user_id}")
def update_user_endpoint(
    user_id: int,
    update_data: dict,
    db: Session = Depends(get_db)
):
    """Update user payment status and tier (admin only - creates/updates Payment record)"""
    from datetime import datetime
    
    user = db.query(db_models.User).filter(db_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get payment data from update
    has_active_payment = update_data.get('has_active_payment', False)
    member_tier = update_data.get('member_tier', 'free')
    expires_at = update_data.get('expires_at')
    
    # Parse expires_at if it's a string
    if expires_at and isinstance(expires_at, str):
        try:
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        except:
            expires_at = None
    
    if has_active_payment and member_tier and expires_at:
        # Create or update payment record (the single source of truth)
        # Check if there's an existing active payment
        existing_payment = db.query(db_models.Payment).filter(
            db_models.Payment.user_id == user_id,
            db_models.Payment.status == 'succeeded'
        ).order_by(db_models.Payment.created_at.desc()).first()
        
        if existing_payment:
            # Update existing payment
            existing_payment.tier = member_tier
            existing_payment.expires_at = expires_at
            existing_payment.status = 'succeeded'
        else:
            # Create new payment record (admin manual entry)
            new_payment = db_models.Payment(
                user_id=user_id,
                stripe_payment_intent_id=f"admin_manual_{user_id}_{int(datetime.utcnow().timestamp())}",
                amount=0,  # Admin manual entry, no charge
                tier=member_tier,
                status='succeeded',
                created_at=datetime.utcnow(),
                expires_at=expires_at
            )
            db.add(new_payment)
    else:
        # If setting to inactive, expire all existing payments
        if not has_active_payment:
            active_payments = db.query(db_models.Payment).filter(
                db_models.Payment.user_id == user_id,
                db_models.Payment.status == 'succeeded'
            ).all()
            for payment in active_payments:
                payment.expires_at = datetime.utcnow()  # Set to expired
    
    db.commit()
    
    # Return user data in the same format as GET /users/
    active_payment = service.get_user_active_payment(db, user_id)
    return {
        "id": user.id,
        "clerk_user_id": user.clerk_id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": f"{user.first_name or ''} {user.last_name or ''}".strip() or "Unknown",
        "has_active_payment": bool(active_payment),
        "member_tier": active_payment.tier if active_payment else "free",
        "expires_at": active_payment.expires_at.isoformat() if active_payment else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }

#
# Payment Endpoints
#
@router.post("/create-checkout-session")
@router.post("/create-checkout-session/")
async def create_checkout_session_endpoint(
    request: Request,
    current_user: db_models.User = Depends(service.get_current_user), 
    db: Session = Depends(get_db)
):
    try:
        body = await request.json()
        tier = body.get("tier", "1month")
    except:
        tier = "1month"
    
    return service.create_stripe_checkout_session(current_user, db, tier, request)

#
# Chapter Endpoints
#
@router.get("/chapters/", response_model=List[schemas.Chapter])
def get_chapters_endpoint(db: Session = Depends(get_db)):
    """Get all Canadian citizenship test chapters"""
    chapters = chapter_service.get_all_chapters(db)
    return chapters

@router.get("/chapters/{chapter_id}", response_model=schemas.Chapter)
def get_chapter_endpoint(chapter_id: int, db: Session = Depends(get_db)):
    """Get a specific chapter by ID"""
    chapter = chapter_service.get_chapter_by_id(db, chapter_id)
    if chapter is None:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter

@router.get("/chapters/{chapter_id}/flashcards", response_model=List[schemas.Flashcard])
def get_chapter_flashcards_endpoint(
    chapter_id: int, 
    limit: int = Query(100, le=500), 
    db: Session = Depends(get_db)
):
    """Get flashcards for a specific chapter"""
    # Verify chapter exists
    chapter = chapter_service.get_chapter_by_id(db, chapter_id)
    if chapter is None:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    flashcards = chapter_service.get_flashcards_by_chapter(db, chapter_id, limit)
    return flashcards

@router.get("/chapters/stats")
def get_chapters_stats_endpoint(db: Session = Depends(get_db)):
    """Get statistics about chapters and their flashcards"""
    return chapter_service.get_chapter_stats(db)

@router.post("/flashcards/{flashcard_id}/assign-chapter")
def assign_flashcard_to_chapter_endpoint(
    flashcard_id: int, 
    chapter_title: str, 
    db: Session = Depends(get_db)
):
    """Assign a flashcard to a chapter"""
    success = chapter_service.assign_flashcard_to_chapter(db, flashcard_id, chapter_title)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to assign flashcard to chapter")
    return {"message": "Flashcard assigned to chapter successfully"}

#
# Webhook Endpoints
#
@router.post("/webhooks/clerk")
@router.post("/webhooks/clerk/")
async def clerk_webhook_endpoint(request: Request, db: Session = Depends(get_db)):
    return await service.handle_clerk_webhook(request, db)

@router.post("/webhooks/stripe")
@router.post("/webhooks/stripe/")
async def stripe_webhook_endpoint(request: Request, db: Session = Depends(get_db)):
    return await service.handle_stripe_webhook(request, db) 