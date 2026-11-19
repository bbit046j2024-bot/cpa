import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-campaign-deepGreen text-white border-t border-campaign-primaryGreen/40 pb-20 md:pb-6">
      {/* Privacy pledge upper band */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-black/20 rounded-2xl p-4 sm:p-5 border border-white/10">
          <ShieldCheck className="w-5 h-5 text-campaign-gold flex-shrink-0" />
          <p className="text-xs text-gray-300 leading-relaxed">
            We strictly adhere to student data privacy principles. Supporter phone numbers are securely encrypted, never displayed publicly, and only used for departmental election communications where explicit consent is granted.
          </p>
        </div>
      </div>

      {/* Bottom copyright band */}
      <div className="border-t border-white/10 bg-black/30 py-4 px-4 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="leading-relaxed">
            © 2026/2027 Elisha Adera Campaign Team • Department of Management Science • Technical University of Mombasa
          </p>
          <p className="flex items-center justify-center gap-1 text-gray-400">
            <span>CPA: For Comrades by Comrades</span>
            <span className="text-campaign-gold">★</span>
            <span>Competent Leader</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
