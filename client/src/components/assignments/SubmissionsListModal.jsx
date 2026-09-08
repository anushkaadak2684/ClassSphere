import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, MessageSquare, Award, Clock } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Loader from '../common/Loader';
import classroomService from '../../services/classroom.service';
import { downloadFile } from '../../utils/fileDownload';

export const SubmissionsListModal = ({ isOpen, onClose, assignment, onGraded }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState({});
  const [savingGradeId, setSavingGradeId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchSubmissions();
    }
  }, [isOpen, assignment]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classroomService.getAssignmentSubmissions(assignment._id);
      setSubmissions(data || []);

      const mState = {};
      const fState = {};
      (data || []).forEach((s) => {
        mState[s._id] = s.marks !== null && s.marks !== undefined ? s.marks : '';
        fState[s._id] = s.feedback || '';
      });
      setMarks(mState);
      setFeedback(fState);
    } catch (err) {
      setError(err.message || 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async (submissionId) => {
    const studentMarks = marks[submissionId];
    if (studentMarks === '' || studentMarks === undefined) {
      alert('Please enter a mark before saving.');
      return;
    }

    try {
      setSavingGradeId(submissionId);
      const updated = await classroomService.gradeSubmission(submissionId, {
        marks: Number(studentMarks),
        feedback: feedback[submissionId] || '',
      });

      setSubmissions((prev) =>
        prev.map((s) => (s._id === submissionId ? updated : s))
      );
      if (onGraded) onGraded();
    } catch (err) {
      alert(err.message || 'Failed to save grade.');
    } finally {
      setSavingGradeId(null);
    }
  };

  if (!assignment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Submissions: ${assignment.title}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 gap-2">
          <span>Max Marks: <strong className="text-slate-800 dark:text-slate-200">{assignment.maxMarks}</strong></span>
          <span>Due: <strong className="text-slate-800 dark:text-slate-200">{new Date(assignment.dueDate).toLocaleString()}</strong></span>
          <span>Turned In: <strong className="text-slate-800 dark:text-slate-200">{submissions.length}</strong></span>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <Loader text="Loading student submissions..." />
        ) : submissions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No submissions turned in yet by enrolled students.
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            {submissions.map((sub) => {
              const currentScore = marks[sub._id];
              const scorePercent =
                currentScore !== '' && !isNaN(Number(currentScore))
                  ? Math.round((Number(currentScore) / (assignment.maxMarks || 100)) * 100)
                  : null;

              return (
                <div
                  key={sub._id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
                >
                  {/* Student header & file download */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center border border-brand-200 dark:border-brand-800 shrink-0">
                        {sub.student?.avatarUrl ? (
                          <img
                            src={sub.student.avatarUrl}
                            alt={sub.student?.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          sub.student?.name?.charAt(0).toUpperCase() || 'S'
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sub.student?.name}</h4>
                        <p className="text-3xs text-slate-400 dark:text-slate-500">{sub.student?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={sub.status === 'graded' ? 'success' : 'brand'}
                        size="sm"
                        className="capitalize text-3xs"
                      >
                        {sub.status === 'graded' ? `Graded: ${sub.marks}/${assignment.maxMarks}` : 'Submitted'}
                      </Badge>

                      {sub.file?.secureUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile(sub.file.secureUrl, sub.file.name || 'student_submission.pdf')}
                          className="text-3xs flex items-center gap-1 py-1 px-2.5 text-brand-600 dark:text-brand-400"
                          title="Download Submission"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Work</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Optional Student Comment */}
                  {sub.comment && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-3xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-0.5">Student Note:</span>
                      {sub.comment}
                    </div>
                  )}

                  {/* Grading Panel */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 w-full sm:w-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="text-3xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Marks:
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={assignment.maxMarks}
                          placeholder="0"
                          value={marks[sub._id] !== undefined ? marks[sub._id] : ''}
                          onChange={(e) =>
                            setMarks((prev) => ({ ...prev, [sub._id]: e.target.value }))
                          }
                          className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                        <span className="text-3xs text-slate-400 dark:text-slate-500 font-medium">/ {assignment.maxMarks}</span>
                        {scorePercent !== null && (
                          <span className="text-3xs font-bold text-brand-600 dark:text-brand-400 ml-1">
                            ({scorePercent}%)
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Instructor feedback..."
                        value={feedback[sub._id] || ''}
                        onChange={(e) =>
                          setFeedback((prev) => ({ ...prev, [sub._id]: e.target.value }))
                        }
                        className="w-full sm:w-64 px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSaveGrade(sub._id)}
                      isLoading={savingGradeId === sub._id}
                      className="text-xs py-1.5 px-3 whitespace-nowrap shadow-xs"
                    >
                      Save Grade
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 flex justify-end border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SubmissionsListModal;
