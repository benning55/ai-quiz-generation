from fastapi import FastAPI, UploadFile, File, Depends, Request
from sqlalchemy.orm import Session
from .db import SessionLocal, engine
from . import models
from .groq_client import generate_questions
import os

# Import the FastAPI app from __init__.py
from . import app

# Dependency to get the database session
def get_db():
    db = SessionLocal()  # Create a new database session
    try:
        yield db  # This will yield a database session to be used in the route
    finally:
        db.close()  # Ensure that the session is closed after use

# Extract text from PDF
def extract_text_from_pdf(file_path):
    import fitz  # PyMuPDF for PDFs
    doc = fitz.open(file_path)
    return "\n".join([page.get_text() for page in doc])

# Extract text from Word
def extract_text_from_word(file_path):
    import docx  # python-docx for Word
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

# Extract text from PowerPoint
def extract_text_from_ppt(file_path):
    import pptx  # python-pptx for PowerPoint
    prs = pptx.Presentation(file_path)
    text = []
    for slide in prs.slides:
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                text.append(shape.text)
    return "\n".join(text)

# General extractor for other formats
def extract_text_generic(file_path):
    import textract  # For various formats
    try:
        return textract.process(file_path).decode("utf-8")
    except Exception as e:
        return f"Error extracting text: {str(e)}"

@app.post("/extract-text/")
async def extract_text(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_ext = file.filename.split(".")[-1].lower()
    file_path = f"temp.{file_ext}"

    # Save uploaded file temporarily
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Extract text based on file type
    if file_ext == "pdf":
        text = extract_text_from_pdf(file_path)
    elif file_ext in ["doc", "docx"]:
        text = extract_text_from_word(file_path)
    elif file_ext in ["ppt", "pptx"]:
        text = extract_text_from_ppt(file_path)
    else:
        text = extract_text_generic(file_path)

    # Optionally, save the document to the database
    db.add(models.Document(name=file.filename, content=text))
    db.commit()

    # Clean up the temporary file
    os.remove(file_path)

    quiz_json = generate_questions(text)
    
    # Return the extracted text
    return {"filename": file.filename, "extracted_text": text, 'quiz': quiz_json}

@app.get("/")
async def hello(request: Request):
    # Access information from the request object
    client_ip = request.client.host  # Get client IP address
    headers = request.headers  # Access headers
    
    # You can also access query parameters, cookies, etc.
    
    return {
        "message": "Hello",
        "client_ip": client_ip,
        "headers": dict(headers)
    }