import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Video,
  Sparkles,
  RefreshCw,
  FileCheck2,
  BarChart3,
  ArrowRight,
  Plus,
  LogIn,
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

import { motion } from 'framer-motion';

export const Dashboard = () => {
  const { user, isTeacher, isStudent } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

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
          Join with Code
        </Button>
      )}
    </div>
  );

  return (
    <AppLayout
      title={isTeacher ? 'Faculty Dashboard' : 'Student Dashboard'}
      subtitle="Overview"
      actions={topbarActions}
    >
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-colors"
      >
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isTeacher ? 'Faculty Overview' : 'Student Overview'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()} {user?.name ? user.name : ''}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            {isTeacher
              ? 'Manage your academic subjects, initiate live interactive WebRTC video lectures, post materials, and grade coursework.'
              : 'Access your enrolled classes, attend live interactive lectures, review materials, and track your coursework progress.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto relative z-10 shrink-0">
          <Link to="/my-classes" className="w-full md:w-auto">
            <Button
              variant="outline"
              size="md"
              icon={ArrowRight}
              className="w-full md:w-auto bg-white/80 dark:bg-slate-800/80"
            >
              {isTeacher ? 'Manage Classrooms' : 'View My Classes'}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Database-Backed Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Metric 1: Total Classrooms */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isTeacher ? 'My Classrooms' : 'Enrolled Classes'}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{totalClassrooms}</p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              {totalClassrooms === 1 ? '1 active subject' : `${totalClassrooms} active subjects`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Metric 2: Live Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Live Lectures</span>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{liveClassroomsCount}</p>
              {liveClassroomsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Now
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              {liveClassroomsCount === 0 ? 'No live session active' : `${liveClassroomsCount} session in progress`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Metric 3: Students / Network */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between sm:col-span-2 lg:col-span-1 transition-colors"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isTeacher ? 'Total Enrolled Students' : 'Academic Network'}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {isTeacher ? totalEnrolledStudents : totalClassrooms > 0 ? 'Connected' : 'Ready'}
            </p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              {isTeacher ? 'Across all your classrooms' : 'Real-time database synchronized'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Main Content: Overview Classroom Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {isTeacher ? 'Active Classrooms' : 'Enrolled Subjects'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isTeacher
                ? 'Quick access to your classrooms and live video sessions.'
                : 'Join active lectures and access course materials.'}
            </p>
          </div>
          <button
            onClick={fetchClassrooms}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh classrooms"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
            <Loader size="lg" text="Retrieving classrooms from database..." />
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800">
            <ErrorMessage message={error} onRetry={fetchClassrooms} />
          </div>
        ) : classrooms.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 transition-colors">
            <EmptyState
              icon={BookOpen}
              title={isTeacher ? 'No classrooms created yet' : 'No classes enrolled yet'}
              description={
                isTeacher
                  ? 'Get started by creating your first virtual classroom. Share the generated 6-character code with your students.'
                  : 'You have not joined any classrooms yet. Enter the classroom code provided by your teacher to get started.'
              }
              actionLabel={isTeacher ? 'Create First Classroom' : 'Join with Code'}
              onAction={isTeacher ? () => setIsCreateOpen(true) : () => setIsJoinOpen(true)}
              actionIcon={isTeacher ? Plus : LogIn}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom, idx) => (
              <motion.div
                key={classroom._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <ClassroomCard classroom={classroom} isTeacher={isTeacher} />
              </motion.div>
            ))}
          </div>
        )}
      </div>


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
