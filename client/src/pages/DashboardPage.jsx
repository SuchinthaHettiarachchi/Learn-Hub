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
  IndianRupee,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Users,
  ChevronRight,
  Star,
  MessageSquare
} from 'lucide-react';

export function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState([]);

  // --- Feedback සදහා අවශ්‍ය State ටික ---
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState({ loading: false, message: '', type: '' });

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

  // --- Feedback Submit කරන Function එක ---
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0 || !comment.trim()) {
      setFeedbackStatus({ loading: false, message: 'Please provide both a rating and a comment.', type: 'error' });
      return;
    }

    setFeedbackStatus({ loading: true, message: '', type: '' });

    try {
      const response = await api.post('/feedback/submit', { rating, comment });
      if (response.data.success) {
        setFeedbackStatus({ loading: false, message: 'Thank you! Your feedback has been submitted.', type: 'success' });
        setRating(0);
        setComment('');
        
        // තත්පර 3කින් success message එක මැකෙන්න
        setTimeout(() => {
          setFeedbackStatus({ loading: false, message: '', type: '' });
        }, 3000);
      }
    } catch (error) {
      setFeedbackStatus({ 
        loading: false, 
        message: error.response?.data?.message || 'Failed to submit feedback. Please try again.', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* HERO */}
      <section className="hero-section hero-section-dark p-8 md:p-12 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-900 mt-6 mx-4 md:mx-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Explore Courses
            </h1>
          </div>

          <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
            Learn in-demand skills with structured, industry-focused courses taught by industry experts.
          </p>

          {user && (
            <div className="flex items-center gap-2 text-blue-50 pt-4 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
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
                    <div className="flex items-center gap-1 font-bold text-lg text-blue-600 dark:text-blue-400">
                      <IndianRupee className="h-5 w-5" />
                      {course.amount}
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
                        Explore
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

      {/* --- අලුතින් එකතු කරපු FEEDBACK FORM එක --- */}
      <section className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Share Your Feedback</h2>
            <p className="text-slate-600 dark:text-slate-400">Let us know about your learning experience on LearnHub.</p>
          </div>
        </div>

        <form onSubmit={handleFeedbackSubmit} className="space-y-6 max-w-2xl">
          
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Rate your experience
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors duration-200 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Box */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you loved or what we can improve..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            ></textarea>
          </div>

          {/* Messages */}
          {feedbackStatus.message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${
              feedbackStatus.type === 'error' 
                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800' 
                : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800'
            }`}>
              {feedbackStatus.message}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={feedbackStatus.loading}
            className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {feedbackStatus.loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </section>

    </div>
  );
}