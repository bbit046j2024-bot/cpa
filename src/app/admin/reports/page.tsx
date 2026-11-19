'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import {
  FileText,
  Download,
  Printer,
  BarChart3,
  GraduationCap,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !stats) {
    return (
      <div className="py-12 text-center text-xs text-campaign-muted">
        Loading campaign reporting analytics...
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 pb-14 max-w-screen-xl mx-auto">
      
      {/* Top Action Bar (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-campaign-gold/15 border border-campaign-gold/30">
            <BarChart3 className="w-3 h-3 text-campaign-gold" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-campaign-deepGreen">Official Campaign Reporting</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-campaign-deepGreen">
            Executive Report
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Formal audit-ready report on supporter mobilization and departmental distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-campaign-gold" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-campaign-border shadow-md max-w-5xl mx-auto space-y-8 print:shadow-none print:border-none print:p-0">
        
        {/* Official Letterhead Header */}
        <div className="border-b-2 border-campaign-deepGreen pb-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl p-1.5 border border-campaign-border shadow-xs">
              <img src="/images/cpa-logo.png" alt="CPA Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-campaign-deepGreen uppercase tracking-widest">
                Technical University of Mombasa
              </p>
              <h2 className="font-heading font-extrabold text-2xl text-campaign-deepGreen">
                ELISHA ADERA CAMPAIGN SECRETARIAT
              </h2>
              <p className="text-xs text-campaign-gold font-bold uppercase tracking-wider">
                Department of Management Science • Super Delegate (2026/2027)
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right text-xs text-campaign-muted space-y-1">
            <p><strong>Report Date:</strong> {currentDate}</p>
            <p><strong>Alliance:</strong> CPA (For Comrades by Comrades)</p>
            <p className="text-campaign-deepGreen font-semibold">Classification: Confidential / Campaign Use</p>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="space-y-3">
          <h3 className="font-heading font-extrabold text-base text-campaign-deepGreen uppercase tracking-wider">
            1. Executive Mobilization Summary
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-campaign-lightBg p-4 rounded-xl border border-campaign-border text-center">
              <span className="text-[11px] font-bold uppercase text-campaign-muted block mb-1">
                Total Supporters
              </span>
              <span className="font-heading font-extrabold text-2xl text-campaign-deepGreen">
                {stats.total}
              </span>
              <span className="text-[10px] text-campaign-muted block mt-1">Verified Comrades</span>
            </div>

            <div className="bg-campaign-lightBg p-4 rounded-xl border border-campaign-border text-center">
              <span className="text-[11px] font-bold uppercase text-campaign-muted block mb-1">
                Active Rate
              </span>
              <span className="font-heading font-extrabold text-2xl text-green-700">
                100%
              </span>
              <span className="text-[10px] text-campaign-muted block mt-1">{stats.active} Active Records</span>
            </div>

            <div className="bg-campaign-lightBg p-4 rounded-xl border border-campaign-border text-center">
              <span className="text-[11px] font-bold uppercase text-campaign-muted block mb-1">
                SMS Consent Rate
              </span>
              <span className="font-heading font-extrabold text-2xl text-campaign-gold">
                {stats.consentRate}%
              </span>
              <span className="text-[10px] text-campaign-muted block mt-1">{stats.consented} Opted-In</span>
            </div>

            <div className="bg-campaign-lightBg p-4 rounded-xl border border-campaign-border text-center">
              <span className="text-[11px] font-bold uppercase text-campaign-muted block mb-1">
                Foundation Seed
              </span>
              <span className="font-heading font-extrabold text-2xl text-campaign-cpaBlue">
                25
              </span>
              <span className="text-[10px] text-campaign-muted block mt-1">From Official Register</span>
            </div>
          </div>
        </div>

        {/* Academic Year Breakdown */}
        <div className="space-y-3">
          <h3 className="font-heading font-extrabold text-base text-campaign-deepGreen uppercase tracking-wider">
            2. Mobilization by Academic Year
          </h3>

          <table className="w-full text-left text-xs border border-campaign-border rounded-xl overflow-hidden">
            <thead className="bg-campaign-lightBg text-campaign-muted font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Academic Cohort</th>
                <th className="p-3 text-center">Supporter Count</th>
                <th className="p-3 text-right">Cohort Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.byYear.map((item: any) => {
                const pct = Math.round((item.count / (stats.total || 1)) * 100);
                return (
                  <tr key={item.year}>
                    <td className="p-3 font-bold text-campaign-darkText">{item.year}</td>
                    <td className="p-3 text-center font-mono font-semibold">{item.count}</td>
                    <td className="p-3 text-right font-mono font-bold text-campaign-deepGreen">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Course Distribution Breakdown */}
        <div className="space-y-3">
          <h3 className="font-heading font-extrabold text-base text-campaign-deepGreen uppercase tracking-wider">
            3. Departmental Course Distribution
          </h3>

          <table className="w-full text-left text-xs border border-campaign-border rounded-xl overflow-hidden">
            <thead className="bg-campaign-lightBg text-campaign-muted font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Department of Management Science Program</th>
                <th className="p-3 text-center">Supporters</th>
                <th className="p-3 text-right">Representation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.byCourse.map((item: any) => {
                const pct = Math.round((item.count / (stats.total || 1)) * 100);
                return (
                  <tr key={item.course}>
                    <td className="p-3 font-medium text-campaign-darkText">{item.course}</td>
                    <td className="p-3 text-center font-mono font-semibold">{item.count}</td>
                    <td className="p-3 text-right font-mono font-bold text-campaign-gold">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Compliance Sign-off Block */}
        <div className="pt-8 border-t border-campaign-border grid grid-cols-2 gap-8 text-xs text-campaign-muted">
          <div className="space-y-2">
            <p className="font-bold text-campaign-darkText">Candidate Certification:</p>
            <p>I confirm that the supporter mobilization data reflects authentic student registrations within the Department of Management Science.</p>
            <div className="pt-4 border-b border-gray-300 w-48"></div>
            <p className="font-bold text-campaign-deepGreen">ELISHA ADERA</p>
            <p className="text-[10px]">Super Delegate Candidate 2026/2027</p>
          </div>

          <div className="space-y-2 text-right">
            <p className="font-bold text-campaign-darkText">Campaign Secretariat:</p>
            <p>Generated by CPA Campaign Intelligence Engine • For Comrades by Comrades</p>
            <div className="pt-4 border-b border-gray-300 w-48 ml-auto"></div>
            <p className="font-bold text-campaign-deepGreen">CHIEF CAMPAIGN COORDINATOR</p>
            <p className="text-[10px]">Technical University of Mombasa</p>
          </div>
        </div>

      </div>

    </div>
  );
}

