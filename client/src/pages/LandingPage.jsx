import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
    BookOpen,
    Users,
    Award,
    ArrowRight,
    CheckCircle2,
    Star,
    Clock,
    Code,
    Smartphone,
    Database,
    TrendingUp,
    Zap,
    Video,
    Sparkles,
} from 'lucide-react';
import api from '../lib/api';

export function LandingPage() {
    const [testimonials, setTestimonials] = useState([]);
    const [testimonialsLoading, setTestimonialsLoading] = useState(true);

    // Fallback dummy testimonials shown when there are no real feedbacks yet
    const dummyTestimonials = [
        {
            quote: 'This platform completely transformed my career. The content is practical and the instructors are genuinely invested in your success.',
            author: 'Sarah Chen',
            role: 'Full Stack Developer at Google',
            avatar: 'SC',
            rating: 5,
        },
        {
            quote: "The best online learning experience I've had. Clear explanations, great projects, and amazing community support.",
            author: 'Rajesh Kumar',
            role: 'Mobile Developer at Microsoft',
            avatar: 'RK',
            rating: 5,
        },
        {
            quote: 'Affordable, comprehensive, and beautifully designed. Highly recommend LearnHub to anyone serious about learning.',
            author: 'Emma Wilson',
            role: 'UI/UX Designer at Adobe',
            avatar: 'EW',
            rating: 5,
        },
    ];

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await api.get('/feedback/summary');
                if (response.data.success && response.data.summary.feedbacks.length > 0) {
                    // Map real feedbacks → testimonial shape, take the 3 newest
                    const real = response.data.summary.feedbacks
                        .slice(0, 3)
                        .map(f => {
                            const name = f.user?.fullName || f.user?.email || 'Student';
                            const initials = name
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2);
                            const clarity = f.contentClarity ?? 0;
                            const module = f.moduleCode || 'General';
                            return {
                                quote: f.featureRequest?.trim() ||
                                    (clarity
                                        ? `Rated this platform ${clarity}/5 for content clarity.`
                                        : 'Great learning experience on this platform!'),
                                author: name,
                                role: `Module: ${module}${f.instructorName ? ` · ${f.instructorName}` : ''}`,
                                avatar: initials,
                                rating: clarity ? Math.min(5, Math.max(1, Math.round(clarity))) : 5,
                            };
                        });
                    setTestimonials(real);
                } else {
                    setTestimonials(dummyTestimonials);
                }
            } catch {
                setTestimonials(dummyTestimonials);
            } finally {
                setTestimonialsLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);


    const stats = [
        { number: '10K+', label: 'Students', icon: Users },
        { number: '50+', label: 'Instructors', icon: BookOpen },
        { number: '100+', label: 'Courses', icon: Video },
        { number: '95%', label: 'Satisfaction', icon: Star },
    ];

    const features = [
        {
            icon: Sparkles,
            title: 'Expert-Led Courses',
            description: 'Learn from industry professionals with years of experience',
        },
        {
            icon: TrendingUp,
            title: 'Track Progress',
            description: 'Monitor your learning with detailed progress analytics',
        },
        {
            icon: Award,
            title: 'Earn Certificates',
            description: 'Get recognized credentials upon course completion',
        },
        {
            icon: Clock,
            title: 'Learn at Your Pace',
            description: 'Study whenever and wherever you want with lifetime access',
        },
        {
            icon: Users,
            title: 'Community Support',
            description: 'Connect with instructors and fellow learners',
        },
        {
            icon: Zap,
            title: 'AI-Powered Quizzes',
            description: 'Smart assessments tailored to your learning style',
        },
    ];

    const courses = [
        {
            title: 'Full Stack MERN Development',
            description: 'Master MongoDB, Express, React, and Node.js',
            icon: Code,
            badge: 'Intermediate',
            students: '2.5K+',
        },
        {
            title: 'Mobile App Development',
            description: 'Build iOS and Android applications from scratch',
            icon: Smartphone,
            badge: 'Intermediate',
            students: '1.8K+',
        },
        {
            title: 'Advanced Database Design',
            description: 'Design scalable and optimized databases',
            icon: Database,
            badge: 'Advanced',
            students: '1.2K+',
        },
    ];



    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">

            {/* Hero Section */}
            <section className="pt-32 pb-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20 pointer-events-none" />
                <div className="absolute inset-0 -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20 pointer-events-none" />

                <div className="container mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-slate-900 dark:text-white">
                                    Learn Skills That <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Matter</span>
                                </h1>
                                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                                    Master in-demand skills with expert-led courses. Join thousands of successful learners advancing their careers.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register" className="flex-1 sm:flex-none">
                                    <Button className="w-full sm:w-auto h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg gap-2 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all">
                                        Start Learning Now
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <button
                                    style={{
                                        height: '3rem',
                                        padding: '0 1.5rem',
                                        borderRadius: '0.5rem',
                                        border: '2px solid #2563EB',
                                        background: 'transparent',
                                        color: '#2563EB',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
                                        letterSpacing: '0.01em',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = '#2563EB';
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.boxShadow = '0 4px 18px 0 rgba(37,99,235,0.35)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#2563EB';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    Learn More
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-6 pt-8">
                                {stats.map((stat, idx) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.number}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right - Hero Image/Card */}
                        <div className="relative lg:h-96 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-950/30 rounded-3xl blur-2xl opacity-50" />
                            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                {/* Video Placeholder */}
                                <div className="aspect-video bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    </div>
                                    <button className="relative p-4 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm">
                                        <svg className="h-12 w-12 text-white fill-current" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Card Content */}
                                <div className="p-6 space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Why Choose LearnHub?</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Expert instructors</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Lifetime access</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Certificates</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">Platform Features</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Everything You Need to Succeed</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Comprehensive tools and features designed for effective learning</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={idx}
                                    className="group p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="p-3 w-fit bg-blue-50 dark:bg-blue-900/30 rounded-xl mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section id="courses" className="py-24 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">Popular Courses</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Start Your Learning Journey</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Choose from our most in-demand courses</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course, idx) => {
                            const Icon = course.icon;
                            return (
                                <div
                                    key={idx}
                                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all duration-300 flex flex-col"
                                >
                                    {/* Course Header */}
                                    <div className="h-40 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                                        <div className="absolute inset-0 opacity-10 bg-gradient-to-t from-black/50 to-transparent" />
                                        <Icon className="h-16 w-16 text-white opacity-80 relative" />
                                    </div>

                                    {/* Course Info */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-1">{course.description}</p>

                                        {/* Course Meta */}
                                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center justify-between">
                                                <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg">
                                                    {course.badge}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {course.students} learning
                                                </span>
                                            </div>

                                            <Link to="/register" className="block">
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                                                    Explore Course
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* View All Link */}
                    <div className="text-center mt-12">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all">
                            View All Courses
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">Testimonials</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Trusted by Thousands</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">See what our successful students have to say</p>
                    </div>

                    {testimonialsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
                                    <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <div key={j} className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700" />)}</div>
                                    <div className="space-y-3 mb-6">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-40" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testimonials.map((testimonial, idx) => (
                                <div
                                    key={idx}
                                    className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300"
                                >
                                    {/* Rating stars — dynamic from contentClarity */}
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${
                                                    i < (testimonial.rating ?? 5)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-6">
                                        "{testimonial.quote}"
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-sm">{testimonial.avatar}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700" />
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto relative z-10 text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Transform Your Career?</h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Join over 10,000 students who have already started their learning journey with LearnHub
                        </p>
                    </div>
                        <br/>
                    <Link to="/register">
                        <Button className="h-12 px-8 bg-white text-blue-600 hover:bg-slate-100 font-bold text-lg rounded-lg shadow-xl hover:shadow-2xl transition-all">
                            Get Started Free Today
                        </Button>
                    </Link>
                </div>
            </section>
            
        </div>
    );
}
