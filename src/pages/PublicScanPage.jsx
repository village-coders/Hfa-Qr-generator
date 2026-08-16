import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, Download, AlertCircle, RefreshCw, 
  Image as ImageIcon, FileSpreadsheet, File
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

export default function PublicScanPage() {
  const { codeId } = useParams();

  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScannedData = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(API_ENDPOINTS.QR_CODE_PUBLIC(codeId));
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'QR Code not found.');
        }

        setQrData(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (codeId) {
      fetchScannedData();
    }
  }, [codeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Loading document...</p>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">QR Code Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This QR Code does not exist or has been removed.'}</p>
      </div>
    );
  }

  const document = qrData.attachments?.[0];
  const fileUrl = document ? API_ENDPOINTS.FILE_STREAM(document.fileUrl) : null;
  
  const fileName = document?.fileName || '';
  const isImage = fileName.match(/\.(jpg|jpeg|png|webp|gif)$/i);
  const isPdf = fileName.match(/\.pdf$/i);

  if (!document || !fileUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">No Document Uploaded</h2>
        <p className="text-xs text-slate-500">No document has been linked to this QR code yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start p-2 sm:p-4">
      
      {/* Floating Download Bar */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-3 mb-3 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
            {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{document.fileName}</p>
            <p className="text-[10px] text-slate-400 font-mono">{document.fileSize}</p>
          </div>
        </div>

        <a
          href={fileUrl}
          download={document.fileName}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all flex-shrink-0"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Download</span>
        </a>
      </div>

      {/* Document View Area */}
      <div className="w-full max-w-4xl flex-1 bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden flex items-center justify-center min-h-[75vh]">
        {isImage ? (
          <img
            src={fileUrl}
            alt={document.fileName}
            className="max-w-full max-h-[85vh] object-contain p-2"
          />
        ) : isPdf ? (
          <iframe
            src={fileUrl}
            title={document.fileName}
            className="w-full h-[85vh] border-none"
          />
        ) : (
          /* General file preview card */
          <div className="p-8 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{document.fileName}</h3>
            <p className="text-xs text-slate-400 mb-6 font-mono">{document.fileSize}</p>
            <a
              href={fileUrl}
              download={document.fileName}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download Document</span>
            </a>
          </div>
        )}
      </div>

    </div>
  );
}
