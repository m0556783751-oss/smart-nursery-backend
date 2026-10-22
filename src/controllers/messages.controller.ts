import { Response, NextFunction } from 'express';
import { messagesService } from '../services/messages.service';
import { AuthRequest } from '../middleware/auth';

export const messagesController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await messagesService.create(
        req.user!.id,
        req.body.content,
        req.body.plantId
      );
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  },

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const messages = await messagesService.findAll(req.user!.id, req.user!.role);
      res.json(messages);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await messagesService.findById(
        parseInt(req.params.id),
        req.user!.id,
        req.user!.role
      );
      res.json(message);
    } catch (err) {
      next(err);
    }
  },

  async reply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await messagesService.reply(
        parseInt(req.params.id),
        req.user!.id,
        req.body.reply
      );
      res.json(message);
    } catch (err) {
      next(err);
    }
  },
};
