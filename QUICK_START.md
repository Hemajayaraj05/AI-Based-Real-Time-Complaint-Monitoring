# ⚡ Quick Start - Verify & Test (5 Minutes)

## 🚀 Step 1: Pre-flight Check

- [ ] Backend running? (`npm run dev` in Backend folder)
- [ ] Python NLP running? (`python app.py` in Backend/python_nlp folder)
- [ ] Frontend running? (`npm run dev` in Frontend folder)
- [ ] All three are running on: Backend (4000), NLP (5000), Frontend (5173)

## 📋 Step 2: Database Setup

**Run ONCE to create test users:**

```sql
-- Admin user (receives unassigned complaints)
INSERT INTO users (id, name, email, role) 
VALUES (gen_random_uuid(), 'System Admin', 'admin@college.edu', 'admin');

-- Specialists
INSERT INTO users (id, name, email, role) 
VALUES 
  (gen_random_uuid(), 'Mr. Electrician', 'elec@college.edu', 'electrician'),
  (gen_random_uuid(), 'Ms. Cleanliness', 'clean@college.edu', 'cleanliness_manager'),
  (gen_random_uuid(), 'Mr. Hostel Manager', 'hostel@college.edu', 'hostel_manager'),
  (gen_random_uuid(), 'Ms. Librarian', 'lib@college.edu', 'librarian'),
  (gen_random_uuid(), 'Mr. Cafeteria', 'cafe@college.edu', 'cafeteria_manager');

-- Student user (for testing)
INSERT INTO users (id, name, email, role, department) 
VALUES (gen_random_uuid(), 'Test Student', 'student@college.edu', 'student', 'CSE');
```

## 🧪 Step 3: Test Complaints

### Test 1: AC Leakage → Electrician
```
Login as: student@college.edu

Raise Complaint:
  Title: "AC in room 201 leaking water"
  Description: "Air conditioner dripping water"

Expected Result:
  ✅ Division: electricity
  ✅ Assigned to: electrician@college.edu
```

### Test 2: Cleanliness → Cleanliness Manager
```
Title: "Dirty washroom"
Description: "Toilet very dirty and unhygienic"

Expected Result:
  ✅ Division: cleanliness
  ✅ Assigned to: clean@college.edu
```

### Test 3: Water → Admin
```
Title: "No water supply"
Description: "Taps not working in dormitory"

Expected Result:
  ✅ Division: water
  ✅ Assigned to: admin@college.edu
```

### Test 4: Infrastructure → Admin
```
Title: "Crack in ceiling"
Description: "Big crack in classroom ceiling"

Expected Result:
  ✅ Division: infrastructure
  ✅ Assigned to: admin@college.edu
```

### Test 5: Hostel + Food → Hostel Manager
```
Title: "Bad food in hostel mess"
Description: "Food quality poor in hostel dining"

Expected Result:
  ✅ Division: hostel
  ✅ Assigned to: hostel@college.edu
```

## ✅ Verification Checklist

After creating each complaint:

- [ ] Check "My Complaints" dashboard → Division correct?
- [ ] Switch to specialist account → Check "Assigned to Me" → Complaint there?
- [ ] Check backend logs → See "✓ Found [role]" messages?
- [ ] Database → Query complaints table → assigned_to filled?

```sql
-- Verify assignment in database
SELECT id, title, division, assigned_to FROM complaints 
ORDER BY created_at DESC LIMIT 5;

-- Should show assigned_to is NOT NULL
```

## 🔍 Debug Commands

**If something's wrong:**

### Check Backend Connection
```bash
# Terminal - backend folder
curl http://localhost:4000/api/health
# Should return: OK or similar
```

### Check NLP Service
```bash
# Check if running
curl -X POST http://localhost:5000/api/categorize \
  -H "Content-Type: application/json" \
  -d '{"title":"AC leaking water","description":"dripping"}'

# Should return: {"priority":"medium","division":"electricity"}
```

### Check Database Users
```sql
SELECT id, name, email, role FROM users LIMIT 10;
-- Verify all test users exist
```

### Check Assigned Complaints
```sql
SELECT 
  c.title, 
  c.division, 
  u.name as assigned_to_name,
  c.assigned_to
FROM complaints c
LEFT JOIN users u ON c.assigned_to = u.id
ORDER BY c.created_at DESC
LIMIT 10;
```

## 📊 What You Should See

### In Backend Logs:
```
✓ Found electrician (elec@college.edu) to handle "electricity" complaint
✓ Found admin (admin@college.edu) to handle "water" complaint  
🔄 Context-aware routing: food complaint mentions hostel, reassigning to hostel manager
Categorization Debug: title='AC leaking...', division='electricity', priority='medium'
```

### In Frontend:
- **Student Dashboard** → My Complaints section shows all their complaints
- **Specialist Dashboard** → "Assigned to Me" shows only their division complaints
- **Admin Dashboard** → Shows all unassigned/admin-level complaints

## 🎯 Success Criteria

You'll know it's working when:

- ✅ AC leakage → Goes to electrician (NOT water manager)
- ✅ Water shortage → Goes to admin
- ✅ Dirty washroom → Goes to cleanliness manager
- ✅ Every complaint gets assigned (not left blank)
- ✅ Specialists see only relevant complaints
- ✅ Admin gets fallback complaints (water, transport, infrastructure, other)

## 💡 Pro Tips

1. **Check logs while testing**:
   ```bash
   # In backend terminal, you'll see real-time categorization
   npm run dev
   # Watch for debug messages when you create complaints
   ```

2. **Test with different wordings**:
   - "AC not working" → electricity
   - "AC dripping" → electricity
   - "Water from AC" → electricity
   - "Water leaking" → water
   - My system handles variations!

3. **If assignments are wrong**:
   - Check backend logs for categorization debug message
   - Verify user roles in database (exact spelling matters)
   - Restart backend to reload code changes

4. **Monitor performance**:
   - Complaint creation should take <500ms
   - If slower, check:
     - NLP service response time
     - Database query performance

## 📞 Need Help?

See these documents for more info:
- [COMPLAINT_ASSIGNMENT_SYSTEM.md](COMPLAINT_ASSIGNMENT_SYSTEM.md) - Complete system guide
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Full testing walkthrough
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details

---

**Expected time: 5 minutes to verify, 15 minutes to fully test**

Happy testing! 🎉
