import type { TypedRequestHandler } from '../../middlewares/validation.middleware';
import { getMessageSchema } from './test.schema';
import { buildGreeting } from './test.service';

export const getMessage: TypedRequestHandler<typeof getMessageSchema> = (req, res) => {
  const { id } = req.params;
  res.send({ message: buildGreeting(id) });
};
