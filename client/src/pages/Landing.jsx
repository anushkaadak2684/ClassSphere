import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Video,
  MessageSquare,
  FileText,
  CheckCircle2,
  BarChart3,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
  Laptop,
  Check,
  Compass,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';

export const Landing = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Video,
      title: 'Real-Time Virtual Classes',
      description:
        'Interactive live video lectures powered by low-latency WebRTC mesh, camera & microphone controls, and instant screen sharing.',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      icon: MessageSquare,
      title: 'Persistent Live Chat',
      description:
        'Engage during class with instant messaging, announcements, participant presence, and digital hand-raising.',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      icon: FileText,
      title: 'Learning Materials & Handouts',
      description:
        'Upload and distribute lecture slides, PDF documents, code snippets, and archive resources directly to your students.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      icon: CheckCircle2,
      title: 'Assignments & Submissions',
      description:
        'Create structured coursework with due dates, collect student archive submissions, and provide numerical marks with qualitative feedback.',
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      icon: Users,
      title: 'Automated Attendance Tracking',
      description:
        'Automatically record student session entry, leave times, and total duration with zero manual roll-call required.',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      icon: BarChart3,
      title: 'Performance & Progress Analytics',
      description:
        'Real-time database-calculated completion metrics, attendance rates, and average grade analytics for teachers and students.',
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Class<span className="text-brand-600">Sphere</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                v1.0 MVP
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
              How It Works
            </a>
            <a href="#architecture" className="hover:text-brand-600 transition-colors">
              Platform
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="md" icon={ArrowRight}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modern Real-Time Virtual Education Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Learn. Teach. Connect.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                In Real Time.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 font-normal leading-relaxed">
              A comprehensive virtual classroom platform for educators and learners. Built with live WebRTC video,
              cloud course materials, interactive assignments, automated attendance, and real-time progress analytics.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button variant="primary" size="xl" icon={ArrowRight} className="w-full sm:w-auto shadow-lg shadow-brand-500/20">
                    Open Your Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button variant="primary" size="xl" icon={ArrowRight} className="w-full sm:w-auto shadow-lg shadow-brand-500/20">
                      Get Started as Teacher or Student
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="outline" size="xl" className="w-full sm:w-auto">
                      Sign In to Classroom
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Firebase Auth & RBAC
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                Peer-to-Peer WebRTC
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-600" />
                MongoDB Atlas Backed
              </span>
            </div>
          </div>

          {/* Hero Interface Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl p-2 bg-slate-900/5 border border-slate-200/80 shadow-2xl">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner">
              {/* Window Header Mockup */}
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono text-slate-500">classsphere.internal/classrooms/hub</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Ready
                </div>
              </div>

              {/* Window Content Mockup */}
              <div className="p-6 sm:p-8 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">CS502 • Operating Systems</span>
                      <h3 className="text-lg font-bold text-slate-900">Virtual Classroom Overview</h3>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Session
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-xs text-slate-500">Course Materials</span>
                      <p className="text-base font-bold text-slate-800 mt-0.5">Slides & Code</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-xs text-slate-500">Assignments</span>
                      <p className="text-base font-bold text-slate-800 mt-0.5">Lab Coursework</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-xs text-slate-500">Attendance</span>
                      <p className="text-base font-bold text-slate-800 mt-0.5">Auto-Logged</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider">
                      <Video className="w-3.5 h-3.5" />
                      Live Theater Mode
                    </div>
                    <h4 className="text-base font-bold mt-1 text-slate-100">WebRTC Audio/Video</h4>
                    <p className="text-xs text-slate-400 mt-2">
                      Multi-user mesh video with screen sharing, participant muting, and instant chat drawer.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Role Moderation</span>
                    <span className="text-emerald-400 font-medium">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Capabilities</h2>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900">
              Everything Needed for Modern Virtual Education
            </p>
            <p className="text-slate-600 mt-3 text-sm">
              Engineered with clean architectural separation across real-time signaling, cloud file storage, and persistent database tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 group"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Workflow</h2>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900">
              Built Specifically for Teachers and Students
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Teacher Workflow */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">For Teachers</h3>
                  <p className="text-xs text-slate-500">Lead, distribute materials, and grade coursework</p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Create Virtual Classrooms</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Generate 6-character join codes and invite students with a single share.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Conduct Live Interactive Lectures</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Stream video, share screen, answer hand raises, and moderate participants.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Publish Assignments & Grade Submissions</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Attach starter handouts, review student solution archives, and input grades with personalized feedback.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Workflow */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">For Students</h3>
                  <p className="text-xs text-slate-500">Attend live sessions, turn in assignments, and track progress</p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Join via Classroom Code</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Enter unique class codes to enroll instantly in subjects and access materials.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Participate in Live Lectures</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Ask questions via real-time chat, raise your digital hand, and view instructor screens.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Turn in Submissions & Track Growth</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Submit homework files, view grades and comments, and inspect real-time progress analytics.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Summary Section */}
      <section id="architecture" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-4 border border-brand-500/30">
                <Compass className="w-3.5 h-3.5" />
                Production-Ready Stack
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Engineered for Academic Integrity & Real-Time Performance
              </h2>
              <p className="text-slate-300 mt-4 text-sm sm:text-base leading-relaxed">
                ClassSphere combines Firebase Client & Admin SDK token verification, persistent MongoDB Atlas collections, Cloudinary secure document storage, and peer-to-peer WebRTC mesh streaming.
              </p>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="block text-xl font-bold text-white">WebRTC</span>
                  <span className="text-xs text-slate-400 mt-1 block">Live Video Mesh</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="block text-xl font-bold text-white">Socket.io</span>
                  <span className="text-xs text-slate-400 mt-1 block">Presence & Chat</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="block text-xl font-bold text-white">MongoDB</span>
                  <span className="text-xs text-slate-400 mt-1 block">Mongoose Schemas</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="block text-xl font-bold text-white">Firebase</span>
                  <span className="text-xs text-slate-400 mt-1 block">Admin Token Auth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-brand-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to start learning and teaching?
          </h2>
          <p className="mt-4 text-base text-brand-100 max-w-xl mx-auto">
            Create your account today or sign into your existing classroom portal.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-brand-700 hover:bg-slate-100 shadow-md">
                Create Free Account
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white/60 hover:bg-white/10">
                Sign In to Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-white">ClassSphere</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
          </div>

          <div className="text-center md:text-right text-slate-500">
            <p>© {new Date().getFullYear()} ClassSphere Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
