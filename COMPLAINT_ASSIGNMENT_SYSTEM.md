# Complaint Assignment System - Complete Guide

## Overview

This document explains how complaints are automatically categorized and assigned to the correct team members in the Complaint Monitoring System.

## 1. Frontend Roles & Departments

### Available User Roles

```
- admin              → System administrator (gets all unassigned complaints)
- student           → Raises complaints
- faculty           → Can assist with resolution
- electrician       → Handles electricity-related complaints
- cleanliness_manager → Handles cleanliness/hygiene complaints
- hostel_manager    → Handles hostel/accommodation complaints
- librarian         → Handles library-related complaints
- cafeteria_manager → Handles food/dining complaints
- exam_coordinator  → Can handle exam-related issues
- security          → Can handle security-related issues
```

### Departments

- CSE (Computer Science)
- ECE (Electronics)
- EEE (Electrical)
- MECH (Mechanical)
- CIVIL (Civil)
- IT (Information Technology)
- Others

## 2. Complaint Division Categories

Complaints are automatically categorized into these divisions:

```
- electricity       → Electrician
- cleanliness       → Cleanliness Manager
- hostel            → Hostel Manager
- library           → Librarian
- food              → Cafeteria Manager
- transport         → Admin (no dedicated specialist role yet)
- water             → Admin (no dedicated specialist role yet)
- infrastructure    → Admin (no dedicated specialist role yet)
- other             → Admin (no specialized match found)
```

## 3. Role-to-Division Mapping

**Current Specialist Mappings:**

| Role | Division |
|------|----------|
| electrician | electricity |
| cleanliness_manager | cleanliness |
| hostel_manager | hostel |
| librarian | library |
| cafeteria_manager | food |

**Unassigned Divisions (→ Admin):**
- transport
- water
- infrastructure
- other

## 4. How Complaints Get Assigned

### Flow Diagram

```
User raises complaint
        ↓
NLP Model categorizes (division + priority)
        ↓
System finds appropriate assignee:
    ├─ If specialist exists → Assign to specialist
    ├─ If no specialist → Assign to admin
    └─ If errors occur → Stay unassigned
        ↓
Complaint appears in assignee's "Assigned to Me" dashboard
```

### Assignment Logic

1. **Specialist First** - Check if a specialist exists for the division
   - Example: Water leakage from AC → electricity division → assign to electrician

2. **Admin Fallback** - If no specialist found, assign to admin
   - Example: Water shortage → water division → no specialist → assign to admin
   - Example: Infrastructure damage → infrastructure division → no specialist → assign to admin

3. **Context-Aware Matching** - Special cases
   - Food in hostel → assigned to hostel_manager (not cafeteria_manager)
   - AC leakage → electricity (not water)

## 5. NLP Categorization - Improved Keywords

### Electricity Keywords
Recognizes: electricity, power, light, bulb, fan, **ac**, air condition, socket, plug, switch, outage, blackout, voltage, wiring, electrical, **generator**, circuit, breaker, wire, shortcircuit

**Key Improvement**: "AC/Air Conditioner leakage" now correctly routes to **ELECTRICITY** (not water)

### Water Keywords
Recognizes: water tank, water supply, drinking water, tap, pipe, water pressure, water shortage, water system, purifier, filter

**Note**: Pure "water" complaints go to admin (no dedicated water maintenance role yet)

### Cleanliness Keywords
Recognizes: clean, dirty, garbage, trash, waste, dustbin, sweep, sanitation, hygiene, mess, smell, stink, toilet, washroom

### Food Keywords
Recognizes: food, canteen, cafeteria, meal, breakfast, lunch, dinner, quality, taste, unhygienic, cook, menu

### Hostel Keywords
Recognizes: hostel, room, bed, mattress, furniture, cupboard, accommodation, dorm, warden, dining

### Transport Keywords
Recognizes: transport, bus, vehicle, driver, route, timing, schedule, shuttle, pick, drop, parking, commute

### Library Keywords
Recognizes: library, book, journal, reading, study, librarian, borrowing, return, silence, computer, internet

### Infrastructure Keywords
Recognizes: building, infrastructure, construction, repair, maintenance, wall, ceiling, floor, door, window, paint, crack, roof, foundation

## 6. Priority Levels

### High Priority
- Keywords: harassment, ragging, bullying, assault, abuse, threat, violence, urgent, critical, severe, emergency, dangerous, sexual, discrimination, safety risk, health risk

### Medium Priority (Default)
- Keywords: delay, problem, broken, issue, not working, faulty, complaint, unhappy, uncomfortable, poor, bad condition

### Low Priority
- Keywords: suggestion, minor, small, feedback, improvement, enhancement, could be better, request

## 7. Example Scenarios

### Scenario 1: Water Leakage from AC ✅ FIXED

**User complains**: "Water leakage from AC in room 301"

