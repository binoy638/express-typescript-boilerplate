import boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';

export const getMessage = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  if (!id) {
    next(boom.badRequest('Invalid request payload'));
  }
  res.send({
    message: `Hello ${id}`,
  });
};
