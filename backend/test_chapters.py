#!/usr/bin/env python3
"""
Simple test script to verify chapter initialization works correctly.
Run this from the backend directory: python test_chapters.py
"""

import os
import sys
sys.path.append('app')

from app.db.database import SessionLocal
from app.services.chapter_service import initialize_chapters, get_all_chapters, get_chapter_stats
from app.utils.constants import CANADIAN_CHAPTERS

def test_chapter_initialization():
    """Test that chapters are properly initialized"""
    print("🧪 Testing Chapter Initialization...")
    
    db = SessionLocal()
    try:
        # Initialize chapters
        chapter_mapping = initialize_chapters(db)
        print(f"✅ Initialized {len(chapter_mapping)} chapters")
        
        # Verify all expected chapters exist
        expected_titles = [chapter["title"] for chapter in CANADIAN_CHAPTERS]
        
        for title in expected_titles:
            if title in chapter_mapping:
                print(f"✅ Chapter '{title}' created with ID {chapter_mapping[title]}")
            else:
                print(f"❌ Chapter '{title}' missing!")
        
        # Get all chapters from database
        db_chapters = get_all_chapters(db)
        print(f"\n📊 Database contains {len(db_chapters)} chapters:")
        
        for chapter in db_chapters:
            print(f"  {chapter.order}. {chapter.title} (ID: {chapter.id})")
        
        # Get chapter statistics
        stats = get_chapter_stats(db)
        print(f"\n📈 Chapter Statistics:")
        print(f"  Total chapters: {stats['total_chapters']}")
        for chapter_stat in stats['chapters']:
            print(f"  {chapter_stat['order']}. {chapter_stat['title']}: {chapter_stat['flashcard_count']} flashcards")
        
        print("\n🎉 Chapter initialization test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    success = test_chapter_initialization()
    sys.exit(0 if success else 1)