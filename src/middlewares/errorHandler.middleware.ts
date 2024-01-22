/* eslint-disable @typescript-eslint/no-unused-vars */
import boom from '@hapi/boom';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import logger from '../config/logger';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const isZodError = err instanceof ZodError;
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev && isZodError) {
    res.status(400).json({ error: err.issues });
    return;
  }
  if (isZodError) {
    if (req.method === 'POST') {
      res.status(400).json({
        error: {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid payload',
        },
      });
      return;
    }
    res.status(400).json({
      error: {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid query parameters',
      },
    });
    return;
  }
  const {
    output: { payload: error, statusCode },
  } = boom.boomify(err);

  res.status(statusCode).json({ error });
  if (statusCode >= 500) {
    logger.error(err);
  }
};

export default errorHandler;
