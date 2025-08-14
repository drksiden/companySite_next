# Тесты проекта

Директория содержит тесты для проверки функциональности проекта.

## Структура

```
tests/
├── README.md                    # Эта документация
├── run-tests.js                 # Основной скрипт запуска тестов
├── api/                         # API тесты (требуют запущенный dev сервер)
│   ├── catalog.test.js          # Быстрые тесты каталога
│   ├── catalog-extended.test.js # Расширенные тесты каталога
│   ├── general.test.js          # Общие API тесты
│   └── product-edit.test.js     # Тесты редактирования продуктов
└── utils/                       # Тесты утилит (не требуют сервер)
    └── formatPrice.test.js      # Тест форматирования цен
```

## Запуск тестов

### Быстрые тесты (рекомендуется)
```bash
node tests/run-tests.js quick
```

### Все тесты
```bash
node tests/run-tests.js all
```

### По категориям
```bash
# Только утилиты (без сервера)
node tests/run-tests.js utils

# Только API тесты (требует pnpm dev)
node tests/run-tests.js api
```

### Индивидуальные тесты
```bash
# Тест форматирования цен
node tests/utils/formatPrice.test.js

# Тест API каталога
node tests/api/catalog.test.js
```

## Требования

### Для всех тестов
- Node.js 18+
- Установленные зависимости (`pnpm install`)

### Для API тестов
- Запущенный dev сервер (`pnpm dev`)
- Настроенные переменные окружения в `.env.local`
- Работающая база данных Supabase

## Создание новых тестов

### Тест утилиты
Создайте файл `tests/utils/yourFunction.test.js`:

```javascript
#!/usr/bin/env node

// Импортируйте или скопируйте функцию для тестирования
function yourFunction(input) {
  // Ваша функция
}

function runTests() {
  console.log('🧪 Testing yourFunction...\n');
  
  const testCases = [
    { input: 'test', expected: 'result' },
    // Добавьте тест-кейсы
  ];

  let passed = 0;
  
  testCases.forEach((test, index) => {
    try {
      const result = yourFunction(test.input);
      const success = result === test.expected;
      
      console.log(`Test ${index + 1}: ${success ? '✅ PASS' : '❌ FAIL'}`);
      if (success) passed++;
    } catch (error) {
      console.log(`Test ${index + 1}: ❌ FAIL - ${error.message}`);
    }
  });

  return passed === testCases.length;
}

if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}
```

### API тест
Создайте файл `tests/api/yourEndpoint.test.js`:

```javascript
#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(url, description) {
  console.log(`🧪 Testing: ${description}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success ? '✅' : '❌'}`);
    
    return response.ok && data.success;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const tests = [
    { url: `${BASE_URL}/api/your-endpoint`, description: 'Your endpoint' },
  ];

  let passed = 0;
  for (const test of tests) {
    if (await testEndpoint(test.url, test.description)) {
      passed++;
    }
  }

  return passed === tests.length;
}

if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
```

## Отладка тестов

### Если API тесты падают
1. Убедитесь, что dev сервер запущен: `pnpm dev`
2. Проверьте переменные окружения в `.env.local`
3. Проверьте логи сервера на наличие ошибок
4. Попробуйте вызвать API вручную через curl

### Если утилитарные тесты падают
1. Проверьте, что функция импортирована правильно
2. Убедитесь, что все зависимости установлены
3. Проверьте типы входных параметров

## Интеграция с CI/CD

Добавьте в `package.json`:

```json
{
  "scripts": {
    "test:quick": "node tests/run-tests.js quick",
    "test:all": "node tests/run-tests.js all",
    "test:api": "node tests/run-tests.js api",
    "test:utils": "node tests/run-tests.js utils"
  }
}
```

Тогда можно запускать:
```bash
pnpm test:quick
pnpm test:all
```

## Примеры использования

### Проверка после изменений
```bash
# После изменения утилит
pnpm test:utils

# После изменения API
pnpm test:api

# Быстрая проверка основной функциональности
pnpm test:quick
```

### Проверка перед коммитом
```bash
# Полная проверка
pnpm test:all
```

### Отладка конкретной проблемы
```bash
# Только тест форматирования цен
node tests/utils/formatPrice.test.js

# Только тест каталога
node tests/api/catalog.test.js
```
