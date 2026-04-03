import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Search,
  BookOpen,
  DollarSign,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Users,
  ChevronRight,
  Star,
  MessageSquare,
  Send,
  CheckCircle2
} from 'lucide-react';

export function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState([]);

  // --- Feedback Form States ---
  const [formData, setFormData] = useState({
    studentId: '', phone: '', academicYear: '',
    moduleCode: '', instructorName: '', platformSection: '',
    contentClarity: 0, navigationEase: 5, featureRequest: ''
  });
  
  const [feedbackStatus, setFeedbackStatus] = useState({ loading: false, message: '', type: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCourses();
    fetchPurchasedCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/getCourse', {
        params: searchQuery ? { search: searchQuery } : {},
      });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedCourses = async () => {
    try {
      const response = await api.get('/getAllCoursePurchase');
      const purchasedIds = (response.data.courses || []).map((c) => c._id);
      setPurchasedCourses(purchasedIds);
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const isPurchased = (courseId) => purchasedCourses.includes(courseId);

  // --- Feedback Submit Function ---
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Form Validations
    if (!formData.studentId.trim()) newErrors.studentId = true;
    if (!formData.moduleCode.trim()) newErrors.moduleCode = true;
    if (formData.contentClarity === 0) newErrors.contentClarity = true;
    if (formData.phone && formData.phone.length !== 10) newErrors.phone = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      
      if (errorElement) {
        const y = errorElement.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
        
        if (firstErrorField !== 'contentClarity') {
            setTimeout(() => errorElement.focus(), 500);
        }
      }
      return; 
    }

    setErrors({});
    setFeedbackStatus({ loading: true, message: '', type: '' });

    try {
      const response = await api.post('/feedback/submit', formData);
      
      if (response.data.success) {
        setFeedbackStatus({ loading: false, message: 'Feedback submitted successfully.', type: 'success' });
        
        setFormData({
          studentId: '', phone: '', academicYear: '',
          moduleCode: '', instructorName: '', platformSection: '',
          contentClarity: 0, navigationEase: 5, featureRequest: ''
        });
        
        setTimeout(() => setFeedbackStatus({ loading: false, message: '', type: '' }), 5000);
      }
    } catch (error) {
      setFeedbackStatus({ 
        loading: false, 
        message: error.response?.data?.message || 'Failed to submit feedback. Please try again.', 
        type: 'error' 
      });
    }
  };

  // UI Classes for Feedback Form
  const inputBaseClass = "w-full h-12 px-4 rounded-xl border text-[15px] transition-all duration-300 focus:outline-none focus:ring-4 placeholder:text-slate-400 dark:bg-slate-900/50";
  const normalInputClass = "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 hover:border-blue-300 dark:hover:border-blue-600 bg-white/50";
  const errorInputClass = "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-900/10";

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* HERO */}
      <section className="hero-section hero-section-dark p-8 md:p-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Explore Courses
            </h1>
          </div>

          <p className="text-white/90 max-w-2xl text-lg">
            Learn in-demand skills with structured, industry-focused courses taught by industry experts.
          </p>

          {user && (
            <div className="flex items-center gap-2 text-white/80 pt-4">
              <Users className="h-5 w-5" />
              <span className="font-medium">Welcome back, {user.fullName}! 👋</span>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      {!loading && courses.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Courses</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-2">{courses.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">My Courses</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-2">{purchasedCourses.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Learning Path</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-2 flex items-center gap-2">
                  Personalized
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SEARCH */}
      <section>
        <form onSubmit={handleSearch}>
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses (MERN Stack, AI, DevOps, Mobile Development...)"
                  className="pl-11 h-12 text-base rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <Button type="submit" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </form>
      </section>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-b-blue-600" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-lg">Loading amazing courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-16 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2">No courses found</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Try searching with different keywords or explore all available courses.
          </p>
        </div>
      ) : (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Available Courses
              <span className="ml-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                {courses.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <div
                key={course._id}
                className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 flex flex-col"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 dark:from-blue-900/20 dark:to-slate-900">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-lg line-clamp-2 mb-2 text-slate-900 dark:text-slate-50">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold">
                      <span>FREE</span>
                    </div>
                    {course.modules && (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {course.modules.length} modules
                      </span>
                    )}
                  </div>

                  {isPurchased(course._id) ? (
                    <Link
                      to={`/course/${course._id}/learn`}
                      className="block"
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all">
                        <GraduationCap className="h-4 w-4" />
                        Continue Learning
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/course/${course._id}`} className="block">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all">
                        View Course
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- PLATFORM FEEDBACK FORM --- */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mt-16">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[30rem] h-[30rem] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-5 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800/60">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Platform Feedback</h2>
            <p className="text-slate-500 mt-1 font-medium">Help us craft the perfect learning experience for you.</p>
          </div>
        </div>

        <form onSubmit={handleFeedbackSubmit} className="relative z-10 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. Academic Details Panel */}
            <div className="p-7 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-700/50 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Users className="h-4 w-4"/> Academic Information
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  Student / Staff ID {errors.studentId ? <span className="text-red-500 text-lg leading-none">*</span> : <span className="text-blue-500 text-lg leading-none">*</span>}
                </label>
                <input 
                  id="studentId" 
                  value={formData.studentId} 
                  onChange={(e) => {
                    setFormData({...formData, studentId: e.target.value});
                    if (errors.studentId) setErrors({...errors, studentId: false});
                  }} 
                  placeholder="e.g. IT21000000" 
                  className={`${inputBaseClass} ${errors.studentId ? errorInputClass : normalInputClass}`}
                />
                {errors.studentId && <p className="text-[13px] font-semibold text-red-500 flex items-center gap-1 mt-1.5"><Sparkles className="w-3 h-3"/> This field is required.</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input 
                  id="phone"
                  type="text" 
                  maxLength="10"
                  value={formData.phone} 
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({...formData, phone: onlyNums});
                    if (errors.phone) setErrors({...errors, phone: false});
                  }} 
                  placeholder="07XXXXXXXX" 
                  className={`${inputBaseClass} ${errors.phone ? errorInputClass : normalInputClass}`}
                />
                {errors.phone && <p className="text-[13px] font-semibold text-red-500 flex items-center gap-1 mt-1.5"><Sparkles className="w-3 h-3"/> Must be exactly 10 digits.</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Academic Year / Semester</label>
                <select 
                  value={formData.academicYear} 
                  onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                  className={`${inputBaseClass} ${normalInputClass} appearance-none cursor-pointer text-slate-600 dark:text-slate-300`}
                >
                  <option value="">Select Year and Semester</option>
                  <option value="Y1S1">Year 1 - Semester 1</option>
                  <option value="Y1S2">Year 1 - Semester 2</option>
                  <option value="Y2S1">Year 2 - Semester 1</option>
                  <option value="Y2S2">Year 2 - Semester 2</option>
                  <option value="Y3S1">Year 3 - Semester 1</option>
                  <option value="Y3S2">Year 3 - Semester 2</option>
                  <option value="Y4S1">Year 4 - Semester 1</option>
                  <option value="Y4S2">Year 4 - Semester 2</option>
                </select>
              </div>
            </div>

            {/* 2. Course Context Panel */}
            <div className="p-7 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-700/50 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4"/> Course Context
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  Module Code / Name {errors.moduleCode ? <span className="text-red-500 text-lg leading-none">*</span> : <span className="text-blue-500 text-lg leading-none">*</span>}
                </label>
                <input 
                  id="moduleCode"
                  value={formData.moduleCode} 
                  onChange={(e) => {
                    setFormData({...formData, moduleCode: e.target.value});
                    if (errors.moduleCode) setErrors({...errors, moduleCode: false});
                  }} 
                  placeholder="e.g. IT3040" 
                  className={`${inputBaseClass} ${errors.moduleCode ? errorInputClass : normalInputClass}`}
                />
                {errors.moduleCode && <p className="text-[13px] font-semibold text-red-500 flex items-center gap-1 mt-1.5"><Sparkles className="w-3 h-3"/> This field is required.</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Instructor Name</label>
                <input 
                  value={formData.instructorName} 
                  onChange={(e) => setFormData({...formData, instructorName: e.target.value})} 
                  placeholder="Name of the lecturer" 
                  className={`${inputBaseClass} ${normalInputClass}`}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Platform Section</label>
                <select 
                  value={formData.platformSection} 
                  onChange={(e) => setFormData({...formData, platformSection: e.target.value})}
                  className={`${inputBaseClass} ${normalInputClass} appearance-none cursor-pointer text-slate-600 dark:text-slate-300`}
                >
                  <option value="">Where did you face the issue?</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="Video Player">Course Video Player</option>
                  <option value="Assignments">Assignments Submission</option>
                  <option value="Quizzes">Quizzes & Exams</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

          </div>

          {/* 3. Qualitative Feedback Panel */}
          <div className="p-7 md:p-10 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-10">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
               Qualitative Feedback
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div 
                id="contentClarity" 
                className={`p-5 rounded-2xl transition-all duration-300 ${errors.contentClarity ? "bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50" : "bg-transparent"}`}
              >
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  Content Clarity {errors.contentClarity ? <span className="text-red-500 text-lg leading-none">*</span> : <span className="text-blue-500 text-lg leading-none">*</span>}
                </label>
                <p className={`text-sm mb-4 ${errors.contentClarity ? "text-red-500 font-semibold" : "text-slate-500"}`}>
                  {errors.contentClarity ? "Please select a rating to continue." : "How clear was the course material provided?"}
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      onClick={() => {
                        setFormData({...formData, contentClarity: star});
                        if (errors.contentClarity) setErrors({...errors, contentClarity: false});
                      }}
                      className={`h-10 w-10 cursor-pointer transition-all duration-200 hover:scale-110 ${star <= formData.contentClarity ? "fill-yellow-400 text-yellow-400 drop-shadow-md" : "fill-slate-100 text-slate-200 dark:fill-slate-800 dark:text-slate-700 hover:fill-yellow-100 hover:text-yellow-200"}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="p-5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Navigation Ease (1-10)</label>
                <p className="text-sm text-slate-500 mb-6">How easy was it to find your assignments? <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md ml-1">{formData.navigationEase}/10</span></p>
                
                <input 
                  type="range" min="1" max="10" 
                  value={formData.navigationEase} 
                  onChange={(e) => setFormData({...formData, navigationEase: Number(e.target.value)})}
                  className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-shadow"
                />
                <div className="flex justify-between text-[13px] font-semibold text-slate-400 mt-3 px-1">
                  <span>Very Hard</span>
                  <span>Very Easy</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Additional Comments</label>
              <textarea
                rows="4" 
                value={formData.featureRequest}
                onChange={(e) => setFormData({...formData, featureRequest: e.target.value})}
                placeholder="What is one feature missing from this LMS? Or share any other thoughts..."
                className={`w-full p-4 rounded-2xl border text-[15px] leading-relaxed transition-all duration-300 focus:outline-none focus:ring-4 placeholder:text-slate-400 dark:bg-slate-900/50 resize-none ${normalInputClass}`}
              ></textarea>
            </div>
          </div>

          {/* Form Footer / Submit Area */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
            <div className="w-full sm:flex-1">
              {feedbackStatus.type === 'success' && (
                <div className="px-5 py-3.5 rounded-xl text-sm font-bold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5"/> {feedbackStatus.message}
                </div>
              )}
              {feedbackStatus.type === 'error' && (
                <div className="px-5 py-3.5 rounded-xl text-sm font-bold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20 flex items-center gap-2 animate-fade-in">
                  <Sparkles className="w-5 h-5"/> {feedbackStatus.message}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={feedbackStatus.loading}
              className="w-full sm:w-auto px-10 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-extrabold text-base shadow-[0_8px_20px_rgb(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgb(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              {feedbackStatus.loading ? 'Submitting...' : 'Submit Feedback'}
              {!feedbackStatus.loading && <Send className="w-4 h-4 ml-1" />}
            </Button>
          </div>

        </form>
      </section>

    </div>
  );
}
