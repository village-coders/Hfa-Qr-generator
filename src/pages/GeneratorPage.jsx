import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, QrCode, Download, UploadCloud, CheckCircle2, 
  RefreshCw, ArrowRight, Layers, ShieldCheck, Palette, Tag, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCodePreview from '../components/QRCodePreview';
import DownloadModal from '../components/DownloadModal';
import ContentUploader from '../components/ContentUploader';
import MobileSimulator from '../components/MobileSimulator';
import { API_ENDPOINTS, getScanUrl } from '../config/api';

const COLOR_PRESETS = [
  { name: 'Dark Slate', fg: '#0f172a', bg: '#ffffff' },
  { name: 'Emerald Forest', fg: '#064e3b', bg: '#ecfdf5' },
  { name: 'Royal Indigo', fg: '#1e1b4b', bg: '#eef2ff' },
  { name: 'Cyber Teal', fg: '#134e4a', bg: '#f0fdfa' },
  { name: 'Crimson Bold', fg: '#881337', bg: '#fff1f2' },
];

const FRAME_PRESETS = [
  'SCAN ME',
  'ASSET TAG',
  'SMART DOCUMENT',
  'EQUIPMENT PASS',
  'VERIFIED ID',
];

export default function GeneratorPage() {
  const [searchParams] = useSearchParams();
  const editCodeId = searchParams.get('edit');

  // Step in workflow: 1 = Generator Form, 2 = Content & Uploads Editor
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);

  // QR creation form
  const [form, setForm] = useState({
    title: '',
    category: 'Asset',
    customCodeId: '',
    description: '',
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      frameText: 'SCAN ME',
      level: 'H',
      includeMargin: true,
    },
  });

  const [createdQR, setCreatedQR] = useState(null);
  const [liveSimulatorData, setLiveSimulatorData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing QR code if edit parameter is supplied
  useEffect(() => {
    if (editCodeId) {
      fetch(API_ENDPOINTS.QR_CODE_BY_ID(editCodeId))
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setCreatedQR(json.data);
            setLiveSimulatorData(json.data);
            setForm({
              title: json.data.title || '',
              category: json.data.category || 'Asset',
              customCodeId: json.data.codeId || '',
              description: json.data.description || '',
              styling: json.data.styling || form.styling,
            });
            setActiveWorkflowStep(2); // Jump directly to edit upload screen
          }
        })
        .catch(console.error);
    }
  }, [editCodeId]);

  // Auto-generate random temp ID for preview before submit
  const [previewTempId] = useState(() => 'AST-' + Math.floor(100000 + Math.random() * 900000));

  const currentDisplayCode = createdQR ? createdQR.codeId : (form.customCodeId.trim() || previewTempId);
  const currentDisplayUrl = getScanUrl(currentDisplayCode);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMessage('Please enter a title or asset name for your QR code.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        codeId: form.customCodeId.trim() || undefined,
        description: form.description.trim(),
        styling: form.styling,
        itemDetails: {
          brand: '',
          model: '',
          serialNumber: form.customCodeId.trim() || '',
        },
      };

      const res = await fetch(API_ENDPOINTS.QR_CODES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to generate QR Code.');
      }

      setCreatedQR(json.data);
      setLiveSimulatorData(json.data);
      setShowDownloadModal(true); // Open download station immediately after generation!

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProceedToUpload = () => {
    setShowDownloadModal(false);
    setActiveWorkflowStep(2); // Jump directly to Upload & Configure screen!
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Workflow Progress Banner */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dynamic QR Code & GridFS Storage</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Generate, Download & Link Uploads
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
          Create dynamic QR codes, download them in high-resolution, and upload documents or specifications that appear instantly when scanned.
        </p>

        {/* 3-Step Interactive Breadcrumb Bar */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
          
          <button
            onClick={() => setActiveWorkflowStep(1)}
            className={`p-3 rounded-2xl border flex flex-col items-center sm:flex-row sm:gap-3 text-left transition-all ${
              activeWorkflowStep === 1
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-glow'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
              activeWorkflowStep === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              1
            </div>
            <div>
              <p className="text-xs font-bold text-white">Generate</p>
              <p className="text-[10px] text-slate-400 hidden sm:block">Style & ID</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (createdQR) setShowDownloadModal(true);
            }}
            className={`p-3 rounded-2xl border flex flex-col items-center sm:flex-row sm:gap-3 text-left transition-all ${
              createdQR
                ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-300 hover:border-emerald-500 cursor-pointer'
                : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div>
              <p className="text-xs font-bold text-white">Download</p>
              <p className="text-[10px] text-slate-400 hidden sm:block">PNG / SVG / PDF</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (createdQR) setActiveWorkflowStep(2);
            }}
            className={`p-3 rounded-2xl border flex flex-col items-center sm:flex-row sm:gap-3 text-left transition-all ${
              activeWorkflowStep === 2
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-glow'
                : createdQR
                ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-emerald-500/40 cursor-pointer'
                : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
              activeWorkflowStep === 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              3
            </div>
            <div>
              <p className="text-xs font-bold text-white">Upload</p>
              <p className="text-[10px] text-slate-400 hidden sm:block">GridFS Docs & Specs</p>
            </div>
          </button>

        </div>
      </div>

      {/* STAGE 1: Generate & Customize QR Code */}
      {activeWorkflowStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: QR Generator Configuration */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">1. Configure Dynamic QR Code</h2>
                  <p className="text-xs text-slate-400">Set identity, classification & visual styling</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-5">
              
              {/* Asset / Item Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Asset / Resource Title <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. MacBook Pro M3 16-inch / Warehouse Forklift #04"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Category & Custom ID Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Asset">Asset & Equipment</option>
                    <option value="Document">Document & Manual</option>
                    <option value="Product">Product & Inventory</option>
                    <option value="Facility">Facility & Room</option>
                    <option value="Contact">Contact & Profile</option>
                    <option value="Custom">Custom Content</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Custom Code ID <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.customCodeId}
                    onChange={(e) => setForm({ ...form, customCodeId: e.target.value })}
                    placeholder="e.g. AST-78901 (Auto-generated if empty)"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Description / Purpose <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Summary of this item or instructions for anyone scanning..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Visual Styling Customizer */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  <span>Visual Styling & Frame Label</span>
                </div>

                {/* Color presets */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-2">Color Themes</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            styling: { ...form.styling, fgColor: preset.fg, bgColor: preset.bg },
                          })
                        }
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border transition-all ${
                          form.styling.fgColor === preset.fg
                            ? 'border-emerald-500 bg-slate-800 text-white shadow-glow'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex -space-x-1">
                          <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: preset.fg }} />
                          <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: preset.bg }} />
                        </div>
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Text CTA */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-2">Frame Header Badge</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {FRAME_PRESETS.map((text) => (
                      <button
                        key={text}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            styling: { ...form.styling, frameText: text },
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          form.styling.frameText === text
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={form.styling.frameText}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        styling: { ...form.styling, frameText: e.target.value },
                      })
                    }
                    placeholder="Custom frame text (e.g. SCAN ME)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white uppercase tracking-wider"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Creating Dynamic QR Code...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Dynamic QR Code & Open Download Station</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Right Live Preview Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-24 w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
              
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  Live Badge Preview
                </span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {currentDisplayCode}
                </span>
              </div>

              <div className="py-4">
                <QRCodePreview
                  value={currentDisplayUrl}
                  codeId={currentDisplayCode}
                  title={form.title || 'Your Asset Name'}
                  fgColor={form.styling.fgColor}
                  bgColor={form.styling.bgColor}
                  frameText={form.styling.frameText}
                  size={200}
                />
              </div>

              <div className="w-full mt-4 p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-center">
                <p className="text-[11px] text-slate-400">Target Scan URL:</p>
                <p className="font-mono text-xs text-emerald-400 font-semibold truncate mt-0.5">
                  {currentDisplayUrl}
                </p>
              </div>

              {createdQR && (
                <div className="w-full mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDownloadModal(true)}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Options</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveWorkflowStep(2)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Upload Content</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* STAGE 2: Upload Files & Dynamic Content Manager with Realtime Mobile Simulator */}
      {activeWorkflowStep === 2 && createdQR && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Content & GridFS Uploader */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Download Bar Quick Action */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Need to re-download or print this QR tag?</p>
                  <p className="text-[11px] text-slate-400">Code: <span className="font-mono text-emerald-400">{createdQR.codeId}</span></p>
                </div>
              </div>

              <button
                onClick={() => setShowDownloadModal(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Assets</span>
              </button>
            </div>

            <ContentUploader
              qrData={createdQR}
              onUpdateSuccess={(updatedData) => {
                setCreatedQR(updatedData);
                setLiveSimulatorData(updatedData);
              }}
              onLivePreviewChange={(previewData) => {
                setLiveSimulatorData(previewData);
              }}
            />
          </div>

          {/* Right: Live Interactive Smartphone Simulator */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-24 w-full flex flex-col items-center">
              <MobileSimulator data={liveSimulatorData || createdQR} />
            </div>
          </div>

        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && createdQR && (
        <DownloadModal
          qrData={createdQR}
          onClose={() => setShowDownloadModal(false)}
          onProceedToUpload={handleProceedToUpload}
        />
      )}

    </div>
  );
}
