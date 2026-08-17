import React, { useState, useEffect } from 'react';
import { BarChart3, BookOpen, CheckCircle2, Clock, Award, Users, RefreshCw } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import classroomService from '../services/classroom.service';
import AppLayout from '../components/layout/AppLayout';
import ProgressView from '../components/progress/ProgressView';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { motion } from 'framer-motion';

export const ProgressPage = () => {

  const { user, isTeacher, isStudent } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progLoading, setProgLoading] = useState(false);

  const fetchClassroomsAndFirstProgress = async () => {
    try {
      setLoading(true);
      const classList = await classroomService.getClassrooms();
      setClassrooms(classList || []);

      if (classList && classList.length > 0) {
        const firstId = classList[0]._id;
        setSelectedClassroomId(firstId);
        const data = await classroomService.getProgress(firstId);
        setProgressData(data);
      }
    } catch (err) {
      console.error('[ProgressPage fetch error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroomsAndFirstProgress();
  }, []);

  const handleSelectClassroom = async (classroomId) => {
    try {
      setSelectedClassroomId(classroomId);
      setProgLoading(true);
      const data = await classroomService.getProgress(classroomId);
      setProgressData(data);
    } catch (err) {
      console.error('[Classroom progress fetch error]:', err);
    } finally {
      setProgLoading(false);
    }
  };

  const selectedClass = classrooms.find((c) => c._id === selectedClassroomId);

  return (
    <AppLayout
      title={isTeacher ? 'Class Performance & Progress' : 'My Academic Progress'}
      subtitle={isTeacher ? 'Class Analytics & Grades' : 'Attendance & Scores'}
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
          <Loader size="lg" text="Calculating progress metrics from database..." />
        </div>
      ) : classrooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 transition-colors">
          <EmptyState
            icon={BarChart3}
            title="No progress records available"
            description="Progress and attendance analytics are calculated automatically once you participate in a classroom."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Classroom Selector Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors"
          >
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap mr-2">
                Select Class:
              </span>
              {classrooms.map((c) => (
                <button
                  key={c._id}
                  onClick={() => handleSelectClassroom(c._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedClassroomId === c._id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleSelectClassroom(selectedClassroomId)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              title="Recalculate progress"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Progress Analytics Card */}
          {progLoading ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
              <Loader size="lg" text="Recalculating analytics..." />
            </div>
          ) : progressData ? (
            <motion.div
              key={selectedClassroomId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs transition-colors"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedClass?.name || 'Classroom'} Performance
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Subject: {selectedClass?.subject} • Join Code: <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{selectedClass?.joinCode}</span>
                  </p>
                </div>
              </div>

              <ProgressView progressData={progressData} isTeacher={isTeacher} />
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
              No progress data generated for this classroom yet.
            </div>
          )}
        </div>

      )}
    </AppLayout>
  );
};

export default ProgressPage;
