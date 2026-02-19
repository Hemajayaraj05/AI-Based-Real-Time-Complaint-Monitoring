# AI-Based Real-Time Complaint Monitoring System

A comprehensive complaint management system with AI-powered categorization, intelligent clustering, and role-based access control.

## 🌟 Features

### Core Functionality

#### 1. **Smart Complaint Submission**
- Students can raise complaints by providing only a **title** and **description**
- AI automatically categorizes complaints into divisions:
  - Cleanliness
  - Water Supply
  - Electricity
  - Hostel
  - Transport
  - Library
  - Food/Cafeteria
  - Infrastructure
  - Other
- AI assigns priority levels: **Low**, **Medium**, or **High**
- Complaints are automatically routed to appropriate division heads

#### 2. **Intelligent Complaint Clustering**
- NLP-based similarity detection groups related complaints
- Similar complaints within 30 days are automatically clustered
- Each cluster assigned a unique cluster_id
- Visual grouping in the frontend shows related issues

#### 3. **Role-Based Access Control**

**Three User Roles:**

##### 🎓 **Student**
- Can raise complaints
- Can view all complaints (but not who raised them)
- Cannot see complaint ownership details
- No access to analytics dashboard

##### 👨‍💼 **Admin**
- Full visibility of all complaints
- Can see who raised each complaint
- Access to complete analytics dashboard
- Can see all divisions
- Can manage users

##### 🏢 **Division Head**
- Can view complaints only for their assigned division
- Can see who raised complaints in their division
- Can update complaint status
- Access to division-specific analytics

### 4. **Complaint Status Management**
Three status levels:
- **Pending** - Newly created complaint
- **In Progress** - Being actively worked on
- **Resolved** - Issue has been fixed

### 5. **Analytics & Reporting**

#### Dashboard Statistics (All Roles)
- Total complaints raised
- Total resolved
- Total pending
- Total in progress
- Resolution rate percentage

#### Monthly Trends Chart
- Complaints raised per month
- Complaints resolved per month
- Includes 3-month predictions using historical data
- Available to all authenticated users

#### Division-wise Distribution (Admin Only)
- Bar chart showing complaints per division
- Helps identify problematic areas

#### Priority Distribution
- Pie chart showing high/medium/low priority breakdown
- Statistics summary for each priority level
- Available to all authenticated users

## 🏗️ Architecture

### Backend (Node.js + TypeScript + Express)

```
Backend/
├── src/
│   ├── config/
│   │   └── supabaseClient.ts          # Database connection
│   ├── controllers/
│   │   ├── authController.ts          # Authentication logic
│   │   └── complaintController.ts     # Complaint CRUD + Analytics
│   ├── middleware/
│   │   ├── authMiddleware.ts          # JWT authentication
│   │   └── roleMiddleware.ts          # Role-based authorization
│   ├── models/
│   │   ├── userModel.ts               # User types & interfaces
│   │   └── complaintModel.ts          # Complaint types & interfaces
│   ├── routes/
│   │   ├── authRoutes.ts              # Auth endpoints
│   │   └── complaintRoutes.ts         # Complaint endpoints
│   └── services/
│       ├── authService.ts             # JWT & password hashing
│       ├── complaintService.ts        # Business logic
│       └── nlpService.ts              # AI categorization wrapper
└── python_nlp/
    └── app.py                         # Python NLP microservice
```

### Frontend (React + TypeScript + Vite)

```
Frontend/
└── src/
    ├── components/
    │   └── dashboard/
    │       ├── ComplaintAnalysisChart.tsx       # Monthly trends
    │       ├── DashboardStatsOverview.tsx       # Stats cards
    │       ├── DivisionWiseChart.tsx           # Division distribution
    │       └── PriorityDistributionChart.tsx   # Priority breakdown
    ├── context/
    │   └── AuthContext.tsx                     # Global auth state
    └── pages/
        ├── auth/
        │   ├── SignIn.tsx
        │   └── SignUp.tsx
        └── dashboard/
            ├── DashboardHome.tsx               # Main dashboard
            ├── RaiseComplaint.tsx              # Complaint form
            ├── MyComplaints.tsx                # User's complaints
            ├── OverAllComplaints.tsx           # All complaints view
            └── AssignedIssues.tsx              # Division head view
```

## 🗄️ Database Schema

### Users Table
```typescript
{
  id: string (UUID)
  name: string
  email: string
  department?: string
  role: "student" | "admin" | "division_head"
  division?: "cleanliness" | "water" | "electricity" | ... // For division heads
  password_hash: string
  created_at: timestamp
}
```

