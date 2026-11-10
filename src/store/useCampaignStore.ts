import { create } from 'zustand';

export interface Template {
  id: string;
  name: string;
  variables: string[]; 
  previewBg: string;
}

export const AVAILABLE_TEMPLATES: Template[] = [
  { id: 'tpl_1', name: 'Summit 10.0 VIP Invitation', variables: ['{{Full Name}}', '{{Ticket Type}}', 'QR_CODE'], previewBg: 'linear-gradient(160deg,#4f46e5,#c084fc)' },
  { id: 'tpl_2', name: 'Gala Night Reminder', variables: ['{{Full Name}}', '{{Table Number}}'], previewBg: 'linear-gradient(160deg,#be123c,#fb923c)' },
];

export const SAMPLE_BUSYBEE_EMAIL = `
  <p style="text-align: center;"><img src="https://placehold.co/200x60/ffffff/3b82f6?text=BUSYBEE+LOGO" alt="BusyBee Logo" style="max-width: 200px;" /></p>
  <hr />
  <h1><span style="color: #000000; font-size: 24px;">🎉 Your BusyBee Heritage Assignment Has Arrived!</span></h1>
  <p><br /></p>
  <p>Dear [Recipient Name],</p>
  <p><strong>It's official!</strong></p>
  <p>For the <strong>BusyBee Event Business Summit 10.0</strong>, you have been assigned to represent...</p>
  <p style="text-align: center;">🤠🤠🤠</p>
  <h2 style="text-align: center;"><span style="color: #3b82f6; font-size: 20px;">[Assigned Region]</span></h2>
  <p style="text-align: center;"><strong>Congratulations!</strong></p>
  <p>On Day 3, you'll join fellow delegates representing the Southern Region in celebrating Nigeria's rich cultural heritage.</p>
  
  <blockquote>
    <p style="margin-top: 0;"><strong>Your Mission</strong></p>
    <ul style="margin-bottom: 0;">
      <li>Wear traditional Southern attire</li>
      <li>Bring your energy</li>
      <li>Celebrate with pride</li>
      <li>Connect with delegates from every region</li>
    </ul>
  </blockquote>

  <p><strong>Remember...</strong></p>
  <p>This is more than dressing up. It's about celebrating our diversity, strengthening our unity, and creating unforgettable memories together.</p>
  <p>We can't wait to see you!</p>
  <p style="text-align: center;"><strong><span style="color: #3b82f6;">One Nation. Many Cultures. One Celebration.</span></strong></p>
  <p><br /></p>
`;

export interface CampaignState {
  step: number;
  subject: string;
  senderAccount: string;
  selectedTemplate: Template | null;
  variableMappings: Record<string, string>; 
  
  excelColumns: string[];
  excelData: Record<string, string>[];
  fileName: string | null;

  emailBody: string;
  attachments: File[];
  
  setStep: (step: number) => void;
  updateField: (field: keyof CampaignState, value: any) => void;
  setTemplate: (template: Template | null) => void;
  setMapping: (variable: string, column: string) => void;
  
  setSpreadsheetData: (cols: string[], data: Record<string, string>[], fileName: string) => void;
  updateCell: (rowIndex: number, column: string, value: string) => void;
  addRow: () => void;
  deleteRow: (rowIndex: number) => void;
  addColumn: (columnName: string) => void;
  deleteColumn: (columnName: string) => void;
  renameColumn: (oldName: string, newName: string) => void;
  fillColumn: (column: string, value: string) => void;
  clearSpreadsheet: () => void;

  setEmailBody: (body: string) => void;
  addAttachment: (file: File) => void;
  removeAttachment: (index: number) => void;
  resetCampaign: () => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  step: 1,
  subject: "You're invited to Summit 10.0!",
  senderAccount: 'events@qrcodeng.com',
  selectedTemplate: null,
  variableMappings: {},
  
  excelColumns: [],
  excelData: [],
  fileName: null,

  emailBody: '<p>Hi [Recipient Name],</p><p>You are cordially invited. Please find your personalized invitation below.</p><p><br></p><p>Best regards,<br>QRCODENG Team</p>',
  attachments: [],
  
  setStep: (step) => set({ step }),
  updateField: (field, value) => set({ [field]: value }),
  setTemplate: (template) => set({ selectedTemplate: template, variableMappings: {} }), 
  setMapping: (variable, column) => set((state) => ({
    variableMappings: { ...state.variableMappings, [variable]: column }
  })),
  
  setSpreadsheetData: (cols, data, fileName) => set({ excelColumns: cols, excelData: data, fileName }),
  
  updateCell: (rowIndex, column, value) => set((state) => {
    const newData = [...state.excelData];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    return { excelData: newData };
  }),
  
  addRow: () => set((state) => {
    const newRow = state.excelColumns.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
    return { excelData: [...state.excelData, newRow] };
  }),
  
  deleteRow: (rowIndex) => set((state) => ({
    excelData: state.excelData.filter((_, i) => i !== rowIndex)
  })),
  
  addColumn: (columnName) => set((state) => {
    if (!columnName || state.excelColumns.includes(columnName)) return state;
    const newCols = [...state.excelColumns, columnName];
    const newData = state.excelData.map(row => ({ ...row, [columnName]: '' }));
    return { excelColumns: newCols, excelData: newData };
  }),
  
  deleteColumn: (columnName) => set((state) => {
    const newCols = state.excelColumns.filter(c => c !== columnName);
    const newData = state.excelData.map(row => {
      const newRow = { ...row };
      delete newRow[columnName];
      return newRow;
    });
    return { excelColumns: newCols, excelData: newData };
  }),

  renameColumn: (oldName, newName) => set((state) => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName || oldName === trimmedNewName || state.excelColumns.includes(trimmedNewName)) return state;

    const newCols = state.excelColumns.map(c => c === oldName ? trimmedNewName : c);
    const newData = state.excelData.map(row => {
      const newRow = { ...row };
      newRow[trimmedNewName] = newRow[oldName];
      delete newRow[oldName];
      return newRow;
    });

    const newMappings = { ...state.variableMappings };
    Object.keys(newMappings).forEach(key => {
      if (newMappings[key] === oldName) newMappings[key] = trimmedNewName;
    });

    return { excelColumns: newCols, excelData: newData, variableMappings: newMappings };
  }),

  fillColumn: (column, value) => set((state) => ({
    excelData: state.excelData.map(row => ({ ...row, [column]: value }))
  })),

  clearSpreadsheet: () => set({ excelColumns: [], excelData: [], fileName: null }),
  
  setEmailBody: (body) => set({ emailBody: body }),
  addAttachment: (file) => set((state) => ({ attachments: [...state.attachments, file] })),
  removeAttachment: (index) => set((state) => ({ attachments: state.attachments.filter((_, i) => i !== index) })),
  
  resetCampaign: () => set({ 
    step: 1, subject: "You're invited to Summit 10.0!", 
    excelColumns: [], excelData: [], fileName: null,
    selectedTemplate: null, variableMappings: {}, 
    emailBody: '<p>Hi [Recipient Name],</p><p>You are cordially invited. Please find your personalized invitation below.</p><p><br></p><p>Best regards,<br>QRCODENG Team</p>', 
    attachments: [] 
  })
}));