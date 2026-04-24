import { Readable } from 'stream';
import csvParser from 'csv-parser';

export interface CSVParseOptions {
  firstNameKey?: string;
  lastNameKey?: string;
  emailKey?: string;
  phoneKey?: string;
  skillsKey?: string;
}

export interface CSVResult {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  skills: any[];
  experience: any[];
  education: any[];
  projects: any[];
  headline: string;
  location: string;
  availability?: { status: 'Open to Opportunities', type: 'Full-time' };
}

const DEFAULT_OPTIONS: CSVParseOptions = {};

const parseSkills = (skillsStr: string) => {
  if (!skillsStr) return [];
  const delimiter = skillsStr.includes(';') ? ';' : skillsStr.includes('|') ? '|' : ',';
  return skillsStr
    .split(delimiter)
    .map((s) => ({
      name: s.trim(),
      level: 'Intermediate',
      yearsOfExperience: 1,
    }))
    .filter((s) => s.name.length > 0);
};

export const parseCSV = async (
  buffer: Buffer,
  options: CSVParseOptions = DEFAULT_OPTIONS
): Promise<CSVResult[]> => {
  return new Promise((resolve, reject) => {
    const results: CSVResult[] = [];
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csvParser())
      .on('data', (row: Record<string, string>) => {
        try {
          let firstName = row[options.firstNameKey || 'firstName'] || row['First Name'] || row['FirstName'] || '';
          let lastName = row[options.lastNameKey || 'lastName'] || row['Last Name'] || row['LastName'] || '';
          
          if (!firstName && !lastName) {
             const name = row['name'] || row['Name'] || '';
             const parts = name.split(' ');
             firstName = parts[0] || '';
             lastName = parts.slice(1).join(' ') || '';
          }

          const email = row[options.emailKey || 'email'] || row['Email'] || row['email'] || '';
          const phone = row[options.phoneKey || 'phone'] || row['Phone'] || row['phone'] || undefined;
          const skills = parseSkills(row[options.skillsKey || 'skills'] || row['Skills'] || row['skills'] || '');
          
           if (firstName && email) {
             results.push({
               firstName,
               lastName,
               email,
               phone,
               skills,
               experience: [], // Simple CSV parsing doesn't handle complex arrays
               education: [],
               projects: [],
               headline: row['headline'] || row['Headline'] || '',
               location: row['location'] || row['Location'] || '',
               availability: { status: 'Open to Opportunities' as const, type: 'Full-time' as const }
             });
           }
        } catch (err) {
          console.warn('Skipping malformed CSV row:', err);
        }
      })
      .on('end', () => resolve(results))
      .on('error', (err: Error) => reject(err));
  });
};
