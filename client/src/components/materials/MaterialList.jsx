import React from 'react';
import { FileText, Download, Trash2, FileCode, Image as ImageIcon } from 'lucide-react';
import Button from '../common/Button';

export const MaterialList = ({
  materials = [],
  isTeacher = false,
  onDeleteMaterial,
  loading = false,
}) => {
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (name = '') => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    }
    return <FileText className="w-5 h-5 text-brand-500" />;
  };

  if (loading) {
    return <div className="py-8 text-center text-xs text-slate-400">Loading learning materials...</div>;
  }

  if (materials.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
        No learning materials uploaded yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {materials.map((m) => (
        <div
          key={m._id}
          className="flex items-start justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all group"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
              {getFileIcon(m.name)}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                {m.name}
              </h4>
              {m.description && (
                <p className="text-3xs text-slate-500 mt-0.5 line-clamp-1">{m.description}</p>
              )}
              <div className="flex items-center gap-2 text-3xs text-slate-400 mt-1.5 font-mono">
                <span>{formatFileSize(m.fileSize)}</span>
                <span>•</span>
                <span>{new Date(m.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <a
              href={m.secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              title="Download File"
            >
              <Button size="sm" variant="outline" className="p-2 text-slate-600 hover:text-brand-600">
                <Download className="w-3.5 h-3.5" />
              </Button>
            </a>

            {isTeacher && onDeleteMaterial && (
              <button
                onClick={() => onDeleteMaterial(m._id)}
                title="Delete Material"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialList;