### Complaints Table
```typescript
{
  id: string (UUID)
  title: string
  description: string
  division: "cleanliness" | "water" | "electricity" | ...
  status: "pending" | "in_progress" | "resolved"
  priority: "low" | "medium" | "high"
  raised_by: string (user_id)
  assigned_to?: string (division_head_id)
  cluster_id?: string (UUID for grouped complaints)
  created_at: timestamp
  updated_at: timestamp
  resolved_at?: timestamp
}
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- Supabase account
- npm or yarn

### Backend Setup

1. **Install dependencies:**
```bash
cd Backend
npm install
```

2. **Install Python NLP dependencies:**
```bash
cd python_nlp
pip install -r requirements.txt
```

3. **Configure environment variables:**

Create `Backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
PY_NLP_URL=http://localhost:5000
PY_NLP_PORT=5000
```

4. **Setup Supabase tables:**

Run these SQL commands in your Supabase SQL Editor:

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
  division TEXT NOT NULL CHECK (division IN ('cleanliness', 'water', 'electricity', 'hostel', 'transport', 'library', 'food', 'infrastructure', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  raised_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  cluster_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_complaints_raised_by ON complaints(raised_by);
CREATE INDEX idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX idx_complaints_division ON complaints(division);
CREATE INDEX idx_complaints_cluster_id ON complaints(cluster_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
```

5. **Start the Python NLP service:**
```bash
cd Backend/python_nlp
python app.py
```

6. **Start the Node.js backend:**
```bash
cd Backend
npm run dev
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd Frontend
npm install
```

2. **Configure API endpoint:**

Update API base URL in frontend files if needed (default: `http://localhost:4000`)

3. **Start the development server:**
```bash
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Complaints
- `POST /api/complaints` - Create complaint (authenticated)
- `GET /api/complaints/my` - Get user's complaints
- `GET /api/complaints/assigned` - Get assigned complaints (division head)
- `GET /api/complaints/all` - Get all complaints (role-based)
- `PATCH /api/complaints/:id/status` - Update complaint status

### Analytics
- `GET /api/complaints/stats/dashboard` - Dashboard statistics
- `GET /api/complaints/stats/division` - Division-wise stats (admin only)
- `GET /api/complaints/stats/priority` - Priority distribution
- `GET /api/complaints/analysis/monthly` - Monthly trends

## 🤖 AI/NLP Features

### Division Categorization
The AI uses keyword-based classification to categorize complaints:

```python
division_keywords = {
    "cleanliness": ["clean", "dirty", "garbage", "trash", ...],
    "water": ["water", "tap", "pipe", "leak", ...],
    "electricity": ["electricity", "power", "light", ...],
    ...
}
```

### Priority Assignment
Complaints are prioritized based on severity keywords:

```python
severity_keywords = {
    "high": ["harassment", "ragging", "urgent", "critical", ...],
    "medium": ["delay", "problem", "broken", ...],
    "low": ["suggestion", "minor", "feedback", ...]
}
```

### Similarity Clustering
Uses sentence transformers for semantic similarity:
- Model: `all-MiniLM-L6-v2`
- Method: Cosine similarity on embeddings
- Threshold: 0.65 (65% similarity)
- Fallback: Jaccard similarity on word sets

## 🔒 Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Role-based Authorization**: Middleware enforcement
4. **Privacy Protection**: Student names hidden from other students
5. **Input Validation**: Server-side validation for all inputs

## 🎨 UI/UX Features

1. **Responsive Design**: Works on mobile, tablet, and desktop
2. **Real-time Updates**: Dynamic data fetching
3. **Loading States**: Skeleton loaders for better UX
4. **Error Handling**: User-friendly error messages
5. **Visual Feedback**: Color-coded status and priority badges
6. **Interactive Charts**: Recharts library for data visualization

## 📊 Sample Data

To test the system, create these sample users:

```typescript
// Admin
{
  name: "Admin User",
  email: "admin@university.edu",
  role: "admin",
  password: "admin123"
}

// Division Head (Cleanliness)
{
  name: "Cleaning Manager",
  email: "cleaning@university.edu",
  role: "division_head",
  division: "cleanliness",
  password: "manager123"
}

// Student
{
  name: "John Doe",
  email: "john@university.edu",
  role: "student",
  department: "Computer Science",
  password: "student123"
}
```

## 🐛 Troubleshooting

### Python NLP Service Not Working
- Ensure Python 3.8+ is installed
- Install dependencies: `pip install flask sentence-transformers scikit-learn numpy`
- Check if port 5000 is available

### Database Connection Errors
- Verify Supabase credentials in `.env`
- Check network connectivity
- Ensure tables are created correctly

### Frontend API Errors
- Confirm backend is running on port 4000
- Check browser console for CORS errors
- Verify authentication token is being sent

## 📈 Future Enhancements

1. **Real-time Notifications**: WebSocket integration
2. **File Attachments**: Image/document uploads
3. **Email Notifications**: Automated email alerts
4. **Advanced NLP**: Fine-tuned models for better accuracy
5. **Mobile App**: React Native version
6. **Report Generation**: PDF export functionality
7. **Complaint Comments**: Discussion threads
8. **SLA Tracking**: Time-based resolution metrics

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Development Team - Initial implementation

## 🙏 Acknowledgments

- Supabase for database infrastructure
- Hugging Face for NLP models
- Recharts for visualization library
- React community for frontend tools

---

For questions or support, please open an issue on GitHub.
