'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, UserCheck } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isRegister = pathname.startsWith('/register');
  const isAbout = pathname.startsWith('/about');

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="w-full flex items-center justify-between px-3 py-1.5 max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            isHome
              ? 'text-campaign-deepGreen font-bold'
              : 'text-gray-400 hover:text-campaign-deepGreen'
          }`}
        >
          <div
            className={`w-9 h-8 flex items-center justify-center rounded-xl transition-all ${
              isHome
                ? 'bg-campaign-lightGreen text-campaign-deepGreen shadow-xs'
                : 'text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
        </Link>

        {/* 2. Register - Prominent Center Action */}
        <Link
          href="/register"
          className="flex-1 flex flex-col items-center justify-center py-0.5 group"
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all active:scale-95 border-2 ${
              isRegister
                ? 'bg-campaign-deepGreen text-white border-campaign-gold shadow-campaign-deepGreen/30'
                : 'bg-campaign-primaryGreen text-white border-campaign-gold/60 shadow-campaign-primaryGreen/30 group-hover:scale-105'
            }`}
          >
            <UserCheck className="w-5 h-5 text-campaign-gold" />
          </div>
          <span
            className={`text-[10px] mt-0.5 font-bold ${
              isRegister
                ? 'text-campaign-deepGreen font-extrabold'
                : 'text-campaign-deepGreen'
            }`}
          >
            Register
          </span>
        </Link>

        {/* 3. About Candidate */}
        <Link
          href="/about"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            isAbout
              ? 'text-campaign-deepGreen font-bold'
              : 'text-gray-400 hover:text-campaign-deepGreen'
          }`}
        >
          <div
            className={`w-9 h-8 flex items-center justify-center rounded-xl transition-all ${
              isAbout
                ? 'bg-campaign-lightGreen text-campaign-deepGreen shadow-xs'
                : 'text-gray-400'
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">About</span>
        </Link>
      </div>
    </nav>
  );
}
