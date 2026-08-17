import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Home } from 'lucide-react';
import Button from '../components/common/Button';
import { motion } from 'framer-motion';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 shadow-xl flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mb-6">
          <GraduationCap className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
          Error 404
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 mb-8 leading-relaxed">
          The classroom view or learning resource you requested could not be located. It might have been moved or removed.
        </p>
        <Link to="/dashboard" className="w-full">
          <Button variant="primary" size="lg" icon={Home} className="w-full shadow-md shadow-brand-500/20">
            Back to Academic Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
