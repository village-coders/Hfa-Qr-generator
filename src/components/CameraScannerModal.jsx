import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Upload, AlertCircle, Scan, Sparkles } from 'lucide-react';

export default function CameraScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [scanError, setScanError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef(null);
  const scannerContainerId = 'interactive-camera-scanner';
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          const defaultCam = devices[devices.length - 1].id; // usually environment/back camera on phones
          setSelectedCamera(defaultCam);
          startScanner(defaultCam);
        } else {
          setScanError('No cameras found on your device.');
        }
      })
      .catch((err) => {
        setScanError('Camera permission denied or camera not available. You can upload a QR image instead.');
      });

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = (cameraId) => {
    try {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      html5QrCode
        .start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            // normal frame error while searching for QR
          }
        )
        .then(() => setIsScanning(true))
        .catch((err) => {
          setScanError('Failed to start camera: ' + err);
        });
    } catch (e) {
      console.error(e);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current.clear();
          setIsScanning(false);
        })
        .catch(() => {});
    }
  };

  const handleScanSuccess = (decodedText) => {
    stopScanner();
    onClose();

    // Check if it's a URL in our format or codeId
    if (decodedText.includes('/scan/')) {
      const codeId = decodedText.split('/scan/')[1].split('?')[0].split('#')[0];
      navigate(`/scan/${codeId}`);
    } else if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
      window.location.href = decodedText;
    } else {
      // Treat text as code ID
      navigate(`/scan/${decodedText}`);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0];
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCode
        .scanFile(imageFile, true)
        .then((decodedText) => {
          handleScanSuccess(decodedText);
        })
        .catch((err) => {
          setScanError('Could not decode QR code from the uploaded image. Please try another image.');
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />

        {/* Close Button */}
        <button
          onClick={() => {
            stopScanner();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Live Camera QR Scanner</h3>
            <p className="text-xs text-slate-400">Point your camera at any dynamic QR code to test</p>
          </div>
        </div>

        {/* Camera View Area */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square flex items-center justify-center mb-4">
          <div id={scannerContainerId} className="w-full h-full" />
          
          {/* Overlay Aim Frame */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl animate-pulse-subtle flex items-center justify-center">
                <div className="w-full h-0.5 bg-emerald-400/60 shadow-glow animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {scanError && (
          <div className="mb-4 p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{scanError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          
          {/* Camera switcher if multiple */}
          {cameras.length > 1 && (
            <select
              value={selectedCamera}
              onChange={(e) => {
                setSelectedCamera(e.target.value);
                startScanner(e.target.value);
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
            >
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Camera ${cam.id.slice(0, 5)}`}
                </option>
              ))}
            </select>
          )}

          {/* Upload Image alternative */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Scan QR Image File</span>
          </button>
        </div>

      </div>
    </div>
  );
}
