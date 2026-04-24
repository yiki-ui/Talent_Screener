import { GoogleGenerativeAI } from '@google/generative-ai';
import { IScreeningResult } from '../types/index';
import Job from '../models/Job';
import mongoose from 'mongoose';
import Screening from '../models/Screening';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const getScreeningPrompt = (
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[],
  niceToHaveSkills: string[],
  minYearsExperience: number,
  experienceLevel: string,
  educationRequirement: string,
  candidatesJSON: string
) => `You are an expert AI recruiter evaluating a batch of candidates for a job opening.
Evaluate ALL candidates below against the job requirements.

=== JOB DETAILS ===
Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${JSON.stringify(requiredSkills)}
Nice to Have: ${JSON.stringify(niceToHaveSkills)}
Experience Required: ${minYearsExperience}+ years (${experienceLevel} level)
Education Requirement: ${educationRequirement}

=== CANDIDATES ===
${candidatesJSON}

=== SCORING RUBRIC ===
- Skills match (0-100): How many required/nice-to-have skills does the candidate have?
- Experience (0-100): Years of experience vs requirement and quality of experience.
- Education (0-100): Relevance of degree/institution.
- Cultural Fit (0-100): Based on headline, projects, availability, and career trajectory.

=== INSTRUCTIONS ===
1. Score every candidate on all 4 dimensions (0-100 each).
2. Provide specific strengths and gaps for each.
3. Provide a brief recommendation for each.

Return ONLY valid JSON — no markdown, no explanation, no preamble. The output MUST be an array of objects matching exactly this schema:
[
  {
    "candidateId": "string (MUST use the exact _id provided in the input candidate)",
    "skillsScore": 90,
    "experienceScore": 85,
    "educationScore": 80,
    "culturalFitScore": 88,
    "strengths": [
      "Has 5 of 6 required skills including React and TypeScript",
      "4 years experience exceeds the 3-year minimum"
    ],
    "gapsRisks": [
      "No GraphQL experience listed (nice-to-have)"
    ],
    "recommendation": "Strong candidate. Technical skills are well-aligned. Recommend for first-round interview."
  }
]
`;

export async function screenCandidates(
  jobId: mongoose.Types.ObjectId,
  shortlistSize: 10 | 20,
  candidates: any[]
): Promise<{ results: IScreeningResult[], promptUsed: string }> {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  // Hard cap of 20 candidates per screening call
  const cappedCandidates = candidates.slice(0, 20);

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

   const candidatesData = cappedCandidates.map(c => ({
     _id: c._id,
     firstName: c.firstName,
     lastName: c.lastName,
     headline: c.headline,
     skills: c.skills,
     experience: c.experience,
     education: c.education,
     projects: c.projects,
     availability: c.availability
   }));

  const candidatesJSON = JSON.stringify(candidatesData);
  const prompt = getScreeningPrompt(
    job.title,
    job.description,
    job.requiredSkills,
    job.niceToHaveSkills,
    job.minYearsExperience,
    job.experienceLevel,
    job.educationRequirement,
    candidatesJSON
  );

  let rawParsed: any[] = [];
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('--- RAW GEMINI RESPONSE ---');
    console.log(text);
    console.log('---------------------------');
    
    const cleaned = text.replace(/```json|```/g, '').trim();
    rawParsed = JSON.parse(cleaned);
    
    if (!Array.isArray(rawParsed)) {
      throw new Error('Gemini did not return an array');
    }
  } catch (e) {
    console.error('Failed to parse Gemini response or generate content:', e);
  }

  const evaluatedCandidates: IScreeningResult[] = [];

  for (const candidate of cappedCandidates) {
    const aiData = rawParsed.find(p => p.candidateId === candidate._id?.toString()) || {};

    const skillsScore = aiData.skillsScore || 0;
    const experienceScore = aiData.experienceScore || 0;
    const educationScore = aiData.educationScore || 0;
    const fitScore = aiData.culturalFitScore || aiData.fitScore || 0;

    const matchScore = Math.round(
      (skillsScore * 0.40) + 
      (experienceScore * 0.30) + 
      (educationScore * 0.15) + 
      (fitScore * 0.15)
    );

    evaluatedCandidates.push({
      rank: 0,
      applicantId: candidate._id?.toString() || '',
      name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
      matchScore,
      skillsScore,
      experienceScore,
      educationScore,
      fitScore,
      strengths: aiData.strengths || ['AI evaluation failed or missing'],
      gaps: aiData.gapsRisks || aiData.gaps || ['AI evaluation failed or missing'],
      recommendation: aiData.recommendation || 'Manual review required.',
      shortlisted: false
    });
  }

  evaluatedCandidates.sort((a, b) => b.matchScore - a.matchScore);
  
  evaluatedCandidates.forEach((candidate, index) => {
    candidate.rank = index + 1;
    candidate.shortlisted = index < shortlistSize;
  });

  return { results: evaluatedCandidates, promptUsed: prompt };
}

export async function createScreeningRecord(
  jobId: mongoose.Types.ObjectId,
  shortlistSize: 10 | 20,
  candidates: any[]
) {
  const cappedLength = Math.min(candidates.length, 20);
  const screening = new Screening({
    jobId,
    status: 'processing' as const,
    shortlistSize,
    totalApplicants: cappedLength,
    results: [],
    promptUsed: 'Generating prompt...',
    modelUsed: 'gemini-1.5-flash',
    processingTimeMs: 0,
  });
  await screening.save();
  return screening;
}
