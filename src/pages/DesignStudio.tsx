import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useSearchParams } from 'react-router-dom';
import { createDesign, updateDesign, getDesignById } from '../services/designService';
import QRCode from 'qrcode';
import { 
  Plus, X, Maximize, Minimize, SlidersHorizontal, 
  Eye, EyeOff, Check, Trash2, Image as ImageIcon, Move
} from 'lucide-react';

// ─── Shape drawing (centered, used for single large elements) ──
const drawCenteredShape = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, shape: string, color: string) => {
  ctx.fillStyle = color;
  const half = size / 2;

  switch (shape) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(cx, cy, half, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'rounded': {
      const r = size * 0.2;
      ctx.beginPath();
      ctx.moveTo(cx - half + r, cy - half);
      ctx.lineTo(cx + half - r, cy - half);
      ctx.quadraticCurveTo(cx + half, cy - half, cx + half, cy - half + r);
      ctx.lineTo(cx + half, cy + half - r);
      ctx.quadraticCurveTo(cx + half, cy + half, cx + half - r, cy + half);
      ctx.lineTo(cx - half + r, cy + half);
      ctx.quadraticCurveTo(cx - half, cy + half, cx - half, cy + half - r);
      ctx.lineTo(cx - half, cy - half + r);
      ctx.quadraticCurveTo(cx - half, cy - half, cx - half + r, cy - half);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(cx, cy - half);
      ctx.lineTo(cx + half, cy);
      ctx.lineTo(cx, cy + half);
      ctx.lineTo(cx - half, cy);
      ctx.closePath();
      ctx.fill();
      break;
    case 'star': {
      const spikes = 5;
      const outerRadius = half;
      const innerRadius = half * 0.45;
      let rot = Math.PI / 2 * 3;
      const step = Math.PI / spikes;
      ctx.beginPath();
      for (let i = 0; i < spikes; i++) {
        let bx = cx + Math.cos(rot) * outerRadius;
        let by = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(bx, by);
        rot += step;
        bx = cx + Math.cos(rot) * innerRadius;
        by = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(bx, by);
        rot += step;
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(cx, cy - half + 2);
      ctx.lineTo(cx + half - 2, cy + half - 2);
      ctx.lineTo(cx - half + 2, cy + half - 2);
      ctx.closePath();
      ctx.fill();
      break;
    case 'square':
    default:
      ctx.fillRect(cx - half, cy - half, size, size);
  }
};

// ─── Draw a single QR module ────
const drawModuleShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, shape: string, color: string) => {
  ctx.fillStyle = color;
  const half = size / 2;
  const s = size;

  switch (shape) {
    case 'circle':
      ctx.beginPath(); ctx.arc(x + half, y + half, half, 0, Math.PI * 2); ctx.fill(); break;
    case 'rounded': {
      const r = size * 0.25;
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + s - r, y); ctx.quadraticCurveTo(x + s, y, x + s, y + r);
      ctx.lineTo(x + s, y + s - r); ctx.quadraticCurveTo(x + s, y + s, x + s - r, y + s);
      ctx.lineTo(x + r, y + s); ctx.quadraticCurveTo(x, y + s, x, y + s - r);
      ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill(); break;
    }
    case 'diamond':
      ctx.beginPath(); ctx.moveTo(x + half, y); ctx.lineTo(x + s, y + half); ctx.lineTo(x + half, y + s); ctx.lineTo(x, y + half); ctx.closePath(); ctx.fill(); break;
    case 'star': {
      const spikes = 5; const outerRadius = half; const innerRadius = half * 0.45; let rot = Math.PI / 2 * 3; const step = Math.PI / spikes;
      ctx.beginPath();
      for (let i = 0; i < spikes; i++) {
        let bx = x + half + Math.cos(rot) * outerRadius; let by = y + half + Math.sin(rot) * outerRadius;
        ctx.lineTo(bx, by); rot += step;
        bx = x + half + Math.cos(rot) * innerRadius; by = y + half + Math.sin(rot) * innerRadius;
        ctx.lineTo(bx, by); rot += step;
      }
      ctx.closePath(); ctx.fill(); break;
    }
    case 'triangle':
      ctx.beginPath(); ctx.moveTo(x + half, y + 2); ctx.lineTo(x + s - 2, y + s - 2); ctx.lineTo(x + 2, y + s - 2); ctx.closePath(); ctx.fill(); break;
    case 'square': default: ctx.fillRect(x, y, size, size);
  }
};

const getFinderPart = (row: number, col: number, size: number) => {
  const isTopLeft = row < 7 && col < 7;
  const isTopRight = row < 7 && col >= size - 7;
  const isBottomLeft = row >= size - 7 && col < 7;
  if (!isTopLeft && !isTopRight && !isBottomLeft) return null;
  const inInner = (r: number, c: number, cornerR: number, cornerC: number) => r >= cornerR + 2 && r <= cornerR + 4 && c >= cornerC + 2 && c <= cornerC + 4;
  if (isTopLeft && inInner(row, col, 0, 0)) return 'inner';
  if (isTopRight && inInner(row, col, 0, size - 7)) return 'inner';
  if (isBottomLeft && inInner(row, col, size - 7, 0)) return 'inner';
  return 'outer';
};

const renderStyledQR = async (text: string, options: any) => {
  const { lightColor, finderOuterColor, finderOuterShape, finderInnerColor, finderInnerShape, dataColor, dataShape } = options;
  const qrData = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const modules = qrData.modules;
  const moduleCount = modules.size;
  const canvasSize = 400;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = canvasSize; offCanvas.height = canvasSize;
  const ctx = offCanvas.getContext('2d')!;
  ctx.fillStyle = lightColor; ctx.fillRect(0, 0, canvasSize, canvasSize);
  const moduleSize = canvasSize / moduleCount;

  const drawFinder = (cornerRow: number, cornerCol: number) => {
    const x = cornerCol * moduleSize; const y = cornerRow * moduleSize;
    const outerSize = 7 * moduleSize; const holeSize = 5 * moduleSize; const dotSize = 3 * moduleSize;
    const cx = x + outerSize / 2; const cy = y + outerSize / 2;
    ctx.save();
    drawCenteredShape(ctx, cx, cy, outerSize, finderOuterShape, finderOuterColor);
    ctx.globalCompositeOperation = 'destination-out';
    drawCenteredShape(ctx, cx, cy, holeSize, finderOuterShape, '#000');
    ctx.restore();
    drawCenteredShape(ctx, cx, cy, dotSize, finderInnerShape, finderInnerColor);
  };

  drawFinder(0, 0); drawFinder(0, moduleCount - 7); drawFinder(moduleCount - 7, 0);

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules.get(row, col)) {
        const part = getFinderPart(row, col, moduleCount);
        if (part === null) {
          const x = col * moduleSize; const y = row * moduleSize;
          drawModuleShape(ctx, x, y, moduleSize, dataShape, dataColor);
        }
      }
    }
  }
  return offCanvas.toDataURL();
};

