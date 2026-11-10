interface QuotaBarProps {
  email: string;
  used: number;
  limit: number | string;
}

export default function QuotaBar({ email, used, limit }: QuotaBarProps) {
  const percentage = typeof limit === 'number' ? Math.min((used / limit) * 100, 100) : 0;
  
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700 dark:text-gray-200">{email}</span>
        <span className="text-gray-500 dark:text-gray-400">{used} / {limit}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#FFA45C] rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}