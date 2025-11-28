import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET single image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const image = await prisma.image.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        likes: true,
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Gambar tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Gagal mengambil gambar' }, { status: 500 });
  }
}

// PUT update image
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const body = await request.json();
    const { title, caption } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title harus diisi' }, { status: 400 });
    }

    // Check if image exists and user is the author
    const existingImage = await prisma.image.findUnique({
      where: { id },
    });

    if (!existingImage) {
      return NextResponse.json({ error: 'Gambar tidak ditemukan' }, { status: 404 });
    }

    if (existingImage.authorId !== decoded.userId) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk mengupdate gambar ini' }, { status: 403 });
    }

    // Update image
    const updatedImage = await prisma.image.update({
      where: { id },
      data: {
        title,
        caption: caption || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        likes: true,
      },
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json({ error: 'Gagal mengupdate gambar' }, { status: 500 });
  }
}

// DELETE image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Check if image exists and user is the author
    const existingImage = await prisma.image.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!existingImage) {
      return NextResponse.json({ error: 'Gambar tidak ditemukan' }, { status: 404 });
    }

    if (existingImage.authorId !== decoded.userId) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk menghapus gambar ini' }, { status: 403 });
    }

    // Delete all image files from ImageItem
    if (existingImage.images && existingImage.images.length > 0) {
      for (const imageItem of existingImage.images) {
        if (imageItem.filePath) {
          try {
            await fs.unlink(imageItem.filePath);
            console.log(`Deleted file: ${imageItem.filePath}`);
          } catch (err) {
            console.error('Error deleting image file:', imageItem.filePath, err);
          }
        }
      }
    }

    // Delete related ImageItems (cascade will handle this, but explicit is better)
    await prisma.imageItem.deleteMany({
      where: { imageId: id },
    });

    // Delete related comments
    await prisma.comment.deleteMany({
      where: { imageId: id },
    });

    // Delete related likes
    await prisma.like.deleteMany({
      where: { imageId: id },
    });

    // Delete image record
    await prisma.image.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Gambar berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Gagal menghapus gambar' }, { status: 500 });
  }
}
