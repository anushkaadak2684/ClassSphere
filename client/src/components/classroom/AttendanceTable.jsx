import React from 'react';
import { Clock, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import Badge from '../common/Badge';

export const AttendanceTable = ({ records = [], loading = false }) => {
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '< 1 min';
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remMins}m`;
    return `${mins} min`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="py-8 text-center text-xs text-slate-400">Loading attendance records...</div>;
  }

  if (records.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        No attendance sessions recorded yet. Records are generated when students attend live classes.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50 font-semibold text-slate-700">
          <tr>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Joined At</th>
            <th className="px-4 py-3">Left At</th>
            <th className="px-4 py-3">Total Duration</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {records.map((r) => (
            <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-3xs">
                    {r.student?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">{r.student?.name || 'Student'}</span>
                    <span className="block text-3xs text-slate-400">{r.student?.email}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDate(r.joinedAt)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">{r.leftAt ? formatDate(r.leftAt) : 'Still in session'}</td>
              <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-700">{formatDuration(r.duration)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Badge
                  variant={r.status === 'present' ? 'success' : 'warning'}
                  size="sm"
                  className="capitalize text-3xs"
                >
                  {r.status === 'present' ? <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> : <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />}
                  {r.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
