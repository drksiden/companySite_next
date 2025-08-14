import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createPresignedPutURL,
  generateFileKey,
  validateImageFile,
  DEFAULT_BUCKET,
  MAX_UPLOAD_SIZE_MB,
  getPublicUrl,
} from "@/lib/r2";

export const runtime = "nodejs";

const BodySchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  contentType: z.string().regex(/^image\//, "Only image files are allowed"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { fileName, contentType } = parsed.data;

    // Create a mock file object for validation
    const mockFile = {
      name: fileName,
      type: contentType,
      size: MAX_UPLOAD_SIZE_MB * 1024 * 1024, // We'll validate actual size on client
    } as File;

    // Validate file type and extension
    const validation = validateImageFile(mockFile);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate unique file key
    const key = generateFileKey({ originalName: fileName, folder: "images" });

    // Create presigned URL
    const uploadUrl = await createPresignedPutURL({
      bucket: DEFAULT_BUCKET,
      key,
      contentType,
      expiresIn: 60 * 5, // 5 minutes
    });

    // Generate public URL for the uploaded file
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({
      success: true,
      uploadUrl,
      key,
      publicUrl,
      maxMb: MAX_UPLOAD_SIZE_MB,
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
