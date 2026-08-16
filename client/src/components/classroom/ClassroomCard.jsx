import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Video, ArrowRight, Copy, Check, BookOpen } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const ClassroomCard = ({ classroom, isTeacher }) => {
  const [copied, setCopied] = useState(false);

  const copyJoinCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (classroom.joinCode) {
      navigator.clipboard.writeText(classroom.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all flex flex-col justify-between h-full group">
      <div>
        {/* Header with subject & status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="brand" size="sm" className="font-semibold uppercase tracking-wider text-[10px]">
            {classroom.subject || 'General'}
          </Badge>
          {classroom.isLive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> LIVE NOW
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Offline</span>
          )}
        </div>

        {/* Classroom Name & Description */}
        <Link to={`/classrooms/${classroom._id}`} className="block group">
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
            {classroom.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 min-h-[34px] leading-relaxed">
          {classroom.description || 'No description provided for this classroom.'}
        </p>
      </div>

      {/* Footer information & action */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{classroom.studentCount ?? 0} Students</span>
          </div>

          {/* Join Code for Teacher or Student Display */}
          {classroom.joinCode && (
            <button
              onClick={copyJoinCode}
              title="Copy Join Code"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold transition-colors"
            >
              <span>Code: {classroom.joinCode}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/classrooms/${classroom._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full justify-between text-xs font-semibold bg-white/80 dark:bg-slate-800/80">
              <span>Open Classroom</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>

          {classroom.isLive && (
            <Link to={`/classrooms/${classroom._id}/live`}>
              <Button variant="primary" size="sm" icon={Video} className="text-xs whitespace-nowrap bg-rose-600 hover:bg-rose-700 shadow-xs">
                Join Live
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomCard;
