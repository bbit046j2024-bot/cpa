import React from 'react';
import Image from 'next/image';
import { db } from '@/lib/db';
import RegistrationForm from '@/components/RegistrationForm';
import { ShieldCheck, CheckCircle2, GraduationCap } from 'lucide-react';

export const revalidate = 0;

export default function RegisterPage() {
  const settings = db.getSettings();

  return (
    <div className="py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Banner */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2.5 sm:space-y-3">
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-campaign-deepGreen leading-tight">
            Supporter Registration Register
          </h1>
          <p className="text-xs sm:text-base text-campaign-muted leading-relaxed">
            Join fellow Management Science comrades in rallying behind <strong className="text-campaign-deepGreen">Elisha Adera</strong> for Super Delegate 2026/2027.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Form appears first on mobile (order-1), context info on desktop left (order-1 lg:order-1) */}
          <div className="order-1 lg:order-2 lg:col-span-8">
            <RegistrationForm
              courses={settings.availableCourses}
              years={settings.academicYears}
            />
          </div>

          {/* Context / Privacy info */}
          <div className="order-2 lg:order-1 lg:col-span-4 space-y-5 sm:space-y-6">

            {/* Campaign Identity */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-campaign-border shadow-xs text-center space-y-2">
              <div className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] mx-auto flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/cpa-logo.png"
                  alt="CPA Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <h4 className="font-heading font-bold text-xs text-campaign-deepGreen">
                Comrades Project Alliance (CPA)
              </h4>
              <p className="text-[11px] text-campaign-muted">
                “For Comrades by Comrades”
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
