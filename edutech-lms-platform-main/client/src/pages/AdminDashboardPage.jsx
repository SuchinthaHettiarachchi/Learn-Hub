import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Plus, BookOpen, Users, DollarSign, TrendingUp, Calendar, Edit, Trash2,
  Eye, EyeOff, Download, Settings, BarChart3, TrendingDown, MessageSquare,
  Search, UserPlus, ShieldAlert, RefreshCw, X, Shield, AlertCircle, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ═══ PDF GENERATORS ═══ */
const generateFeedbackPDF = (feedbacks) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const total = feedbacks.length;
  const avgC = total ? (feedbacks.reduce((a,f)=>a+(f.contentClarity||0),0)/total).toFixed(1) : 0;
  const avgN = total ? (feedbacks.reduce((a,f)=>a+(f.navigationEase||0),0)/total).toFixed(1) : 0;
  const techCount = feedbacks.filter(f=>f.hasTechIssues==='yes').length;
  const techRate = total ? ((techCount/total)*100).toFixed(1) : 0;
  doc.setFillColor(37,99,235); doc.rect(0,0,297,28,'F');
  doc.setTextColor(255); doc.setFont('helvetica','bold'); doc.setFontSize(18);
  doc.text('Feedback Report', 14, 12);
  doc.setFont('helvetica','normal'); doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 230, 20);
  autoTable(doc, {
    startY: 36,
    head: [['Date','Student','Student ID','Module','Instructor','Clarity','Nav Ease','Tech Issues','Feature Request']],
    body: feedbacks.map(f => [
      new Date(f.createdAt).toLocaleDateString(), f.user?.fullName || 'Anonymous',
      f.studentId || '—', f.moduleCode || '—', f.instructorName || '—',
      f.contentClarity ?? '—', f.navigationEase ?? '—',
      f.hasTechIssues === 'yes' ? 'Yes' : 'No', f.featureRequest || '—',
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37,99,235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248,250,252] },
  });
  doc.save('feedback-report.pdf');
};

const generateUsersPDF = (users) => {
  const doc = new jsPDF();
  doc.setFillColor(37,99,235); doc.rect(0,0,210,24,'F');
  doc.setTextColor(255); doc.setFont('helvetica','bold'); doc.setFontSize(16);
  doc.text('User Management Report', 14, 11);
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text(`Total: ${users.length} users  ·  Generated: ${new Date().toLocaleString()}`, 14, 19);
  autoTable(doc, {
    startY: 30,
    head: [['Name','Email','Role','Enrol.','Total Spent','Joined']],
    body: users.map(u => [
      u.fullName||'Anonymous', u.email, u.admin?'Admin':'Student',
      u.enrollmentCount||0, `LKR ${(u.totalSpent||0).toLocaleString()}`,
      new Date(u.createdAt).toLocaleDateString(),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37,99,235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248,250,252] },
  });
  doc.save('users-report.pdf');
};

