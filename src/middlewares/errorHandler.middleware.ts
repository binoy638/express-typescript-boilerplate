import boom from '@hapi/boom';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { envManager } from '../config/env';
import logger from '../config/logger';

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ZodError) {
    if (envManager.getEnv('NODE_ENV') === 'development') {
      res.status(400).json({ error: err.issues });
    } else {
      res.status(400).json({ error: { statusCode: 400, error: 'Bad Request', message: 'Invalid request' } });
    }
    return;
  }

  const {
    output: { payload: error, statusCode },
  } = boom.boomify(err);

  if (statusCode >= 500) {
    logger.error(err);
  }
  res.status(statusCode).json({ error });
};

export default errorHandler;
