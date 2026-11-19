'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  UserPlus,
  CheckCircle2,
  XCircle,
  MessageSquare,
  BarChart3,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Supporter } from '@/lib/types';

interface StatsResponse {
  total: number;
  active: number;
  consented: number;
  consentRate: number;
  foundationCount: number;
  byCourse: { course: string; count: number }[];
  byYear: { year: string; count: number; pct: number }[];
  recent: Supporter[];
}

function formatDate(iso: string) {
  if (!iso) return 'Recent';
  try {
    return new Date(iso).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-heading font-extrabold text-campaign-deepGreen leading-none">{value}</p>
        <p className="text-[11px] text-gray-500 mt-1.5">{sub}</p>
      </div>
    </div>
  );
}

function BarRow({
  label,
  count,
  pct,
  color,
}: {
  label: string;
  count: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700 truncate max-w-[70%]">{label}</span>
        <span className="font-bold text-campaign-deepGreen ml-2">
          {count} <span className="text-[10px] text-gray-400 font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  desc,
  pill,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  pill?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-campaign-primaryGreen hover:shadow-md transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-campaign-lightGreen flex items-center justify-center group-hover:bg-campaign-primaryGreen transition-colors flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-campaign-deepGreen">{label}</p>
        <p className="text-[11px] text-gray-500 truncate">{desc}</p>
      </div>
      {pill && (
        <span className="text-[10px] font-bold bg-campaign-gold/20 text-campaign-deepGreen px-2 py-0.5 rounded-full border border-campaign-gold/30">
          {pill}
        </span>
      )}
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-campaign-primaryGreen flex-shrink-0 transition-colors" />
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stats', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to load stats');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching analytics';
      setError(msg);
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const total = stats?.total || 0;

  return (
    <div className="space-y-7 pb-14 max-w-screen-xl mx-auto">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-campaign-gold/15 border border-campaign-gold/30">
            <TrendingUp className="w-3 h-3 text-campaign-gold" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-campaign-deepGreen">
              TiDB Cloud Live Sync
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-campaign-deepGreen">
            Executive Overview
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Super Delegate 2026/2027 · Candidate: <strong className="text-campaign-deepGreen">Elisha Adera</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => loadStats(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 hover:border-campaign-primaryGreen text-gray-700 hover:text-campaign-deepGreen text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50"
            title="Refresh TiDB Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-campaign-primaryGreen' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
          <Link
            href="/admin/supporters"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4 text-campaign-gold" />
            <span>Manage Supporters</span>
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:border-campaign-primaryGreen text-gray-700 hover:text-campaign-deepGreen text-xs font-bold rounded-xl transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Reports</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadStats()} className="font-bold underline ml-2">Try Again</button>
        </div>
      )}

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Supporters"
          value={loading ? '...' : (stats?.total ?? 0)}
          sub="Registered Management Science comrades"
          icon={<Users className="w-5 h-5 text-campaign-primaryGreen" />}
          accent="bg-campaign-lightGreen"
        />
        <KpiCard
          label="Active Supporters"
          value={loading ? '...' : (stats?.active ?? 0)}
          sub={loading ? 'Loading...' : `${stats?.active ?? 0} of ${stats?.total ?? 0} currently active`}
          icon={<UserCheck className="w-5 h-5 text-green-600" />}
          accent="bg-green-50"
        />
        <KpiCard
          label="SMS Consented"
          value={loading ? '...' : (stats?.consented ?? 0)}
          sub={loading ? 'Loading...' : `${stats?.consentRate ?? 0}% opted in for campaign updates`}
          icon={<ShieldCheck className="w-5 h-5 text-campaign-gold" />}
          accent="bg-campaign-gold/10"
        />
        <KpiCard
          label="Foundation Register"
          value={loading ? '...' : (stats?.foundationCount ?? 25)}
          sub="Initial loyalists from founding register"
          icon={<GraduationCap className="w-5 h-5 text-campaign-cpaBlue" />}
          accent="bg-blue-50"
        />
      </div>

      {/* ── Charts + Quick Actions ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* By Year chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-campaign-deepGreen">By Academic Year</h3>
              <p className="text-[11px] text-gray-400">Cohort spread across Year 1 – 4</p>
            </div>
            <Calendar className="w-4.5 h-4.5 text-campaign-primaryGreen" />
          </div>

          <div className="space-y-3.5">
            {loading ? (
              <div className="py-8 text-center text-xs text-gray-400">Loading cohort metrics...</div>
            ) : (
              stats?.byYear.map((y) => (
                <BarRow
                  key={y.year}
                  label={y.year}
                  count={y.count}
                  pct={y.pct}
                  color="bg-campaign-primaryGreen"
                />
              ))
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-400 border-t border-gray-100">
            <span className="w-2 h-2 rounded-full bg-campaign-primaryGreen inline-block" />
            Live data synchronized with TiDB Cloud
          </div>
        </div>

        {/* By Course chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-campaign-deepGreen">By Course</h3>
              <p className="text-[11px] text-gray-400">Management Science programs</p>
            </div>
            <GraduationCap className="w-4.5 h-4.5 text-campaign-gold" />
          </div>

          <div className="space-y-3.5">
            {loading ? (
              <div className="py-8 text-center text-xs text-gray-400">Loading course breakdown...</div>
            ) : !stats?.byCourse.length ? (
              <div className="py-8 text-center text-xs text-gray-400">No course data found.</div>
            ) : (
              stats?.byCourse.slice(0, 6).map((item) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <BarRow
                    key={item.course}
                    label={item.course}
                    count={item.count}
                    pct={pct}
                    color="bg-campaign-gold"
                  />
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
            <span className="text-[11px] text-gray-400">
              Top {Math.min(6, stats?.byCourse.length || 0)} courses shown
            </span>
            <Link href="/admin/supporters" className="text-[11px] font-bold text-campaign-primaryGreen hover:underline">
              Filter by course →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="font-heading font-bold text-sm text-campaign-deepGreen px-1">Quick Actions</h3>
          <QuickAction
            href="/admin/supporters"
            icon={<Users className="w-5 h-5 text-campaign-primaryGreen group-hover:text-white transition-colors" />}
            label="Supporters"
            desc="View, edit, export directory"
            pill={`${stats?.total ?? 0}`}
          />
          <QuickAction
            href="/admin/communications"
            icon={<MessageSquare className="w-5 h-5 text-campaign-primaryGreen group-hover:text-white transition-colors" />}
            label="Send Message"
            desc="SMS / WhatsApp outreach"
          />
          <QuickAction
            href="/admin/activities"
            icon={<Calendar className="w-5 h-5 text-campaign-primaryGreen group-hover:text-white transition-colors" />}
            label="Schedule Activity"
            desc="Plan upcoming campaign events"
          />
          <QuickAction
            href="/admin/reports"
            icon={<BarChart3 className="w-5 h-5 text-campaign-primaryGreen group-hover:text-white transition-colors" />}
            label="Generate Report"
            desc="Printable executive summary"
          />
        </div>
      </div>

      {/* ── Recent Registrations Table ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-base text-campaign-deepGreen">
              Recent Registrations
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Latest live entries directly from TiDB Cloud
            </p>
          </div>
          <Link
            href="/admin/supporters"
            className="flex items-center gap-1 text-xs font-bold text-campaign-primaryGreen hover:text-campaign-deepGreen transition-colors"
          >
            View all {stats?.total ?? 0} supporters
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Phone', 'Course', 'Year', 'Date Registered', 'SMS Consent', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Loading live registrations...
                  </td>
                </tr>
              ) : !stats?.recent.length ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                stats?.recent.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`hover:bg-campaign-lightGreen/20 transition-colors ${
                      i % 2 === 0 ? '' : 'bg-gray-50/40'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-campaign-lightGreen text-campaign-deepGreen font-extrabold text-[11px] flex items-center justify-center flex-shrink-0">
                          {s.fullName.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-800 whitespace-nowrap">{s.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600 whitespace-nowrap">{s.phoneNumber}</td>
                    <td className="py-3.5 px-4 text-gray-600 max-w-[200px] truncate">{s.course}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-campaign-deepGreen">{s.yearOfStudy}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {formatDate(s.registrationDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.communicationConsent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          <CheckCircle2 className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3 text-gray-400" /> No
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-campaign-lightGreen text-campaign-deepGreen">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            Showing {stats?.recent.length ?? 0} most recent of {stats?.total ?? 0} total
          </span>
          <Link
            href="/admin/supporters"
            className="inline-flex items-center gap-1 text-xs font-bold text-campaign-primaryGreen hover:text-campaign-deepGreen"
          >
            Open Directory & Export Tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
