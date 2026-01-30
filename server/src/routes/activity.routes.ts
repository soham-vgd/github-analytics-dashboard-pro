import { Router } from 'express';
import { streamActivity } from '../controllers/activity.controller';

const router = Router();

router.get('/stream/:login', streamActivity);

export default router;
