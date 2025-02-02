from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine
from .models import Base  # Import Base from models

def create_app():
    """
    Initialize and configure the FastAPI app.
    """
    # Create FastAPI app instance
    app = FastAPI(title="Document Text Extraction API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allows all origins (update this to restrict domains)
        allow_credentials=True,
        allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
        allow_headers=["*"],  # Allows all headers
    )

    # Create tables in the database if they don't exist (using the engine and Base)
    Base.metadata.create_all(bind=engine)

    return app

# This ensures that `app` can be imported directly
app = create_app()
