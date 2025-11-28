import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 15;

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = 12;
    const skip = (page - 1) * limit;

    const images = await prisma.image.findMany({
      include: { 
        author: { select: { id: true, username: true, fullName: true, avatar: true } },
        images: { orderBy: { order: 'asc' } },
        comments: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatar: true } },
          },
        },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.image.count();

    return NextResponse.json(
      {
        images,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get images error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const title = formData.get('title') as string;
    const caption = formData.get('description') as string;

    if (!files || files.length === 0 || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    // Validate all files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 5MB limit` },
          { status: 400 }
        );
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads/images');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Create main image entry
    const image = await prisma.image.create({
      data: {
        authorId: decoded.userId,
        title,
        caption: caption || '',
      },
    });

    // Upload all files and create ImageItem entries
    const imageItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const fileName = `${Date.now()}-${i}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      // Save file
      await writeFile(filePath, buffer);

      // Create ImageItem entry
      const imageItem = await prisma.imageItem.create({
        data: {
          imageId: image.id,
          imageUrl: `/uploads/images/${fileName}`,
          filePath: filePath,
          order: i,
        },
      });

      imageItems.push(imageItem);
    }

    return NextResponse.json(
      { 
        message: 'Images uploaded successfully', 
        image: {
          ...image,
          images: imageItems,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
