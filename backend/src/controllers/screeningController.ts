import { Request, Response, NextFunction } from 'express';
import { screenCandidates, createScreeningRecord } from '../services/geminiService';
import Applicant from '../models/Applicant';
import Screening from '../models/Screening';
import mongoose from 'mongoose';

export const triggerAIScreening = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId, shortlistSize } = req.body;

    const applicants = await Applicant.find({ jobId });
    if (applicants.length === 0) {
      res.status(400).json({ message: 'No applicants found for this job' });
      return;
    }

    const screeningRecord = await createScreeningRecord(jobId, shortlistSize, applicants);

    const startTime = Date.now();
    const { results, promptUsed } = await screenCandidates(jobId, shortlistSize, applicants);

    screeningRecord.status = 'completed';
    screeningRecord.results = results;
    screeningRecord.promptUsed = promptUsed;
    screeningRecord.modelUsed = 'gemini-1.5-flash';
    screeningRecord.processingTimeMs = Date.now() - startTime;
    await screeningRecord.save();

    res.json(screeningRecord);
  } catch (error) {
    next(error);
  }
};

export const getScreening = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const screening = await Screening.findById(req.params.screeningId);
    if (!screening) {
      res.status(404).json({ message: 'Screening not found' });
      return;
    }
    res.json(screening);
  } catch (error) {
    next(error);
  }
};

export const getScreeningsByJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const screenings = await Screening.find({ jobId: req.params.jobId }).sort({ createdAt: -1 });
    res.json(screenings);
  } catch (error) {
    next(error);
  }
};

export const exportShortlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const screening = await Screening.findById(req.params.screeningId);
    if (!screening) {
      res.status(404).json({ message: 'Screening not found' });
      return;
    }

    const { Parser } = require('json2csv');
    const fields = ['rank', 'name', 'email', 'matchScore', 'skillsScore', 'experienceScore', 'educationScore', 'fitScore', 'recommendation'];
    const opts = { fields };

    try {
      const parser = new Parser(opts);
      const csv = parser.parse(screening.results);

      res.header('Content-Type', 'text/csv');
      res.attachment(`shortlist-${screening._id}.csv`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  } catch (error) {
    next(error);
  }
};
