import { Router } from 'express';
import { gardenController } from '../controllers/garden.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/', authenticate, authorize('CUSTOMER'), gardenController.getMyGarden);

export { router as gardenRoutes };
