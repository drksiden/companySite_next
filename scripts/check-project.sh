#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Счетчики
PASSED=0
FAILED=0
TOTAL=0

# Функция для вывода результата проверки
check_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"

    TOTAL=$((TOTAL + 1))

    if [ "$result" = "true" ]; then
        echo -e "✅ ${GREEN}PASS${NC} $test_name"
        PASSED=$((PASSED + 1))
        if [ -n "$details" ]; then
            echo -e "    ${BLUE}ℹ${NC} $details"
        fi
    else
        echo -e "❌ ${RED}FAIL${NC} $test_name"
        FAILED=$((FAILED + 1))
        if [ -n "$details" ]; then
            echo -e "    ${YELLOW}⚠${NC} $details"
        fi
    fi
}

# Функция для проверки существования файла
file_exists() {
    [ -f "$1" ]
}

# Функция для проверки существования директории
dir_exists() {
    [ -d "$1" ]
}

# Функция для подсчета файлов в директории
count_files() {
    find "$1" -maxdepth 1 -type f 2>/dev/null | wc -l
}

# Функция для поиска паттерна в файлах
search_pattern() {
    local pattern="$1"
    local path="$2"
    grep -r "$pattern" "$path" 2>/dev/null | wc -l
}

echo -e "${BLUE}🔍 Запуск финальной проверки проекта...${NC}\n"

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo -e "${RED}❌ Ошибка: Запустите скрипт из корня проекта Next.js${NC}"
    exit 1
fi

echo -e "${YELLOW}=== 1. КЛИЕНТЫ И УТИЛИТЫ ===${NC}"

# Проверка файлов в src/lib/
check_result "supabaseClient.ts существует" "$(file_exists "./src/lib/supabaseClient.ts")"
check_result "supabaseServer.ts существует" "$(file_exists "./src/lib/supabaseServer.ts")"
check_result "r2.ts существует" "$(file_exists "./src/lib/r2.ts")"
check_result "imageUtils.ts существует" "$(file_exists "./src/lib/imageUtils.ts")"

# Проверка на дублирующиеся клиенты
duplicate_clients=$(search_pattern "new SupabaseClient\|createClient.*supabase" "./src/" | grep -v "src/lib/supabase" | wc -l)
check_result "Нет дублей клиентов Supabase" "$([ "$duplicate_clients" -eq 0 ] && echo true || echo false)" "Найдено $duplicate_clients потенциальных дублей"

# Проверка импортов
wrong_imports=$(search_pattern "from.*supabase.*createClient" "./src/" | grep -v "from.*@/lib" | wc -l)
check_result "Все импорты клиентов из @/lib/" "$([ "$wrong_imports" -eq 0 ] && echo true || echo false)" "Найдено $wrong_imports неправильных импортов"

echo ""
echo -e "${YELLOW}=== 2. R2 ЗАГРУЗКА ===${NC}"

# Проверка API роута для загрузки
check_result "API роут /api/upload существует" "$(file_exists "./src/app/api/upload/route.ts")"

# Проверка содержимого upload route
if file_exists "./src/app/api/upload/route.ts"; then
    has_presigned=$(grep -q "getSignedUrl\|presigned" "./src/app/api/upload/route.ts" && echo true || echo false)
    check_result "Upload API использует presigned URL" "$has_presigned"
fi

# Проверка ImageUploader компонента
image_uploader_files=$(find ./src/ -name "*ImageUpload*" -o -name "*FileUpload*" 2>/dev/null | wc -l)
check_result "Компонент загрузки изображений найден" "$([ "$image_uploader_files" -gt 0 ] && echo true || echo false)" "Найдено $image_uploader_files компонентов"

echo ""
echo -e "${YELLOW}=== 3. КАТАЛОГ ===${NC}"

# Проверка сервиса каталога
check_result "Сервис catalog.ts существует" "$(file_exists "./src/lib/services/catalog.ts")"

if file_exists "./src/lib/services/catalog.ts"; then
    has_list_products=$(grep -q "export.*function.*listProducts" "./src/lib/services/catalog.ts" && echo true || echo false)
    has_list_categories=$(grep -q "export.*function.*listCategories" "./src/lib/services/catalog.ts" && echo true || echo false)
    has_list_brands=$(grep -q "export.*function.*listBrands" "./src/lib/services/catalog.ts" && echo true || echo false)

    check_result "Метод listProducts существует" "$has_list_products"
    check_result "Метод listCategories существует" "$has_list_categories"
    check_result "Метод listBrands существует" "$has_list_brands"
fi

# Проверка API эндпоинтов каталога
catalog_apis=("products" "categories" "brands")
for api in "${catalog_apis[@]}"; do
    check_result "API /api/catalog/$api существует" "$(file_exists "./src/app/api/catalog/$api/route.ts")"
done

echo ""
echo -e "${YELLOW}=== 4. UI КОМПОНЕНТЫ ===${NC}"

# Проверка компонентов каталога
catalog_components=("CatalogShell.tsx" "FiltersSidebar.tsx" "ProductGrid.tsx" "ProductCard.tsx" "SortSelect.tsx" "EmptyState.tsx" "LoadingSkeletons.tsx")
catalog_dir="./src/features/catalog/components"

