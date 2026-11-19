'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'coordinator' | 'data_entry'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password changer states
  const [showPasswordChanger, setShowPasswordChanger] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [changingPwd, setChangingPwd] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim(), role }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      localStorage.setItem('cpa_user', JSON.stringify(data.user));
      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid campaign credentials');
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: 'error', text: 'All password fields are required' });
      return;
    }

    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPwd.length < 4) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 4 characters' });
      return;
    }

    setChangingPwd(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPwdMsg({ type: 'success', text: 'Password successfully changed! You can now log in.' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => {
        setShowPasswordChanger(false);
        setPwdMsg(null);
      }, 1800);
    } catch (err: unknown) {
      setPwdMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to change password' });
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-campaign-border shadow-xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-campaign-lightGreen text-campaign-primaryGreen rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-campaign-primaryGreen/20">
            <ShieldCheck className="w-9 h-9 text-campaign-primaryGreen" />
          </div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-campaign-gold bg-campaign-gold/10 px-3 py-0.5 rounded-full border border-campaign-gold/30">
            Authorized Personnel Only
          </span>
          <h2 className="font-heading font-extrabold text-2xl text-campaign-deepGreen">
            Campaign Administration
          </h2>
          <p className="text-xs text-campaign-muted">
            Elisha Adera Campaign Portal • Dept. of Management Science
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Regular Login Form */}
        {!showPasswordChanger ? (
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campaign-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-sm font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                  placeholder="Enter administrator username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campaign-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-sm font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                Access Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'coordinator' | 'data_entry')}
                className="w-full px-3 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
              >
                <option value="admin">Administrator (Full Access)</option>
                <option value="coordinator">Campaign Coordinator</option>
                <option value="data_entry">Data Entry Officer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white font-heading font-bold text-sm rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 text-campaign-gold" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordChanger(true);
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-campaign-primaryGreen hover:text-campaign-deepGreen font-medium hover:underline"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change Administrator Password</span>
              </button>
            </div>
          </form>
        ) : (
          /* Password Changer Form */
          <form onSubmit={handleChangePassword} autoComplete="off" className="space-y-4">
            <div className="p-3 bg-campaign-lightGreen/50 border border-campaign-primaryGreen/20 rounded-xl text-xs text-campaign-deepGreen font-medium">
              Update the portal security password. Requires your existing password.
            </div>

            {pwdMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  pwdMsg.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {pwdMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                autoComplete="off"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                placeholder="Enter new password (min. 4 characters)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                placeholder="Re-enter new password"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordChanger(false);
                  setPwdMsg(null);
                }}
                className="w-1/2 py-2.5 border border-gray-200 text-campaign-darkText rounded-xl text-xs font-bold hover:bg-gray-50"
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={changingPwd}
                className="w-1/2 py-2.5 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white rounded-xl text-xs font-bold shadow"
              >
                {changingPwd ? 'Updating...' : 'Save Password'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-gray-100">
          <Link
            href="/"
            className="text-xs font-semibold text-campaign-primaryGreen hover:text-campaign-deepGreen"
          >
            ← Back to Public Campaign Site
          </Link>
        </div>

      </div>
    </div>
  );
}
