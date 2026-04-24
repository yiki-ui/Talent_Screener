export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

export interface ISkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | string;
  yearsOfExperience: number;
}

export interface IExperience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  technologies: string[];
}

export interface IProject {
  name: string;
  description: string;
  role: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface ICertification {
  name: string;
  issuer: string;
  issueDate?: string;
}

export interface ILanguage {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface IAvailability {
  status: 'Available' | 'Open to Opportunities' | 'Not Available' | string;
  type: 'Full-time' | 'Part-time' | 'Contract' | string;
  startDate?: string;
}

export interface IApplicant {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  headline?: string;
  location?: string;
  skills: ISkill[];
  experience: IExperience[];
  education: IEducation[];
  projects: IProject[];
  availability: IAvailability;
  bio?: string;
  languages?: ILanguage[];
  certifications?: ICertification[];
  socialLinks?: Record<string, string>;
  portfolioUrl?: string;
  resumeText?: string;
  source: 'umurava' | 'external';
  jobId: string;
  createdAt?: Date;
}

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead';

export interface IJob {
  _id?: string;
  title: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceLevel: ExperienceLevel;
  minYearsExperience: number;
  educationRequirement: string;
  department: string;
  location?: string;
  type?: string;
  createdAt?: Date;
}

export interface IScreeningResult {
  rank: number;
  applicantId: string;
  name: string;
  matchScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  fitScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  shortlisted: boolean;
}

export type ScreeningStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IScreening {
  _id?: string;
  jobId: string;
  status: ScreeningStatus;
  shortlistSize: 10 | 20;
  totalApplicants: number;
  results: IScreeningResult[];
  promptUsed: string;
  modelUsed: string;
  processingTimeMs: number;
  createdAt?: Date;
}

export interface GeminiCandidateResult {
  rank: number;
  candidateId: string;
  name: string;
  matchScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  fitScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  shortlisted: boolean;
}
