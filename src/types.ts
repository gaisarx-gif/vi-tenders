export type DataSource = 'PDF_ANALYSIS' | 'EXCEL_IMPORT' | 'MANUAL_ENTRY';
export type TenderStatus = 'New Tender' | 'Postponed' | 'Re-announcement' | 'Advance Notice';

export interface Tender {
  id: string;
  issueId: string;
  issueNumber: string;
  organizationName: string;
  organizationNameAr: string;
  organizationNameEn: string;
  tenderNo: string;
  description: string;
  publishingDate: string;
  closingDate: string;
  pretenderMeeting: string;
  source: string;
  page: number | string;
  status: string;
  statusAr: string;
  statusEn: string;
  createdAt: number;
  dataSource: DataSource;
  documents?: { name: string; url: string; size: string }[];
  watchlisted?: boolean;
  watchlistClassification?: 'Direct' | 'Subcontractor';
  alertDate?: string;
  statusHistory?: { status: string; date: number }[];
}

export interface Subscription {
  id: string;
  userId: string;
  targetId: string;
  type: 'tender' | 'organization';
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_change' | 'new_tender' | 'calendar_event';
  tenderId?: string;
  eventId?: string;
  read: boolean;
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  date: string;
  purpose: 'follow_up' | 'meeting' | 'other';
  tenderNo?: string;
  organizationName?: string;
  description: string;
  createdAt: number;
}

export interface Company {
  id: string;
  nameAr: string;
  nameEn: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  category?: string;
  notes?: string;
  createdAt: number;
}

export interface TenderIssue {
  id: string;
  issueNumber: string;
  date: string;
  createdAt: number;
}

export interface User {
  employeeId: string;
  role: 'admin' | 'user';
  firebaseToken?: string;
}

export type SortConfig = {
  key: keyof Tender;
  direction: 'asc' | 'desc';
} | null;

export type FilterConfig = {
  organizationName: string;
  status: string;
  publishingDate: string;
  closingDate: string;
};
