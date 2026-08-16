import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, QrCode, Download, Edit3, Trash2, 
  ExternalLink, Eye, ArrowUpDown, FileText, CheckCircle2, 
  Sparkles, RefreshCw, BarChart2, Activity, Layers
} from 'lucide-react';
import DownloadModal from '../components/DownloadModal';
import { API_ENDPOINTS, getScanUrl } from '../config/api';

export default function ManageQRCodesPage() {
  const navigate = useNavigate();

  const [qrList, setQrList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedQRForDownload, setSelectedQRForDownload] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch QR codes list
  const fetchQRCodes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        search,
        category: categoryFilter,
        status: statusFilter,
      });

      const res = await fetch(`${API_ENDPOINTS.QR_CODES}?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQrList(json.data || []);
        setTotalCount(json.count || 0);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch QR codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, [page, categoryFilter, statusFilter]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchQRCodes();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Delete QR Code
  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const res = await fetch(API_ENDPOINTS.QR_CODE_BY_ID(id), {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setDeleteConfirmId(null);
        fetchQRCodes();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Compute analytics
  const totalScans = qrList.reduce((acc, curr) => acc + (curr.scanCount || 0), 0);
  const totalAttachments = qrList.reduce((acc, curr) => acc + (curr.attachments?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">QR Hub & Content Manager</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your dynamic codes, update uploaded GridFS documents anytime, and track scan analytics.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-glow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Generate New QR Code</span>
        </Link>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Generated QR Codes</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Code Scans</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalScans}</p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">GridFS Linked Attachments</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalAttachments}</p>
          </div>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, code ID, or model..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="Asset">Asset</option>
            <option value="Document">Document</option>
            <option value="Product">Product</option>
            <option value="Facility">Facility</option>
            <option value="Contact">Contact</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Archived">Archived</option>
          </select>

          <button
            onClick={fetchQRCodes}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

        </div>

      </div>

      {/* QR Codes Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
          <p className="text-sm">Loading dynamic QR codes...</p>
        </div>
      ) : qrList.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <QrCode className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No QR Codes Found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
            You haven't generated any dynamic QR codes matching this filter yet. Create your first one now!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Generate Dynamic QR</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {qrList.map((qr) => {
            const scanUrl = getScanUrl(qr.codeId);
            return (
              <div
                key={qr._id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Top Tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {qr.codeId}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                      qr.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : qr.status === 'Maintenance'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {qr.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {qr.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                    {qr.description || (qr.itemDetails?.model ? `Model: ${qr.itemDetails.model}` : 'Dynamic asset landing page')}
                  </p>

                  {/* Metadata Chips */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Category: <strong className="text-slate-300">{qr.category}</strong></span>
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                      {qr.scanCount || 0} scans
                    </span>
                  </div>

                  {/* GridFS Attachments count */}
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <FileText className="w-3 h-3 text-cyan-400" />
                    <span>{qr.attachments?.length || 0} GridFS files linked</span>
                  </div>

                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
                  
                  {/* Download Options */}
                  <button
                    onClick={() => setSelectedQRForDownload(qr)}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    title="Download PNG, SVG, or Printable Tag"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download</span>
                  </button>

                  {/* Edit Content */}
                  <Link
                    to={`/?edit=${qr.codeId}`}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    title="Edit uploads & specifications"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Data</span>
                  </Link>

                  {/* Public View Link */}
                  <a
                    href={scanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                    title="View scanned public page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirmId(qr.codeId)}
                    className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                    title="Delete QR code"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>

                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === qr.codeId && (
                  <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs">
                    <p className="text-rose-300 font-semibold mb-2">Delete this QR Code & its GridFS files?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(qr.codeId)}
                        disabled={deleting}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg"
                      >
                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-400 font-mono">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Download Station Modal */}
      {selectedQRForDownload && (
        <DownloadModal
          qrData={selectedQRForDownload}
          onClose={() => setSelectedQRForDownload(null)}
          onProceedToUpload={() => {
            navigate(`/?edit=${selectedQRForDownload.codeId}`);
            setSelectedQRForDownload(null);
          }}
        />
      )}

    </div>
  );
}
