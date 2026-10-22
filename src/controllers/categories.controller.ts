import { Request, Response, NextFunction } from 'express';
import { categoriesService } from '../services/categories.service';

export const categoriesController = {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoriesService.findAll();
      res.json(categories);
    } catch (err) {
      next(err);
    }
  },
};
