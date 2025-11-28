import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: { 
        author: { select: { id: true, username: true, fullName: true, avatar: true } },
        comments: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatar: true } },
          },
        },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const books = await prisma.book.findMany({
      where: { authorId: userId },
      include: { 
        author: { select: { id: true, username: true, fullName: true, avatar: true } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const images = await prisma.image.findMany({
      where: { authorId: userId },
      include: { 
        author: { select: { id: true, username: true, fullName: true, avatar: true } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { user, posts, books, images },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || decoded.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { fullName, bio } = await req.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: { fullName, bio },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        avatar: true,
      },
    });

    return NextResponse.json(
      { message: 'Profile updated', user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}