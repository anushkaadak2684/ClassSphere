import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import classroomService from '../services/classroom.service';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

export const AttendancePage = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await classroomService.getMyAttendance();
      setAttendanceData(res);
    } catch (err) {
      console.error('[AttendancePage fetch error]:', err);
      setError(err.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const overall = attendanceData?.overall || {
    attendancePercentage: 0,
    totalSessions: 0,
    attendedSessions: 0,
    missedSessions: 0,
  };

  const classrooms = attendanceData?.classroomBreakdown || [];
  const history = attendanceData?.history || [];

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    const className = item.classroom?.name?.toLowerCase() || '';
    const subject = item.classroom?.subject?.toLowerCase() || '';
    const matchesSearch = className.includes(q) || subject.includes(q);

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && item.status === statusFilter;
  });

  const formatDuration = (seconds = 0) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AppLayout
      title="Attendance Hub"
      subtitle="Live Session Participation"
      actions={
        <button
          onClick={fetchAttendance}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Refresh attendance"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-colors">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Automated Live Session Tracking</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Your Attendance Record
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Attendance is automatically logged whenever you enter live WebRTC lectures. Consistent attendance is critical for academic standing.
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10 shrink-0 bg-slate-50 dark:bg-slate-800/80 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Cumulative Rate
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {overall.attendancePercentage}%
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
            overall.attendancePercentage >= 75
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
          }`}>
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Attendance Rate
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {overall.attendancePercentage}%
            </p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              Across all enrolled classes
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Sessions Held
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {overall.totalSessions}
            </p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              Unique lecture dates
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Attended Sessions
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {overall.attendedSessions}
            </p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              Present or active
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Missed Sessions
            </span>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {overall.missedSessions}
            </p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              Absent dates
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
          <Loader size="lg" text="Retrieving attendance history..." />
        </div>
      ) : classrooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 transition-colors">
          <EmptyState
            icon={CalendarCheck}
            title="No classrooms enrolled"
            description="Enroll in classrooms using your instructor's join code to start tracking attendance."
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Attendance By Classroom */}
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance by Classroom</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Participation metrics across each of your enrolled subjects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classrooms.map((c) => (
                <Card key={c.classroom._id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        {c.classroom.subject}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {c.attendancePercentage}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {c.classroom.name}
                    </h4>

                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          c.attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${c.attendancePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Attended: <strong className="text-slate-700 dark:text-slate-200">{c.attendedSessions}</strong> / {c.totalSessions}
                    </span>
                    <span className="text-[11px]">
                      Missed: <strong className="text-rose-600 dark:text-rose-400">{c.missedSessions}</strong>
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Session Attendance History Table */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance History</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detailed logs of every live lecture you have joined.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by class name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No attendance session records found matching your filter criteria.
                </p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Classroom</th>
                        <th className="py-3 px-4">Join Time</th>
                        <th className="py-3 px-4">Leave Time</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {filteredHistory.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                            {new Date(item.sessionDate || item.joinedAt).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {item.classroom?.name || 'Classroom'}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              {item.classroom?.subject}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {formatTime(item.joinedAt)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {formatTime(item.leftAt)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {formatDuration(item.duration)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                              item.status === 'present'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}>
                              {item.status}
                            </span>
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
      )}
    </AppLayout>
  );
};

export default AttendancePage;
