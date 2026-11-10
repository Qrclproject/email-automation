import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import MobilePreview from './MobilePreview';
import BlockedImagesView from './BlockedImagesView';

interface PreviewProps {
  subject: string;
  recipientName: string;
  recipientEmail: string;
  senderEmail: string;
  emailBody: string; 
  templateBg?: string;
  mappedTicket?: string;
  qrData?: string;
  variableMappings: Record<string, string>; 
  previewRow: Record<string, string>;       
}

export default function GmailPreview({ 
  subject, recipientName, recipientEmail, senderEmail,
  emailBody, templateBg,
  mappedTicket = 'VIP', qrData = 'https://example.com/qr',
  variableMappings, previewRow
}: PreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'blocked'>('desktop');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(qrData, { margin: 1, width: 200, color: { dark: '#000000', light: '#ffffff' } })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('Failed to generate QR code', err));
  }, [qrData]);

  const processEmailBody = (html: string) => {
    if (!html) return '<p class="text-gray-400 italic">No content.</p>';
    let processed = html;
    Object.entries(variableMappings).forEach(([key, columnName]) => {
      const value = previewRow[columnName] || '';
      processed = processed.split(key).join(value);
    });

    let renderedTemplate = '';
    if (templateBg) {
      renderedTemplate = `
        <div style="background: ${templateBg}; color: white; padding: 40px 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-family: serif; max-width: 100%;">
          <p style="font-size: 12px; opacity: 0.8; letter-spacing: 2px;">YOU ARE INVITED</p>
          <h2 style="font-size: 28px; margin: 10px 0; font-weight: bold;">${recipientName}</h2>
          <p style="font-size: 16px; margin-bottom: 30px; background: rgba(255,255,255,0.2); display: inline-block; padding: 4px 12px; border-radius: 20px;">${mappedTicket}</p>
          ${qrCodeUrl ? `
            <div style="background: white; padding: 10px; display: inline-block; border-radius: 8px;">
              <img src="${qrCodeUrl}" alt="QR Code" style="width: 120px; height: 120px; display: block;" />
            </div>
          ` : ''}
        </div>
      `;
    }
    processed = processed.replace(/<img[^>]*data-template-id="[^"]*"[^>]*>/g, renderedTemplate);
    return processed;
  };

  const EmailHeader = () => (
    <div className="p-4 sm:p-6 border-b border-gray-100 bg-[#f8f9fa]">
      <h2 className="text-lg sm:text-xl font-normal text-gray-900 mb-4 sm:mb-6">{subject}</h2>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFA45C] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shrink-0">Q</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm text-gray-900 truncate">QRCODENG Events</span>
              <span className="text-xs text-gray-500 truncate">&lt;{senderEmail}&gt;</span>
            </div>
            <span className="text-xs text-gray-500">10:42 AM</span>
          </div>
          <div className="text-xs text-gray-500 truncate">to {recipientName} &lt;{recipientEmail}&gt;</div>
        </div>
      </div>
    </div>
  );

  const EmailFooter = () => (
    <div className="p-4 border-t border-gray-100 bg-[#f8f9fa] text-center">
      <p className="text-xs text-gray-500">Sent by QRCODE Enterprise · <button className="underline">Unsubscribe</button></p>
    </div>
  );

  const EmailContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div 
      className={`w-full ${isMobile ? 'p-4' : 'max-w-[600px] p-4 sm:p-8'} bg-white rounded-lg rendered-email overflow-hidden break-words`}
      style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.6', color: '#333333' }}
      dangerouslySetInnerHTML={{ __html: processEmailBody(emailBody) }}
    />
  );

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex gap-1 sm:gap-2 mb-4 justify-center bg-gray-100 p-1 rounded-lg w-full max-w-sm mx-auto overflow-x-auto">
        {['desktop', 'mobile', 'blocked'].map((mode) => (
          <button 
            key={mode} 
            onClick={() => setViewMode(mode as any)} 
            className={`flex-1 px-2 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium capitalize transition whitespace-nowrap ${
              viewMode === mode ? 'bg-[#FFA45C] text-[#2b1500] shadow-sm' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {mode === 'blocked' ? 'Images Blocked' : mode}
          </button>
        ))}
      </div>

      {viewMode === 'mobile' ? (
        <MobilePreview>
          <EmailHeader />
          <div className="bg-gray-50 flex justify-center py-4">
            <EmailContent isMobile={true} />
          </div>
          <EmailFooter />
        </MobilePreview>
      ) : viewMode === 'blocked' ? (
        <div className="bg-gray-50 p-4 rounded-xl w-full max-w-2xl">
          <BlockedImagesView recipientName={recipientName} />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden w-full max-w-2xl">
          <EmailHeader />
          <div className="bg-gray-50 p-4 sm:p-6 min-h-[400px] flex justify-center">
            <EmailContent />
          </div>
          <EmailFooter />
        </div>
      )}
    </div>
  );
}