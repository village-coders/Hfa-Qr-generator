import React from 'react';
import { QrCode, PlusCircle, ListFilter, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WhiteGreenHeader({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Bar */}
        <div className="h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">QR Portal</span>
              <span className="ml-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                HFA
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-[0.98] ${
                activeTab === 'generate'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Generate QR Code</span>
            </button>

            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-[0.98] ${
                activeTab === 'manage'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4 text-emerald-600" />
              <span>Manage QR List</span>
            </button>
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>{user?.name || user?.username || 'User'}</span>
            </div>

            <button
              onClick={logout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Tab Strip */}
        <div className="md:hidden pb-3">
          <nav className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all active:scale-[0.97] ${
                activeTab === 'generate'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Generate QR</span>
            </button>

            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all active:scale-[0.97] ${
                activeTab === 'manage'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              <ListFilter className="w-4 h-4 text-emerald-600" />
              <span>Manage List</span>
            </button>
          </nav>
        </div>

      </div>
    </header>
  );
}
