import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillSubdoc {
  name: string;
  level: string;
  yearsOfExperience: number;
}

export interface IExperienceSubdoc {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  technologies: string[];
}

export interface IProjectSubdoc {
  name: string;
  description: string;
  role: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface IEducationSubdoc {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

export interface ICertificationSubdoc {
  name: string;
  issuer: string;
  issueDate?: string;
}

export interface ILanguageSubdoc {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface IAvailabilitySubdoc {
  status: string;
  type: string;
  startDate?: string;
}

export interface IApplicantDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  headline?: string;
  location?: string;
  skills: ISkillSubdoc[];
  experience: IExperienceSubdoc[];
  education: IEducationSubdoc[];
  projects: IProjectSubdoc[];
  availability: IAvailabilitySubdoc;
  bio?: string;
  languages?: ILanguageSubdoc[];
  certifications?: ICertificationSubdoc[];
  socialLinks?: Record<string, string>;
  portfolioUrl?: string;
  resumeText?: string;
  source: 'umurava' | 'external';
  jobId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SkillSchema = new Schema<ISkillSubdoc>(
  {
    name: { type: String, required: true },
    level: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    yearsOfExperience: { type: Number, required: true },
  },
  { _id: false }
);

const ExperienceSchema = new Schema<IExperienceSubdoc>(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    isCurrent: { type: Boolean, required: true },
    description: { type: String },
    technologies: { type: [String], default: [] }
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProjectSubdoc>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    role: { type: String, required: true },
    technologies: { type: [String], default: [] },
    link: { type: String },
    startDate: { type: String },
    endDate: { type: String }
  },
  { _id: false }
);

const EducationSchema = new Schema<IEducationSubdoc>(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
  },
  { _id: false }
);

const CertificationSchema = new Schema<ICertificationSubdoc>(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String },
  },
  { _id: false }
);

const LanguageSchema = new Schema<ILanguageSubdoc>(
  {
    name: { type: String, required: true },
    proficiency: { type: String, required: true, enum: ['Basic', 'Conversational', 'Fluent', 'Native'] },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema<IAvailabilitySubdoc>(
  {
    status: { type: String, required: true, enum: ['Available', 'Open to Opportunities', 'Not Available'] },
    type: { type: String, required: true, enum: ['Full-time', 'Part-time', 'Contract'] },
    startDate: { type: String },
  },
  { _id: false }
);

const ApplicantSchema = new Schema<IApplicantDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    headline: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    skills: { type: [SkillSchema], required: true },
    experience: { type: [ExperienceSchema], required: true },
    education: { type: [EducationSchema], required: true },
    projects: { type: [ProjectSchema], required: true },
    availability: { type: AvailabilitySchema, required: true },
    bio: { type: String, trim: true },
    languages: { type: [LanguageSchema] },
    certifications: { type: [CertificationSchema] },
    socialLinks: { type: Map, of: String },
    portfolioUrl: { type: String, trim: true },
    resumeText: { type: String, trim: true },
    source: {
      type: String,
      enum: ['umurava', 'external'],
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ApplicantSchema.index({ jobId: 1 });
ApplicantSchema.index({ email: 1, jobId: 1 });

export default mongoose.model<IApplicantDocument>('Applicant', ApplicantSchema);
