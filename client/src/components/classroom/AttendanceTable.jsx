import React from 'react';
import { Clock, Calendar, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { exportToCSV } from '../../utils/csvExport';

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

  const handleExportCSV = () => {
    const columns = [
      { label: 'Student Name', key: 'student.name' },
      { label: 'Student Email', key: 'student.email' },
      {
        label: 'Joined At',
        transform: (row) => (row.joinedAt ? new Date(row.joinedAt).toLocaleString() : '—'),
      },
      {
        label: 'Left At',
        transform: (row) => (row.leftAt ? new Date(row.leftAt).toLocaleString() : 'Still in session'),
      },
      { label: 'Duration (Seconds)', key: 'duration' },
      {
        label: 'Formatted Duration',
        transform: (row) => formatDuration(row.duration),
      },
      { label: 'Status', key: 'status' },
    ];

    exportToCSV('Classroom_Attendance_Log', columns, records);
  };

  if (loading) {
    return <div className="py-8 text-center text-xs text-slate-400">Loading attendance records...</div>;
  }

  if (records.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        No attendance sessions recorded yet. Records are generated automatically when students attend live classes.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {records.length} session participation {records.length === 1 ? 'log' : 'logs'}
        </span>
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={handleExportCSV}
          className="text-xs"
        >
          Export Attendance CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Joined At</th>
              <th className="px-4 py-3">Left At</th>
              <th className="px-4 py-3">Total Duration</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {records.map((r) => (
              <tr key={r._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs border border-brand-200 dark:border-brand-800">
                      {r.student?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">{r.student?.name || 'Student'}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">{r.student?.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-[11px]">{formatDate(r.joinedAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-[11px]">{r.leftAt ? formatDate(r.leftAt) : 'Still in session'}</td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-700 dark:text-slate-300">{formatDuration(r.duration)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <Badge
                    variant={r.status === 'present' ? 'success' : 'warning'}
                    size="sm"
                    className="capitalize text-xs"
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
    </div>
  );
};

export default AttendanceTable;

