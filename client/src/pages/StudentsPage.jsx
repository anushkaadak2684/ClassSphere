import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Mail, Calendar, Search, RefreshCw, UserCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import classroomService from '../services/classroom.service';
import AppLayout from '../components/layout/AppLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

export const StudentsPage = () => {
  const { user, isTeacher } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [rosterByClass, setRosterByClass] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const classList = await classroomService.getClassrooms();
      setClassrooms(classList || []);

      const rosterPromises = (classList || []).map(async (c) => {
        try {
          const parts = await classroomService.getParticipants(c._id);
          return {
            classroom: c,
            teacher: parts.teacher,
            students: parts.students || [],
          };
        } catch {
          return { classroom: c, teacher: null, students: [] };
        }
      });

      const results = await Promise.all(rosterPromises);
      setRosterByClass(results);
    } catch (err) {
      console.error('[StudentsPage fetch error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const totalUniqueStudents = Array.from(
    new Set(rosterByClass.flatMap((g) => g.students.map((s) => s._id)))
  ).length;

  return (
    <AppLayout
      title={isTeacher ? 'Student Directory & Roster' : 'Classmates & Instructors'}
      subtitle={isTeacher ? 'Enrolled Students' : 'Academic Network'}
    >
      {/* Search and Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-500 dark:text-slate-400">
          <span>
            {isTeacher ? `${totalUniqueStudents} unique students enrolled` : `${classrooms.length} enrolled subjects`}
          </span>
          <button
            onClick={fetchRoster}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
          <Loader size="lg" text="Retrieving student directory from database..." />
        </div>
      ) : classrooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 transition-colors">
          <EmptyState
            icon={Users}
            title={isTeacher ? 'No students enrolled yet' : 'No classmates found'}
            description={
              isTeacher
                ? 'Students who join your classrooms using your 6-character code will appear in this directory.'
                : 'Join classrooms to view peers and instructors.'
            }
          />
        </div>
      ) : (
        <div className="space-y-8">
          {rosterByClass.map((group) => {
            const filteredStudents = group.students.filter((s) => {
              const q = searchQuery.toLowerCase();
              return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
            });

            return (
              <div
                key={group.classroom._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors"
              >
                {/* Classroom Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{group.classroom.name}</h3>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {group.classroom.subject} • {group.students.length} Enrolled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Students Roster */}
                {filteredStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    {searchQuery ? 'No matching students found in this class.' : 'No students enrolled in this classroom yet.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-3 hover:border-brand-200 dark:hover:border-brand-800 transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm border border-brand-200 dark:border-brand-800 shrink-0">
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            student.name?.charAt(0).toUpperCase() || 'S'
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{student.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {student.email}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default StudentsPage;
