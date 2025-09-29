from sqlalchemy import Column, Integer, String, Text, ARRAY, JSON, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from .database import Base  # Import Base from the new database.py

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

class Chapter(Base):
    __tablename__ = "chapters"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, nullable=True)  # For ordering chapters
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # User relationship (optional - chapters can be global or user-specific)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User")
    
    # Relationship to flashcards
    flashcards = relationship("Flashcard", back_populates="chapter")

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
    
    # Chapter relationship (optional)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    chapter = relationship("Chapter", back_populates="flashcards")
    
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

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    stripe_payment_intent_id = Column(String)
    amount = Column(Integer)  # in cents
    tier = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

class QuizAttempt(Base):
    """Tracks each time a user takes a quiz"""
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_type = Column(String(50), nullable=False)  # 'practice', 'chapter_specific', etc.
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)  # If chapter-specific
    
    # Quiz details
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    score_percentage = Column(Float, nullable=False)  # Calculated score (0-100)
    time_taken_seconds = Column(Integer, nullable=True)  # Time to complete
    
    # Metadata
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    is_completed = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User")
    chapter = relationship("Chapter")
    question_attempts = relationship("QuestionAttempt", back_populates="quiz_attempt")

class QuestionAttempt(Base):
    """Tracks individual question answers within a quiz attempt"""
    __tablename__ = "question_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"), nullable=False)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id"), nullable=True)
    
    # Question details
    question_text = Column(Text, nullable=False)  # Snapshot of question at time of attempt
    question_type = Column(String(50), nullable=False)  # multiple_choice, true_false, etc.
    correct_answer = Column(Text, nullable=False)  # Correct answer
    user_answer = Column(Text, nullable=True)  # User's answer
    is_correct = Column(Boolean, nullable=False)
    
    # Timing
    time_taken_seconds = Column(Integer, nullable=True)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quiz_attempt = relationship("QuizAttempt", back_populates="question_attempts")
    flashcard = relationship("Flashcard")

class UserProgress(Base):
    """Aggregated user progress statistics (updated periodically)"""
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Overall statistics
    total_quiz_attempts = Column(Integer, default=0)
    total_questions_answered = Column(Integer, default=0)
    total_correct_answers = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    best_score = Column(Float, default=0.0)
    
    # Study streak
    current_study_streak = Column(Integer, default=0)
    longest_study_streak = Column(Integer, default=0)
    last_study_date = Column(DateTime(timezone=True), nullable=True)
    
    # Chapter progress (JSON field with chapter_id: stats)
    chapter_progress = Column(Text, nullable=True)  # JSON string
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relationships
    user = relationship("User")

class StudySession(Base):
    """Tracks study sessions for streak calculation"""
    __tablename__ = "study_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    session_date = Column(DateTime(timezone=True), server_default=func.now())
    quiz_attempts_count = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    total_correct = Column(Integer, default=0)
    session_duration_seconds = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User")