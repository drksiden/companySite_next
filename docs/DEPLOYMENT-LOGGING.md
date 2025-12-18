# Настройка логирования на хостинге

## Варианты развертывания

### Вариант 1: Локальный стек (Docker Compose) - Рекомендуется

Используйте этот вариант, если у вас есть доступ к серверу и вы можете запускать Docker контейнеры.

#### Шаг 1: Обновите docker-compose.yml

Используйте `docker-compose.production.yml` или объедините его с основным `docker-compose.yml`:

```bash
# Объединить конфигурации
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

#### Шаг 2: Настройте переменные окружения

Добавьте в `.env` на сервере:

```env
# Grafana Loki
GRAFANA_LOKI_URL=http://loki:3100
GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}

# Grafana (опционально, если нужен доступ извне)
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_secure_password
GRAFANA_ROOT_URL=https://your-domain.com/grafana
GRAFANA_COOKIE_SECURE=true
GRAFANA_COOKIE_SAMESITE=strict

# Уровень логирования
LOG_LEVEL=info  # или warn для продакшена
```

#### Шаг 3: Запустите стек

```bash
# Остановите текущие контейнеры
docker-compose down

# Запустите с логированием
docker-compose -f docker-compose.production.yml up -d --build

# Проверьте статус
docker-compose -f docker-compose.production.yml ps

