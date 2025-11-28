import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { uploadBufferToBlob, deleteFromBlob } from '@/lib/storage/blob';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)' },
        { status: 400 }
      );
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 2MB' },
        { status: 400 }
      );
    }

    // Get user to check if they have existing avatar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete old avatar from Vercel Blob if exists
    if (user.avatar && user.avatar.startsWith('https://')) {
      try {
        await deleteFromBlob(user.avatar);
        console.log(`Deleted old avatar blob: ${user.avatar}`);
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    // Upload to Vercel Blob
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const { url } = await uploadBufferToBlob(
      buffer,
      file.name,
      'avatars',
      file.type
    );

    // Update user avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: url },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user's current avatar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.avatar) {
      return NextResponse.json({ error: 'No avatar to delete' }, { status: 400 });
    }

    // Delete avatar from Vercel Blob
    if (user.avatar.startsWith('https://')) {
      try {
        await deleteFromBlob(user.avatar);
        console.log(`Deleted avatar blob: ${user.avatar}`);
      } catch (err) {
        console.error('Error deleting avatar:', err);
      }
    }

    // Update user to remove avatar
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Avatar deleted successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}
