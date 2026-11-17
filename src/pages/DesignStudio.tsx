import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createDesign, updateDesign, getDesignById } from '../services/designService';
import QRCode from 'qrcode';
import { 
  Plus, X, Maximize, Minimize, SlidersHorizontal, 
  Eye, EyeOff, Check, Trash2, Image as ImageIcon, Move, AlignCenter, Grid
} from 'lucide-react';

// ─── Shape drawing helpers ──
const drawCenteredShape = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, shape: string, color: string) => {
  ctx.fillStyle = color;
  const half = size / 2;
  switch (shape) {
    case 'circle': ctx.beginPath(); ctx.arc(cx, cy, half, 0, Math.PI * 2); ctx.fill(); break;
    case 'rounded': {
      const r = size * 0.2;
      ctx.beginPath(); ctx.moveTo(cx - half + r, cy - half); ctx.lineTo(cx + half - r, cy - half); ctx.quadraticCurveTo(cx + half, cy - half, cx + half, cy - half + r); ctx.lineTo(cx + half, cy + half - r); ctx.quadraticCurveTo(cx + half, cy + half, cx + half - r, cy + half); ctx.lineTo(cx - half + r, cy + half); ctx.quadraticCurveTo(cx - half, cy + half, cx - half, cy + half - r); ctx.lineTo(cx - half, cy - half + r); ctx.quadraticCurveTo(cx - half, cy - half, cx - half + r, cy - half); ctx.closePath(); ctx.fill(); break;
    }
    case 'diamond': ctx.beginPath(); ctx.moveTo(cx, cy - half); ctx.lineTo(cx + half, cy); ctx.lineTo(cx, cy + half); ctx.lineTo(cx - half, cy); ctx.closePath(); ctx.fill(); break;
    case 'square': default: ctx.fillRect(cx - half, cy - half, size, size);
  }
};

const drawModuleShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, shape: string, color: string) => {
  ctx.fillStyle = color;
  const half = size / 2;
  const s = size;
  switch (shape) {
    case 'circle': ctx.beginPath(); ctx.arc(x + half, y + half, half, 0, Math.PI * 2); ctx.fill(); break;
    case 'rounded': {
      const r = size * 0.25;
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + s - r, y); ctx.quadraticCurveTo(x + s, y, x + s, y + r); ctx.lineTo(x + s, y + s - r); ctx.quadraticCurveTo(x + s, y + s, x + s - r, y + s); ctx.lineTo(x + r, y + s); ctx.quadraticCurveTo(x, y + s, x, y + s - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill(); break;
    }
    case 'diamond': ctx.beginPath(); ctx.moveTo(x + half, y); ctx.lineTo(x + s, y + half); ctx.lineTo(x + half, y + s); ctx.lineTo(x, y + half); ctx.closePath(); ctx.fill(); break;
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
    ctx.save(); drawCenteredShape(ctx, cx, cy, outerSize, finderOuterShape, finderOuterColor); ctx.globalCompositeOperation = 'destination-out'; drawCenteredShape(ctx, cx, cy, holeSize, finderOuterShape, '#000'); ctx.restore(); drawCenteredShape(ctx, cx, cy, dotSize, finderInnerShape, finderInnerColor);
  };

  drawFinder(0, 0); drawFinder(0, moduleCount - 7); drawFinder(moduleCount - 7, 0);

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules.get(row, col)) {
        const part = getFinderPart(row, col, moduleCount);
        if (part === null) { const x = col * moduleSize; const y = row * moduleSize; drawModuleShape(ctx, x, y, moduleSize, dataShape, dataColor); }
      }
    }
  }
  return offCanvas.toDataURL();
};

const drawTextOnCanvas = (ctx: CanvasRenderingContext2D, text: string, style: any, x: number, y: number, width: number, height: number) => {
  // Draw background box if color is set and not transparent
  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(x, y, width, height);
  }

  const fontSize = style.fontSize || 16;
  ctx.font = `${style.italic ? 'italic ' : ''}${style.bold ? 'bold ' : ''}${fontSize}px ${style.fontFamily || 'Arial'}`;
  ctx.fillStyle = style.color || '#000000';
  ctx.textAlign = style.alignment || 'left';
  ctx.textBaseline = 'top';
  let displayText = text;
  if (style.textTransform === 'uppercase') displayText = text.toUpperCase();
  else if (style.textTransform === 'lowercase') displayText = text.toLowerCase();
  else if (style.textTransform === 'capitalize') displayText = text.replace(/\b\w/g, (c: string) => c.toUpperCase());
  const words = displayText.split(' '); const lines = []; let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= width) { currentLine = testLine; } 
    else { if (currentLine) lines.push(currentLine); currentLine = word; }
  }
  if (currentLine) lines.push(currentLine);
  const lineHeight = (style.lineHeight || 1.4) * fontSize;
  lines.forEach((line, i) => { const ty = y + i * lineHeight; if (ty + lineHeight > y + height) return; let tx = x; if (style.alignment === 'center') tx = x + width / 2; else if (style.alignment === 'right') tx = x + width; ctx.fillText(line, tx, ty); });
};

