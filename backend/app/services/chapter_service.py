"""
Chapter management service for Canadian Citizenship Test chapters
"""
import logging
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..db import models as db_models
from ..utils.constants import CANADIAN_CHAPTERS, CHAPTER_MAPPING

logger = logging.getLogger(__name__)

def initialize_chapters(db: Session) -> Dict[str, int]:
    """
    Initialize the 10 Canadian citizenship test chapters in the database.
    Returns a mapping of chapter titles to their database IDs.
    
    Args:
        db: Database session
        
    Returns:
        Dict mapping chapter titles to their database IDs
    """
    chapter_mapping = {}
    
    try:
        logger.info("Initializing Canadian citizenship test chapters...")
        
        for chapter_data in CANADIAN_CHAPTERS:
            # Check if chapter already exists
            existing_chapter = db.query(db_models.Chapter).filter(
                db_models.Chapter.title == chapter_data["title"]
            ).first()
            
            if existing_chapter:
                logger.debug(f"Chapter '{chapter_data['title']}' already exists with ID {existing_chapter.id}")
                chapter_mapping[chapter_data["title"]] = existing_chapter.id
            else:
                # Create new chapter
                new_chapter = db_models.Chapter(
                    title=chapter_data["title"],
                    description=chapter_data["description"],
                    order=chapter_data["order"],
                    user_id=None  # Global chapters, not user-specific
                )
                
                db.add(new_chapter)
                db.commit()
                db.refresh(new_chapter)
                
                chapter_mapping[chapter_data["title"]] = new_chapter.id
                logger.info(f"Created chapter '{chapter_data['title']}' with ID {new_chapter.id}")
        
        # Update global mapping
        CHAPTER_MAPPING.clear()
        CHAPTER_MAPPING.update(chapter_mapping)
        
        logger.info(f"Successfully initialized {len(chapter_mapping)} chapters")
        return chapter_mapping
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error while initializing chapters: {e}")
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error while initializing chapters: {e}")
        raise

def get_all_chapters(db: Session) -> List[db_models.Chapter]:
    """Get all chapters ordered by their order field"""
    return db.query(db_models.Chapter).order_by(db_models.Chapter.order).all()

def get_chapter_by_title(db: Session, title: str) -> Optional[db_models.Chapter]:
    """Get a chapter by its title"""
    return db.query(db_models.Chapter).filter(db_models.Chapter.title == title).first()

def get_chapter_by_id(db: Session, chapter_id: int) -> Optional[db_models.Chapter]:
    """Get a chapter by its ID"""
    return db.query(db_models.Chapter).filter(db_models.Chapter.id == chapter_id).first()

def get_flashcards_by_chapter(db: Session, chapter_id: int, limit: int = 100) -> List[db_models.Flashcard]:
    """Get flashcards for a specific chapter"""
    return db.query(db_models.Flashcard).filter(
        db_models.Flashcard.chapter_id == chapter_id
    ).limit(limit).all()

def get_chapter_stats(db: Session) -> Dict:
    """Get statistics about chapters and their flashcards"""
    chapters = get_all_chapters(db)
    stats = {
        "total_chapters": len(chapters),
        "chapters": []
    }
    
    for chapter in chapters:
        flashcard_count = db.query(db_models.Flashcard).filter(
            db_models.Flashcard.chapter_id == chapter.id
        ).count()
        
        stats["chapters"].append({
            "id": chapter.id,
            "title": chapter.title,
            "order": chapter.order,
            "flashcard_count": flashcard_count
        })
    
    return stats

def assign_flashcard_to_chapter(db: Session, flashcard_id: int, chapter_title: str) -> bool:
    """Assign a flashcard to a chapter by chapter title"""
    try:
        chapter = get_chapter_by_title(db, chapter_title)
        if not chapter:
            logger.error(f"Chapter '{chapter_title}' not found")
            return False
        
        flashcard = db.query(db_models.Flashcard).filter(
            db_models.Flashcard.id == flashcard_id
        ).first()
        
        if not flashcard:
            logger.error(f"Flashcard with ID {flashcard_id} not found")
            return False
        
        flashcard.chapter_id = chapter.id
        db.commit()
        
        logger.info(f"Assigned flashcard {flashcard_id} to chapter '{chapter_title}'")
        return True
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error assigning flashcard to chapter: {e}")
        return False

def get_chapter_id_by_title(title: str) -> Optional[int]:
    """Get chapter ID by title from the cached mapping"""
    return CHAPTER_MAPPING.get(title)

def get_chapter_title_by_category(category: str) -> Optional[str]:
    """Map old category system to new chapter titles"""
    from ..utils.constants import CHAPTER_CATEGORIES
    return CHAPTER_CATEGORIES.get(category.lower())