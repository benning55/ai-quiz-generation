# 🔧 Admin Panel Debug Guide

## Issues Fixed

I've identified and fixed several API endpoint issues:

### ✅ **Fixed Issues:**

1. **Missing FLASHCARDS endpoint** in API config
2. **Hardcoded API URLs** instead of using environment variables
3. **Inconsistent endpoint URLs** between components
4. **Missing error logging** for failed API calls

### 🔧 **Changes Made:**

#### **1. Updated API Configuration**
```typescript
// frontend/src/config/api.ts - ADDED missing endpoints
export const API_ENDPOINTS = {
  GENERATE_QUIZ: `${API_URL}/api/generate-quiz-from-flashcards/`,
  IMPORT_FLASHCARDS: `${API_URL}/api/import-flashcards-json/`,
  FLASHCARDS: `${API_URL}/api/flashcards/`,        // ✅ ADDED
  CHAPTERS: `${API_URL}/api/chapters/`,            // ✅ ADDED
  USERS: `${API_URL}/api/users/`,
  USER: `${API_URL}/api/user/`,
  CHECKOUT: `${API_URL}/api/create-checkout-session/`,
}
```

#### **2. Fixed FlashcardManager Component**
- ✅ Uses `API_ENDPOINTS.CHAPTERS` instead of hardcoded `/api/chapters/`
- ✅ Uses `API_ENDPOINTS.FLASHCARDS` instead of hardcoded URLs
- ✅ Added console logging for debugging
- ✅ Added error status logging

#### **3. Fixed BulkImporter Component**
- ✅ Uses environment variable for API URL
- ✅ Consistent endpoint usage

#### **4. Fixed Admin Page**
- ✅ Uses environment variable for chapters endpoint
- ✅ Added error logging

## 🧪 **Testing Steps**

### **1. Test Backend API Directly**

```bash
# Run the test script
cd /home/benning/Desktop/ai-quiz-generation
python test_admin_api.py
```

Expected output:
```
🚀 Testing Admin API Endpoints
==================================================
🧪 Testing chapters endpoint...
Status: 200
✅ Found 10 chapters
  - 1. Rights and Responsibilities
  - 2. Who We Are
  - 3. Canada History

🧪 Testing flashcards endpoint...
Status: 200
✅ Found 0 flashcards

🧪 Testing flashcard creation...
Status: 200
✅ Created flashcard with ID: 1

🧪 Testing chapter statistics...
Status: 200
✅ Total chapters: 10
  - Rights and Responsibilities: 0 flashcards
  - Who We Are: 0 flashcards
  - Canada History: 0 flashcards

🧪 Testing flashcard deletion (ID: 1)...
Status: 200
✅ Flashcard deleted successfully
```

### **2. Check Browser Console**

Open your browser's developer tools (F12) and go to the **Console** tab. You should see:

```javascript
// When loading the admin page
Loaded flashcards: []
Loaded chapters: [
  {id: 1, title: "Rights and Responsibilities", order: 1, ...},
  {id: 2, title: "Who We Are", order: 2, ...},
  ...
]
```

### **3. Check Network Tab**

In the **Network** tab, you should see successful requests:

```
✅ GET http://localhost/api/chapters/     → 200 OK
✅ GET http://localhost/api/flashcards/   → 200 OK
```

## 🚨 **Troubleshooting**

### **If Chapters Don't Load:**

1. **Check Backend Logs:**
   ```bash
   docker compose logs backend
   ```

2. **Verify Chapters Exist:**
   ```bash
   curl http://localhost/api/chapters/
   ```

3. **Check Database:**
   ```bash
   docker compose exec backend bash
   cd /app
   python test_chapters.py
   ```

### **If Flashcards Don't Load:**

1. **Check API Response:**
   ```bash
   curl http://localhost/api/flashcards/
   ```

2. **Check Database Connection:**
   ```bash
   docker compose exec backend bash
   cd /app
   python -c "
   from app.db.database import SessionLocal
   from app.db import models
   db = SessionLocal()
   count = db.query(models.Flashcard).count()
   print(f'Flashcards in DB: {count}')
   db.close()
   "
   ```

### **If Chapter Dropdown is Empty:**

1. **Check Console for Errors:**
   - Open browser developer tools
   - Look for JavaScript errors
   - Check if chapters array is populated

2. **Verify API Response:**
   ```javascript
   // In browser console
   fetch('/api/chapters/')
     .then(r => r.json())
     .then(data => console.log('Chapters:', data))
   ```

### **If 404 Errors Occur:**

1. **Check Caddy Configuration:**
   ```bash
   docker compose logs caddy
   ```

2. **Verify API Routes:**
   ```bash
   # Should return API documentation
   curl http://localhost/api/docs
   ```

3. **Check Backend Routes:**
   ```bash
   docker compose exec backend bash
   cd /app
   python -c "
   from app.main import app
   for route in app.routes:
       if hasattr(route, 'path'):
           print(route.path)
   "
   ```

## 🔄 **Quick Fixes**

### **1. Restart Everything:**
```bash
docker compose down
docker compose up --build
```

### **2. Check Environment Variables:**
```bash
# In frontend container
docker compose exec frontend bash
echo $NEXT_PUBLIC_API_URL

# Should output: http://localhost (or your domain)
```

### **3. Clear Browser Cache:**
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Or open in incognito/private mode

### **4. Check Database Migration:**
```bash
docker compose exec backend bash
cd /app
alembic current
# Should show current migration
```

## 📊 **Expected Admin Panel Behavior**

### **Dashboard Tab:**
- ✅ Shows user statistics
- ✅ Displays admin info card

### **Flashcards Tab:**
- ✅ Shows statistics cards (Total, With Chapters, Unassigned, Filtered)
- ✅ Displays empty table if no flashcards
- ✅ Chapter dropdown populated with 10 chapters
- ✅ "Add Flashcard" button opens form dialog

### **Bulk Import Tab:**
- ✅ Shows drag & drop area
- ✅ Template download buttons work
- ✅ File upload processes correctly

## 🎯 **Next Steps After Fixing**

1. **Add Sample Flashcards:**
   ```bash
   # Use the bulk import or API test script
   python test_admin_api.py
   ```

2. **Test Chapter Assignment:**
   - Create a flashcard
   - Assign it to a chapter
   - Verify it appears in chapter filter

3. **Test Bulk Import:**
   - Download CSV template
   - Add a few questions
   - Upload and verify import

## 📞 **Still Having Issues?**

If the admin panel still doesn't work after these fixes:

1. **Check the browser console** for JavaScript errors
2. **Check the network tab** for failed API requests
3. **Check backend logs** for server errors
4. **Run the test script** to verify API endpoints
5. **Verify database has chapters** using the test script

The most common issue is usually:
- ❌ Backend not running
- ❌ Database not initialized with chapters
- ❌ CORS issues (should be fixed by Caddy)
- ❌ Environment variables not set correctly

With these fixes, your admin panel should now work correctly! 🎉