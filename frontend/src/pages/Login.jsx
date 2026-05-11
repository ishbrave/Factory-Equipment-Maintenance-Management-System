import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/common';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useToast();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      login(response.data.token, response.data.user);
      showSuccess('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
      showError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 md:py-0">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[1200px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:min-h-[calc(100vh-120px)]">
        <div className="hidden w-[42%] flex-col bg-[#1E40AF] px-10 py-12 text-white md:flex">
          <div className="relative flex flex-col justify-between h-full">
            <div className="space-y-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/15 border border-white/20">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l2.09 4.26L18.5 7l-3.5 3.42L15.18 15 12 12.74 8.82 15l.18-4.58L5.5 7l4.41-.74L12 2z" />
                </svg>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight">FEMMS</h1>
                <p className="max-w-[300px] text-sm text-white/80">Factory Equipment Maintenance Management System</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-8 rounded-full bg-white"></div>
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
              </div>
              <div className="rounded-full bg-white/10 p-4 text-sm text-white/80">
                Secure admin access for maintenance tracking.
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center px-8 py-10 sm:px-12 md:w-[58%] md:px-12 md:py-14">
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1E40AF]">Welcome back</p>
            <h2 className="mt-4 text-3xl font-bold text-[#111827]">Sign in</h2>
            <p className="mt-3 text-sm text-[#6B7280]">Enter your credentials to access the dashboard</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#374151]">Username</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    <Mail size={18} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@femms.com"
                    className="w-full rounded-[16px] border border-[#E2E8F0] bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#374151]">Password</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-[16px] border border-[#E2E8F0] bg-white py-3 pl-12 pr-14 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="text-right">
                  <button type="button" className="text-sm font-medium text-[#1E40AF] hover:text-[#3B82F6]">
                    Forgot password?
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-[18px] border border-[#FECACA] bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
                  {error}
                </div>
              )}

              <Button type="submit" size="full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-8 text-sm text-[#6B7280]">
              Don't have an account? <span className="text-[#1E40AF] font-semibold">Contact admin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
