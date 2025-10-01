"""
Progress tracking service for user quiz statistics and progress.
This will replace the mock data with real database-driven statistics.
"""

import json
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

# Import models from main models file
from ..db import models as db_models

class ProgressService:
    
    @staticmethod
    def start_quiz_attempt(
        db: Session, 
        user_id: int, 
        quiz_type: str = "practice", 
        chapter_id: Optional[int] = None
    ) -> int:
        """
        Start a new quiz attempt and return the attempt ID.
        Call this when a user starts a quiz.
        """
        attempt = db_models.QuizAttempt(
            user_id=user_id,
            quiz_type=quiz_type,
            chapter_id=chapter_id,
            total_questions=0,  # Will be updated as questions are answered
            correct_answers=0,
            score_percentage=0.0,
            is_completed=False
        )
        
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        
        # Update or create today's study session
        ProgressService._update_study_session(db, user_id)
        
        return attempt.id
    
    @staticmethod
    def record_question_attempt(
        db: Session,
        quiz_attempt_id: int,
        flashcard_id: int,
        question_text: str,
        question_type: str,
        correct_answer: str,
        user_answer: str,
        is_correct: bool,
        time_taken_seconds: Optional[int] = None
    ):
        """
        Record a single question attempt within a quiz.
        Call this for each question the user answers.
        """
        question_attempt = db_models.QuestionAttempt(
            quiz_attempt_id=quiz_attempt_id,
            flashcard_id=flashcard_id,
            question_text=question_text,
            question_type=question_type,
            correct_answer=correct_answer,
            user_answer=user_answer,
            is_correct=is_correct,
            time_taken_seconds=time_taken_seconds
        )
        
        db.add(question_attempt)
        db.commit()
    
    @staticmethod
    def complete_quiz_attempt(
        db: Session,
        quiz_attempt_id: int,
        total_time_seconds: Optional[int] = None
    ):
        """
        Mark a quiz attempt as completed and calculate final statistics.
        Call this when the user finishes a quiz.
        """
        # Get the quiz attempt
        attempt = db.query(db_models.QuizAttempt).filter(
            db_models.QuizAttempt.id == quiz_attempt_id
        ).first()
        
        if not attempt:
            return
        
        # Calculate statistics from question attempts
        question_attempts = db.query(db_models.QuestionAttempt).filter(
            db_models.QuestionAttempt.quiz_attempt_id == quiz_attempt_id
        ).all()
        
        total_questions = len(question_attempts)
        correct_answers = sum(1 for qa in question_attempts if qa.is_correct)
        score_percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        
        # Update quiz attempt
        attempt.total_questions = total_questions
        attempt.correct_answers = correct_answers
        attempt.score_percentage = score_percentage
        attempt.time_taken_seconds = total_time_seconds
        attempt.completed_at = datetime.now(timezone.utc)
        attempt.is_completed = True
        
        db.commit()
        
        # Update user's overall progress
        ProgressService._update_user_progress(db, attempt.user_id)
        
        return attempt
    
    @staticmethod
    def get_user_statistics(db: Session, user_id: int) -> Dict:
        """
        Get comprehensive user statistics for the account page.
        This replaces the mock data with real database statistics.
        """
        # Get or create user progress record
        user_progress = db.query(db_models.UserProgress).filter(
            db_models.UserProgress.user_id == user_id
        ).first()
        
        if not user_progress:
            # Create initial progress record
            user_progress = db_models.UserProgress(user_id=user_id)
            db.add(user_progress)
            db.commit()
            db.refresh(user_progress)
        
        # Get recent quiz attempts for additional stats
        recent_attempts = db.query(db_models.QuizAttempt).filter(
            db_models.QuizAttempt.user_id == user_id,
            db_models.QuizAttempt.is_completed == True
        ).order_by(desc(db_models.QuizAttempt.completed_at)).limit(10).all()
        
        # Get favorite chapter (most attempted)
        favorite_chapter = db.query(
            db_models.Chapter.title,
            func.count(db_models.QuizAttempt.id).label('attempt_count')
        ).join(
            db_models.QuizAttempt, 
            db_models.Chapter.id == db_models.QuizAttempt.chapter_id
        ).filter(
            db_models.QuizAttempt.user_id == user_id,
            db_models.QuizAttempt.is_completed == True
        ).group_by(
            db_models.Chapter.title
        ).order_by(
            desc('attempt_count')
        ).first()
        
        return {
            "total_quizzes": user_progress.total_quiz_attempts,
            "average_score": round(user_progress.average_score, 1),
            "best_score": round(user_progress.best_score, 1),
            "total_questions": user_progress.total_questions_answered,
            "correct_answers": user_progress.total_correct_answers,
            "study_streak": user_progress.current_study_streak,
            "favorite_chapter": favorite_chapter.title if favorite_chapter else "Not available",
            "recent_attempts": len(recent_attempts),
            "last_study_date": user_progress.last_study_date.isoformat() if user_progress.last_study_date else None
        }
    
    @staticmethod
    def get_chapter_progress(db: Session, user_id: int) -> Dict:
        """Get user's progress breakdown by chapter"""
        chapter_stats = db.query(
            db_models.Chapter.title,
            db_models.Chapter.id,
            func.count(db_models.QuizAttempt.id).label('attempts'),
            func.avg(db_models.QuizAttempt.score_percentage).label('avg_score'),
            func.max(db_models.QuizAttempt.score_percentage).label('best_score')
        ).join(
            db_models.QuizAttempt,
            db_models.Chapter.id == db_models.QuizAttempt.chapter_id
        ).filter(
            db_models.QuizAttempt.user_id == user_id,
            db_models.QuizAttempt.is_completed == True
        ).group_by(
            db_models.Chapter.id,
            db_models.Chapter.title
        ).all()
        
        return {
            stat.title: {
                "attempts": stat.attempts,
                "average_score": round(stat.avg_score, 1) if stat.avg_score else 0,
                "best_score": round(stat.best_score, 1) if stat.best_score else 0
            }
            for stat in chapter_stats
        }
    
    @staticmethod
    def _update_user_progress(db: Session, user_id: int):
        """Update the user's overall progress statistics"""
        # Get or create progress record
        progress = db.query(db_models.UserProgress).filter(
            db_models.UserProgress.user_id == user_id
        ).first()
        
        if not progress:
            progress = db_models.UserProgress(user_id=user_id)
            db.add(progress)
        
        # Calculate statistics from quiz attempts
        stats = db.query(
            func.count(db_models.QuizAttempt.id).label('total_attempts'),
            func.sum(db_models.QuizAttempt.total_questions).label('total_questions'),
            func.sum(db_models.QuizAttempt.correct_answers).label('total_correct'),
            func.avg(db_models.QuizAttempt.score_percentage).label('avg_score'),
            func.max(db_models.QuizAttempt.score_percentage).label('best_score')
        ).filter(
            db_models.QuizAttempt.user_id == user_id,
            db_models.QuizAttempt.is_completed == True
        ).first()
        
        # Update progress record
        progress.total_quiz_attempts = stats.total_attempts or 0
        progress.total_questions_answered = stats.total_questions or 0
        progress.total_correct_answers = stats.total_correct or 0
        progress.average_score = stats.avg_score or 0.0
        progress.best_score = stats.best_score or 0.0
        
        # Update study streak
        progress.current_study_streak = ProgressService._calculate_study_streak(db, user_id)
        progress.last_study_date = datetime.now(timezone.utc)
        
        db.commit()
    
    @staticmethod
    def _update_study_session(db: Session, user_id: int):
        """Update or create today's study session"""
        today = datetime.now(timezone.utc).date()
        
        session = db.query(db_models.StudySession).filter(
            db_models.StudySession.user_id == user_id,
            func.date(db_models.StudySession.session_date) == today
        ).first()
        
        if not session:
            session = db_models.StudySession(
                user_id=user_id,
                session_date=datetime.now(timezone.utc),
                quiz_attempts_count=0,  # Initialize to 0
                total_questions=0,
                total_correct=0
            )
            db.add(session)
        
        # Ensure the field is not None before incrementing
        if session.quiz_attempts_count is None:
            session.quiz_attempts_count = 0
        
        session.quiz_attempts_count += 1
        db.commit()
    
    @staticmethod
    def _calculate_study_streak(db: Session, user_id: int) -> int:
        """Calculate the user's current study streak"""
        # Get study sessions ordered by date (most recent first)
        sessions = db.query(db_models.StudySession).filter(
            db_models.StudySession.user_id == user_id
        ).order_by(desc(db_models.StudySession.session_date)).all()
        
        if not sessions:
            return 0
        
        streak = 0
        current_date = datetime.now(timezone.utc).date()
        
        for session in sessions:
            session_date = session.session_date.date()
            
            # If this is today or yesterday (consecutive), continue streak
            if session_date == current_date or session_date == current_date - timedelta(days=1):
                streak += 1
                current_date = session_date - timedelta(days=1)  # Look for previous day next
            else:
                break  # Streak broken
        
        return streak

