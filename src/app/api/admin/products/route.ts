import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

// Вспомогательная функция для загрузки файла в R2 с указанием папки
async function uploadFileToR2(file: File, folder: string): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  });

  await s3Client.send(uploadCommand);
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await req.formData();

    // --- Обработка изображений ---
    const imageFiles = formData.getAll('imageFiles') as File[];
    const newImageUrls: string[] = [];
    for (const file of imageFiles) {
      if (file.size > 0) {
        const url = await uploadFileToR2(file, 'images');
        newImageUrls.push(url);
      }
    }

    // --- Обработка документов ---
    const documentFiles = formData.getAll('documentFiles') as File[];
    const newDocuments = [];
    for (const file of documentFiles) {
      if (file.size > 0) {
        const url = await uploadFileToR2(file, 'documents');
        newDocuments.push({ url, name: file.name, type: file.type });
      }
    }
    
    // --- Обработка спецификаций ---
    const specFiles = formData.getAll('specFiles') as File[];
    const newSpecs = [];
    for (const file of specFiles) {
      if (file.size > 0) {
        const url = await uploadFileToR2(file, 'specifications');
        newSpecs.push({ url, name: file.name, type: file.type });
      }
    }

    // --- Сборка данных для создания ---
    const insertData: { [key: string]: any } = {};
    
    for (const [key, value] of formData.entries()) {
      // Исключаем поля, которые мы обрабатываем вручную
      if (['imageFiles', 'documentFiles', 'specFiles'].includes(key)) continue;

      if (typeof value === 'string') {
        switch (key) {
          case 'base_price':
          case 'sale_price':
          case 'cost_price':
          case 'inventory_quantity':
          case 'min_stock_level':
          case 'sort_order':
            insertData[key] = parseFloat(value);
            break;
          case 'track_inventory':
          case 'allow_backorder':
          case 'is_featured':
          case 'is_digital':
            insertData[key] = value === 'true';
            break;
          case 'brand_id':
          case 'collection_id':
          case 'unit_id':
            insertData[key] = value === 'null' ? null : value;
            break;
          case 'dimensions':
          case 'specifications':
            try {
              insertData[key] = value ? JSON.parse(value) : null;
            } catch (e) {
              insertData[key] = null;
            }
            break;
          default:
            insertData[key] = value;
            break;
        }
      }
    }
    
    // Добавляем обновленные массивы
    insertData.images = newImageUrls;
    insertData.documents = newDocuments;
    insertData.specifications = newSpecs;

    // Сохранение в Supabase
    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Server error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}