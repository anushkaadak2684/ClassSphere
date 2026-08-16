import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Calendar,
  AlertTriangle,
  AlertCircle,
  FileCheck2,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Loader from '../common/Loader';

export const ProgressView = ({ progressData, loading = false, isTeacher = false }) => {
  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
        <Loader size="lg" text="Calculating progress analytics from database records..." />
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        No progress data available yet.
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STUDENT MY PROGRESS: Overall Academic Performance Summary
  // -------------------------------------------------------------------------
  if (!isTeacher) {
    const { metrics = {}, assignmentBreakdown = [] } = progressData;

    return (
      <div className="space-y-8">
        {/* Student Academic KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Attendance Rate
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.attendancePercentage ?? 100}%
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {metrics.attendedSessions ?? 0} of {metrics.totalSessions ?? 0} sessions attended
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Assignments Turn-in
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.completedAssignments ?? 0} / {metrics.totalAssignments ?? 0}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {metrics.pendingAssignments ?? 0} pending assignments
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Average Score
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.averageScore ?? 0}%
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Across {metrics.gradedCount ?? 0} graded items
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* Academic Coursework & Grades Breakdown */}
        <div>
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Coursework & Grading History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete log of your assignments, scores, and instructor feedback.
            </p>
          </div>

          {assignmentBreakdown.length === 0 ? (
            <Card className="p-8 text-center">
              <FileCheck2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No assignments posted for this classroom yet.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Assignment</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Marks</th>
                      <th className="py-3 px-4">Instructor Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {assignmentBreakdown.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            item.status === 'graded' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                            item.isSubmitted ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                            item.status === 'overdue' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                            'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {item.marks !== null ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {item.marks} / {item.maxMarks}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {item.feedback || <span className="text-slate-400 italic">No notes provided</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // TEACHER PROGRESS: Class Aggregate Performance Analytics
  // -------------------------------------------------------------------------
  const { summary = {}, students = [] } = progressData;

  // Compute aggregate metrics
  const totalEnrolled = summary.totalStudents || students.length || 0;
  const totalSessions = summary.totalSessions || 0;
  const totalAssignments = summary.totalAssignments || 0;
  const classAvgScore = summary.classAverageScore || 0;

  // Class Average Attendance %
  const classAvgAttendance = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.attendancePercentage || 0), 0) / students.length)
    : 100;

  // Class Assignment Turn-in Rate %
  const totalPossibleSubmissions = totalEnrolled * totalAssignments;
  const totalCompletedSubmissions = students.reduce((sum, s) => sum + (s.completedAssignments || 0), 0);
  const classTurninRate = totalPossibleSubmissions > 0
    ? Math.round((totalCompletedSubmissions / totalPossibleSubmissions) * 100)
    : 0;

  // Students Needing Attention (< 75% attendance or high overdue assignments)
  const studentsNeedingAttention = students.filter(
    (s) => s.attendancePercentage < 75 || ((s.totalAssignments || 0) - (s.completedAssignments || 0) > 1)
  );

  return (
    <div className="space-y-8">
      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Avg Attendance Rate
            </span>
            <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {classAvgAttendance}%
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              Across {totalSessions} live sessions
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Turn-in Rate
            </span>
            <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {classTurninRate}%
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              {totalCompletedSubmissions} submissions received
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Class Average Score
            </span>
            <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {classAvgScore}%
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              Across graded assignments
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Enrolled
            </span>
            <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {totalEnrolled}
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              Active students
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Aggregate Distribution & Progress Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Health Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Classroom Health & Benchmark Rates
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Live Session Attendance</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{classAvgAttendance}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    classAvgAttendance >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${classAvgAttendance}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Coursework Submission Rate</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{classTurninRate}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${classTurninRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Overall Academic Mastery</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{classAvgScore}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    classAvgScore >= 75 ? 'bg-emerald-500' : classAvgScore >= 60 ? 'bg-brand-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${classAvgScore}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Students Needing Attention */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Students Requiring Academic Attention
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {studentsNeedingAttention.length} Flagged
            </span>
          </div>

          {studentsNeedingAttention.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">All students in good standing!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All enrolled students are above attendance & submission thresholds.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
              {studentsNeedingAttention.map((s) => (
                <div key={s.student?._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-amber-200 dark:border-amber-800">
                      {s.student?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {s.student?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">{s.student?.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {s.attendancePercentage < 75 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                        {s.attendancePercentage}% Att.
                      </span>
                    )}
                    {((s.totalAssignments || 0) - (s.completedAssignments || 0) > 1) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        {(s.totalAssignments || 0) - (s.completedAssignments || 0)} Missing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProgressView;
