import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import {
  Award,
  CheckCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const revalidate = 0; // Ensure fresh data on every load

export default function HomePage() {
  const stats = db.getStats();
  const settings = db.getSettings();

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-12 sm:space-y-24 pb-20 sm:pb-24">

      {/* 1. HERO SECTION WITH POSTER IMAGE AS BACKGROUND */}
      <section className="relative overflow-hidden text-white min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] flex items-center">

        {/* Candidate Poster as Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-[center_top] sm:bg-right-top bg-no-repeat"
          style={{ backgroundImage: "url('/images/candidate-poster.jpg')" }}
        />

        {/* Sophisticated Dark Gradient Overlays for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#075B32]/95 via-[#075B32]/90 to-black/85 sm:bg-gradient-to-r sm:from-[#075B32] sm:via-[#075B32]/95 sm:to-[#075B32]/60 lg:to-black/30" />
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px]" />

        {/* Subtle decorative glow */}
        <div className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-campaign-gold/20 blur-3xl pointer-events-none" />

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 relative z-10 w-full">
          <div className="max-w-3xl space-y-5 sm:space-y-6 text-center sm:text-left">

            {/* Candidate Title & Position */}
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[11px] sm:text-sm font-extrabold text-campaign-gold tracking-widest uppercase">
                Department of Management Science
              </p>
              <h1 className="font-heading font-extrabold text-3xl sm:text-6xl lg:text-7xl tracking-tight leading-tight text-white drop-shadow-md">
                ELISHA ADERA
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 pt-1">
                <span className="text-xl sm:text-3xl font-extrabold text-white">
                  SUPER DELEGATE
                </span>
                <span className="text-campaign-gold font-bold text-lg sm:text-2xl">
                  •
                </span>
                <span className="text-campaign-gold font-bold text-lg sm:text-2xl italic">
                  Competent Leader
                </span>
              </div>
            </div>

            {/* Candidate Quote / Slogan */}
            <div className="bg-black/40 backdrop-blur-md border-l-4 border-campaign-gold p-3.5 sm:p-5 rounded-r-2xl max-w-xl mx-auto sm:mx-0 text-left shadow-lg">
              <p className="text-xs sm:text-base text-gray-100 italic leading-relaxed">
                “A journey without vision is a step to no foundation.”
              </p>
            </div>

            {/* Campaign Alliance Motto */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
              <div className="w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-xl bg-white p-1 shadow flex-shrink-0 border border-white/20 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/cpa-logo.png"
                  alt="CPA Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <p className="text-[10px] sm:text-[11px] text-gray-300 font-medium uppercase tracking-wider">Campaign Identity</p>
                <p className="text-xs sm:text-sm font-bold text-white">
                  CPA – Comrades Project Alliance <span className="text-campaign-gold block sm:inline">| For Comrades by Comrades</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-campaign-gold hover:bg-yellow-400 text-campaign-deepGreen font-heading font-extrabold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>Join Supporters Register</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-campaign-deepGreen" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-heading font-semibold text-sm sm:text-base rounded-xl border border-white/25 transition-all text-center backdrop-blur-xs"
              >
                Candidate Profile & Vision
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-gray-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-campaign-gold" />
                <span>Verified 4-Field Registration</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-campaign-gold" />
                <span>Privacy Compliant</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CANDIDATE INTRODUCTION & CAMPAIGN IDENTITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-campaign-deepGreen leading-tight">
              A Dedicated Voice for Every Comrade in the Department
            </h2>

            <p className="text-sm sm:text-base text-campaign-darkText/80 leading-relaxed">
              The Department of Management Science represents a vibrant community of ambitious students seeking quality education, accountable leadership, and clear representation.
            </p>

            <p className="text-sm sm:text-base text-campaign-darkText/80 leading-relaxed">
              As your candidate for <strong className="text-campaign-deepGreen font-semibold">Super Delegate 2026/2027</strong> under the <strong className="text-campaign-cpaBlue font-semibold">Comrades Project Alliance (CPA)</strong>, I am committed to accessible, transparent, and dignified representation.
            </p>

            <div className="pt-1 sm:pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-campaign-primaryGreen hover:text-campaign-deepGreen group"
              >
                <span>Read detailed candidate profile and campaign vision</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Alliance Identity Card */}
          <div className="lg:col-span-6 bg-gradient-to-br from-white to-campaign-lightBg rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-campaign-border shadow-md sm:shadow-xl overflow-hidden">
            <div className="flex items-center gap-3.5 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] max-w-[64px] max-h-[64px] bg-white rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-sm border border-campaign-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/cpa-logo.png"
                  alt="CPA Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] sm:text-xs font-bold text-campaign-gold uppercase tracking-wider block">
                  Campaign Alliance
                </span>
                <h3 className="font-heading font-extrabold text-lg sm:text-2xl text-campaign-deepGreen leading-tight truncate">
                  Comrades Project Alliance (CPA)
                </h3>
                <p className="text-xs text-campaign-muted font-medium mt-0.5">
                  Motto: “For Comrades by Comrades”
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-campaign-darkText/80 leading-relaxed">
              <p>
                The Comrades Project Alliance is built upon solidarity, unity of purpose, and active participation by every comrade within the Technical University of Mombasa.
              </p>
              <p>
                We believe leadership is service. By uniting Management Science students across all academic years, we ensure our collective interests are championed at every level of student governance.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CALL TO ACTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-campaign-deepGreen rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-white text-center relative overflow-hidden shadow-xl border-2 border-campaign-gold/30">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3 sm:space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-campaign-gold text-campaign-deepGreen text-[11px] sm:text-xs font-extrabold uppercase tracking-wider">
              Management Science Comrades
            </span>
            <h2 className="font-heading font-extrabold text-xl sm:text-4xl leading-tight">
              Your Vote is a Trust. Elisha Will Honour It.
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Join the growing network of supporters standing for accountable, visionary representation in the 2026/2027 TUM student elections.
            </p>
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-campaign-gold hover:bg-yellow-400 text-campaign-deepGreen font-heading font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all text-center"
              >
                Pledge Your Support Now
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-all text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
