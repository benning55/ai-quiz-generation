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

#
# Quiz Generation Endpoint
#
@router.post("/generate-quiz-from-flashcards")
@router.post("/generate-quiz-from-flashcards/")
async def generate_quiz_from_flashcards_endpoint(request: schemas.QuizRequest, db: Session = Depends(get_db)):
    quiz_data = await service.generate_quiz_from_flashcards_service(db, request)
    return {"quiz": quiz_data}

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