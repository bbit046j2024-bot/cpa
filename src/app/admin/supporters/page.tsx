'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Supporter } from '@/lib/types';
import { normalizeKenyanPhone } from '@/lib/phone';
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Phone,
  GraduationCap,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

export default function SupportersDirectoryPage() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedConsent, setSelectedConsent] = useState('all');

  // Modal states
  const [detailsModal, setDetailsModal] = useState<Supporter | null>(null);
  const [editModal, setEditModal] = useState<Supporter | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Supporter | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCourse, setFormCourse] = useState('Bachelor of Business and Information Technology');
  const [formYear, setFormYear] = useState('Year 2');
  const [formConsent, setFormConsent] = useState(true);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState<string | null>(null);

  // Import states
  const [importText, setImportText] = useState('');
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const fetchSupporters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/supporters');
      const data = await res.json();
      if (data.success) {
        setSupporters(data.supporters);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupporters();
  }, []);

  // Filtered supporters
  const filteredSupporters = useMemo(() => {
    return supporters.filter((s) => {
      const matchesSearch =
        !searchTerm.trim() ||
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phoneNumber.includes(searchTerm) ||
        (s.rawPhone && s.rawPhone.includes(searchTerm));

      const matchesCourse = selectedCourse === 'all' || s.course === selectedCourse;
      const matchesYear = selectedYear === 'all' || s.yearOfStudy === selectedYear;
      const matchesConsent =
        selectedConsent === 'all' ||
        (selectedConsent === 'yes' && s.communicationConsent) ||
        (selectedConsent === 'no' && !s.communicationConsent);

      return matchesSearch && matchesCourse && matchesYear && matchesConsent;
    });
  }, [supporters, searchTerm, selectedCourse, selectedYear, selectedConsent]);

  // Unique courses in list
  const availableCourses = useMemo(() => {
    const set = new Set(supporters.map((s) => s.course));
    return Array.from(set).sort();
  }, [supporters]);

  // Handle Add
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const val = normalizeKenyanPhone(formPhone);
    if (!val.isValid) {
      setFormError(val.error || 'Invalid phone number');
      return;
    }

    try {
      const res = await fetch('/api/supporters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formName.trim(),
          phoneNumber: val.normalized,
          rawPhone: val.formatted,
          course: formCourse,
          yearOfStudy: formYear,
          communicationConsent: formConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAddModalOpen(false);
      resetForm();
      fetchSupporters();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error creating supporter');
    }
  };

  // Handle Edit
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setFormError(null);

    const val = normalizeKenyanPhone(formPhone);
    if (!val.isValid) {
      setFormError(val.error || 'Invalid phone');
      return;
    }

    try {
      const res = await fetch(`/api/supporters/${editModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formName.trim(),
          phoneNumber: val.normalized,
          rawPhone: val.formatted,
          course: formCourse,
          yearOfStudy: formYear,
          communicationConsent: formConsent,
          status: formStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEditModal(null);
      resetForm();
      fetchSupporters();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error updating supporter');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/supporters/${deleteConfirm.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDeleteConfirm(null);
      fetchSupporters();
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle active status directly
  const handleToggleStatus = async (supporter: Supporter) => {
    const newStatus = supporter.status === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`/api/supporters/${supporter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchSupporters();
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (s: Supporter) => {
    setEditModal(s);
    setFormName(s.fullName);
    setFormPhone(s.phoneNumber);
    setFormCourse(s.course);
    setFormYear(s.yearOfStudy);
    setFormConsent(s.communicationConsent);
    setFormStatus(s.status);
    setFormError(null);
  };

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormCourse('Bachelor of Business and Information Technology');
    setFormYear('Year 2');
    setFormConsent(true);
    setFormStatus('active');
    setFormError(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Full Name', 'Phone Number', 'Course', 'Year of Study', 'Consent Status', 'Status', 'Registered Date'];
    const rows = filteredSupporters.map((s) => [
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.phoneNumber}"`,
      `"${s.course.replace(/"/g, '""')}"`,
      `"${s.yearOfStudy}"`,
      s.communicationConsent ? 'Yes' : 'No',
      s.status,
      `"${new Date(s.registrationDate).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Elisha_Adera_Supporters_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV/Text Import parsing
  const handleProcessImport = async () => {
    if (!importText.trim()) return;
    const lines = importText.trim().split('\n');
    const rows: Array<{ fullName: string; phoneNumber: string; course: string; yearOfStudy: string }> = [];

    lines.forEach((line) => {
      // support tab or comma delimited
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        // Skip header if line matches
        if (parts[0].toLowerCase().includes('name') && parts[1].toLowerCase().includes('contact')) return;
        rows.push({
          fullName: parts[0]?.trim() || '',
          phoneNumber: parts[1]?.trim() || '',
          course: parts[2]?.trim() || 'Management Science',
          yearOfStudy: parts[3]?.trim() || 'Year 2',
        });
      }
    });

    try {
      const res = await fetch('/api/supporters/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (data.success) {
        setImportSummary(`Imported ${data.summary.addedCount} new records. Ignored ${data.summary.duplicateCount} duplicates.`);
        fetchSupporters();
      } else {
        setImportSummary(`Import failed: ${data.error}`);
      }
    } catch (e) {
      setImportSummary('Network error during import');
    }
  };

  return (
    <div className="space-y-6 pb-14 max-w-screen-xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-campaign-gold/15 border border-campaign-gold/30">
            <Users className="w-3 h-3 text-campaign-gold" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-campaign-deepGreen">CPA Campaign Register</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-campaign-deepGreen">
            Supporter Directory
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredSupporters.length} of {supporters.length} supporters shown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { resetForm(); setAddModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-campaign-gold" />
            <span>Add Supporter</span>
          </button>

          <button
            onClick={() => { setImportSummary(null); setImportModalOpen(true); }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 hover:border-campaign-primaryGreen text-gray-700 text-xs font-bold rounded-xl transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-campaign-gold hover:bg-yellow-400 text-campaign-deepGreen text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campaign-muted">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
            />
          </div>

          {/* Course filter */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
            >
              <option value="all">All Management Science Courses</option>
              {availableCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Year filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
            >
              <option value="all">All Academic Years</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
            </select>
          </div>

          {/* Consent filter */}
          <div>
            <select
              value={selectedConsent}
              onChange={(e) => setSelectedConsent(e.target.value)}
              className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
            >
              <option value="all">All Consent Statuses</option>
              <option value="yes">SMS Consented Only</option>
              <option value="no">Non-Consented</option>
            </select>
          </div>

        </div>

        {/* Filter summary pill bar */}
        {(searchTerm || selectedCourse !== 'all' || selectedYear !== 'all' || selectedConsent !== 'all') && (
          <div className="flex items-center justify-between text-xs text-campaign-muted pt-2 border-t border-gray-100">
            <span>Filtered results: <strong>{filteredSupporters.length}</strong> supporters found</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCourse('all');
                setSelectedYear('all');
                setSelectedConsent('all');
              }}
              className="text-campaign-primaryGreen font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['#', 'Full Name', 'Phone Number', 'Course', 'Year', 'SMS Consent', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap ${i === 5 ? 'text-center' : i === 6 ? 'text-center' : i === 7 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-campaign-muted">
                    <div className="w-6 h-6 border-2 border-campaign-primaryGreen border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading verified supporter database...</span>
                  </td>
                </tr>
              ) : filteredSupporters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-campaign-muted">
                    No supporters match your current search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSupporters.map((s, index) => (
                  <tr key={s.id} className="hover:bg-campaign-lightGreen/15 transition-colors">
                    <td className="py-3.5 px-4 text-campaign-muted font-mono">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-campaign-darkText">
                      {s.fullName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">
                      {s.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4 text-campaign-darkText/80 max-w-[220px] truncate">
                      {s.course}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-campaign-deepGreen">
                      {s.yearOfStudy}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.communicationConsent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <span>Consented</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3 text-gray-400" />
                          <span>No</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(s)}
                        title="Click to toggle Active/Inactive"
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full transition-all ${
                          s.status === 'active'
                            ? 'bg-campaign-lightGreen text-campaign-deepGreen border border-campaign-primaryGreen/20'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {s.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailsModal(s)}
                          className="p-1.5 text-campaign-muted hover:text-campaign-deepGreen hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-campaign-muted hover:text-campaign-primaryGreen hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Supporter"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(s)}
                          className="p-1.5 text-campaign-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. DETAILS MODAL */}
      {detailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-campaign-border space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-campaign-deepGreen">
                Supporter Profile
              </h3>
              <button
                onClick={() => setDetailsModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-campaign-muted">Full Name:</span>
                <span className="font-bold text-campaign-darkText text-sm">{detailsModal.fullName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-campaign-muted">Phone Number:</span>
                <span className="font-mono font-bold text-campaign-deepGreen">{detailsModal.phoneNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-campaign-muted">Course:</span>
                <span className="font-semibold text-campaign-darkText">{detailsModal.course}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-campaign-muted">Year of Study:</span>
                <span className="font-bold text-campaign-primaryGreen">{detailsModal.yearOfStudy}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-campaign-muted">SMS Consent:</span>
                <span className="font-semibold">{detailsModal.communicationConsent ? 'Granted (Opted-in)' : 'Declined'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-campaign-muted">Registered On:</span>
                <span>{new Date(detailsModal.registrationDate).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-campaign-muted">Registration Source:</span>
                <span className="font-semibold">{detailsModal.source || 'Direct Entry'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailsModal(null)}
                className="px-4 py-2 bg-campaign-primaryGreen text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD / EDIT MODAL */}
      {(addModalOpen || editModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-campaign-border space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-campaign-deepGreen">
                {editModal ? 'Edit Supporter Details' : 'Add New Supporter to Register'}
              </h3>
              <button
                onClick={() => { setAddModalOpen(false); setEditModal(null); }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={editModal ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Kenyan Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0712345678 or +254712345678"
                  className="w-full px-3.5 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                    Course
                  </label>
                  <select
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    className="w-full px-3 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                  >
                    <option value="Bachelor of Business and Information Technology">Bachelor of Business and Information Technology</option>
                    <option value="Bachelor of Science in Supply Chain Management">Bachelor of Science in Supply Chain Management</option>
                    <option value="Diploma in Logistics and Transport Management">Diploma in Logistics and Transport Management</option>
                    <option value="Diploma in Procurement">Diploma in Procurement</option>
                    <option value="Diploma in Supply Chain Management">Diploma in Supply Chain Management</option>
                    <option value="International Diploma in Logistics and Transport Management">International Diploma in Logistics and Transport Management</option>
                    <option value="Certificate in Stores Management">Certificate in Stores Management</option>
                    <option value="Certificate of Logistics and Transport Management">Certificate of Logistics and Transport Management</option>
                    <option value="Master of Business Information Systems">Master of Business Information Systems</option>
                    <option value="Master of Science in Supply Chain Management">Master of Science in Supply Chain Management</option>
                    <option value="Masters of Science in Procurement and Supply Chain Management">Masters of Science in Procurement and Supply Chain Management</option>
                    <option value="Doctor of Philosophy in Supply Chain Management">Doctor of Philosophy in Supply Chain Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                    Year of Study
                  </label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
                  >
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-campaign-darkText">
                  <input
                    type="checkbox"
                    checked={formConsent}
                    onChange={(e) => setFormConsent(e.target.checked)}
                    className="w-4 h-4 text-campaign-primaryGreen rounded border-gray-300 focus:ring-campaign-primaryGreen"
                  />
                  <span>SMS Communication Consent</span>
                </label>

                {editModal && (
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="px-2 py-1 bg-campaign-lightBg border border-campaign-border rounded-lg text-xs font-bold uppercase"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setAddModalOpen(false); setEditModal(null); }}
                  className="px-4 py-2 border border-campaign-border rounded-xl text-xs font-bold text-campaign-muted hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  {editModal ? 'Save Changes' : 'Add to Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CSV / EXCEL IMPORT MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-campaign-border space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-campaign-deepGreen">
                Import Supporter Records
              </h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-campaign-muted">
              Paste tab-separated or comma-separated rows. Expected format:
              <br />
              <code className="text-campaign-deepGreen font-semibold">Full Name, Phone Number, Course, Year</code>
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Kelvin Otieno, 0712345678, Bachelor of Business and Information Technology, Year 2\nGrace Atieno, 0798765432, Bachelor of Science in Supply Chain Management, Year 3`}
              className="w-full p-3 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-mono text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
            />

            {importSummary && (
              <div className="p-3 bg-campaign-lightGreen border border-campaign-primaryGreen/30 rounded-xl text-campaign-deepGreen text-xs font-semibold">
                {importSummary}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 border border-campaign-border rounded-xl text-xs font-bold text-campaign-muted"
              >
                Close
              </button>
              <button
                onClick={handleProcessImport}
                className="px-5 py-2 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold rounded-xl shadow"
              >
                Process & Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DELETE CONFIRMATION DIALOG */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-red-200 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="font-heading font-extrabold text-base text-campaign-darkText">
              Confirm Record Deletion
            </h3>

            <p className="text-xs text-campaign-muted leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-campaign-darkText">{deleteConfirm.fullName}</strong> ({deleteConfirm.phoneNumber})? This action is logged for campaign audit purposes.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-campaign-muted hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

