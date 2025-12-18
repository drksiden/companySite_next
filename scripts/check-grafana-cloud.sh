#!/bin/bash

# Скрипт для проверки работы Grafana Cloud мониторинга

set -e

echo "🔍 Проверка работы Grafana Cloud мониторинга..."

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Проверка Alloy
echo ""
echo "📦 Проверка Grafana Alloy:"
if systemctl is-active --quiet alloy; then
    info "Alloy запущен"
    echo "   Версия: $(alloy --version 2>/dev/null || echo 'неизвестно')"
else
    error "Alloy не запущен"
    echo "   Запустите: sudo systemctl start alloy"
fi

# Проверка Node Exporter
echo ""
echo "📊 Проверка Node Exporter:"
if systemctl is-active --quiet node_exporter; then
    info "Node Exporter запущен"
    if curl -s http://localhost:9100/metrics > /dev/null 2>&1; then
        info "Node Exporter отвечает на http://localhost:9100"
    else
        warn "Node Exporter не отвечает на порту 9100"
    fi
else
    error "Node Exporter не запущен"
    echo "   Запустите: sudo systemctl start node_exporter"
fi

# Проверка конфигурации
echo ""
echo "⚙️  Проверка конфигурации:"
if [ -f /etc/alloy/config.alloy ]; then
    info "Конфигурация Alloy найдена"
    
    # Проверка синтаксиса
    if sudo -u alloy /usr/local/bin/alloy run --storage.path=/var/lib/alloy/data /etc/alloy/config.alloy --dry-run > /dev/null 2>&1; then
        info "Синтаксис конфигурации корректен"
    else
        error "Ошибка в конфигурации"
        echo "   Проверьте: sudo /usr/local/bin/alloy run --storage.path=/var/lib/alloy/data /etc/alloy/config.alloy --dry-run"
    fi
else
    error "Конфигурация Alloy не найдена"
fi

# Проверка переменных окружения
echo ""
echo "🔐 Проверка переменных окружения:"
if systemctl show alloy | grep -q "GRAFANA_CLOUD_INSTANCE_ID"; then
    info "Переменные окружения установлены"
else
    warn "Переменные окружения не найдены"
fi

# Проверка логов Alloy
echo ""
echo "📝 Последние логи Alloy:"
sudo journalctl -u alloy -n 5 --no-pager | tail -5 || warn "Не удалось получить логи"

# Проверка метрик
echo ""
echo "📈 Проверка метрик:"
if curl -s http://localhost:9100/metrics | grep -q "node_"; then
    info "Метрики Node Exporter доступны"
    METRIC_COUNT=$(curl -s http://localhost:9100/metrics | wc -l)
    echo "   Найдено метрик: $METRIC_COUNT"
else
    warn "Метрики Node Exporter недоступны"
fi

# Проверка Docker
echo ""
echo "🐳 Проверка Docker:"
if docker ps > /dev/null 2>&1; then
    info "Docker доступен"
    CONTAINER_COUNT=$(docker ps -q | wc -l)
    echo "   Запущено контейнеров: $CONTAINER_COUNT"
else
    warn "Docker недоступен или нет прав"
fi

echo ""
echo "✨ Проверка завершена!"
echo ""
echo "💡 Следующие шаги:"
echo "  1. Откройте ваш Grafana Cloud dashboard"
echo "  2. Проверьте метрики в Explore → Prometheus"
echo "  3. Проверьте логи в Explore → Loki"
echo "  4. Настройте Synthetic Monitoring для проверки доступности сайта"

