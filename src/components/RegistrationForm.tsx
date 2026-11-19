'use client';

import React, { useState, useEffect } from 'react';
import { normalizeKenyanPhone } from '@/lib/phone';
import { CheckCircle2, AlertCircle, Phone, User, GraduationCap, Calendar, ShieldCheck, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

interface Props {
  onSuccess?: () => void;
  courses?: string[];
  years?: string[];
}

const DEFAULT_COURSES = [
  'Bachelor of Business and Information Technology',
  'Bachelor of Science in Supply Chain Management',
  'Diploma in Logistics and Transport Management',
  'Diploma in Procurement',
  'Diploma in Supply Chain Management',
  'International Diploma in Logistics and Transport Management',
  'Certificate in Stores Management',
  'Certificate of Logistics and Transport Management',
  'Master of Business Information Systems',
  'Master of Science in Supply Chain Management',
  'Masters of Science in Procurement and Supply Chain Management',
  'Doctor of Philosophy in Supply Chain Management',
  'Other / Custom Management Science Course'
];

const DEFAULT_YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

export default function RegistrationForm({ courses = DEFAULT_COURSES, years = DEFAULT_YEARS }: Props) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [course, setCourse] = useState(courses[0] || 'Bachelor of Business and Information Technology');
  const [customCourse, setCustomCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('Year 2');
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ name: string; normalizedPhone: string } | null>(null);

  // Live conflict detection states
  const [nameConflict, setNameConflict] = useState<string | null>(null);
  const [phoneConflict, setPhoneConflict] = useState<string | null>(null);

  // Live phone validation preview
  const phoneValidation = phoneNumber.trim() ? normalizeKenyanPhone(phoneNumber) : null;

  // Real-time duplicate & contact validation hook
  useEffect(() => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();

    if (trimmedName.length < 2 && trimmedPhone.length < 5) {
      setNameConflict(null);
      setPhoneConflict(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (trimmedName.length >= 2) params.append('name', trimmedName);
        if (trimmedPhone.length >= 5) params.append('phone', trimmedPhone);

        const res = await fetch(`/api/supporters/validate?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          if (data.nameConflict?.exists) {
            setNameConflict(`Already Listed: A student named "${data.nameConflict.fullName}" is already in the supporters register (${data.nameConflict.course}, ${data.nameConflict.yearOfStudy}). Already listed students cannot register again.`);
          } else {
            setNameConflict(null);
          }

          if (data.phoneConflict?.exists) {
            setPhoneConflict(`Already Listed: This contact number is already registered for ${data.phoneConflict.fullName}.`);
          } else {
            setPhoneConflict(null);
          }
        }
      } catch (_) {}
    }, 350);

    return () => clearTimeout(timer);
  }, [fullName, phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate Full Name
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full official name');
      return;
    }

    if (nameConflict) {
      setErrorMsg(nameConflict);
      return;
    }

    // Validate Phone Number
    const phoneResult = normalizeKenyanPhone(phoneNumber);
    if (!phoneResult.isValid) {
      setErrorMsg(phoneResult.error || 'Please enter a valid Kenyan phone number (e.g. 0712345678)');
      return;
    }

    if (phoneConflict) {
      setErrorMsg(phoneConflict);
      return;
    }

    const selectedCourse = course === 'Other / Custom Management Science Course' 
      ? (customCourse.trim() || 'Management Science') 
      : course;

    setLoading(true);

    try {
      const res = await fetch('/api/supporters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phoneResult.normalized,
          rawPhone: phoneNumber.trim(),
          course: selectedCourse,
          yearOfStudy,
          communicationConsent: consent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit registration');
      }

      setSuccessData({
        name: fullName.trim(),
        normalizedPhone: phoneResult.formatted,
      });

      // Reset form fields
      setFullName('');
      setPhoneNumber('');
      setConsent(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (successData) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-10 border-2 border-campaign-primaryGreen/20 shadow-xl text-center animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-campaign-lightGreen text-campaign-primaryGreen rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-campaign-primaryGreen" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campaign-gold/20 text-campaign-deepGreen font-semibold text-xs mb-3 border border-campaign-gold/40">
          <Sparkles className="w-3.5 h-3.5 text-campaign-gold" />
          <span>Technical University of Mombasa</span>
        </div>

        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-campaign-deepGreen mb-3">
          Registration Successful!
        </h3>

        <p className="text-campaign-muted text-base max-w-md mx-auto mb-6 leading-relaxed">
          Thank you, <strong className="text-campaign-darkText">{successData.name}</strong>, for joining the official campaign community standing with <strong className="text-campaign-deepGreen">Elisha Adera</strong> for Super Delegate 2026/2027.
        </p>

        <div className="bg-campaign-lightBg rounded-xl p-5 border border-campaign-border max-w-md mx-auto mb-8 text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-campaign-muted">
            <span>Alliance:</span>
            <span className="font-bold text-campaign-cpaBlue">CPA – Comrades Project Alliance</span>
          </div>
          <div className="flex items-center justify-between text-xs text-campaign-muted">
            <span>Department:</span>
            <span className="font-semibold text-campaign-darkText">Management Science</span>
          </div>
          <div className="flex items-center justify-between text-xs text-campaign-muted">
            <span>Motto:</span>
            <span className="font-semibold text-campaign-primaryGreen">For Comrades by Comrades</span>
          </div>
          <div className="pt-2 border-t border-campaign-border flex items-center justify-between text-xs">
            <span className="text-campaign-muted">Data Security:</span>
            <span className="text-campaign-deepGreen font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Encrypted & Protected
            </span>
          </div>
        </div>

        <button
          onClick={() => setSuccessData(null)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-sm"
        >
          <span>Register Another Supporter</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // MAIN REGISTRATION FORM
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-10 border border-campaign-border shadow-xl relative overflow-hidden">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-campaign-deepGreen via-campaign-gold to-campaign-primaryGreen" />

      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campaign-lightGreen text-campaign-deepGreen font-semibold text-xs mb-2 border border-campaign-primaryGreen/20">
          <GraduationCap className="w-3.5 h-3.5 text-campaign-primaryGreen" />
          <span>Management Science Students Supporter Register</span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-campaign-deepGreen">
          Join the Movement
        </h2>
        <p className="text-xs sm:text-sm text-campaign-muted mt-1">
          Complete these 4 simple fields to pledge your support for Elisha Adera as Super Delegate.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in shake">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="leading-snug">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* FIELD 1: Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1.5">
            1. Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-campaign-muted">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Brian Ochieng Otieno"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-campaign-lightBg border rounded-xl text-sm font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                nameConflict ? 'border-amber-400 focus:ring-amber-500' : 'border-campaign-border focus:ring-campaign-primaryGreen'
              }`}
            />
          </div>
          {nameConflict && (
            <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-1.5 animate-in fade-in">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{nameConflict}</span>
            </div>
          )}
        </div>

        {/* FIELD 2: Phone Number */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText">
              2. Phone Number <span className="text-red-500">*</span>
            </label>
            {phoneValidation && phoneValidation.isValid && !phoneConflict && (
              <span className="text-[11px] font-semibold text-campaign-primaryGreen bg-campaign-lightGreen px-2 py-0.5 rounded-md">
                ✓ {phoneValidation.network} ({phoneValidation.formatted})
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-campaign-muted">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              required
              placeholder="e.g. 0712 345 678 or 0112 345 678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-campaign-lightBg border rounded-xl text-sm font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                phoneConflict || (phoneValidation && !phoneValidation.isValid && phoneNumber.trim().length >= 8)
                  ? 'border-amber-400 focus:ring-amber-500'
                  : 'border-campaign-border focus:ring-campaign-primaryGreen'
              }`}
            />
          </div>
          {phoneConflict ? (
            <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-1.5 animate-in fade-in">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{phoneConflict}</span>
            </div>
          ) : phoneValidation && !phoneValidation.isValid && phoneNumber.trim().length >= 8 ? (
            <div className="mt-1.5 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{phoneValidation.error}</span>
            </div>
          ) : (
            <p className="text-[11px] text-campaign-muted mt-1">
              Kenyan formats accepted (07xx, 01xx or +254). Your number is kept private and never published.
            </p>
          )}
        </div>

        {/* FIELD 3: Course */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1.5">
            3. Departmental Course <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-campaign-muted">
              <GraduationCap className="w-4 h-4" />
            </div>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-campaign-lightBg border border-campaign-border rounded-xl text-sm font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen focus:border-transparent transition-all appearance-none"
            >
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {course === 'Other / Custom Management Science Course' && (
            <input
              type="text"
              placeholder="Type your course name here..."
              value={customCourse}
              onChange={(e) => setCustomCourse(e.target.value)}
              className="mt-2 w-full px-4 py-2.5 bg-campaign-lightBg border border-campaign-border rounded-xl text-xs font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen"
            />
          )}
        </div>

        {/* FIELD 4: Year of Study */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-campaign-darkText mb-1.5">
            4. Year of Study <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-campaign-muted">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-campaign-lightBg border border-campaign-border rounded-xl text-sm font-medium text-campaign-darkText focus:bg-white focus:outline-none focus:ring-2 focus:ring-campaign-primaryGreen focus:border-transparent transition-all appearance-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONSENT CHECKBOX (Separate, Unchecked by default) */}
        <div className="pt-2">
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-campaign-lightBg border border-campaign-border cursor-pointer hover:bg-campaign-lightGreen/50 transition-colors">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-campaign-primaryGreen rounded border-gray-300 focus:ring-campaign-primaryGreen cursor-pointer"
            />
            <span className="text-xs text-campaign-darkText leading-relaxed select-none">
              I agree to receive campaign-related updates and announcements on my phone number.
            </span>
          </label>
        </div>

        {/* Privacy Assurance Banner */}
        <div className="flex items-center gap-2 text-[11px] text-campaign-muted bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <ShieldCheck className="w-4 h-4 text-campaign-primaryGreen flex-shrink-0" />
          <span>
            Only 4 fields collected. No student ID, registration numbers, or unnecessary personal data are requested.
          </span>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 bg-campaign-primaryGreen hover:bg-campaign-deepGreen disabled:opacity-70 text-white font-heading font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Join Supporters Register</span>
              <ArrowRight className="w-5 h-5 text-campaign-gold" />
            </>
          )}
        </button>

      </form>
    </div>
  );
}

