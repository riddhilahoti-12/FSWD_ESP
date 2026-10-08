'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, Terminal, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.includes('/play')) return null;
  return (
    <footer className="border-t border-slate-800/80 bg-[#030508] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white font-black text-lg tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>MISSION<span className="text-cyan-400">X</span></span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Experiential engineering learning platform combining 3D virtual escape environments,
              real-time IoT telemetry, and staged embedded-systems diagnostic challenges.
            </p>
          </div>

          {/* Core Navigation */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/missions" className="hover:text-cyan-400 transition-colors">
                  Mission Library
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-cyan-400 transition-colors">
                  Authentication
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture Status */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest mb-3">
              System Specs
            </h4>
            <ul className="space-y-1.5 text-xs font-mono text-slate-500">
              <li className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                <span>Next.js 14 App Router</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-electric-blue" />
                <span>Express + TypeScript API</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>MongoDB & Mongoose</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MissionX Platform. Built for experiential technical education.</p>
          <div className="flex space-x-4">
            <span className="font-mono text-cyan-500/70">Phase 1 Foundation: Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
