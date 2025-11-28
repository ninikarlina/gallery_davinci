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

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: text,
        authorId: decoded.userId,
        postId: id,
      },
      include: {
        author: { select: { username: true, fullName: true } },
      },
    });

    // Create notification for post author (if not commenting on own post)
    if (post.authorId !== decoded.userId) {
      const commenter = await prisma.user.findUnique({ where: { id: decoded.userId } });
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'comment',
          content: `${commenter?.fullName || commenter?.username} mengomentari postingan Anda: "${post.title}"`,
          postId: id,
          actorId: decoded.userId,
          actorName: commenter?.fullName || commenter?.username || 'Someone',
          contentTitle: post.title,
        },
      });
    }

    const updatedPost = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { username: true, fullName: true } },
        comments: {
          include: { author: { select: { username: true, fullName: true } } },
        },
      },
    });

    return NextResponse.json(
      { message: 'Comment added', post: updatedPost },
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
