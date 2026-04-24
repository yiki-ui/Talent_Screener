import { Request, Response, NextFunction } from 'express';
import Applicant from '../models/Applicant';
import Job from '../models/Job';
import Screening from '../models/Screening';

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalApplicants, totalJobs, screenings, skillsAgg, availabilityAgg, locationAgg] = await Promise.all([
      Applicant.countDocuments(),
      Job.countDocuments(),
      Screening.find({ status: 'completed' }).lean(),
      // Top skills across all applicants
      Applicant.aggregate([
        { $unwind: '$skills' },
        { $group: { _id: '$skills.name', count: { $sum: 1 }, avgYears: { $avg: '$skills.yearsOfExperience' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      // Availability breakdown
      Applicant.aggregate([
        { $group: { _id: '$availability.status', count: { $sum: 1 } } }
      ]),
      // Location breakdown
      Applicant.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ])
    ]);

    // Compute screening stats
    const completedScreenings = screenings.length;
    let avgMatchScore = 0;
    let totalShortlisted = 0;
    const allResults: any[] = [];

    screenings.forEach((s: any) => {
      if (s.results && Array.isArray(s.results)) {
        s.results.forEach((r: any) => {
          allResults.push(r);
          if (r.shortlisted) totalShortlisted++;
        });
      }
    });

    if (allResults.length > 0) {
      avgMatchScore = Math.round(allResults.reduce((sum: number, r: any) => sum + (r.matchScore || 0), 0) / allResults.length);
    }

    // Score distribution buckets
    const scoreDistribution = [
      { range: '0-20', count: allResults.filter(r => r.matchScore >= 0 && r.matchScore <= 20).length },
      { range: '21-40', count: allResults.filter(r => r.matchScore > 20 && r.matchScore <= 40).length },
      { range: '41-60', count: allResults.filter(r => r.matchScore > 40 && r.matchScore <= 60).length },
      { range: '61-80', count: allResults.filter(r => r.matchScore > 60 && r.matchScore <= 80).length },
      { range: '81-100', count: allResults.filter(r => r.matchScore > 80 && r.matchScore <= 100).length },
    ];

    // Experience level distribution from applicants
    const experienceAgg = await Applicant.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills.level', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: {
        totalApplicants,
        totalJobs,
        completedScreenings,
        avgMatchScore,
        totalShortlisted,
        totalEvaluated: allResults.length,
      },
      topSkills: skillsAgg.map((s: any) => ({
        name: s._id,
        count: s.count,
        avgYears: Math.round(s.avgYears * 10) / 10,
      })),
      availabilityBreakdown: availabilityAgg.map((a: any) => ({
        status: a._id || 'Unknown',
        count: a.count,
      })),
      locationBreakdown: locationAgg.map((l: any) => ({
        location: l._id || 'Unknown',
        count: l.count,
      })),
      scoreDistribution,
      skillLevelDistribution: experienceAgg.map((e: any) => ({
        level: e._id || 'Unknown',
        count: e.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};
