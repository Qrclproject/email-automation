export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext ? allowedTypes.includes(ext) : false;
};

export const validateCampaignSubject = (subject: string): string | null => {
  if (!subject.trim()) return 'Subject line is required.';
  if (subject.length > 150) return 'Subject line cannot exceed 150 characters.';
  return null; // null means valid
};