import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const book = await prisma.book.findUnique({ where: { id } });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const userId = decoded.userId;
    const existingLike = await prisma.like.findFirst({
      where: { userId, bookId: id },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.like.create({
        data: { userId, bookId: id },
      });

      // Create notification for book author (if not liking own book)
      if (book.authorId !== userId) {
        const liker = await prisma.user.findUnique({ where: { id: userId } });
        await prisma.notification.create({
          data: {
            userId: book.authorId,
            type: 'like',
            content: `${liker?.fullName || liker?.username} menyukai buku Anda: "${book.title}"`,
            bookId: id,
            actorId: userId,
            actorName: liker?.fullName || liker?.username || 'Someone',
            contentTitle: book.title,
          },
        });
      }
    }

    const updatedBook = await prisma.book.findUnique({
      where: { id },
      include: { author: { select: { username: true, fullName: true } } },
    });

    return NextResponse.json(
      { message: existingLike ? 'Like removed' : 'Liked', book: updatedBook },
      { status: 200 }
    );
  } catch (error) {
    console.error('Like book error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
