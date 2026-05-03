import { Router } from 'express';

import validateRequest from '../../middlewares/validation.middleware';
import * as testController from './test.controller';
import { getMessageSchema } from './test.schema';

const testRouter = Router();

testRouter.get('/:id', validateRequest(getMessageSchema), testController.getMessage);

export default testRouter;
