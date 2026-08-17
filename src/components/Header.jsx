import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QrCode, Layers, Scan, PlusCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function Header({ onOpenScanner }) {
  const location = useLocation();

  const navLinks = [
    { name: 'QR Studio', path: '/', icon: PlusCircle, highlight: true },
    { name: 'QR Hub & Content', path: '/manage', icon: Layers },
    { name: 'Live Scanner', path: '/scanner', icon: Scan },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.jpg"
            alt="HFA Logo"
            className="w-10 h-10 object-contain bg-white rounded-xl border border-emerald-500/30 p-0.5 shadow-glow transition-transform group-hover:scale-105"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                HFA QR Hub
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                HFA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Generate • Download • Link Uploads</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-glow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            );
          })}

          {/* Quick Scanner Action */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 ml-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-glow hover:shadow-glow-lg transition-all active:scale-95"
            title="Scan with Webcam / Camera"
          >
            <Scan className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span className="hidden sm:inline">Quick Scan</span>
          </button>
        </nav>

      </div>
    </header>
  );
}
