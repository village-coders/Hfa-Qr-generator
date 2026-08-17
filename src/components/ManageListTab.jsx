import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Download, UploadCloud, FileText, Trash2, ExternalLink, 
  RefreshCw, Plus, CheckCircle2, AlertCircle, Eye, File,
  Image as ImageIcon, FileSpreadsheet, X, Loader2, User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_ENDPOINTS, getScanUrl } from '../config/api';

export default function ManageListTab({ onGoToGenerate }) {
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  
  // Modals state
  const [selectedQRForChange, setSelectedQRForChange] = useState(null);
  const [previewQR, setPreviewQR] = useState(null); // Full size QR modal
  const [deleteTargetCodeId, setDeleteTargetCodeId] = useState(null); // Delete confirmation modal
  const [deletingQR, setDeletingQR] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef(null);

  const fetchQRCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.QR_CODES);
      const json = await res.json();
      if (json.success) {
        setQrList(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  // Download QR Code PNG (Trimmed exact black QR with no padding or text)
  const handleDownloadQR = (codeId) => {
    const wrapper = 
      document.getElementById(`qr-wrapper-modal-${codeId}`) ||
      document.getElementById(`qr-wrapper-${codeId}`) || 
      document.getElementById(`qr-wrapper-mobile-${codeId}`);

    if (!wrapper) return;
    const canvas = wrapper.querySelector('canvas');
    if (!canvas) return;

    const finalCanvas = document.createElement('canvas');
    const size = 1024;
    finalCanvas.width = size;
    finalCanvas.height = size;

    const ctx = finalCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw QR image edge to edge
    ctx.drawImage(canvas, 0, 0, size, size);

    const link = document.createElement('a');
    link.href = finalCanvas.toDataURL('image/png');
    link.download = `${codeId}_QR_Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatusMsg({ type: 'success', text: `Downloaded QR code ${codeId}!` });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
  };

  // Change / Upload New Document to GridFS
  const handleUploadNewDocument = async (file) => {
    if (!file || !selectedQRForChange) return;

    setUploadingDoc(true);
    setStatusMsg({ type: 'info', text: 'Updating document in MongoDB GridFS...' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(API_ENDPOINTS.QR_CODE_ATTACHMENTS(selectedQRForChange.codeId), {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update document.');
      }

      setStatusMsg({
        type: 'success',
        text: `Document for ${selectedQRForChange.codeId} changed to "${file.name}"!`,
      });
      setSelectedQRForChange(null);
      fetchQRCodes();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setUploadingDoc(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleDeleteQR = (codeId) => {
    setDeleteTargetCodeId(codeId);
  };

  // Execute Delete QR Code
  const confirmDeleteQR = async () => {
    if (!deleteTargetCodeId) return;

    setDeletingQR(true);
    try {
      const res = await fetch(API_ENDPOINTS.QR_CODE_BY_ID(deleteTargetCodeId), {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setStatusMsg({ type: 'success', text: `QR Code ${deleteTargetCodeId} deleted.` });
        setDeleteTargetCodeId(null);
        fetchQRCodes();
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      } else {
        setStatusMsg({ type: 'error', text: json.message || 'Failed to delete.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to delete QR code.' });
    } finally {
      setDeletingQR(false);
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName?.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return <ImageIcon className="w-5 h-5 text-purple-600" />;
    }
    if (fileName?.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-rose-600" />;
    }
    if (fileName?.match(/\.(xlsx|xls|csv)$/i)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    return <File className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-12 px-3 sm:px-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Manage QR List</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Click any QR code to view it in full, download it, or change the linked document.
          </p>
        </div>

        <button
          onClick={onGoToGenerate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Generate New QR Code</span>
        </button>
      </div>

      {/* Alert */}
      {statusMsg.text && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 border ${
            statusMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
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

      {/* Main List Container */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-xs sm:text-sm font-semibold">Loading QR list...</p>
        </div>
      ) : qrList.length === 0 ? (
        <div className="py-16 text-center px-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No QR codes generated yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Generate your first QR code and link a document to it.
          </p>
          <button
            onClick={onGoToGenerate}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow"
          >
            Generate QR Code
          </button>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW (Visible on small screens) */}
          <div className="md:hidden space-y-4">
            {qrList.map((qr) => {
              const doc = qr.attachments?.[0];
              const scanUrl = getScanUrl(qr.codeId);

              return (
                <div key={qr._id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-4">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Clickable QR Thumbnail to open Full View */}
                      <div 
                        onClick={() => setPreviewQR(qr)}
                        className="w-14 h-14 p-1 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-95 transition-all group"
                        title="Click to view QR code in full"
                      >
                        <div id={`qr-wrapper-mobile-${qr.codeId}`}>
                          <QRCodeCanvas
                            value={scanUrl}
                            size={48}
                            fgColor="#000000"
                            bgColor="#ffffff"
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                      </div>
                      <div>
                        <span 
                          onClick={() => setPreviewQR(qr)}
                          className="font-mono font-extrabold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer hover:bg-emerald-200 transition-colors"
                        >
                          {qr.codeId}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                          <User className="w-3 h-3 text-emerald-600" />
                          <span>By: <strong className="text-slate-800">{qr.createdByName || 'Admin'}</strong></span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {qr.scanCount || 0} scan{qr.scanCount === 1 ? '' : 's'} • {new Date(qr.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteQR(qr.codeId)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                      title="Delete QR"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Document Info */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      Linked Document
                    </span>
                    {doc ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                          {getFileIcon(doc.fileName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 truncate">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{doc.fileSize}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No document uploaded yet</span>
                    )}
                  </div>

                  {/* Touch Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setPreviewQR(qr)}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full QR</span>
                    </button>

                    <button
                      onClick={() => setSelectedQRForChange(qr)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.97] text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{doc ? 'Change File' : 'Upload File'}</span>
                    </button>
                  </div>

                  <a
                    href={scanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Scan URL</span>
                  </a>

                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW (Visible on medium & large screens) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">QR Code</th>
                    <th className="py-4 px-6">Code ID</th>
                    <th className="py-4 px-6">Created By</th>
                    <th className="py-4 px-6">Linked Document</th>
                    <th className="py-4 px-6 text-center">Scans</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {qrList.map((qr) => {
                    const doc = qr.attachments?.[0];
                    const scanUrl = getScanUrl(qr.codeId);

                    return (
                      <tr key={qr._id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* QR Thumbnail — Click to view in full */}
                        <td className="py-4 px-6">
                          <div 
                            onClick={() => setPreviewQR(qr)}
                            className="w-14 h-14 p-1 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 transition-all"
                            title="Click to view QR code in full"
                          >
                            <div id={`qr-wrapper-${qr.codeId}`}>
                              <QRCodeCanvas
                                value={scanUrl}
                                size={48}
                                fgColor="#000000"
                                bgColor="#ffffff"
                                level="H"
                                includeMargin={false}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Code ID */}
                        <td className="py-4 px-6">
                          <span 
                            onClick={() => setPreviewQR(qr)}
                            className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer hover:bg-emerald-200 transition-colors"
                          >
                            {qr.codeId}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            Created {new Date(qr.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        {/* Created By */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-100 flex-shrink-0">
                              {(qr.createdByName || 'Admin').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-xs text-slate-800">
                              {qr.createdByName || 'Admin'}
                            </span>
                          </div>
                        </td>

                        {/* Linked Document */}
                        <td className="py-4 px-6">
                          {doc ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                {getFileIcon(doc.fileName)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate max-w-[200px]">{doc.fileName}</p>
                                <p className="text-xs text-slate-400">{doc.fileSize || 'Doc'}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No document uploaded yet</span>
                          )}
                        </td>

                        {/* Scans Count */}
                        <td className="py-4 px-6 text-center">
                          <span className="font-bold text-slate-700 font-mono bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                            {qr.scanCount || 0}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* View Full QR / Download button */}
                            <button
                              onClick={() => setPreviewQR(qr)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                              title="View QR Code in full"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Full</span>
                            </button>

                            {/* Change Document button */}
                            <button
                              onClick={() => setSelectedQRForChange(qr)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                              title="Upload or replace document"
                            >
                              <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{doc ? 'Change Document' : 'Upload Document'}</span>
                            </button>

                            {/* Test Public Scan */}
                            <a
                              href={scanUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                              title="Open scanned link in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteQR(qr.codeId)}
                              className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete QR"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* FULL SIZE QR CODE MODAL */}
      {previewQR && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewQR(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewQR(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 mb-4">
              {previewQR.codeId}
            </span>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-md flex items-center justify-center mb-6">
              <div id={`qr-wrapper-modal-${previewQR.codeId}`}>
                <QRCodeCanvas
                  value={getScanUrl(previewQR.codeId)}
                  size={240}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            <button
              onClick={() => handleDownloadQR(previewQR.codeId)}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download QR Code (PNG)</span>
            </button>
          </div>
        </div>
      )}

      {/* Change Document Modal */}
      {selectedQRForChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            
            <button
              onClick={() => setSelectedQRForChange(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Change Document</h3>
                <p className="text-xs text-slate-500 font-mono">For QR Code: {selectedQRForChange.codeId}</p>
              </div>
            </div>

            {selectedQRForChange.attachments?.[0] && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <p className="text-slate-500">Current file:</p>
                <p className="font-semibold text-slate-800 truncate">{selectedQRForChange.attachments[0].fileName}</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUploadNewDocument(e.target.files[0]);
                }
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingDoc}
              className="w-full py-8 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer"
            >
              {uploadingDoc ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-emerald-800">Updating MongoDB GridFS...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-emerald-600 mb-2" />
                  <span className="text-sm font-bold text-slate-800">Click to Select New Document</span>
                  <span className="text-xs text-slate-400 mt-0.5">PDF, Word, Excel, Image (Replaces previous file)</span>
                </>
              )}
            </button>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetCodeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-200">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete QR Code</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              Are you sure you want to permanently delete QR Code <strong className="text-slate-800 font-mono font-bold">{deleteTargetCodeId}</strong> and its linked documents?
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={deletingQR}
                onClick={() => setDeleteTargetCodeId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingQR}
                onClick={confirmDeleteQR}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deletingQR ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
