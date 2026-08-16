import React, { useState, useRef } from 'react';
import { 
  Download, FileImage, FileCode2, Printer, Copy, Check, 
  X, ExternalLink, Sparkles, Shield, ArrowRight 
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { getScanUrl } from '../config/api';

export default function DownloadModal({ qrData, onClose, onProceedToUpload }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [resolution, setResolution] = useState(1024); // 512, 1024, 2048

  const offscreenCanvasRef = useRef(null);

  const scanUrl = getScanUrl(qrData.codeId);

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download PNG with frame & styling
  const handleDownloadPNG = (sizeOverride) => {
    const targetSize = sizeOverride || resolution;
    setDownloading(true);

    try {
      // Create high-res canvas
      const canvas = document.createElement('canvas');
      const padding = Math.floor(targetSize * 0.1);
      const headerHeight = Math.floor(targetSize * 0.15);
      const footerHeight = Math.floor(targetSize * 0.18);
      
      canvas.width = targetSize + padding * 2;
      canvas.height = targetSize + padding * 2 + headerHeight + footerHeight;

      const ctx = canvas.getContext('2d');

      // Draw background
      ctx.fillStyle = qrData.styling?.bgColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = Math.max(2, targetSize * 0.005);
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Draw Header Tag
      const headerText = (qrData.styling?.frameText || 'SCAN ME').toUpperCase();
      ctx.font = `bold ${Math.floor(targetSize * 0.045)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Header badge background
      const badgeWidth = targetSize * 0.45;
      const badgeHeight = headerHeight * 0.55;
      const badgeX = (canvas.width - badgeWidth) / 2;
      const badgeY = padding * 0.8;
      
      ctx.fillStyle = qrData.styling?.fgColor || '#0f172a';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
      ctx.fill();

      // Header text inside badge
      ctx.fillStyle = qrData.styling?.bgColor || '#ffffff';
      ctx.fillText(headerText, canvas.width / 2, badgeY + badgeHeight / 2);

      // Render QR code to temporary canvas and draw onto main canvas
      const tempCanvas = document.createElement('canvas');
      // Use QRCodeCanvas rendered offscreen
      if (offscreenCanvasRef.current) {
        const qrCanvas = offscreenCanvasRef.current.querySelector('canvas');
        if (qrCanvas) {
          const qrY = padding + headerHeight;
          ctx.drawImage(qrCanvas, padding, qrY, targetSize, targetSize);
        }
      }

      // Draw Footer Metadata (code ID + Title)
      const footerY = padding + headerHeight + targetSize + footerHeight * 0.35;
      ctx.fillStyle = qrData.styling?.fgColor || '#0f172a';
      ctx.font = `bold ${Math.floor(targetSize * 0.04)}px 'JetBrains Mono', monospace`;
      ctx.fillText(qrData.codeId, canvas.width / 2, footerY);

      if (qrData.title) {
        ctx.font = `500 ${Math.floor(targetSize * 0.03)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(qrData.title.slice(0, 35), canvas.width / 2, footerY + footerHeight * 0.35);
      }

      // Convert to image and trigger download
      const imageURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `${qrData.codeId}_QR_Badge_${targetSize}px.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setDownloadSuccess(`PNG (${targetSize}px) downloaded!`);
      setTimeout(() => setDownloadSuccess(''), 3000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Download Clean Vector SVG
  const handleDownloadSVG = () => {
    try {
      const svgElement = document.getElementById('qr-svg-render');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `${qrData.codeId}_vector_qr.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);

      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      setDownloadSuccess('Vector SVG downloaded!');
      setTimeout(() => setDownloadSuccess(''), 3000);
    } catch (err) {
      console.error('SVG download error:', err);
    }
  };

  // Generate Printable PDF Asset Tag Badge
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150], // Standard 100mm x 150mm asset tag label
      });

      // Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 100, 150, 'F');

      // Top Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 100, 22, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('SMART ASSET IDENTIFIER', 50, 12, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Scan for specs, documentation & warranty', 50, 18, { align: 'center' });

      // Title & Category
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(qrData.title || 'Dynamic Asset', 50, 32, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Category: ${qrData.category || 'Asset'} | Status: ${qrData.status || 'Active'}`, 50, 38, { align: 'center' });

      // QR Code Image from Canvas
      if (offscreenCanvasRef.current) {
        const qrCanvas = offscreenCanvasRef.current.querySelector('canvas');
        if (qrCanvas) {
          const imgData = qrCanvas.toDataURL('image/png');
          doc.addImage(imgData, 'PNG', 20, 44, 60, 60);
        }
      }

      // Code ID
      doc.setFont('courier', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(qrData.codeId, 50, 112, { align: 'center' });

      // Specs Summary Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(10, 118, 80, 22, 3, 3, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      
      const serial = qrData.itemDetails?.serialNumber || 'N/A';
      const assigned = qrData.itemDetails?.assignedTo || 'General Inventory';
      doc.text(`Serial: ${serial}`, 15, 125);
      doc.text(`Assigned: ${assigned}`, 15, 130);
      doc.text(`Scan URL: ${scanUrl.slice(0, 38)}...`, 15, 135);

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('Powered by Dynamic QR Hub • GridFS Storage System', 50, 146, { align: 'center' });

      doc.save(`${qrData.codeId}_Printable_Asset_Badge.pdf`);

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      setDownloadSuccess('Printable PDF Tag downloaded!');
      setTimeout(() => setDownloadSuccess(''), 3000);
    } catch (err) {
      console.error('PDF error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Download Your QR Code</h2>
              <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-lg">
                {qrData.codeId}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Download your code now in print-ready formats, then proceed to upload whatever files or info you want it to show!
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs sm:text-sm flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Offscreen Canvas for High-Resolution exports */}
        <div ref={offscreenCanvasRef} className="hidden">
          <QRCodeCanvas
            value={scanUrl}
            size={resolution}
            fgColor={qrData.styling?.fgColor || '#0f172a'}
            bgColor={qrData.styling?.bgColor || '#ffffff'}
            level={qrData.styling?.level || 'H'}
            includeMargin={true}
          />
        </div>

        {/* Hidden SVG for vector download */}
        <svg id="qr-svg-render" className="hidden" width="500" height="500" viewBox="0 0 500 500">
          {/* Will use SVG preview element */}
        </svg>

        {/* Download Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          
          {/* PNG High-Res */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <FileImage className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">PNG</span>
              </div>
              <h3 className="font-semibold text-sm text-white">Raster PNG</h3>
              <p className="text-xs text-slate-400 mt-1 mb-3">High-res framed badge for digital and physical use.</p>
              
              {/* Resolution select */}
              <div className="flex gap-1.5 mb-3">
                {[512, 1024, 2048].map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`flex-1 py-1 text-[10px] font-mono rounded-lg transition-all ${
                      resolution === res
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-glow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {res}px
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleDownloadPNG()}
              disabled={downloading}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>

          {/* Vector SVG */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-teal-500/40 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <FileCode2 className="w-6 h-6 text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">SVG</span>
              </div>
              <h3 className="font-semibold text-sm text-white">Vector SVG</h3>
              <p className="text-xs text-slate-400 mt-1 mb-3">Lossless resolution for industrial printing, signage and CAD.</p>
            </div>

            <button
              onClick={handleDownloadSVG}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SVG</span>
            </button>
          </div>

          {/* Printable Tag PDF */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Printer className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">PDF</span>
              </div>
              <h3 className="font-semibold text-sm text-white">Printable Tag</h3>
              <p className="text-xs text-slate-400 mt-1 mb-3">Pre-formatted asset tag badge layout ready for label printers.</p>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download PDF Tag</span>
            </button>
          </div>

        </div>

        {/* Public Scan URL & Copy Box */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5 w-full sm:w-auto min-w-0">
            <span className="text-xs text-slate-400 flex-shrink-0 font-medium">Scan Link:</span>
            <span className="text-xs font-mono text-emerald-400 truncate select-all">{scanUrl}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <a
              href={scanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Open Scan URL in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Next Step Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Next: Upload documents, manuals & specs to show when scanned</span>
          </div>
          <button
            onClick={onProceedToUpload}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Proceed to Upload Content</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </div>
  );
}
