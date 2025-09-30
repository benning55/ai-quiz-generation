# Quiz Generation System Update

## Overview
Updated the quiz generation logic to remove category-based filtering and implement a smarter chapter-based distribution system with proper user tier support.

## User Tiers & Question Limits

| User Type | Login Status | Question Limit | Features |
|-----------|--------------|----------------|----------|
| **Guest** | Not logged in | 3 questions | Random mixed test only |
| **Free User** | Logged in | 5 questions | Random mixed test only |
| **Premium User** | Logged in + Paid | 20 questions | Mixed test (balanced) + Chapter-specific tests |

## Key Changes

### 1. Removed Category System
- **Before**: Mixed category and chapter filtering
- **After**: Pure chapter-based system only
- **Reason**: Simplifies logic and avoids confusion between old category system and new chapter system

### 2. Implemented Smart Question Distribution

#### Case 1: Chapter-Specific Test (Premium Users Only)
```python
if chapter_id:
    # Get all flashcards from that specific chapter
    # Randomly select up to 20 questions
    # Send to AI for quiz generation
```

#### Case 2: Mixed Test - Premium (20 Questions)
```python
elif is_premium_test (count >= 20):
    # Step 1: Get 2 questions from EACH of the 10 chapters
    for each chapter:
        - Randomly select 2 flashcards
        - Add to selection
    
    # Step 2: If we have fewer than 20 (some chapters empty)
    if selected < 20:
        - Fill remaining slots with random flashcards from any chapter
        - Ensure we reach 20 questions total
    
    # Step 3: If we have more than 20 (shouldn't happen with 2×10)
    if selected > 20:
        - Trim down to exactly 20 questions
    
    # Step 4: Shuffle for randomness
    random.shuffle(selected_flashcards)
```

#### Case 3: Mixed Test - Free/Guest (3 or 5 Questions)
```python
else:  # count is 3 or 5
    # Get ALL flashcards with chapters assigned
    # Randomly select requested count (3 or 5)
    # No special distribution needed for small counts
    # Shuffle for randomness
```

### 3. Question Cap
- **Maximum**: 20 questions per quiz
- **Applies to**: Both chapter-specific and mixed tests
- **Formula**: `max_questions = min(request.count, 20)`

### 4. Question Selection BEFORE AI
- **Before**: Send many flashcards to AI, let AI decide
- **After**: Select exact questions needed, then send to AI
- **Benefit**: More predictable, consistent quiz generation

## Distribution Examples

### Example 1: Guest User (3 Questions)
```
User: Not logged in
Request: 3 questions
Strategy: Random selection from all flashcards
-------------------------------------------
Result: 3 random questions from any chapters
```

### Example 2: Free User (5 Questions)
```
User: Logged in (no payment)
Request: 5 questions
Strategy: Random selection from all flashcards
-------------------------------------------
Result: 5 random questions from any chapters
```

### Example 3: Premium User - Mixed Test (20 Questions)
```
User: Logged in + Premium subscription
Request: 20 questions, no chapter specified
Strategy: Balanced distribution (2 per chapter)
-------------------------------------------
Chapter 1: Rights and Responsibilities    → 2 questions
Chapter 2: Who We Are                     → 2 questions
Chapter 3: Canada History                 → 2 questions
Chapter 4: Modern Canada                  → 2 questions
Chapter 5: How Canadians Govern           → 2 questions
Chapter 6: Federal Elections              → 2 questions
Chapter 7: Justice System                 → 2 questions
Chapter 8: Canadian Symbols               → 2 questions
Chapter 9: Canadian Economy               → 2 questions
Chapter 10: Canadian Regions              → 2 questions
-------------------------------------------
TOTAL: 20 questions (perfectly balanced!)
```

### Example 4: Premium User - Chapter-Specific (20 Questions)
```
User: Logged in + Premium subscription
Request: 20 questions, Chapter 1 selected
Strategy: Random from specific chapter
-------------------------------------------
Chapter 1: Rights and Responsibilities
- Pool: 32 flashcards available
- Selection: Randomly pick 20 questions
- Result: 20 questions all from Chapter 1
```

### Example 5: Premium Mixed Test with Empty Chapters
```
User: Premium
Request: 20 questions, no chapter
Strategy: 2 per chapter, fill gaps
-------------------------------------------
Chapter 1: Rights and Responsibilities    → 2 questions
Chapter 2: Who We Are                     → 0 questions (empty)
Chapter 3: Canada History                 → 2 questions
Chapter 4: Modern Canada                  → 2 questions
Chapter 5: How Canadians Govern           → 0 questions (empty)
Chapter 6: Federal Elections              → 2 questions
Chapter 7: Justice System                 → 2 questions
Chapter 8: Canadian Symbols               → 2 questions
Chapter 9: Canadian Economy               → 2 questions
Chapter 10: Canadian Regions              → 2 questions
Fill remaining with random:               → 4 questions
-------------------------------------------
TOTAL: 20 questions (balanced distribution)
```

## Benefits

1. **Clear User Tiers**: Different experience for guest, free, and premium users
2. **Balanced Coverage**: Premium mixed tests cover all 10 chapters evenly (2 questions each)
3. **Fair Distribution**: Each chapter gets equal representation in premium tests
4. **Simple for Free Users**: Just random questions, no complex logic needed
5. **Premium Value**: Chapter-specific tests and balanced distribution only for paying users
6. **Predictable**: Exact question counts per tier (3/5/20)
7. **Handles Edge Cases**: Fills gaps when chapters are empty
8. **True Randomness**: Questions shuffled after selection
9. **Better for Learning**: Premium users get comprehensive coverage of all topics

## Technical Details

### Code Location
- **File**: `backend/app/services/service.py`
- **Function**: `generate_quiz_from_flashcards_service()`
- **Added Import**: `import random`

### Database Queries
1. **Chapter-specific**: `db.query(Flashcard).filter(chapter_id == X).all()`
2. **Mixed test**: Iterate through all chapters, query each separately
3. **Fill remaining**: Query all flashcards excluding already selected ones

### Error Handling
- No flashcards in specific chapter → Clear error message
- No flashcards with chapters assigned → Helpful prompt to assign chapters
- Handles empty chapters gracefully in mixed tests

## Frontend Impact

No changes required! The frontend already supports:
- Chapter selection (sends `chapter_id` parameter)
- Mixed test (doesn't send `chapter_id`)
- The API contract remains the same

## Testing Checklist

### Guest User Tests (3 Questions)
- [ ] Not logged in → 3 random questions
- [ ] Questions are properly shuffled
- [ ] Cannot access chapter-specific tests

### Free User Tests (5 Questions)
- [ ] Logged in, no payment → 5 random questions
- [ ] Questions are properly shuffled
- [ ] Cannot access chapter-specific tests

### Premium User Tests (20 Questions)
- [ ] Mixed test with all 10 chapters populated → 2 from each chapter
- [ ] Mixed test with some empty chapters → fills gaps randomly
- [ ] Chapter-specific test with 50+ flashcards → random 20
- [ ] Chapter-specific test with <20 flashcards → all available
- [ ] Verify 20-question cap is enforced
- [ ] Verify questions are properly shuffled

### Error Cases
- [ ] Error case: No flashcards in selected chapter
- [ ] Error case: No flashcards assigned to any chapter
- [ ] Verify proper error messages are shown

## Migration Notes

**No database migration needed!** This is purely a business logic change.

Existing flashcards and chapters work without modification.