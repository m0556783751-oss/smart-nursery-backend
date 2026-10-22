import { Router } from 'express';
import { plantsController } from '../controllers/plants.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createPlantSchema, updatePlantSchema } from '../schemas/plants.schema';

const router = Router();

router.get('/', plantsController.findAll);
router.get('/:id', plantsController.findById);
router.post('/', authenticate, authorize('STAFF'), validate(createPlantSchema), plantsController.create);
router.put('/:id', authenticate, authorize('STAFF'), validate(updatePlantSchema), plantsController.update);
router.delete('/:id', authenticate, authorize('STAFF'), plantsController.delete);

export { router as plantsRoutes };
