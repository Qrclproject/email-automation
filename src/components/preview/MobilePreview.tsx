import { ReactNode } from 'react';

export default function MobilePreview({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[360px] border-[10px] border-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-50 relative shrink-0">
      {/* Fake Notch */}
      <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-40 mx-auto z-20"></div>
      
      {/* Screen Content */}
      <div className="pt-8 bg-white h-full max-h-[700px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}