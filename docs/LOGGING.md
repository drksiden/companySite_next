# Настройка логирования с Grafana Loki

## Быстрый старт (локальная разработка)

### 1. Запуск Grafana и Loki локально

```bash
# Запустить стек логирования
docker-compose -f docker-compose.logging.yml up -d

# Проверить статус
docker-compose -f docker-compose.logging.yml ps

# Просмотр логов
docker-compose -f docker-compose.logging.yml logs -f
```

После запуска:
- **Grafana**: http://localhost:3001 (admin/admin)
- **Loki**: http://localhost:3100

### 2. Настройка переменных окружения для локальной разработки

Создайте файл `.env.local` (или добавьте в существующий `.env`):

```env
# Уровень логирования (debug для разработки)
LOG_LEVEL=debug

# Grafana Loki для локальной разработки
GRAFANA_LOKI_URL=http://localhost:3100
GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"development"}

# Включить клиентское логирование (опционально)
NEXT_PUBLIC_ENABLE_CLIENT_LOGGING=false
```

### 3. Настройка Grafana (первый запуск)

1. Откройте http://localhost:3001
2. Войдите с учетными данными: `admin` / `admin`
3. Источник данных Loki должен быть настроен автоматически
4. Дашборд "Company Site - Application Logs" должен появиться автоматически

Если дашборд не появился:
- Перейдите в Configuration → Data Sources
- Проверьте, что Loki добавлен и доступен
- Перейдите в Dashboards → Import
- Импортируйте дашборд из `grafana/provisioning/dashboards/company-site-dashboard.json`

### 4. Проверка работы

Запустите приложение:

```bash
pnpm dev
```

Выполните несколько действий в приложении и проверьте логи в Grafana:
- Откройте http://localhost:3001
- Перейдите в Explore
- Выберите источник данных "Loki"
- Введите запрос: `{app="company-site-next"}`

## Переменные окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# Уровень логирования (error, warn, info, http, debug)
LOG_LEVEL=info

# Grafana Loki настройки
GRAFANA_LOKI_URL=http://localhost:3100
GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}

# Включить клиентское логирование (опционально)
NEXT_PUBLIC_ENABLE_CLIENT_LOGGING=false
```

### Описание переменных:

- `LOG_LEVEL` - минимальный уровень логирования (по умолчанию: `info` в production, `debug` в development)
- `GRAFANA_LOKI_URL` - URL вашего Grafana Loki инстанса (например: `http://loki:3100` или `https://logs.example.com`)
- `GRAFANA_LOKI_LABELS` - JSON объект с метками для всех логов (например: `{"app":"company-site-next","environment":"production","region":"eu-west"}`)
- `NEXT_PUBLIC_ENABLE_CLIENT_LOGGING` - включить отправку логов с клиента на сервер (по умолчанию: `false`)

## Использование

### На сервере (API routes, Server Components)

```typescript
import { logger, logError, logInfo } from '@/lib/logger';

// Простое логирование
logger.info('User logged in', { userId: '123' });

// С контекстом
logInfo('Product created', { 
  productId: '456',
  userId: '123',
  action: 'create'
});

// Логирование ошибок
try {
  // код
} catch (error) {
  logError('Failed to create product', error, {
    productId: '456',
    userId: '123'
  });
}
```

### На клиенте (Client Components)

```typescript
'use client';
import { clientLogger } from '@/lib/logger/client';

// Логирование ошибок
try {
  // код
} catch (error) {
  clientLogger.error('Failed to load data', error, {
    component: 'ProductList',
    userId: '123'
  });
}

// Информационные логи
clientLogger.info('User action', {
  action: 'click',
  element: 'add-to-cart',
  productId: '456'
});
```

## Уровни логирования

- `error` - Критические ошибки, требующие внимания
- `warn` - Предупреждения о потенциальных проблемах
- `info` - Информационные сообщения о работе приложения
- `http` - HTTP запросы и ответы
- `debug` - Детальная отладочная информация (только в development)

## Настройка Grafana Loki

### Docker Compose пример

```yaml
version: '3.8'
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - loki-data:/loki

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  loki-data:
  grafana-data:
```

### Добавление Loki как источника данных в Grafana

1. Откройте Grafana (обычно `http://localhost:3001`)
2. Перейдите в Configuration → Data Sources
3. Добавьте новый источник данных типа "Loki"
4. URL: `http://loki:3100` (или ваш URL)
5. Сохраните

### Пример запроса в Grafana

```
{app="company-site-next", level="error"}
```

## Мониторинг и алерты

### Пример дашборда в Grafana

Создайте панели для:
- Количество ошибок по времени
- Топ ошибок
- Производительность API endpoints
- Активность пользователей

### Настройка алертов

В Grafana можно настроить алерты на основе запросов Loki:
- Количество ошибок превышает порог
- Появление новых типов ошибок
- Медленные запросы

## Лучшие практики

1. **Используйте структурированное логирование** - всегда добавляйте контекст
2. **Не логируйте чувствительные данные** - пароли, токены, персональные данные
3. **Используйте правильные уровни** - не логируйте все как `error`
4. **Добавляйте уникальные идентификаторы** - requestId, userId для трейсинга
5. **Логируйте важные события** - создание/удаление данных, авторизация

## Отключение Loki

Если нужно временно отключить отправку в Loki, просто удалите или закомментируйте переменные `GRAFANA_LOKI_URL` и `GRAFANA_LOKI_LABELS`. Логи будут продолжать выводиться в консоль.

