'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, UserCheck, ShieldCheck, GraduationCap } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">

          {/* Left: Logos & Candidate Identity */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            {/* CPA Logo */}
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white p-1 border border-gray-200 shadow-xs flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src="/images/cpa-logo.png"
                alt="CPA Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Candidate Title & Badge */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-[11px] text-campaign-gold font-bold uppercase tracking-wider truncate">
                COMRADES PROJECT ALLIANCE
              </span>
            </div>
          </Link>

          {/* Center / Right Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${isActive('/')
                  ? 'text-campaign-deepGreen bg-campaign-lightGreen'
                  : 'text-campaign-darkText hover:text-campaign-primaryGreen hover:bg-gray-50'
                  }`}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${isActive('/about')
                  ? 'text-campaign-deepGreen bg-campaign-lightGreen'
                  : 'text-campaign-darkText hover:text-campaign-primaryGreen hover:bg-gray-50'
                  }`}
              >
                About Elisha
              </Link>
              <Link
                href="/register"
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${isActive('/register')
                  ? 'text-campaign-deepGreen bg-campaign-lightGreen'
                  : 'text-campaign-darkText hover:text-campaign-primaryGreen hover:bg-gray-50'
                  }`}
              >
                Supporters Register
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-campaign-primaryGreen hover:bg-campaign-deepGreen transition-all rounded-xl shadow-xs active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5 text-campaign-gold" />
                <span>Join Register</span>
              </Link>
            </div>
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/register"
              className="px-3 py-1.5 text-[11px] font-bold uppercase text-white bg-campaign-primaryGreen rounded-lg shadow-xs flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-campaign-gold" />
              <span>Register</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-campaign-darkText rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-5 space-y-1.5 animate-in slide-in-from-top">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${isActive('/') ? 'bg-campaign-lightGreen text-campaign-deepGreen' : 'text-campaign-darkText hover:bg-gray-50'
              }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${isActive('/about') ? 'bg-campaign-lightGreen text-campaign-deepGreen' : 'text-campaign-darkText hover:bg-gray-50'
              }`}
          >
            About Candidate
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${isActive('/register') ? 'bg-campaign-lightGreen text-campaign-deepGreen' : 'text-campaign-darkText hover:bg-gray-50'
              }`}
          >
            Supporters Register
          </Link>

          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-campaign-primaryGreen rounded-xl"
            >
              <UserCheck className="w-4 h-4 text-campaign-gold" />
              <span>Join Supporters Register</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
