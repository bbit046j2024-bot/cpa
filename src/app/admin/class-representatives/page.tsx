'use client';

import { useState } from 'react';
import { BadgeCheck, ClipboardList, Loader2, LockKeyhole, RefreshCw, XCircle } from 'lucide-react';

type Registration = {
  id: string;
  fullName: string;
  contact: string;
  contactType: 'phone' | 'email';
  course: string;
  yearOfStudy: string;
  reviewStatus: 'pending' | 'verified' | 'rejected';
  registeredAt: string;
};

export default function ClassRepresentativesPage() {
  const [reviewToken, setReviewToken] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const loadRegistrations = async () => {
    if (!reviewToken.trim()) {
      setMessage('Enter the class rep review token configured for this portal.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/class-representatives/review?status=${status}`, {
        headers: { Authorization: `Bearer ${reviewToken.trim()}` },
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not load registrations.');
      setRegistrations(data.registrations || []);
      setMessage(`${data.count} ${status} registration${data.count === 1 ? '' : 's'}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load registrations.');
      setRegistrations([]);
    } finally {
      setBusy(false);
    }
  };

  const reviewRegistration = async (id: string, nextStatus: 'verified' | 'rejected') => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/class-representatives/review', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${reviewToken.trim()}`,
        },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not update registration.');
      setMessage(data.message);
      await loadRegistrations();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update registration.');
      setBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-campaign-primaryGreen text-xs font-bold uppercase tracking-wider">
          <ClipboardList className="w-4 h-4" /> Separate class rep register
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-campaign-deepGreen mt-2">Class representative verification</h1>
        <p className="text-sm text-campaign-muted mt-2 max-w-3xl">These applications are stored separately from the supporter register. Verify each applicant against the official class representative list before marking them eligible to vote.</p>
      </div>

      <section className="bg-white rounded-2xl border border-campaign-border shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-campaign-darkText"><LockKeyhole className="w-4 h-4 text-campaign-primaryGreen" /> Reviewer access</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="password"
            autoComplete="off"
            value={reviewToken}
            onChange={(event) => setReviewToken(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') void loadRegistrations(); }}
            placeholder="Class rep review token"
            aria-label="Class rep review token"
            className="flex-1 px-4 py-3 rounded-xl border border-campaign-border bg-campaign-lightBg text-sm focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
          />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="px-4 py-3 rounded-xl border border-campaign-border bg-white text-sm">
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={() => void loadRegistrations()} disabled={busy} className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white font-bold text-sm disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Load applications
          </button>
        </div>
        {message && <p role="status" className="text-sm text-campaign-muted">{message}</p>}
      </section>

      <div className="space-y-3">
        {registrations.map((registration) => (
          <article key={registration.id} className="bg-white rounded-2xl border border-campaign-border shadow-sm p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
            <div className="min-w-0">
              <h2 className="font-bold text-campaign-darkText">{registration.fullName}</h2>
              <p className="text-sm text-campaign-muted mt-1">{registration.contact} · {registration.course} · {registration.yearOfStudy}</p>
              <p className="text-xs text-campaign-muted mt-1">Received {new Date(registration.registeredAt).toLocaleString()}</p>
            </div>
            {registration.reviewStatus === 'pending' ? (
              <div className="flex gap-2 shrink-0">
                <button onClick={() => void reviewRegistration(registration.id, 'verified')} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-60"><BadgeCheck className="w-4 h-4" /> Verify class rep</button>
                <button onClick={() => void reviewRegistration(registration.id, 'rejected')} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 text-sm font-bold disabled:opacity-60"><XCircle className="w-4 h-4" /> Reject</button>
              </div>
            ) : (
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${registration.reviewStatus === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{registration.reviewStatus}</span>
            )}
          </article>
        ))}
        {!busy && registrations.length === 0 && <div className="bg-white rounded-2xl border border-dashed border-campaign-border p-8 text-center text-sm text-campaign-muted">Load applications to review this queue.</div>}
      </div>
    </div>
  );
}
