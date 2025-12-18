# Grafana Cloud - Быстрый старт

## 🚀 Что это дает

- ✅ **Бесплатный тариф**: 10,000 метрик, 50GB логов, 50GB трейсов
- ✅ **Synthetic Monitoring**: Автоматическая проверка доступности сайта из разных точек мира
- ✅ **Готовые дашборды**: Тысячи шаблонов для Nginx, Docker, Linux
- ✅ **Уведомления**: Telegram/Slack при проблемах
- ✅ **Не нужно поддерживать инфраструктуру**: Все в облаке

## 📋 Шаг 1: Регистрация и создание стека

**⚡ Быстрая инструкция (5 минут):** `docs/GRAFANA-CLOUD-QUICK-GUIDE.md`  
**📖 Подробная инструкция:** `docs/GRAFANA-CLOUD-REGISTRATION.md`

### Краткая версия:

1. Зарегистрируйтесь на https://grafana.com/auth/sign-up/create-user
2. Создайте новый стек (Stack):
   - Нажмите **Create a stack**
   - Введите название (например, `company-site-monitoring`)
   - Выберите регион и план **Free**
   - Нажмите **Create stack**
3. Получите данные:
   - **Instance ID**: Settings → Stack details → Stack ID
   - **API Token**: Security → API keys → Create API key
   - **Loki URL**: Connections → Loki → Push URL
   - **Prometheus URL**: Connections → Prometheus → Remote Write Endpoint

## 🔧 Шаг 2: Автоматическая установка

На вашем сервере:

```bash
# Скачайте скрипт (если еще не скачан)
cd /path/to/companySite_next

# Запустите установку
sudo ./scripts/setup-grafana-cloud.sh
```

Скрипт автоматически:
- ✅ Установит Grafana Alloy
- ✅ Установит Node Exporter (метрики системы)
- ✅ Настроит сбор логов из Docker
- ✅ Настроит отправку метрик и логов в Grafana Cloud

## ⚙️ Шаг 3: Настройка приложения

Добавьте в `.env`:

```env
# Grafana Cloud Loki
GRAFANA_LOKI_URL=https://logs-prod-XXX.grafana.net/loki/api/v1/push
GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}
GRAFANA_LOKI_BASIC_AUTH=YOUR_INSTANCE_ID:YOUR_API_TOKEN

# Уровень логирования
LOG_LEVEL=info
```

Перезапустите приложение:

```bash
docker-compose restart asia-ntb
```

## 📊 Шаг 4: Synthetic Monitoring (Проверка доступности)

1. В Grafana Cloud откройте **Synthetic Monitoring**
2. Нажмите **Add new check**
3. Выберите **HTTP** check
4. Настройте:
   - **Name**: Company Site
   - **URL**: https://your-domain.com
   - **Frequency**: 1 minute
5. Сохраните

Теперь Grafana будет проверять ваш сайт каждую минуту из разных точек мира!

## 🔔 Шаг 5: Уведомления в Telegram

1. Создайте бота через @BotFather в Telegram
2. Получите токен бота
3. Узнайте свой Chat ID (напишите @userinfobot)
4. В Grafana Cloud: **Alerting** → **Notification channels** → **Add channel**
5. Выберите **Telegram**, введите токен и Chat ID
6. Создайте правило алерта для Synthetic Monitoring

## 📈 Шаг 6: Импорт дашбордов

В Grafana Cloud:

1. **Dashboards** → **Import**
2. Импортируйте:
   - **Node Exporter Full** (ID: 1860) - метрики сервера
   - **Docker** (ID: 179) - метрики Docker
   - **Loki Logs** (ID: 13639) - просмотр логов

## ✅ Проверка работы

```bash
# Проверка всех компонентов
./scripts/check-grafana-cloud.sh

# Проверка Alloy
sudo systemctl status alloy

# Проверка Node Exporter
curl http://localhost:9100/metrics
```

## 📖 Полезные запросы в Grafana

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

## ⚠️ Важно: Лимиты бесплатного тарифа

### Кардинальность метрик
- Лимит: 10,000 уникальных метрик
- **Совет**: Не создавайте метрики с высоким количеством уникальных значений

### Объем логов
- Лимит: 50GB в месяц
- **Совет**: Используйте `LOG_LEVEL=info` в продакшене (не `debug`)

### Мониторинг использования
- В Grafana Cloud: **Usage** → проверяйте регулярно

## 🆘 Troubleshooting

### Alloy не отправляет данные

```bash
# Проверьте логи
sudo journalctl -u alloy -f

# Проверьте конфигурацию
sudo /usr/local/bin/alloy run --storage.path=/var/lib/alloy/data /etc/alloy/config.alloy --dry-run
```

### Метрики не появляются

```bash
# Проверьте Node Exporter
curl http://localhost:9100/metrics

# Проверьте статус
sudo systemctl status node_exporter
```

### Логи не появляются

1. Проверьте переменные окружения в приложении:
   ```bash
   docker exec asia-ntb env | grep GRAFANA
   ```

2. Проверьте логи приложения:
   ```bash
   docker logs asia-ntb | grep -i loki
   ```

## 📚 Дополнительная документация

- Полная инструкция: `docs/GRAFANA-CLOUD-SETUP.md`
- Локальная настройка: `docs/QUICK-START-PRODUCTION.md`
- Документация по ошибкам: `docs/ERROR-LOGGING.md`

## 🔗 Полезные ссылки

- [Grafana Cloud](https://grafana.com/products/cloud/)
- [Grafana Alloy документация](https://grafana.com/docs/alloy/latest/)
- [Synthetic Monitoring](https://grafana.com/docs/grafana-cloud/synthetic-monitoring/)

