from sqlalchemy import Column, Integer, String, Text
from .db import Base  # Import Base from db.py to link models to the database

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
