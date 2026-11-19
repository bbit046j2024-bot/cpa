'use client';

import React, { useState, useEffect } from 'react';
import { CampaignActivity } from '@/lib/types';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Users,
  CheckCircle2,
  X,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<CampaignActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-11-25');
  const [time, setTime] = useState('16:00');
  const [venue, setVenue] = useState('BSC Hall A');
  const [category, setCategory] = useState<'hall_meeting' | 'strategy' | 'rally' | 'outreach'>('hall_meeting');
  const [targetAudience, setTargetAudience] = useState('Management Science Comrades');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !date || !venue.trim()) {
      setFormError('Please fill in title, date, and venue');
      return;
    }

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          date,
          time,
          venue: venue.trim(),
          category,
          targetAudience,
          status: 'upcoming',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setModalOpen(false);
      setTitle('');
      setDescription('');
      fetchActivities();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error creating activity');
    }
  };

  const filtered = activities.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-14 max-w-screen-xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-campaign-gold/15 border border-campaign-gold/30">
            <Calendar className="w-3 h-3 text-campaign-gold" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-campaign-deepGreen">Field Coordination</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-campaign-deepGreen">
            Campaign Activities
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Town halls, class walk-ins, volunteer rallies, and strategy sessions
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-campaign-gold" />
          <span>Schedule Activity</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === tab
                ? 'bg-campaign-deepGreen text-white shadow-xs'
                : 'text-campaign-muted hover:bg-campaign-lightGreen'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-campaign-muted text-xs">
            Loading scheduled campaign events...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-campaign-muted text-xs">
            No activities found matching &quot;{statusFilter}&quot;.
          </div>
        ) : (
          filtered.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-2xl p-6 border border-campaign-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-campaign-lightGreen text-campaign-deepGreen">
                    {act.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      act.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-800'
                        : act.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {act.status}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-campaign-darkText">
                  {act.title}
                </h3>

                <p className="text-xs text-campaign-muted leading-relaxed line-clamp-3">
                  {act.description}
                </p>

                <div className="space-y-1.5 text-xs text-campaign-darkText/80 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-campaign-primaryGreen" />
                    <span>{act.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-campaign-primaryGreen" />
                    <span>{act.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-campaign-primaryGreen" />
                    <span>{act.venue}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-campaign-muted">
                <span>Audience: <strong>{act.targetAudience}</strong></span>
                {act.attendanceCount && (
                  <span className="text-campaign-deepGreen font-bold flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {act.attendanceCount} attended
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-campaign-border space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-campaign-deepGreen">
                Schedule Campaign Activity
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Year 3 B.Com Strategy Walk-in"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Description / Agenda
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of discussion points or mobilization purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BSC Lecture Theatre 2"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium"
                  >
                    <option value="hall_meeting">Hall Meeting</option>
                    <option value="strategy">Strategy Session</option>
                    <option value="rally">Volunteer Rally</option>
                    <option value="outreach">Outreach Walk-in</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                    Target Comrades
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-campaign-border rounded-xl font-bold text-campaign-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white font-bold rounded-xl shadow"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

