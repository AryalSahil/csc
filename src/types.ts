export type UserRole = 'customer' | 'operator' | 'superadmin';

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  branch?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CscService {
  id: string;
  name: string;
  category: 'Identity & Certificates' | 'Taxes & Revenue' | 'Utility Bills' | 'Welfare & Pensions' | 'Travel & Passports';
  fee: number;
  processingTime: string;
  requiredDocuments: string[];
  description: string;
  isActive: boolean;
}

export type ApplicationStatus =
  | 'Pending'
  | 'Documents Required'
  | 'Under Review'
  | 'Processing'
  | 'Submitted to Government Portal'
  | 'Approved'
  | 'Rejected'
  | 'Completed';

export interface UploadedFile {
  name: string;
  url: string;
  uploadedAt: string;
  version: number;
}

export interface Application {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  status: ApplicationStatus;
  trackingNumber: string;
  documents: UploadedFile[];
  finalCertificateUrl?: string;
  feesPaid: number;
  transactionId: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  operatorNotes?: string;
  operatorId?: string;
  branchId?: string;
  rating?: number;
  feedback?: string;
  feedbackDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketReply {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  description: string;
  category: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  replies: TicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface VaultDocument {
  id: string;
  customerId: string;
  name: string;
  url: string;
  category: string;
  bytes: number;
  uploadedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  managerId: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'sms' | 'whatsapp' | 'email' | 'in-app';
  status: 'sent' | 'failed' | 'delivered';
  timestamp: string;
}