const drawTextOnCanvas = (ctx: CanvasRenderingContext2D, text: string, style: any, x: number, y: number, width: number, height: number) => {
  const fontSize = style.fontSize || 16;
  ctx.font = `${style.italic ? 'italic ' : ''}${style.bold ? 'bold ' : ''}${fontSize}px ${style.fontFamily || 'Arial'}`;
  ctx.fillStyle = style.color || '#000000';
  ctx.textAlign = style.alignment || 'left';
  ctx.textBaseline = 'top';
  
  let displayText = text;
  if (style.textTransform === 'uppercase') displayText = text.toUpperCase();
  else if (style.textTransform === 'lowercase') displayText = text.toLowerCase();
  else if (style.textTransform === 'capitalize') displayText = text.replace(/\b\w/g, (c: string) => c.toUpperCase());

  const words = displayText.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= width) { currentLine = testLine; } 
    else {
      if (currentLine) lines.push(currentLine);
      if (ctx.measureText(word).width > width) {
        let brokenLine = '';
        for (const char of word) {
          const testCharLine = brokenLine + char;
          if (ctx.measureText(testCharLine).width <= width) brokenLine = testCharLine;
          else { if (brokenLine) lines.push(brokenLine); brokenLine = char; }
        }
        currentLine = brokenLine;
      } else { currentLine = word; }
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = (style.lineHeight || 1.4) * fontSize;
  lines.forEach((line, i) => {
    const ty = y + i * lineHeight;
    if (ty + lineHeight > y + height) return;
    let tx = x;
    if (style.alignment === 'center') tx = x + width / 2;
    else if (style.alignment === 'right') tx = x + width;
    ctx.fillText(line, tx, ty);
  });
};

