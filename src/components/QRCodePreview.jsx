import React from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

export default function QRCodePreview({
  value,
  size = 240,
  fgColor = '#0f172a',
  bgColor = '#ffffff',
  level = 'H',
  includeMargin = true,
  frameText = 'SCAN ME',
  codeId = '',
  title = '',
  asCanvas = false,
  canvasRef = null,
  svgRef = null,
  showFrame = true,
}) {
  const qrProps = {
    value: value || 'https://qr-hub.preview',
    size: size,
    fgColor: fgColor || '#0f172a',
    bgColor: bgColor || '#ffffff',
    level: level || 'H',
    includeMargin: includeMargin,
    imageSettings: {
      src: '', // can be populated if custom logo added
      x: undefined,
      y: undefined,
      height: Math.floor(size * 0.18),
      width: Math.floor(size * 0.18),
      excavate: true,
    },
  };

  return (
    <div className="flex flex-col items-center">
      {/* Outer Styled Badge / Card */}
      <div 
        className="p-5 rounded-2xl shadow-xl transition-all flex flex-col items-center border border-slate-700/50"
        style={{ backgroundColor: bgColor }}
      >
        {/* Frame Top Text (if applicable) */}
        {showFrame && frameText && (
          <div className="mb-3 text-center">
            <span 
              className="text-xs uppercase tracking-widest font-black px-3 py-1 rounded-md"
              style={{
                backgroundColor: fgColor,
                color: bgColor,
              }}
            >
              {frameText}
            </span>
          </div>
        )}

        {/* QR Code Graphic */}
        <div className="relative rounded-xl overflow-hidden p-2 bg-white flex items-center justify-center">
          {asCanvas ? (
            <QRCodeCanvas ref={canvasRef} {...qrProps} />
          ) : (
            <QRCodeSVG ref={svgRef} {...qrProps} />
          )}
        </div>

        {/* Bottom Metadata */}
        {codeId && (
          <div className="mt-3 text-center">
            <p className="font-mono text-xs font-bold tracking-wider" style={{ color: fgColor }}>
              {codeId}
            </p>
            {title && (
              <p className="text-[11px] truncate max-w-[200px] font-medium opacity-80" style={{ color: fgColor }}>
                {title}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