**Old behavior (Wrong)**: 
- Division: water → No specialist → Not assigned properly ❌

**New behavior (Correct)**:
- NLP detects: "AC" + "leakage" in text
- Context-aware scoring: Electricity gets bonus points
- Division: **electricity** ✅
- Assigned to: **Electrician** ✅

### Scenario 2: Hostel Food Issues

**User complains**: "Food quality in hostel mess is very poor"

**Behavior**:
- Text mentions both "hostel" AND "food"
- System recognizes: food served IN hostel
- Division: **hostel** ✅
- Assigned to: **Hostel Manager** ✅ (not cafeteria manager)

### Scenario 3: Water Shortage

**User complains**: "No water supply in the dormitory"

**Behavior**:
- Division: **water** 
- No specialist role for water division
- Assigned to: **Admin** ✅

### Scenario 4: Infrastructure Issues

**User complains**: "Crack in wall of classroom A102"

**Behavior**:
- Division: **infrastructure**
- No specialist role for infrastructure
- Assigned to: **Admin** ✅

### Scenario 5: Lab Equipment Failure

**User complains**: "Lab computer not working and light bulbs burnt"

**Behavior**:
- Text mentions: "light bulbs" (electricity keyword)
- Division: **electricity** ✅
- Assigned to: **Electrician** ✅

## 8. Database Schema - Complaint Structure

```typescript
interface ComplaintDB {
  id: string;                    // Unique ID
  title: string;                 // Short title
  description: string;           // Full description
  division: ComplaintDivision;   // Auto-categorized division
  status: ComplaintStatus;       // pending | in_progress | resolved
  priority: ComplaintPriority;   // low | medium | high
  raised_by: string;            // User ID who raised it
  assigned_to?: string | null;  // User ID who handles it (can be null)
  cluster_id?: string;          // Groups similar complaints
  created_at: string;           // Timestamp
  updated_at: string;           // Last update
  resolved_at?: string;         // When resolved
}
```

## 9. Testing the System

### To verify assignment is working:

1. **Create a complaint as Student**:
   - Title: "AC in room 201 is leaking water"
   - Description: "The air conditioning unit is leaking water constantly"
   - Expected: Should be categorized as **electricity** and assigned to **electrician**

2. **Create a complaint about water**:
   - Title: "No water supply"
   - Description: "Water not flowing from taps in the building"
   - Expected: Should be categorized as **water** and assigned to **admin**

3. **Create a cleanliness complaint**:
   - Title: "Dirty washroom"
   - Description: "The toilet is very dirty and unhygienic"
   - Expected: Should be categorized as **cleanliness** and assigned to **cleanliness_manager**

### To debug assignments:
- Use the `/api/auth/debug` endpoint to view your role and assigned complaints
- Check backend logs for assignment decision-making messages (🔄, ✓, ⚠)

## 10. Future Improvements

### To add new specialist roles:

**For example: Adding a "Water Maintenance Specialist"**

1. Add to frontend SignUp.tsx:
```tsx
<option value="water_maintenance">Water Maintenance</option>
```

2. Add to AuthContext.tsx roles:
```typescript
export type UserRole = "..." | "water_maintenance";
```

3. Add to complaint service role mapping:
```typescript
const roleDivisionMap: Record<string, string> = {
  ...
  "water_maintenance": "water",
  ...
};
```

4. Database will automatically recognize and assign water complaints to this specialist

### To improve NLP accuracy:

1. Add more context-aware keywords in [Backend/python_nlp/app.py](Backend/python_nlp/app.py)
2. Collect feedback on misclassified complaints
3. Add weighted scoring for compound issues
4. Consider implementing ML-based classification (instead of keyword matching)

## 11. Admin Dashboard - Managing Unassigned Complaints

Admins should see:
- All "other" category complaints
- All transport complaints
- All water/infrastructure complaints
- Any unassigned complaints (assigned_to = null)

Monitor the `/api/complaints/assigned-to-me` endpoint to see all complaints needing attention.

## 12. Troubleshooting

### Issue: Complaint not assigned to anyone

**Possible causes**:
1. Division categorized as "other" → expected (assign to admin)
2. No specialist user found for division → assign to admin
3. Database error during assignment → check backend logs
4. Admin user doesn't exist → create admin account

**Solution**: Create an admin account if one doesn't exist

### Issue: Wrong division categorization

**Solution**: Check:
1. Keywords in [Backend/python_nlp/app.py](Backend/python_nlp/app.py)
2. Context-aware scoring logic
3. Backend logs show: "Categorization Debug: ..." messages

### Issue: Complaint assigned to wrong person

**Solution**:
1. Verify role-to-division mapping in [Backend/src/services/complaintService.ts](Backend/src/services/complaintService.ts)
2. Check user role in database
3. Check if specialist user exists for that division

---

**Last Updated**: February 2026

For questions or improvements, refer to the complaint assignment logic in the backend service files.
