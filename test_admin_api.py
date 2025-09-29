#!/usr/bin/env python3
"""
Quick test script to verify admin API endpoints are working
Run this after starting your backend to test the API endpoints
"""

import requests
import json

API_BASE = "http://localhost:8000/api"

def test_chapters():
    """Test chapters endpoint"""
    print("🧪 Testing chapters endpoint...")
    try:
        response = requests.get(f"{API_BASE}/chapters/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data)} chapters")
            for chapter in data[:3]:  # Show first 3
                print(f"  - {chapter['order']}. {chapter['title']}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_flashcards():
    """Test flashcards endpoint"""
    print("\n🧪 Testing flashcards endpoint...")
    try:
        response = requests.get(f"{API_BASE}/flashcards/?limit=5")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data)} flashcards")
            for card in data[:2]:  # Show first 2
                print(f"  - Q: {card['question'][:50]}...")
                print(f"    A: {card['answer'][:50]}...")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_create_flashcard():
    """Test creating a flashcard"""
    print("\n🧪 Testing flashcard creation...")
    try:
        test_flashcard = {
            "question": "Test question from API test",
            "answer": "Test answer from API test",
            "tags": ["test", "api"],
            "chapter_id": 1
        }
        
        response = requests.post(
            f"{API_BASE}/flashcards/",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_flashcard)
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Created flashcard with ID: {data['id']}")
            return data['id']
        else:
            print(f"❌ Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

def test_delete_flashcard(flashcard_id):
    """Test deleting a flashcard"""
    if not flashcard_id:
        return
        
    print(f"\n🧪 Testing flashcard deletion (ID: {flashcard_id})...")
    try:
        response = requests.delete(f"{API_BASE}/flashcards/{flashcard_id}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Flashcard deleted successfully")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_chapter_stats():
    """Test chapter statistics"""
    print("\n🧪 Testing chapter statistics...")
    try:
        response = requests.get(f"{API_BASE}/chapters/stats")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Total chapters: {data['total_chapters']}")
            for chapter in data['chapters'][:3]:
                print(f"  - {chapter['title']}: {chapter['flashcard_count']} flashcards")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    print("🚀 Testing Admin API Endpoints")
    print("=" * 50)
    
    # Test all endpoints
    test_chapters()
    test_flashcards()
    created_id = test_create_flashcard()
    test_chapter_stats()
    test_delete_flashcard(created_id)
    
    print("\n" + "=" * 50)
    print("🎉 API testing completed!")
    print("\nIf you see ✅ marks, your API is working correctly.")
    print("If you see ❌ marks, check your backend logs for errors.")