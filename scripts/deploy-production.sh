#!/bin/bash

# Скрипт для деплоя приложения с логированием на продакшн

set -e

echo "🚀 Начинаем деплой на продакшн..."

# Проверяем наличие необходимых файлов
if [ ! -f "docker-compose.production.yml" ]; then
    echo "❌ Файл docker-compose.production.yml не найден!"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден. Убедитесь, что переменные окружения настроены."
fi

# Проверяем переменные окружения для логирования
if [ -z "$GRAFANA_LOKI_URL" ]; then
    echo "⚠️  GRAFANA_LOKI_URL не установлен. Логирование в Loki будет отключено."
fi

# Останавливаем старые контейнеры
echo "📦 Останавливаем старые контейнеры..."
docker-compose -f docker-compose.production.yml down || true

# Собираем и запускаем новые контейнеры
echo "🔨 Собираем и запускаем контейнеры..."
docker-compose -f docker-compose.production.yml up -d --build

# Ждем запуска контейнеров
echo "⏳ Ждем запуска контейнеров..."
sleep 10

# Проверяем статус
echo "📊 Проверяем статус контейнеров..."
docker-compose -f docker-compose.production.yml ps

# Проверяем здоровье сервисов
echo "🏥 Проверяем здоровье сервисов..."

# Проверка приложения
if curl -f http://localhost:22742/api/health > /dev/null 2>&1; then
    echo "✅ Приложение работает"
else
    echo "⚠️  Приложение не отвечает на /api/health"
fi

# Проверка Loki
if curl -f http://localhost:3100/ready > /dev/null 2>&1; then
    echo "✅ Loki работает"
else
    echo "⚠️  Loki не отвечает"
fi

# Проверка Grafana
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Grafana работает"
else
    echo "⚠️  Grafana не отвечает"
fi

echo ""
echo "✨ Деплой завершен!"
echo ""
echo "📝 Полезные команды:"
echo "  Просмотр логов: docker-compose -f docker-compose.production.yml logs -f"
echo "  Остановка: docker-compose -f docker-compose.production.yml down"
echo "  Перезапуск: docker-compose -f docker-compose.production.yml restart"
echo ""
echo "🌐 Доступ:"
echo "  Приложение: http://localhost:22742"
echo "  Grafana: http://localhost:3001"
echo "  Loki: http://localhost:3100"

