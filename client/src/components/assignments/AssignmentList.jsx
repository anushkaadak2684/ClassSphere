import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Award,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  MessageSquare,
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import SubmitAssignmentModal from './SubmitAssignmentModal';
import SubmissionsListModal from './SubmissionsListModal';

export const AssignmentList = ({
  assignments = [],
  isTeacher = false,
  onDeleteAssignment,
  onAssignmentUpdated,
  loading = false,
}) => {
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState(null);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);

  const formatDueDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (dateStr) => {
    return new Date() > new Date(dateStr);
  };

  if (loading) {
    return <div className="py-8 text-center text-xs text-slate-400">Loading assignments...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
        No assignments posted yet for this classroom.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((a) => {
        const overdue = isOverdue(a.dueDate);
        const mySub = a.mySubmission;

        return (
          <div
            key={a._id}
            className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-4"
          >
            {/* Top row: Title, Due Date, Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                  <Badge variant="default" size="sm" className="text-3xs font-semibold">
                    <Award className="w-3 h-3 text-amber-500 mr-0.5" />
                    {a.maxMarks} Marks
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-3xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Due: {formatDueDate(a.dueDate)}
                  </span>
                  {overdue && !mySub && (
                    <Badge variant="danger" size="sm" className="text-3xs py-0">
                      Past Due
                    </Badge>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {!isTeacher && (
                  <div>
                    {mySub ? (
                      mySub.status === 'graded' ? (
                        <Badge variant="success" size="md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Score: {mySub.marks} / {a.maxMarks}</span>
                        </Badge>
                      ) : (
                        <Badge variant="brand" size="md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Submitted ({new Date(mySub.submittedAt).toLocaleDateString()})</span>
                        </Badge>
                      )
                    ) : overdue ? (
                      <Badge variant="danger" size="md">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Missing</span>
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="md">
                        <span>Pending</span>
                      </Badge>
                    )}
                  </div>
                )}

                {isTeacher && (
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-700">
                      {a.submissionCount || 0} / {a.totalStudents || 0} Turned In
                    </span>
                    <span className="block text-3xs text-slate-400">
                      {a.gradedCount || 0} Graded
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {a.description && (
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {a.description}
              </p>
            )}

            {/* Attachment if present */}
            {a.attachment?.secureUrl && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 max-w-md">
                <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700 truncate flex-1">
                  {a.attachment.name || 'Assignment Attachment'}
                </span>
                <a
                  href={a.attachment.secureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-1 rounded text-slate-400 hover:text-brand-600 transition-colors"
                  title="Download Attachment"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Student Feedback & Score Details */}
            {!isTeacher && mySub && mySub.status === 'graded' && mySub.feedback && (
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-xs text-emerald-900">
                <span className="font-bold block mb-0.5">Instructor Feedback:</span>
                <p className="text-3xs text-emerald-800">{mySub.feedback}</p>
              </div>
            )}

            {/* Actions footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                {!isTeacher && mySub?.file?.secureUrl && (
                  <a
                    href={mySub.file.secureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1 text-3xs text-brand-600 hover:underline"
                  >
                    <Download className="w-3 h-3" />
                    <span>View Submitted File ({mySub.file.name})</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Student Actions */}
                {!isTeacher && (
                  <Button
                    size="sm"
                    variant={mySub ? 'outline' : 'primary'}
                    icon={Upload}
                    onClick={() => setSelectedAssignmentForSubmit(a)}
                    className="text-xs"
                  >
                    {mySub ? 'Resubmit Work' : 'Turn In Work'}
                  </Button>
                )}

                {/* Teacher Actions */}
                {isTeacher && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                      onClick={() => setSelectedAssignmentForSubmissions(a)}
                      className="text-xs"
                    >
                      View Submissions ({a.submissionCount || 0})
                    </Button>

                    {onDeleteAssignment && (
                      <button
                        onClick={() => onDeleteAssignment(a._id)}
                        title="Delete Assignment"
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Student Submit Modal */}
      {selectedAssignmentForSubmit && (
        <SubmitAssignmentModal
          isOpen={Boolean(selectedAssignmentForSubmit)}
          onClose={() => setSelectedAssignmentForSubmit(null)}
          assignment={selectedAssignmentForSubmit}
          onSubmitted={() => {
            if (onAssignmentUpdated) onAssignmentUpdated();
          }}
        />
      )}

      {/* Teacher Submissions Grading Modal */}
      {selectedAssignmentForSubmissions && (
        <SubmissionsListModal
          isOpen={Boolean(selectedAssignmentForSubmissions)}
          onClose={() => setSelectedAssignmentForSubmissions(null)}
          assignment={selectedAssignmentForSubmissions}
          onGraded={() => {
            if (onAssignmentUpdated) onAssignmentUpdated();
          }}
        />
      )}
    </div>
  );
};

export default AssignmentList;
