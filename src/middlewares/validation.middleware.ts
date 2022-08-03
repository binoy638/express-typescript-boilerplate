/* eslint-disable @typescript-eslint/no-explicit-any */
import boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod';

import logger from '../config/logger';

export interface RequestPayload {
  body?: ZodObject<any>;
  query?: ZodObject<any>;
  params?: ZodObject<any>;
}

//* Middleware to validate request payload
const validateRequest =
  (requestPayload: RequestPayload) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (requestPayload?.body) await requestPayload.body.parseAsync(req.body);
      if (requestPayload?.query) await requestPayload.query.parseAsync(req.query);
      if (requestPayload?.params) await requestPayload.params.parseAsync(req.params);
      next();
    } catch (error) {
      logger.error(error);
      next(boom.badRequest('Invalid request payload'));
    }
  };

export default validateRequest;
