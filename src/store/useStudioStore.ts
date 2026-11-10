import { create } from 'zustand';

export type ElementType = 'text' | 'qr';

export interface StudioElement {
  id: string;
  type: ElementType;
  text?: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: number;
  qrDataFields?: string[]; 
   qrDataField?: string;// The mapped variables for the QR code
}

interface StudioState {
  elements: StudioElement[];
  selectedId: string | null;
  backgroundImage: string | null;
  designName: string;
  isPreviewMode: boolean;
  
  // QR Styling Options
  qrPadding: number;
  qrBgColor: string;
  qrDotColor: string;
  qrDotShape: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
  qrFinderOuterColor: string;
  qrFinderOuterShape: 'square' | 'extra-rounded' | 'dot';
  qrFinderInnerColor: string;
  qrFinderInnerShape: 'square' | 'dot';

  setBackgroundImage: (url: string) => void;
  setDesignName: (name: string) => void;
  setPreviewMode: (isPreview: boolean) => void;
  selectElement: (id: string | null) => void;
  addElement: (type: ElementType) => void;
  updateElement: (id: string, updates: Partial<StudioElement>) => void;
  updateQrStyle: (updates: Partial<StudioState>) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  elements: [
    { id: 'qr_1', type: 'qr', x: 130, y: 380, width: 160, fontSize: 0, color: '#000', fontFamily: '', textAlign: 'center', fontWeight: 400,  qrDataFields: ['Attendee Name', '1'], qrDataField: '{{Unique Ticket Link}}' },
    { id: 'text_1', type: 'text', text: '{{Full Name}}', x: 50, y: 200, width: 320, fontSize: 32, color: '#ffffff', fontFamily: 'serif', textAlign: 'center', fontWeight: 700 },
  ],
  selectedId: 'qr_1',
  backgroundImage: null,
  designName: 'SAMUEL & ASHLEIGH',
  isPreviewMode: false,
  
  qrPadding: 15,
  qrBgColor: '#ffffff',
  qrDotColor: '#000000',
  qrDotShape: 'square',
  qrFinderOuterColor: '#000000',
  qrFinderOuterShape: 'square',
  qrFinderInnerColor: '#000000',
  qrFinderInnerShape: 'square',

  setBackgroundImage: (url) => set({ backgroundImage: url }),
  setDesignName: (name) => set({ designName: name }),
  setPreviewMode: (isPreview) => set({ isPreviewMode: isPreview }),
  selectElement: (id) => set({ selectedId: id }),
  addElement: (type) => set((state) => {
    const newEl: StudioElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: type === 'text' ? 'New Text' : undefined,
      x: 50, y: 50, width: 150, fontSize: 20, color: '#000000', fontFamily: 'sans-serif', textAlign: 'left', fontWeight: 400,
      qrDataFields: type === 'qr' ? ['Attendee Name'] : undefined
    };
    return { elements: [...state.elements, newEl], selectedId: newEl.id };
  }),
  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
  })),
  updateQrStyle: (updates) => set((state) => ({ ...state, ...updates })),
}));