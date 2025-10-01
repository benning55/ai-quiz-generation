# Test Limits Feature Documentation

## ✅ Overview

The system now enforces test limits based on user subscription tiers:
- **Not Logged In**: Cannot track (guest users, uses freeTestGate with 3 tests)
- **Free Users**: Logged in but no payment (uses freeTestGate with 3 tests)
- **7days Plan**: 20 practice tests for 7 days
- **1month Plan**: Unlimited tests for 30 days

## 🎯 How It Works

### Backend Implementation

#### 1. **Test Counting** (`progress_service.py`)

```python
def get_completed_quiz_count(db: Session, user_id: int, since_date: Optional[datetime] = None) -> int:
    """Count completed quizzes since a specific date (payment created date)"""
    query = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user_id,
        QuizAttempt.is_completed == True
    )
    if since_date:
        query = query.filter(QuizAttempt.completed_at >= since_date)
    return query.count()
```

#### 2. **Limit Checking** (`progress_service.py`)

```python
def can_user_start_quiz(db, user_id, user_tier, payment_created_at):
    """
    Check if user can start based on tier limits
    Returns: (can_start, message, completed_count, limit)
    """
    tier_limits = {
        "7days": 20,       # 20 tests for 7 days
        "1month": 0,       # Unlimited tests for 30 days (0 = no limit)
        "free": 0          # Free users use freeTestGate (3 tests)
    }
```

#### 3. **API Endpoints** (`api.py`)

**Check Limits (GET `/api/quiz/can-start`)**
```json
{
  "can_start": true,
  "tier": "7days",
  "message": "15 tests remaining",
  "completed_tests": 5,
  "test_limit": 20,
  "remaining_tests": 15
}
```

**Start Quiz (POST `/api/quiz/start`)**
- Checks limits before allowing quiz to start
- Returns limit info in response
- Prevents quiz start if limit reached

### Frontend Implementation

#### 1. **State Management** (`quiz/page.tsx`)

```typescript
const [quizLimits, setQuizLimits] = useState<{
  canStart: boolean;
  tier: string;
  completedTests: number;
  testLimit: number;
  remainingTests: number;
  message: string;
} | null>(null);
```

#### 2. **Limit Display**

**For 7-Day Plan Users:**
```
┌─────────────────────────────────┐
│  Tests Remaining                │
│  7-Day Plan                     │
│                                 │
│  15                             │
│  of 20                          │
└─────────────────────────────────┘
```

**For 1-Month Users:**
```
┌─────────────────────────────────┐
│  ✨ Unlimited Tests             │
│  Take as many as you need!      │
└─────────────────────────────────┘
```

**When Limit Reached:**
```
┌─────────────────────────────────┐
│  Tests Remaining                │
│  0 of 20                        │
│                                 │
│  ❌ Test limit reached!         │
│  Upgrade to 1-month plan for    │
│  unlimited tests.               │
└─────────────────────────────────┘
```

#### 3. **Button States**

- **Normal**: "Start Full Mixed Test (20 Questions)"
- **Limit Reached**: "Test Limit Reached" (disabled)
- **Loading**: "Generating Quiz..." (disabled)

## 📊 Test Counting Logic

### When Tests Are Counted

Tests are counted when they are **completed**, not when started. This prevents abuse:

1. User starts quiz → Counter NOT incremented
2. User completes quiz → Counter incremented
3. User abandons quiz → Counter NOT incremented

### Counting Period

- **7-Day Plan**: Counts tests since payment was created
- **1-Month Plan**: No counting (unlimited)
- **Free Users**: Uses localStorage-based freeTestGate

Example:
```
User buys 7-day plan on Jan 1
Payment.created_at = Jan 1, 2025

Tests completed on Jan 2: 5 tests
Tests completed on Jan 3: 10 tests
Tests completed on Jan 4: 5 tests

Total: 20 tests (limit reached)

Even if plan expires on Jan 8, user can't take more tests
because they've reached their 20-test limit.
```

## 🔄 Data Flow

### 1. Page Load (Paid User)
```
Quiz Page loads
↓
useEffect detects paid user
↓
Calls checkQuizLimits()
↓
GET /api/quiz/can-start
↓
Backend checks:
  - Get active payment
  - Count completed quizzes since payment created
  - Calculate remaining tests
↓
Frontend displays limit info
```

