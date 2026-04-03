import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Input } from '../components/ui/input';
import {
  Plus, BookOpen, Users, DollarSign, TrendingUp,
  Edit, Trash2, Download, MessageSquare, Search,
  UserPlus, ShieldAlert, Layers, RefreshCw, X, Shield,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ═══════════════════════════════════════════════════════
   PDF GENERATORS
═══════════════════════════════════════════════════════ */
const generateFeedbackPDF = (feedbacks) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const total     = feedbacks.length;
  const avgC      = total ? (feedbacks.reduce((a,f)=>a+(f.contentClarity||0),0)/total).toFixed(1) : 0;
  const avgN      = total ? (feedbacks.reduce((a,f)=>a+(f.navigationEase||0),0)/total).toFixed(1) : 0;
  const techCount = feedbacks.filter(f=>f.hasTechIssues==='yes').length;
  const techRate  = total ? ((techCount/total)*100).toFixed(1) : 0;

  // Header
  doc.setFillColor(37,99,235); doc.rect(0,0,297,28,'F');
  doc.setTextColor(255); doc.setFont('helvetica','bold'); doc.setFontSize(18);
  doc.text('Feedback Report', 14, 12);
  doc.setFont('helvetica','normal'); doc.setFontSize(9);
  doc.text('Overall summary and individual feedback from students', 14, 20);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 230, 20);

  // Summary boxes
  const boxes = [
    {label:'Total Feedbacks', val: String(total),    color:[239,246,255]},
    {label:'Avg Clarity',     val: `${avgC}/5`,      color:[240,253,244]},
    {label:'Avg Nav Ease',    val: `${avgN}/10`,      color:[240,249,255]},
    {label:'Tech Issues',     val: String(techCount), color:[254,242,242]},
    {label:'Issue Rate',      val: `${techRate}%`,    color:[255,251,235]},
  ];
  let bx = 14;
  boxes.forEach(b => {
    doc.setFillColor(...b.color); doc.roundedRect(bx,32,50,22,2,2,'F');
    doc.setTextColor(100); doc.setFont('helvetica','normal'); doc.setFontSize(7);
    doc.text(b.label, bx+4, 38);
    doc.setTextColor(15); doc.setFont('helvetica','bold'); doc.setFontSize(14);
    doc.text(b.val, bx+4, 49);
    bx += 54;
  });

  // Table label
  doc.setTextColor(80); doc.setFont('helvetica','bold'); doc.setFontSize(8);
  doc.text(`INDIVIDUAL RESPONSES (${total})`, 14, 62);

  autoTable(doc, {
    startY: 66,
    head: [['Date','Student','Student ID','Module','Instructor','Clarity','Nav Ease','Tech Issues','Feature Request']],
    body: feedbacks.map(f => [
      new Date(f.createdAt).toLocaleDateString(),
      f.user?.fullName || 'Anonymous',
      f.studentId || '—',
      f.moduleCode || '—',
      f.instructorName || '—',
      f.contentClarity ?? '—',
      f.navigationEase ?? '—',
      f.hasTechIssues === 'yes' ? 'Yes' : 'No',
      f.featureRequest || '—',
    ]),
    styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
    headStyles: { fillColor: [37,99,235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248,250,252] },
    columnStyles: {
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { halign: 'center' },
    },
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
      u.fullName||'Anonymous', u.email,
      u.admin?'Admin':'Student',
      u.enrollmentCount||0,
      `LKR ${(u.totalSpent||0).toLocaleString()}`,
      new Date(u.createdAt).toLocaleDateString(),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37,99,235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248,250,252] },
    columnStyles: { 3: {halign:'center'}, 4: {halign:'right'} },
  });
  doc.save('users-report.pdf');
};

const generateCoursesPDF = (courses) => {
  const doc = new jsPDF();
  doc.setFillColor(37,99,235); doc.rect(0,0,210,24,'F');
  doc.setTextColor(255); doc.setFont('helvetica','bold'); doc.setFontSize(16);
  doc.text('Courses Report', 14, 11);
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 19);
  autoTable(doc, {
    startY: 30,
    head: [['Title','Price','Students','Status']],
    body: courses.map(c=>[c.courseTitle,`₹${c.coursePrice}`,c.enrolledStudents?.length||0,c.isPublished?'Live':'Draft']),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37,99,235], textColor: 255, fontStyle: 'bold' },
  });
  doc.save('courses-report.pdf');
};

