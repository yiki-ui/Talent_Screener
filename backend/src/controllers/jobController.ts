import { Request, Response, NextFunction } from 'express';
import Job from '../models/Job';
import Applicant from '../models/Applicant';

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, requiredSkills, niceToHaveSkills, experienceLevel, minYearsExperience, educationRequirement, department } = req.body;

    const job = new Job({
      title,
      description,
      requiredSkills,
      niceToHaveSkills,
      experienceLevel,
      minYearsExperience,
      educationRequirement,
      department,
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    // Count applicants per job in one aggregation query
    const counts = await Applicant.aggregate([
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ]);
    const countMap: Record<string, number> = {};
    counts.forEach((c: any) => { countMap[c._id.toString()] = c.count; });

    const jobsWithCounts = jobs.map((job: any) => ({
      ...job,
      applicantCount: countMap[job._id.toString()] || 0,
    }));

    res.json(jobsWithCounts);
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    res.json({ message: 'Job removed' });
  } catch (error) {
    next(error);
  }
};
