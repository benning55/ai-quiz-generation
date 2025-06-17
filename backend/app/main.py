from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import database, models
from .routes import api

# Create all database tables
# In a production environment with Alembic, you might not need this.
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AI Quiz Generation API")

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