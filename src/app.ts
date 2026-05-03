import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { envManager } from './config/env';
import errorHandler from './middlewares/errorHandler.middleware';
import notFoundHandler from './middlewares/notFoundHandler.middleware';
import { apiLimiter } from './middlewares/rateLimiter.middleware';
import { requestId } from './middlewares/requestId.middleware';
import testRouter from './modules/test/test.router';
import healthRouter from './routers/health.router';

const app = express();

app.use(requestId);
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors({ origin: envManager.getEnv('CORS_ORIGIN') }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.use('/health', healthRouter);
app.use('/api/test', testRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
