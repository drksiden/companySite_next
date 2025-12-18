# Пошаговая инструкция: Регистрация и создание стека в Grafana Cloud

## Шаг 1: Регистрация аккаунта

1. Откройте https://grafana.com/auth/sign-up/create-user
2. Заполните форму:
   - **Email**: ваш email
   - **Password**: надежный пароль
   - **Name**: ваше имя (опционально)
3. Нажмите **Create account**
4. Проверьте email и подтвердите регистрацию (если требуется)

## Шаг 2: Вход в аккаунт

1. Откройте https://grafana.com/auth/sign-in
2. Введите email и пароль
3. Нажмите **Sign in**

## Шаг 3: Создание стека (Stack)

После входа вы попадете на главную страницу Grafana Cloud.

### Вариант A: Если у вас еще нет стека

1. На главной странице вы увидите кнопку **Create a stack** или **Get started**
2. Нажмите на неё
3. Заполните форму:
   - **Stack name**: например, `company-site-monitoring` или `my-production-stack`
   - **Region**: выберите ближайший регион (например, `US`, `EU`, `APAC`)
   - **Plan**: выберите **Free** (бесплатный тариф)
4. Нажмите **Create stack**

### Вариант B: Если стек уже создан

1. В верхнем меню найдите выпадающий список со стеками
2. Если там уже есть стек - выберите его
3. Если нужно создать новый - нажмите **Create a new stack**

## Шаг 4: Получение данных для подключения

После создания стека вам нужно получить несколько важных данных.

### 4.1. Instance ID (ID стека)

1. В левом меню нажмите на **Settings** (шестеренка) или **Stack settings**
2. В разделе **Stack details** вы увидите:
   - **Stack name**: название вашего стека
   - **Stack ID** или **Instance ID**: это число, например `123456`
3. **Скопируйте Instance ID** - он понадобится для настройки

### 4.2. API Token (токен доступа)

1. В левом меню перейдите в **Security** → **API keys** (или **Settings** → **API keys**)
2. Нажмите **Create API key** или **Add API key**
3. Заполните форму:
   - **Name**: например, `alloy-token` или `monitoring-token`
   - **Role**: выберите **Admin** (для полного доступа) или **MetricsPublisher** (только для отправки метрик)
   - **Time to live**: можно оставить пустым (бессрочный) или установить срок
4. Нажмите **Create API key**
5. **ВАЖНО**: Скопируйте токен сразу! Он показывается только один раз
   - Токен выглядит так: `glc_eyJvIjoiMTIzNDU2IiwibiI6ImFsbG95LXRva2VuIiwiaSI6IjEyMzQ1NiIsImsiOiJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eiJ9`
6. Сохраните токен в безопасном месте

### 4.3. Loki URL (для логов)

1. В левом меню перейдите в **Connections** → **Data sources** (или **Add data source**)
2. Найдите **Loki** в списке или нажмите **Add data source** → выберите **Loki**
3. В настройках Loki найдите раздел **Push URL** или **HTTP URL**
4. URL выглядит так: `https://logs-prod-XXX.grafana.net/loki/api/v1/push`
   - Где `XXX` - это номер вашего региона (например, `us`, `eu`, `ap`)
5. **Скопируйте этот URL** - это ваш `GRAFANA_LOKI_URL`

**Альтернативный способ:**
- В разделе **Connections** → **Loki** может быть кнопка **Send logs** или **Push logs**
- Там будет указан Push URL

### 4.4. Prometheus URL (для метрик)

1. В левом меню перейдите в **Connections** → **Data sources**
2. Найдите **Prometheus** или нажмите **Add data source** → выберите **Prometheus**
3. В настройках Prometheus найдите раздел **Remote Write Endpoint** или **HTTP URL**
4. URL выглядит так: `https://prometheus-prod-XXX.grafana.net/api/prom/push`
5. **Скопируйте этот URL** - это ваш `GRAFANA_PROMETHEUS_URL`

