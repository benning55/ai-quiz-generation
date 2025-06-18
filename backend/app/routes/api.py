from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Request, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models import schemas
from ..services import service
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
    quiz_result = service.generate_quiz(extraction_result["extracted_text"], 10, ["multiple_choice", "true_false"])
    
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

@router.post("/import-flashcards-json")
@router.post("/import-flashcards-json/")
async def import_flashcards_endpoint(data: schemas.FlashcardsImport, db: Session = Depends(get_db)):
    return service.import_flashcards_from_json(db, data.flashcards)

#
# User and Authentication Endpoints
#
@router.get("/user")
@router.get("/user/")
async def get_current_user_info(current_user: db_models.User = Depends(service.get_current_user), db: Session = Depends(get_db)):
    active_payment = service.get_user_active_payment(db, current_user.id)
    user_status = schemas.UserStatus(has_active_payment=bool(active_payment))
    
    return schemas.UserInfoResponse(
        user_data=schemas.UserResponse.from_orm(current_user),
        user_status=user_status
    )

#
# Quiz Generation Endpoint
#
@router.post("/generate-quiz-from-flashcards")
@router.post("/generate-quiz-from-flashcards/")
async def generate_quiz_from_flashcards_endpoint(request: schemas.QuizRequest, db: Session = Depends(get_db)):
    quiz_data = service.generate_quiz_from_flashcards_service(db, request)
    return {"quiz": quiz_data}

#
# Payment Endpoints
#
@router.post("/create-checkout-session")
@router.post("/create-checkout-session/")
async def create_checkout_session_endpoint(current_user: db_models.User = Depends(service.get_current_user), db: Session = Depends(get_db)):
    return service.create_stripe_checkout_session(current_user, db)

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