import { Router } from 'express';
import { z } from 'zod';

import * as testController from '../controllers/test.controller';
import validateRequest from '../middlewares/validation.middleware';

const testRouter = Router();

testRouter.get('/:id', validateRequest({ params: z.object({ id: z.string() }) }), testController.getMessage);

export default testRouter;
