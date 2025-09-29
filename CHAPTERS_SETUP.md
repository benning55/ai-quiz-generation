# Canadian Citizenship Test Chapters Setup

## Overview

This system automatically creates and manages the 10 Canadian citizenship test chapters in your database, allowing you to organize flashcards by topic and generate chapter-specific quizzes.

## The 10 Chapters

1. **Rights and Responsibilities** - Charter of Rights and Freedoms, voting rights, civic duties
2. **Who We Are** - Canadian identity, diversity, official languages  
3. **Canada History** - Key events, figures, and periods from Indigenous peoples to Confederation
4. **Modern Canada** - Contemporary Canada and its role in the world
5. **How Canadians Govern Themselves** - Government structure (federal, provincial, municipal)
6. **Canada Federal Elections** - Electoral system, voting process, political parties
7. **The Justice System** - Legal system, courts, laws, police
8. **Canadian Symbols** - National symbols, emblems, anthem, flag
9. **Canadian Economy** - Economic system, industries, trade, natural resources
10. **Canadian Regions** - Geography, provinces, territories, major cities

## Automatic Setup

### On Backend Startup
The chapters are automatically created when your backend starts up:

```python
# In main.py - runs automatically on startup
@app.on_event("startup")
async def startup_event():
    # Initialize Canadian citizenship test chapters
    chapter_mapping = initialize_chapters(db)
```

### What Happens
- ✅ Checks if all 10 chapters exist
- ✅ Creates missing chapters with descriptions and proper ordering
- ✅ Skips existing chapters (safe to run multiple times)
- ✅ Logs the process for monitoring

## New API Endpoints

### Chapter Management
```bash
# Get all chapters
GET /api/chapters/

# Get specific chapter
GET /api/chapters/{chapter_id}

# Get flashcards for a chapter
GET /api/chapters/{chapter_id}/flashcards?limit=100

# Get chapter statistics
GET /api/chapters/stats

# Assign flashcard to chapter
POST /api/flashcards/{flashcard_id}/assign-chapter?chapter_title="Rights and Responsibilities"
```

### Enhanced Quiz Generation
```bash
# Generate quiz by chapter (new)
POST /api/generate-quiz-from-flashcards/
{
  "category": "Rights and Responsibilities",  // Now supports chapter titles
  "count": 10,
  "question_types": ["multiple_choice", "true_false"]
}

# Still supports old category system
POST /api/generate-quiz-from-flashcards/
{
  "category": "rights",  // Maps to "Rights and Responsibilities"
  "count": 10,
  "question_types": ["multiple_choice", "true_false"]
}
```

## Database Schema Updates

### Flashcard Table (Enhanced)
```sql
-- Each flashcard can now be linked to a chapter
flashcards:
  - id (primary key)
  - question (text)
  - answer (text) 
  - tags (array)
  - category (string) -- legacy field, still supported
  - chapter_id (foreign key) -- NEW: links to chapters table
  - user_id (foreign key)
  - created_at (timestamp)
```

### Chapters Table (New)
```sql
chapters:
  - id (primary key)
  - title (string) -- "Rights and Responsibilities", etc.
  - description (text) -- Detailed description of chapter content
  - order (integer) -- 1-10 for proper ordering
  - user_id (foreign key, nullable) -- For user-specific chapters
  - created_at (timestamp)
  - updated_at (timestamp)
```

## Testing the Setup

### 1. Test Chapter Creation
```bash
cd backend
python test_chapters.py
```

Expected output:
```
🧪 Testing Chapter Initialization...
✅ Initialized 10 chapters
✅ Chapter 'Rights and Responsibilities' created with ID 1
✅ Chapter 'Who We Are' created with ID 2
...
📊 Database contains 10 chapters:
  1. Rights and Responsibilities (ID: 1)
  2. Who We Are (ID: 2)
...
🎉 Chapter initialization test completed successfully!
```

### 2. Check API Endpoints
```bash
# After starting your backend
curl http://localhost:8000/api/chapters/
curl http://localhost:8000/api/chapters/stats
```

## Migrating Existing Flashcards

### Option 1: Automatic Migration Script
```bash
cd backend
python app/scripts/migrate_flashcards_to_chapters.py
```

This script will:
- ✅ Analyze existing flashcard content
- ✅ Assign flashcards to appropriate chapters based on keywords
- ✅ Use existing categories where possible
- ✅ Provide migration statistics

### Option 2: Manual Assignment via API
```bash
# Assign specific flashcard to chapter
curl -X POST "http://localhost:8000/api/flashcards/123/assign-chapter?chapter_title=Rights and Responsibilities"
```

### Option 3: Bulk Assignment (Custom Script)
You can create custom scripts to assign flashcards based on your specific criteria.

## Frontend Integration

### Updated Quiz Generation
```typescript
// Generate quiz by chapter
const response = await fetch('/api/generate-quiz-from-flashcards/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'Rights and Responsibilities', // Chapter title
    count: 10,
    question_types: ['multiple_choice', 'true_false']
  })
});
```

### Chapter Selection UI
```typescript
// Get available chapters for user selection
const chapters = await fetch('/api/chapters/').then(r => r.json());

// Display chapter options
chapters.forEach(chapter => {
  console.log(`${chapter.order}. ${chapter.title}`);
  console.log(`   Description: ${chapter.description}`);
});
```

## Backward Compatibility

The system maintains full backward compatibility:

- ✅ Old `category` field still works
- ✅ Existing API calls unchanged
- ✅ Legacy categories automatically map to chapters
- ✅ No breaking changes to frontend

### Category Mapping
```javascript
// These old categories automatically map to new chapters:
"rights" → "Rights and Responsibilities"
"history" → "Canada History" 
"government" → "How Canadians Govern Themselves"
"geography" → "Canadian Regions"
// ... etc
```

## Benefits

### For Users
- 📚 **Organized Study** - Practice specific topics
- 🎯 **Targeted Learning** - Focus on weak areas
- 📊 **Progress Tracking** - See performance by chapter

### For Administrators  
- 📈 **Better Analytics** - Track which chapters need more content
- 🔧 **Easy Management** - Organize flashcards systematically
- 📋 **Content Planning** - Ensure balanced coverage of all topics

### For Developers
- 🏗️ **Clean Architecture** - Proper data organization
- 🔄 **Scalable System** - Easy to add new chapters/topics
- 📊 **Rich Queries** - Filter and analyze by chapter

## Monitoring

### Logs to Watch
```
INFO: Starting AI Quiz Generation API...
INFO: Initialized 10 chapters successfully
INFO: AI Quiz Generation API startup completed
```

### Health Checks
```bash
# Verify chapters exist
curl http://localhost:8000/api/chapters/stats

# Should return:
{
  "total_chapters": 10,
  "chapters": [
    {"id": 1, "title": "Rights and Responsibilities", "order": 1, "flashcard_count": 0},
    ...
  ]
}
```

## Next Steps

1. **Start your backend** - Chapters will be created automatically
2. **Run the test script** - Verify everything works
3. **Migrate existing flashcards** - Use the migration script
4. **Update your frontend** - Add chapter selection UI
5. **Import flashcards** - Assign new flashcards to appropriate chapters

The system is now ready to provide organized, chapter-based quiz generation for the Canadian citizenship test! 🇨🇦