import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input 
        className={`w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`} 
        {...props} 
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};