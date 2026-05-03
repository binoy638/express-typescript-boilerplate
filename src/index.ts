/* eslint-disable unicorn/no-process-exit */
import app from './app';
import { envManager } from './config/env';
import logger from './config/logger';

const PORT = envManager.getEnv('PORT');

const server = app.listen(PORT, () => {
  logger.info(`Listening at http://localhost:${PORT}`);
});

server.on('error', (err: Error) => {
  logger.error('Server failed to start:', err);
  process.exit(1);
});

const shutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});
