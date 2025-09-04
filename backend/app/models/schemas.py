from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Pydantic models for Chapters
class ChapterBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: Optional[int] = None

class ChapterCreate(ChapterBase):
    pass

class Chapter(ChapterBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# Pydantic models for Flashcards
class FlashcardBase(BaseModel):
    question: str
    answer: str
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    chapter_id: Optional[int] = None

class FlashcardCreate(FlashcardBase):
    pass

class Flashcard(FlashcardBase):
    id: int
    chapter: Optional[Chapter] = None
    
    class Config:
        orm_mode = True

class FlashcardsImport(BaseModel):
    flashcards: List[FlashcardCreate]

# Pydantic models for Quizzes
class QuizRequest(BaseModel):
    category: Optional[str] = None
    count: int = 10
    question_types: List[str] = ["multiple_choice", "true_false"]

# Pydantic models for Users
class UserBase(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    image_url: Optional[str] = None

class UserCreate(UserBase):
    clerk_id: str

class UserResponse(UserBase):
    id: int
    clerk_id: str
    last_sign_in: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    member_tier: str = ""
    has_active_payment: bool = False
    expires_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        
    @classmethod
    def from_orm(cls, obj, payment_obj=None):
        dict_obj = {col.name: getattr(obj, col.name) for col in obj.__table__.columns}
        
        if dict_obj.get('created_at'):
            dict_obj['created_at'] = dict_obj['created_at'].isoformat()
        if dict_obj.get('updated_at'):
            dict_obj['updated_at'] = dict_obj['updated_at'].isoformat()
        if dict_obj.get('last_sign_in'):
            dict_obj['last_sign_in'] = dict_obj['last_sign_in'].isoformat()

        print("0000000000000")
        if payment_obj:
            print(payment_obj.tier)
            print(payment_obj.amount)
            print(payment_obj.status)
            dict_obj['member_tier'] = payment_obj.tier
            dict_obj['has_active_payment'] = True
            dict_obj['expires_at'] = payment_obj.expires_at.isoformat()
            
        return cls(**dict_obj)

class UserStatus(BaseModel):
    has_active_payment: bool

class UserInfoResponse(BaseModel):
    user_data: UserResponse
    user_status: UserStatus

# Pydantic models for Webhooks
class ClerkWebhookPayload(BaseModel):
    data: dict = Field(...)
    object: str
    type: str

class PaymentRequest(BaseModel):
    token: str
    amount: int 