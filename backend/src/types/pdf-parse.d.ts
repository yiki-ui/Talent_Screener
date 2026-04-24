declare module 'pdf-parse' {
  export interface Result {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }
  export default function pdfParse(buffer: Buffer): Promise<Result>;
}
