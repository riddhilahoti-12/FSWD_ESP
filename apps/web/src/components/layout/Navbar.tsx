'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Compass,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  ShieldAlert,
  Zap,
  Menu,
  X,
  Cpu,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, fetchUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/missions', label: 'Missions', icon: Compass },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(user?.role === 'ADMIN' || process.env.NODE_ENV !== 'production'
      ? [{ href: '/simulator', label: 'IoT Simulator', icon: Cpu }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#060911]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan">
            <span className="font-mono font-black text-slate-950 text-lg tracking-tighter">MX</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white group-hover:text-cyan-400 transition-colors">
              MISSION<span className="text-cyan-400">X</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              IoT Escape Lab
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              {/* XP Badge */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.stats?.xp ?? 0} XP</span>
              </div>

              {/* Role & Name */}
              <div className="text-right">
                <div className="text-xs font-bold text-white flex items-center justify-end space-x-1">
                  <span>{user.name}</span>
                  {user.role === 'ADMIN' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-glow-cyan transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-3 bg-[#060911] border-b border-slate-800">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <link.icon className="w-4 h-4 text-cyan-400" />
              <span>{link.label}</span>
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-800">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{user.name} ({user.role})</span>
                  <span className="font-mono text-cyan-400">{user.stats?.xp ?? 0} XP</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg text-sm font-medium text-slate-200 bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg text-sm font-bold text-slate-950 bg-cyan-400"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
