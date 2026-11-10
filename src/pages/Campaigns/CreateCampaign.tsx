import { useCampaignStore } from '../../store/useCampaignStore';
import AudienceUploader from '../../components/campaign/AudienceUploader';
import SpreadsheetEditor from '../../components/campaign/SpreadsheetEditor';
import EmailComposer from '../../components/campaign/EmailComposer';
import VariableMapper from '../../components/campaign/VariableMapper';
import GmailPreview from '../../components/preview/GmailPreview';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateCampaign() {
  const { 
    step, setStep, subject, senderAccount, selectedTemplate, 
    variableMappings, excelData, resetCampaign, emailBody
  } = useCampaignStore();
  
  const navigate = useNavigate();

  const steps = [
    { id: 1, name: 'Audience Data' },
    { id: 2, name: 'Compose Email' },
    { id: 3, name: 'Map Variables' },
    { id: 4, name: 'Review & Send' }
  ];

  const canGoNext = () => {
    if (step === 1) return excelData.length > 0;
    if (step === 2) return subject.trim() !== '';
    if (step === 3) return true;
    return false;
  };

  const handleSend = () => {
    alert('Campaign launched successfully! Redirecting to campaigns...');
    resetCampaign();
    navigate('/campaigns');
  };

  const firstRow = excelData.length > 0 ? excelData[0] : {};
  
  const previewName = firstRow[variableMappings['{{Full Name}}']] 
                   || firstRow[variableMappings['[Recipient Name]']] 
                   || 'Valued Guest';
                   
  const previewTicket = firstRow[variableMappings['{{Ticket Type}}']] 
                     || firstRow[variableMappings['[Ticket Type]']] 
                     || 'General Admission';
                     
  const previewQr = firstRow[variableMappings['QR_CODE']] 
                 || firstRow[variableMappings['[QR Code]']] 
                 || 'https://qrcodeng.com/verify';
                 
  const emailColumn = variableMappings['{{Email Address}}'] || variableMappings['[Email Address]'] || 'email';
  const previewEmail = firstRow[emailColumn] || 'recipient@example.com';

  return (
    <div className="max-w-7xl mx-auto pb-12 w-full overflow-hidden">
      {/* Stacks vertically on mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Campaign</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Set up your audience, design, and personalization.</p>
        </div>
        <button onClick={() => navigate('/campaigns')} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white">
          Cancel
        </button>
      </div>

      {/* Responsive Stepper - Horizontally scrollable */}
      <div className="flex items-center gap-2 mb-6 md:mb-8 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto w-full whitespace-nowrap hide-scrollbar">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center shrink-0">
            <button
              onClick={() => setStep(s.id)}
              disabled={step < s.id && !canGoNext()}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                step === s.id ? 'bg-[#FFA45C] text-[#2b1500]' : 
                step > s.id ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {step > s.id ? <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 inline mr-1" /> : null}
              {s.name}
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-1" />}
          </div>
        ))}
      </div>

      <div className="mb-8 w-full">
        {step === 1 && (excelData.length > 0 ? <SpreadsheetEditor /> : <AudienceUploader />)}
        {step === 2 && <EmailComposer />}
        {step === 3 && <VariableMapper />}
        
        {step === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="col-span-1">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-24 transition-colors">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Final Review</h2>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Recipients</span>
                    <span className="font-medium text-gray-900 dark:text-white">{excelData.length} rows</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Sending Account</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{senderAccount}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Template</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedTemplate?.name || 'None'}</span>
                  </div>
                </div>
                
                <button onClick={handleSend} className="w-full bg-[#FFA45C] text-[#2b1500] font-bold py-3 rounded-lg mb-3 hover:bg-orange-400 transition-colors shadow-sm">
                  Launch Campaign
                </button>
                <button className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  Send Test Email
                </button>
              </div>
            </div>
            
            <div className="col-span-1 lg:col-span-2 w-full max-w-full overflow-hidden">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recipient Preview</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing data from Row 1: <strong>{previewName}</strong>
                </p>
              </div>
              
              <GmailPreview 
                subject={subject}
                recipientName={previewName}
                recipientEmail={previewEmail}
                senderEmail={senderAccount}
                emailBody={emailBody} 
                templateBg={selectedTemplate?.previewBg}
                mappedTicket={previewTicket}
                qrData={previewQr}
                variableMappings={variableMappings}
                previewRow={firstRow}
              />
            </div>
          </div>
        )}
      </div>

      {step !== 1 && (
        <div className="flex justify-between items-center mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          {step < 4 && (
            <button 
              onClick={() => setStep(Math.min(4, step + 1))}
              disabled={!canGoNext()}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}