import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Video, ArrowRight, Copy, Check } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const ClassroomCard = ({ classroom, isTeacher }) => {
  const [copied, setCopied] = React.useState(false);

  const copyJoinCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(classroom.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card hover className="p-5 flex flex-col justify-between h-full group">
      <div>
        {/* Header with subject & status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="brand" size="sm" className="font-semibold uppercase tracking-wider text-3xs">
            {classroom.subject}
          </Badge>
          {classroom.isLive ? (
            <Badge variant="live" size="sm" className="font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1" />
              LIVE NOW
            </Badge>
          ) : (
            <span className="text-3xs font-medium text-slate-400">Offline</span>
          )}
        </div>

        {/* Classroom Name & Description */}
        <Link to={`/classrooms/${classroom._id}`}>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {classroom.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
          {classroom.description || 'No description provided for this classroom.'}
        </p>
      </div>

      {/* Footer information & action */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{classroom.studentCount ?? 0} Students</span>
          </div>

          {/* Join Code for Teacher or Display */}
          {classroom.joinCode && (
            <button
              onClick={copyJoinCode}
              title="Copy Join Code"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-3xs font-medium transition-colors"
            >
              <span>Code: {classroom.joinCode}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/classrooms/${classroom._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full justify-between text-xs">
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>

          {classroom.isLive && (
            <Link to={`/classrooms/${classroom._id}/live`}>
              <Button variant="primary" size="sm" icon={Video} className="text-xs whitespace-nowrap bg-rose-600 hover:bg-rose-700">
                Join Live
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ClassroomCard;