### 2. Starting a Quiz
```
User clicks "Start Quiz"
↓
Calls startQuizTracking()
↓
POST /api/quiz/start
↓
Backend checks:
  - Can user start? (limit not reached)
  - If yes: Create QuizAttempt (not counted yet)
  - If no: Return error
↓
Frontend either:
  - Starts quiz (limit OK)
  - Shows alert (limit reached)
```

### 3. Completing a Quiz
```
User finishes quiz
↓
POST /api/quiz/{id}/complete
↓
Backend:
  - Marks QuizAttempt as completed
  - This increments the count
↓
Frontend refreshes limit info on next page load
```

## 🎨 UI/UX Features

### Visual Indicators

1. **Progress Indicator**
   - Shows "15 of 20" remaining
   - Color-coded (blue → orange → red)

2. **Warning Messages**
   - ⚠️ At 5 or fewer remaining: "Running low on tests!"
   - ❌ At 0 remaining: "Test limit reached!"

3. **Disabled States**
   - All quiz start buttons disabled when limit = 0
   - Grayed out with "cursor-not-allowed"

### User Guidance

- **Low on tests**: Suggests upgrading to unlimited
- **Limit reached**: Clear message with upgrade CTA
- **Unlimited users**: Celebratory badge ✨

## 🔧 Configuration

### Changing Limits

Edit `backend/app/services/progress_service.py`:

```python
tier_limits = {
    "7days": 20,          # Change this number for 7-day plan
    "1month": 0,          # 0 = unlimited for 1-month plan
    "free": 0,            # Free users use freeTestGate instead
}
```

### Adding New Tiers

1. Add tier to `tier_limits` dict in `progress_service.py`
2. Add tier to pricing in `service.py`
3. Add tier display name in frontend UI

## 🧪 Testing

### Test Scenarios

**Scenario 1: New 7-Day User**
```
✅ Shows "20 of 20" remaining
✅ Can start quizzes
✅ After completing 5 quizzes: Shows "15 of 20"
✅ After completing 20 quizzes: Shows "0 of 20" + disabled buttons
```

**Scenario 2: 1-Month User (Unlimited)**
```
✅ Shows "Unlimited Tests" badge
✅ No test counter
✅ Can always start quizzes
✅ No limits enforced
```

**Scenario 3: 7-Day User Reaching Limit**
```
✅ At 18 completed: Shows "2 of 20" + warning
✅ At 20 completed: Shows "0 of 20" + error message
✅ Buttons disabled
✅ Can't bypass limit (backend enforces it)
```

**Scenario 4: Abandoned Quiz**
```
✅ User starts quiz (not counted)
✅ User leaves without completing
✅ Counter unchanged
✅ Can start another quiz
```

## 📈 Benefits

1. **Fair Usage**: 7-day users get exactly 20 tests as promised
2. **Upsell Opportunity**: Low test warnings encourage upgrades
3. **No Cheating**: Backend enforcement prevents bypassing
4. **Clear Communication**: Users always know their remaining tests
5. **Flexible**: Easy to change limits per tier

## 🚀 Future Enhancements

Potential improvements:
- Add test limit to account page
- Email notification when running low (5 remaining)
- Grace period for expired users (3 extra tests)
- Reset limits on plan renewal
- Admin ability to grant bonus tests

## 📝 Summary

### Complete User Type Breakdown

| User Type | Status | Test Limit | Duration | Tracking Method |
|-----------|--------|------------|----------|-----------------|
| **Not Logged In** | Guest | 3 tests | Forever | localStorage (freeTestGate) |
| **Free User** | Logged in, no payment | 3 tests | Forever | localStorage (freeTestGate) |
| **7days Plan** | Paid | **20 tests** | 7 days | Database (QuizAttempt) |
| **1month Plan** | Paid | **Unlimited** | 30 days | No tracking needed |

### Key Points

The test limit feature ensures:
- ✅ **7days Plan** users get exactly 20 tests for 7 days
- ✅ **1month Plan** users get unlimited tests for 30 days
- ✅ **Free/Guest** users get 3 tests via existing freeTestGate
- ✅ Clear visual feedback on remaining tests for paid users
- ✅ Backend enforcement prevents abuse
- ✅ Smooth UX with warnings and guidance
- ✅ Easy to configure and extend
