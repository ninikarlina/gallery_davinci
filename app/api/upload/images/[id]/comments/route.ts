import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: imageId } = await params;
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
        imageId,
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatar: true } },
      },
    });

    // Create notification for image author (if not commenting on own image)
    const image = await prisma.image.findUnique({ where: { id: imageId } });
    if (image && image.authorId !== decoded.userId) {
      const commenter = await prisma.user.findUnique({ where: { id: decoded.userId } });
      await prisma.notification.create({
        data: {
          userId: image.authorId,
          type: 'comment',
          content: `${commenter?.fullName || commenter?.username} mengomentari gambar Anda: "${image.title}"`,
          imageId,
          actorId: decoded.userId,
          actorName: commenter?.fullName || commenter?.username || 'Someone',
          contentTitle: image.title,
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
    const { id: imageId } = await params;
    
    const comments = await prisma.comment.findMany({
      where: { imageId },
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
