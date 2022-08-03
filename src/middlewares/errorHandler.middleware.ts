/* eslint-disable @typescript-eslint/no-unused-vars */
import boom from '@hapi/boom';
import type { NextFunction, Request, Response } from 'express';

import logger from '../config/logger';

// eslint-disable-next-line no-unused-vars
export default (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const {
    output: { payload: error, statusCode },
  } = boom.boomify(err);
  res.status(statusCode).json({ error });
  if (statusCode >= 500) {
    logger.error(err);
  }
};
