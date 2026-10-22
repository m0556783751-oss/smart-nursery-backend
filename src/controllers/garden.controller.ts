import { Response, NextFunction } from 'express';
import { gardenService } from '../services/garden.service';
import { AuthRequest } from '../middleware/auth';

export const gardenController = {
  async getMyGarden(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const garden = await gardenService.getMyGarden(req.user!.id);
      res.json(garden);
    } catch (err) {
      next(err);
    }
  },
};
