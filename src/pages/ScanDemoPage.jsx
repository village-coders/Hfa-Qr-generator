import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Upload, ArrowRight, Camera, Search, Sparkles, ShieldCheck } from 'lucide-react';
import CameraScannerModal from '../components/CameraScannerModal';

export default function ScanDemoPage() {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      navigate(`/scan/${manualCode.trim()}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Scan className="w-3.5 h-3.5" />
          <span>Interactive Code Scanner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Scan & Test HFA QR Codes
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl mx-auto">
          Test any HFA QR code with your webcam, smartphone camera, image upload, or direct code ID lookup.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Live Camera Scanner Launcher Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform shadow-glow">
              <Camera className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Device Camera Scanner</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Activate your device webcam or phone camera to scan physical QR codes, printed badges, or screen codes in real-time.
            </p>
          </div>

          <button
            onClick={() => setIsCameraOpen(true)}
            className="mt-8 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Scan className="w-4 h-4 stroke-[2.5]" />
            <span>Launch Live Camera Scanner</span>
          </button>
        </div>

        {/* Manual Code ID Lookup Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-between group hover:border-cyan-500/40 transition-all">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Search className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Lookup by Code ID</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Enter any HFA QR short code or serial number to inspect its live GridFS documents and specifications.
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="mt-8 space-y-3">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. QR-109284 or AST-78901"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Inspect Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
      />

    </div>
  );
}
