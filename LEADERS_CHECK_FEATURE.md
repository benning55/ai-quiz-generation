# Canadian Leaders Knowledge Check Feature

> **📅 Last Updated:** September 2025  
> **⚠️ Data Status:** Federal leaders verified for September 2025. Provincial/territorial leaders need verification.

## ✅ Overview

A special interactive quiz that tests knowledge of current Canadian leaders before taking the full exam or Chapter 5 quiz. This provides:
- 3 questions about federal leaders (Head of State, Prime Minister, Governor General)
- Province/Territory selection
- 1 personalized question about the user's local Lieutenant Governor or Commissioner

**Recent Change (Sept 2025):** Prime Minister updated from Justin Trudeau to Mark Carney (took office March 14, 2025)

## 🎯 Implementation Complete

### Backend Files Created

**1. `leaders_quiz_service.py`** - Core service with leader data
- ✅ Federal leaders database (updated regularly)
- ✅ Provincial/Territorial leaders database (13 provinces/territories)
- ✅ Question generation logic
- ✅ Option shuffling for randomization

**2. API Endpoints Added** (`api.py`)
- ✅ `GET /api/leaders-check` - Get federal questions + optional provincial
- ✅ `GET /api/leaders-check/provinces` - Get provinces/territories list
- ✅ `GET /api/leaders-check?province_code=ON` - Get with provincial question

### Frontend Component Created

**3. `LeadersCheck.tsx`** - Interactive quiz component
- ✅ Federal leaders quiz (3 questions)
- ✅ Province/territory selector
- ✅ Personalized provincial question
- ✅ Beautiful UI with animations
- ✅ Checkmarks for correct answers
- ✅ Explanations for each answer

## 📊 User Flow

```
1. User starts "Full Exam" or "Chapter 5" quiz
   ↓
2. Leaders Check appears first
   ↓
3. Three federal leader questions
   - Who is Head of State?
   - Who is Prime Minister?
   - Who is Governor General?
   ↓
4. Province/Territory selection screen
   - Shows all 10 provinces + 3 territories
   ↓
5. Personalized provincial/territorial leader question
   - Based on user's selection
   - E.g., "Who is the Lieutenant Governor of Ontario?"
   ↓
6. Leaders Check complete ✓
   ↓
7. Proceed to main quiz
```

## 🔌 How to Integrate

### Option A: Add to Quiz Page (quiz/page.tsx)

Add state for leaders check:

```typescript
const [showLeadersCheck, setShowLeadersCheck] = useState(false)
const [leaderCheckComplete, setLeadersCheckComplete] = useState(false)

// Modify startQuizWithGate function
const startQuizWithGate = async (mode: 'guest' | 'free' | 'paid', chapterId?: number | null) => {
  // Check if this is full exam (no chapter) or chapter 5
  const needsLeadersCheck = chapterId === null || chapterId === 5
  
  if (needsLeadersCheck && !leadersCheckComplete) {
    setShowLeadersCheck(true)
    return
  }
  
  // ... rest of existing code
}

// In the render, before hasStarted
if (showLeadersCheck) {
  return (
    <LeadersCheck
      onComplete={() => {
        setLeadersCheckComplete(true)
        setShowLeadersCheck(false)
        // Now start the actual quiz
        startQuizWithGate('paid', selectedChapter)
      }}
      onSkip={() => {
        setShowLeadersCheck(false)
      }}
    />
  )
}
```

### Option B: Standalone Route

Create `/quiz/leaders-check/page.tsx`:

```typescript
import LeadersCheck from '@/components/LeadersCheck'
import { useRouter } from 'next/navigation'

export default function LeadersCheckPage() {
  const router = useRouter()
  
  return (
    <LeadersCheck
      onComplete={() => {
        router.push('/quiz')
      }}
    />
  )
}
```

Then navigate to it before quiz starts.

## 🎨 UI/UX Features

### Visual Design
- ✅ Crown icon for federal questions
- ✅ Building icon for provincial questions
- ✅ MapPin icon for province selection
- ✅ Color-coded: Red for federal, Blue for provincial
- ✅ Animated transitions between questions
- ✅ Smooth hover effects on options

### User Feedback
- ✅ Green checkmark ✅ for correct answers
- ✅ Red X for incorrect answers
- ✅ Detailed explanations for each answer
- ✅ Progress indicator (Question X of Y)
- ✅ Completion badges

### Accessibility
- ✅ Clear button states
- ✅ Disabled states when answered
- ✅ Keyboard navigation support
- ✅ Screen reader friendly

## 📝 Leader Data Structure

### Current Federal Leaders (UPDATED: September 2025)

```python
{
    "head_of_state": {
        "name": "King Charles III",
        "title": "King of Canada",
        "since": "2022"
    },
    "prime_minister": {
        "name": "Mark Carney",  # ← UPDATED September 2025
        "title": "Prime Minister of Canada",
        "party": "Liberal Party",
        "since": "March 14, 2025"  # ← New PM
    },
    "governor_general": {
        "name": "Mary Simon",  # ← Still current
        "title": "Governor General of Canada",
        "since": "July 26, 2021",
        "note": "First Indigenous Governor General"
    }
}
```

