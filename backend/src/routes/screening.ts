import { Router } from 'express';
import {
  triggerAIScreening,
  getScreening,
  getScreeningsByJob,
  exportShortlist,
} from '../controllers/screeningController';

const router = Router();

router.post('/run', triggerAIScreening);
router.get('/:screeningId', getScreening);
router.get('/job/:jobId', getScreeningsByJob);
router.get('/:screeningId/export', exportShortlist);

export default router;
