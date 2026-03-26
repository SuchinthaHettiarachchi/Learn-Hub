
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Plus, BookOpen, Users, DollarSign, TrendingUp, Calendar, Edit, Trash2, Eye, EyeOff, Download, Settings, BarChart3, TrendingDown, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Analytics components
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [userSearchFilter, setUserSearchFilter] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAnalytics(),
        fetchDailyData(),
        fetchCourses(),
        fetchTopCourses(),
        fetchRevenueTrend(),
        fetchUserGrowth(),
        fetchAllUsers(),
        fetchFeedbackSummary()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytic/getAnalytic');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchDailyData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const response = await api.get('/analytic/getDailyData', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });
      setDailyData(response.data);
    } catch (error) {
      console.error('Error fetching daily data:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setCourseLoading(true);
      const response = await api.get('/getAllCourses');
      const coursesArray = Array.isArray(response.data.courses)
        ? response.data.courses
        : (Array.isArray(response.data) ? response.data : []);
      setCourses(coursesArray);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setCourseLoading(false);
    }
  };

  const fetchTopCourses = async () => {
    try {
      const response = await api.get('/analytic/topCourses');
      if (response.data.success) {
        setTopCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching top courses:', error);
    }
  };

  const fetchRevenueTrend = async () => {
    try {
      const response = await api.get('/analytic/revenueTrend', {
        params: { months: 12 }
      });
      if (response.data.success) {
        setRevenueTrend(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
    }
  };

  const fetchUserGrowth = async () => {
    try {
      const response = await api.get('/analytic/userGrowth', {
        params: { months: 12 }
      });
      if (response.data.success) {
        setUserGrowth(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user growth:', error);
    }
  };

  const fetchFeedbackSummary = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/feedback/summary');
      const data = await response.json();
      if (data.success) {
        setFeedbackSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching feedback summary:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please fill all required fields (title and description)');
      return;
    }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('amount', amount || 0);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      if (pdfFile) {
        formData.append('pdfFile', pdfFile);
      }

      const response = await api.post('/createCourse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        alert('Course created successfully!');
        setShowCreateCourse(false);
        setTitle('');
        setDescription('');
        setAmount('');
        setThumbnail(null);
        setPdfFile(null);
        fetchCourses();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleEditCourse = async (e, courseId) => {
    e.preventDefault();
    if (!editTitle || !editDescription) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setEditingLoading(true);
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      if (editAmount) {
        formData.append('amount', editAmount);
      }
      if (editThumbnail) {
        formData.append('thumbnail', editThumbnail);
      }
      if (editPdfFile) {
        formData.append('pdfFile', editPdfFile);
      }

      const response = await api.put(`/editCourse/${courseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        alert('Course updated successfully!');
        setEditingCourseId(null);
        setEditTitle('');
        setEditDescription('');
        setEditAmount('');
        setEditThumbnail(null);
        setEditPdfFile(null);
        fetchCourses();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update course');
    } finally {
      setEditingLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await api.delete(`/deleteCourse/${courseId}`);
        if (response.data.success) {
          alert('Course deleted successfully!');
          fetchCourses();
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  const handleHideCourse = async (courseId) => {
    try {
      const response = await api.patch(`/hideCourse/${courseId}`);
      if (response.data.success) {
        alert(response.data.message);
        fetchCourses();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update course visibility');
    }
  };

  const startEditCourse = (course) => {
    setEditingCourseId(course._id);
    setEditTitle(course.title);
    setEditDescription(course.description);
    setEditAmount(course.amount.toString());
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `${filename}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(userSearchFilter.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchFilter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {['dashboard', 'users', 'content', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.users || 0}</div>
                <p className="text-xs text-muted-foreground">Active members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.courses || 0}</div>
                <p className="text-xs text-muted-foreground">Published courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalEnrollments || 0}</div>
                <p className="text-xs text-muted-foreground">Student enrollments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{analytics?.totalRevenue?.toFixed(0) || '0'}</div>
                <p className="text-xs text-muted-foreground">All time earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Revenue (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Enrollments (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="enrollments" stroke="#10b981" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Revenue Trend (12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="totalRevenue" stroke="#f59e0b" name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Growth (12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userGrowth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="newUsers" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Top Performing Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCourses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="text-left py-2 px-4">Course Title</th>
                        <th className="text-left py-2 px-4">Enrollments</th>
                        <th className="text-left py-2 px-4">Price</th>
                        <th className="text-left py-2 px-4">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCourses.map((course) => (
                        <tr key={course._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                          <td className="py-3 px-4 font-medium">{course.title}</td>
                          <td className="py-3 px-4">{course.enrollmentCount}</td>
                          <td className="py-3 px-4">₹{course.amount}</td>
                          <td className="py-3 px-4">₹{course.revenue?.toFixed(0) || '0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No course data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage and monitor all platform users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or email..."
                  value={userSearchFilter}
                  onChange={(e) => setUserSearchFilter(e.target.value)}
                  className="flex-1"
                />
              </div>

              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Enrollments</th>
                        <th className="text-left py-3 px-4">Total Spent</th>
                        <th className="text-left py-3 px-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={user.profilePhoto}
                                alt={user.fullName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span className="font-medium">{user.fullName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                              {user.enrollmentCount}
                            </span>
                          </td>
                          <td className="py-3 px-4">₹{user.totalSpent?.toFixed(0) || '0'}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No users found</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* CONTENT TAB */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Course Management</h2>
              <p className="text-sm text-muted-foreground">Create and manage your courses</p>
            </div>
            <Button onClick={() => setShowCreateCourse(!showCreateCourse)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </div>

          {showCreateCourse && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Course</CardTitle>
                <CardDescription>Fill in the details to create a new course</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Course Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price (INR)</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Thumbnail Image</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnail(e.target.files[0])}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={creating}>
                      {creating ? 'Creating...' : 'Create Course'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateCourse(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Courses
              </CardTitle>
              <CardDescription>Edit, delete, or hide your courses</CardDescription>
            </CardHeader>
            <CardContent>
              {courseLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="ml-3 text-muted-foreground">Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-muted-foreground">No courses yet. Create your first course!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {courses.map((course) => (
                    <div key={course._id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-white dark:bg-slate-950">
                      {editingCourseId === course._id ? (
                        <form onSubmit={(e) => handleEditCourse(e, course._id)} className="space-y-4">
                          <h3 className="text-lg font-semibold">Edit Course</h3>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              required
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Price (INR)</label>
                            <Input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              required
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Thumbnail Image (optional)</label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEditThumbnail(e.target.files[0])}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={editingLoading} className="bg-blue-600 hover:bg-blue-700">
                              {editingLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setEditingCourseId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{course.title}</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">{course.description}</p>
                              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                <span className="font-semibold text-blue-600 dark:text-blue-400">₹{course.amount}</span>
                                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  {course.modules?.length || 0} modules
                                </span>
                                {course.isHidden && (
                                  <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                                    Hidden
                                  </span>
                                )}
                              </div>
                            </div>
                            {course.thumbnail && (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-24 h-24 object-cover rounded-lg flex-shrink-0 border border-slate-200"
                              />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => startEditCourse(course)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              className="bg-slate-500 hover:bg-slate-600"
                              onClick={() => handleHideCourse(course._id)}
                            >
                              {course.isHidden ? (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Unhide
                                </>
                              ) : (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Hide
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDeleteCourse(course._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Reports & Export</h2>
            <p className="text-sm text-muted-foreground mb-6">Export your data for analysis and reporting</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users Report
                </CardTitle>
                <CardDescription>Export all user data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {users.length} users in total
                </p>
                <Button
                  onClick={() => exportToCSV(
                    users.map(u => ({
                      'Name': u.fullName,
                      'Email': u.email,
                      'Enrollments': u.enrollmentCount,
                      'Total Spent': u.totalSpent,
                      'Joined': new Date(u.createdAt).toLocaleDateString()
                    })),
                    'users-report'
                  )}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Courses Report
                </CardTitle>
                <CardDescription>Export all course data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {courses.length} courses in total
                </p>
                <Button
                  onClick={() => exportToCSV(
                    courses.map(c => ({
                      'Title': c.title,
                      'Description': c.description,
                      'Price': c.amount,
                      'Modules': c.modules?.length || 0,
                      'Hidden': c.isHidden ? 'Yes' : 'No'
                    })),
                    'courses-report'
                  )}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Courses Report
                </CardTitle>
                <CardDescription>Export top performing courses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {topCourses.length} top courses
                </p>
                <Button
                  onClick={() => exportToCSV(
                    topCourses.map(c => ({
                      'Course': c.title,
                      'Enrollments': c.enrollmentCount,
                      'Price': c.amount,
                      'Revenue': c.revenue?.toFixed(2) || '0'
                    })),
                    'top-courses-report'
                  )}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Report
                </CardTitle>
                <CardDescription>Export revenue data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  ₹{analytics?.totalRevenue?.toFixed(0) || '0'} total revenue
                </p>
                <Button
                  onClick={() => exportToCSV(
                    revenueTrend.map(r => ({
                      'Month': r._id,
                      'Revenue': r.totalRevenue?.toFixed(2) || '0',
                      'Orders': r.totalOrders
                    })),
                    'revenue-report'
                  )}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Feedback Report
                </CardTitle>
                <CardDescription>Export feedback summary and reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Feedbacks</p>
                    <p className="text-2xl font-bold">{feedbackSummary?.totalReviews || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold">
                      {feedbackSummary?.averageRating || 0} / 5
                      <span className="text-sm ml-2">⭐</span>
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => exportToCSV(
                    (feedbackSummary?.feedbacks || []).map(f => ({
                      'Student ID': f.studentId,
                      'Module Code': f.moduleCode,
                      'Content Clarity': f.contentClarity,
                      'Navigation Ease': f.navigationEase,
                      'Comments': f.featureRequest || 'N/A',
                      'Has Tech Issues': f.hasTechIssues,
                      'Date': new Date(f.createdAt).toLocaleDateString()
                    })),
                    'feedback-report'
                  )}
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{analytics?.users || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{analytics?.courses || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Enrollments</p>
                  <p className="text-2xl font-bold">{analytics?.totalEnrollments || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{analytics?.totalRevenue?.toFixed(0) || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

