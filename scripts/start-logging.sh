#!/bin/bash

# Скрипт для запуска стека логирования

set -e

echo "🚀 Starting logging stack (Grafana + Loki)..."

# Проверяем, установлен ли Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Проверяем, установлен ли docker-compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Определяем команду для docker-compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Запускаем стек
echo "📦 Starting containers..."
$DOCKER_COMPOSE -f docker-compose.logging.yml up -d

# Ждем немного для инициализации
echo "⏳ Waiting for services to start..."
sleep 5

# Проверяем статус
echo "📊 Checking service status..."
$DOCKER_COMPOSE -f docker-compose.logging.yml ps

echo ""
echo "✅ Logging stack is running!"
echo ""
echo "📍 Services:"
echo "   - Grafana:  http://localhost:3001 (admin/admin)"
echo "   - Loki:     http://localhost:3100"
echo ""
echo "📝 Useful commands:"
echo "   - View logs:    docker-compose -f docker-compose.logging.yml logs -f"
echo "   - Stop:         docker-compose -f docker-compose.logging.yml down"
echo "   - Restart:      docker-compose -f docker-compose.logging.yml restart"
echo ""

