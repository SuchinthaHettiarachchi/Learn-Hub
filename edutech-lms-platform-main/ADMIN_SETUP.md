# 🚀 Admin Dashboard Setup & Installation

## Prerequisites

Before you begin, ensure you have:
- Node.js v16+ installed
- npm or yarn package manager
- MongoDB database running
- Backend server running on the configured port
- Frontend development server running

---

## Installation Steps

### 1. Install Required Dependencies

```bash
cd client

# Install Recharts for charts and visualization
npm install recharts

# Optional: Install CSV export libraries
npm install papaparse

# Verify installation
npm list recharts
```

### 2. Verify Backend is Running

Ensure all new endpoints are available:

```bash
# Check backend server is running
curl http://localhost:5000/api/analytic/getAnalytic

# Should return analytics data (with proper auth headers)
```

### 3. Start Development Server

```bash
cd client
npm run dev

# Navigate to admin dashboard
# URL: http://localhost:5173/admin (or your configured route)
```

---

## Configuration

### Backend API URLs

The admin dashboard uses these API endpoints. Ensure they're all configured in your `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Admin User Setup

Set your admin email in server `.env`:

```env
ADMIN=your-email@example.com
```

The user with this email will automatically become an admin.

---

## Environment Variables

### Client (.env or .env.local)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Your LMS Platform
```

### Server (.env)

```env
ADMIN=admin@example.com
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your-secret-key
```

---

## Verify Installation

### 1. Check Admin Access

```javascript
// In browser console, after logging in as admin:
// Should work and load data
const response = await fetch('/api/admin/users', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
console.log(response.json());
```

### 2. Verify Charts Render

- Go to Admin > Dashboard tab
- Should see charts rendering with data
- If blank, check browser console for errors

### 3. Test Export Function

- Go to Admin > Reports tab
- Click any export button
- File should download as CSV

### 4. Test User Management

- Go to Admin > Users tab
- Should list all users with details
- Search filter should work

---

## API Endpoints Reference

### Authentication Required

All endpoints below require valid JWT token in Authorization header.

#### Analytics Endpoints

```
GET /api/analytic/getAnalytic
Returns: {
  users: number,
  courses: number,
  totalEnrollments: number,
  totalRevenue: number
}

GET /api/analytic/getDailyData?startDate=2024-01-01&endDate=2024-01-31
Returns: Array of {
  date: string,
  enrollments: number,
  revenue: number
}

GET /api/analytic/topCourses
Returns: {
  success: boolean,
  data: Array of courses with enrollmentCount and revenue
}

GET /api/analytic/revenueTrend?months=12
Returns: {
  success: boolean,
  data: Array of {
    _id: "2024-01",
    totalRevenue: number,
    totalOrders: number
  }
}

GET /api/analytic/userGrowth?months=12
Returns: {
  success: boolean,
  data: Array of {
    _id: "2024-01",
    newUsers: number
  }
}
```

#### User Endpoints

```
GET /api/admin/users
Returns: {
  success: boolean,
  data: Array of users with enrollmentCount and totalSpent,
  total: number
}
```

#### Course Endpoints

```
POST /api/createCourse
Body: FormData with title, description, amount, thumbnail
Returns: { success: boolean, newCourse }

GET /api/getAllCourses
Returns: { courses: Array }

PUT /api/editCourse/:id
Body: FormData with title, description, amount, thumbnail
Returns: { success: boolean }

PATCH /api/hideCourse/:id
Returns: { success: boolean, message }

DELETE /api/deleteCourse/:id
Returns: { success: boolean }
```

---

## Troubleshooting

### Issue: "Recharts is not defined" Error

**Solution**: Reinstall dependencies
```bash
npm install recharts --save
```

### Issue: Charts Not Rendering

**Solution**: Check if data is being fetched
```javascript
// In browser console
console.log('API response:', response);
// Verify data structure matches chart component
```

### Issue: Admin endpoints returning 401/403

**Solution**: Verify admin status
```javascript
// Login as admin user (email matching ENV.ADMIN)
// Check user object in browser: user.admin should be true
```

### Issue: Slow Performance

**Solution**: Optimize data fetching
```javascript
// Consider pagination for large datasets
// Reduce chart time ranges if needed
```

### Issue: CSV Export Not Working

**Solution**: Check for data
```javascript
// Ensure data exists
console.log('Export data:', data);
// Try exporting different report
```

---

## Performance Optimization

### 1. Dashboard Load Time

```javascript
// Use React.memo for chart components
const DashboardChart = React.memo(({ data }) => (
  // chart code
));
```

### 2. Data Fetching

```javascript
// Implement pagination for large datasets
const [page, setPage] = useState(1);
const pageSize = 50;
// Fetch: /api/admin/users?page=1&limit=50
```

### 3. Chart Performance

```javascript
// Limit data points in charts
const limitedData = dailyData.slice(-30); // Last 30 days only
```

---

## Database Backup

Before making changes, backup your database:

```bash
# MongoDB backup
mongodump --db lms --out ./backup

# MongoDB restore
mongorestore --db lms ./backup/lms
```

---

## Development Map

```
Admin Dashboard Architecture
├── Frontend (React + Recharts)
│   ├── Dashboard Tab (Analytics)
│   ├── Users Tab (Management)  
│   ├── Content Tab (Course Mgmt)
│   └── Reports Tab (Exports)
│
├── Backend Routes
│   ├── /api/analytic/* (5 endpoints)
│   ├── /api/admin/users
│   └── /api/*Course (existing)
│
└── Database Models
    ├── User (with enrollments)
    ├── Course (with modules)
    ├── Order (for revenue tracking)
    └── Analytics (aggregated views)
```

---

## Testing Checklist

- [ ] Admin can access dashboard
- [ ] All charts load with data
- [ ] User search/filter works
- [ ] Course CRUD operations work
- [ ] Export buttons download CSV files
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Mobile responsive layout works

---

## Security Checklist

- [ ] Only admin users can access endpoints
- [ ] JWT tokens are validated
- [ ] Database queries are secure (no SQL injection)
- [ ] Sensitive data is protected
- [ ] CORS is properly configured
- [ ] Input validation is in place
- [ ] Rate limiting is configured (if needed)

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Start development server
3. ✅ Login as admin
4. ✅ Access admin dashboard
5. ✅ Test all features
6. ✅ Deploy to production

---

## Production Deployment

### 1. Build Frontend

```bash
cd client
npm run build
# Creates optimized build in dist/
```

### 2. Set Production Environment Variables

Update `.env` with production URLs:
```env
VITE_API_BASE_URL=https://your-api.com/api
NODE_ENV=production
```

### 3. Deploy Backend Changes

```bash
# Push new controller functions and routes
git add .
git commit -m "Add comprehensive admin dashboard"
git push
```

### 4. Restart Server

```bash
# Stop old server
# Clear npm cache
npm cache clean --force
# Reinstall dependencies
npm install
# Start new server
npm start
```

---

## Support & Resources

- **Documentation**: See ADMIN_DASHBOARD_GUIDE.md
- **Backend Routes**: See server/src/routes/
- **Controllers**: See server/src/controllers/
- **Models**: See server/src/models/
- **API**: Review endpoint documentation in this guide

---

**Installation Guide v1.0** - Last updated March 2026
