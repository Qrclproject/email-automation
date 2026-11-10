import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { useStudioStore } from '../../store/useStudioStore';

export default function LivePreview() {
  const { 
    backgroundImage, qrPadding, qrBgColor, qrDotColor, qrDotShape, 
    qrFinderOuterColor, qrFinderOuterShape, qrFinderInnerColor, qrFinderInnerShape 
  } = useStudioStore();
  
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = ''; // Clear previous

    const qrCode = new QRCodeStyling({
      width: 100,
      height: 100,
      data: "https://qrcodeng.com/sample",
      imageOptions: { crossOrigin: "anonymous", margin: 0 },
      dotsOptions: { color: qrDotColor, type: qrDotShape },
      cornersSquareOptions: { color: qrFinderOuterColor, type: qrFinderOuterShape },
      cornersDotOptions: { color: qrFinderInnerColor, type: qrFinderInnerShape },
      backgroundOptions: { color: qrBgColor },
      margin: qrPadding,
    });

    qrCode.append(qrRef.current);
  }, [qrPadding, qrBgColor, qrDotColor, qrDotShape, qrFinderOuterColor, qrFinderOuterShape, qrFinderInnerColor, qrFinderInnerShape]);

  return (
    <div className="absolute top-4 right-4 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 pointer-events-none">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-semibold text-gray-500">Live Preview</span>
        <span className="text-[10px] text-gray-400">⛶</span>
      </div>
      <div 
        className="w-full aspect-[3/4] bg-gray-100 rounded border border-gray-200 relative overflow-hidden"
        style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none', backgroundSize: 'cover' }}
      >
        {!backgroundImage && <div className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-400">No Image</div>}
        
        {/* Render tiny QR inside the preview */}
        <div className="absolute bottom-2 right-2 w-8 h-8 bg-white p-0.5" ref={qrRef}></div>
      </div>
    </div>
  );
}