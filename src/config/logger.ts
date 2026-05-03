import fs from 'fs';
import path from 'path';
import { createLogger, format, Logger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import Transport from 'winston-transport';

import { envManager } from './env';

const { combine, printf, colorize, errors, timestamp, metadata, json, splat } = format;

interface LoggerConfig {
  logDir?: string;
  logLevel?: string;
  maxFileSize?: string;
  maxFiles?: string;
  enableConsole?: boolean;
  file?: boolean;
  customFields?: Record<string, unknown>;
}

class LoggerService {
  private static instance: Logger;

  private static ensureLogDirectory(logDir: string): void {
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  private static createCustomFormat(customFields: Record<string, unknown> = {}) {
    return format(info => {
      for (const [key, value] of Object.entries(customFields)) {
        info[key] = value;
      }
      return info;
    })();
  }

  private static createProdLogger(config: LoggerConfig = {}): Logger {
    const {
      logDir = 'logs',
      logLevel = 'debug',
      maxFileSize = '10m',
      maxFiles = '14d',
      enableConsole = true,
      file = true,
      customFields = {},
    } = config;

    this.ensureLogDirectory(logDir);

    const logTransports: Transport[] = [];

    if (enableConsole) {
      logTransports.push(
        new transports.Console({
          format: combine(
            colorize(),
            printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
          ),
        })
      );
    }

    if (file) {
      const customFormat = this.createCustomFormat(customFields);

      logTransports.push(
        new DailyRotateFile({
          filename: path.join(logDir, 'app-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: maxFileSize,
          maxFiles,
          format: combine(timestamp(), customFormat, json()),
        }),
        new DailyRotateFile({
          filename: path.join(logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: maxFileSize,
          maxFiles,
          level: 'error',
          format: combine(timestamp(), customFormat, json()),
        })
      );
    }

    return createLogger({
      level: logLevel,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        this.createCustomFormat(customFields),
        errors({ stack: true }),
        splat(),
        metadata({ fillExcept: ['message', 'level', 'timestamp', ...Object.keys(customFields)] }),
        json()
      ),
      transports: logTransports,
      exitOnError: false,
    });
  }

  private static createDevLogger(config: LoggerConfig = {}): Logger {
    const { logLevel = 'debug', customFields = {} } = config;

    const customFormat = this.createCustomFormat(customFields);

    const logFormat = printf(info => {
      const _metadata = info.metadata || {};
      // eslint-disable-next-line unicorn/no-null
      const metaStr = Object.keys(_metadata).length > 0 ? `\n${JSON.stringify(_metadata, null, 2)}` : '';

      const _timestamp = info.timestamp || new Date().toISOString();
      const level = info.level || 'info';
      const message = info.stack || info.message || 'No message';

      return `${_timestamp} ${level}: ${message}${metaStr}`;
    });

    return createLogger({
      level: logLevel,
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat,
        errors({ stack: true }),
        splat(),
        metadata({ fillExcept: ['message', 'level', 'timestamp', ...Object.keys(customFields)] }),
        logFormat
      ),
      transports: [new transports.Console()],
      exitOnError: false,
    });
  }

  public static getLogger(config: LoggerConfig = {}): Logger {
    if (!this.instance) {
      this.instance =
        envManager.getEnv('NODE_ENV') === 'development' ? this.createDevLogger(config) : this.createProdLogger(config);

      this.instance.on('error', error => {
        console.error('Logger error:', error);
      });
    }
    return this.instance;
  }
}

export default LoggerService.getLogger({
  logDir: envManager.getEnv('LOG_DIR'),
  logLevel: envManager.getEnv('LOG_LEVEL'),
  maxFileSize: envManager.getEnv('MAX_FILE_SIZE'),
  maxFiles: envManager.getEnv('MAX_FILES'),
  customFields: {
    id: 'server',
  },
});