# Convenience functions for API endpoints
def start_quiz(db: Session, user_id: int, quiz_type: str = "practice", chapter_id: Optional[int] = None) -> int:
    """Start a new quiz attempt"""
    return ProgressService.start_quiz_attempt(db, user_id, quiz_type, chapter_id)

def record_answer(
    db: Session, 
    quiz_attempt_id: int, 
    flashcard_id: int,
    question_text: str,
    question_type: str, 
    correct_answer: str, 
    user_answer: str, 
    is_correct: bool,
    time_taken: Optional[int] = None
):
    """Record a question answer"""
    return ProgressService.record_question_attempt(
        db, quiz_attempt_id, flashcard_id, question_text, question_type,
        correct_answer, user_answer, is_correct, time_taken
    )

def finish_quiz(db: Session, quiz_attempt_id: int, total_time: Optional[int] = None):
    """Complete a quiz attempt"""
    return ProgressService.complete_quiz_attempt(db, quiz_attempt_id, total_time)

def get_user_stats(db: Session, user_id: int) -> Dict:
    """Get user statistics for account page"""
    return ProgressService.get_user_statistics(db, user_id)

def get_completed_quiz_count(db: Session, user_id: int, since_date: Optional[datetime] = None) -> int:
    """
    Get count of completed quizzes for a user, optionally since a specific date.
    This is used to enforce test limits for 7-day plan users.
    """
    query = db.query(db_models.QuizAttempt).filter(
        db_models.QuizAttempt.user_id == user_id,
        db_models.QuizAttempt.is_completed == True
    )
    
    if since_date:
        query = query.filter(db_models.QuizAttempt.completed_at >= since_date)
    
    return query.count()

