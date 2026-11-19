export type UserRole = 'admin' | 'coordinator' | 'data_entry';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export type SupporterStatus = 'active' | 'inactive';

export interface Supporter {
  id: string;
  fullName: string;
  phoneNumber: string;       // Normalized E.164: +254...
  rawPhone?: string;          // User input format
  course: string;
  yearOfStudy: string;       // Year 1, Year 2, Year 3, Year 4
  communicationConsent: boolean;
  consentTimestamp: string;
  registrationDate: string;
  status: SupporterStatus;
  notes?: string;
  source?: string;
}

export interface CampaignActivity {
  id: string;
  title: string;
  description: string;
  date: string;              // YYYY-MM-DD
  time: string;              // HH:MM
  venue: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  category: 'hall_meeting' | 'strategy' | 'rally' | 'outreach';
  targetAudience?: string;
  attendanceCount?: number;
  createdBy: string;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'announcement' | 'event' | 'message';
  pinned?: boolean;
}

export interface CommunicationMessage {
  id: string;
  title: string;
  message: string;
  channel: 'sms' | 'whatsapp';
  targetCourse?: string;
  targetYear?: string;
  recipientCount: number;
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
  sentAt?: string;
  createdBy: string;
}

export interface SystemSettings {
  candidateName: string;
  position: string;
  department: string;
  institution: string;
  campaignPeriod: string;
  allianceName: string;
  allianceMotto: string;
  slogan: string;
  availableCourses: string[];
  academicYears: string[];
  adminPassword?: string;
  smsProvider: {
    enabled: boolean;
    providerName: 'africastalking' | 'twilio' | 'custom_bulk_sms';
    apiKeyMasked?: string;
    senderId?: string;
    approvalStatus: 'pending_election_clearance' | 'approved' | 'disabled';
  };
}

