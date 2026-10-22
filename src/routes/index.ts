import { Router } from 'express';
import { authRoutes } from './auth';
import { plantsRoutes } from './plants';
import { categoriesRoutes } from './categories';
import { ordersRoutes } from './orders';
import { gardenRoutes } from './garden';
import { careRemindersRoutes } from './careReminders';
import { messagesRoutes } from './messages';
import { healthRoutes } from './health';

const router = Router();

router.use('/auth', authRoutes);
router.use('/plants', plantsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/orders', ordersRoutes);
router.use('/my-garden', gardenRoutes);
router.use('/care-reminders', careRemindersRoutes);
router.use('/messages', messagesRoutes);
router.use('/health', healthRoutes);

export { router };
