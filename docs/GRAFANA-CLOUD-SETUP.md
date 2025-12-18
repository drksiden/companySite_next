# Настройка Grafana Cloud для мониторинга

Это руководство поможет настроить полный мониторинг вашего сайта через Grafana Cloud с использованием Grafana Alloy.

## Преимущества Grafana Cloud

- ✅ Бесплатный тариф: 10,000 метрик, 50GB логов, 50GB трейсов
- ✅ Synthetic Monitoring (проверка доступности сайта)
- ✅ Готовые дашборды для инфраструктуры
- ✅ Уведомления в Telegram/Slack
- ✅ Не нужно поддерживать собственный стек

## Шаг 1: Регистрация и создание стека

1. Зарегистрируйтесь на https://grafana.com/auth/sign-up/create-user
2. Создайте новый стек (Stack)
3. Запишите:
   - **Instance ID** (например: `123456`)
   - **API Token** (создайте в разделе API Keys)
   - **Loki URL** (находится в разделе Connections → Loki)
   - **Prometheus URL** (находится в разделе Connections → Prometheus)

## Шаг 2: Настройка переменных окружения

Добавьте в `.env` на сервере:

```env
# Grafana Cloud Loki
GRAFANA_LOKI_URL=https://logs-prod-XXX.grafana.net/loki/api/v1/push
GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}
GRAFANA_LOKI_BASIC_AUTH=YOUR_INSTANCE_ID:YOUR_API_TOKEN

# Grafana Cloud Prometheus (для метрик через Alloy)
GRAFANA_PROMETHEUS_URL=https://prometheus-prod-XXX.grafana.net/api/prom/push
GRAFANA_PROMETHEUS_BASIC_AUTH=YOUR_INSTANCE_ID:YOUR_API_TOKEN

# Уровень логирования
LOG_LEVEL=info
```

## Шаг 3: Установка Grafana Alloy

Grafana Alloy собирает метрики системы (CPU, память, диск) и логи приложения, отправляя их в Grafana Cloud.

### Установка на Linux

```bash
# Скачайте последнюю версию
curl -O -L "https://github.com/grafana/alloy/releases/latest/download/alloy-linux-amd64.zip"
unzip alloy-linux-amd64.zip
sudo mv alloy-linux-amd64 /usr/local/bin/alloy
sudo chmod +x /usr/local/bin/alloy

# Создайте пользователя
sudo useradd --system --no-create-home --shell /bin/false alloy

# Создайте директории
sudo mkdir -p /etc/alloy
sudo mkdir -p /var/lib/alloy/data
sudo chown -R alloy:alloy /var/lib/alloy
```

### Создание конфигурации Alloy

Создайте файл `/etc/alloy/config.alloy`:

```alloy
// Конфигурация Grafana Alloy для отправки метрик и логов в Grafana Cloud

// Переменные (замените на ваши значения)
GRAFANA_CLOUD_INSTANCE_ID = env("GRAFANA_CLOUD_INSTANCE_ID")
GRAFANA_CLOUD_API_TOKEN = env("GRAFANA_CLOUD_API_TOKEN")
LOKI_URL = env("GRAFANA_LOKI_URL")
PROMETHEUS_URL = env("GRAFANA_PROMETHEUS_URL")

// Prometheus Remote Write (метрики)
prometheus.remote_write "grafana_cloud" {
  endpoint {
    url = PROMETHEUS_URL
    basic_auth {
      username = GRAFANA_CLOUD_INSTANCE_ID
      password = GRAFANA_CLOUD_API_TOKEN
    }
  }
}

// Loki (логи)
loki.write "grafana_cloud" {
  endpoint {
    url = LOKI_URL
    basic_auth {
      username = GRAFANA_CLOUD_INSTANCE_ID
      password = GRAFANA_CLOUD_API_TOKEN
    }
  }
}

// Сбор метрик системы (Node Exporter)
prometheus.scrape "node_exporter" {
  targets = [{"__address__" = "localhost:9100"}]
  forward_to = [prometheus.remote_write.grafana_cloud.receiver]
}

// Сбор метрик Docker
prometheus.scrape "docker" {
  targets = [{"__address__" = "localhost:9323"}]
  forward_to = [prometheus.remote_write.grafana_cloud.receiver]
}

// Сбор логов из Docker контейнеров
loki.source.docker "containers" {
  host       = "unix:///var/run/docker.sock"
  targets    = [
    {
      __path__ = "/var/lib/docker/containers/*/*-json.log",
      job      = "docker",
      app      = "company-site-next",
    },
  ]
  forward_to = [loki.write.grafana_cloud.receiver]
}

// Сбор логов из файлов приложения
loki.source.file "app_logs" {
  targets = [
    {
      __path__ = "/var/log/app/*.log",
      job      = "app",
      app      = "company-site-next",
    },
  ]
  forward_to = [loki.write.grafana_cloud.receiver]
}
```

### Создание systemd сервиса

Создайте `/etc/systemd/system/alloy.service`:

```ini
[Unit]
Description=Grafana Alloy
After=network-online.target
Wants=network-online.target

[Service]
User=alloy
Group=alloy
Type=simple
ExecStart=/usr/local/bin/alloy run --storage.path=/var/lib/alloy/data /etc/alloy/config.alloy
Restart=always
RestartSec=5
Environment="GRAFANA_CLOUD_INSTANCE_ID=YOUR_INSTANCE_ID"
Environment="GRAFANA_CLOUD_API_TOKEN=YOUR_API_TOKEN"
Environment="GRAFANA_LOKI_URL=https://logs-prod-XXX.grafana.net/loki/api/v1/push"
Environment="GRAFANA_PROMETHEUS_URL=https://prometheus-prod-XXX.grafana.net/api/prom/push"

[Install]
WantedBy=multi-user.target
```

