import React from 'react';
import Link from 'next/link';
import { Award, GraduationCap, CheckCircle, ArrowRight, ShieldCheck, Target, Users, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-8 sm:py-16 space-y-10 sm:space-y-16">

      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-campaign-deepGreen rounded-2xl sm:rounded-3xl p-6 sm:p-14 text-white relative overflow-hidden shadow-xl border-2 border-campaign-gold/40">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campaign-gold text-campaign-deepGreen text-[11px] sm:text-xs font-extrabold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-campaign-deepGreen" />
              <span>Official Candidate Profile</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-5xl tracking-tight">
              Elisha Adera
            </h1>
            <p className="text-sm sm:text-xl text-campaign-gold font-semibold leading-snug">
              Candidate for Super Delegate • Department of Management Science (2026/2027)
            </p>
            <p className="text-xs sm:text-base text-gray-200 leading-relaxed pt-1 sm:pt-2">
              Standing for authentic student service, principled advocacy, and accountable leadership within the Technical University of Mombasa.
            </p>
          </div>
        </div>
      </section>

      {/* Main Profile Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: Official Poster Visual */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-4 border border-campaign-border shadow-md sticky top-24">
              <div className="rounded-xl overflow-hidden border border-campaign-border mb-4">
                <img
                  src="/images/candidate-poster.jpg"
                  alt="Elisha Adera"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="space-y-2.5 p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-campaign-muted">Candidate:</span>
                  <span className="font-bold text-campaign-deepGreen">Elisha Adera</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-campaign-muted">Position:</span>
                  <span className="font-bold text-campaign-darkText">Super Delegate</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-campaign-muted">Institution:</span>
                  <span className="font-medium text-campaign-darkText">Technical Univ. of Mombasa (TUM)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-campaign-muted">Department:</span>
                  <span className="font-medium text-campaign-darkText">Management Science</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-campaign-muted">Slogan:</span>
                  <span className="font-bold text-campaign-gold">Competent Leader</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-campaign-muted">Alliance:</span>
                  <span className="font-bold text-campaign-cpaBlue">CPA – Comrades Project Alliance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Focus Areas */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">

            {/* The Candidate Statement */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-campaign-border shadow-xs space-y-3 sm:space-y-4">
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-campaign-deepGreen">
                A Message to Management Science Comrades
              </h2>
              <blockquote className="border-l-4 border-campaign-gold pl-3.5 italic text-campaign-muted text-xs sm:text-base leading-relaxed">
                “A journey without vision is a step to no foundation. Leadership is not about personal privilege, but about carrying the collective hopes, academic concerns, and aspirations of comrades into every decision-making room.”
              </blockquote>
              <p className="text-xs sm:text-sm text-campaign-darkText/80 leading-relaxed">
                As Super Delegate, Elisha Adera seeks to bridge communication between students and university authorities, ensuring that student concerns regarding academic scheduling, course representation, and welfare in the Department of Management Science are handled with urgency and competence.
              </p>
            </div>

            {/* Departmental Scope: NOT National Politics */}
            <div className="bg-campaign-lightGreen/60 rounded-2xl p-5 sm:p-6 border border-campaign-primaryGreen/20 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 text-campaign-deepGreen font-heading font-bold text-sm sm:text-base">
                <GraduationCap className="w-5 h-5 text-campaign-primaryGreen flex-shrink-0" />
                <span>Strict University Departmental Focus</span>
              </div>
              <p className="text-xs sm:text-sm text-campaign-darkText/80 leading-relaxed">
                This campaign is exclusively focused on the Department of Management Science at TUM. We do not engage in external or national partisan political structures. Our focus remains solely on the academic welfare, fairness, and student advocacy of comrades in our faculty.
              </p>
            </div>

            {/* Call to Action Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-campaign-primaryGreen/30 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h4 className="font-heading font-bold text-sm sm:text-base text-campaign-deepGreen">
                  Stand with Elisha Adera Today
                </h4>
                <p className="text-xs text-campaign-muted">
                  Register in under 30 seconds with 4 basic fields.
                </p>
              </div>
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <span>Register as Supporter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
