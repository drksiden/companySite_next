# Импорт дашборда в Grafana

## Шаг 1: Проверьте источник данных Loki

1. Откройте Grafana: http://localhost:3001
2. Войдите: `admin` / `admin`
3. Перейдите в **Configuration** → **Data Sources**
4. Убедитесь, что источник данных **Loki** существует
5. Если его нет, добавьте:
   - Нажмите **Add data source**
   - Выберите **Loki**
   - **Name**: `Loki`
   - **UID**: `loki` (важно!)
   - **URL**: `http://loki:3100`
   - Нажмите **Save & Test**

## Шаг 2: Импорт дашборда

### Вариант A: Импорт через JSON файл

1. Перейдите в **Dashboards** → **Import** (или "+" → **Import**)
2. Нажмите **Upload JSON file**
3. Выберите файл: `grafana/provisioning/dashboards/company-site-dashboard.json`
4. В разделе **Data source mappings**:
   - Убедитесь, что выбран **Loki** с **UID: loki**
   - Если требуется, выберите **Loki** из выпадающего списка
5. Нажмите **Import**

### Вариант B: Импорт через панель JSON

1. Перейдите в **Dashboards** → **Import**
2. Нажмите **Import via panel json**
3. Откройте файл `grafana/provisioning/dashboards/company-site-dashboard.json`
4. Скопируйте всё содержимое и вставьте в поле
5. В разделе **Data source mappings**:
   - Выберите **Loki** с **UID: loki**
6. Нажмите **Import**

## Шаг 3: Проверка

После импорта:
1. Откройте дашборд **Company Site - Application Logs**
2. Вы должны увидеть панели с логами
3. Вызовите `/api/test-logging` в вашем приложении
4. Обновите дашборд - должны появиться новые логи

## Если источник данных не найден

Если при импорте система не находит источник данных:

1. Убедитесь, что источник данных создан с **UID: loki**
2. Перезапустите Grafana:
   ```bash
   docker-compose -f docker-compose.logging.yml restart grafana
   ```
3. Попробуйте импортировать снова

## Ручное создание простого дашборда

Если импорт не работает, создайте дашборд вручную:

1. **Dashboards** → **New** → **New Dashboard**
2. Нажмите **Add visualization**
3. Выберите источник данных **Loki**
4. В поле запроса введите: `{app="company-site-next"}`
5. Нажмите **Run query**
6. Сохраните дашборд: **Save dashboard** → Имя: "Company Site Logs"

