import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Инициализация S3 клиента для Cloudflare R2
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

// Вспомогательная функция для удаления файла из R2
async function deleteFileFromR2(fileUrl: string | null | undefined): Promise<void> {
  // Добавляем проверку на наличие и корректность URL
  if (!fileUrl || typeof fileUrl !== 'string') {
    console.warn('Invalid URL provided to deleteFileFromR2. Skipping.');
    return;
  }

  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Удаляем начальный слэш
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
    });
    // Выполняем удаление
    await s3Client.send(deleteCommand);
    console.log(`Successfully deleted object with key: ${key}`);
  } catch (error) {
    console.error(`Error deleting object with URL: ${fileUrl}`, error);
    // Игнорируем ошибку, если файл уже был удален или не существует
  }
}

// --- PUT метод для обновления товара ---
export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = await createClient();
    const { productId } = params;
    const formData = await req.formData();

    // Получаем текущие данные о товаре из БД для сравнения
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('images, documents, specifications')
      .eq('id', productId)
      .single();

    if (fetchError || !currentProduct) {
      console.error('Supabase fetch error for current product:', fetchError);
      return NextResponse.json({ error: 'Product not found or database error.' }, { status: 404 });
    }

    // --- Обработка изображений ---
    const existingImageUrls = formData.getAll('images[]') as string[];
    const imageFiles = formData.getAll('imageFiles') as File[];
    
    const newImageUrls: string[] = [];
    for (const file of imageFiles) {
      if (file.size > 0) {
        const url = await uploadFileToR2(file, 'images');
        newImageUrls.push(url);
      }
    }
    const imagesToDelete = (currentProduct.images as string[] || []).filter(
      (url: string) => !existingImageUrls.includes(url)
    );
    for (const url of imagesToDelete) {
      await deleteFileFromR2(url);
    }
    const allImageUrls = [...existingImageUrls, ...newImageUrls];

    // --- Обработка документов ---
    const existingDocuments = formData.get('documents') ? JSON.parse(formData.get('documents') as string) : [];
    const documentFiles = formData.getAll('documentFiles') as File[];
    
    const newDocuments = [];
    for (const file of documentFiles) {
      if (file.size > 0) {
        const url = await uploadFileToR2(file, 'documents');
        newDocuments.push({ url, name: file.name, type: file.type });
      }
    }
    const documentsToDelete = Array.isArray(currentProduct.documents)
  ? currentProduct.documents.filter(
      (doc: any) => !existingDocuments.some((existingDoc: any) => existingDoc.url === doc.url)
    )
  : [];
    for (const doc of documentsToDelete) {
      await deleteFileFromR2(doc.url);
    }
    const allDocuments = [...existingDocuments, ...newDocuments];

  // --- Обработка спецификаций ---
  const existingSpecs = formData.get('specifications') ? JSON.parse(formData.get('specifications') as string) : [];

  // Спецификации не являются файлами, поэтому нет логики для удаления старых
  // и добавления новых файлов.
  // allSpecs - это просто массив, который пришел с формы
  const allSpecs = existingSpecs;
    

// --- Сборка данных для обновления ---
    const updatedProductData: { [key: string]: any } = {};
    
    // Получаем все поля напрямую из formData.get()
    updatedProductData.name = formData.get('name');
    updatedProductData.slug = formData.get('slug');
    updatedProductData.category_id = formData.get('category_id');
    updatedProductData.short_description = formData.get('short_description') || null;
    updatedProductData.description = formData.get('description') || null;
    updatedProductData.technical_description = formData.get('technical_description') || null;
    updatedProductData.base_price = parseFloat(formData.get('base_price') as string);
    updatedProductData.inventory_quantity = parseInt(formData.get('inventory_quantity') as string);
    updatedProductData.track_inventory = formData.get('track_inventory') === 'on';
    updatedProductData.min_stock_level = parseInt(formData.get('min_stock_level') as string);
    updatedProductData.allow_backorder = formData.get('allow_backorder') === 'on';
    updatedProductData.is_featured = formData.get('is_featured') === 'on';
    updatedProductData.is_digital = formData.get('is_digital') === 'on';
    updatedProductData.sort_order = parseInt(formData.get('sort_order') as string);
    updatedProductData.status = formData.get('status');
    updatedProductData.meta_title = formData.get('meta_title') || null;
    updatedProductData.meta_description = formData.get('meta_description') || null;
    updatedProductData.meta_keywords = formData.get('meta_keywords') || null;

    // Вложенные объекты
    updatedProductData.dimensions = formData.get('dimensions') ? JSON.parse(formData.get('dimensions') as string) : null;
    updatedProductData.brand_id = formData.get('brand_id') === 'null' ? null : formData.get('brand_id');
    updatedProductData.collection_id = formData.get('collection_id') === 'null' ? null : formData.get('collection_id');
    
    // Массивы, которые мы обработали выше
    updatedProductData.images = allImageUrls;
    updatedProductData.documents = allDocuments;
    updatedProductData.specifications = allSpecs;

    // Обновление в Supabase
    const { data, error } = await supabase
      .from('products')
      .update(updatedProductData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Server error in PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- DELETE метод для удаления товара ---
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = await createClient();
    const { productId } = params;

    // Сначала получаем URL изображений и документов, связанных с товаром
    const { data: productToDelete, error: fetchError } = await supabase
      .from('products')
      .select('images, documents, specifications')
      .eq('id', productId)
      .single();

    if (fetchError || !productToDelete) {
      console.error('Supabase fetch error for product to delete:', fetchError);
      return NextResponse.json({ error: 'Product not found or database error.' }, { status: 404 });
    }

    // Удаляем файлы из R2
    if (productToDelete.images && productToDelete.images.length > 0) {
      for (const imageUrl of productToDelete.images) {
        await deleteFileFromR2(imageUrl);
      }
    }
    if (productToDelete.documents && productToDelete.documents.length > 0) {
      for (const doc of productToDelete.documents) {
        await deleteFileFromR2(doc.url);
      }
    }
    if (productToDelete.specifications && productToDelete.specifications.length > 0) {
      for (const spec of productToDelete.specifications) {
        await deleteFileFromR2(spec.url);
      }
    }

    // Удаляем товар из Supabase
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully.' });

  } catch (error) {
    console.error('Server error in DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}