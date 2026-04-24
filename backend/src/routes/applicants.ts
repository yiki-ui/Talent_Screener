import { Router } from 'express';
import upload from '../middleware/upload';
import {
  ingestApplicantsJSON,
  uploadCSV,
  uploadPDF,
  getApplicantsByJob,
  deleteApplicant,
} from '../controllers/applicantController';

const router = Router();

router.post('/json/:jobId', ingestApplicantsJSON);
router.post('/csv/:jobId', upload.single('file'), uploadCSV);
router.post('/pdf/:jobId', upload.single('file'), uploadPDF);
router.get('/:jobId', getApplicantsByJob);
router.delete('/:id', deleteApplicant);

export default router;
