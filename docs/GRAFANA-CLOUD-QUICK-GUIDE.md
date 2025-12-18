# Быстрая инструкция: Создание стека в Grafana Cloud

## 🎯 Цель

Создать стек в Grafana Cloud и получить 4 важных значения для настройки мониторинга.

## ⚡ Быстрые шаги

### 1. Регистрация (2 минуты)

```
1. Откройте: https://grafana.com/auth/sign-up/create-user
2. Заполните email и пароль
3. Подтвердите email (если требуется)
```

### 2. Создание стека (1 минута)

**⚠️ Если не видите "Create a stack":**

**Вариант A:** Стек может создаться автоматически при регистрации
- Проверьте URL: `https://YOUR-NAME.grafana.net`
- Или верхний правый угол - там может быть название стека

**Вариант B:** Создайте вручную
```
1. Откройте https://grafana.com
2. Войдите в аккаунт
3. В верхнем меню найдите "Create stack" или "New stack"
4. Или перейдите: https://grafana.com/orgs/new
5. Название: company-site-monitoring
6. Регион: выберите ближайший (US/EU/APAC)
7. План: Free
8. Нажмите "Create stack"
```

**📖 Если не нашли:** См. `docs/GRAFANA-CLOUD-FIND-STACK.md`

### 3. Получение Instance ID (30 секунд)

```
1. Settings (шестеренка) → Stack settings
2. Найдите "Stack ID" или "Instance ID"
3. Скопируйте число (например: 123456)
```

### 4. Создание API Token (1 минута)

```
1. Security → API keys
2. Create API key
3. Name: monitoring-token
4. Role: Admin
5. Create API key
6. ⚠️ СКОПИРУЙТЕ ТОКЕН СРАЗУ! (показывается один раз)
```

### 5. Получение Loki URL (30 секунд)

```
1. Connections → Data sources
2. Найдите "Loki" или Add → Loki
3. Найдите "Push URL" или "HTTP URL"
4. Скопируйте URL (например: https://logs-prod-us.grafana.net/loki/api/v1/push)
```

### 6. Получение Prometheus URL (30 секунд)

```
1. Connections → Data sources
2. Найдите "Prometheus" или Add → Prometheus
3. Найдите "Remote Write Endpoint"
4. Скопируйте URL (например: https://prometheus-prod-us.grafana.net/api/prom/push)
```

## ✅ Результат

У вас должно быть 4 значения:

```
Instance ID: 123456
API Token: glc_eyJvIjoiMTIzNDU2IiwibiI6ImFsbG95LXRva2VuIiwiaSI6IjEyMzQ1NiIsImsiOiJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eiJ9
Loki URL: https://logs-prod-us.grafana.net/loki/api/v1/push
Prometheus URL: https://prometheus-prod-us.grafana.net/api/prom/push
```

## 🚀 Что дальше?

1. Запустите скрипт установки:
   ```bash
   sudo ./scripts/setup-grafana-cloud.sh
   ```
   (скрипт запросит эти 4 значения)

2. Или добавьте в `.env`:
   ```env
   GRAFANA_LOKI_URL=https://logs-prod-us.grafana.net/loki/api/v1/push
   GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}
   GRAFANA_LOKI_BASIC_AUTH=123456:glc_eyJvIjoiMTIzNDU2IiwibiI6ImFsbG95LXRva2VuIiwiaSI6IjEyMzQ1NiIsImsiOiJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eiJ9
   ```

## 📖 Подробная инструкция

Если что-то непонятно, см. полную инструкцию: `docs/GRAFANA-CLOUD-REGISTRATION.md`

## ❓ Проблемы?

### Не могу найти Instance ID
→ Settings → Stack settings → Stack ID (число)

### Не могу найти API Token
→ Security → API keys → Create API key

### Не могу найти Loki URL
→ Connections → Loki → Push URL (или HTTP URL)

### Не могу найти Prometheus URL
→ Connections → Prometheus → Remote Write Endpoint

### Токен не работает
→ Убедитесь, что скопировали полностью (начинается с `glc_`)
→ Проверьте, что токен не истек (если установили срок)