**Альтернативный способ:**
- В разделе **Connections** → **Prometheus** может быть раздел **Remote Write**
- Там будет указан Remote Write Endpoint

## Шаг 5: Проверка данных

У вас должно быть 4 значения:

1. ✅ **Instance ID**: число, например `123456`
2. ✅ **API Token**: строка, начинающаяся с `glc_...`
3. ✅ **Loki URL**: `https://logs-prod-XXX.grafana.net/loki/api/v1/push`
4. ✅ **Prometheus URL**: `https://prometheus-prod-XXX.grafana.net/api/prom/push`

## Шаг 6: Сохранение данных

Сохраните эти данные в безопасном месте (например, в менеджере паролей):

```
Grafana Cloud Stack:
- Instance ID: 123456
- API Token: glc_eyJvIjoiMTIzNDU2IiwibiI6ImFsbG95LXRva2VuIiwiaSI6IjEyMzQ1NiIsImsiOiJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eiJ9
- Loki URL: https://logs-prod-us.grafana.net/loki/api/v1/push
- Prometheus URL: https://prometheus-prod-us.grafana.net/api/prom/push
```

## Шаг 7: Использование данных

Теперь вы можете использовать эти данные для:

1. **Настройки приложения** (добавить в `.env`):
   ```env
   GRAFANA_LOKI_URL=https://logs-prod-XXX.grafana.net/loki/api/v1/push
   GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}
   GRAFANA_LOKI_BASIC_AUTH=123456:glc_eyJvIjoiMTIzNDU2IiwibiI6ImFsbG95LXRva2VuIiwiaSI6IjEyMzQ1NiIsImsiOiJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eiJ9
   ```

2. **Запуска скрипта установки Alloy**:
   ```bash
   sudo ./scripts/setup-grafana-cloud.sh
   ```
   Скрипт запросит эти данные.

## Частые вопросы

### Где найти Instance ID?

**Ответ**: В **Settings** → **Stack details** или в URL вашего стека (число после `/stacks/`)

### Где найти API Token?

**Ответ**: В **Security** → **API keys** → **Create API key**

### Где найти Loki URL?

**Ответ**: В **Connections** → **Loki** → раздел **Push URL** или **HTTP URL**

### Где найти Prometheus URL?

**Ответ**: В **Connections** → **Prometheus** → раздел **Remote Write Endpoint**

### Что делать, если не могу найти URL?

**Ответ**: 
1. Попробуйте перейти в **Connections** → **Add connection**
2. Выберите нужный сервис (Loki или Prometheus)
3. URL будет показан в процессе настройки

### Можно ли использовать один API Token для всего?

**Ответ**: Да, можно создать один токен с правами **Admin** и использовать его для всех сервисов.

### Безопасно ли хранить токен в .env?

**Ответ**: 
- ✅ Да, если `.env` файл не попадает в git (должен быть в `.gitignore`)
- ✅ На сервере используйте переменные окружения или секреты
- ❌ НЕ коммитьте `.env` в репозиторий!

## Следующие шаги

После получения всех данных:

1. ✅ Запустите скрипт установки: `sudo ./scripts/setup-grafana-cloud.sh`
2. ✅ Настройте приложение (добавьте переменные в `.env`)
3. ✅ Настройте Synthetic Monitoring (см. `docs/GRAFANA-CLOUD-SETUP.md`)
4. ✅ Импортируйте готовые дашборды

## Полезные ссылки

- [Grafana Cloud документация](https://grafana.com/docs/grafana-cloud/)
- [Создание API ключей](https://grafana.com/docs/grafana-cloud/account-management/authentication-and-permissions/api-keys/)
- [Настройка Loki](https://grafana.com/docs/grafana-cloud/data-configuration/connections/connect-loki/)
- [Настройка Prometheus](https://grafana.com/docs/grafana-cloud/data-configuration/connections/connect-prometheus/)

