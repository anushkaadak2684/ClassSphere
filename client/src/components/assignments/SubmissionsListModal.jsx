import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, MessageSquare, Award, Clock } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import Loader from '../common/Loader';
import classroomService from '../../services/classroom.service';

export const SubmissionsListModal = ({ isOpen, onClose, assignment, onGraded }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState(null);
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState({});
  const [savingGrade, setSavingGrade] = useState(false);
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

      // Initialize grading state map
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
      setSavingGrade(true);
      const updated = await classroomService.gradeSubmission(submissionId, {
        marks: Number(studentMarks),
        feedback: feedback[submissionId] || '',
      });

      setSubmissions((prev) =>
        prev.map((s) => (s._id === submissionId ? updated : s))
      );
      setGradingId(null);
      if (onGraded) onGraded();
    } catch (err) {
      alert(err.message || 'Failed to save grade.');
    } finally {
      setSavingGrade(false);
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
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span>Max Marks: <strong className="text-slate-800">{assignment.maxMarks}</strong></span>
          <span>Due: <strong className="text-slate-800">{new Date(assignment.dueDate).toLocaleString()}</strong></span>
          <span>Submissions: <strong className="text-slate-800">{submissions.length}</strong></span>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <Loader text="Loading student submissions..." />
        ) : submissions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No submissions turned in yet by enrolled students.
          </div>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3"
              >
                {/* Student header & file download */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
                      {sub.student?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{sub.student?.name}</h4>
                      <p className="text-3xs text-slate-400">{sub.student?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={sub.status === 'graded' ? 'success' : 'brand'}
                      size="sm"
                      className="capitalize"
                    >
                      {sub.status === 'graded' ? `Graded: ${sub.marks}/${assignment.maxMarks}` : 'Submitted'}
                    </Badge>

                    {sub.file?.secureUrl && (
                      <a
                        href={sub.file.secureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-3xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Work</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Optional Student Comment */}
                {sub.comment && (
                  <div className="bg-slate-50 p-2.5 rounded-lg text-3xs text-slate-600 border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-0.5">Student Note:</span>
                    {sub.comment}
                  </div>
                )}

                {/* Grading Panel */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="text-3xs font-semibold uppercase tracking-wider text-slate-500">
                        Score:
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
                        className="w-16 px-2 py-1 text-xs font-semibold rounded border border-slate-300 text-slate-900 text-center focus:border-brand-500 focus:outline-none"
                      />
                      <span className="text-3xs text-slate-400">/ {assignment.maxMarks}</span>
                    </div>

                    <input
                      type="text"
                      placeholder="Optional feedback..."
                      value={feedback[sub._id] || ''}
                      onChange={(e) =>
                        setFeedback((prev) => ({ ...prev, [sub._id]: e.target.value }))
                      }
                      className="flex-1 sm:w-64 px-2.5 py-1 text-xs rounded border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSaveGrade(sub._id)}
                    isLoading={savingGrade}
                    className="text-3xs whitespace-nowrap"
                  >
                    Save Grade
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 flex justify-end border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SubmissionsListModal;