def can_user_start_quiz(db: Session, user_id: int, user_tier: str, payment_created_at: Optional[datetime] = None) -> tuple[bool, str, int, int]:
    """
    Check if user can start a new quiz based on their tier and completed quiz count.
    
    Returns:
        - can_start: bool - Whether user can start a quiz
        - message: str - Message to display
        - completed: int - Number of quizzes completed
        - limit: int - Quiz limit for this tier (0 = unlimited)
    """
    # Define limits per tier
    tier_limits = {
        "7days": 20,      # 7-day plan: 20 tests for 7 days
        "1month": 0,      # 1-month plan: unlimited tests for 30 days (0 = no limit)
        "free": 0         # Free users use different gate (freeTestGate with 3 tests)
    }
    
    limit = tier_limits.get(user_tier, 0)
    
    # If unlimited (limit = 0), always allow
    if limit == 0:
        return True, "unlimited", 0, 0
    
    # Count completed quizzes since payment started
    since_date = payment_created_at if payment_created_at else None
    completed_count = get_completed_quiz_count(db, user_id, since_date)
    
    # Check if under limit
    if completed_count < limit:
        remaining = limit - completed_count
        return True, f"{remaining} tests remaining", completed_count, limit
    else:
        return False, f"Test limit reached ({limit} tests)", completed_count, limit