import React, { useState } from 'react';
import { User, Mail, Lock, CheckCircle2, Save, KeyRound, ShieldCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import authService from '../services/auth.service';
import AppLayout from '../components/layout/AppLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { motion } from 'framer-motion';

export const Profile = () => {
  const { user, updateProfile, isTeacher } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setProfileError(null);
      setProfileSuccess(false);
      await updateProfile({ name, avatarUrl });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPassError('Please provide both your current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    try {
      setPassLoading(true);
      setPassError(null);
      setPassSuccess(false);
      await authService.changePassword(currentPassword, newPassword);
      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 3500);
    } catch (err) {
      setPassError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <AppLayout
      title="User Profile"
      subtitle="Account settings & security"
    >
      <div className="max-w-3xl mx-auto">
        {/* Single Unified Profile & Security Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl p-6 sm:p-8 transition-colors space-y-8"
        >
          {/* Avatar and Identity Header */}
          <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xl border-2 border-brand-200 dark:border-brand-800 shrink-0 overflow-hidden shadow-xs">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{user?.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 capitalize">
                  {user?.role || (isTeacher ? 'Teacher' : 'Student')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Personal Details */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Update your display name and profile picture URL
                </p>
              </div>
            </div>

            {profileSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Personal details updated successfully!</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 font-medium">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />

              <Input
                label="Academic Email Address"
                value={user?.email || ''}
                disabled
                icon={Mail}
                helperText="Primary email tied to your Firebase account (read-only)."
              />

              <Input
                label="Avatar Image URL (Optional)"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                helperText="Direct URL to a public profile photo or headshot."
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={Save}
                  isLoading={loading}
                  className="shadow-xs"
                >
                  Save Profile Info
                </Button>
              </div>
            </form>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Section 2: Password & Security (Inside the same card) */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Security & Password Modification</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Update your authentication credentials securely
                </p>
              </div>
            </div>

            {passSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Password successfully updated via Firebase Auth!</span>
              </div>
            )}

            {passError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 font-medium">
                {passError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 6 characters"
                  icon={Lock}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  icon={Lock}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={ShieldCheck}
                  isLoading={passLoading}
                  className="shadow-xs"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
