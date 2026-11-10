import type { ReactNode } from 'react';

export default function MobilePreview({ children }: { children: ReactNode }) {
  return (
    // Scaled down max-width and border for mobile
    <div className="mx-auto w-full max-w-[320px] sm:max-w-[360px] border-[6px] sm:border-[10px] border-gray-900 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-50 relative shrink-0">
      {/* Fake Notch */}
      <div className="absolute top-0 inset-x-0 h-4 sm:h-6 bg-gray-900 rounded-b-3xl w-32 sm:w-40 mx-auto z-20"></div>
      
      {/* Screen Content */}
      <div className="pt-6 sm:pt-8 bg-white h-full max-h-[600px] overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}