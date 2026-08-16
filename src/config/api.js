const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const API_ENDPOINTS = {
  // QR Codes
  QR_CODES: `${API_BASE_URL}/qrcodes`,
  QR_CODE_BY_ID: (id) => `${API_BASE_URL}/qrcodes/${id}`,
  QR_CODE_PUBLIC: (codeId) => `${API_BASE_URL}/qrcodes/public/${codeId}`,
  QR_CODE_SCAN_DIRECT: (codeId) => `${API_BASE_URL}/qrcodes/scan/${codeId}`,
  QR_CODE_ATTACHMENTS: (id) => `${API_BASE_URL}/qrcodes/${id}/attachments`,
  QR_CODE_ATTACHMENT_DELETE: (id, attId) => `${API_BASE_URL}/qrcodes/${id}/attachments/${attId}`,
  
  // File streaming from GridFS
  FILE_STREAM: (fileId) => `${API_BASE_URL}/files/${fileId}`,
};

export const getScanUrl = (codeId) => {
  // Direct backend link to stream uploaded document directly from GridFS
  return `${API_BASE_URL}/qrcodes/scan/${encodeURIComponent(codeId)}`;
};

export default API_BASE_URL;