const QRPreviewBox = ({ config, padding }: { config: any, padding: number }) => {
  const [url, setUrl] = useState('');
  useEffect(() => { let active = true; renderStyledQR('https://qrcodeng.com/sample', config).then((res) => { if (active) setUrl(res); }); return () => { active = false; }; }, [config]);
  if (!url) return <div className="w-full h-full animate-pulse bg-gray-100" />;
  return <img src={url} className="w-full h-full object-contain pointer-events-none" style={{ padding: `${padding}%` }} alt="QR" />;
};

export default function DesignStudio() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [designName, setDesignName] = useState('');
  const [qrPosition, setQrPosition] = useState({ x: 125, y: 300, width: 150, height: 150 });
  const [qrPadding, setQrPadding] = useState(15);
  const [qrConfig, setQrConfig] = useState({ lightColor: '#ffffff', finderOuterColor: '#000000', finderOuterShape: 'square', finderInnerColor: '#000000', finderInnerShape: 'square', dataColor: '#000000', dataShape: 'square' });
  const [qrDataField, setQrDataField] = useState('{{Email Address}}');
  
  const [textOverlays, setTextOverlays] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [selectedOverlayIndex, setSelectedOverlayIndex] = useState<number | null>(null);
  
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [fullscreenPreviewUrl, setFullscreenPreviewUrl] = useState('');

  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 400, height: 560 });

  useEffect(() => {
    if (editId) {
      getDesignById(editId).then((res) => {
        const data = res.data.data;
        if (data) {
          setDesignName(data.name); setImagePreview(data.imageUrl); setQrPosition(data.qrPosition || { x: 125, y: 300, width: 150, height: 150 });
          setQrPadding(data.qrPadding || 15); 
          if (data.qrConfig) setQrConfig(data.qrConfig); 
          if (data.textOverlays) setTextOverlays(data.textOverlays); 
          if (data.qrDataField) setQrDataField(data.qrDataField);
        }
      });
    }
  }, [editId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleQrConfigChange = (key: string, value: string) => { setQrConfig(prev => ({ ...prev, [key]: value })); };

  const addTextOverlay = () => {
    const newOverlay = { 
      id: `ov_${Date.now()}`, 
      placeholder: 'Type here...', 
      position: { x: 50, y: 50, width: 200, height: 50 }, 
      style: { 
        fontSize: 24, 
        color: '#000000', 
        backgroundColor: 'transparent', // New property
        bold: true, 
        italic: false, 
        underline: false, 
        alignment: 'center', 
        fontFamily: 'Montserrat',
        textTransform: 'none', 
        lineHeight: 1.4 
      } 
    };
    setTextOverlays(prev => [...prev, newOverlay]); 
    setSelectedOverlayIndex(textOverlays.length);
  };

  const deleteOverlay = (index: number) => { 
    setTextOverlays(prev => prev.filter((_, i) => i !== index)); 
    setSelectedOverlayIndex(null); 
  };

  const updateOverlayStyle = (index: number, key: string, value: any) => {
    const newOv = [...textOverlays];
    newOv[index].style[key] = value;
    setTextOverlays(newOv);
  };

  const updateOverlayText = (index: number, text: string) => {
    const newOv = [...textOverlays];
    newOv[index].placeholder = text;
    setTextOverlays(newOv);
  };

  const centerElement = (type: 'qr' | 'text', index?: number) => {
    const canvasWidth = imgRef.current?.getBoundingClientRect().width || 400;
    if (type === 'qr') {
      const newX = (canvasWidth - qrPosition.width) / 2;
      setQrPosition({ ...qrPosition, x: newX });
    } else if (type === 'text' && index !== undefined) {
      const newOv = [...textOverlays];
      newOv[index].position.x = (canvasWidth - newOv[index].position.width) / 2;
      setTextOverlays(newOv);
    }
  };

  const handleSave = async () => {
    if (!designName.trim()) return alert('Please provide a design name.');
    setSaving(true);
    try {
      const img = imgRef.current;
      const rect = img ? img.getBoundingClientRect() : { width: 400, height: 560 };
      const scaleX = naturalSize.width / rect.width;
      const scaleY = naturalSize.height / rect.height;
      
      const data = { 
        name: designName.trim(), 
        ...(imageFile ? {} : { imageUrl: imagePreview }), 
        qrPosition: { x: qrPosition.x * scaleX, y: qrPosition.y * scaleY, width: qrPosition.width * scaleX, height: qrPosition.height * scaleY }, 
        qrPadding, 
        qrConfig, 
        qrDataField,
        textOverlays: textOverlays.map(ov => ({ placeholder: ov.placeholder, position: { x: ov.position.x * scaleX, y: ov.position.y * scaleY, width: ov.position.width * scaleX, height: ov.position.height * scaleY }, style: ov.style })) 
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
      
      navigate('/templates');
    } catch (err) { 
      console.error(err);
      alert('Error saving design'); 
    } finally { 
      setSaving(false); 
    }
  };

  useEffect(() => {
    const renderPreview = async () => {
      if (!showPreview) return; const canvas = previewCanvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d')!;
      canvas.width = naturalSize.width; canvas.height = naturalSize.height;
      if (imagePreview) { const img = new Image(); img.src = imagePreview; await new Promise(resolve => { img.onload = resolve; }); ctx.drawImage(img, 0, 0, naturalSize.width, naturalSize.height); } else { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, naturalSize.width, naturalSize.height); }
      const imgElement = imgRef.current; const rect = imgElement ? imgElement.getBoundingClientRect() : { width: 400, height: 560 }; const scaleX = rect.width / naturalSize.width; const scaleY = rect.height / naturalSize.height;
      const qrNatural = { x: qrPosition.x / scaleX, y: qrPosition.y / scaleY, width: qrPosition.width / scaleX, height: qrPosition.height / scaleY };
      const qrDataUrl = await renderStyledQR('Sample QR Code', qrConfig);
      if (qrDataUrl) { const qrImg = new Image(); qrImg.src = qrDataUrl; await new Promise(resolve => { qrImg.onload = resolve; }); ctx.fillStyle = qrConfig.lightColor; ctx.fillRect(qrNatural.x, qrNatural.y, qrNatural.width, qrNatural.height); const paddingFrac = qrPadding / 100; const innerW = Math.round(qrNatural.width * (1 - paddingFrac * 2)); const innerH = Math.round(qrNatural.height * (1 - paddingFrac * 2)); const offX = Math.round((qrNatural.width - innerW) / 2); const offY = Math.round((qrNatural.height - innerH) / 2); ctx.drawImage(qrImg, qrNatural.x + offX, qrNatural.y + offY, innerW, innerH); }
      for (const overlay of textOverlays) { const naturalPos = { x: overlay.position.x / scaleX, y: overlay.position.y / scaleY, width: overlay.position.width / scaleX, height: overlay.position.height / scaleY }; drawTextOnCanvas(ctx, overlay.placeholder || 'Text', overlay.style, naturalPos.x, naturalPos.y, naturalPos.width, naturalPos.height); }
    };
    renderPreview();
  }, [showPreview, imagePreview, naturalSize, qrPosition, qrPadding, qrConfig, textOverlays]);

  const shapeOptions = ['square', 'rounded', 'circle', 'diamond', 'star', 'triangle'];
  const fontOptions = ['Montserrat', 'Inter', 'Playfair Display', 'Roboto', 'Lora', 'Oswald', 'Dancing Script', 'Cinzel', 'Arial', 'Georgia', 'Courier New', 'Times New Roman'];

  return (
    <div className={`bg-white dark:bg-gray-900 flex flex-col transition-all ${isEditorFullscreen ? 'fixed inset-0 z-50 h-screen' : '-m-4 md:-m-8 h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]'}`}>
      
      {/* Header */}
      <div className="h-auto md:h-14 py-2 md:py-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 shrink-0 gap-2 transition-colors">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden md:block">{editId ? 'Edit Design' : 'Create Design'}</h1>
        
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
           <button onClick={() => setShowGrid(!showGrid)} className={`flex-1 md:flex-none text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${showGrid ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
             <Grid className="w-4 h-4"/> Grid
           </button>
           <button onClick={() => setShowControlsOverlay(!showControlsOverlay)} className="md:hidden flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium">
             <SlidersHorizontal className="w-4 h-4"/> {showControlsOverlay ? 'Hide' : 'Controls'}
           </button>
           <button onClick={() => setIsEditorFullscreen(!isEditorFullscreen)} className="flex-1 md:flex-none text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium">
             {isEditorFullscreen ? <Minimize className="w-4 h-4"/> : <Maximize className="w-4 h-4"/>}
             {isEditorFullscreen ? 'Exit' : 'Fullscreen'}
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Sidebar Controls */}
        {(!isEditorFullscreen || showControlsOverlay || true) && (
          <div className={`
            w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-5 shrink-0 shadow-sm z-20 transition-colors
            ${showControlsOverlay ? 'absolute inset-0 z-50 block h-full' : 'hidden md:block'}
          `}>
            {showControlsOverlay && (
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h2 className="font-bold text-gray-900 dark:text-white">Settings</h2>
                <button onClick={() => setShowControlsOverlay(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><X className="w-5 h-5"/></button>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Design Name</label>
                <input type="text" value={designName} onChange={(e) => setDesignName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm focus:ring-[#FFA45C]" placeholder="e.g., Gala Dinner Pass" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Upload Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 dark:file:bg-orange-900/30 dark:file:text-orange-400 hover:file:bg-orange-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-1 text-gray-900 dark:text-white transition-colors" />
              </div>
              
              <hr className="border-gray-100 dark:border-gray-700" />
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">QR Code Styling</h4>
                  <button onClick={() => centerElement('qr')} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded"><AlignCenter className="w-3 h-3"/> Center</button>
                </div>
                <div className="space-y-3">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                    <label className="text-xs font-bold text-gray-900 dark:text-white mb-1 block">Dynamic Data to Encode</label>
                    <select value={qrDataField} onChange={(e) => setQrDataField(e.target.value)} className="w-full border border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded p-2 text-sm font-medium focus:ring-[#FFA45C]">
                      <option value="{{Email Address}}">Email Address (Recommended)</option>
                      <option value="{{Full Name}}">Full Name</option>
                      <option value="{{Ticket ID}}">Ticket ID</option>
                      <option value="https://qrcodeng.com">Static Link (Same for everyone)</option>
                    </select>
                    <p className="text-[10px] text-gray-500 mt-2">This data will be scanned at the door.</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Background Color</label>
                    <input type="color" value={qrConfig.lightColor} onChange={(e) => handleQrConfigChange('lightColor', e.target.value)} className="w-full h-8 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700" />
                  </div>
                  {['Outer', 'Inner', 'Data'].map((type) => (
                    <div key={type} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{type} Modules</p>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-500 dark:text-gray-400">Color</label>
                          <input type="color" value={(qrConfig as any)[`${type.toLowerCase()}Color`] || (type==='Data'?qrConfig.dataColor:qrConfig[`${type.toLowerCase()}Color` as keyof typeof qrConfig])} onChange={(e) => handleQrConfigChange(type === 'Data' ? 'dataColor' : type === 'Outer' ? 'finderOuterColor' : 'finderInnerColor', e.target.value)} className="w-full h-6 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-500 dark:text-gray-400">Shape</label>
                          <select value={type === 'Data' ? qrConfig.dataShape : type === 'Outer' ? qrConfig.finderOuterShape : qrConfig.finderInnerShape} onChange={(e) => handleQrConfigChange(type === 'Data' ? 'dataShape' : type === 'Outer' ? 'finderOuterShape' : 'finderInnerShape', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-xs p-1">
                            {shapeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 flex justify-between">QR Padding <span>{qrPadding}%</span></label>
                    <input type="range" min="0" max="50" value={qrPadding} onChange={(e) => setQrPadding(Number(e.target.value))} className="w-full accent-[#FFA45C]" />
                  </div>
                </div>
              </div>
              
              <hr className="border-gray-100 dark:border-gray-700" />
              
              {/* TEXT OVERLAYS SECTION */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Text Overlays</h4>
                  <button onClick={addTextOverlay} className="text-xs bg-[#FFA45C] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-orange-400 flex items-center gap-1"><Plus className="w-3 h-3"/> Add</button>
                </div>
                <div className="space-y-3">
                  {textOverlays.map((ov, idx) => (
                    <div key={ov.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate pr-2">{ov.placeholder || 'Text Overlay'}</span>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => centerElement('text', idx)} className="text-blue-600 hover:text-blue-800" title="Center Horizontally"><AlignCenter className="w-3 h-3"/></button>
                          <button onClick={() => setSelectedOverlayIndex(idx === selectedOverlayIndex ? null : idx)} className="text-xs text-orange-600 dark:text-orange-400 hover:underline">{selectedOverlayIndex === idx ? 'Close' : 'Edit'}</button>
                          <button onClick={() => deleteOverlay(idx)} className="text-xs text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3"/></button>
                        </div>
                      </div>
                      
                      {selectedOverlayIndex === idx && (
                        <div className="mt-3 space-y-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div>
                            <label className="text-[10px] font-medium text-gray-500">Text Content</label>
                            <input type="text" value={ov.placeholder} onChange={(e) => updateOverlayText(idx, e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1 text-xs" placeholder="Type here..." />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-medium text-gray-500">Font</label>
                              <select value={ov.style.fontFamily} onChange={(e) => updateOverlayStyle(idx, 'fontFamily', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1 text-xs">
                                {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-medium text-gray-500">Text Color</label>
                              <input type="color" value={ov.style.color} onChange={(e) => updateOverlayStyle(idx, 'color', e.target.value)} className="w-full h-7 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700" />
                            </div>
                            <div>
                              <label className="text-[10px] font-medium text-gray-500">Bg Box</label>
                              <input type="color" value={ov.style.backgroundColor === 'transparent' ? '#ffffff' : ov.style.backgroundColor} onChange={(e) => updateOverlayStyle(idx, 'backgroundColor', e.target.value)} className="w-full h-7 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700" />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-gray-500 flex justify-between mb-1">
                              <span>Font Size</span>
                              <span>{ov.style.fontSize}px</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input type="range" min="8" max="120" value={ov.style.fontSize} onChange={(e) => updateOverlayStyle(idx, 'fontSize', Number(e.target.value))} className="flex-1 accent-[#FFA45C]" />
                              <input type="number" min="8" max="120" value={ov.style.fontSize} onChange={(e) => updateOverlayStyle(idx, 'fontSize', Number(e.target.value))} className="w-14 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-1 py-1 text-xs text-center" />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-gray-500">Alignment</label>
                            <div className="flex gap-1 mt-1">
                              <button onClick={() => updateOverlayStyle(idx, 'alignment', 'left')} className={`flex-1 py-1 text-xs rounded border ${ov.style.alignment === 'left' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>Left</button>
                              <button onClick={() => updateOverlayStyle(idx, 'alignment', 'center')} className={`flex-1 py-1 text-xs rounded border ${ov.style.alignment === 'center' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>Center</button>
                              <button onClick={() => updateOverlayStyle(idx, 'alignment', 'right')} className={`flex-1 py-1 text-xs rounded border ${ov.style.alignment === 'right' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>Right</button>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button onClick={() => updateOverlayStyle(idx, 'bold', !ov.style.bold)} className={`flex-1 py-1 text-xs font-bold rounded border ${ov.style.bold ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>B</button>
                            <button onClick={() => updateOverlayStyle(idx, 'italic', !ov.style.italic)} className={`flex-1 py-1 text-xs italic rounded border ${ov.style.italic ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>I</button>
                            <button onClick={() => updateOverlayStyle(idx, 'textTransform', ov.style.textTransform === 'uppercase' ? 'none' : 'uppercase')} className={`flex-1 py-1 text-xs rounded border ${ov.style.textTransform === 'uppercase' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>AA</button>
                          </div>
                          
                          {/* Option to remove background */}
                          <button onClick={() => updateOverlayStyle(idx, 'backgroundColor', 'transparent')} className="w-full mt-2 text-[10px] text-gray-500 hover:text-gray-700 underline text-center">Remove Background Box</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowPreview(!showPreview)} className="w-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center justify-center gap-2 mt-6">
                {showPreview ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>} {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>
        )}

        {/* Right Canvas Area */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 md:p-8 overflow-auto relative transition-colors w-full">
          
          <div 
            className={`relative inline-block shadow-2xl bg-white dark:bg-gray-800 max-w-full ${!imagePreview ? 'w-full max-w-[400px]' : ''}`}
            style={{ 
              width: imagePreview ? 'auto' : '100%',
              height: imagePreview ? 'auto' : 'auto',
              aspectRatio: imagePreview ? 'auto' : '400/560',
            }}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 z-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(to right, rgba(150,150,150,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(150,150,150,0.2) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            )}

            {imagePreview ? (
              <img ref={imgRef} src={imagePreview} alt="template" className="max-h-[70vh] md:max-h-[75vh] max-w-full object-contain block relative z-10" onLoad={(e) => setNaturalSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })} />
            ) : (
              <div className="w-full h-full bg-white dark:bg-gray-800 flex items-center justify-center flex-col text-gray-300 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg relative z-10">
                <ImageIcon className="w-12 h-12 md:w-16 md:h-16 mb-3 opacity-20" />
                <span className="text-xs md:text-sm opacity-40 font-medium">Blank Canvas</span>
              </div>
            )}
            
            {/* QR Position Box */}
            <Rnd 
              size={{ width: qrPosition.width, height: qrPosition.height }} 
              position={{ x: qrPosition.x, y: qrPosition.y }} 
              onDragStop={(_e, d) => setQrPosition({ ...qrPosition, x: d.x, y: d.y })} 
              onResizeStop={(_e, _dir, ref, _delta, pos) => setQrPosition({ x: pos.x, y: pos.y, width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) })} 
              bounds="parent" 
              dragGrid={[5, 5]}
              resizeGrid={[5, 5]}
              className="border-2 border-dashed border-[#FFA45C] bg-white group shadow-sm z-20"
            >
              <div className="w-full h-full relative overflow-hidden">
                <QRPreviewBox config={qrConfig} padding={qrPadding} />
                <div className="absolute inset-0 bg-[#FFA45C]/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                  <span className="bg-[#FFA45C] text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm flex items-center gap-1"><Move className="w-3 h-3"/> QR</span>
                </div>
              </div>
            </Rnd>

            {/* Text Overlays */}
            {textOverlays.map((ov, idx) => (
              <Rnd 
                key={ov.id} 
                size={{ width: ov.position.width, height: ov.position.height }} 
                position={{ x: ov.position.x, y: ov.position.y }} 
                onDragStop={(_e, d) => { const newOv = [...textOverlays]; newOv[idx].position.x = d.x; newOv[idx].position.y = d.y; setTextOverlays(newOv); }} 
                onResizeStop={(_e, _dir, ref, _delta, pos) => { const newOv = [...textOverlays]; newOv[idx].position = { x: pos.x, y: pos.y, width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) }; setTextOverlays(newOv); }} 
                bounds="parent" 
                dragGrid={[5, 5]}
                resizeGrid={[5, 5]}
                className={`border border-dashed flex items-center justify-center z-20 ${selectedOverlayIndex === idx ? 'border-blue-500 bg-blue-500/10' : 'border-transparent'}`}
              >
                {/* ACTUAL TEXT RENDERING WITH STYLES AND BACKGROUND */}
                <div 
                  className="w-full h-full overflow-hidden flex pointer-events-none p-1"
                  style={{
                    fontSize: `${ov.style.fontSize}px`,
                    color: ov.style.color,
                    fontFamily: ov.style.fontFamily,
                    fontWeight: ov.style.bold ? 'bold' : 'normal',
                    fontStyle: ov.style.italic ? 'italic' : 'normal',
                    textDecoration: ov.style.underline ? 'underline' : 'none',
                    textTransform: ov.style.textTransform,
                    textAlign: ov.style.alignment,
                    lineHeight: ov.style.lineHeight,
                    wordBreak: 'break-word',
                    backgroundColor: ov.style.backgroundColor || 'transparent'
                  }}
                >
                  <div className="w-full">{ov.placeholder}</div>
                </div>
              </Rnd>
            ))}
          </div>
        </div>

        {/* Floating Live Preview */}
        {showPreview && (
          <div className="hidden md:block fixed bottom-24 right-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 z-40 cursor-zoom-in hover:scale-105 transition-transform" onClick={() => { setFullscreenPreviewUrl(previewCanvasRef.current?.toDataURL() || ''); setFullscreenPreview(true); }}>
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Live Preview</span>
              <Maximize className="w-3 h-3 text-gray-400" />
            </div>
            <canvas ref={previewCanvasRef} className="w-full h-auto max-h-48 object-contain rounded border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end px-4 md:px-6 gap-3 shrink-0 z-30 transition-colors">
        <button onClick={() => navigate('/templates')} className="px-4 md:px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving || !imagePreview} className="px-4 md:px-6 py-2 bg-[#FFA45C] text-white rounded-lg text-sm font-bold hover:bg-orange-400 shadow-sm disabled:opacity-50 flex items-center gap-2 transition-colors">
          {saving ? 'Saving...' : <><Check className="w-4 h-4"/> Save</>}
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