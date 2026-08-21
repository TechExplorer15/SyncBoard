/**
 * Structured console logger for SyncBoard.
 * Provides consistent, contextual log output.
 * SECURITY: Never logs passwords, tokens, or full request bodies.
 */

/**
 * Sanitizes an object by removing sensitive fields before logging.
 * @param {Record<string, any>} obj
 * @returns {Record<string, any>}
 */
function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'authorization'];
  const sanitized = { ...obj };
  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}

/**
 * Formats a log message with timestamp and level.
 * @param {'INFO' | 'WARN' | 'ERROR' | 'DEBUG'} level
 * @param {string} message
 * @param {Record<string, any>} [context]
 * @returns {string}
 */
function formatLog(level, message, context) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  if (context && Object.keys(context).length > 0) {
    return `${prefix} ${message} ${JSON.stringify(sanitize(context))}`;
  }
  return `${prefix} ${message}`;
}

const logger = {
  /** @param {string} message @param {Record<string, any>} [context] */
  info(message, context) {
    console.log(formatLog('INFO', message, context));
  },
  /** @param {string} message @param {Record<string, any>} [context] */
  warn(message, context) {
    console.warn(formatLog('WARN', message, context));
  },
  /** @param {string} message @param {Record<string, any>} [context] */
  error(message, context) {
    console.error(formatLog('ERROR', message, context));
  },
  /** @param {string} message @param {Record<string, any>} [context] */
  debug(message, context) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatLog('DEBUG', message, context));
    }
  },
};

module.exports = logger;
