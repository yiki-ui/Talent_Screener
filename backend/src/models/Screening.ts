import mongoose, { Schema, Document } from 'mongoose';
import { IScreeningResult } from './../types/index';

export type ScreeningStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IScreeningDocument extends Document {
  jobId: mongoose.Types.ObjectId;
  status: ScreeningStatus;
  shortlistSize: 10 | 20;
  totalApplicants: number;
  results: IScreeningResult[];
  promptUsed: string;
  modelUsed: string;
  processingTimeMs: number;
  createdAt: Date;
}

const ScreeningSchema = new Schema<IScreeningDocument>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      required: true,
    },
    shortlistSize: {
      type: Number,
      enum: [10, 20],
      required: true,
    },
    totalApplicants: {
      type: Number,
      required: true,
    },
    results: {
      type: Schema.Types.Mixed,
      required: true,
    },
    promptUsed: {
      type: String,
      required: true,
    },
    modelUsed: {
      type: String,
      required: true,
    },
    processingTimeMs: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IScreeningDocument>('Screening', ScreeningSchema);
