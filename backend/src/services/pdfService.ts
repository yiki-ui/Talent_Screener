import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(buffer);
    return data.text.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const parseResumeWithGemini = async (text: string): Promise<any> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `You are an expert HR assistant. Extract the candidate's profile from the following resume text.
Format the output EXACTLY as this JSON structure:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "headline": "string",
  "location": "string",
  "skills": [
    { "name": "string", "level": "Beginner|Intermediate|Advanced|Expert", "yearsOfExperience": number }
  ],
  "experience": [
    { "company": "string", "role": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM or present", "isCurrent": boolean, "description": "string", "technologies": ["string"] }
  ],
  "education": [
    { "institution": "string", "degree": "string", "fieldOfStudy": "string", "startYear": number, "endYear": number }
  ],
  "projects": [
    { "name": "string", "description": "string", "role": "string", "technologies": ["string"], "link": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM" }
  ],
  "availability": {
    "status": "Available|Open to Opportunities|Not Available",
    "type": "Full-time|Part-time|Contract"
  },
  "bio": "string",
  "languages": [
    {
      "name": "string",
      "proficiency": "Basic|Conversational|Fluent|Native"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "YYYY-MM"
    }
  ]
 }

If any field is missing from the resume, leave it as an empty string or empty array.
If years of experience is not explicitly stated for a skill or role, estimate it based on dates, or default to 1.
If a date is missing, estimate or default to current year.
For availability, default to "Open to Opportunities" and "Full-time" if not specified.

RESUME TEXT:
${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const outputText = response.text();

  try {
    const jsonText = outputText.replace(/^```json\n?/, '').replace(/```$/, '').trim();
    return JSON.parse(jsonText);
  } catch (e) {
    console.error('Failed to parse Gemini resume extraction:', outputText);
    throw new Error('Failed to parse resume');
  }
};
