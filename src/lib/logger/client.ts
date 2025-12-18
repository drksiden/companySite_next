'use client';

/**
 * Клиентский логгер для использования в браузере
 * Отправляет логи на серверный API endpoint для дальнейшей обработки
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: any;
}

class ClientLogger {
  private logEndpoint = '/api/logs';
  private enabled = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_CLIENT_LOGGING === 'true';

  private async sendLog(level: LogLevel, message: string, context?: LogContext) {
    if (!this.enabled) {
      // В development режиме просто выводим в консоль
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        `[${level.toUpperCase()}] ${message}`,
        context
      );
      return;
    }

    try {
      await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          context: {
            ...context,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      // Если не удалось отправить лог, выводим в консоль
      console.error('Failed to send log to server:', error);
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        `[${level.toUpperCase()}] ${message}`,
        context
      );
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    this.sendLog('error', message, errorContext);
  }

  warn(message: string, context?: LogContext) {
    this.sendLog('warn', message, context);
  }

  info(message: string, context?: LogContext) {
    this.sendLog('info', message, context);
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      this.sendLog('debug', message, context);
    }
  }
}

export const clientLogger = new ClientLogger();

