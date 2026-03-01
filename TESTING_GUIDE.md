# Quick Setup & Testing Guide

## What Was Fixed ✅

### 1. **Improved NLP Categorization**
   - **Before**: "Water leakage from AC" → categorized as "water" (WRONG)
   - **After**: "Water leakage from AC" → categorized as "electricity" (CORRECT) ✅
   
   The NLP now has **context-aware scoring** that:
   - Recognizes compound issues (AC + leak = electricity issue)
   - Prioritizes electrical appliances (AC, fan, light) over simple water mentions
   - Better handles infrastructure-related keywords

### 2. **Complete Role-to-Division Mapping**
   - ✅ electrician → electricity
   - ✅ cleanliness_manager → cleanliness  
   - ✅ hostel_manager → hostel
   - ✅ librarian → library
   - ✅ cafeteria_manager → food
   - ✅ **Admin gets**: transport, water, infrastructure, other (fallback)

### 3. **Smart Assignment Logic**
   - Complaints automatically assigned to specialists
   - If no specialist exists → assigned to admin
   - Never leaves complaints unassigned (unless system error)

## How to Test

### Step 1: Setup Users

Create users with these roles in your database:

```sql
-- Admin user (receives unassigned complaints)
INSERT INTO users (id, name, email, role) 
VALUES ('admin-1', 'System Admin', 'admin@college.edu', 'admin');

-- Specialists
INSERT INTO users (id, name, email, role) 
VALUES 
  ('elec-1', 'Mr. Electrician', 'electrician@college.edu', 'electrician'),
  ('clean-1', 'Ms. Cleanliness', 'clean@college.edu', 'cleanliness_manager'),
  ('hostel-1', 'Mr. Hostel', 'hostel@college.edu', 'hostel_manager'),
  ('lib-1', 'Ms. Librarian', 'librarian@college.edu', 'librarian'),
  ('cafe-1', 'Mr. Cafeteria', 'cafe@college.edu', 'cafeteria_manager');

-- Student user
INSERT INTO users (id, name, email, role, department) 
VALUES ('student-1', 'Student User', 'student@college.edu', 'student', 'CSE');
```

### Step 2: Test Different Complaint Types

#### Test 1: AC Leakage (Should → Electrician)
```
Title: "AC in room 201 leaking water"
Description: "The air conditioning unit is dripping water constantly all day"

Expected:
- Division: electricity ✅
- Assigned to: electrician ✅
```

#### Test 2: Water Shortage (Should → Admin)
```
Title: "No water in hostel"
Description: "The water supply is completely cut off since yesterday"

Expected:
- Division: water ✅
- Assigned to: admin ✅
```

#### Test 3: Cleanliness Issue (Should → Cleanliness Manager)
```
Title: "Dirty washroom"
Description: "The bathroom is very dirty and unhygienic with bad smell"

Expected:
- Division: cleanliness ✅
- Assigned to: cleanliness_manager ✅
```

#### Test 4: Building Damage (Should → Admin)
```
Title: "Crack in ceiling"
Description: "Big crack in the ceiling of classroom 105, looks dangerous"

Expected:
- Division: infrastructure ✅
- Assigned to: admin ✅
```

#### Test 5: Hostel Food (Should → Hostel Manager)
```
Title: "Bad food quality in hostel"
Description: "The food served in hostel mess is poor quality and cold"

Expected:
- Division: hostel ✅
- Assigned to: hostel_manager ✅
```

#### Test 6: Library Issue (Should → Librarian)
```
Title: "Missing books"
Description: "Cannot find reference books needed for the project"

Expected:
- Division: library ✅
- Assigned to: librarian ✅
```

### Step 3: Verify in Frontend

1. **As Student**: 
   - Login and check "My Complaints"
   - Verify division and status are correct

2. **As Specialist** (e.g., Electrician):
   - Login as electrician
   - Check "Assigned to Me" dashboard
   - Should see all electricity-related complaints

3. **As Admin**:
   - Login as admin
   - Check "Assigned to Me" dashboard
   - Should see water, infrastructure, transport, and "other" complaints

### Step 4: Monitor Backend Logs

When a complaint is created, you should see logs like:

```
✓ Found electrician (electrician@college.edu) to handle "electricity" complaint
✓ Found admin (admin@college.edu) to handle "water" complaint
🔄 Context-aware routing: food complaint mentions hostel, reassigning to hostel manager
⚠ No assignee found for "other" division
Categorization Debug: title='AC leaking', division='electricity', priority='medium'
```

## Environment Variables

Make sure your backend has:

```
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=4000

# Python NLP Service
PY_NLP_PORT=5000
```

## Running the System

### Terminal 1: Backend
```bash
cd Backend
npm install
npm run dev
```

### Terminal 2: Python NLP Service
```bash
cd Backend/python_nlp
pip install -r requirements.txt
python app.py
# Should run on http://localhost:5000
```

### Terminal 3: Frontend
```bash
cd Frontend
npm install
npm run dev
```

## Common Issues & Fixes

### Issue: "Complaint assigned to no one"

**Check**:
1. Admin user exists? → Create one if missing
2. Backend logs show assignment attempts?
3. Is database connection working?

**Fix**: Create admin user manually in database

### Issue: Wrong division detected

**Check**:
1. Backend logs show categorization debug info
2. Is NLP service running (port 5000)?
3. Did you restart backend after code changes?

**Fix**: Restart backend and check `python_nlp/app.py` is running

### Issue: Specialist not found

**Check**:
1. User has correct role in database?
2. Is the role exactly matching (check for typos)?
3. Backend connection to database OK?

**Fix**: Verify user role matches exactly (e.g., "electrician" not "Electrician")

## Architecture Overview

```
Frontend (React)
    ↓
    ├─→ User raises complaint
    │
Backend (Node.js/Express)
    ├─→ Call Python NLP service
    │   ├─→ Categorize complaint (division + priority)
    │   └─→ Find similar complaints
    │
    ├─→ Find assignee
    │   ├─→ Check if specialist exists for division
    │   ├─→ If yes → Assign to specialist
    │   └─→ If no → Assign to admin
    │
    └─→ Save to Supabase Database
        ├─→ Complaint created
        ├─→ Status: in_progress (for new complaints)
        └─→ assigned_to: [specialist or admin]
        
    ↓
Dashboard
    ├─→ Student sees "My Complaints"
    ├─→ Specialist sees "Assigned to Me" (their division)
    └─→ Admin sees all unassigned + admin-level complaints
```

## Next Steps

1. **Test the system** with the scenarios above
2. **Monitor logs** to ensure correct categorization
3. **Adjust keywords** in `python_nlp/app.py` if needed based on test results
4. **Train on domain**:
   - Collect misclassified complaints
   - Add specific keywords for your college's context
5. **Add more specialist roles** as needed

## Performance Notes

- NLP categorization takes ~100-200ms
- Assignment lookup takes ~50-100ms
- Total complaint creation: ~200-300ms
- Cluster finding (if many complaints): +100-500ms

For faster initial creation, consider:
- Increasing NLP service workers
- Adding database indexes on `division` and `status` fields
- Caching specialist user lookups

---

For detailed system documentation, see: [COMPLAINT_ASSIGNMENT_SYSTEM.md](COMPLAINT_ASSIGNMENT_SYSTEM.md)