### Запуск Alloy

```bash
# Обновите переменные окружения в systemd файле
sudo nano /etc/systemd/system/alloy.service

# Перезагрузите systemd
sudo systemctl daemon-reload

# Запустите Alloy
sudo systemctl enable alloy
sudo systemctl start alloy

# Проверьте статус
sudo systemctl status alloy

# Просмотрите логи
sudo journalctl -u alloy -f
```

## Шаг 4: Установка Node Exporter (для метрик системы)

Node Exporter собирает метрики Linux (CPU, память, диск, сеть).

```bash
# Скачайте Node Exporter
wget https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-*.linux-amd64.tar.gz
tar xvfz node_exporter-*.linux-amd64.tar.gz
sudo mv node_exporter-*.linux-amd64/node_exporter /usr/local/bin/

# Создайте systemd сервис
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Node Exporter
After=network-online.target

[Service]
User=nobody
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Запустите
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

## Шаг 5: Настройка Synthetic Monitoring

Synthetic Monitoring проверяет доступность вашего сайта из разных точек мира.

### В Grafana Cloud:

1. Откройте ваш стек в Grafana Cloud
2. Перейдите в **Synthetic Monitoring**
3. Нажмите **Add new check**
4. Выберите **HTTP** check
5. Настройте:
   - **Name**: Company Site Availability
   - **URL**: https://your-domain.com
   - **Frequency**: 1 minute
   - **Regions**: Выберите несколько регионов
6. Сохраните

### Настройка уведомлений

1. В Grafana Cloud перейдите в **Alerting** → **Notification channels**
2. Создайте канал для Telegram:
   - **Type**: Telegram
   - **Bot Token**: (создайте бота через @BotFather)
   - **Chat ID**: (ваш Telegram ID)
3. Создайте правило алерта:
   - **Condition**: Site is down
   - **Notification**: Отправлять в Telegram

## Шаг 6: Импорт готовых дашбордов

В Grafana Cloud есть библиотека готовых дашбордов:

1. Откройте ваш Grafana instance
2. Перейдите в **Dashboards** → **Import**
3. Импортируйте:
   - **Node Exporter Full** (ID: 1860) - метрики сервера
   - **Docker** (ID: 179) - метрики Docker
   - **Loki Logs** (ID: 13639) - просмотр логов

## Шаг 7: Обновление приложения

Убедитесь, что приложение отправляет логи в Grafana Cloud:

```bash
# Перезапустите приложение
docker-compose restart asia-ntb

# Проверьте логи
docker logs asia-ntb | grep -i loki
```

## Проверка работы

### 1. Проверьте Alloy

```bash
# Статус
sudo systemctl status alloy

# Логи
sudo journalctl -u alloy -f
```

### 2. Проверьте метрики в Grafana

1. Откройте ваш Grafana instance
2. Explore → Prometheus
3. Запрос: `up` (должны быть метрики)

### 3. Проверьте логи в Grafana

1. Explore → Loki
2. Запрос: `{app="company-site-next"}`

### 4. Проверьте Synthetic Monitoring

1. Synthetic Monitoring → Checks
2. Убедитесь, что все проверки зеленые

## Мониторинг лимитов

### Кардинальность метрик

Следите за количеством уникальных метрик:
- В Grafana: Explore → Prometheus → `count({__name__=~".+"})`
- Старайтесь не создавать метрики с высоким количеством уникальных значений

### Объем логов

Следите за использованием:
- В Grafana Cloud: **Usage** → **Logs**
- Используйте `LOG_LEVEL=info` в продакшене (не `debug`)

## Полезные запросы в Grafana

### Логи ошибок
```
{app="company-site-next", level="error"}
```

### Метрики CPU
```
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

### Метрики памяти
```
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
```

### Доступность сайта
```
probe_success{job="http"}
```

## Troubleshooting

### Alloy не отправляет данные

1. Проверьте переменные окружения:
   ```bash
   sudo systemctl show alloy | grep Environment
   ```

2. Проверьте логи:
   ```bash
   sudo journalctl -u alloy -n 50
   ```

3. Проверьте подключение:
   ```bash
   curl -u INSTANCE_ID:API_TOKEN https://logs-prod-XXX.grafana.net/loki/api/v1/labels
   ```

### Метрики не появляются

1. Проверьте Node Exporter:
   ```bash
   curl http://localhost:9100/metrics
   ```

2. Проверьте конфигурацию Alloy:
   ```bash
   sudo /usr/local/bin/alloy run --storage.path=/var/lib/alloy/data /etc/alloy/config.alloy --dry-run
   ```

### Synthetic Monitoring не работает

1. Проверьте, что URL доступен публично
2. Проверьте SSL сертификат
3. Убедитесь, что нет блокировки по IP

## Дополнительные ресурсы

- [Grafana Alloy документация](https://grafana.com/docs/alloy/latest/)
- [Grafana Cloud документация](https://grafana.com/docs/grafana-cloud/)
- [Synthetic Monitoring](https://grafana.com/docs/grafana-cloud/synthetic-monitoring/)

