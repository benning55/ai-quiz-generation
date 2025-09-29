from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from .db import database, models
from .routes import api
from .services.chapter_service import initialize_chapters

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create all database tables
# In a production environment with Alembic, you might not need this.
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AI Quiz Generation API")

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Starting AI Quiz Generation API...")
    
    # Initialize database session for startup tasks
    db = database.SessionLocal()
    try:
        # Initialize Canadian citizenship test chapters
        chapter_mapping = initialize_chapters(db)
        logger.info(f"Initialized {len(chapter_mapping)} chapters successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize chapters: {e}")
        # Don't fail startup if chapter initialization fails
        
    finally:
        db.close()
    
    logger.info("AI Quiz Generation API startup completed")

# CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include the API router. Using a prefix is good practice for versioning.
app.include_router(api.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Quiz Generation API"}