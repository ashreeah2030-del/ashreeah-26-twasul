import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { getAllCirculars, addCircular } from '@/src/lib/db-helpers';

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const list = await getAllCirculars();
    return NextResponse.json(list);
  } catch (error) {
    console.error("Failed to load circulars:", error);
    return NextResponse.json({ error: 'Failed to load circulars' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, content, category, targetLevel, status, targetType, targetTeacherIds } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'العنوان والمحتوى مطلوبان' }, { status: 400 });
    }

    const created = await addCircular({
      title,
      content,
      category: category || 'عام',
      targetLevel: targetLevel || 'كامل المجمع',
      targetType: targetType || 'all',
      targetTeacherIds: Array.isArray(targetTeacherIds) ? JSON.stringify(targetTeacherIds) : (targetTeacherIds || null),
      status: status || 'sent',
    });

    return NextResponse.json(created[0]);
  } catch (error) {
    console.error("Failed to create circular:", error);
    return NextResponse.json({ error: 'Failed to create circular' }, { status: 500 });
  }
}
