import { useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useCampaignStore, AVAILABLE_TEMPLATES, SAMPLE_BUSYBEE_EMAIL } from '../../store/useCampaignStore';
import { useAccountStore } from '../../store/useAccountStore';
import { Paperclip, Trash2, LayoutTemplate, BoxSelect, FileText, AlertCircle } from 'lucide-react';

export default function EmailComposer() {
  const { 
    selectedTemplate, setTemplate, subject, updateField, senderAccount, 
    emailBody, setEmailBody, attachments, addAttachment, removeAttachment 
  } = useCampaignStore();
  
  const { accounts } = useAccountStore();
  const availableAccounts = accounts.filter(
    (acc) => acc.status === 'connected' && acc.permissions.send
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addAttachment(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const insertHtmlAtCursor = (html: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
      quill.clipboard.dangerouslyPasteHTML(range.index, html, 'user');
    }
  };

  const handleInsertTemplate = (tplId: string) => {
    const tpl = AVAILABLE_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;
    setTemplate(tpl);
    
    const placeholderHtml = `
      <p>
        <img 
          src="https://via.placeholder.com/600x200/f3f4f6/4b5563?text=Design+Template+Attached" 
          data-template-id="${tpl.id}" 
          alt="Template Placeholder" 
          style="width: 100%; max-width: 400px; display: block; margin: 20px auto; border-radius: 8px; border: 2px dashed #d1d5db;" 
        />
      </p><p><br></p>
    `;
    insertHtmlAtCursor(placeholderHtml);
  };

  const handleInsertCallout = () => {
    const calloutHtml = `
      <blockquote>
        <p style="margin-top: 0;"><strong>Your Mission</strong></p>
        <ul style="margin-bottom: 0;">
          <li>Wear traditional Southern attire</li>
          <li>Bring your energy</li>
          <li>Celebrate with pride</li>
          <li>Connect with delegates from every region</li>
        </ul>
      </blockquote>
    `;
    insertHtmlAtCursor(calloutHtml);
  };

  const loadBusyBeeSample = () => {
    setEmailBody(SAMPLE_BUSYBEE_EMAIL);
    updateField('subject', '🎉 Your BusyBee Heritage Assignment Has Arrived!');
    setTemplate(null); 
  };

  const modules = {
    toolbar: [
      [{ 'font': ['', 'serif', 'monospace'] }], 
      [{ 'size': ['small', false, 'large', 'huge'] }], 
      ['bold', 'italic', 'underline', 'strike'], 
      [{ 'color': [] }, { 'background': [] }], 
      [{ 'align': [] }], 
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }], 
      ['blockquote', 'code-block'], 
      ['link', 'image'], 
      ['clean'] 
    ],
    history: { delay: 1000, maxStack: 100, userOnly: true }
  };

  const formats = [
    'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'align', 'list', 'indent',
    'blockquote', 'code-block', 'link', 'image'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Sidebar */}
      <div className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-fit space-y-6 transition-colors">
        
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Email Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Line</label>
              <input type="text" value={subject} onChange={(e) => updateField('subject', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm focus:ring-[#FFA45C] focus:border-[#FFA45C]" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sending Account</label>
              {availableAccounts.length === 0 ? (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0" /> 
                  <span>No eligible accounts found.</span>
                </div>
              ) : (
                <select value={senderAccount} onChange={(e) => updateField('senderAccount', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm focus:ring-[#FFA45C]">
                  {availableAccounts.map((acc) => (
                    <option key={acc.id} value={acc.email}>{acc.email} ({acc.sentToday}/{acc.dailyLimit} used)</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><LayoutTemplate className="w-4 h-4 text-[#FFA45C]" /> Insert Elements</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Design Template</label>
            <select onChange={(e) => handleInsertTemplate(e.target.value)} value={selectedTemplate?.id || ''} className="w-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-[#FFA45C]">
              <option value="">-- Insert Template --</option>
              {AVAILABLE_TEMPLATES.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Content Blocks</label>
            <button onClick={handleInsertCallout} className="w-full flex items-center justify-center gap-2 py-2 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition">
              <BoxSelect className="w-4 h-4" /> Insert Callout Box
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Sample Emails</h3>
          <button onClick={loadBusyBeeSample} className="w-full text-left px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#FFA45C] dark:hover:border-[#FFA45C] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition group">
            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#FFA45C]">BusyBee Heritage</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Complex layout with callout box</p>
          </button>
        </div>
      </div>

      {/* Right Editor Area */}
      <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-[500px] transition-colors">
        <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 px-2">Message Body</span>
          <div className="flex gap-2">
             <input type="file" ref={fileInputRef} onChange={handleAttachment} className="hidden" />
             <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition" title="Attach File">
                <Paperclip className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          <ReactQuill 
            ref={quillRef}
            theme="snow" 
            value={emailBody} 
            onChange={setEmailBody} 
            modules={modules} 
            formats={formats}
            className="flex-1 border-none text-sm dark:text-white" 
            style={{ display: 'flex', flexDirection: 'column' }} 
          />
        </div>

        {attachments.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Attachments</h4>
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg text-sm text-gray-900 dark:text-gray-200">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeAttachment(idx)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}