/* ═══════════════════════════════════════════════════════
   SMALL UI COMPONENTS
═══════════════════════════════════════════════════════ */
const ClarityDot = ({ value }) => {
  const v = Number(value) || 0;
  const cfg = v >= 4
    ? { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' }
    : v === 3
    ? { bg: 'bg-amber-100',   text: 'text-amber-700',   ring: 'ring-amber-200'   }
    : { bg: 'bg-red-100',     text: 'text-red-600',     ring: 'ring-red-200'     };
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      {v || '—'}
    </span>
  );
};

const ModulePill = ({ code }) => (
  <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold tracking-wide">
    {code || '—'}
  </span>
);

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

const DashStat = ({ label, value, icon: Icon, bg, iconColor }) => (
  <div className="border border-slate-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
    <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
    <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{label}</p>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export function AdminDashboardPage() {
  const [tab, setTab]             = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [users, setUsers]         = useState([]);
  const [courses, setCourses]     = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [fbSummary, setFbSummary] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [form, setForm]           = useState({ fullName:'', email:'', password:'', isAdmin:false, isActive:true });
  const [formErr, setFormErr]     = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const end = new Date(), start = new Date();
    start.setDate(start.getDate() - 30);
    await Promise.allSettled([
      api.get('/analytic/getAnalytic').then(r => setAnalytics(r.data)).catch(()=>{}),
      api.get('/analytic/getDailyData', { params: { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] } }).then(r => setDailyData(r.data)).catch(()=>{}),
      api.get('/analytic/topCourses').then(r => r.data.success && setTopCourses(r.data.data)).catch(()=>{}),
      api.get('/admin/users').then(r => r.data.success && setUsers(r.data.data)).catch(()=>{}),
      api.get('/getAllCourses').then(r => setCourses(Array.isArray(r.data.courses) ? r.data.courses : [])).catch(()=>{}),
      api.get('/feedback/summary').then(r => { if (r.data.success) { setFeedbacks(r.data.summary.feedbacks); setFbSummary(r.data.summary); } }).catch(()=>{}),
    ]);
    setLoading(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await api.delete(`/admin/users/${id}`); setUsers(u => u.filter(x => x._id !== id)); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };
  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try { await api.delete(`/deleteCourse/${id}`); setCourses(c => c.filter(x => x._id !== id)); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };
  const submitForm = async (e) => {
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
  const openEdit   = (u)  => { setModalMode('edit');   setForm({ ...u, isAdmin: u.admin, isActive: u.isActive !== false });                 setFormErr(''); setShowModal(true); };

  const downloadCSV = (headers, rows, filename) => {
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  const exportUsersCSV = () => downloadCSV(
    ['Name','Email','Role','Enrollments','Total Spent','Joined'],
    users.map(u => [u.fullName||'Anonymous', u.email, u.admin?'Admin':'Student', u.enrollmentCount||0, `LKR ${(u.totalSpent||0).toLocaleString()}`, new Date(u.createdAt).toLocaleDateString()]),
    'users-report.csv'
  );
  const exportCoursesCSV = () => downloadCSV(
    ['Title','Price','Students','Status'],
    courses.map(c => [c.courseTitle, `₹${c.coursePrice}`, c.enrolledStudents?.length||0, c.isPublished?'Live':'Draft']),
    'courses-report.csv'
  );
  const exportTopCoursesCSV = () => downloadCSV(
    ['Title','Enrollments','Price','Revenue'],
    topCourses.map(c => [c.title, c.enrollmentCount, c.amount, c.revenue?.toFixed(0)||0]),
    'top-courses-report.csv'
  );
  const exportRevenueCSV = () => downloadCSV(
    ['Date','Revenue','Enrollments'],
    dailyData.map(d => [d.date, d.revenue||0, d.enrollments||0]),
    'revenue-report.csv'
  );

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const fbTotal   = feedbacks.length;
  const fbClarity = fbTotal ? (feedbacks.reduce((a,f)=>a+(f.contentClarity||0),0)/fbTotal).toFixed(1) : '0';
  const fbNav     = fbTotal ? (feedbacks.reduce((a,f)=>a+(f.navigationEase||0),0)/fbTotal).toFixed(1)  : '0';
  const fbTech    = feedbacks.filter(f=>f.hasTechIssues==='yes').length;
  const fbRate    = fbTotal ? ((fbTech/fbTotal)*100).toFixed(1) : '0';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/>
        <p className="text-sm font-semibold text-slate-400">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <button onClick={fetchAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
            <RefreshCw className="h-3.5 w-3.5"/> Refresh
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-slate-200 mb-8">
          {['dashboard','users','content','reports'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold capitalize transition-colors ${tab===t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
              {t === 'dashboard' ? 'Dashboard' : t === 'users' ? 'Users' : t === 'content' ? 'Content' : 'Reports'}
            </button>
          ))}
        </div>

        {/* ════════════════════
            DASHBOARD
        ════════════════════ */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <DashStat label="Total Users"    value={analytics?.users||0}                           icon={Users}      bg="bg-blue-50"   iconColor="text-blue-600"/>
              <DashStat label="Active Courses" value={analytics?.courses||0}                          icon={BookOpen}   bg="bg-emerald-50" iconColor="text-emerald-600"/>
              <DashStat label="Enrollments"    value={analytics?.totalEnrollments||0}                 icon={TrendingUp} bg="bg-orange-50"  iconColor="text-orange-600"/>
              <DashStat label="Net Revenue"    value={`₹${(analytics?.totalRevenue||0).toFixed(0)}`} icon={DollarSign} bg="bg-violet-50"  iconColor="text-violet-600"/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-5">Revenue – Last 30 Days</h3>
                {dailyData.length > 0 ? (
                  <div className="h-52"><ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.12}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="date" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{borderRadius:10,border:'none',boxShadow:'0 4px 20px rgba(0,0,0,.08)',fontSize:12}}/>
                      <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#rg)" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer></div>
                ) : <div className="h-52 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl"><p className="text-slate-300 text-sm font-semibold">No data yet</p></div>}
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-5">Enrollments – Last 30 Days</h3>
                {dailyData.length > 0 ? (
                  <div className="h-52"><ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} barSize={8}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="date" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{borderRadius:10,border:'none',boxShadow:'0 4px 20px rgba(0,0,0,.08)',fontSize:12}}/>
                      <Bar dataKey="enrollments" fill="#10b981" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer></div>
                ) : <div className="h-52 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl"><p className="text-slate-300 text-sm font-semibold">No data yet</p></div>}
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                <h3 className="font-bold text-slate-800">Top Performing Courses</h3>
                <button onClick={()=>generateCoursesPDF(courses)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                  <Download className="h-4 w-4"/> Export PDF
                </button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course</th>
                  <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Students</th>
                  <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revenue</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {topCourses.length > 0 ? topCourses.map((c,i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{c.title}</td>
                      <td className="px-4 py-3.5 text-center text-slate-600">{c.enrollmentCount}</td>
                      <td className="px-4 py-3.5 text-center text-slate-600">₹{c.amount}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-900">₹{c.revenue?.toFixed(0)||'0'}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="py-12 text-center text-slate-300 text-sm font-semibold">No data yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════
            USERS  ← polished
        ════════════════════ */}
        {tab === 'users' && (
          <div className="space-y-5">

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/60">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-600 rounded-xl shadow-md shadow-blue-600/20">
                        <UserPlus className="h-4 w-4 text-white"/>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{modalMode==='create' ? 'Add New User' : 'Edit User'}</p>
                        <p className="text-xs text-slate-400">{modalMode==='create' ? 'Create a platform account' : 'Update account details'}</p>
                      </div>
                    </div>
                    <button onClick={()=>setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                      <X className="h-4 w-4 text-slate-400"/>
                    </button>
                  </div>
                  <form onSubmit={submitForm} className="p-6 space-y-4">
                    {/* Name + Email + Password — create mode only */}
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

                    {/* Administrator role toggle — always visible */}
                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isAdmin ? 'bg-blue-600':'bg-slate-200'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isAdmin ? 'left-5':'left-0.5'}`}/>
                      </div>
                      <input type="checkbox" className="sr-only" checked={form.isAdmin} onChange={e=>setForm(v=>({...v,isAdmin:e.target.checked}))}/>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">Administrator Role</p>
                        <p className="text-xs text-slate-400">Grants full platform access</p>
                      </div>
                      {form.isAdmin && <Shield className="h-4 w-4 text-blue-500"/>}
                    </label>

                    {/* User Status toggle — edit mode only */}
                    {modalMode === 'edit' && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">User Status</p>
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <button
                            type="button"
                            onClick={() => setForm(v => ({ ...v, isActive: true }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all duration-200 ${
                              form.isActive
                                ? 'bg-emerald-500 text-white shadow-inner'
                                : 'bg-white text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${form.isActive ? 'bg-white' : 'bg-slate-300'}`}/>
                            Active
                          </button>
                          <div className="w-px bg-slate-200"/>
                          <button
                            type="button"
                            onClick={() => setForm(v => ({ ...v, isActive: false }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all duration-200 ${
                              !form.isActive
                                ? 'bg-red-500 text-white shadow-inner'
                                : 'bg-white text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${!form.isActive ? 'bg-white' : 'bg-slate-300'}`}/>
                            Inactive
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {form.isActive ? 'User can log in and access the platform.' : 'User is blocked from accessing the platform.'}
                        </p>
                      </div>
                    )}
                    {formErr && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0"/>
                        <p className="text-sm text-red-600 font-medium">{formErr}</p>
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                      <button type="submit" disabled={formLoading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50">
                        {formLoading ? 'Saving…' : modalMode==='create' ? 'Create Account' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Pastel Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-blue-600 opacity-80 uppercase tracking-widest">Total Users</p>
                <p className="text-3xl font-black text-slate-800 leading-none mt-1">{users.length}</p>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-2xl px-5 py-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-violet-600 opacity-80 uppercase tracking-widest">Administrators</p>
                <p className="text-3xl font-black text-slate-800 leading-none mt-1">{users.filter(u=>u.admin).length}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-emerald-600 opacity-80 uppercase tracking-widest">Students</p>
                <p className="text-3xl font-black text-slate-800 leading-none mt-1">{users.filter(u=>!u.admin).length}</p>
              </div>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">

              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-violet-900 px-7 py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/15 border border-white/20 rounded-xl shadow-inner">
                    <Users className="h-5 w-5 text-white"/>
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">User Management</p>
                    <p className="text-blue-200 text-sm mt-0.5">Create, edit, and remove platform users</p>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="px-7 py-4 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400 transition-colors">
                    <Search className="h-4 w-4"/>
                  </div>
                  <input
                    type="text" value={userSearch} onChange={e=>setUserSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                  {userSearch && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                      {filtered.length} found
                    </span>
                  )}
                </div>
                <button onClick={()=>generateUsersPDF(users)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/25 whitespace-nowrap">
                  <Download className="h-4 w-4"/> Export PDF
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="text-left px-7 py-3.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider">NAME</th>
                      <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider">EMAIL</th>
                      <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider">ROLE</th>
                      <th className="text-center px-4 py-3.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider">ENROL.</th>
                      <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider">TOTAL SPENT</th>
                      <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider">JOINED</th>
                      <th className="text-right px-7 py-3.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.length > 0 ? filtered.map((u, idx) => (
                      <tr key={u._id} className={`border-b border-slate-50 transition-all duration-150 hover:bg-blue-50/40 ${idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}>
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-3">
                            {u.profilePhoto
                              ? <img src={u.profilePhoto} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"/>
                              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shrink-0">
                                  <Users className="h-4 w-4 text-slate-400"/>
                                </div>
                            }
                            <span className="font-semibold text-slate-900 text-sm">{u.fullName || 'Anonymous'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-blue-600 font-medium">{u.email}</td>
                        <td className="px-4 py-4"><RolePill isAdmin={u.admin}/></td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                            {u.enrollmentCount || 0}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-800">LKR {(u.totalSpent||0).toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-7 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={()=>openEdit(u)}
                              title="Edit user"
                              className="group/btn relative inline-flex items-center justify-center p-2 rounded-lg text-slate-400 bg-slate-50 border border-slate-200 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm hover:scale-105 active:scale-95 transition-all duration-150"
                            >
                              <Edit className="h-4 w-4"/>
                              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] font-semibold text-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-150 shadow-lg">Edit</span>
                            </button>
                            <button
                              onClick={()=>deleteUser(u._id)}
                              title="Delete user"
                              className="group/btn relative inline-flex items-center justify-center p-2 rounded-lg text-slate-400 bg-slate-50 border border-slate-200 hover:text-red-500 hover:bg-red-50 hover:border-red-200 hover:shadow-sm hover:scale-105 active:scale-95 transition-all duration-150"
                            >
                              <Trash2 className="h-4 w-4"/>
                              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] font-semibold text-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-150 shadow-lg">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={7} className="py-20 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Users className="h-7 w-7 text-slate-200"/>
                        </div>
                        <p className="text-slate-300 font-semibold text-sm">No users found</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              {filtered.length > 0 && (
                <div className="px-7 py-3 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">
                    Showing <span className="font-bold text-slate-600">{filtered.length}</span> of <span className="font-bold text-slate-600">{users.length}</span> users
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════
            CONTENT
        ════════════════════ */}
        {tab === 'content' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl"><Layers className="h-5 w-5 text-slate-500"/></div>
                <div>
                  <p className="font-bold text-slate-900 text-base">Course Management</p>
                  <p className="text-sm text-slate-400 mt-0.5">Create, edit and monitor your educational content</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>generateCoursesPDF(courses)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm">
                  <Download className="h-4 w-4 text-slate-400"/> Export PDF
                </button>
                <Link to="/admin/course/create">
                  <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20">
                    <Plus className="h-4 w-4"/> New Course
                  </button>
                </Link>
              </div>
            </div>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {courses.map(c => (
                  <div key={c._id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="relative h-40 bg-slate-100 overflow-hidden rounded-t-2xl">
                      {c.courseThumbnail
                        ? <img src={c.courseThumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-10 w-10 text-slate-200"/></div>
                      }
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${c.isPublished?'bg-blue-100 text-blue-700':'bg-slate-100 text-slate-500'}`}>
                          {c.isPublished?'Live':'Draft'}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/95 rounded-lg shadow-sm">
                        <span className="text-sm font-bold text-slate-900">₹{c.coursePrice}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-slate-900 line-clamp-2 text-sm mb-1.5">{c.courseTitle}</h4>
                      <p className="text-xs text-slate-400 mb-4 flex items-center gap-1"><Users className="h-3.5 w-3.5"/>{c.enrolledStudents?.length||0} enrolled</p>
                      <div className="flex gap-2">
                        <Link to={`/admin/course/${c._id}`} className="flex-1">
                          <button className="w-full py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all flex items-center justify-center gap-1">
                            <Edit className="h-3.5 w-3.5"/> Manage
                          </button>
                        </Link>
                        <button onClick={()=>deleteCourse(c._id)} className="p-2 rounded-xl border border-slate-200 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all">
                          <Trash2 className="h-3.5 w-3.5"/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-24 text-center">
                <BookOpen className="h-10 w-10 text-slate-100 mx-auto mb-3"/>
                <p className="font-bold text-slate-900 mb-1">No Courses Yet</p>
                <p className="text-sm text-slate-400 mb-5">Create your first course to get started.</p>
                <Link to="/admin/course/create">
                  <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
                    <Plus className="h-4 w-4 inline mr-1"/> Create Course
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════
            REPORTS ← polished
        ════════════════════ */}
        {tab === 'reports' && (
          <div className="space-y-6">

            {/* Section heading */}
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-slate-500"/>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Feedback Report</h2>
              </div>
              <p className="text-sm text-slate-400 ml-11">Overall summary and individual feedback from students</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <MetricCard label="Total Feedbacks" value={fbTotal}      colorClass="text-blue-600"   bg="bg-blue-50 border-blue-100"/>
              <MetricCard label="Avg Clarity"     value={fbClarity}   unit="/5"  colorClass="text-emerald-600" bg="bg-emerald-50 border-emerald-100"/>
              <MetricCard label="Avg Nav Ease"    value={fbNav}       unit="/10" colorClass="text-sky-600"     bg="bg-sky-50 border-sky-100"/>
              <MetricCard label="Tech Issues"     value={fbTech}      colorClass="text-red-600"    bg="bg-red-50 border-red-100"/>
              <MetricCard label="Issue Rate"      value={`${fbRate}%`}            colorClass="text-amber-600"  bg="bg-amber-50 border-amber-100"/>
            </div>

            {/* PDF Download Button */}
            <button
              onClick={()=>generateFeedbackPDF(feedbacks)}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200"
            >
              <Download className="h-4 w-4"/>
              Download Full Feedback Report (PDF)
            </button>

            {/* Individual Responses */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-7 py-4 border-b border-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Individual Responses ({fbTotal})
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      {['Date','Student','Module','Instructor','Clarity','Nav Ease','Tech Issues','Feature Request'].map(h => (
                        <th key={h} className={`py-3.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider ${
                          ['Clarity','Nav Ease','Tech Issues'].includes(h) ? 'text-center px-4' : 'text-left px-4 first:px-7 last:px-7'
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {feedbacks.length > 0 ? feedbacks.map((f,i) => (
                      <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                        <td className="pl-7 pr-4 py-4 text-xs text-slate-400 font-medium whitespace-nowrap">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900 text-sm leading-tight">{f.user?.fullName||'Anonymous'}</p>
                          {f.studentId && <p className="text-[11px] text-slate-400 mt-0.5">{f.studentId}</p>}
                        </td>
                        <td className="px-4 py-4"><ModulePill code={f.moduleCode}/></td>
                        <td className="px-4 py-4 text-sm text-slate-600">{f.instructorName||'—'}</td>
                        <td className="px-4 py-4 text-center"><ClarityDot value={f.contentClarity}/></td>
                        <td className="px-4 py-4 text-center font-bold text-slate-700 text-sm">{f.navigationEase??'—'}</td>
                        <td className="px-4 py-4 text-center"><TechPill value={f.hasTechIssues}/></td>
                        <td className="pl-4 pr-7 py-4 text-sm text-slate-500 max-w-[160px]">
                          <span className="truncate block" title={f.featureRequest}>{f.featureRequest||'—'}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={8} className="py-20 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <MessageSquare className="h-7 w-7 text-slate-200"/>
                        </div>
                        <p className="text-slate-300 font-semibold text-sm">No feedback submitted yet</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Reports & Export ── */}
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                  <Download className="h-5 w-5 text-slate-500"/>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Reports &amp; Export</h2>
              </div>
              <p className="text-sm text-slate-400 ml-11 mb-5">Export your data for analysis and reporting</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-slate-500"/><p className="font-bold text-slate-900">Users Report</p></div>
                  <p className="text-xs text-slate-400 mb-3">Export all user data</p>
                  <p className="text-sm text-slate-500 mb-4">{users.length} users in total</p>
                  <button onClick={exportUsersCSV} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/20">
                    <Download className="h-4 w-4"/> Export to CSV
                  </button>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1"><BookOpen className="h-4 w-4 text-slate-500"/><p className="font-bold text-slate-900">Courses Report</p></div>
                  <p className="text-xs text-slate-400 mb-3">Export all course data</p>
                  <p className="text-sm text-slate-500 mb-4">{courses.length} courses in total</p>
                  <button onClick={exportCoursesCSV} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/20">
                    <Download className="h-4 w-4"/> Export to CSV
                  </button>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-slate-500"/><p className="font-bold text-slate-900">Top Courses Report</p></div>
                  <p className="text-xs text-emerald-500 font-medium mb-3">Export top performing courses</p>
                  <p className="text-sm text-slate-500 mb-4">{topCourses.length} top courses</p>
                  <button onClick={exportTopCoursesCSV} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/20">
                    <Download className="h-4 w-4"/> Export to CSV
                  </button>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-slate-500"/><p className="font-bold text-slate-900">Revenue Report</p></div>
                  <p className="text-xs text-slate-400 mb-3">Export revenue data</p>
                  <p className="text-sm text-slate-500 mb-4">₹{(analytics?.totalRevenue||0).toFixed(0)} total revenue</p>
                  <button onClick={exportRevenueCSV} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/20">
                    <Download className="h-4 w-4"/> Export to CSV
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
