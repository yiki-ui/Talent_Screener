import { Request, Response, NextFunction } from 'express';
import Applicant from '../models/Applicant';
import { parseCSV } from '../services/csvService';
import { extractTextFromPDF, parseResumeWithGemini } from '../services/pdfService';

export const ingestApplicantsJSON = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applicants = req.body;
    const jobId = req.params.jobId;

    if (!Array.isArray(applicants)) {
      res.status(400).json({ message: 'Request body must be an array' });
      return;
    }

    const createdApplicants = await Applicant.insertMany(
      applicants.map((app: any) => ({
        ...app,
        jobId,
        source: 'umurava',
      }))
    );

    res.status(201).json(createdApplicants);
  } catch (error) {
    next(error);
  }
};

export const uploadCSV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const jobId = req.params.jobId;
    
    const parsedData = await parseCSV(req.file.buffer);
    
    const createdApplicants = await Applicant.insertMany(
      parsedData.map((app) => ({
        ...app,
        jobId,
        source: 'umurava',
      }))
    );

    res.json({ message: 'CSV uploaded and parsed successfully', count: createdApplicants.length, applicants: createdApplicants });
  } catch (error) {
    next(error);
  }
};

export const uploadPDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const jobId = req.params.jobId;
    
    const text = await extractTextFromPDF(req.file.buffer);
    const structuredData = await parseResumeWithGemini(text);

    const createdApplicant = await Applicant.create({
      ...structuredData,
      jobId,
      source: 'umurava',
    });

    res.json({ message: 'PDF uploaded and parsed successfully', applicant: createdApplicant });
  } catch (error) {
    next(error);
  }
};

export const getApplicantsByJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applicants = await Applicant.find({ jobId: req.params.jobId }).sort({ createdAt: -1 });
    res.json(applicants);
  } catch (error) {
    next(error);
  }
};

export const deleteApplicant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);
    if (!applicant) {
      res.status(404).json({ message: 'Applicant not found' });
      return;
    }
    res.json({ message: 'Applicant removed' });
  } catch (error) {
    next(error);
  }
};