if dir_exists "$catalog_dir"; then
    for component in "${catalog_components[@]}"; do
        check_result "$component существует" "$(file_exists "$catalog_dir/$component")"
    done

    # Проверка на лишние файлы
    actual_files=$(count_files "$catalog_dir")
    expected_files=$((${#catalog_components[@]} + 1)) # +1 для .gitkeep
    check_result "Только нужные компоненты в каталоге" "$([ "$actual_files" -le "$expected_files" ] && echo true || echo false)" "Найдено $actual_files файлов, ожидалось не более $expected_files"
else
    check_result "Директория компонентов каталога существует" "false"
fi

# Проверка на отсутствие старых компонентов
old_components=$(find ./src/ -name "*SimpleCatalog*" -o -name "*modern*" 2>/dev/null | wc -l)
check_result "Нет старых/дублирующих компонентов" "$([ "$old_components" -eq 0 ] && echo true || echo false)" "Найдено $old_components старых компонентов"

echo ""
echo -e "${YELLOW}=== 5. КОНФИГУРАЦИЯ ===${NC}"

# Проверка next.config.js
if file_exists "./next.config.js"; then
    has_r2_domains=$(grep -q "r2\.dev\|r2\.cloudflarestorage" "./next.config.js" && echo true || echo false)
    check_result "R2 домены в next.config.js" "$has_r2_domains"
else
    check_result "next.config.js существует" "false"
fi

# Проверка .env.example
check_result ".env.example существует" "$(file_exists "./.env.example")"

if file_exists "./.env.example"; then
    env_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "R2_ACCOUNT_ID" "R2_ACCESS_KEY_ID" "R2_SECRET_ACCESS_KEY" "R2_BUCKET_NAME")
    missing_vars=0
    for var in "${env_vars[@]}"; do
        if ! grep -q "$var" "./.env.example"; then
            missing_vars=$((missing_vars + 1))
        fi
    done
    check_result "Все нужные переменные в .env.example" "$([ "$missing_vars" -eq 0 ] && echo true || echo false)" "Отсутствует $missing_vars переменных"
fi

echo ""
echo -e "${YELLOW}=== 6. КАЧЕСТВО КОДА ===${NC}"

# Проверка TypeScript
if command -v pnpm >/dev/null 2>&1; then
    echo "Проверка TypeScript..."
    if pnpm exec tsc --noEmit >/dev/null 2>&1; then
        check_result "TypeScript компиляция без ошибок" "true"
    else
        check_result "TypeScript компиляция без ошибок" "false" "Есть ошибки типизации"
    fi

    # Проверка ESLint
    echo "Проверка ESLint..."
    eslint_output=$(pnpm exec eslint . --format=compact 2>/dev/null || echo "")
    eslint_errors=$(echo "$eslint_output" | grep -c "error" || echo 0)
    check_result "ESLint без ошибок" "$([ "$eslint_errors" -eq 0 ] && echo true || echo false)" "Найдено $eslint_errors ошибок"
else
    check_result "pnpm доступен" "false" "Установите pnpm для полной проверки"
fi

echo ""
echo -e "${YELLOW}=== 7. ДОКУМЕНТАЦИЯ ===${NC}"

# Проверка README.md
check_result "README.md существует" "$(file_exists "./README.md")"

if file_exists "./README.md"; then
    has_setup=$(grep -qi "установка\|installation\|setup" "./README.md" && echo true || echo false)
    has_env_config=$(grep -qi "\.env\|environment" "./README.md" && echo true || echo false)
    has_api_examples=$(grep -qi "curl\|api.*example" "./README.md" && echo true || echo false)

    check_result "README содержит инструкции по установке" "$has_setup"
    check_result "README содержит настройку .env" "$has_env_config"
    check_result "README содержит примеры API" "$has_api_examples"
fi

echo ""
echo -e "${YELLOW}=== 8. ЧИСТКА ===${NC}"

# Проверка на отсутствие лишних директорий
unwanted_dirs=("./src/utils" "./src/features/catalog/api" "./src/features/catalog/components/modern")
for dir in "${unwanted_dirs[@]}"; do
    check_result "Нет директории $dir" "$(! dir_exists "$dir" && echo true || echo false)"
done

# Проверка package.json на лишние зависимости
if file_exists "./package.json"; then
    # Проверяем на потенциально лишние пакеты
    unused_deps=$(grep -E "lodash|moment|axios" "./package.json" | wc -l)
    check_result "Нет потенциально лишних зависимостей" "$([ "$unused_deps" -eq 0 ] && echo true || echo false)" "Найдено $unused_deps потенциально лишних пакетов"
fi

echo ""
echo -e "${YELLOW}=== 9. ФУНКЦИОНАЛЬНОСТЬ ===${NC}"

# Проверка основных роутов
main_routes=("./src/app/page.tsx" "./src/app/catalog/page.tsx" "./src/app/admin/page.tsx")
for route in "${main_routes[@]}"; do
    if file_exists "$route"; then
        check_result "Основной роут $(basename "$route") существует" "true"
    else
        check_result "Основной роут $(basename "$route") существует" "false"
    fi
done

# Проверка middleware
check_result "Middleware существует" "$(file_exists "./middleware.ts" || file_exists "./src/middleware.ts")"

echo ""
echo -e "${BLUE}📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ${NC}"
echo -e "Всего проверок: $TOTAL"
echo -e "${GREEN}Успешно: $PASSED${NC}"
echo -e "${RED}Неудачно: $FAILED${NC}"

if [ "$FAILED" -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! Проект готов к использованию.${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Есть проблемы, которые нужно исправить.${NC}"
    echo -e "Процент готовности: $(( PASSED * 100 / TOTAL ))%"
    exit 1
fi
