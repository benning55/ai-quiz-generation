from sqlalchemy import Column, Integer, String, Text, ARRAY, JSON, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .db import Base  # Import Base from db.py to link models to the database

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    image_url = Column(String(512), nullable=True)
    last_sign_in = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    flashcards = relationship("Flashcard", back_populates="user")
    quizzes = relationship("Quiz", back_populates="user")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    tags = Column(ARRAY(String), nullable=True)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="flashcards")
    
    # Relationship to quizzes
    quiz_questions = relationship("QuizQuestion", back_populates="flashcard")

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="quizzes")
    
    # Relationship to questions
    questions = relationship("QuizQuestion", back_populates="quiz")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    flashcard_id = Column(Integer, ForeignKey("flashcards.id"))
    question_text = Column(Text, nullable=False)  # May differ from original flashcard question
    question_type = Column(String(50), nullable=False)  # multiple_choice, true_false, short_answer
    options = Column(JSON, nullable=True)  # For multiple-choice questions
    correct_answer = Column(Text, nullable=False)
    
    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
    flashcard = relationship("Flashcard", back_populates="quiz_questions")
