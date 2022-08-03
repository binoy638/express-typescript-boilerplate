import boom from '@hapi/boom';
import type { NextFunction, Request, Response } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {
  next(boom.notFound('The requested resource does not exist.'));
};
