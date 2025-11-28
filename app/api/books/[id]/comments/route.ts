import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;
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

    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: text,
        authorId: decoded.userId,
        bookId,
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatar: true } },
      },
    });

    // Create notification for book author (if not commenting on own book)
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (book && book.authorId !== decoded.userId) {
      const commenter = await prisma.user.findUnique({ where: { id: decoded.userId } });
      await prisma.notification.create({
        data: {
          userId: book.authorId,
          type: 'comment',
          content: `${commenter?.fullName || commenter?.username} mengomentari buku Anda: "${book.title}"`,
          bookId,
          actorId: decoded.userId,
          actorName: commenter?.fullName || commenter?.username || 'Someone',
          contentTitle: book.title,
        },
      });
    }

    return NextResponse.json(
      { message: 'Comment added successfully', comment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;
    
    const comments = await prisma.comment.findMany({
      where: { bookId },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
