#!/usr/bin/env python3
"""
Migration script to assign existing flashcards to appropriate chapters
based on their content or category.

Run this script after the chapters have been initialized in the database.
"""

import sys
import os
from typing import Dict, List
import logging

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import SessionLocal
from db import models as db_models
from services.chapter_service import initialize_chapters, get_chapter_id_by_title
from utils.constants import CHAPTER_CATEGORIES

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def categorize_flashcard_by_content(question: str, answer: str) -> str:
    """
    Analyze flashcard content to determine which chapter it belongs to.
    This is a simple keyword-based approach - you can make it more sophisticated.
    """
    content = f"{question} {answer}".lower()
    
    # Keywords for each chapter
    chapter_keywords = {
        "Rights and Responsibilities": [
            "rights", "responsibilities", "charter", "freedom", "vote", "voting", 
            "citizen", "citizenship", "duty", "obligation", "democratic", "democracy"
        ],
        "Who We Are": [
            "language", "languages", "english", "french", "official", "diversity", 
            "multicultural", "identity", "canadian", "population", "ethnic"
        ],
        "Canada History": [
            "history", "confederation", "1867", "first nations", "indigenous", 
            "explorer", "jacques cartier", "samuel champlain", "new france", 
            "british", "war", "battle", "treaty"
        ],
        "Modern Canada": [
            "modern", "contemporary", "recent", "20th century", "21st century", 
            "world war", "peacekeeping", "nato", "united nations", "g7", "g8"
        ],
        "How Canadians Govern Themselves": [
            "government", "parliament", "prime minister", "governor general", 
            "senate", "house of commons", "federal", "provincial", "municipal", 
            "constitution", "cabinet"
        ],
        "Canada Federal Elections": [
            "election", "elections", "vote", "voting", "ballot", "candidate", 
            "political party", "campaign", "riding", "constituency", "mp"
        ],
        "The Justice System": [
            "justice", "court", "courts", "judge", "law", "legal", "police", 
            "rcmp", "criminal", "civil", "supreme court", "trial"
        ],
        "Canadian Symbols": [
            "symbol", "symbols", "flag", "anthem", "maple leaf", "beaver", 
            "coat of arms", "crown", "emblem", "o canada", "red and white"
        ],
        "Canadian Economy": [
            "economy", "economic", "industry", "trade", "business", "agriculture", 
            "mining", "forestry", "fishing", "manufacturing", "service", "gdp"
        ],
        "Canadian Regions": [
            "region", "regions", "province", "provinces", "territory", "territories", 
            "atlantic", "quebec", "ontario", "prairie", "british columbia", 
            "north", "geography", "capital", "cities"
        ]
    }
    
    # Score each chapter based on keyword matches
    chapter_scores = {}
    for chapter, keywords in chapter_keywords.items():
        score = sum(1 for keyword in keywords if keyword in content)
        if score > 0:
            chapter_scores[chapter] = score
    
    # Return the chapter with the highest score
    if chapter_scores:
        return max(chapter_scores, key=chapter_scores.get)
    
    # Default fallback
    return "Who We Are"  # Generic chapter for unclassified content

def migrate_flashcards_to_chapters(db_session):
    """Migrate existing flashcards to appropriate chapters"""
    logger.info("Starting flashcard to chapter migration...")
    
    # Initialize chapters first
    chapter_mapping = initialize_chapters(db_session)
    logger.info(f"Initialized {len(chapter_mapping)} chapters")
    
    # Get all flashcards that don't have a chapter assigned
    unassigned_flashcards = db_session.query(db_models.Flashcard).filter(
        db_models.Flashcard.chapter_id.is_(None)
    ).all()
    
    logger.info(f"Found {len(unassigned_flashcards)} flashcards without chapter assignment")
    
    migration_stats = {}
    
    for flashcard in unassigned_flashcards:
        try:
            # First, try to use existing category if it maps to a chapter
            chapter_title = None
            
            if flashcard.category:
                # Try to map old category to new chapter
                chapter_title = CHAPTER_CATEGORIES.get(flashcard.category.lower())
            
            # If no category mapping, analyze content
            if not chapter_title:
                chapter_title = categorize_flashcard_by_content(
                    flashcard.question, 
                    flashcard.answer
                )
            
            # Get chapter ID
            chapter_id = get_chapter_id_by_title(chapter_title)
            
            if chapter_id:
                flashcard.chapter_id = chapter_id
                
                # Update stats
                if chapter_title not in migration_stats:
                    migration_stats[chapter_title] = 0
                migration_stats[chapter_title] += 1
                
                logger.debug(f"Assigned flashcard {flashcard.id} to chapter '{chapter_title}'")
            else:
                logger.warning(f"Could not find chapter ID for '{chapter_title}'")
                
        except Exception as e:
            logger.error(f"Error processing flashcard {flashcard.id}: {e}")
    
    # Commit changes
    try:
        db_session.commit()
        logger.info("Successfully committed flashcard migrations")
        
        # Print migration statistics
        logger.info("Migration Statistics:")
        for chapter, count in migration_stats.items():
            logger.info(f"  {chapter}: {count} flashcards")
            
        total_migrated = sum(migration_stats.values())
        logger.info(f"Total flashcards migrated: {total_migrated}")
        
    except Exception as e:
        db_session.rollback()
        logger.error(f"Failed to commit migrations: {e}")
        raise

def main():
    """Main migration function"""
    logger.info("Starting flashcard to chapter migration script...")
    
    db = SessionLocal()
    try:
        migrate_flashcards_to_chapters(db)
        logger.info("Migration completed successfully!")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return 1
        
    finally:
        db.close()
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)