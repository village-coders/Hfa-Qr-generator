import React from 'react';
import { QrCode, PlusCircle, ListFilter, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WhiteGreenHeader({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <QrCode className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">QR Portal</span>
            <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              HFA
            </span>
          </div>
        </div>

        {/* 2 Main Navigation Tabs */}
        <nav className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'generate'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Generate QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'manage'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-4 h-4 text-emerald-600" />
            <span>Manage QR List</span>
          </button>
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>{user?.name || user?.username || 'User'}</span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
