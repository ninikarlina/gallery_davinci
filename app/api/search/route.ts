import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    const query = q.trim();

    if (!query) {
      return NextResponse.json({ users: [], posts: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, username: true, fullName: true, avatar: true },
      take: 20,
    });

    const posts = await prisma.post.findMany({
      where: { title: { contains: query, mode: 'insensitive' } },
      include: { author: { select: { id: true, username: true, fullName: true, avatar: true } } },
      take: 40,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users, posts });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
