import mongoose, { Schema, Document } from 'mongoose';

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead';

export interface IJobDocument extends Document {
  title: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceLevel: ExperienceLevel;
  minYearsExperience: number;
  educationRequirement: string;
  department: string;
  createdAt: Date;
}

const JobSchema = new Schema<IJobDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], required: true },
    niceToHaveSkills: { type: [String], default: [] },
    experienceLevel: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'lead'],
      required: true,
    },
    minYearsExperience: { type: Number, required: true, min: 0, max: 30 },
    educationRequirement: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IJobDocument>('Job', JobSchema);
