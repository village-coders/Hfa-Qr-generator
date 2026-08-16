import React from 'react';
import { 
  ShieldCheck, FileText, Download, ExternalLink, Phone, 
  Mail, MapPin, Calendar, Tag, CheckCircle2, File, Image as ImageIcon,
  FileSpreadsheet, Sparkles, Building2, User
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

export default function MobileSimulator({ data }) {
  if (!data) return null;

  const {
    codeId = 'QR-000000',
    title = 'Untitled Resource',
    description = '',
    category = 'Asset',
    status = 'Active',
    itemDetails = {},
    richContent = {},
    attachments = [],
  } = data;

  const getStatusColor = (st) => {
    switch (st) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Maintenance':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Archived':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getFileIcon = (mimeType, name) => {
    if (mimeType?.includes('image') || name?.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return <ImageIcon className="w-4 h-4 text-purple-400" />;
    }
    if (mimeType?.includes('pdf') || name?.endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-rose-400" />;
    }
    if (name?.match(/\.(xlsx|xls|csv)$/i)) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    }
    return <File className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Device Shell Frame */}
      <div className="w-[320px] sm:w-[340px] h-[640px] bg-slate-950 border-[6px] border-slate-800 rounded-[44px] shadow-2xl p-3 flex flex-col relative overflow-hidden ring-1 ring-slate-700/50">
        
        {/* Notch / Speaker Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full flex items-center justify-center z-30">
          <div className="w-3 h-3 rounded-full bg-slate-950/80 mr-3 border border-slate-800" />
          <div className="w-8 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Screen Content Window */}
        <div className="w-full h-full bg-slate-900 rounded-[34px] overflow-y-auto pt-8 pb-6 px-3.5 custom-scrollbar text-slate-200 text-xs">
          
          {/* Header Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 shadow-md mb-3">
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {codeId}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold border ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>

            <h3 className="font-bold text-sm text-white leading-tight mb-1">
              {title || 'Item Title'}
            </h3>
            
            {description && (
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {description}
              </p>
            )}

            <div className="mt-2.5 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Category: <strong className="text-slate-300 font-semibold">{category}</strong></span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
          </div>

          {/* Uploaded Documents / Attachments (GridFS) */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Attachments ({attachments.length})
              </span>
            </div>

            {attachments.length === 0 ? (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center text-[10px] text-slate-500">
                No attachments uploaded
              </div>
            ) : (
              <div className="space-y-1.5">
                {attachments.slice(0, 4).map((att, idx) => (
                  <a
                    key={idx}
                    href={API_ENDPOINTS.FILE_STREAM(att.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-xl flex items-center justify-between gap-2 transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                        {getFileIcon(att.mimeType, att.fileName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-200 truncate group-hover:text-emerald-300">{att.fileName}</p>
                        <p className="text-[9px] text-slate-500 font-mono">{att.fileSize || 'Doc'}</p>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 flex-shrink-0" />
                  </a>
                ))}
                {attachments.length > 4 && (
                  <p className="text-[9px] text-center text-slate-500">+{attachments.length - 4} more files</p>
                )}
              </div>
            )}
          </div>

          {/* Specifications Breakdown */}
          {(itemDetails.serialNumber || itemDetails.model || itemDetails.assignedTo || itemDetails.department) && (
            <div className="mb-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Specifications
              </span>
              
              {itemDetails.serialNumber && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Serial No:</span>
                  <span className="font-mono font-semibold text-slate-200">{itemDetails.serialNumber}</span>
                </div>
              )}

              {itemDetails.model && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Model:</span>
                  <span className="text-slate-200">{itemDetails.model}</span>
                </div>
              )}

              {itemDetails.assignedTo && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Assigned To:</span>
                  <span className="text-slate-200">{itemDetails.assignedTo}</span>
                </div>
              )}

              {itemDetails.department && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-slate-200">{itemDetails.department}</span>
                </div>
              )}

              {itemDetails.location && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200">{itemDetails.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Rich Content / Body */}
          {richContent.body && (
            <div className="mb-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Instructions & Notes
              </span>
              <p className="text-[10px] text-slate-300 leading-relaxed whitespace-pre-line font-mono bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                {richContent.body}
              </p>
            </div>
          )}

          {/* Quick Action Contact Buttons */}
          {(richContent.contactPhone || richContent.contactEmail || richContent.websiteUrl) && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Direct Contact & Links
              </span>

              {richContent.contactPhone && (
                <a
                  href={`tel:${richContent.contactPhone}`}
                  className="w-full py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center justify-center gap-1.5 font-semibold text-[10px]"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Support ({richContent.contactPhone})</span>
                </a>
              )}

              {richContent.contactEmail && (
                <a
                  href={`mailto:${richContent.contactEmail}`}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center gap-1.5 font-medium text-[10px]"
                >
                  <Mail className="w-3 h-3" />
                  <span>Email ({richContent.contactEmail})</span>
                </a>
              )}

              {richContent.websiteUrl && (
                <a
                  href={richContent.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center gap-1.5 font-medium text-[10px]"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Official Documentation</span>
                </a>
              )}
            </div>
          )}

        </div>

      </div>

      <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-[11px]">
        <Sparkles className="w-3 h-3 text-emerald-400" />
        <span>Live interactive mobile scan preview</span>
      </div>

    </div>
  );
}
