import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { uploadFileToR2 } from "@/utils/r2/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");
    const isActive = searchParams.get("is_active");
    const parentId = searchParams.get("parent_id");
    const flat = searchParams.get("flat") === "true"; // For flat list vs tree structure

    // Build query
    let query = supabase
      .from("categories")
      .select(
        `
        *,
        parent:parent_id (
          id,
          name,
          slug
        ),
        children:categories!parent_id (
          id,
          name,
          slug,
          level,
          is_active
        )
      `,
      )
      .order("level", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (isActive !== null && isActive !== "all") {
      query = query.eq("is_active", isActive === "true");
    }

    if (parentId !== null) {
      if (parentId === "null" || parentId === "") {
        query = query.is("parent_id", null);
      } else {
        query = query.eq("parent_id", parentId);
      }
    }

    // Apply pagination if flat structure requested
    if (flat) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 },
      );
    }

    // Build tree structure if not flat
    let result = categories || [];
    if (!flat) {
      result = buildCategoryTree(categories || []);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    if (search) {
      countQuery = countQuery.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }

    if (isActive !== null && isActive !== "all") {
      countQuery = countQuery.eq("is_active", isActive === "true");
    }

    if (parentId !== null) {
      if (parentId === "null" || parentId === "") {
        countQuery = countQuery.is("parent_id", null);
      } else {
        countQuery = countQuery.eq("parent_id", parentId);
      }
    }

    const { count } = await countQuery;

    return NextResponse.json({
      categories: result,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("Error in categories GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await req.formData();

    // --- Обработка изображения ---
    const imageFile = formData.get("imageFile") as File;
    let imageUrl = null;

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadFileToR2(imageFile, "images/categories");
    }

    // --- Сборка данных для создания ---
    const insertData: { [key: string]: unknown } = {};

    for (const [key, value] of formData.entries()) {
      // Исключаем поле изображения, которое мы обрабатываем вручную
      if (key === "imageFile") continue;

      if (typeof value === "string") {
        switch (key) {
          case "sort_order":
          case "level":
            insertData[key] = value ? parseInt(value) : 0;
            break;
          case "is_active":
            insertData[key] = value === "true";
            break;
          case "parent_id":
            insertData[key] = value === "null" || value === "" ? null : value;
            break;
          default:
            insertData[key] = value || null;
            break;
        }
      }
    }

    // Добавляем URL изображения
    if (imageUrl) {
      insertData.image_url = imageUrl;
    }

    // Генерируем slug из названия, если не указан
    if (!insertData.slug && insertData.name) {
      insertData.slug = (insertData.name as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Определяем уровень и путь на основе родительской категории
    if (insertData.parent_id) {
      const { data: parentCategory } = await supabase
        .from("categories")
        .select("level, path")
        .eq("id", insertData.parent_id)
        .single();

      if (parentCategory) {
        insertData.level = parentCategory.level + 1;
        insertData.path = `${parentCategory.path}/${insertData.slug}`;
      }
    } else {
      insertData.level = 0;
      insertData.path = insertData.slug as string;
    }

    // Сохранение в Supabase
    const { data, error } = await supabase
      .from("categories")
      .insert(insertData)
      .select(
        `
        *,
        parent:parent_id (
          id,
          name,
          slug
        )
      `,
      )
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error in POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await req.formData();

    const categoryId = formData.get("id") as string;
    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 },
      );
    }

    // --- Обработка изображения ---
    const imageFile = formData.get("imageFile") as File;
    const existingImageUrl = formData.get("existingImageUrl") as string;
    let imageUrl = existingImageUrl;

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadFileToR2(imageFile, "images/categories");
    }

    // --- Сборка данных для обновления ---
    const updateData: { [key: string]: unknown } = {};

    for (const [key, value] of formData.entries()) {
      // Исключаем поля, которые мы обрабатываем вручную
      if (["id", "imageFile", "existingImageUrl"].includes(key)) continue;

      if (typeof value === "string") {
        switch (key) {
          case "sort_order":
          case "level":
            updateData[key] = value ? parseInt(value) : 0;
            break;
          case "is_active":
            updateData[key] = value === "true";
            break;
          case "parent_id":
            updateData[key] = value === "null" || value === "" ? null : value;
            break;
          default:
            updateData[key] = value || null;
            break;
        }
      }
    }

    // Обновляем URL изображения
    if (imageUrl) {
      updateData.image_url = imageUrl;
    }

    // Пересчитываем уровень и путь если изменился родитель
    if (updateData.parent_id !== undefined) {
      if (updateData.parent_id) {
        const { data: parentCategory } = await supabase
          .from("categories")
          .select("level, path")
          .eq("id", updateData.parent_id)
          .single();

        if (parentCategory) {
          updateData.level = parentCategory.level + 1;
          updateData.path = `${parentCategory.path}/${updateData.slug || "category"}`;
        }
      } else {
        updateData.level = 0;
        updateData.path = (updateData.slug as string) || "category";
      }
    }

    // Обновление в Supabase
    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", categoryId)
      .select(
        `
        *,
        parent:parent_id (
          id,
          name,
          slug
        )
      `,
      )
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Обновляем пути всех дочерних категорий если изменился slug или parent_id
    if (updateData.slug || updateData.parent_id !== undefined) {
      await updateChildrenPaths(supabase, categoryId, data.path);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error in PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 },
      );
    }

    // Проверяем, есть ли дочерние категории
    const { count: childrenCount } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", categoryId);

    if (childrenCount && childrenCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. There are ${childrenCount} subcategories under this category.`,
        },
        { status: 400 },
      );
    }

    // Проверяем, есть ли связанные продукты
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId);

    if (productsCount && productsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. There are ${productsCount} products in this category.`,
        },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error in DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper function to build category tree
function buildCategoryTree(categories: any[]): any[] {
  const categoryMap = new Map();
  const rootCategories: any[] = [];

  // Create a map of all categories
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Build the tree structure
  categories.forEach((category) => {
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children.push(categoryMap.get(category.id));
      }
    } else {
      rootCategories.push(categoryMap.get(category.id));
    }
  });

  return rootCategories;
}

// Helper function to update children paths recursively
async function updateChildrenPaths(
  supabase: any,
  parentId: string,
  parentPath: string,
) {
  const { data: children } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("parent_id", parentId);

  if (children && children.length > 0) {
    for (const child of children) {
      const newPath = `${parentPath}/${child.slug}`;

      await supabase
        .from("categories")
        .update({ path: newPath })
        .eq("id", child.id);

      // Recursively update grandchildren
      await updateChildrenPaths(supabase, child.id, newPath);
    }
  }
}