# Просмотрите логи
docker-compose -f docker-compose.production.yml logs -f
```

#### Шаг 4: Настройте Nginx (если используется)

Добавьте в конфигурацию Nginx:

```nginx
# Grafana
location /grafana/ {
    proxy_pass http://localhost:3001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Вариант 2: Grafana Cloud (Облачное решение)

Используйте этот вариант, если не хотите поддерживать собственный стек логирования.

#### Шаг 1: Создайте аккаунт Grafana Cloud

1. Зарегистрируйтесь на https://grafana.com/auth/sign-up/create-user
2. Создайте новый стек
3. Получите URL Loki и токен доступа

#### Шаг 2: Настройте переменные окружения

```env
# Grafana Cloud Loki
GRAFANA_LOKI_URL=https://logs-prod-XXX.grafana.net/loki/api/v1/push
GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}
GRAFANA_LOKI_BASIC_AUTH=your_instance_id:your_api_token

# Уровень логирования
LOG_LEVEL=info
```

#### Шаг 3: Обновите logger для поддержки Basic Auth

Если нужно, обновите `src/lib/logger/server.ts` для поддержки Basic Auth:

```typescript
if (process.env.GRAFANA_LOKI_URL && process.env.GRAFANA_LOKI_LABELS) {
  try {
    const LokiTransport = require('winston-loki').default || require('winston-loki');
    const lokiLabels = JSON.parse(process.env.GRAFANA_LOKI_LABELS);
    
    const lokiConfig: any = {
      host: process.env.GRAFANA_LOKI_URL,
      labels: lokiLabels,
      json: true,
      format: logFormat,
      replaceTimestamp: true,
      gracefulShutdown: true,
    };
    
    // Добавляем Basic Auth если указан
    if (process.env.GRAFANA_LOKI_BASIC_AUTH) {
      lokiConfig.basicAuth = process.env.GRAFANA_LOKI_BASIC_AUTH;
    }
    
    transports.push(new LokiTransport(lokiConfig));
  } catch (error) {
    // ...
  }
}
```

### Вариант 3: Внешний Loki (отдельный сервер)

Если у вас есть отдельный сервер для Loki:

#### Шаг 1: Настройте переменные окружения

```env
# Внешний Loki
GRAFANA_LOKI_URL=http://loki-server:3100
# или
GRAFANA_LOKI_URL=https://loki.your-domain.com

GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}
LOG_LEVEL=info
```

#### Шаг 2: Убедитесь, что сервер приложения может достучаться до Loki

Проверьте сетевую доступность:

```bash
# С сервера приложения
curl http://loki-server:3100/ready
```

## Обновление CI/CD

Обновите `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: self-hosted

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up SSH key
        uses: webfactory/ssh-agent@v0.5.3
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Deploy to server
        env:
          SERVER_USER: ${{ secrets.SERVER_USER }}
          SERVER_IP: ${{ secrets.SERVER_IP }}
        run: |
          ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
            cd companySite_next/
            git pull
            docker compose -f docker-compose.production.yml up -d --build
            # Перезапустить только приложение если нужно
            # docker compose restart asia-ntb
          EOF
```

## Проверка работы

### 1. Проверьте, что Loki работает

```bash
# На сервере
curl http://localhost:3100/ready
# Должно вернуть: ready
```

### 2. Проверьте, что логи отправляются

```bash
# Вызовите тестовый endpoint
curl http://localhost:22742/api/test-logging

# Проверьте логи Loki
curl "http://localhost:3100/loki/api/v1/query?query={app=\"company-site-next\"}&limit=5"
```

### 3. Откройте Grafana

```bash
# Локально на сервере
http://localhost:3001

# Или через домен (если настроен Nginx)
https://your-domain.com/grafana
```

## Безопасность

### Для продакшена обязательно:

1. **Измените пароль Grafana:**
   ```env
   GRAFANA_ADMIN_PASSWORD=strong_random_password
   ```

2. **Настройте HTTPS для Grafana:**
   - Используйте Nginx с SSL сертификатом
   - Установите `GRAFANA_COOKIE_SECURE=true`

3. **Ограничьте доступ к Loki:**
   - Не открывайте порт 3100 публично
   - Используйте firewall

4. **Ротация логов:**
   - Настройте retention policy в Loki
   - Ограничьте размер хранилища

## Мониторинг и алерты

### Настройте алерты в Grafana:

1. Откройте Grafana → Alerting → Alert rules
2. Создайте правило:

```yaml
# Пример алерта на критические ошибки
- alert: HighErrorRate
  expr: rate({app="company-site-next", level="error"}[5m]) > 0.1
  for: 5m
  annotations:
    summary: "Высокий уровень ошибок"
    description: "Более 0.1 ошибок в секунду за последние 5 минут"
```

## Резервное копирование

### Настройте бэкап данных Grafana и Loki:

```bash
# Бэкап Grafana
docker exec company-site-grafana tar czf /tmp/grafana-backup.tar.gz /var/lib/grafana
docker cp company-site-grafana:/tmp/grafana-backup.tar.gz ./grafana-backup.tar.gz

# Бэкап Loki (если нужно)
docker exec company-site-loki tar czf /tmp/loki-backup.tar.gz /loki
docker cp company-site-loki:/tmp/loki-backup.tar.gz ./loki-backup.tar.gz
```

## Troubleshooting

### Логи не появляются в Grafana

1. Проверьте переменные окружения:
   ```bash
   docker exec asia-ntb env | grep GRAFANA
   ```

2. Проверьте подключение к Loki:
   ```bash
   docker exec asia-ntb curl http://loki:3100/ready
   ```

3. Проверьте логи приложения:
   ```bash
   docker logs asia-ntb | grep -i error
   ```

### Grafana не запускается

1. Проверьте логи:
   ```bash
   docker logs company-site-grafana
   ```

2. Проверьте права доступа:
   ```bash
   ls -la grafana/provisioning/
   ```

### Loki переполняется

1. Настройте retention policy в `loki-config.yml`
2. Очистите старые логи:
   ```bash
   docker exec company-site-loki loki --config.file=/etc/loki/local-config.yaml --target=compactor
   ```

## Полезные команды

```bash
# Просмотр логов приложения
docker logs -f asia-ntb

# Просмотр логов Loki
docker logs -f company-site-loki

# Просмотр логов Grafana
docker logs -f company-site-grafana

# Перезапуск стека логирования
docker-compose -f docker-compose.production.yml restart

# Остановка стека логирования
docker-compose -f docker-compose.production.yml stop

# Удаление всех данных (ОСТОРОЖНО!)
docker-compose -f docker-compose.production.yml down -v
```

