import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { generateTeacherToken } from '@/src/lib/utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const { id } = await params;
    const teacherId = id;
    const teacherToken = generateTeacherToken(teacherId);
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shreeah2026.ai.studio';
    const link = `${baseUrl}/teacher/${teacherId}/${teacherToken}`;
    
    return NextResponse.json({ link });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
