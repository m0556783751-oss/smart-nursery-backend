import { Response, NextFunction } from 'express';
import { ordersService } from '../services/orders.service';
import { AuthRequest } from '../middleware/auth';

export const ordersController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.create(req.user!.id, req.body.plantId);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  },

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await ordersService.findAll(req.user!.id, req.user!.role);
      res.json(orders);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.findById(
        parseInt(req.params.id),
        req.user!.id,
        req.user!.role
      );
      res.json(order);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.updateStatus(
        parseInt(req.params.id),
        req.body.status
      );
      res.json(order);
    } catch (err) {
      next(err);
    }
  },
};
