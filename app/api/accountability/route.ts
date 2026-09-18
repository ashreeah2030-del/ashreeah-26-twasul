import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { db } from '@/src/db/index';
import { accountability, teachers } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';

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
    const docs = await db.select({
      id: accountability.id,
      teacherId: accountability.teacherId,
      title: accountability.title,
      subject: accountability.subject,
      details: accountability.details,
      responseText: accountability.responseText,
      signatureUrl: accountability.signatureUrl,
      signedAt: accountability.signedAt,
      status: accountability.status,
      createdAt: accountability.createdAt,
      teacherName: teachers.name,
      teacherPhone: teachers.phone,
    })
    .from(accountability)
    .leftJoin(teachers, eq(accountability.teacherId, teachers.id))
    .orderBy(desc(accountability.createdAt));

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Failed to load accountability:", error);
    return NextResponse.json({ error: 'Failed to load accountability' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { teacherId, title, subject, details } = body;

    if (!teacherId || !title) {
      return NextResponse.json({ error: 'المعلم والعنوان مطلوبان' }, { status: 400 });
    }

    const created = await db.insert(accountability).values({
      teacherId: parseInt(teacherId),
      title,
      subject: subject || '',
      details: details || '',
      status: 'sent',
    }).returning();

    return NextResponse.json(created[0]);
  } catch (error) {
    console.error("Failed to create accountability:", error);
    return NextResponse.json({ error: 'Failed to create accountability' }, { status: 500 });
  }
}
