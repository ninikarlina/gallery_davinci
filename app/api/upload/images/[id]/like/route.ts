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

    const image = await prisma.image.findUnique({ where: { id } });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const userId = decoded.userId;
    const existingLike = await prisma.like.findFirst({
      where: { userId, imageId: id },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.like.create({
        data: { userId, imageId: id },
      });

      // Create notification for image author (if not liking own image)
      if (image.authorId !== userId) {
        const liker = await prisma.user.findUnique({ where: { id: userId } });
        await prisma.notification.create({
          data: {
            userId: image.authorId,
            type: 'like',
            content: `${liker?.fullName || liker?.username} menyukai gambar Anda: "${image.title}"`,
            imageId: id,
            actorId: userId,
            actorName: liker?.fullName || liker?.username || 'Someone',
            contentTitle: image.title,
          },
        });
      }
    }

    const updatedImage = await prisma.image.findUnique({
      where: { id },
      include: { author: { select: { username: true, fullName: true } } },
    });

    return NextResponse.json(
      { message: existingLike ? 'Like removed' : 'Liked', image: updatedImage },
      { status: 200 }
    );
  } catch (error) {
    console.error('Like image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
