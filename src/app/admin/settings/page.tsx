'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Plus, Trash2, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [candidateName, setCandidateName] = useState('Elisha Adera');
  const [position, setPosition] = useState('Super Delegate');
  const [department, setDepartment] = useState('Department of Management Science');
  const [institution, setInstitution] = useState('Technical University of Mombasa');
  const [period, setPeriod] = useState('2026/2027');
  const [slogan, setSlogan] = useState('Competent Leader');
  const [courses, setCourses] = useState<string[]>([]);
  const [newCourse, setNewCourse] = useState('');
  const [courseError, setCourseError] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [senderId, setSenderId] = useState('ELISHA2026');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load live settings from the backend API
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.candidateName) setCandidateName(s.candidateName);
          if (s.position) setPosition(s.position);
          if (s.department) setDepartment(s.department);
          if (s.institution) setInstitution(s.institution);
          if (s.campaignPeriod) setPeriod(s.campaignPeriod);
          if (s.slogan) setSlogan(s.slogan);
          if (Array.isArray(s.availableCourses)) setCourses(s.availableCourses);
          if (s.smsProvider) {
            setSmsEnabled(!!s.smsProvider.enabled);
            if (s.smsProvider.senderId) setSenderId(s.smsProvider.senderId);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleAddCourse = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCourse.trim();

    if (!trimmed) {
      setCourseError('Please enter a course title before adding.');
      return;
    }

    // Check for duplicate (case-insensitive)
    const exists = courses.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setCourseError('This course is already in the list.');
      return;
    }

    setCourses((prev) => [trimmed, ...prev]);
    setNewCourse('');
    setCourseError('');
  };

  const handleRemoveCourse = (c: string) => {
    setCourses((prev) => prev.filter((item) => item !== c));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(null);

    try {
      const payload = {
        candidateName,
        position,
        department,
        institution,
        campaignPeriod: period,
        slogan,
        availableCourses: courses,
        smsProvider: {
          enabled: smsEnabled,
          senderId,
          providerName: 'africastalking',
          approvalStatus: smsEnabled ? 'approved' : 'pending_election_clearance',
        },
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSavedNotice('Configuration saved and synced to database successfully!');
      } else {
        setSavedNotice('Error saving configuration: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setSavedNotice('Network error while saving settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setSavedNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-14 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-campaign-gold/15 border border-campaign-gold/30">
          <Settings className="w-3 h-3 text-campaign-gold" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-campaign-deepGreen">
            System Configuration
          </span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-campaign-deepGreen">
          Campaign Portal Settings
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage departmental course offerings, campaign credentials, and communications governance
        </p>
      </div>

      {savedNotice && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in ${
          savedNotice.includes('Error') || savedNotice.includes('error')
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{savedNotice}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 flex items-center justify-center gap-3 text-sm text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-campaign-primaryGreen" />
          <span>Loading portal configuration...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Core Campaign Identity */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-base text-campaign-deepGreen">
              Candidate & Campaign Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Elected Position
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  University
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Campaign Period
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Official Slogan
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
              </div>
            </div>
          </div>

          {/* Configurable Department Courses */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-heading font-bold text-base text-campaign-deepGreen">
                Departmental Courses Configuration
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                These courses appear in the student registration form dropdown. ({courses.length} courses configured)
              </p>
            </div>

            {/* Input + Add button */}
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new course name (e.g. Bsc. Finance & Investment)..."
                  value={newCourse}
                  onChange={(e) => {
                    setNewCourse(e.target.value);
                    if (courseError) setCourseError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCourse(e);
                    }
                  }}
                  className="flex-1 px-3.5 py-2.5 bg-campaign-lightBg border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="px-5 py-2.5 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {courseError && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{courseError}</span>
                </p>
              )}
            </div>

            {/* Course items list */}
            <div className="space-y-2 pt-2 max-h-[380px] overflow-y-auto pr-1">
              {courses.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-400">
                  No courses listed. Add one above.
                </div>
              ) : (
                courses.map((c) => (
                  <div
                    key={c}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-campaign-lightGreen/20 rounded-xl border border-gray-200 text-xs transition-colors"
                  >
                    <span className="font-semibold text-gray-800">{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(c)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SMS Provider Governance */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-campaign-deepGreen">
                  SMS Provider Integration
                </h3>
                <p className="text-xs text-gray-500">
                  Governed by Kenyan Bulk SMS student election regulations
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="w-4 h-4 text-campaign-primaryGreen rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-campaign-darkText">
                  Enable Live Dispatch
                </span>
              </label>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Bulk SMS must remain in sandbox mode until the SMS provider (e.g. Africa&apos;s Talking) confirms adherence to TUM election rules.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Sender ID / Alphanumeric Tag
                </label>
                <input
                  type="text"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-mono font-bold text-campaign-deepGreen"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  disabled
                  value="Africa's Talking (Kenya)"
                  className="w-full px-3 py-2 bg-gray-100 border border-campaign-border rounded-xl font-medium text-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-campaign-gold" />}
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
