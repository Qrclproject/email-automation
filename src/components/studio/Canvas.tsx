import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import QRCodeStyling from 'qr-code-styling';
import { useStudioStore } from '../../store/useStudioStore';
import LivePreview from './LivePreview';


const QRCodeRenderer = ({ el }: { el: any }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const { qrPadding, qrBgColor, qrDotColor, qrDotShape, qrFinderOuterColor, qrFinderOuterShape, qrFinderInnerColor, qrFinderInnerShape, selectedId } = useStudioStore();

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = '';

    const qrCode = new QRCodeStyling({
      width: el.width,
      height: el.width,
      data: "https://qrcodeng.com/sample-ticket",
      dotsOptions: { color: qrDotColor, type: qrDotShape },
      cornersSquareOptions: { color: qrFinderOuterColor, type: qrFinderOuterShape },
      cornersDotOptions: { color: qrFinderInnerColor, type: qrFinderInnerShape },
      backgroundOptions: { color: qrBgColor },
      margin: qrPadding,
    });

    qrCode.append(qrRef.current);
  }, [el.width, qrPadding, qrBgColor, qrDotColor, qrDotShape, qrFinderOuterColor, qrFinderOuterShape, qrFinderInnerColor, qrFinderInnerShape]);

  return (
    <div className="w-full h-full relative group">
      {/* The actual rendered QR code */}
      <div className="w-full h-full pointer-events-none" ref={qrRef} />
      
      {/* The dashed orange border (Only visible when selected) */}
      {selectedId === el.id && (
        <div className="absolute inset-0 border-2 border-dashed border-[#FFA45C] rounded-lg pointer-events-none" />
      )}
      
      {/* The 'QR' label in the center if no QR is generated yet */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
         <span className="text-[#FFA45C] font-bold">QR</span>
      </div>
    </div>
  );
};

export default function Canvas() {
  const { elements, selectedId, selectElement, updateElement, backgroundImage } = useStudioStore();

  return (
    <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-auto relative">
      
      {/* Floating Preview */}
      <LivePreview />

      <div 
        className="relative shadow-2xl overflow-hidden bg-white"
        style={{ 
          width: 420, height: 560, 
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
        onClick={() => selectElement(null)}
      >
        {!backgroundImage && (
           <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Upload a background image to begin
           </div>
        )}

        {elements.map((el) => {
          const isQR = el.type === 'qr';
          return (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: isQR ? el.width : 'auto' }}
              position={{ x: el.x, y: el.y }}
              onDragStop={(_e, d) => updateElement(el.id, { x: d.x, y: d.y })}
              onResizeStop={(_e, _dir, ref, _delta, position) => {
                updateElement(el.id, { width: parseInt(ref.style.width, 10), ...position });
              }}
              bounds="parent"
              lockAspectRatio={isQR}
             onClick={(e: React.MouseEvent) => { e.stopPropagation(); selectElement(el.id); }}
              className={`${selectedId === el.id ? 'ring-1 ring-blue-500 bg-blue-500/5' : 'hover:ring-1 hover:ring-blue-400/30'} cursor-move`}
            >
              {isQR ? (
                <QRCodeRenderer el={el} />
              ) : (
                <div style={{
                  fontSize: el.fontSize, color: el.color, fontFamily: el.fontFamily,
                  textAlign: el.textAlign, fontWeight: el.fontWeight, lineHeight: 1.2, width: '100%',
                }} className="break-words">
                  {el.text}
                </div>
              )}
            </Rnd>
          );
        })}
      </div>
    </div>
  );
}