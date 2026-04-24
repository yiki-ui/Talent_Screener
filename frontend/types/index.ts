import { IApplicant, IJob, IScreening, IScreeningResult } from '../../backend/src/types';

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead';
export type ScreeningStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobFormData {
  title: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceLevel: ExperienceLevel;
  minYearsExperience: number;
  educationRequirement: string;
  department: string;
}

export interface ApplicantFormData {
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  yearsOfExperience: number;
  education: {
    degree: string;
    institution: string;
    graduationYear: number;
  };
  currentRole: string;
  currentCompany?: string;
  bio: string;
  portfolioUrl?: string;
  resumeText?: string;
}

export interface ScreeningFormData {
  jobId: string;
  shortlistSize: 10 | 20;
}

export type { IApplicant, IJob, IScreening, IScreeningResult };
