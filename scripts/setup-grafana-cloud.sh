#!/bin/bash

# Скрипт для установки Grafana Alloy и настройки мониторинга через Grafana Cloud

set -e

echo "🚀 Настройка Grafana Cloud мониторинга..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Пожалуйста, запустите скрипт с sudo"
    exit 1
fi

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Запрос данных от пользователя
echo ""
info "Вам понадобятся данные из Grafana Cloud:"
echo "  1. Instance ID"
echo "  2. API Token"
echo "  3. Loki URL"
echo "  4. Prometheus URL"
echo ""

read -p "Введите Instance ID: " INSTANCE_ID
read -p "Введите API Token: " API_TOKEN
read -p "Введите Loki URL (например: https://logs-prod-XXX.grafana.net/loki/api/v1/push): " LOKI_URL
read -p "Введите Prometheus URL (например: https://prometheus-prod-XXX.grafana.net/api/prom/push): " PROMETHEUS_URL

# Проверка ввода
if [ -z "$INSTANCE_ID" ] || [ -z "$API_TOKEN" ] || [ -z "$LOKI_URL" ] || [ -z "$PROMETHEUS_URL" ]; then
    error "Все поля обязательны!"
    exit 1
fi

info "Устанавливаем Grafana Alloy..."

# Определяем архитектуру
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    ALLOY_ARCH="amd64"
elif [ "$ARCH" = "aarch64" ]; then
    ALLOY_ARCH="arm64"
else
    error "Неподдерживаемая архитектура: $ARCH"
    exit 1
fi

# Скачиваем Alloy
ALLOY_VERSION=$(curl -s https://api.github.com/repos/grafana/alloy/releases/latest | grep tag_name | cut -d '"' -f 4)
info "Скачиваем Alloy версии $ALLOY_VERSION..."

cd /tmp
curl -L -o alloy.zip "https://github.com/grafana/alloy/releases/latest/download/alloy-linux-${ALLOY_ARCH}.zip"
unzip -o alloy.zip
sudo mv alloy-linux-${ALLOY_ARCH}/alloy /usr/local/bin/alloy
sudo chmod +x /usr/local/bin/alloy
rm -rf alloy.zip alloy-linux-${ALLOY_ARCH}

info "Alloy установлен: $(alloy --version)"

# Создаем пользователя
if ! id "alloy" &>/dev/null; then
    info "Создаем пользователя alloy..."
    useradd --system --no-create-home --shell /bin/false alloy
fi

# Создаем директории
info "Создаем директории..."
mkdir -p /etc/alloy
mkdir -p /var/lib/alloy/data
chown -R alloy:alloy /var/lib/alloy

# Создаем конфигурацию Alloy
info "Создаем конфигурацию Alloy..."

cat > /etc/alloy/config.alloy <<EOF
// Конфигурация Grafana Alloy для отправки метрик и логов в Grafana Cloud

// Переменные
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

// Сбор логов из Docker контейнеров
loki.source.docker "containers" {
  host       = "unix:///var/run/docker.sock"
  targets    = [
    {
      __path__ = "/var/lib/docker/containers/*/*-json.log",
      job      = "docker",
      app      = "company-site-next",
      environment = "production",
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
      environment = "production",
    },
  ]
  forward_to = [loki.write.grafana_cloud.receiver]
}
EOF

chown alloy:alloy /etc/alloy/config.alloy

# Создаем systemd сервис
info "Создаем systemd сервис..."

cat > /etc/systemd/system/alloy.service <<EOF
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
Environment="GRAFANA_CLOUD_INSTANCE_ID=$INSTANCE_ID"
Environment="GRAFANA_CLOUD_API_TOKEN=$API_TOKEN"
Environment="GRAFANA_LOKI_URL=$LOKI_URL"
Environment="GRAFANA_PROMETHEUS_URL=$PROMETHEUS_URL"

[Install]
WantedBy=multi-user.target
EOF

# Устанавливаем Node Exporter
info "Устанавливаем Node Exporter..."

if ! command -v node_exporter &> /dev/null; then
    NODE_EXPORTER_VERSION=$(curl -s https://api.github.com/repos/prometheus/node_exporter/releases/latest | grep tag_name | cut -d '"' -f 4 | sed 's/v//')
    info "Скачиваем Node Exporter версии $NODE_EXPORTER_VERSION..."
    
    cd /tmp
    wget -q "https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-${NODE_EXPORTER_VERSION}.linux-${ALLOY_ARCH}.tar.gz"
    tar xzf node_exporter-${NODE_EXPORTER_VERSION}.linux-${ALLOY_ARCH}.tar.gz
    sudo mv node_exporter-${NODE_EXPORTER_VERSION}.linux-${ALLOY_ARCH}/node_exporter /usr/local/bin/
    rm -rf node_exporter-${NODE_EXPORTER_VERSION}.linux-${ALLOY_ARCH}*
    
    # Создаем systemd сервис для Node Exporter
    cat > /etc/systemd/system/node_exporter.service <<EOF
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
    
    systemctl daemon-reload
    systemctl enable node_exporter
    systemctl start node_exporter
    
    info "Node Exporter установлен и запущен"
else
    info "Node Exporter уже установлен"
fi

# Запускаем Alloy
info "Запускаем Alloy..."

systemctl daemon-reload
systemctl enable alloy
systemctl start alloy

sleep 3

# Проверяем статус
if systemctl is-active --quiet alloy; then
    info "✅ Alloy успешно запущен!"
else
    error "❌ Alloy не запустился. Проверьте логи: sudo journalctl -u alloy -n 50"
    exit 1
fi

# Проверяем Node Exporter
if systemctl is-active --quiet node_exporter; then
    info "✅ Node Exporter работает!"
else
    warn "⚠️  Node Exporter не запущен"
fi

echo ""
info "✨ Установка завершена!"
echo ""
echo "📊 Полезные команды:"
echo "  Статус Alloy: sudo systemctl status alloy"
echo "  Логи Alloy: sudo journalctl -u alloy -f"
echo "  Статус Node Exporter: sudo systemctl status node_exporter"
echo ""
echo "🌐 Следующие шаги:"
echo "  1. Откройте ваш Grafana Cloud dashboard"
echo "  2. Настройте Synthetic Monitoring (проверка доступности сайта)"
echo "  3. Импортируйте готовые дашборды (Node Exporter, Docker)"
echo "  4. Настройте уведомления в Telegram/Slack"
echo ""
echo "📖 Документация: docs/GRAFANA-CLOUD-SETUP.md"

