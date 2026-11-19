'use client';

import React, { useState, useEffect } from 'react';
import { CommunicationMessage, Supporter } from '@/lib/types';
import {
  MessageSquare,
  Send,
  Users,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertTriangle,
  Copy,
  ExternalLink,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<CommunicationMessage[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [targetCourse, setTargetCourse] = useState('all');
  const [targetYear, setTargetYear] = useState('all');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  const fetchComms = async () => {
    try {
      const res = await fetch('/api/communications');
      const data = await res.json();
      if (data.success) {
        setCommunications(data.communications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSupporters = async () => {
    try {
      const res = await fetch('/api/supporters');
      const data = await res.json();
      if (data.success) {
        setSupporters(data.supporters || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComms();
    fetchSupporters();
  }, []);

  // Filtered consented recipients count
  const consentedRecipients = supporters.filter((s) => {
    if (!s.communicationConsent || s.status !== 'active') return false;
    const matchesCourse = targetCourse === 'all' || s.course === targetCourse;
    const matchesYear = targetYear === 'all' || s.yearOfStudy === targetYear;
    return matchesCourse && matchesYear;
  });

  // Unique courses for recipient filter
  const courses = Array.from(new Set(supporters.map((s) => s.course))).sort();

  // SMS character count logic
  const charCount = message.length;
  const segments = Math.max(1, Math.ceil(charCount / 160));
  const charsRemainingInSegment = 160 * segments - charCount;

  // Preset campaign message templates
  const applyTemplate = (t: string) => {
    if (t === 'welcome') {
      setTitle('Welcome to CPA Supporter Community');
      setMessage('Hello Comrade, thank you for joining the Elisha Adera Super Delegate 2026/2027 campaign register. Together for Comrades by Comrades! Reply STOP to opt out.');
    } else if (t === 'townhall') {
      setTitle('Management Science Comrades Town Hall');
      setMessage('Comrades! Join Elisha Adera for the Dept of Management Science Town Hall this Tue at BSC Hall A from 4PM. Your voice, your delegate! Reply STOP to opt out.');
    } else if (t === 'voting') {
      setTitle('Elections Reminder: Vote Elisha Adera');
      setMessage('Comrades of Management Science, today is election day! Exercise your democratic right: Vote Elisha Adera for Super Delegate 26/27. Competent Leader.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!title.trim() || !message.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter both title and message text' });
      return;
    }

    if (consentedRecipients.length === 0) {
      setStatusMsg({ type: 'warning', text: 'No consented active supporters match the selected criteria.' });
      return;
    }

    try {
      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          channel,
          targetCourse,
          targetYear,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.warning) {
        setStatusMsg({ type: 'warning', text: `${data.message} (${data.warning})` });
      } else {
        setStatusMsg({ type: 'success', text: `Message dispatched successfully to ${consentedRecipients.length} supporters!` });
      }

      setTitle('');
      setMessage('');
      fetchComms();
    } catch (err: unknown) {
      setStatusMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error sending communication' });
    }
  };

  return (
    <div className="space-y-8 pb-14 max-w-screen-xl mx-auto">
      
      {/* Top Banner */}
      <div>
        <div className="inline-flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-campaign-gold/15 border border-campaign-gold/30">
          <MessageSquare className="w-3 h-3 text-campaign-gold" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-campaign-deepGreen">Consent-Governed Messaging</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-campaign-deepGreen">
          Communications Centre
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Broadcast official announcements strictly to verified, consented supporters.
        </p>
      </div>

      {/* Compliance Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed space-y-1">
          <p className="font-bold text-sm text-amber-950">
            Regulatory & Platform Consent Compliance
          </p>
          <p>
            1. In strict compliance with Kenyan Data Protection laws and university electoral guidelines, communications are sent <strong>ONLY</strong> to supporters who explicitly granted SMS consent.
          </p>
          <p>
            2. The SMS integration operates in safe-mode until the chosen provider completes university student-election clearance. WhatsApp messages are generated for compliant authorized contact drafting.
          </p>
        </div>
      </div>

      {/* Composer & Recipient Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Message Composer */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-campaign-border shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-campaign-primaryGreen" />
              <h3 className="font-heading font-bold text-lg text-campaign-deepGreen">
                Compose Communication
              </h3>
            </div>
            
            <div className="flex items-center gap-1 bg-campaign-lightBg p-1 rounded-xl border border-campaign-border text-xs">
              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  channel === 'sms' ? 'bg-campaign-primaryGreen text-white shadow-xs' : 'text-campaign-muted'
                }`}
              >
                SMS Gateway
              </button>
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  channel === 'whatsapp' ? 'bg-green-600 text-white shadow-xs' : 'text-campaign-muted'
                }`}
              >
                WhatsApp Drafter
              </button>
            </div>
          </div>

          {/* Quick Templates */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-campaign-muted mb-1.5">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyTemplate('welcome')}
                className="px-2.5 py-1 bg-gray-100 hover:bg-campaign-lightGreen text-campaign-darkText text-xs rounded-lg transition-colors"
              >
                Welcome Note
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('townhall')}
                className="px-2.5 py-1 bg-gray-100 hover:bg-campaign-lightGreen text-campaign-darkText text-xs rounded-lg transition-colors"
              >
                Town Hall Reminder
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('voting')}
                className="px-2.5 py-1 bg-gray-100 hover:bg-campaign-lightGreen text-campaign-darkText text-xs rounded-lg transition-colors"
              >
                Vote Elisha Adera
              </button>
            </div>
          </div>

          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-green-50 text-green-900 border border-green-200'
                  : statusMsg.type === 'warning'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                Subject / Internal Campaign Reference
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Town Hall Reminder - Year 2 & 3"
                className="w-full px-3.5 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText">
                  Message Content
                </label>
                <span className="text-[11px] text-campaign-muted font-mono">
                  {charCount} chars | {segments} SMS segment{segments > 1 ? 's' : ''} ({charsRemainingInSegment} left)
                </span>
              </div>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose your campaign message here. Always remind supporters of opt-out instructions..."
                className="w-full p-3.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-campaign-gold" />
                <span>
                  {channel === 'sms'
                    ? `Dispatch to ${consentedRecipients.length} Consented Supporters`
                    : 'Generate WhatsApp Message'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Recipient Segmentation & Channel Status */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Recipient Audience Filter Card */}
          <div className="bg-white rounded-2xl p-6 border border-campaign-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-campaign-deepGreen">
                Audience Segmentation
              </h3>
              <Users className="w-5 h-5 text-campaign-primaryGreen" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-campaign-darkText mb-1">
                  Target Course
                </label>
                <select
                  value={targetCourse}
                  onChange={(e) => setTargetCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium"
                >
                  <option value="all">All Management Science Courses</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-campaign-darkText mb-1">
                  Target Academic Year
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium"
                >
                  <option value="all">All Academic Years</option>
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-campaign-lightGreen rounded-xl border border-campaign-primaryGreen/20 text-center space-y-1">
              <div className="text-2xl font-heading font-extrabold text-campaign-deepGreen">
                {consentedRecipients.length}
              </div>
              <p className="text-xs font-semibold text-campaign-primaryGreen">
                Eligible Consented Recipients
              </p>
              <p className="text-[11px] text-campaign-muted">
                (Non-consented & inactive supporters automatically excluded)
              </p>
            </div>
          </div>

          {/* Channel Status Indicator */}
          <div className="bg-white rounded-2xl p-6 border border-campaign-border shadow-xs space-y-3 text-xs">
            <h4 className="font-heading font-bold text-sm text-campaign-deepGreen">
              Channel Governance
            </h4>
            
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <span className="font-medium">SMS Gateway (Kenya Bulk):</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                Sandbox / Pre-Clearance
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <span className="font-medium">Sender ID:</span>
              <span className="font-mono font-bold text-campaign-deepGreen">ELISHA2026</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <span className="font-medium">WhatsApp Channel:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-800">
                Template Drafter Ready
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Communication History Log */}
      <div className="bg-white rounded-2xl border border-campaign-border shadow-xs overflow-hidden">
        <div className="p-6 border-b border-campaign-border flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg text-campaign-deepGreen">
              Communication History & Logs
            </h3>
            <p className="text-xs text-campaign-muted">
              Archived broadcasts, recipient counts, and delivery states
            </p>
          </div>
          <span className="text-xs font-bold text-campaign-muted font-mono">
            {communications.length} Broadcasts
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {communications.length === 0 ? (
            <div className="p-8 text-center text-xs text-campaign-muted">
              No previous communication broadcasts recorded.
            </div>
          ) : (
            communications.map((comm) => (
              <div key={comm.id} className="p-5 hover:bg-gray-50 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-campaign-darkText text-sm">
                      {comm.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-campaign-lightGreen text-campaign-deepGreen">
                      {comm.channel.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-campaign-muted">
                    {new Date(comm.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-campaign-darkText/80 leading-relaxed bg-campaign-lightBg p-3 rounded-xl border border-campaign-border">
                  {comm.message}
                </p>

                <div className="flex items-center justify-between text-xs text-campaign-muted pt-1">
                  <span>Recipients: <strong>{comm.recipientCount}</strong> consented comrades</span>
                  <span className={`font-semibold capitalize ${comm.status === 'sent' ? 'text-green-600' : 'text-amber-600'}`}>
                    Status: {comm.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

