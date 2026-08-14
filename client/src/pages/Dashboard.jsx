import React, { useState, useEffect } from 'react';
import { Plus, LogIn, BookOpen, Users, Video, Sparkles, RefreshCw } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import classroomService from '../services/classroom.service';
import Navbar from '../components/layout/Navbar';
import ClassroomCard from '../components/classroom/ClassroomCard';
import CreateClassroomModal from '../components/classroom/CreateClassroomModal';
import JoinClassroomModal from '../components/classroom/JoinClassroomModal';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

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

  // Stats calculation
  const totalClassrooms = classrooms.length;
  const liveClassroomsCount = classrooms.filter((c) => c.isLive).length;
  const totalStudents = classrooms.reduce((acc, c) => acc + (c.studentCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTeacher ? 'Teacher Portal' : 'Student Portal'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isTeacher
                ? 'Manage your virtual classrooms, initiate live interactive video sessions, and share materials.'
                : 'Access your enrolled classes, join live lectures, and download classroom materials.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {isTeacher ? (
              <Button
                variant="primary"
                size="lg"
                icon={Plus}
                onClick={() => setIsCreateOpen(true)}
                className="w-full md:w-auto shadow-md"
              >
                Create Classroom
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                icon={LogIn}
                onClick={() => setIsJoinOpen(true)}
                className="w-full md:w-auto shadow-md"
              >
                Join Classroom
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isTeacher ? 'Created Classrooms' : 'Enrolled Classrooms'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{totalClassrooms}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Live Classes
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{liveClassroomsCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isTeacher ? 'Total Students' : 'Role Status'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {isTeacher ? totalStudents : 'Active Student'}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Classrooms Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {isTeacher ? 'Your Classrooms' : 'Your Enrolled Classrooms'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={fetchClassrooms}
              className="text-xs text-slate-500"
            >
              Refresh
            </Button>
          </div>

          {error && <ErrorMessage message={error} onRetry={fetchClassrooms} />}

          {loading ? (
            <Loader text="Loading classrooms..." />
          ) : classrooms.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={isTeacher ? 'No classrooms created yet' : 'No enrolled classrooms'}
              description={
                isTeacher
                  ? 'Create your first virtual classroom to start hosting interactive live sessions.'
                  : 'Enter a 6-character code provided by your teacher to join your first classroom.'
              }
              actionLabel={isTeacher ? 'Create Classroom' : 'Join Classroom'}
              actionIcon={isTeacher ? Plus : LogIn}
              onAction={() => (isTeacher ? setIsCreateOpen(true) : setIsJoinOpen(true))}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((c) => (
                <ClassroomCard
                  key={c._id}
                  classroom={c}
                  isTeacher={isTeacher}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateClassroomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleClassroomCreated}
      />
      <JoinClassroomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoined={handleClassroomJoined}
      />
    </div>
  );
};

export default Dashboard;
