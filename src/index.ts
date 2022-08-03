import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import logger from './config/logger';
import errorHandler from './middlewares/errorHandler.middleware';
import notFoundHandler from './middlewares/notFoundHandler.middleware';
import testRouter from './routers/test.router';

const PORT = process.env.PORT || 8080;

const app = express();

//* Middilewares
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

//* Register routers
app.use('/api/test', testRouter);

//* Start the server
app.listen(PORT, () => {
  logger.info(`Listening at http://localhost:${PORT}`);
});

//* Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);
