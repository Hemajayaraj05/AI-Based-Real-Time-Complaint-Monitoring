# Quick Setup Guide

## ⚡ Fast Track Setup (5 Minutes)

### Step 1: Database Setup (2 minutes)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to SQL Editor and run:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'division_head')),
  division TEXT CHECK (division IN ('cleanliness', 'water', 'electricity', 'hostel', 'transport', 'library', 'food', 'infrastructure', 'other')),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints table
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  division TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  raised_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  cluster_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX idx_complaints_raised_by ON complaints(raised_by);
CREATE INDEX idx_complaints_division ON complaints(division);
CREATE INDEX idx_complaints_cluster_id ON complaints(cluster_id);
```

3. Copy your Project URL and anon key from Settings > API

### Step 2: Backend Setup (2 minutes)

```bash
# Terminal 1 - Backend
cd Backend
npm install
```

Create `Backend/.env`:
```env
SUPABASE_URL=your_project_url_here
SUPABASE_KEY=your_anon_key_here
JWT_SECRET=your_random_secret_here
PY_NLP_URL=http://localhost:5000
```

```bash
npm run dev
```

### Step 3: Python NLP Service (1 minute)

```bash
# Terminal 2 - Python NLP
cd Backend/python_nlp
pip install flask sentence-transformers scikit-learn numpy
python app.py
```

### Step 4: Frontend Setup (1 minute)

```bash
# Terminal 3 - Frontend
cd Frontend
npm install
npm run dev
```

### Step 5: Test! 🎉

1. Open http://localhost:5173
2. Sign up as a student
3. Raise a complaint like: "The light in Room 301 is not working"
4. Watch AI categorize it to "electricity" division!

## 🎯 Test Scenarios

### Scenario 1: Test AI Categorization
Create complaints with these descriptions:

```
"Water is not coming in hostel bathroom" 
→ Division: water, Priority: high

"The classroom is very dirty and needs cleaning"
→ Division: cleanliness, Priority: medium

"Urgent: No electricity in entire building"
→ Division: electricity, Priority: high
```

### Scenario 2: Test Clustering
Create 2-3 similar complaints:

```
1. "No water supply in hostel Block A"
2. "Water not coming in hostel since morning"
3. "Hostel water supply is disrupted"
```

These should get grouped together with a common cluster_id!

### Scenario 3: Test Role-Based Access

1. **Create Admin user:**
   - Sign up with role: "admin"
   - Login and access dashboard
   - Should see division-wise chart and all student names

2. **Create Division Head:**
   - Sign up with role: "division_head", division: "cleanliness"
   - Should only see cleanliness complaints

3. **Create Student:**
   - Sign up with role: "student"
   - Raise complaints
   - Should NOT see other students' names

## 🐛 Common Issues

### Issue: "Cannot connect to database"
**Fix:** Check your `.env` file has correct Supabase URL and key

### Issue: "Python NLP service not working"
**Fix:** 
```bash
pip install flask sentence-transformers scikit-learn numpy
python app.py
```

### Issue: "AI not categorizing correctly"
**Fix:** Make sure Python NLP service is running on port 5000

### Issue: "CORS error in browser"
**Fix:** Backend might not be running. Check terminal for errors.

## 📝 Next Steps

1. ✅ Create test users (admin, division head, student)
2. ✅ Raise multiple complaints
3. ✅ Test status updates (pending → in_progress → resolved)
4. ✅ View analytics dashboard
5. ✅ Test complaint clustering

## 🎓 Sample Test Data

Use these complaint descriptions for testing:

### High Priority - Urgent Issues
```
"Urgent: Complete power outage in entire hostel building"
"Emergency: Water contamination reported in cafeteria"
"Critical: Fire safety equipment not working in library"
```

### Medium Priority - Regular Issues
```
"Classroom projector is not working properly"
"Hostel room door lock is broken"
"Library AC temperature too high"
```

### Low Priority - Minor Issues
```
"Suggestion: Add more books to library collection"
"Request: Improve cafeteria menu variety"
"Feedback: Extended library hours on weekends"
```

## 🚀 Production Deployment

For production, consider:

1. **Environment Variables:** Use proper secrets management
2. **HTTPS:** Enable SSL certificates
3. **Rate Limiting:** Add rate limiting to API
4. **Monitoring:** Setup error tracking (Sentry, etc.)
5. **Backups:** Regular database backups
6. **Scaling:** Consider horizontal scaling for high load

## 📞 Support

If you encounter issues:
1. Check terminal logs for errors
2. Verify all services are running
3. Check browser console for frontend errors
4. Ensure database tables exist
5. Open an issue on GitHub with error details

Happy coding! 🎉
