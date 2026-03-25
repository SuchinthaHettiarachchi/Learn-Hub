# 🎛️ Admin Dashboard Guide

## Overview

The new comprehensive Admin Dashboard provides full platform management capabilities with advanced analytics, user management, course content management, and reporting features.

---

## 📋 Features

### 1. **Dashboard Tab** 📊
The main analytics hub showing real-time platform metrics.

#### Key Metrics Cards:
- **Total Users**: Active members on the platform
- **Total Courses**: Published courses available
- **Total Enrollments**: Student enrollments across all courses
- **Total Revenue**: All-time earnings in LKR

#### Analytics Charts:
- **Daily Revenue Chart** (Last 30 days): Bar chart showing daily revenue trends
- **Daily Enrollments Chart** (Last 30 days): Line chart tracking student enrollments
- **Revenue Trend** (12 months): Monthly revenue patterns
- **User Growth** (12 months): New user registration trends

#### Top Performing Courses Table:
- Lists top 10 courses by enrollment
- Shows enrollment count, price, and total revenue per course
- Helps identify best-performing content

---

### 2. **Users Tab** 👥
Complete user management and monitoring system.

#### Features:
- **View All Users**: See complete list of registered users
- **User Information**:
  - Profile photo
  - Full name and email
  - Total enrollments
  - Total amount spent
  - Registration date
- **Search Functionality**: Filter users by name or email
- **User Analytics**: Monitor user engagement and spending patterns

#### User Data Displayed:
| Column | Description |
|--------|-------------|
| Name | User's full name with avatar |
| Email | User's email address |
| Enrollments | Number of courses enrolled |
| Total Spent | Total amount paid for courses |
| Joined | Date user registered |

---

### 3. **Content Tab** 📚
Course creation and management interface.

#### Course Management Features:

##### Create New Course:
1. Click "Create Course" button
2. Fill in course details:
   - **Course Title**: Name of the course
   - **Description**: Detailed course description
   - **Price (LKR)**: Course price in Sri Lankan Rupees
   - **Thumbnail Image**: Course cover image
3. Click "Create Course" to publish

##### Edit Course:
1. Click "Edit" button on any course
2. Modify any field (title, description, price, thumbnail)
3. Click "Save Changes" to update

##### Hide/Unhide Course:
- Click the "Hide" button to hide course from public listing
- Click "Unhide" to make it visible again
- Hidden courses won't appear in student course listings but data is preserved

##### Delete Course:
- Click "Delete" button to permanently remove a course
- **Warning**: This action cannot be undone
- Confirm before deletion

#### Course Display Information:
- Course title and description
- Price in LKR
- Number of modules
- Hidden status indicator
- Course thumbnail preview

---

### 4. **Reports Tab** 📈
Data export and analytics reporting.

#### Available Reports:

##### Users Report
- Export all user data to CSV
- Includes: Name, Email, Enrollments, Total Spent, Join Date
- Use for: User analysis, marketing lists, CRM integration

##### Courses Report
- Export all course data to CSV
- Includes: Title, Description, Price, Number of Modules, Hidden Status
- Use for: Course inventory, pricing analysis, content audit

##### Top Courses Report
- Export top 10 performing courses to CSV
- Includes: Course Title, Enrollments, Price, Revenue
- Use for: Performance tracking, resource allocation decisions

##### Revenue Report
- Export 12-month revenue data to CSV
- Includes: Month, Revenue, Order Count
- Use for: Financial analysis, revenue forecasting, accounting

#### Export Format:
All reports are exported in **CSV (Comma-Separated Values)** format:
- Compatible with Excel, Google Sheets, and other tools
- Easy to import into BI tools and databases
- Universal format for data analysis

#### Dashboard Summary:
Quick reference statistics displayed:
- Total Users
- Total Courses
- Total Enrollments
- Total Revenue

---

## 🔄 Data Flow

```
Admin Dashboard
├── Analytics Data (from backend)
│   ├── Daily revenue/enrollments
│   ├── 12-month trends
│   └── Top course metrics
│
├── User Data (from backend)
│   ├── All registered users
│   ├── Enrollment history
│   └── Payment history
│
└── Course Data (from database)
    ├── Course details
    ├── Module information
    └── Hidden status
```

---

## 🛠️ Technical Details

### Backend Endpoints

#### Analytics Endpoints:
- `GET /api/analytic/getAnalytic` - Overall platform metrics
- `GET /api/analytic/getDailyData` - Daily revenue and enrollments
- `GET /api/analytic/topCourses` - Top 10 performing courses
- `GET /api/analytic/revenueTrend` - 12-month revenue trend
- `GET /api/analytic/userGrowth` - 12-month user growth

