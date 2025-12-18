#!/bin/bash

# Скрипт для остановки стека логирования

set -e

echo "🛑 Stopping logging stack..."

# Определяем команду для docker-compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Останавливаем стек
$DOCKER_COMPOSE -f docker-compose.logging.yml down

echo "✅ Logging stack stopped!"