/* ═══ SMALL UI COMPONENTS ═══ */
const ClarityDot = ({ value }) => {
  const v = Number(value) || 0;
  const cfg = v >= 4
    ? { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' }
    : v === 3
    ? { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' }
    : { bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-200' };
  return <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>{v || '—'}</span>;
};

const TechPill = ({ value }) => value === 'yes'
  ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold"><AlertCircle className="h-2.5 w-2.5"/>Yes</span>
  : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold"><CheckCircle className="h-2.5 w-2.5"/>No</span>;

const RolePill = ({ isAdmin }) => isAdmin
  ? <span className="px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 border border-violet-100 text-xs font-bold">Admin</span>
  : <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold">Student</span>;

const MetricCard = ({ label, value, unit, colorClass, bg }) => (
  <div className={`${bg} border rounded-2xl px-5 py-4 flex flex-col gap-1 min-w-[120px] flex-1`}>
    <p className={`text-xs font-semibold ${colorClass} opacity-80`}>{label}</p>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-2xl font-black text-slate-800 leading-none">{value}</span>
      {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
    </div>
  </div>
);

/* ═══ MAIN COMPONENT ═══ */
export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [fbSummary, setFbSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [editPdfFile, setEditPdfFile] = useState(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [userSearchFilter, setUserSearchFilter] = useState('');
  // User management modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [form, setForm] = useState({ fullName:'', email:'', password:'', isAdmin:false, isActive:true });
  const [formErr, setFormErr] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const end = new Date(), start = new Date();
      start.setDate(start.getDate() - 30);
      await Promise.allSettled([
        api.get('/analytic/getAnalytic').then(r => setAnalytics(r.data)).catch(()=>{}),
        api.get('/analytic/getDailyData', { params: { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] } }).then(r => setDailyData(r.data)).catch(()=>{}),
        api.get('/analytic/topCourses').then(r => r.data.success && setTopCourses(r.data.data)).catch(()=>{}),
        api.get('/analytic/revenueTrend', { params: { months: 12 } }).then(r => r.data.success && setRevenueTrend(r.data.data)).catch(()=>{}),
        api.get('/analytic/userGrowth', { params: { months: 12 } }).then(r => r.data.success && setUserGrowth(r.data.data)).catch(()=>{}),
        api.get('/admin/users').then(r => r.data.success && setUsers(r.data.data)).catch(()=>{}),
        api.get('/getAllCourses').then(r => setCourses(Array.isArray(r.data.courses) ? r.data.courses : [])).catch(()=>setCourses([])),
        api.get('/feedback/summary').then(r => { if (r.data.success) { setFeedbacks(r.data.summary.feedbacks); setFbSummary(r.data.summary); } }).catch(()=>{}),
      ]);
    } finally { setLoading(false); }
  };

  // Course CRUD
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title || !description) { alert('Please fill all required fields'); return; }
    try {
      setCreating(true);
      const formData = new FormData();
      formData.append('title', title); formData.append('description', description); formData.append('amount', amount || 0);
      if (thumbnail) formData.append('thumbnail', thumbnail);
      if (pdfFile) formData.append('pdfFile', pdfFile);
      const response = await api.post('/createCourse', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success) { alert('Course created!'); setShowCreateCourse(false); setTitle(''); setDescription(''); setAmount(''); setThumbnail(null); setPdfFile(null); fetchAllData(); }
    } catch (error) { alert(error.response?.data?.message || 'Failed'); } finally { setCreating(false); }
  };
  const handleEditCourse = async (e, courseId) => {
    e.preventDefault();
    if (!editTitle || !editDescription) { alert('Please fill all required fields'); return; }
    try {
      setEditingLoading(true);
      const formData = new FormData();
      formData.append('title', editTitle); formData.append('description', editDescription);
      if (editAmount) formData.append('amount', editAmount);
      if (editThumbnail) formData.append('thumbnail', editThumbnail);
      if (editPdfFile) formData.append('pdfFile', editPdfFile);
      const response = await api.put(`/editCourse/${courseId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success) { alert('Course updated!'); setEditingCourseId(null); fetchAllData(); }
    } catch (error) { alert(error.response?.data?.message || 'Failed'); } finally { setEditingLoading(false); }
  };
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) return;
    try { const r = await api.delete(`/deleteCourse/${courseId}`); if (r.data.success) { alert('Course deleted!'); fetchAllData(); } }
    catch (error) { alert(error.response?.data?.message || 'Failed'); }
  };
  const handleHideCourse = async (courseId) => {
    try { const r = await api.patch(`/hideCourse/${courseId}`); if (r.data.success) { alert(r.data.message); fetchAllData(); } }
    catch (error) { alert(error.response?.data?.message || 'Failed'); }
  };
  const startEditCourse = (course) => { setEditingCourseId(course._id); setEditTitle(course.title); setEditDescription(course.description); setEditAmount(course.amount.toString()); };

  // User CRUD
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await api.delete(`/admin/users/${id}`); setUsers(u => u.filter(x => x._id !== id)); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };
  const submitUserForm = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormErr('');
    try {
      if (modalMode === 'create') await api.post('/admin/users', form);
      else await api.put(`/admin/users/${form._id}`, form);
      await api.get('/admin/users').then(r => r.data.success && setUsers(r.data.data));
      setShowModal(false);
    } catch (e) { setFormErr(e.response?.data?.message || 'Operation failed'); }
    finally { setFormLoading(false); }
  };
  const openCreate = () => { setModalMode('create'); setForm({ fullName:'', email:'', password:'', isAdmin:false, isActive:true }); setFormErr(''); setShowModal(true); };
  const openEdit = (u) => { setModalMode('edit'); setForm({ ...u, isAdmin: u.admin, isActive: u.isActive !== false }); setFormErr(''); setShowModal(true); };

  // Export
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) { alert('No data'); return; }
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => { const v = row[h]; return typeof v === 'string' && v.includes(',') ? `"${v}"` : v; }).join(','))].join('\n');
    const el = document.createElement('a');
    el.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    el.setAttribute('download', `${filename}.csv`); el.style.display = 'none'; document.body.appendChild(el); el.click(); document.body.removeChild(el);
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(userSearchFilter.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearchFilter.toLowerCase())
  );

  // Feedback computed values
  const fbTotal = feedbacks.length;
  const fbClarity = fbTotal ? (feedbacks.reduce((a,f)=>a+(f.contentClarity||0),0)/fbTotal).toFixed(1) : '0';
  const fbNav = fbTotal ? (feedbacks.reduce((a,f)=>a+(f.navigationEase||0),0)/fbTotal).toFixed(1) : '0';
  const fbTech = feedbacks.filter(f=>f.hasTechIssues==='yes').length;
  const fbRate = fbTotal ? ((fbTech/fbTotal)*100).toFixed(1) : '0';

  if (loading) return (
    <div className="container mx-auto px-4 py-8"><p className="text-center">Loading admin dashboard...</p></div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <button onClick={fetchAllData} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
            <RefreshCw className="h-3.5 w-3.5"/> Refresh
          </button>
        </div>
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {['dashboard', 'users', 'content', 'reports'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ DASHBOARD TAB ═══ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{analytics?.users || 0}</div><p className="text-xs text-muted-foreground">Active members</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Courses</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{analytics?.courses || 0}</div><p className="text-xs text-muted-foreground">Published courses</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Enrollments</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{analytics?.totalEnrollments || 0}</div><p className="text-xs text-muted-foreground">Student enrollments</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Daily Enrollments (Last 30 Days)</CardTitle></CardHeader><CardContent>{dailyData.length > 0 ? (<ResponsiveContainer width="100%" height={300}><LineChart data={dailyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="enrollments" stroke="#10b981" /></LineChart></ResponsiveContainer>) : (<p className="text-center text-muted-foreground py-8">No data available</p>)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />User Growth (12 Months)</CardTitle></CardHeader><CardContent>{userGrowth.length > 0 ? (<ResponsiveContainer width="100%" height={300}><BarChart data={userGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" /><YAxis /><Tooltip /><Bar dataKey="newUsers" fill="#8b5cf6" /></BarChart></ResponsiveContainer>) : (<p className="text-center text-muted-foreground py-8">No data available</p>)}</CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Top Performing Courses</CardTitle></CardHeader><CardContent>{topCourses.length > 0 ? (<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 dark:border-slate-800"><th className="text-left py-2 px-4">Course Title</th><th className="text-left py-2 px-4">Enrollments</th></tr></thead><tbody>{topCourses.map((c) => (<tr key={c._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"><td className="py-3 px-4 font-medium">{c.title}</td><td className="py-3 px-4">{c.enrollmentCount}</td></tr>))}</tbody></table></div>) : (<p className="text-center text-muted-foreground py-8">No course data available</p>)}</CardContent></Card>
        </div>
      )}

      {/* ═══ USERS TAB — with CRUD ═══ */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 rounded-xl shadow-md shadow-blue-600/20"><UserPlus className="h-4 w-4 text-white"/></div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{modalMode==='create' ? 'Add New User' : 'Edit User'}</p>
                      <p className="text-xs text-slate-400">{modalMode==='create' ? 'Create a platform account' : 'Update account details'}</p>
                    </div>
                  </div>
                  <button onClick={()=>setShowModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><X className="h-4 w-4 text-slate-400"/></button>
                </div>
                <form onSubmit={submitUserForm} className="p-6 space-y-4">
                  {modalMode === 'create' && [
                    { label:'Full Name', key:'fullName', type:'text', placeholder:'John Doe' },
                    { label:'Email Address', key:'email', type:'email', placeholder:'john@example.com' },
                    { label:'Password', key:'password', type:'password', placeholder:'Min. 8 characters' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                      <Input type={f.type} value={form[f.key]} onChange={e=>setForm(v=>({...v,[f.key]:e.target.value}))} placeholder={f.placeholder} className="rounded-xl h-10 text-sm" required/>
                    </div>
                  ))}
                  <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none">
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isAdmin ? 'bg-blue-600':'bg-slate-200 dark:bg-slate-600'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isAdmin ? 'left-5':'left-0.5'}`}/>
                    </div>
                    <input type="checkbox" className="sr-only" checked={form.isAdmin} onChange={e=>setForm(v=>({...v,isAdmin:e.target.checked}))}/>
                    <div className="flex-1"><p className="text-sm font-bold text-slate-700 dark:text-slate-200">Administrator Role</p><p className="text-xs text-slate-400">Grants full platform access</p></div>
                    {form.isAdmin && <Shield className="h-4 w-4 text-blue-500"/>}
                  </label>
                  {modalMode === 'edit' && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">User Status</p>
                      <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <button type="button" onClick={() => setForm(v => ({ ...v, isActive: true }))} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all ${form.isActive ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50'}`}><span className={`w-2 h-2 rounded-full ${form.isActive ? 'bg-white' : 'bg-slate-300'}`}/>Active</button>
                        <div className="w-px bg-slate-200 dark:bg-slate-700"/>
                        <button type="button" onClick={() => setForm(v => ({ ...v, isActive: false }))} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all ${!form.isActive ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50'}`}><span className={`w-2 h-2 rounded-full ${!form.isActive ? 'bg-white' : 'bg-slate-300'}`}/>Inactive</button>
                      </div>
                    </div>
                  )}
                  {formErr && (<div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl"><ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0"/><p className="text-sm text-red-600 font-medium">{formErr}</p></div>)}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" disabled={formLoading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50">{formLoading ? 'Saving…' : modalMode==='create' ? 'Create Account' : 'Save Changes'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />User Management</CardTitle>
              <CardDescription>Create, edit, and remove platform users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Search by name or email..." value={userSearchFilter} onChange={(e) => setUserSearchFilter(e.target.value)} className="flex-1" />
                <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><UserPlus className="mr-2 h-4 w-4" />Add User</Button>
                <Button onClick={()=>generateUsersPDF(users)} variant="outline"><Download className="mr-2 h-4 w-4" />PDF</Button>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl px-5 py-4"><p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Total Users</p><p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{users.length}</p></div>
                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-2xl px-5 py-4"><p className="text-xs font-semibold text-violet-600 uppercase tracking-widest">Administrators</p><p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{users.filter(u=>u.admin).length}</p></div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl px-5 py-4"><p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Students</p><p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{users.filter(u=>!u.admin).length}</p></div>
              </div>

              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                      <th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Email</th><th className="text-left py-3 px-4">Role</th><th className="text-center py-3 px-4">Enrol.</th><th className="text-left py-3 px-4">Total Spent</th><th className="text-left py-3 px-4">Joined</th><th className="text-right py-3 px-4">Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                          <td className="py-3 px-4"><div className="flex items-center gap-2"><img src={user.profilePhoto} alt={user.fullName} className="w-8 h-8 rounded-full object-cover"/><span className="font-medium">{user.fullName}</span></div></td>
                          <td className="py-3 px-4 text-blue-600">{user.email}</td>
                          <td className="py-3 px-4"><RolePill isAdmin={user.admin}/></td>
                          <td className="py-3 px-4 text-center"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">{user.enrollmentCount || 0}</span></td>
                          <td className="py-3 px-4 font-semibold">LKR {(user.totalSpent||0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4"><div className="flex items-center justify-end gap-1.5">
                            <button onClick={()=>openEdit(user)} className="p-2 rounded-lg text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit className="h-4 w-4"/></button>
                            <button onClick={()=>deleteUser(user._id)} className="p-2 rounded-lg text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="h-4 w-4"/></button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (<p className="text-center text-muted-foreground py-8">No users found</p>)}
              {filteredUsers.length > 0 && <p className="text-xs text-slate-400">Showing <span className="font-bold text-slate-600">{filteredUsers.length}</span> of <span className="font-bold text-slate-600">{users.length}</span> users</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ CONTENT TAB ═══ */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div><h2 className="text-2xl font-bold">Course Management</h2><p className="text-sm text-muted-foreground">Create and manage your courses</p></div>
            <Button onClick={() => setShowCreateCourse(!showCreateCourse)} className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Create Course</Button>
          </div>
          {showCreateCourse && (
            <Card><CardHeader><CardTitle>Create New Course</CardTitle><CardDescription>Fill in the details</CardDescription></CardHeader><CardContent>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-2"><label className="text-sm font-medium">Course Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Thumbnail</label><Input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} required /></div>
                <div className="flex gap-2"><Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Course'}</Button><Button type="button" variant="outline" onClick={() => setShowCreateCourse(false)}>Cancel</Button></div>
              </form>
            </CardContent></Card>
          )}
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Your Courses</CardTitle></CardHeader><CardContent>
            {courseLoading ? (<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : courses.length === 0 ? (<div className="text-center py-12"><BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" /><p className="text-muted-foreground">No courses yet.</p></div>
            ) : (<div className="grid grid-cols-1 gap-6">{courses.map((course) => (
              <div key={course._id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:border-blue-300 transition-colors bg-white dark:bg-slate-950">
                {editingCourseId === course._id ? (
                  <form onSubmit={(e) => handleEditCourse(e, course._id)} className="space-y-4">
                    <h3 className="text-lg font-semibold">Edit Course</h3>
                    <div className="space-y-2"><label className="text-sm font-medium">Title</label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Description</label><Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required rows={3} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Thumbnail (optional)</label><Input type="file" accept="image/*" onChange={(e) => setEditThumbnail(e.target.files[0])} /></div>
                    <div className="flex gap-2"><Button type="submit" disabled={editingLoading} className="bg-blue-600 hover:bg-blue-700">{editingLoading ? 'Saving...' : 'Save Changes'}</Button><Button type="button" variant="outline" onClick={() => setEditingCourseId(null)}>Cancel</Button></div>
                  </form>
                ) : (<>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1"><h3 className="font-semibold text-lg">{course.title}</h3><p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">{course.description}</p><div className="flex flex-wrap gap-4 mt-3 text-sm"><span className="text-slate-600 dark:text-slate-400 flex items-center gap-1"><BookOpen className="h-4 w-4" />{course.modules?.length || 0} modules</span>{course.isHidden && <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-medium">Hidden</span>}</div></div>
                    {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0 border border-slate-200" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => startEditCourse(course)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                    <Button size="sm" className="bg-slate-500 hover:bg-slate-600" onClick={() => handleHideCourse(course._id)}>{course.isHidden ? <><Eye className="mr-2 h-4 w-4" />Unhide</> : <><EyeOff className="mr-2 h-4 w-4" />Hide</>}</Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteCourse(course._id)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                  </div>
                </>)}
              </div>
            ))}</div>)}
          </CardContent></Card>
        </div>
      )}

      {/* ═══ REPORTS TAB — with Feedback Summary ═══ */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Feedback Report Section */}
          <div>
            <div className="flex items-center gap-2.5 mb-1"><div className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl"><MessageSquare className="h-5 w-5 text-slate-500"/></div><h2 className="text-xl font-bold">Feedback Report</h2></div>
            <p className="text-sm text-slate-400 ml-11">Overall summary and individual feedback from students</p>
          </div>

          {/* Feedback Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard label="Total Feedbacks" value={fbTotal} colorClass="text-blue-600" bg="bg-blue-50 border-blue-100"/>
            <MetricCard label="Avg Clarity" value={fbClarity} unit="/5" colorClass="text-emerald-600" bg="bg-emerald-50 border-emerald-100"/>
            <MetricCard label="Avg Nav Ease" value={fbNav} unit="/10" colorClass="text-sky-600" bg="bg-sky-50 border-sky-100"/>
            <MetricCard label="Tech Issues" value={fbTech} colorClass="text-red-600" bg="bg-red-50 border-red-100"/>
            <MetricCard label="Issue Rate" value={`${fbRate}%`} colorClass="text-amber-600" bg="bg-amber-50 border-amber-100"/>
          </div>

          {/* PDF Download */}
          <button onClick={()=>generateFeedbackPDF(feedbacks)} className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all">
            <Download className="h-4 w-4"/>Download Full Feedback Report (PDF)
          </button>

          {/* Feedback Table */}
          <Card>
            <CardHeader><CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Individual Responses ({fbTotal})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    {['Date','Student','Module','Instructor','Clarity','Nav Ease','Tech Issues','Feature Request'].map(h => (
                      <th key={h} className={`py-3 text-[11px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider ${['Clarity','Nav Ease','Tech Issues'].includes(h) ? 'text-center px-4' : 'text-left px-4'}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {feedbacks.length > 0 ? feedbacks.map((f,i) => (
                      <tr key={i} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">{new Date(f.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4"><p className="font-semibold text-slate-900 dark:text-white text-sm">{f.user?.fullName||'Anonymous'}</p>{f.studentId && <p className="text-[11px] text-slate-400 mt-0.5">{f.studentId}</p>}</td>
                        <td className="px-4 py-4"><span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">{f.moduleCode||'—'}</span></td>
                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{f.instructorName||'—'}</td>
                        <td className="px-4 py-4 text-center"><ClarityDot value={f.contentClarity}/></td>
                        <td className="px-4 py-4 text-center font-bold text-slate-700 dark:text-slate-300 text-sm">{f.navigationEase??'—'}</td>
                        <td className="px-4 py-4 text-center"><TechPill value={f.hasTechIssues}/></td>
                        <td className="px-4 py-4 text-sm text-slate-500 max-w-[160px]"><span className="truncate block" title={f.featureRequest}>{f.featureRequest||'—'}</span></td>
                      </tr>
                    )) : (<tr><td colSpan={8} className="py-16 text-center"><MessageSquare className="h-7 w-7 text-slate-200 mx-auto mb-3"/><p className="text-slate-300 font-semibold text-sm">No feedback submitted yet</p></td></tr>)}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* CSV Export Section */}
          <div><h2 className="text-xl font-bold mb-4">Reports & Export</h2><p className="text-sm text-muted-foreground mb-6">Export your data for analysis</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Users Report</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-4">{users.length} users</p><Button onClick={() => exportToCSV(users.map(u => ({ 'Name': u.fullName, 'Email': u.email, 'Enrollments': u.enrollmentCount, 'Joined': new Date(u.createdAt).toLocaleDateString() })), 'users-report')} className="w-full bg-green-600 hover:bg-green-700"><Download className="mr-2 h-4 w-4" />Export CSV</Button></CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Courses Report</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-4">{courses.length} courses</p><Button onClick={() => exportToCSV(courses.map(c => ({ 'Title': c.title, 'Description': c.description, 'Modules': c.modules?.length || 0, 'Hidden': c.isHidden ? 'Yes' : 'No' })), 'courses-report')} className="w-full bg-green-600 hover:bg-green-700"><Download className="mr-2 h-4 w-4" />Export CSV</Button></CardContent></Card>
          </div>
        </div>
      )}
    </div>
  );
}
