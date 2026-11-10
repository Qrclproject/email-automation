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
    if (step === 2) return subject.trim() !== ''; // Only requires a subject line now
    if (step === 3) return true; // Allow proceeding even if no variables are mapped
    return false;
  };

  const handleSend = () => {
    alert('Campaign launched successfully! Redirecting to campaigns...');
    resetCampaign();
    navigate('/campaigns');
  };

  // Extract real data for the preview based on mappings
  const firstRow = excelData.length > 0 ? excelData[0] : {};
  
  const previewName = firstRow[variableMappings['{{Full Name}}']] 
                   || firstRow[variableMappings['[Recipient Name]']] 
                   || 'Valued Guest';
                   
  const previewTicket = firstRow[variableMappings['{{Ticket Type}}']] 
                     || firstRow[variableMappings['[Ticket Type]']] 
                     || 'General Admission';
                     
  const previewQr = firstRow[variableMappings['QR_CODE']] 
                 || firstRow[variableMappings['[QR_CODE]']] 
                 || 'https://qrcodeng.com/verify';
                 
  const emailColumn = variableMappings['{{Email Address}}'] || variableMappings['[Email Address]'] || 'email';
  const previewEmail = firstRow[emailColumn] || 'recipient@example.com';

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Create Campaign</h1>
          <p className="text-gray-500 text-sm">Set up your audience, design, and personalization.</p>
        </div>
        <button onClick={() => navigate('/campaigns')} className="text-sm font-medium text-gray-500 hover:text-gray-900">
          Cancel
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8 bg-white p-2 rounded-xl border border-gray-200 shadow-sm w-fit">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => setStep(s.id)}
              disabled={step < s.id && !canGoNext()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === s.id ? 'bg-[#FFA45C] text-[#2b1500]' : 
                step > s.id ? 'text-green-600 bg-green-50' : 'text-gray-400'
              }`}
            >
              {step > s.id ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : null}
              {s.name}
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="mb-8">
        {step === 1 && (excelData.length > 0 ? <SpreadsheetEditor /> : <AudienceUploader />)}
        {step === 2 && <EmailComposer />}
        {step === 3 && <VariableMapper />}
        
        {step === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                <h2 className="font-semibold text-gray-900 mb-4">Final Review</h2>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Recipients</span>
                    <span className="font-medium">{excelData.length} rows</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Sending Account</span>
                    <span className="font-medium">{senderAccount}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Template</span>
                    <span className="font-medium">{selectedTemplate?.name || 'None (Text Only)'}</span>
                  </div>
                </div>
                
                <button onClick={handleSend} className="w-full bg-[#FFA45C] text-[#2b1500] font-bold py-3 rounded-lg mb-3 hover:bg-orange-400 transition-colors shadow-sm">
                  Launch Campaign
                </button>
                <button className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  Send Test Email
                </button>
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Recipient Preview</h2>
                <p className="text-sm text-gray-500">
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
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          {step < 4 && (
            <button 
              onClick={() => setStep(Math.min(4, step + 1))}
              disabled={!canGoNext()}
              className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}