**📅 Last Update:** September 2025 - Prime Minister changed from Justin Trudeau to Mark Carney

### Provincial/Territorial Leaders

⚠️ **WARNING:** Provincial/Territorial leader data was last verified in **October 2024**. These positions change frequently (typically every 5 years), so they should be verified against current official sources before use.

13 entries covering:
- 10 Provinces (Lieutenant Governors)
- 3 Territories (Commissioners)

Each includes:
- Name
- Title (Lieutenant Governor or Commissioner)
- Appointment date
- Notable fact

**Recommended verification sources:**
- https://www.gg.ca/ (for Lieutenant Governors)
- Individual province/territory government websites
- https://www.canada.ca/en/canadian-heritage/services/crown-canada.html

## ⚙️ Configuration

### Updating Leader Information

**IMPORTANT:** Update these regularly when leaders change!

Edit `backend/app/services/leaders_quiz_service.py`:

```python
# Update federal leaders
CURRENT_LEADERS = {
    "prime_minister": {
        "name": "New PM Name",  # ← Update here
        "since": "2025"
    },
    # ... etc
}

# Update provincial leaders
PROVINCIAL_LEADERS = {
    "ON": {
        "name": "Ontario",
        "leader": "New LG Name",  # ← Update here
        "since": "2025",
        "note": "Notable achievement"
    },
    # ... etc
}
```

### When to Show Leaders Check

Customize in `quiz/page.tsx`:

```typescript
// Show for full exam only
const needsLeadersCheck = chapterId === null

// Show for Chapter 5 only
const needsLeadersCheck = chapterId === 5

// Show for both
const needsLeadersCheck = chapterId === null || chapterId === 5

// Show for specific chapters
const needsLeadersCheck = [5, 6, 7].includes(chapterId)
```

## 🧪 Testing

### Test Scenarios

**Scenario 1: Federal Questions**
```
✅ Shows 3 federal leader questions
✅ Options are shuffled (not always A)
✅ Correct answer shows green checkmark
✅ Incorrect answer shows explanation
✅ Can proceed to next question
```

**Scenario 2: Province Selection**
```
✅ Shows all 13 provinces/territories
✅ Clickable province cards
✅ Smooth transition to provincial question
✅ Can skip if desired
```

**Scenario 3: Provincial Question**
```
✅ Question specific to selected province
✅ Shows correct Lieutenant Governor or Commissioner
✅ Includes historical note/context
✅ Completion leads to main quiz
```

**Scenario 4: Full Flow**
```
✅ Complete all 3 federal questions
✅ Select province
✅ Answer provincial question
✅ See "Complete ✓" button
✅ Returns to main quiz
```

## 🔄 Future Enhancements

Potential improvements:
- [ ] Add web scraping to auto-update leader data
- [ ] Track which provinces users select (analytics)
- [ ] Add more federal questions (cabinet ministers, etc.)
- [ ] Save user's province selection for future sessions
- [ ] Add historical trivia about past leaders
- [ ] Add photos of current leaders
- [ ] Multi-language support (French)

## 📈 Benefits

1. **Educational**: Tests real-world current knowledge
2. **Personalized**: Questions about user's own province
3. **Engaging**: Interactive, not just memorization
4. **Up-to-date**: Reflects current leadership
5. **Comprehensive**: Federal + provincial coverage

## ⚠️ Important Notes

### Regular Updates Required

**The leader data MUST be updated when:**
- Prime Minister changes
- Governor General changes
- Any Lieutenant Governor or Commissioner changes
- Head of State changes (rare)

**How often to check:** Monthly or after major Canadian news

### API Response Format

```json
{
  "federal_leaders": [
    {
      "question": "Who is the Head of State of Canada?",
      "type": "multiple_choice",
      "options": ["King Charles III", "The Prime Minister", "..."],
      "answer": "King Charles III",
      "explanation": "..."
    }
  ],
  "provinces_territories": [
    {"code": "ON", "name": "Ontario"},
    {"code": "BC", "name": "British Columbia"},
    ...
  ],
  "provincial_question": {
    "question": "Who is the current Lieutenant Governor of Ontario?",
    "options": ["Edith Dumont", "..."],
    "answer": "Edith Dumont",
    "explanation": "...",
    "province": "Ontario"
  }
}
```

## 📝 Summary

The Leaders Check feature adds:
- ✅ 3 federal leader questions
- ✅ 13 provinces/territories selection
- ✅ 1 personalized provincial question
- ✅ Beautiful interactive UI
- ✅ Educational and engaging
- ✅ Ready to integrate into quiz flow

**Next Steps:**
1. Choose integration method (Option A or B)
2. Add to quiz page before full exam / Chapter 5
3. Test the complete flow
4. Update leader data regularly
5. Enjoy more engaged users! 🎉
