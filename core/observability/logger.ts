/* eslint-disable no-console */
/**
 * Enterprise Structured Logging Module
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  service: string;
  environment: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private service: string;
  private environment: string;
  private minLevel: LogLevel;

  constructor() {
    this.service = process.env.SERVICE_NAME || 'eshop-admin';
    this.environment = process.env.NODE_ENV || 'development';
    this.minLevel = this.environment === 'production' ? 'info' : 'debug';

    if (process.env.LOG_LEVEL) {
      this.minLevel = process.env.LOG_LEVEL as LogLevel;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private write(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      environment: this.environment,
      context: this.sanitizeContext(context || {}),
    };

    const output = JSON.stringify(entry);

    switch (level) {
      case 'error': console.error(output); break;
      case 'warn': console.warn(output); break;
      case 'info': console.log(output); break;
      case 'debug': console.log(output); break;
    }
  }

  private sanitizeContext(context: LogContext): LogContext {
    const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie'];
    const sanitized: LogContext = {};

    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  debug(message: string, context?: LogContext) { this.write('debug', message, context); }
  info(message: string, context?: LogContext) { this.write('info', message, context); }
  warn(message: string, context?: LogContext) { this.write('warn', message, context); }
  error(message: string, context?: LogContext) { this.write('error', message, context); }
}

export const logger = new Logger();
export const getRequestLogger = (requestId?: string) => logger; // Simplified for now
