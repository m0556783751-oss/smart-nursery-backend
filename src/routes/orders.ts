import { Router } from 'express';
import { ordersController } from '../controllers/orders.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/orders.schema';

const router = Router();

router.post('/', authenticate, authorize('CUSTOMER'), validate(createOrderSchema), ordersController.create);
router.get('/', authenticate, ordersController.findAll);
router.get('/:id', authenticate, ordersController.findById);
router.patch('/:id/status', authenticate, authorize('STAFF'), validate(updateOrderStatusSchema), ordersController.updateStatus);

export { router as ordersRoutes };
