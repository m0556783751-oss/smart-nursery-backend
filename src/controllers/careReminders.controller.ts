import { Response, NextFunction } from 'express';
import { careRemindersService } from '../services/careReminders.service';
import { AuthRequest } from '../middleware/auth';

export const careRemindersController = {
  async getMyReminders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reminders = await careRemindersService.getMyReminders(req.user!.id);
      res.json(reminders);
    } catch (err) {
      next(err);
    }
  },

  async markDone(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reminder = await careRemindersService.markDone(
        parseInt(req.params.id),
        req.user!.id
      );
      res.json(reminder);
    } catch (err) {
      next(err);
    }
  },
};
