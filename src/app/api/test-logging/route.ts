import { NextRequest, NextResponse } from 'next/server';
// Используем серверный логгер напрямую для API routes
import { logger, logError, logInfo, logWarn, logDebug, logHttp } from '@/lib/logger/server';

/**
 * Тестовый endpoint для проверки работы логирования
 * GET /api/test-logging - тестирует все уровни логирования
 */
export async function GET(request: NextRequest) {
  try {
    logInfo('Test logging endpoint called', {
      endpoint: '/api/test-logging',
      method: 'GET',
      timestamp: new Date().toISOString(),
    });

    // Тестируем разные уровни логирования
    logger.debug('Debug message - детальная информация для разработки', {
      test: true,
      level: 'debug',
    });

    logger.info('Info message - информационное сообщение', {
      test: true,
      level: 'info',
      user: 'test-user',
    });

    logger.warn('Warning message - предупреждение', {
      test: true,
      level: 'warn',
      warning: 'This is a test warning',
    });

    logHttp('HTTP request processed', {
      method: 'GET',
      path: '/api/test-logging',
      status: 200,
      duration: '50ms',
    });

    // Симулируем ошибку (но не выбрасываем её)
    const testError = new Error('Test error for logging');
    testError.stack = 'Error: Test error for logging\n    at test-logging route';
    
    logError('Test error logged (not thrown)', testError, {
      test: true,
      level: 'error',
      endpoint: '/api/test-logging',
    });

    return NextResponse.json({
      success: true,
      message: 'All log levels tested successfully',
      logs: {
        debug: 'Debug log sent',
        info: 'Info log sent',
        warn: 'Warning log sent',
        http: 'HTTP log sent',
        error: 'Error log sent',
      },
      instructions: {
        grafana: 'Check Grafana at http://localhost:3001',
        explore: 'Go to Explore → Loki → Query: {app="company-site-next"}',
        dashboard: 'Check dashboard "Company Site - Application Logs"',
      },
    });
  } catch (error) {
    logError('Failed to test logging', error as Error, {
      endpoint: '/api/test-logging',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test logging',
      },
      { status: 500 }
    );
  }
}

