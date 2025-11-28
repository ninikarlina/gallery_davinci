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

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const userId = decoded.userId;
    const existingLike = await prisma.like.findFirst({
      where: { userId, postId: id },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.like.create({
        data: { userId, postId: id },
      });

      // Create notification for post author (if not liking own post)
      if (post.authorId !== userId) {
        const liker = await prisma.user.findUnique({ where: { id: userId } });
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'like',
            content: `${liker?.fullName || liker?.username} menyukai postingan Anda: "${post.title}"`,
            postId: id,
            actorId: userId,
            actorName: liker?.fullName || liker?.username || 'Someone',
            contentTitle: post.title,
          },
        });
      }
    }

    const updatedPost = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { username: true, fullName: true } } },
    });

    return NextResponse.json(
      { message: existingLike ? 'Like removed' : 'Liked', post: updatedPost },
      { status: 200 }
    );
  } catch (error) {
    console.error('Like post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
