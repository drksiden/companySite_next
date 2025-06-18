export async function DELETE(
    request: NextRequest,
    { params }: { params: { key: string } }
  ) {
    try {
      const { key } = params;
      
      if (!key) {
        return NextResponse.json(
          { error: 'File key is required', success: false },
          { status: 400 }
        );
      }
  
      // Декодируем ключ (может содержать слеши)
      const decodedKey = decodeURIComponent(key);
      
      await r2Client.deleteFile(decodedKey);
      
      // Пытаемся удалить миниатюру если есть
      const thumbnailKey = decodedKey.replace(/\.[^/.]+$/, '_thumb.webp');
      try {
        await r2Client.deleteFile(thumbnailKey);
      } catch (error) {
        // Игнорируем ошибку если миниатюры нет
      }
  
      return NextResponse.json({ success: true });
  
    } catch (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to delete file', 
          success: false,
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }