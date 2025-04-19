"""
Database migration script to create all tables.
Run this script manually when you need to recreate the database schema.
"""

import sys
import os
import logging

# Add the parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

try:
    from app.db import Base, engine
    from app import models
    
    def create_tables():
        """Create all tables defined in the models module"""
        logging.info("Creating database tables...")
        
        # This will create all tables
        Base.metadata.create_all(bind=engine)
        
        logging.info("Database tables created successfully!")

    def add_clerk_id_to_users():
        """Add clerk_id column to users table if it doesn't exist"""
        from sqlalchemy import Column, String
        from sqlalchemy.sql import text
        from app.db import SessionLocal
        
        db = SessionLocal()
        
        try:
            # Check if clerk_id column exists
            result = db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='clerk_id'"))
            exists = result.fetchone() is not None
            
            if not exists:
                # Add clerk_id column
                db.execute(text("ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'migration_' || id::text"))
                db.commit()
                logging.info("Added clerk_id column to users table")
            else:
                logging.info("clerk_id column already exists in users table")
        
        except Exception as e:
            logging.error(f"Error checking or adding clerk_id column: {e}")
        finally:
            db.close()

    def add_user_id_to_flashcards():
        """Add user_id column to flashcards table if it doesn't exist"""
        from sqlalchemy.sql import text
        from app.db import SessionLocal
        
        db = SessionLocal()
        
        try:
            # Check if user_id column exists
            result = db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='flashcards' AND column_name='user_id'"))
            exists = result.fetchone() is not None
            
            if not exists:
                # Add user_id column
                db.execute(text("ALTER TABLE flashcards ADD COLUMN user_id INTEGER REFERENCES users(id)"))
                db.commit()
                logging.info("Added user_id column to flashcards table")
            else:
                logging.info("user_id column already exists in flashcards table")
        
        except Exception as e:
            logging.error(f"Error checking or adding user_id column: {e}")
        finally:
            db.close()

    if __name__ == "__main__":
        logging.basicConfig(level=logging.INFO)
        
        # Create all tables
        create_tables()
        
        # If users table already existed, add clerk_id column
        try:
            add_clerk_id_to_users()
        except Exception as e:
            logging.error(f"Error adding clerk_id to existing users: {e}")
        
        # If flashcards table already existed, add user_id column
        try:
            add_user_id_to_flashcards()
        except Exception as e:
            logging.error(f"Error adding user_id to existing flashcards: {e}")
            
        logging.info("Migration completed successfully!")
        
except ImportError as e:
    logging.error(f"Import error: {e}")
    logging.error("Make sure to install required packages: pip install fastapi sqlalchemy") 