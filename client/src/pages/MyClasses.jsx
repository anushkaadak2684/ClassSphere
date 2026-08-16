import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, LogIn, RefreshCw, Search } from 'lucide-react';
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

export const MyClasses = () => {
  const { user, isTeacher, isStudent } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classroomService.getClassrooms();
      setClassrooms(data || []);
    } catch (err) {
      console.error('[MyClasses fetch error]:', err);
      setError(err.message || 'Failed to load classes.');
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

  const filteredClassrooms = classrooms.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.joinCode?.toLowerCase().includes(q)
    );
  });

  const actions = (
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
      title={isTeacher ? 'My Classrooms' : 'My Classes'}
      subtitle={isTeacher ? 'Classroom Administration' : 'Enrolled Subjects'}
      actions={actions}
    >
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, subject, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-500 dark:text-slate-400">
          <span>
            {filteredClassrooms.length} {filteredClassrooms.length === 1 ? 'classroom' : 'classrooms'} found
          </span>
          <button
            onClick={fetchClassrooms}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Classroom List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
          <Loader size="lg" text="Retrieving classrooms from database..." />
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800">
          <ErrorMessage message={error} onRetry={fetchClassrooms} />
        </div>
      ) : filteredClassrooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 transition-colors">
          <EmptyState
            icon={BookOpen}
            title={
              searchQuery
                ? 'No matching classrooms found'
                : isTeacher
                ? 'No classrooms created yet'
                : 'No classes enrolled yet'
            }
            description={
              searchQuery
                ? 'Try refining your search terms or view all classrooms.'
                : isTeacher
                ? 'Create a virtual classroom to start hosting live lectures and managing course materials.'
                : 'Join your first class using the 6-character code given by your teacher.'
            }
            action={
              searchQuery ? (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              ) : isTeacher ? (
                <Button variant="primary" size="md" icon={Plus} onClick={() => setIsCreateOpen(true)}>
                  Create Classroom
                </Button>
              ) : (
                <Button variant="primary" size="md" icon={LogIn} onClick={() => setIsJoinOpen(true)}>
                  Join with Code
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((c) => (
            <ClassroomCard key={c._id} classroom={c} isTeacher={isTeacher} />
          ))}
        </div>
      )}

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

export default MyClasses;
