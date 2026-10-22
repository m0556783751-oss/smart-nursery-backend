import { Request, Response, NextFunction } from 'express';
import { plantsService } from '../services/plants.service';

export const plantsController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, difficulty } = req.query;
      const plants = await plantsService.findAll({
        search: search as string,
        category: category as string,
        difficulty: difficulty as string,
      });
      res.json(plants);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const plant = await plantsService.findById(parseInt(req.params.id));
      res.json(plant);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const plant = await plantsService.create(req.body);
      res.status(201).json(plant);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const plant = await plantsService.update(parseInt(req.params.id), req.body);
      res.json(plant);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await plantsService.delete(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
