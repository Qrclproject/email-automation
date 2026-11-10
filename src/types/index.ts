// --- User & Auth ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Administrator' | 'Administrator' | 'Campaign Manager' | 'Email Operator' | 'Designer' | 'Reporting Officer' | 'Viewer';
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// --- Campaigns ---
export type CampaignStatus = 'Draft' | 'Awaiting Approval' | 'Approved' | 'Scheduled' | 'Sending' | 'Paused' | 'Completed' | 'Cancelled' | 'Failed';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  sendingAccount: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  scheduledFor?: string;
  createdAt: string;
}

// --- Email Accounts ---
export interface EmailAccount {
  id: string;
  email: string;
  displayName: string;
  status: 'Connected' | 'Reconnect needed' | 'Disconnected';
  sentToday: number;
  dailyLimit: number | 'provider-defined';
  permissions: string[];
}

// --- Recipients & Contacts ---
export interface Recipient {
  id: string;
  fullName: string;
  email: string;
  eventName?: string;
  ticketType?: string;
  status: 'Pending' | 'Processing' | 'Sent' | 'Delivered' | 'Failed' | 'Bounced';
}

// --- Design Studio ---
export type ElementType = 'text' | 'qr' | 'image';

export interface StudioElement {
  id: string;
  type: ElementType;
  text?: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: number;
  qrDataField?: string; // NEW: Stores the mapped variable for QR codes
}