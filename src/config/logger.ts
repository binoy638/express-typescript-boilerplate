/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createLogger, format, Logger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import Transport from 'winston-transport';

import { envManager } from './env';

dotenv.config();

const { combine, printf, colorize, errors, timestamp, metadata, json, splat } = format;

// Enhanced configuration interface
interface LoggerConfig {
  logDir?: string;
  logLevel?: string;
  maxFileSize?: string;
  maxFiles?: string;
  console?: boolean;
  file?: boolean;
  customFields?: Record<string, unknown>;
}

class LoggerService {
  private static instance: Logger;

  // Ensure log directory exists
  private static ensureLogDirectory(logDir: string): void {
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  // Create custom format with configurable fields
  private static createCustomFormat(customFields: Record<string, unknown> = {}) {
    return format(info => {
      // Add all custom fields to the info object
      for (const [key, value] of Object.entries(customFields)) {
        info[key] = value;
      }
      return info;
    })();
  }

  // Create production logger
  private static createProdLogger(config: LoggerConfig = {}): Logger {
    const {
      logDir = 'logs',
      logLevel = 'debug',
      maxFileSize = '10m',
      maxFiles = '14d',
      console = true,
      file = true,
      customFields = {},
    } = config;

    // Ensure log directory exists
    this.ensureLogDirectory(logDir);

    const logTransports: Transport[] = [];

    // Console Transport
    if (console) {
      logTransports.push(
        new transports.Console({
          format: combine(
            colorize(),
            printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
          ),
        })
      );
    }

    // File Transport
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
        // Separate error log file
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

  // Create development logger
  private static createDevLogger(config: LoggerConfig = {}): Logger {
    const { logLevel = 'debug', customFields = {} } = config;

    const customFormat = this.createCustomFormat(customFields);

    const logFormat = printf(info => {
      // Safely handle metadata
      const _metadata = info.metadata || {};
      // eslint-disable-next-line unicorn/no-null
      const metaStr = Object.keys(_metadata).length > 0 ? `\n${JSON.stringify(_metadata, null, 2)}` : '';

      // Handle potential undefined values
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

  // Singleton logger creation
  public static getLogger(config: LoggerConfig = {}): Logger {
    if (!this.instance) {
      this.instance =
        envManager.getEnv('NODE_ENV') === 'development' ? this.createDevLogger(config) : this.createProdLogger(config);

      // Add error handling
      this.instance.on('error', error => {
        console.error('Logger error:', error);
      });
    }
    return this.instance;
  }
}

// Export the logger
export default LoggerService.getLogger({
  logDir: process.env.LOG_DIR,
  logLevel: process.env.LOG_LEVEL,
  maxFileSize: process.env.MAX_FILE_SIZE,
  maxFiles: process.env.MAX_FILES,
  customFields: {
    id: 'server',
    // Add any other custom fields you want here
  },
});