// ─── QR Preview Component for Canvas ─────────────────────────
const QRPreviewBox = ({ config, padding }: { config: any, padding: number }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let active = true;
    renderStyledQR('https://qrcodeng.com/sample', config).then((res) => {
      if (active) setUrl(res);
    });
    return () => { active = false; };
  }, [config]);

  if (!url) return <div className="w-full h-full animate-pulse bg-gray-100" />;
  return (
    <img 
      src={url} 
      className="w-full h-full object-contain pointer-events-none" 
      style={{ padding: `${padding}%` }} 
      alt="QR"
    />
  );
};

export default function DesignStudio() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [designName, setDesignName] = useState('');
  const [qrPosition, setQrPosition] = useState({ x: 125, y: 300, width: 150, height: 150 });
  const [qrPadding, setQrPadding] = useState(15);
  const [qrConfig, setQrConfig] = useState({
    lightColor: '#ffffff', finderOuterColor: '#000000', finderOuterShape: 'square',
    finderInnerColor: '#000000', finderInnerShape: 'square', dataColor: '#000000', dataShape: 'square'
  });
  const [textOverlays, setTextOverlays] = useState<any[]>([]);
  const [qrDataFields, setQrDataFields] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [selectedOverlayIndex, setSelectedOverlayIndex] = useState<number | null>(null);
  
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [fullscreenPreviewUrl, setFullscreenPreviewUrl] = useState('');

  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 400, height: 560 });

  // Load existing design if editing
  useEffect(() => {
    if (editId) {
      getDesignById(editId).then((res) => {
        const data = res.data.data;
        if (data) {
          setDesignName(data.name);
          setImagePreview(data.imageUrl);
          setQrPosition(data.qrPosition || { x: 125, y: 300, width: 150, height: 150 });
          setQrPadding(data.qrPadding || 15);
          if (data.qrConfig) setQrConfig(data.qrConfig);
          if (data.textOverlays) setTextOverlays(data.textOverlays);
          if (data.qrDataFields) setQrDataFields(data.qrDataFields);
        }
      });
    }
  }, [editId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleQrConfigChange = (key: string, value: string) => {
    setQrConfig(prev => ({ ...prev, [key]: value }));
  };

  const addTextOverlay = () => {
    const newOverlay = {
      id: `ov_${Date.now()}`,
      placeholder: '1',
      position: { x: 50, y: 50, width: 200, height: 40 },
      style: { fontSize: 16, color: '#000000', bold: false, italic: false, underline: false, alignment: 'left', fontFamily: 'Arial', textTransform: 'none', lineHeight: 1.4 },
    };
    setTextOverlays(prev => [...prev, newOverlay]);
    setSelectedOverlayIndex(textOverlays.length);
  };

  const deleteOverlay = (index: number) => {
    setTextOverlays(prev => prev.filter((_, i) => i !== index));
    setSelectedOverlayIndex(null);
  };

  const handleSave = async () => {
    if (!designName.trim()) return alert('Please provide a design name.');
    setSaving(true);
    
    try {
      // Determine the final image URL. If a new file was uploaded, convert it to Base64.
      let finalImageUrl = imagePreview;
      if (imageFile) {
        finalImageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      const img = imgRef.current;
      const rect = img ? img.getBoundingClientRect() : { width: 400, height: 560 };
      const scaleX = naturalSize.width / rect.width;
      const scaleY = naturalSize.height / rect.height;

      const data = {
        name: designName.trim(),
        imageUrl: finalImageUrl,
        qrPosition: { x: qrPosition.x * scaleX, y: qrPosition.y * scaleY, width: qrPosition.width * scaleX, height: qrPosition.height * scaleY },
        qrPadding, qrConfig, qrDataFields,
        textOverlays: textOverlays.map(ov => ({
          placeholder: ov.placeholder,
          position: { x: ov.position.x * scaleX, y: ov.position.y * scaleY, width: ov.position.width * scaleX, height: ov.position.height * scaleY },
          style: ov.style,
        }))
      };

      if (editId) {
        await updateDesign(editId, data);
        alert('Design updated successfully!');
      } else {
        const formData = new FormData();
        formData.append('name', data.name);
        if (imageFile) formData.append('image', imageFile);
        formData.append('data', JSON.stringify(data));
        await createDesign(formData);
        alert('Design saved successfully!');
      }
    } catch (err) {
      alert('Error saving design');
    } finally {
      setSaving(false);
    }
  };

  // Render live preview
  useEffect(() => {
    const renderPreview = async () => {
      if (!showPreview) return;
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;

      canvas.width = naturalSize.width; canvas.height = naturalSize.height;
      
      if (imagePreview) {
        const img = new Image(); img.src = imagePreview;
        await new Promise(resolve => { img.onload = resolve; });
        ctx.drawImage(img, 0, 0, naturalSize.width, naturalSize.height);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, naturalSize.width, naturalSize.height);
      }

      const imgElement = imgRef.current; 
      const rect = imgElement ? imgElement.getBoundingClientRect() : { width: 400, height: 560 };
      const scaleX = rect.width / naturalSize.width; 
      const scaleY = rect.height / naturalSize.height;
      
      const qrNatural = { x: qrPosition.x / scaleX, y: qrPosition.y / scaleY, width: qrPosition.width / scaleX, height: qrPosition.height / scaleY };
      const qrDataUrl = await renderStyledQR('Sample QR Code', qrConfig);
      
      if (qrDataUrl) {
        const qrImg = new Image(); qrImg.src = qrDataUrl;
        await new Promise(resolve => { qrImg.onload = resolve; });
        ctx.fillStyle = qrConfig.lightColor; ctx.fillRect(qrNatural.x, qrNatural.y, qrNatural.width, qrNatural.height);
        
        const paddingFrac = qrPadding / 100;
        const innerW = Math.round(qrNatural.width * (1 - paddingFrac * 2));
        const innerH = Math.round(qrNatural.height * (1 - paddingFrac * 2));
        const offX = Math.round((qrNatural.width - innerW) / 2); const offY = Math.round((qrNatural.height - innerH) / 2);
        
        ctx.drawImage(qrImg, qrNatural.x + offX, qrNatural.y + offY, innerW, innerH);
      }

      for (const overlay of textOverlays) {
        const naturalPos = { x: overlay.position.x / scaleX, y: overlay.position.y / scaleY, width: overlay.position.width / scaleX, height: overlay.position.height / scaleY };
        drawTextOnCanvas(ctx, overlay.placeholder || 'Text', overlay.style, naturalPos.x, naturalPos.y, naturalPos.width, naturalPos.height);
      }
    };
    renderPreview();
  }, [showPreview, imagePreview, naturalSize, qrPosition, qrPadding, qrConfig, textOverlays]);

  const shapeOptions = ['square', 'rounded', 'circle', 'diamond', 'star', 'triangle'];

  return (
   <div className={`bg-white flex flex-col transition-all ${isEditorFullscreen ? 'fixed inset-0 z-50 h-screen' : '-m-4 md:-m-8 h-[calc(100vh-4rem)]'}`}>
      {/* Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <h1 className="text-lg font-bold text-gray-900">{editId ? 'Edit Design' : 'Create Design'}</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditorFullscreen(!isEditorFullscreen)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors font-medium">
            {isEditorFullscreen ? <Minimize className="w-4 h-4"/> : <Maximize className="w-4 h-4"/>}
            {isEditorFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          </button>
          {isEditorFullscreen && (
            <button onClick={() => setShowControlsOverlay(!showControlsOverlay)} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors font-medium">
              <SlidersHorizontal className="w-4 h-4"/> {showControlsOverlay ? 'Hide Controls' : 'Show Controls'}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar Controls */}
        {(!isEditorFullscreen || showControlsOverlay) && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-5 shrink-0 shadow-sm z-10">
            <div className="space-y-6">
              
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Design Name</label>
                <input type="text" value={designName} onChange={(e) => setDesignName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#FFA45C]" placeholder="e.g., Gala Dinner Pass" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Upload Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 bg-white border border-gray-300 rounded-lg p-1" />
              </div>

              <hr className="border-gray-100" />

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">QR Code Styling</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500">Background Color</label>
                    <input type="color" value={qrConfig.lightColor} onChange={(e) => handleQrConfigChange('lightColor', e.target.value)} className="w-full h-8 p-0 border border-gray-300 rounded cursor-pointer" />
                  </div>
                  
                  {['Outer', 'Inner', 'Data'].map((type) => (
                    <div key={type} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">{type} Modules</p>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-500">Color</label>
                          <input type="color" value={(qrConfig as any)[`${type.toLowerCase()}Color`] || (type==='Data'?qrConfig.dataColor:qrConfig[`${type.toLowerCase()}Color` as keyof typeof qrConfig])} onChange={(e) => handleQrConfigChange(type === 'Data' ? 'dataColor' : type === 'Outer' ? 'finderOuterColor' : 'finderInnerColor', e.target.value)} className="w-full h-6 p-0 border border-gray-300 rounded cursor-pointer" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-500">Shape</label>
                          <select value={type === 'Data' ? qrConfig.dataShape : type === 'Outer' ? qrConfig.finderOuterShape : qrConfig.finderInnerShape} onChange={(e) => handleQrConfigChange(type === 'Data' ? 'dataShape' : type === 'Outer' ? 'finderOuterShape' : 'finderInnerShape', e.target.value)} className="w-full border border-gray-300 rounded text-xs p-1">
                            {shapeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="text-[10px] font-medium text-gray-500 flex justify-between">QR Padding <span>{qrPadding}%</span></label>
                    <input type="range" min="0" max="50" value={qrPadding} onChange={(e) => setQrPadding(Number(e.target.value))} className="w-full accent-[#FFA45C]" />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-gray-900">Text Overlays</h4>
                  <button onClick={addTextOverlay} className="text-xs bg-[#FFA45C] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-orange-400 flex items-center gap-1"><Plus className="w-3 h-3"/> Add</button>
                </div>
                <div className="space-y-2">
                  {textOverlays.map((ov, idx) => (
                    <div key={ov.id} className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">Overlay {idx + 1}</span>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedOverlayIndex(idx === selectedOverlayIndex ? null : idx)} className="text-xs text-orange-600 hover:underline">{selectedOverlayIndex === idx ? 'Hide' : 'Edit'}</button>
                          <button onClick={() => deleteOverlay(idx)} className="text-xs text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3"/></button>
                        </div>
                      </div>
                      {selectedOverlayIndex === idx && (
                        <div className="mt-2 space-y-2">
                          <input type="text" value={ov.placeholder} onChange={(e) => {
                            const newOv = [...textOverlays]; newOv[idx].placeholder = e.target.value; setTextOverlays(newOv);
                          }} className="w-full border border-gray-300 rounded px-2 py-1 text-xs" placeholder="Placeholder e.g., 1, name" />
                          <input type="number" value={ov.style.fontSize} onChange={(e) => {
                            const newOv = [...textOverlays]; newOv[idx].style.fontSize = Number(e.target.value); setTextOverlays(newOv);
                          }} className="w-full border border-gray-300 rounded px-2 py-1 text-xs" placeholder="Font Size" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowPreview(!showPreview)} className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition flex items-center justify-center gap-2">
                {showPreview ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>} {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>

            </div>
          </div>
        )}

        {/* Right Canvas Area */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-auto relative">
          
          <div 
            className="relative inline-block shadow-2xl bg-white"
            style={{ 
              width: imagePreview ? 'auto' : 400, 
              height: imagePreview ? 'auto' : 560,
              minWidth: 400, minHeight: 560 
            }}
          >
            {imagePreview ? (
              <img 
                ref={imgRef} 
                src={imagePreview} 
                alt="template" 
                className="max-h-[75vh] max-w-full object-contain block" 
                onLoad={(e) => setNaturalSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })} 
              />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center flex-col text-gray-300">
                <ImageIcon className="w-16 h-16 mb-3 opacity-20" />
                <span className="text-sm opacity-40 font-medium">Blank Canvas</span>
              </div>
            )}
            
            {/* QR Position Box */}
            <Rnd
              size={{ width: qrPosition.width, height: qrPosition.height }}
              position={{ x: qrPosition.x, y: qrPosition.y }}
              onDragStop={(e, d) => setQrPosition({ ...qrPosition, x: d.x, y: d.y })}
              onResizeStop={(e, dir, ref, delta, pos) => setQrPosition({ x: pos.x, y: pos.y, width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) })}
              bounds="parent"
              className="border-2 border-dashed border-[#FFA45C] bg-white group shadow-sm z-10"
            >
              <div className="w-full h-full relative overflow-hidden">
                <QRPreviewBox config={qrConfig} padding={qrPadding} />
                <div className="absolute inset-0 bg-[#FFA45C]/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                  <span className="bg-[#FFA45C] text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm flex items-center gap-1"><Move className="w-3 h-3"/> QR Code</span>
                </div>
              </div>
            </Rnd>

            {/* Text Overlays */}
            {textOverlays.map((ov, idx) => (
              <Rnd
                key={ov.id}
                size={{ width: ov.position.width, height: ov.position.height }}
                position={{ x: ov.position.x, y: ov.position.y }}
                onDragStop={(e, d) => { const newOv = [...textOverlays]; newOv[idx].position.x = d.x; newOv[idx].position.y = d.y; setTextOverlays(newOv); }}
                onResizeStop={(e, dir, ref, delta, pos) => { const newOv = [...textOverlays]; newOv[idx].position = { x: pos.x, y: pos.y, width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) }; setTextOverlays(newOv); }}
                bounds="parent"
                className="border border-dashed border-blue-500 bg-blue-500/10 flex items-center justify-center z-10"
              >
                <span className="text-blue-500 text-[10px] font-bold pointer-events-none">T{idx + 1}</span>
              </Rnd>
            ))}

            {/* Floating Live Preview */}
            {showPreview && (
              <div className="absolute top-4 right-4 w-48 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-40 cursor-zoom-in" onClick={() => { setFullscreenPreviewUrl(previewCanvasRef.current?.toDataURL() || ''); setFullscreenPreview(true); }}>
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[10px] font-bold text-gray-500">Live Preview</span>
                  <Maximize className="w-3 h-3 text-gray-400" />
                </div>
                <canvas ref={previewCanvasRef} className="w-full h-auto max-h-48 object-contain rounded border border-gray-100 bg-gray-50" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-end px-6 gap-3 shrink-0 z-20">
        <button className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
        <button onClick={handleSave} disabled={saving || !imagePreview} className="px-6 py-2 bg-[#FFA45C] text-white rounded-lg text-sm font-bold hover:bg-orange-400 shadow-sm disabled:opacity-50 flex items-center gap-2">
          {saving ? 'Saving...' : <><Check className="w-4 h-4"/> {editId ? 'Update Design' : 'Save Design'}</>}
        </button>
      </div>

      {/* Fullscreen Preview Modal */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setFullscreenPreview(false)}>
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setFullscreenPreview(false)} className="absolute top-2 right-2 text-white bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 z-10"><X className="w-5 h-5"/></button>
            <img src={fullscreenPreviewUrl} alt="Fullscreen preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}