#!/bin/bash

# Скрипт для проверки работы логирования

set -e

echo "🔍 Проверка работы логирования..."

# Проверка переменных окружения
echo ""
echo "📋 Переменные окружения:"
if [ -n "$GRAFANA_LOKI_URL" ]; then
    echo "  ✅ GRAFANA_LOKI_URL установлен: $GRAFANA_LOKI_URL"
else
    echo "  ❌ GRAFANA_LOKI_URL не установлен"
fi

if [ -n "$GRAFANA_LOKI_LABELS" ]; then
    echo "  ✅ GRAFANA_LOKI_LABELS установлен"
else
    echo "  ❌ GRAFANA_LOKI_LABELS не установлен"
fi

# Проверка контейнеров
echo ""
echo "🐳 Статус контейнеров:"
docker ps --filter "name=asia-ntb" --format "table {{.Names}}\t{{.Status}}" || echo "  ❌ Контейнер asia-ntb не запущен"
docker ps --filter "name=loki" --format "table {{.Names}}\t{{.Status}}" || echo "  ❌ Контейнер Loki не запущен"
docker ps --filter "name=grafana" --format "table {{.Names}}\t{{.Status}}" || echo "  ❌ Контейнер Grafana не запущен"

# Проверка доступности сервисов
echo ""
echo "🌐 Проверка доступности сервисов:"

# Приложение
if curl -f http://localhost:22742/api/health > /dev/null 2>&1; then
    echo "  ✅ Приложение доступно на http://localhost:22742"
else
    echo "  ❌ Приложение недоступно"
fi

# Loki
if curl -f http://localhost:3100/ready > /dev/null 2>&1; then
    echo "  ✅ Loki доступен на http://localhost:3100"
    
    # Проверка запроса логов
    echo ""
    echo "  📊 Проверка запроса логов из Loki:"
    LOGS=$(curl -s "http://localhost:3100/loki/api/v1/query?query={app=\"company-site-next\"}&limit=1" 2>/dev/null)
    if [ -n "$LOGS" ] && echo "$LOGS" | grep -q "values"; then
        echo "    ✅ Логи найдены в Loki"
    else
        echo "    ⚠️  Логи не найдены (это нормально, если приложение только запущено)"
    fi
else
    echo "  ❌ Loki недоступен"
fi

# Grafana
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "  ✅ Grafana доступна на http://localhost:3001"
else
    echo "  ❌ Grafana недоступна"
fi

# Тест отправки логов
echo ""
echo "🧪 Тест отправки логов:"
if curl -f http://localhost:22742/api/test-logging > /dev/null 2>&1; then
    echo "  ✅ Тестовый endpoint вызван"
    echo "  ⏳ Ждем 2 секунды для обработки..."
    sleep 2
    
    # Проверяем логи
    LOGS=$(curl -s "http://localhost:3100/loki/api/v1/query?query={app=\"company-site-next\"}&limit=5" 2>/dev/null)
    if echo "$LOGS" | grep -q "test"; then
        echo "  ✅ Тестовые логи найдены в Loki"
    else
        echo "  ⚠️  Тестовые логи не найдены (проверьте переменные окружения)"
    fi
else
    echo "  ❌ Не удалось вызвать тестовый endpoint"
fi

echo ""
echo "✨ Проверка завершена!"

