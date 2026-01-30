import { Router } from 'express';
import { getProfile } from '../controllers/profile.controller';

const router = Router();

router.get('/:login', getProfile);

export default router;
