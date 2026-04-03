# 1. Get the code
git clone https://github.com/SuchinthaHettiarachchi/Learn-Hub.git
cd Learn-Hub

# 2. Setup Backend & MongoDB
cd server
npm install

# --- MONGODB PART START ---
# A. Create a free cluster at mongodb.com
# B. Set Network Access to "Allow Access From Anywhere" (0.0.0.0/0)
# C. Copy your Connection String (Driver: Node.js)
# D. Create the environment file:
touch .env 
# E. Open .env and add: MONGODB_URI=your_copied_string_here
# --- MONGODB PART END ---

# 3. Setup Frontend
cd ../client
npm install recharts  # For admin dashboard charts
npm install

# 4. Run the Project
# Terminal 1 (in /server): npm run dev
# Terminal 2 (in /client): npm run dev

---

## 🎛️ Admin Dashboard

The platform now includes a **comprehensive admin dashboard** for platform management.

### Features:
- 📊 **Real-time Analytics**: Dashboard with charts, metrics, and revenue tracking
- 👥 **User Management**: View all users, enrollments, and spending data
- 📚 **Course Management**: Create, edit, delete, and manage courses
- 📈 **Reports & Export**: Generate and export data as CSV files

### Quick Start:
1. Login with admin account (email matching `ENV.ADMIN`)
2. Navigate to your admin dashboard route
3. View analytics, manage users, courses, and generate reports

### Documentation:
- **User Guide**: See [ADMIN_DASHBOARD_GUIDE.md](./ADMIN_DASHBOARD_GUIDE.md)
- **Setup Guide**: See [ADMIN_SETUP.md](./ADMIN_SETUP.md)
- **Implementation**: See [ADMIN_DASHBOARD_IMPLEMENTATION.md](./ADMIN_DASHBOARD_IMPLEMENTATION.md)

### Key Endpoints:
```
GET  /api/analytic/getAnalytic       - Platform metrics
GET  /api/analytic/getDailyData      - Daily revenue & enrollments
GET  /api/analytic/topCourses        - Top performing courses
GET  /api/analytic/revenueTrend      - 12-month revenue trend
GET  /api/analytic/userGrowth        - 12-month user growth
GET  /api/admin/users                - All users with stats
```

---