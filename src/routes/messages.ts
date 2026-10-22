import { Router } from 'express';
import { messagesController } from '../controllers/messages.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createMessageSchema, replyMessageSchema } from '../schemas/messages.schema';

const router = Router();

router.post('/', authenticate, authorize('CUSTOMER'), validate(createMessageSchema), messagesController.create);
router.get('/', authenticate, messagesController.findAll);
router.get('/:id', authenticate, messagesController.findById);
router.patch('/:id/reply', authenticate, authorize('STAFF'), validate(replyMessageSchema), messagesController.reply);

export { router as messagesRoutes };
