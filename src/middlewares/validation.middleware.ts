import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z, ZodTypeAny } from 'zod';

export interface RequestSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

type Infer<T> = T extends ZodTypeAny ? z.infer<T> : unknown;

export type TypedRequestHandler<S extends RequestSchemas> = RequestHandler<
  Infer<S['params']>,
  unknown,
  Infer<S['body']>,
  Infer<S['query']>
>;

const validateRequest =
  <S extends RequestSchemas>(schemas: S) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) req.body = await schemas.body.parseAsync(req.body);
      if (schemas.query) Object.assign(req.query, await schemas.query.parseAsync(req.query));
      if (schemas.params) Object.assign(req.params, await schemas.params.parseAsync(req.params));
      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;
