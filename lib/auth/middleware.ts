import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export const withAuth = (handler: (req: NextRequest, params: any) => Promise<NextResponse>) => {
  return async (req: NextRequest, params: any) => {
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      // Attach user info to request
      (req as any).userId = decoded.userId;
      return handler(req, params);
    } catch (error) {
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
    }
  };
};
