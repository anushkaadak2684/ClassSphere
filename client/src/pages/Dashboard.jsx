import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  LogIn,
  BookOpen,
  Users,
  Video,
  Sparkles,
  RefreshCw,
  FileCheck2,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import classroomService from '../services/classroom.service';
import AppLayout from '../components/layout/AppLayout';
import ClassroomCard from '../components/classroom/ClassroomCard';
import CreateClassroomModal from '../components/classroom/CreateClassroomModal';
import JoinClassroomModal from '../components/classroom/JoinClassroomModal';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

export const Dashboard = () => {
  const { user, isTeacher, isStudent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Tab from query string
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'overview';

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classroomService.getClassrooms();
      setClassrooms(data || []);
    } catch (err) {
      console.error('[Dashboard fetchClassrooms error]:', err);
      setError(err.message || 'Failed to load classrooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleClassroomCreated = (newClassroom) => {
    setClassrooms((prev) => [newClassroom, ...prev]);
  };

  const handleClassroomJoined = (joinedClassroom) => {
    setClassrooms((prev) => [joinedClassroom, ...prev]);
  };

  // Real Database-backed stats (strictly calculated from real API records)
  const totalClassrooms = classrooms.length;
  const liveClassroomsCount = classrooms.filter((c) => c.isLive).length;
  const totalEnrolledStudents = classrooms.reduce((acc, c) => acc + (c.studentCount || 0), 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isTeacher ? 'Good morning, Professor' : 'Good morning';
    if (hour < 18) return isTeacher ? 'Good afternoon, Professor' : 'Good afternoon';
    return isTeacher ? 'Good evening, Professor' : 'Good evening';
  };

  const topbarActions = (
    <div className="flex items-center gap-2">
      {isTeacher ? (
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
          className="shadow-xs text-xs sm:text-sm"
        >
          Create Classroom
        </Button>
      ) : (
        <Button
          variant="primary"
          size="sm"
          icon={LogIn}
          onClick={() => setIsJoinOpen(true)}
          className="shadow-xs text-xs sm:text-sm"
        >
          Join Classroom
        </Button>
      )}
    </div>
  );

  return (
    <AppLayout
      title={isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'}
      subtitle={activeTab === 'overview' ? 'Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
      actions={topbarActions}
    >
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isTeacher ? 'Faculty Portal' : 'Student Workspace'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {getGreeting()} {user?.name ? user.name : ''}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            {isTeacher
              ? 'Manage your academic subjects, initiate live interactive WebRTC video lectures, post materials, and grade coursework.'
              : 'Access your enrolled classes, attend live interactive lectures, review materials, and track your coursework progress.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto relative z-10 shrink-0">
          {isTeacher ? (
            <Button
              variant="primary"
              size="lg"
              icon={Plus}
              onClick={() => setIsCreateOpen(true)}
              className="w-full md:w-auto shadow-md shadow-brand-500/10"
            >
              New Classroom
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              icon={LogIn}
              onClick={() => setIsJoinOpen(true)}
              className="w-full md:w-auto shadow-md shadow-brand-500/10"
            >
              Join with Code
            </Button>
          )}
        </div>
      </div>

      {/* Database-Backed Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Metric 1: Total Classrooms */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isTeacher ? 'My Classrooms' : 'Enrolled Classes'}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalClassrooms}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {totalClassrooms === 1 ? '1 active subject' : `${totalClassrooms} active subjects`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Live Sessions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Lectures</span>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{liveClassroomsCount}</p>
              {liveClassroomsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Now
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {liveClassroomsCount === 0 ? 'No live session active' : `${liveClassroomsCount} session in progress`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Students / Quick Info */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isTeacher ? 'Total Enrolled Students' : 'Academic Network'}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {isTeacher ? totalEnrolledStudents : totalClassrooms > 0 ? 'Connected' : 'Ready'}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {isTeacher ? 'Across all your classrooms' : 'Real-time database synchronized'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Area Based on Active Tab */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80">
          <Loader size="lg" text="Retrieving classrooms from database..." />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
          <ErrorMessage message={error} onRetry={fetchClassrooms} />
        </div>
      ) : activeTab === 'overview' || activeTab === 'classrooms' ? (
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {isTeacher ? 'My Active Classrooms' : 'My Enrolled Classes'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTeacher
                  ? 'Access live teaching theater, materials repository, and student assignments.'
                  : 'Join live video lectures, download course handouts, and view assignment feedback.'}
              </p>
            </div>
            <button
              onClick={fetchClassrooms}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh classrooms"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Classrooms Grid or Clean Empty State */}
          {classrooms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12">
              <EmptyState
                icon={BookOpen}
                title={isTeacher ? 'No classrooms created yet' : 'No classes enrolled yet'}
                description={
                  isTeacher
                    ? 'Get started by creating your first virtual classroom. You can share the generated 6-character code with your students.'
                    : 'You have not joined any classrooms yet. Enter the classroom code provided by your teacher to get started.'
                }
                action={
                  isTeacher ? (
                    <Button variant="primary" size="md" icon={Plus} onClick={() => setIsCreateOpen(true)}>
                      Create First Classroom
                    </Button>
                  ) : (
                    <Button variant="primary" size="md" icon={LogIn} onClick={() => setIsJoinOpen(true)}>
                      Join with Classroom Code
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((classroom) => (
                <ClassroomCard key={classroom._id} classroom={classroom} />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'assignments' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Assignments Hub</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select any classroom to review, submit, or grade assignments.
              </p>
            </div>
          </div>

          {classrooms.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No classrooms available"
              description="Join or create a classroom to access assignments."
            />
          ) : (
            <div className="space-y-4">
              {classrooms.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-200 hover:bg-slate-50/50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-500">{c.subject || 'General Academic'}</p>
                    </div>
                  </div>
                  <Link to={`/classrooms/${c._id}?tab=assignments`}>
                    <Button variant="outline" size="sm" icon={ArrowUpRight}>
                      View Assignments
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'progress' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isTeacher ? 'Classroom Progress & Roster' : 'My Academic Progress'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTeacher
                  ? 'Inspect performance and attendance breakdowns per classroom.'
                  : 'Track your attendance percentage, assignment grades, and submission completion.'}
              </p>
            </div>
          </div>

          {classrooms.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No progress data available"
              description="Progress metrics are calculated automatically once you participate in a classroom."
            />
          ) : (
            <div className="space-y-4">
              {classrooms.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-200 hover:bg-slate-50/50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-500">
                        {c.subject || 'General'} • Code: <span className="font-mono font-bold text-brand-700">{c.joinCode}</span>
                      </p>
                    </div>
                  </div>
                  <Link to={`/classrooms/${c._id}?tab=progress`}>
                    <Button variant="outline" size="sm" icon={ArrowUpRight}>
                      Open Progress Analytics
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Modals */}
      {isCreateOpen && (
        <CreateClassroomModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onClassroomCreated={handleClassroomCreated}
        />
      )}

      {isJoinOpen && (
        <JoinClassroomModal
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          onClassroomJoined={handleClassroomJoined}
        />
      )}
    </AppLayout>
  );
};

export default Dashboard;
