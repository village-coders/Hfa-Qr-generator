import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../config/api';

export default function PublicScanPage() {
  const { codeId } = useParams();

  useEffect(() => {
    if (codeId) {
      // Redirect directly to the backend stream URL so ONLY the document shows
      window.location.href = `${API_BASE_URL}/qrcodes/scan/${encodeURIComponent(codeId)}`;
    }
  }, [codeId]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-sm font-semibold text-slate-500">Opening document...</p>
    </div>
  );
}
