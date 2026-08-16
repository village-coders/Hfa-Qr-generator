import React, { useState } from 'react';
import { QrCode, Lock, User, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
        
        {/* Top Green Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-600" />

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-sm">
            <QrCode className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">QR Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage and generate dynamic QR codes</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

        </form>

        {/* Demo hints */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Default credentials: <strong className="text-emerald-700 font-mono">admin</strong> / <strong className="text-emerald-700 font-mono">Admin@123</strong>
          </p>
        </div>

      </div>
    </div>
  );
}
