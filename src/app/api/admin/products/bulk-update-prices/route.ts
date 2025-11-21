import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabaseServer";
import * as iconv from "iconv-lite";
import * as XLSX from "xlsx";

// Функция для определения и конвертации кодировки
function decodeText(buffer: Buffer, encoding?: string): string {
  // Попробуем разные кодировки, начиная с указанной или Windows-1251 (самая частая для русских файлов)
  const encodings = encoding ? [encoding] : [
    'win1251', // Windows-1251 (кириллица Windows) - приоритет для русских файлов
    'cp1251', // Альтернативное название
    'utf8',
    'cp866', // DOS кириллица
    'koi8r', // KOI8-R (кириллица KOI8)
    'iso88595', // ISO-8859-5 (кириллица ISO)
    'utf16le',
    'utf16be',
  ];

  let bestMatch = '';
  let bestScore = 0;

  for (const enc of encodings) {
    try {
      const decoded = iconv.decode(buffer, enc);
      
      if (decoded.length === 0) continue;
      
      // Проверяем наличие кириллических символов
      const cyrillicMatches = decoded.match(/[а-яёА-ЯЁ]/g);
      const cyrillicCount = cyrillicMatches ? cyrillicMatches.length : 0;
      
      // Проверяем наличие латиницы
      const latinMatches = decoded.match(/[a-zA-Z]/g);
      const latinCount = latinMatches ? latinMatches.length : 0;
      
      // Проверяем наличие цифр
      const numberMatches = decoded.match(/[0-9]/g);
      const numberCount = numberMatches ? numberMatches.length : 0;
      
      // Проверяем на нечитаемые символы (замены, мусор)
      const garbageMatches = decoded.match(/[\uFFFD\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g);
      const garbageCount = garbageMatches ? garbageMatches.length : 0;
      
      // Вычисляем score: кириллица дает больше очков, мусор уменьшает
      const score = (cyrillicCount * 2 + latinCount + numberCount) / decoded.length - (garbageCount / decoded.length) * 2;
      
      // Если есть кириллица и мало мусора, это хороший кандидат
      if (cyrillicCount > 0 && garbageCount / decoded.length < 0.1) {
        if (score > bestScore) {
          bestScore = score;
          bestMatch = decoded;
        }
      }
      
      // Если нет кириллицы, но есть латиница и числа, и мало мусора
      if (cyrillicCount === 0 && latinCount > 0 && numberCount > 0 && garbageCount / decoded.length < 0.05) {
        if (score > bestScore) {
          bestScore = score;
          bestMatch = decoded;
        }
      }
    } catch (e) {
      // Пробуем следующую кодировку
      continue;
    }
  }

  // Если нашли хорошее совпадение, возвращаем его
  if (bestMatch && bestScore > 0) {
    return bestMatch;
  }

  // Если ничего не подошло, пробуем UTF-8
  try {
    return iconv.decode(buffer, 'utf8');
  } catch (e) {
    // Последняя попытка - как строка
    return buffer.toString('utf8');
  }
}

// Парсинг CSV файла
function parseCSV(content: string): Array<{ name: string; price: number }> {
  // Нормализуем переносы строк
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.split('\n').filter(line => line.trim());
  const results: Array<{ name: string; price: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Пропускаем заголовки, если они есть
    if (i === 0 && (line.toLowerCase().includes('название') || line.toLowerCase().includes('name') || line.toLowerCase().includes('цена') || line.toLowerCase().includes('price'))) {
      continue;
    }

    // Поддерживаем CSV с разделителями: запятая, точка с запятой, табуляция
    // Определяем разделитель по первому найденному
    let delimiter = ',';
    if (line.includes(';')) {
      delimiter = ';';
    } else if (line.includes('\t')) {
      delimiter = '\t';
    }

    // Разбиваем строку с учетом кавычек
    const parts: string[] = [];
    let currentPart = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        continue;
      }
      
      if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }
      
      if (char === delimiter && !inQuotes) {
        parts.push(currentPart.trim());
        currentPart = '';
        continue;
      }
      
      currentPart += char;
    }
    
    // Добавляем последнюю часть
    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }

    // Очищаем кавычки из частей
    const cleanedParts = parts.map(p => p.replace(/^["']|["']$/g, '').trim());

    if (cleanedParts.length >= 2) {
      const name = cleanedParts[0];
      // Извлекаем цену из второй колонки
      let priceStr = cleanedParts[1]
        .replace(/[^\d.,\s]/g, '') // Убираем все кроме цифр, точек, запятых и пробелов
        .replace(/\s/g, ''); // Убираем пробелы
      
      // Определяем формат числа:
      // - Если есть и точка и запятая: последний разделитель - десятичный
      // - Если только запятая: может быть разделитель тысяч или десятичный (европейский формат)
      // - Если только точка: может быть разделитель тысяч или десятичный
      
      if (priceStr.includes(',') && priceStr.includes('.')) {
        // Есть оба разделителя - последний является десятичным
        const lastComma = priceStr.lastIndexOf(',');
        const lastDot = priceStr.lastIndexOf('.');
        
        if (lastComma > lastDot) {
          // Запятая последняя - она десятичный разделитель
          priceStr = priceStr.replace(/\./g, '').replace(',', '.');
        } else {
          // Точка последняя - она десятичный разделитель
          priceStr = priceStr.replace(/,/g, '');
        }
      } else if (priceStr.includes(',')) {
        // Только запятая
        const commaIndex = priceStr.lastIndexOf(',');
        const afterComma = priceStr.substring(commaIndex + 1);
        
        // Если после запятой ровно 3 цифры - это разделитель тысяч (20,000)
        // Если 1-2 цифры - это десятичный разделитель (20,50)
        if (afterComma.length === 3 && /^\d{3}$/.test(afterComma)) {
          // Разделитель тысяч - удаляем все запятые
          priceStr = priceStr.replace(/,/g, '');
        } else if (afterComma.length <= 2 && afterComma.length > 0) {
          // Десятичный разделитель - заменяем на точку
          priceStr = priceStr.replace(',', '.');
        } else {
          // По умолчанию считаем разделителем тысяч
          priceStr = priceStr.replace(/,/g, '');
        }
      } else if (priceStr.includes('.')) {
        // Только точка
        // Если после точки 3 цифры или меньше - это десятичный разделитель
        // Если больше - это разделитель тысяч
        const dotIndex = priceStr.lastIndexOf('.');
        const afterDot = priceStr.substring(dotIndex + 1);
        
        if (afterDot.length <= 3 && afterDot.length > 0) {
          // Вероятно десятичный разделитель (1234.56)
          // Оставляем как есть
        } else {
          // Вероятно разделитель тысяч (1.234)
          priceStr = priceStr.replace(/\./g, '');
        }
      }
      
      const price = parseFloat(priceStr);

      // Проверяем, что название не пустое и цена валидна
      if (name && name.length > 0 && !isNaN(price) && price >= 0) {
        results.push({ name, price });
      }
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    // Проверка авторизации через обычный клиент
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверка роли
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Получаем файл и режим из FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mode = formData.get("mode") as string || "preview"; // preview или update
    const selectedIds = formData.get("selectedIds") as string; // JSON массив выбранных ID для обновления

    if (!file) {
      return NextResponse.json(
        { error: "Файл не был загружен" },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: "Неподдерживаемый формат файла. Используйте CSV или Excel файл." },
        { status: 400 }
      );
    }

    // Читаем содержимое файла как ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let priceData: Array<{ name: string; price: number }> = [];
    
    // Определяем тип файла и парсим соответственно
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || 
        file.type === 'application/vnd.ms-excel' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // Это Excel файл
      try {
        const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
        
        // Берем первый лист
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Конвертируем в JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
        
        // Парсим данные Excel
        // Сначала объединяем многострочные названия
        const processedData: Array<{ name: string; price: number }> = [];
        let currentName = '';
        let currentPrice: number | null = null;
        
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          // Пропускаем пустые строки
          if (!row || row.length === 0) {
            // Если накопили данные, сохраняем их
            if (currentName && currentPrice !== null) {
              processedData.push({ name: currentName, price: currentPrice });
              currentName = '';
              currentPrice = null;
            }
            continue;
          }
          
          // Пропускаем заголовки
          if (i === 0 && (
            String(row[0] || '').toLowerCase().includes('название') || 
            String(row[0] || '').toLowerCase().includes('name') ||
            String(row[0] || '').toLowerCase().includes('цена') ||
            String(row[0] || '').toLowerCase().includes('price')
          )) {
            continue;
          }
          
          const firstCol = String(row[0] || '').trim();
          const secondCol = row[1];
          
          // Если во второй колонке есть цена (число или строка с цифрами)
          let foundPrice: number | null = null;
          if (secondCol !== null && secondCol !== undefined && secondCol !== '') {
            if (typeof secondCol === 'number') {
              foundPrice = secondCol;
            } else {
              const priceStr = String(secondCol)
                .replace(/[^\d.,\s]/g, '')
                .replace(/\s/g, '');
              
              if (priceStr && /[\d]/.test(priceStr)) {
                // Парсим цену
                let parsedPriceStr = priceStr;
                
                if (parsedPriceStr.includes(',') && parsedPriceStr.includes('.')) {
                  const lastComma = parsedPriceStr.lastIndexOf(',');
                  const lastDot = parsedPriceStr.lastIndexOf('.');
                  
                  if (lastComma > lastDot) {
                    parsedPriceStr = parsedPriceStr.replace(/\./g, '').replace(',', '.');
                  } else {
                    parsedPriceStr = parsedPriceStr.replace(/,/g, '');
                  }
                } else if (parsedPriceStr.includes(',')) {
                  const commaIndex = parsedPriceStr.lastIndexOf(',');
                  const afterComma = parsedPriceStr.substring(commaIndex + 1);
                  
                  if (afterComma.length === 3 && /^\d{3}$/.test(afterComma)) {
                    parsedPriceStr = parsedPriceStr.replace(/,/g, '');
                  } else if (afterComma.length <= 2 && afterComma.length > 0) {
                    parsedPriceStr = parsedPriceStr.replace(',', '.');
                  } else {
                    parsedPriceStr = parsedPriceStr.replace(/,/g, '');
                  }
                } else if (parsedPriceStr.includes('.')) {
                  const dotIndex = parsedPriceStr.lastIndexOf('.');
                  const afterDot = parsedPriceStr.substring(dotIndex + 1);
                  
                  if (afterDot.length > 3) {
                    parsedPriceStr = parsedPriceStr.replace(/\./g, '');
                  }
                }
                
                const parsed = parseFloat(parsedPriceStr);
                if (!isNaN(parsed) && parsed >= 0) {
                  foundPrice = parsed;
                }
              }
            }
          }
          
          // Если нашли цену, значит это новая запись
          if (foundPrice !== null) {
            // Сохраняем предыдущую запись, если есть
            if (currentName && currentPrice !== null) {
              processedData.push({ name: currentName, price: currentPrice });
            }
            
            // Начинаем новую запись
            currentName = firstCol || '';
            currentPrice = foundPrice;
          } else if (firstCol) {
            // Если нет цены, но есть текст в первой колонке - это продолжение названия
            if (currentName) {
              currentName += ' ' + firstCol;
            } else {
              currentName = firstCol;
            }
          }
        }
        
        // Сохраняем последнюю запись
        if (currentName && currentPrice !== null) {
          processedData.push({ name: currentName, price: currentPrice });
        }
        
        priceData = processedData;
      } catch (excelError) {
        console.error("Error parsing Excel file:", excelError);
        return NextResponse.json(
          { error: "Ошибка при чтении Excel файла. Убедитесь, что файл не поврежден." },
          { status: 400 }
        );
      }
    } else {
      // Это CSV файл
      // Определяем и конвертируем кодировку
      const content = decodeText(buffer);
      
      // Парсим CSV
      priceData = parseCSV(content);
    }

    if (priceData.length === 0) {
      return NextResponse.json(
        { error: "Не удалось распарсить файл. Убедитесь, что файл содержит колонки: название товара, цена" },
        { status: 400 }
      );
    }

    // Используем админ-клиент для обновления данных
    const adminSupabase = createAdminClient();

    // Получаем все товары для поиска по названию и SKU
    const { data: allProducts, error: fetchError } = await adminSupabase
      .from("products")
      .select("id, name, sku, base_price");

    if (fetchError) {
      console.error("Error fetching products:", fetchError);
      return NextResponse.json(
        { error: "Ошибка при получении списка товаров" },
        { status: 500 }
      );
    }

    const results = {
      updated: [] as Array<{ id: string; name: string; oldPrice: number | null; newPrice: number; foundBy?: 'sku' | 'name' }>,
      notFound: [] as Array<{ name: string; price: number }>,
      errors: [] as Array<{ name: string; error: string }>,
      skipped: [] as Array<{ id: string; name: string; price: number; reason: string }>, // Пропущенные товары
    };
    
    // Парсим выбранные ID (если есть)
    let selectedIdsSet: Set<string> | null = null;
    if (selectedIds && mode === "update") {
      try {
        const ids = JSON.parse(selectedIds);
        if (Array.isArray(ids)) {
          selectedIdsSet = new Set(ids);
        }
      } catch (e) {
        // Игнорируем ошибку парсинга
      }
    }

    // Анализируем файл и либо показываем предпросмотр, либо обновляем
    for (const item of priceData) {
      const searchTerm = item.name.trim();
      let product = null;

      // Сначала ищем по SKU (точное совпадение, без учета регистра)
      if (allProducts) {
        product = allProducts.find(
          (p) => p.sku && p.sku.toLowerCase().trim() === searchTerm.toLowerCase()
        );
      }

      // Если не найдено по SKU, ищем по названию (ТОЧНОЕ совпадение, без учета регистра)
      // Важно: только точное совпадение, без частичных совпадений!
      if (!product && allProducts) {
        product = allProducts.find(
          (p) => p.name && p.name.toLowerCase().trim() === searchTerm.toLowerCase()
        );
      }

      if (!product) {
        results.notFound.push({ name: item.name, price: item.price });
        continue;
      }

      // Определяем, по какому полю был найден товар (до обновления)
      const foundBy = product.sku && product.sku.toLowerCase().trim() === searchTerm.toLowerCase() 
        ? 'sku' 
        : 'name';

      // Проверяем, нужно ли обновлять цену (если она не изменилась - пропускаем)
      const oldPrice = product.base_price;
      const newPrice = item.price;
      const priceChanged = oldPrice === null || Math.abs(oldPrice - newPrice) > 0.01; // Учитываем возможные ошибки округления

      // Если цена не изменилась, пропускаем
      if (!priceChanged) {
        results.skipped.push({
          id: product.id,
          name: product.name,
          price: newPrice,
          reason: "Цена не изменилась",
        });
        continue;
      }

      // В режиме update проверяем, выбран ли товар для обновления
      if (mode === "update") {
        // Если указаны выбранные ID, проверяем что товар в списке
        if (selectedIdsSet && !selectedIdsSet.has(product.id)) {
          results.skipped.push({
            id: product.id,
            name: product.name,
            price: newPrice,
            reason: "Не выбран для обновления",
          });
          continue;
        }

        // Обновляем цену
        const { error: updateError } = await adminSupabase
          .from("products")
          .update({ base_price: item.price })
          .eq("id", product.id);

        if (updateError) {
          results.errors.push({
            name: item.name,
            error: updateError.message,
          });
        } else {
          results.updated.push({
            id: product.id,
            name: product.name,
            oldPrice: product.base_price,
            newPrice: item.price,
            foundBy: foundBy,
          });
        }
      } else {
        // Режим preview - только показываем что будет изменено
        results.updated.push({
          id: product.id,
          name: product.name,
          oldPrice: product.base_price,
          newPrice: item.price,
          foundBy: foundBy,
        });
      }
    }

    return NextResponse.json({
      success: true,
      mode: mode,
      summary: {
        total: priceData.length,
        updated: results.updated.length,
        notFound: results.notFound.length,
        errors: results.errors.length,
        skipped: results.skipped.length,
      },
      results,
    });
  } catch (error) {
    console.error("Error in bulk price update:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

