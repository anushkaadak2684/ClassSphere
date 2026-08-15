import React, { useState } from 'react';
import { User, Mail, Shield, CheckCircle2, Save } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const Profile = () => {
  const { user, updateProfile, isTeacher } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      await updateProfile({ name, avatarUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="User Profile"
      subtitle="Account settings and credentials"
    >
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-xs rounded-2xl">
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile updated successfully in MongoDB database!</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          {/* Avatar and Identity */}
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xl border-2 border-brand-200 shrink-0 overflow-hidden shadow-xs">
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
              <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 capitalize">
                  {user?.role || (isTeacher ? 'Teacher' : 'Student')}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              icon={Mail}
              helperText="Firebase authenticated email cannot be changed directly."
            />

            <Input
              label="Avatar Image URL (Optional)"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              helperText="Provide a direct image URL for your profile picture."
            />

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Save}
                isLoading={loading}
                className="shadow-xs"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
