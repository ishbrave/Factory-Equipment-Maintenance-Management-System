import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button, Modal } from '../components/common';
import { Footer } from '../components/layout/Footer';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotUser, setForgotUser] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetUser, setResetUser] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetBusy, setResetBusy] = useState(false);

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
      login(response.data.user);
      showSuccess('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const requestForgot = async () => {
    if (!forgotUser.trim()) {
      showError('Enter your username.');
      return;
    }
    setForgotBusy(true);
    try {
      const res = await api.post('/auth/forgot-password', { username: forgotUser.trim() });
      setResetToken(res.data.resetToken || '');
      setResetUser(forgotUser.trim());
      showSuccess(res.data.message || 'Recovery token issued.');
    } catch (err) {
      showError(err.response?.data?.message || 'Could not issue recovery token.');
    } finally {
      setForgotBusy(false);
    }
  };

  const submitReset = async () => {
    if (!resetUser.trim() || !resetToken.trim() || !resetNewPass) {
      showError('Username, token, and new password are required.');
      return;
    }
    if (resetNewPass !== resetConfirm) {
      showError('Passwords do not match.');
      return;
    }
    setResetBusy(true);
    try {
      const res = await api.post('/auth/reset-password', {
        username: resetUser.trim(),
        resetToken: resetToken.trim(),
        newPassword: resetNewPass,
      });
      showSuccess(res.data.message || 'Password updated.');
      setForgotOpen(false);
      setForgotUser('');
      setResetToken('');
      setResetNewPass('');
      setResetConfirm('');
    } catch (err) {
      showError(err.response?.data?.message || 'Reset failed.');
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <div className="flex flex-1 items-center justify-center py-10 md:py-12">
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:min-h-0 md:flex-row">
          <div className="hidden w-[42%] flex-col bg-[#1E40AF] px-10 py-12 text-white md:flex">
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/20 bg-white/15">
                  <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="10" rx="2" />
                    <path d="M7 8V6a5 5 0 0 1 10 0v2" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight">SmartPark — PSSMS</h1>
                  <p className="max-w-[300px] text-sm text-white/80">Parking Space Sales Management System — Rubavu District, Rwanda</p>
                </div>
              </div>
              <p className="rounded-2xl bg-white/10 p-4 text-sm text-white/85">Session-based secure access for administrators.</p>
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col justify-center px-8 py-10 sm:px-12 md:w-[58%] md:px-12 md:py-14">
            <div className="mx-auto w-full max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1E40AF]">Welcome</p>
              <h2 className="mt-4 text-3xl font-bold text-[#111827]">Sign in</h2>
              <p className="mt-3 text-sm text-[#6B7280]">Enter your administrator credentials.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5" autoComplete="off">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#374151]">Username</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                      <Mail size={18} />
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                      autoComplete="username"
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
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      autoComplete="current-password"
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
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#1E40AF] hover:underline"
                    onClick={() => {
                      setForgotOpen(true);
                      setForgotUser(username);
                      setResetUser(username);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <div className="rounded-[18px] border border-[#FECACA] bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">{error}</div>
                )}

                <Button type="submit" size="full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <Modal title="Account recovery" isOpen={forgotOpen} onClose={() => setForgotOpen(false)}>
        <div className="space-y-4 text-sm text-[#374151]">
          <p>Request a one-hour recovery token, then set a new strong password.</p>
          <div>
            <label className="mb-1 block font-medium">Username</label>
            <input
              className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2"
              value={forgotUser}
              onChange={(e) => setForgotUser(e.target.value)}
              placeholder="admin"
            />
            <Button type="button" className="mt-2 w-full" onClick={requestForgot} disabled={forgotBusy}>
              <KeyRound size={16} /> {forgotBusy ? 'Please wait...' : 'Get recovery token'}
            </Button>
          </div>
          {resetToken ? (
            <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-3 text-xs break-all">
              <span className="font-semibold text-[#1E40AF]">Your token (copy it):</span>
              <div className="mt-1 font-mono text-[#111827]">{resetToken}</div>
            </div>
          ) : null}
          <div className="border-t border-[#E2E8F0] pt-4">
            <p className="mb-2 font-semibold text-[#111827]">Reset password</p>
            <label className="mb-1 block text-xs font-medium">Username</label>
            <input
              className="mb-2 w-full rounded-xl border border-[#E2E8F0] px-3 py-2"
              value={resetUser}
              onChange={(e) => setResetUser(e.target.value)}
            />
            <label className="mb-1 block text-xs font-medium">Recovery token</label>
            <input
              className="mb-2 w-full rounded-xl border border-[#E2E8F0] px-3 py-2 font-mono text-xs"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
            />
            <label className="mb-1 block text-xs font-medium">New password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="mb-2 w-full rounded-xl border border-[#E2E8F0] px-3 py-2"
              value={resetNewPass}
              onChange={(e) => setResetNewPass(e.target.value)}
            />
            <label className="mb-1 block text-xs font-medium">Confirm password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="mb-2 w-full rounded-xl border border-[#E2E8F0] px-3 py-2"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
            />
            <Button type="button" className="w-full" onClick={submitReset} disabled={resetBusy}>
              {resetBusy ? 'Updating...' : 'Update password'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
