import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level, message, context } = body;

    // Валидация данных
    if (!level || !message) {
      return NextResponse.json(
        { error: 'Level and message are required' },
        { status: 400 }
      );
    }

    // Логируем на сервере с контекстом клиента
    const logContext = {
      ...context,
      source: 'client',
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent'),
    };

    switch (level) {
      case 'error':
        logger.error(message, logContext);
        break;
      case 'warn':
        logger.warn(message, logContext);
        break;
      case 'info':
        logger.info(message, logContext);
        break;
      case 'debug':
        logger.debug(message, logContext);
        break;
      default:
        logger.info(message, logContext);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to process log from client', error as Error);
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    );
  }
}

