import React, { useState, useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Sparkles, Download, UploadCloud, CheckCircle2, FileText, 
  ExternalLink, Loader2, AlertCircle, RefreshCw, File, Image as ImageIcon,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_ENDPOINTS, getScanUrl } from '../config/api';

export default function SimpleGeneratorTab({ onGoToManage }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const qrWrapperRef = useRef(null); // wraps the QRCodeCanvas div

  // 1. Generate QR code with ZERO initial details required
  const handleGenerateQR = async () => {
    setIsGenerating(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await fetch(API_ENDPOINTS.QR_CODES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // No details required!
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to generate QR Code.');
      }

      setGeneratedQR(json.data);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Download the QR Code image
  const handleDownloadQR = () => {
    if (!generatedQR) return;

    try {
      // Get the canvas element from inside the wrapper div
      const wrapper = qrWrapperRef.current;
      if (!wrapper) return;
      const canvas = wrapper.querySelector('canvas');
      if (!canvas) {
        setStatusMsg({ type: 'error', text: 'QR canvas not ready. Please wait a moment and try again.' });
        return;
      }

      // Create high-res download canvas trimmed exactly to QR code with no extra padding or ID text
      const finalCanvas = document.createElement('canvas');
      const size = 1024;
      finalCanvas.width = size;
      finalCanvas.height = size;

      const ctx = finalCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Draw QR image scaled edge-to-edge
      ctx.drawImage(canvas, 0, 0, size, size);

      const link = document.createElement('a');
      link.href = finalCanvas.toDataURL('image/png');
      link.download = `${generatedQR.codeId}_QR_Code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatusMsg({ type: 'success', text: 'QR Code downloaded successfully!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: 'error', text: 'Download failed. Please try again.' });
    }
  };

  // 3. Upload the document to MongoDB GridFS for this QR code
  const handleUploadDocument = async (file) => {
    if (!file || !generatedQR) return;

    setUploadingDoc(true);
    setStatusMsg({ type: 'info', text: 'Uploading document to MongoDB GridFS...' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(API_ENDPOINTS.QR_CODE_ATTACHMENTS(generatedQR.codeId), {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to upload document.');
      }

      setGeneratedQR(json.data);
      setStatusMsg({
        type: 'success',
        text: `Document "${file.name}" linked successfully! Anyone scanning this QR code will now open this document.`,
      });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadDocument(e.dataTransfer.files[0]);
    }
  };

  const scanUrl = generatedQR ? getScanUrl(generatedQR.codeId) : '';
  const currentAttachment = generatedQR?.attachments?.[0];

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      
      {/* Alert */}
      {statusMsg.text && (
        <div
          className={`mb-6 p-4 rounded-2xl text-sm flex items-center gap-3 border ${
            statusMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-teal-50 border-teal-200 text-teal-800'
          }`}
        >
          {statusMsg.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* BEFORE GENERATION: Clean Single Button Prompt */}
      {!generatedQR ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-lg">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-sm">
            <Sparkles className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Generate Dynamic QR Code</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
            Click the button below to generate a new QR code instantly. No form details required! You can download the QR code and upload the document right after.
          </p>

          <button
            onClick={handleGenerateQR}
            disabled={isGenerating}
            className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Code...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate QR Code</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* AFTER GENERATION: Download QR Code & Upload Document */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">
          
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                  {generatedQR.codeId}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Generated Successfully
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setGeneratedQR(null);
                setStatusMsg({ type: '', text: '' });
              }}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate Another</span>
            </button>
          </div>

          {/* STEP 1: Download the QR Code */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center">
              <div ref={qrWrapperRef}>
                <QRCodeCanvas
                  value={scanUrl}
                  size={180}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Step 1
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Download Your QR Code</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Save the QR code image now for printing on stickers, badges, or documents.
              </p>

              <button
                onClick={handleDownloadQR}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Code (PNG)</span>
              </button>
            </div>

          </div>

          {/* STEP 2: Upload the Document to show when scanned */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Step 2
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {currentAttachment ? 'Current Linked Document' : 'Upload Document to Show on Scan'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload the PDF, image, spreadsheet, or document that will open whenever this QR code is scanned. You can change it anytime later!
              </p>
            </div>

            {/* Current Attached Document preview if present */}
            {currentAttachment && (
              <div className="p-4 bg-white border border-emerald-200 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentAttachment.fileName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {currentAttachment.fileSize} • Stored in GridFS
                    </p>
                  </div>
                </div>

                <a
                  href={API_ENDPOINTS.FILE_STREAM(currentAttachment.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View</span>
                </a>
              </div>
            )}

            {/* Drag and drop upload zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUploadDocument(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                {uploadingDoc ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
              </div>

              <p className="text-sm font-bold text-slate-800">
                {uploadingDoc
                  ? 'Uploading to MongoDB GridFS...'
                  : currentAttachment
                  ? 'Click or Drop a new file to change the document'
                  : 'Click to select or drag & drop document'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, Word, Excel, Images (JPEG, PNG, WebP)
              </p>
            </div>

            {/* Test Link Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={scanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test public scan page in new tab</span>
              </a>

              <button
                onClick={onGoToManage}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Go to Manage QR List →
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
