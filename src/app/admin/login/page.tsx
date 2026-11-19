'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('cpa2026');
  const [role, setRole] = useState<'admin' | 'coordinator' | 'data_entry'>('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password');
      return;
    }

    setLoading(true);

    // Client-side authentication & session persistence
    setTimeout(() => {
      if (password === 'cpa2026' || password === 'admin' || password === 'password') {
        const user = {
          name: username === 'admin' ? 'Campaign Administrator' : username,
          username,
          role,
          token: `token_${Date.now()}`
        };
        localStorage.setItem('cpa_user', JSON.stringify(user));
        router.push('/admin');
      } else {
        setError('Invalid campaign credentials. Default demo password is "cpa2026"');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-campaign-border shadow-xl">
        
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

        <form onSubmit={handleLogin} className="space-y-4">
          
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-sm font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                placeholder="admin"
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-sm font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                placeholder="••••••••"
              />
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

          {/* Demo hint */}
          <div className="bg-campaign-lightBg p-3 rounded-xl border border-campaign-border text-[11px] text-campaign-muted space-y-1">
            <p className="font-semibold text-campaign-deepGreen">Demo Credentials:</p>
            <p>Username: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">admin</code> | Password: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">cpa2026</code></p>
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
        </form>

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

