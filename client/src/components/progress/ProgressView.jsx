import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Loader from '../common/Loader';

export const ProgressView = ({ progressData, loading = false, isTeacher = false }) => {
  if (loading) {
    return <Loader text="Calculating progress analytics from classroom records..." />;
  }

  if (!progressData) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
        No progress data available yet.
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STUDENT PROGRESS VIEW
  // -------------------------------------------------------------------------
  if (!isTeacher) {
    const { metrics = {}, assignmentBreakdown = [] } = progressData;

    return (
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Attendance Rate
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {metrics.attendancePercentage ?? 100}%
              </h3>
              <p className="text-3xs text-slate-500 mt-0.5">
                {metrics.attendedSessions ?? 0} of {metrics.totalSessions ?? 0} live sessions attended
              </p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Assignments Turned In
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {metrics.completedAssignments ?? 0} / {metrics.totalAssignments ?? 0}
              </h3>
              <p className="text-3xs text-slate-500 mt-0.5">
                {metrics.pendingAssignments ?? 0} pending assignments
              </p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Average Grade Score
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {metrics.averageScore ?? 0}%
              </h3>
              <p className="text-3xs text-slate-500 mt-0.5">
                Across {metrics.gradedCount ?? 0} graded assignments
              </p>
            </div>
          </Card>
        </div>

        {/* Assignments Progress Breakdown Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Assignment Performance Breakdown
            </h3>
          </div>

          {assignmentBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 p-6 text-center">No assignments assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Assignment</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Marks</th>
                    <th className="px-4 py-3">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {assignmentBreakdown.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {item.title}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant={
                            item.status === 'graded'
                              ? 'success'
                              : item.isSubmitted
                              ? 'brand'
                              : item.status === 'overdue'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold">
                        {item.marks !== null ? (
                          <span className="text-emerald-700">
                            {item.marks} / {item.maxMarks}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-3xs max-w-xs truncate">
                        {item.feedback || <span className="text-slate-300">None</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // TEACHER PROGRESS VIEW
  // -------------------------------------------------------------------------
  const { summary = {}, students = [] } = progressData;

  return (
    <div className="space-y-6">
      {/* Teacher Class Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs font-semibold uppercase tracking-wider text-slate-400">
              Enrolled Students
            </p>
            <h4 className="text-xl font-bold text-slate-900">{summary.totalStudents ?? 0}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs font-semibold uppercase tracking-wider text-slate-400">
              Live Sessions Held
            </p>
            <h4 className="text-xl font-bold text-slate-900">{summary.totalSessions ?? 0}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs font-semibold uppercase tracking-wider text-slate-400">
              Total Assignments
            </p>
            <h4 className="text-xl font-bold text-slate-900">{summary.totalAssignments ?? 0}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs font-semibold uppercase tracking-wider text-slate-400">
              Class Average Score
            </p>
            <h4 className="text-xl font-bold text-slate-900">{summary.classAverageScore ?? 0}%</h4>
          </div>
        </Card>
      </div>

      {/* Roster Progress Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Student Performance & Attendance Roster
          </h3>
          <span className="text-3xs text-slate-400">Calculated from actual classroom records</span>
        </div>

        {students.length === 0 ? (
          <p className="text-xs text-slate-400 p-8 text-center">No enrolled students in this classroom.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Live Attendance</th>
                  <th className="px-4 py-3">Assignments Done</th>
                  <th className="px-4 py-3">Average Score</th>
                  <th className="px-4 py-3">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {students.map((s) => (
                  <tr key={s.student?._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-3xs border border-brand-100">
                          {s.student?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">{s.student?.name}</span>
                          <span className="block text-3xs text-slate-400">{s.student?.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${s.attendancePercentage}%` }}
                          />
                        </div>
                        <span className="font-medium text-slate-700 text-3xs">
                          {s.attendancePercentage}% ({s.attendedSessions}/{summary.totalSessions || 0})
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      <span className="font-semibold">{s.completedAssignments}</span> / {s.totalAssignments}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                      {s.gradedCount > 0 ? `${s.averageScore}%` : <span className="text-slate-300 font-normal">Ungraded</span>}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant={
                          s.attendancePercentage >= 75 && (s.averageScore >= 70 || s.gradedCount === 0)
                            ? 'success'
                            : s.attendancePercentage < 50
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {s.attendancePercentage >= 75 ? 'Good Standing' : 'Needs Attention'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressView;
