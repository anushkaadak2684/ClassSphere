import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  UploadCloud,
  ArrowUpRight,
  ExternalLink,
  Award,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import classroomService from '../services/classroom.service';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import CreateAssignmentModal from '../components/assignments/CreateAssignmentModal';
import SubmitAssignmentModal from '../components/assignments/SubmitAssignmentModal';
import SubmissionsListModal from '../components/assignments/SubmissionsListModal';

export const AssignmentsPage = () => {
  const { user, isTeacher, isStudent } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [assignmentsByClass, setAssignmentsByClass] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroomId, setSelectedClassroomId] = useState('all');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createClassroomId, setCreateClassroomId] = useState(null);
  const [submitAssignment, setSubmitAssignment] = useState(null);
  const [submissionsModalAssignment, setSubmissionsModalAssignment] = useState(null);

  const fetchAllAssignments = async () => {
    try {
      setLoading(true);
      const classList = await classroomService.getClassrooms();
      setClassrooms(classList || []);

      const assignPromises = (classList || []).map(async (c) => {
        try {
          const assigns = await classroomService.getAssignments(c._id);
          return {
            classroom: c,
            assignments: assigns || [],
          };
        } catch {
          return { classroom: c, assignments: [] };
        }
      });

      const results = await Promise.all(assignPromises);
      setAssignmentsByClass(results);
    } catch (err) {
      console.error('[AssignmentsPage fetch error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAssignments();
  }, []);

  const totalAssignmentsCount = assignmentsByClass.reduce(
    (acc, curr) => acc + curr.assignments.length,
    0
  );

  const filteredGroups =
    selectedClassroomId === 'all'
      ? assignmentsByClass
      : assignmentsByClass.filter((g) => g.classroom._id === selectedClassroomId);

  const actions = isTeacher && classrooms.length > 0 && (
    <Button
      variant="primary"
      size="sm"
      icon={Plus}
      onClick={() => {
        setCreateClassroomId(classrooms[0]?._id);
        setCreateModalOpen(true);
      }}
      className="shadow-xs text-xs sm:text-sm"
    >
      New Assignment
    </Button>
  );

  return (
    <AppLayout
      title={isTeacher ? 'Assignment Management' : 'Coursework & Assignments'}
      subtitle={isTeacher ? 'Review and Grade' : 'Submissions and Feedback'}
      actions={actions}
    >
      {/* Filter / Classroom Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
            Filter by Class:
          </label>
          <select
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Classrooms ({totalAssignmentsCount})</option>
            {classrooms.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span>
            {totalAssignmentsCount} total {totalAssignmentsCount === 1 ? 'assignment' : 'assignments'} published
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
          <Loader size="lg" text="Loading assignments from database..." />
        </div>
      ) : totalAssignmentsCount === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 transition-colors">
          <EmptyState
            icon={FileCheck2}
            title="No assignments posted yet"
            description={
              isTeacher
                ? 'Create assignments inside your classrooms to distribute homework and grade student submissions.'
                : 'Assignments created by your teachers will appear here.'
            }
          />
        </div>
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => {
            if (group.assignments.length === 0 && selectedClassroomId === 'all') return null;

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
                        {group.classroom.subject} • Join Code: <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{group.classroom.joinCode}</span>
                      </span>
                    </div>
                  </div>

                  <Link to={`/classrooms/${group.classroom._id}?tab=assignments`}>
                    <Button variant="outline" size="sm" icon={ExternalLink} className="text-xs">
                      Open in Classroom Hub
                    </Button>
                  </Link>
                </div>

                {/* Assignments List */}
                {group.assignments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No assignments created in this classroom.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.assignments.map((assign) => (
                      <div
                        key={assign._id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-brand-200 dark:hover:border-brand-800 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{assign.title}</h4>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                              {assign.maxMarks} Marks
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                            {assign.description || 'No description provided.'}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Due: {new Date(assign.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                          {isTeacher ? (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={FileCheck2}
                              onClick={() => setSubmissionsModalAssignment(assign)}
                              className="w-full text-xs font-semibold"
                            >
                              Review & Grade Submissions
                            </Button>
                          ) : (
                            <div className="w-full flex items-center justify-between gap-2">
                              {assign.submission ? (
                                <div className="flex items-center justify-between w-full">
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {assign.submission.status === 'graded'
                                      ? `Graded: ${assign.submission.marks}/${assign.maxMarks}`
                                      : 'Submitted'}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSubmitAssignment(assign)}
                                    className="text-xs"
                                  >
                                    View / Resubmit
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={UploadCloud}
                                  onClick={() => setSubmitAssignment(assign)}
                                  className="w-full text-xs font-semibold shadow-xs"
                                >
                                  Submit Assignment
                                </Button>
                              )}
                            </div>
                          )}
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

      {/* Modals */}
      {createModalOpen && (
        <CreateAssignmentModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          classroomId={createClassroomId}
          onCreated={() => fetchAllAssignments()}
        />
      )}

      {submitAssignment && (
        <SubmitAssignmentModal
          isOpen={!!submitAssignment}
          onClose={() => setSubmitAssignment(null)}
          assignment={submitAssignment}
          onSubmitted={() => fetchAllAssignments()}
        />
      )}

      {submissionsModalAssignment && (
        <SubmissionsListModal
          isOpen={!!submissionsModalAssignment}
          onClose={() => setSubmissionsModalAssignment(null)}
          assignment={submissionsModalAssignment}
          onGradeUpdated={() => fetchAllAssignments()}
        />
      )}
    </AppLayout>
  );
};

export default AssignmentsPage;
