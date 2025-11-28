import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { deleteFromBlob } from '@/lib/storage/blob';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET single book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const book = await prisma.book.findUnique({
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

    if (!book) {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ error: 'Gagal mengambil buku' }, { status: 500 });
  }
}

// PUT update book
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
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title dan description harus diisi' }, { status: 400 });
    }

    // Check if book exists and user is the author
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 });
    }

    if (existingBook.authorId !== decoded.userId) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk mengupdate buku ini' }, { status: 403 });
    }

    // Update book
    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title,
        description,
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

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: 'Gagal mengupdate buku' }, { status: 500 });
  }
}

// DELETE book
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

    // Check if book exists and user is the author
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 });
    }

    if (existingBook.authorId !== decoded.userId) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk menghapus buku ini' }, { status: 403 });
    }

    // Delete related data first
    await prisma.comment.deleteMany({
      where: { bookId: id },
    });

    await prisma.like.deleteMany({
      where: { bookId: id },
    });

    // Delete PDF file from Vercel Blob
    if (existingBook.filePath) {
      try {
        await deleteFromBlob(existingBook.filePath);
        console.log(`Deleted blob: ${existingBook.filePath}`);
      } catch (err) {
        console.error('Error deleting blob:', err);
      }
    }

    // Delete book
    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Buku berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Gagal menghapus buku' }, { status: 500 });
  }
}
