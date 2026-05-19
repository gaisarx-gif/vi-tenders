/**
 * Structured logger (winston).
 *
 * The single shared logger instance for the server. Use this everywhere
 * instead of `console.log` so production logs stay structured + filterable.
 */

import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});
