import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, School, ArrowLeft, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to ClassSphere Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Create your Account
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500">
          Join ClassSphere as an educator or enrolled student
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xs border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    role === 'student'
                      ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className={`w-5 h-5 ${role === 'student' ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    role === 'teacher'
                      ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <School className={`w-5 h-5 ${role === 'teacher' ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Teacher</span>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              placeholder="e.g. Dr. Jane Smith or Alan Turing"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@institution.edu"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Must contain minimum 6 characters"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              isLoading={loading}
              className="w-full mt-3 shadow-md shadow-brand-500/10"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
