export default function WizardStepper({ currentStep }: { currentStep: number }) {
  const steps = ['Details', 'Account', 'Recipients', 'Template', 'Personalise', 'Subject', 'Preview', 'Send'];
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
            i < currentStep ? 'bg-green-100 text-green-700' :
            i === currentStep ? 'bg-[#FFA45C] text-[#2b1500]' : 'bg-gray-100 text-gray-400'
          }`}>
            {i < currentStep ? '✓' : i + 1}
          </div>
          <span className={`ml-2 text-sm font-medium whitespace-nowrap ${
            i === currentStep ? 'text-gray-900' : 'text-gray-500'
          }`}>{step}</span>
          {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300 mx-3"></div>}
        </div>
      ))}
    </div>
  );
}