#### User Endpoints:
- `GET /api/admin/users` - Get all users with enrollment details

#### Course Endpoints:
- `POST /api/createCourse` - Create new course
- `GET /api/getAllCourses` - Get all courses (admin view, includes hidden)
- `PUT /api/editCourse/:id` - Edit course details
- `PATCH /api/hideCourse/:id` - Toggle course visibility
- `DELETE /api/deleteCourse/:id` - Delete course

### Dependencies
- **Recharts**: Data visualization library for charts
  - Used for: Daily trends, revenue trends, user growth charts
- **Papaparse**: CSV export utility (if implemented)

### Authentication
- All admin endpoints require authentication (`protectRoute`)
- All admin endpoints require admin role (`adminRoute`)
- Admin status determined by email matching `ENV.ADMIN`

---

## 📊 Analytics Interpretation

### Daily Revenue Chart
- **X-axis**: Date (last 30 days)
- **Y-axis**: Revenue in LKR
- **Usage**: Track daily sales performance, identify peak revenue days

### Daily Enrollments Chart
- **X-axis**: Date (last 30 days)
- **Y-axis**: Number of enrollments
- **Usage**: Monitor student acquisition rate, detect marketing campaign impact

### Revenue Trend (12 months)
- **X-axis**: Month (YYYY-MM)
- **Y-axis**: Total monthly revenue
- **Usage**: Identify seasonal trends, forecast future revenue

### User Growth (12 months)
- **X-axis**: Month (YYYY-MM)
- **Y-axis**: New users registered
- **Usage**: Track platform growth, measure marketing effectiveness

### Top Courses Analysis
- **High Enrollments**: Popular courses - consider creating similar content
- **High Revenue**: Courses with good price-to-enrollment ratio
- **Growth Potential**: Courses with room for improvement

---

## 💡 Best Practices

### Course Management
1. **Always upload high-quality thumbnails** - Affects enrollment rates
2. **Write detailed descriptions** - Helps with course discovery
3. **Regularly review top courses** - Identify what students want
4. **Archive unused courses** - Keep catalog clean by hiding old courses

### Monitoring Analytics
1. **Check daily dashboard** - Catch issues early
2. **Review weekly trends** - Identify patterns
3. **Analyze monthly performance** - Plan next month's strategy
4. **Export reports monthly** - Maintain records for accountants

### User Management
1. **Monitor newly joined users** - Engage them quickly
2. **Track high spenders** - Build relationships with valuable customers
3. **Review enrollment trends** - Adjust pricing/content accordingly

### Data Export
1. **Regular backups** - Export data monthly for records
2. **Store securely** - Keep exported files in secure location
3. **Track KPIs** - Compare monthly exports to identify trends
4. **External reporting** - Share top courses report with stakeholders

---

## 🔐 Security Notes

- ✅ Only admins can access this dashboard
- ✅ All data modifications require authentication
- ✅ Course deletion is permanent - no recovery possible
- ✅ User data is protected and not modifiable from dashboard
- ✅ Revenue data is read-only for audit purposes

---

## 🚀 Quick Start Checklist

- [ ] Log in as admin user
- [ ] Review dashboard metrics
- [ ] Check user growth trends
- [ ] Review top performing courses
- [ ] Create or update a course
- [ ] Export a report
- [ ] Review exported data

---

## 🤔 Troubleshooting

### Charts Not Displaying
- **Solution**: Ensure Recharts is installed (`npm install recharts`)
- **Fallback**: Check browser console for errors

### Export Button Not Working
- **Solution**: Ensure data exists before exporting
- **Check**: Try exporting different report type first

### Slow Dashboard Loading
- **Solution**: Clear browser cache
- **Optimization**: Close other tabs, check network speed

### Missing Users/Courses
- **Solution**: Refresh the page (Ctrl/Cmd + R)
- **Backend**: Verify database connectivity

---

## 📈 Next Steps

1. **Set up regular reporting**: Export monthly for records
2. **Monitor KPIs**: Track user growth and revenue trends
3. **Optimize courses**: Focus on top performers
4. **Engage users**: Reach out to high-value customers
5. **Plan expansion**: Use analytics for content strategy

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review browser console for errors
3. Verify backend server is running
4. Check database connectivity

---

**Last Updated**: March 2026
**Version**: 1.0 - Full Featured Admin Dashboard
