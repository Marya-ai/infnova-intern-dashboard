export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'reviewer';
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface DashboardSummary {
  totalApplicants: number;
  byStatus: {
    pending: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
  };
  byTrack: Record<string, number>;
}

export interface ApplicantSummary {
  id: string;
  fullName: string;
  email: string;
  track: string;
  country: string;
  applicationDate: string;
  status: StatusType;
}

export interface PaginatedApplicants {
  data: ApplicantSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Applicant extends ApplicantSummary {
  phoneNumber: string;
  experienceLevel: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedInUrl?: string;
  skills: string[];
  motivation?: string;
  notes?: string;
  updatedAt: string;
}

export type StatusType = 'pending' | 'shortlisted' | 'accepted' | 'rejected';
export type TrackType = 'frontend' | 'backend' | 'ui-ux' | 'data-analytics' | 'mobile';

export interface ReferenceItem {
  value: string;
  label: string;
}

export interface FilterParams {
  page: number;
  limit: number;
  search: string;
  status: string;
  track: string;
  country: string;
  experienceLevel: string;
  sortBy: 'fullName' | 'email' | 'track' | 'applicationDate' | 'status';
  sortOrder: 'asc' | 'desc';
  simulateError: boolean;
  delay: number;
}