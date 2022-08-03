import boom from '@hapi/boom';
import type { NextFunction, Request, Response } from 'express';

const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  next(boom.notFound('The requested resource does not exist.'));
};

export default notFoundHandler;
