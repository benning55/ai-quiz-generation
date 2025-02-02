from fastapi import FastAPI
from .db import engine
from .models import Base  # Import Base from models

def create_app():
    """
    Initialize and configure the FastAPI app.
    """
    # Create FastAPI app instance
    app = FastAPI(title="Document Text Extraction API")

    # Create tables in the database if they don't exist (using the engine and Base)
    Base.metadata.create_all(bind=engine)

    return app

# This ensures that `app` can be imported directly
app = create_app()
