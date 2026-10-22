import { Router } from 'express';
import { careRemindersController } from '../controllers/careReminders.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/', authenticate, authorize('CUSTOMER'), careRemindersController.getMyReminders);
router.patch('/:id/done', authenticate, authorize('CUSTOMER'), careRemindersController.markDone);

export { router as careRemindersRoutes };
