# Быстрый старт: Логирование на продакшене

## ⭐ Вариант 1: Grafana Cloud с Alloy (Рекомендуется)

**Преимущества:** Бесплатный тариф, Synthetic Monitoring, готовые дашборды, не нужно поддерживать инфраструктуру.

### Быстрая установка

```bash
# Запустите автоматический скрипт установки
sudo ./scripts/setup-grafana-cloud.sh
```

Скрипт запросит:
- Instance ID из Grafana Cloud
- API Token
- Loki URL
- Prometheus URL

### Ручная установка

См. полную инструкцию: `docs/GRAFANA-CLOUD-SETUP.md`

### Проверка работы

```bash
./scripts/check-grafana-cloud.sh
```

## Вариант 2: Локальный Docker Compose

### Шаг 1: Настройте переменные окружения

Добавьте в `.env` на сервере:

```env
# Grafana Loki
GRAFANA_LOKI_URL=http://loki:3100
GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}

# Уровень логирования
LOG_LEVEL=info
```

### Шаг 2: Запустите деплой

```bash
# Используйте готовый скрипт
./scripts/deploy-production.sh

# Или вручную
docker-compose -f docker-compose.production.yml up -d --build
```

### Шаг 3: Проверьте работу

```bash
# Проверка всех сервисов
./scripts/check-logging.sh

# Или вручную
curl http://localhost:22742/api/test-logging
curl http://localhost:3100/ready
curl http://localhost:3001/api/health
```

### Шаг 4: Откройте Grafana

- Локально: http://localhost:3001
- Через домен: https://your-domain.com/grafana (если настроен Nginx)

## Вариант 2: Grafana Cloud (Облачное решение)

### Шаг 1: Создайте аккаунт

1. Зарегистрируйтесь на https://grafana.com
2. Создайте новый стек
3. Получите URL Loki и токен доступа

### Шаг 2: Настройте переменные окружения

```env
# Grafana Cloud Loki
GRAFANA_LOKI_URL=https://logs-prod-XXX.grafana.net/loki/api/v1/push
GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}
GRAFANA_LOKI_BASIC_AUTH=your_instance_id:your_api_token

# Уровень логирования
LOG_LEVEL=info
```

### Шаг 3: Перезапустите приложение

```bash
docker-compose restart asia-ntb
```

### Шаг 4: Проверьте логи в Grafana Cloud

Откройте ваш Grafana Cloud dashboard и используйте запрос:
```
{app="company-site-next"}
```

## Вариант 3: Обновление существующего docker-compose.yml

Если вы хотите добавить логирование в существующий `docker-compose.yml`:

```yaml
services:
  asia-ntb:
    # ... существующая конфигурация ...
    networks:
      - app-network
      - logging-network  # Добавьте эту сеть
    depends_on:
      - loki  # Добавьте зависимость

  # Добавьте эти сервисы
  loki:
    image: grafana/loki:latest
    container_name: company-site-loki
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - loki-data:/loki
    networks:
      - logging-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: company-site-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=your_password
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    networks:
      - logging-network
    restart: unless-stopped
    depends_on:
      - loki

volumes:
  loki-data:
  grafana-data:

networks:
  app-network:
  logging-network:
```

## Проверка работы

### 1. Проверьте переменные окружения в контейнере

```bash
docker exec asia-ntb env | grep GRAFANA
```

### 2. Проверьте логи приложения

```bash
docker logs asia-ntb | grep -i "log\|error" | tail -20
```

### 3. Проверьте подключение к Loki

```bash
docker exec asia-ntb curl http://loki:3100/ready
```

### 4. Откройте Grafana и проверьте логи

1. Откройте http://localhost:3001
2. Войдите: admin / ваш_пароль
3. Explore → Loki
4. Запрос: `{app="company-site-next"}`

## Troubleshooting

### Логи не появляются

1. Проверьте переменные окружения:
   ```bash
   docker exec asia-ntb env | grep GRAFANA
   ```

2. Проверьте логи приложения:
   ```bash
   docker logs asia-ntb 2>&1 | grep -i loki
   ```

3. Проверьте подключение:
   ```bash
   docker exec asia-ntb ping -c 1 loki
   ```

### Grafana не запускается

1. Проверьте логи:
   ```bash
   docker logs company-site-grafana
   ```

2. Проверьте права:
   ```bash
   ls -la grafana/provisioning/
   ```

### Loki недоступен

1. Проверьте статус:
   ```bash
   docker ps | grep loki
   ```

2. Проверьте логи:
   ```bash
   docker logs company-site-loki
   ```

## Полезные команды

```bash
# Просмотр всех логов
docker-compose -f docker-compose.production.yml logs -f

# Просмотр логов приложения
docker logs -f asia-ntb

# Перезапуск стека
docker-compose -f docker-compose.production.yml restart

# Остановка
docker-compose -f docker-compose.production.yml stop

# Обновление
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

## Безопасность

⚠️ **Важно для продакшена:**

1. Измените пароль Grafana:
   ```env
   GRAFANA_ADMIN_PASSWORD=strong_random_password
   ```

2. Настройте HTTPS через Nginx

3. Не открывайте порты 3100 и 3001 публично

4. Используйте firewall для ограничения доступа

## Дополнительная информация

- Полная документация: `docs/DEPLOYMENT-LOGGING.md`
- Локальная настройка: `README-LOGGING.md`
- Документация по ошибкам: `docs/ERROR-LOGGING.md`

