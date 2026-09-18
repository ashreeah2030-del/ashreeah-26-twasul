import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { db } from '@/src/db/index';
import { appreciationLetters, teachers } from '@/src/db/schema';
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
      id: appreciationLetters.id,
      teacherId: appreciationLetters.teacherId,
      reason: appreciationLetters.reason,
      letterDate: appreciationLetters.letterDate,
      createdAt: appreciationLetters.createdAt,
      teacherName: teachers.name,
      teacherPhone: teachers.phone,
    })
    .from(appreciationLetters)
    .leftJoin(teachers, eq(appreciationLetters.teacherId, teachers.id))
    .orderBy(desc(appreciationLetters.createdAt));

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Failed to load awards:", error);
    return NextResponse.json({ error: 'Failed to load awards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { teacherId, reason } = body;

    if (!teacherId || !reason) {
      return NextResponse.json({ error: 'المعلم والسبب مطلوبان' }, { status: 400 });
    }

    const created = await db.insert(appreciationLetters).values({
      teacherId: parseInt(teacherId),
      reason,
    }).returning();

    return NextResponse.json(created[0]);
  } catch (error) {
    console.error("Failed to create award:", error);
    return NextResponse.json({ error: 'Failed to create award' }, { status: 500 });
  }
}
