import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileText, Image as ImageIcon, Trash2, CheckCircle2, 
  AlertCircle, Plus, File, Shield, DollarSign, Calendar, MapPin, 
  User, Tag, Link2, Globe, Phone, Mail, FileSpreadsheet, Loader2, Sparkles
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

export default function ContentUploader({ qrData, onUpdateSuccess, onLivePreviewChange }) {
  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'details' | 'content' | 'links'
  const [formData, setFormData] = useState({
    title: qrData.title || '',
    description: qrData.description || '',
    category: qrData.category || 'Asset',
    status: qrData.status || 'Active',
    targetType: qrData.targetType || 'content',
    redirectUrl: qrData.redirectUrl || '',
    itemDetails: {
      serialNumber: qrData.itemDetails?.serialNumber || '',
      model: qrData.itemDetails?.model || '',
      brand: qrData.itemDetails?.brand || '',
      assignedTo: qrData.itemDetails?.assignedTo || '',
      department: qrData.itemDetails?.department || '',
      location: qrData.itemDetails?.location || '',
      purchaseDate: qrData.itemDetails?.purchaseDate ? qrData.itemDetails.purchaseDate.slice(0, 10) : '',
      warrantyExpiry: qrData.itemDetails?.warrantyExpiry ? qrData.itemDetails.warrantyExpiry.slice(0, 10) : '',
      value: qrData.itemDetails?.value || '',
      notes: qrData.itemDetails?.notes || '',
      customFields: qrData.itemDetails?.customFields || [],
    },
    richContent: {
      headline: qrData.richContent?.headline || '',
      body: qrData.richContent?.body || '',
      contactName: qrData.richContent?.contactName || '',
      contactEmail: qrData.richContent?.contactEmail || '',
      contactPhone: qrData.richContent?.contactPhone || '',
      websiteUrl: qrData.richContent?.websiteUrl || '',
      locationAddress: qrData.richContent?.locationAddress || '',
    },
  });

  const [attachments, setAttachments] = useState(qrData.attachments || []);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const fileInputRef = useRef(null);

  // Sync with live preview
  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
    if (onLivePreviewChange) {
      onLivePreviewChange({
        ...qrData,
        ...newFormData,
        attachments,
      });
    }
  };

  const handleFieldChange = (section, field, value) => {
    const updated = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    };
    handleFormChange(updated);
  };

  const handleRootFieldChange = (field, value) => {
    const updated = {
      ...formData,
      [field]: value,
    };
    handleFormChange(updated);
  };

  // Add custom field
  const handleAddCustomField = () => {
    const updatedFields = [...formData.itemDetails.customFields, { label: '', value: '' }];
    handleFieldChange('itemDetails', 'customFields', updatedFields);
  };

  const handleCustomFieldChange = (index, key, val) => {
    const updatedFields = [...formData.itemDetails.customFields];
    updatedFields[index][key] = val;
    handleFieldChange('itemDetails', 'customFields', updatedFields);
  };

  const handleRemoveCustomField = (index) => {
    const updatedFields = formData.itemDetails.customFields.filter((_, i) => i !== index);
    handleFieldChange('itemDetails', 'customFields', updatedFields);
  };

  // File Drag & Drop handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Upload Files to MongoDB GridFS via Backend API
  const handleUploadFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;

    setUploadingFiles(true);
    setStatusMessage({ type: 'info', text: 'Uploading files into MongoDB GridFS...' });

    const uploadFormData = new FormData();
    for (let i = 0; i < filesList.length; i++) {
      uploadFormData.append('files', filesList[i]);
    }

    try {
      const res = await fetch(API_ENDPOINTS.QR_CODE_ATTACHMENTS(qrData.codeId), {
        method: 'POST',
        body: uploadFormData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to upload attachments.');
      }

      setAttachments(json.data);
      if (onLivePreviewChange) {
        onLivePreviewChange({
          ...qrData,
          ...formData,
          attachments: json.data,
        });
      }
      setStatusMessage({ type: 'success', text: 'Files successfully uploaded to MongoDB GridFS!' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete attachment from GridFS
  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const res = await fetch(API_ENDPOINTS.QR_CODE_ATTACHMENT_DELETE(qrData.codeId, attachmentId), {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setAttachments(json.data);
        if (onLivePreviewChange) {
          onLivePreviewChange({
            ...qrData,
            ...formData,
            attachments: json.data,
          });
        }
        setStatusMessage({ type: 'success', text: 'File removed from GridFS.' });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to delete file.' });
    }
  };

  // Save full configuration
  const handleSaveAll = async () => {
    setSavingChanges(true);
    setStatusMessage({ type: 'info', text: 'Saving QR Code configuration...' });

    try {
      const res = await fetch(API_ENDPOINTS.QR_CODE_BY_ID(qrData.codeId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update QR Code.');
      }

      setStatusMessage({ type: 'success', text: 'Saved! Your QR code is live with the latest uploads & info.' });
      if (onUpdateSuccess) onUpdateSuccess(json.data);
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSavingChanges(false);
    }
  };

  const getFileIcon = (mimeType, name) => {
    if (mimeType?.includes('image') || name?.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return <ImageIcon className="w-5 h-5 text-purple-400" />;
    }
    if (mimeType?.includes('pdf') || name?.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-400" />;
    }
    if (name?.match(/\.(xlsx|xls|csv)$/i)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    return <File className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
      
      {/* Top Title & Save Button Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">HFA Content & Uploads</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Linked
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Files and specifications uploaded here will instantly show whenever this QR code is scanned.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={savingChanges}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {savingChanges ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Save & Publish Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Notification Toast Alert */}
      {statusMessage.text && (
        <div
          className={`mt-4 p-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all ${
            statusMessage.type === 'error'
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              : statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800/80 mt-6 pb-2 overflow-x-auto">
        {[
          { id: 'files', label: `Files & Docs (${attachments.length})`, icon: UploadCloud },
          { id: 'details', label: 'Item & Asset Specs', icon: Tag },
          { id: 'content', label: 'Rich Notes & Info', icon: FileText },
          { id: 'links', label: 'Contacts & Redirect', icon: Link2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GridFS File Uploads */}
      {activeTab === 'files' && (
        <div className="pt-6 space-y-6">
          
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center group ${
              dragActive
                ? 'border-emerald-400 bg-emerald-500/10 scale-[0.99]'
                : 'border-slate-700/80 bg-slate-950/50 hover:border-emerald-500/50 hover:bg-slate-950/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleUploadFiles(e.target.files)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
            />
            
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform shadow-glow">
              {uploadingFiles ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              {uploadingFiles ? 'Streaming to MongoDB GridFS...' : 'Click to Upload or Drag & Drop Documents'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Upload PDF manuals, warranties, invoices, spec sheets, diagrams, or high-res photos (up to 10MB per file).
            </p>
            <div className="flex items-center gap-2 mt-4 text-[11px] text-emerald-400/80 font-mono bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Stored securely in MongoDB GridFS Cluster</span>
            </div>
          </div>

          {/* Attached Files List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Uploaded Files in GridFS ({attachments.length})
              </h4>
            </div>

            {attachments.length === 0 ? (
              <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                No files uploaded yet. Drag and drop any PDFs, spreadsheets, or images above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att._id || att.fileUrl}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                        {getFileIcon(att.mimeType, att.fileName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{att.fileName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {att.fileSize || 'GridFS Document'} • {new Date(att.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAttachment(att._id || att.fileUrl);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete from GridFS"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Item & Asset Specifications */}
      {activeTab === 'details' && (
        <div className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Asset / Item Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleRootFieldChange('title', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Caterpillar Diesel Generator 500kVA"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Serial / Barcode Number</label>
              <input
                type="text"
                value={formData.itemDetails.serialNumber}
                onChange={(e) => handleFieldChange('itemDetails', 'serialNumber', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. SN-CAT-9821-409"
              />
            </div>

            {/* Model & Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Brand & Model</label>
              <input
                type="text"
                value={formData.itemDetails.model}
                onChange={(e) => handleFieldChange('itemDetails', 'model', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Dell XPS 15 / Cat C15"
              />
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Assigned Owner / Staff</label>
              <input
                type="text"
                value={formData.itemDetails.assignedTo}
                onChange={(e) => handleFieldChange('itemDetails', 'assignedTo', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Engineering Lead / Maintenance Dept"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Department / Division</label>
              <input
                type="text"
                value={formData.itemDetails.department}
                onChange={(e) => handleFieldChange('itemDetails', 'department', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Operations / Finance"
              />
            </div>

            {/* Physical Location */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Physical Location / Room</label>
              <input
                type="text"
                value={formData.itemDetails.location}
                onChange={(e) => handleFieldChange('itemDetails', 'location', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Building B - Server Room 204"
              />
            </div>

            {/* Value */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Asset Value / Cost (USD / NGN)</label>
              <input
                type="number"
                value={formData.itemDetails.value}
                onChange={(e) => handleFieldChange('itemDetails', 'value', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. 4500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Current Operating Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleRootFieldChange('status', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Active">Active / In Service</option>
                <option value="Maintenance">Under Maintenance</option>
                <option value="Archived">Archived / Retired</option>
              </select>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Acquisition Date</label>
              <input
                type="date"
                value={formData.itemDetails.purchaseDate}
                onChange={(e) => handleFieldChange('itemDetails', 'purchaseDate', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Warranty Expiry */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Warranty Expiration Date</label>
              <input
                type="date"
                value={formData.itemDetails.warrantyExpiry}
                onChange={(e) => handleFieldChange('itemDetails', 'warrantyExpiry', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          {/* Custom Specification Key-Value Pairs */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-300">Custom Attributes & Specs</label>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Specification</span>
              </button>
            </div>

            {formData.itemDetails.customFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Spec Name (e.g. Voltage, RAM)"
                  value={field.label}
                  onChange={(e) => handleCustomFieldChange(idx, 'label', e.target.value)}
                  className="w-1/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 415V 3-Phase, 64GB DDR5)"
                  value={field.value}
                  onChange={(e) => handleCustomFieldChange(idx, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: Rich Notes & Content */}
      {activeTab === 'content' && (
        <div className="pt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Overview Summary / Short Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => handleRootFieldChange('description', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="High-level description of this asset or resource shown right at the top of the scanned page."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Maintenance & Operating Instructions (Rich Text)</label>
            <textarea
              rows={6}
              value={formData.richContent.body}
              onChange={(e) => handleFieldChange('richContent', 'body', e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
              placeholder="Provide detailed user instructions, emergency procedures, maintenance logs, or checklists."
            />
          </div>
        </div>
      )}

      {/* TAB 4: Contact Buttons & Direct URL Redirect */}
      {activeTab === 'links' && (
        <div className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Support Contact Name</label>
              <input
                type="text"
                value={formData.richContent.contactName}
                onChange={(e) => handleFieldChange('richContent', 'contactName', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                placeholder="e.g. Asset Helpdesk"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Support Phone / Hot-line</label>
              <input
                type="tel"
                value={formData.richContent.contactPhone}
                onChange={(e) => handleFieldChange('richContent', 'contactPhone', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                placeholder="e.g. +234 800 000 0000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Support Email</label>
              <input
                type="email"
                value={formData.richContent.contactEmail}
                onChange={(e) => handleFieldChange('richContent', 'contactEmail', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                placeholder="e.g. support@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Official Website / Documentation Portal</label>
              <input
                type="url"
                value={formData.richContent.websiteUrl}
                onChange={(e) => handleFieldChange('richContent', 'websiteUrl', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                placeholder="e.g. https://portal.company.com/docs"
              />
            </div>

          </div>

          {/* Direct Redirection Option */}
          <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-200">Behavior Mode</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRootFieldChange('targetType', 'content')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    formData.targetType === 'content'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Interactive Landing Page (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => handleRootFieldChange('targetType', 'redirect')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    formData.targetType === 'redirect'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Direct URL Forwarding
                </button>
              </div>
            </div>

            {formData.targetType === 'redirect' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Forwarding URL</label>
                <input
                  type="url"
                  value={formData.redirectUrl}
                  onChange={(e) => handleRootFieldChange('redirectUrl', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                  placeholder="https://example.com/asset-page"
                />
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
