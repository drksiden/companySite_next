/**
 * Серверный логгер с поддержкой Grafana Loki
 * Этот файл должен использоваться только на сервере
 */

import winston from 'winston';

// Уровни логирования
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Цвета для консоли
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Формат для логов
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Формат для консоли (более читаемый)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Транспорты
const transports: winston.transport[] = [
  // Консольный транспорт (всегда активен)
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),
];

// Добавляем транспорт для Grafana Loki, если настроен
// Загружаем winston-loki только здесь, на сервере
if (process.env.GRAFANA_LOKI_URL && process.env.GRAFANA_LOKI_LABELS) {
  try {
    console.log('[Logger] Attempting to load winston-loki...');
    // Динамический require только на сервере
    const LokiTransport = require('winston-loki').default || require('winston-loki');
    console.log('[Logger] winston-loki loaded successfully');
    
    const lokiLabels = JSON.parse(process.env.GRAFANA_LOKI_LABELS);
    console.log('[Logger] Loki labels:', lokiLabels);
    
    // winston-loki ожидает базовый URL без пути /loki/api/v1/push
    // Для Grafana Cloud нужно использовать базовый URL стека
    let lokiHost = process.env.GRAFANA_LOKI_URL;
    if (lokiHost.includes('/loki/api/v1/push')) {
      // Убираем путь, оставляем только базовый URL
      lokiHost = lokiHost.replace('/loki/api/v1/push', '');
      console.log('[Logger] Adjusted Loki URL:', lokiHost);
    }
    
    const lokiConfig: any = {
      host: lokiHost,
      labels: lokiLabels,
      json: true,
      format: logFormat,
      replaceTimestamp: true,
      onConnectionError: (err: Error) => {
        console.error('[Logger] Loki connection error:', err.message);
        if (err.stack) {
          console.error('[Logger] Stack:', err.stack);
        }
      },
      gracefulShutdown: true,
    };
    
    // Поддержка Basic Auth для Grafana Cloud
    // Формат: INSTANCE_ID:API_TOKEN
    if (process.env.GRAFANA_LOKI_BASIC_AUTH) {
      const [username, password] = process.env.GRAFANA_LOKI_BASIC_AUTH.split(':');
      if (username && password) {
        lokiConfig.basicAuth = { username, password };
        console.log('[Logger] Basic Auth configured (username:', username.substring(0, 4) + '...)');
      } else {
        // Fallback: если формат неверный, используем как есть (для совместимости)
        lokiConfig.basicAuth = process.env.GRAFANA_LOKI_BASIC_AUTH;
        console.warn('[Logger] Basic Auth format may be incorrect');
      }
    }
    
    const lokiTransport = new LokiTransport(lokiConfig);
    transports.push(lokiTransport);
    console.log('[Logger] Loki transport added successfully. URL:', process.env.GRAFANA_LOKI_URL);
  } catch (error) {
    // Логируем ошибки загрузки winston-loki
    console.error('[Logger] Failed to load winston-loki:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('[Logger] Stack:', error.stack);
    }
  }
} else {
  console.log('[Logger] Grafana Loki not configured (missing GRAFANA_LOKI_URL or GRAFANA_LOKI_LABELS)');
}

// Создаем логгер
export const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports,
  // Обработка необработанных исключений
  exceptionHandlers: transports,
  rejectionHandlers: transports,
});

// Типы для логирования
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

// Вспомогательные функции для структурированного логирования
export const logWithContext = (
  level: LogLevel,
  message: string,
  context?: Record<string, any>
) => {
  logger[level](message, { ...context, timestamp: new Date().toISOString() });
};

// Экспортируем удобные методы
export const logError = (message: string, error?: Error | unknown, context?: Record<string, any>) => {
  const errorContext = {
    ...context,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : error,
  };
  logger.error(message, errorContext);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context);
};

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context);
};

export const logHttp = (message: string, context?: Record<string, any>) => {
  logger.http(message, context);
};

export default logger;

