"""
Additional database models for tracking user progress and quiz attempts.
Add these to your existing models.py or create a migration.
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

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
    flashcard_id = Column(Integer, ForeignKey("flashcards.id"), nullable=False)
    
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
    
    # Ensure one session per user per day
    __table_args__ = (
        # You can add a unique constraint on user_id + date if needed
    )