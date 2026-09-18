import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { teachers, circulars, accountability, circularResponses, appreciationLetters, motivationPoints } from '@/src/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyTeacherToken } from '@/src/lib/utils';
import { calculateBadges } from '@/src/lib/motivation';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  if (!id || !token || !verifyTeacherToken(id, token)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const teacherId = parseInt(id);
    const teacher = await db.select().from(teachers).where(eq(teachers.id, teacherId)).limit(1);
    
    if (teacher.length === 0) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

    // Fetch circulars that are active/sent
    const allSentCirculars = await db.select().from(circulars).where(eq(circulars.status, 'sent')).orderBy(circulars.createdAt);
    
    // Filter circulars targeting this teacher
    const relevantCirculars = allSentCirculars.filter(c => {
      if (!c.targetType || c.targetType === 'all') return true;
      if (c.targetType === 'selected' && c.targetTeacherIds) {
        try {
          const list: number[] = JSON.parse(c.targetTeacherIds);
          return list.includes(teacherId);
        } catch {
          return true;
        }
      }
      return true;
    });

    // Fetch this teacher's responses for circulars
    const responses = await db.select().from(circularResponses).where(eq(circularResponses.teacherId, teacherId));
    const responseMap = new Map<number, { viewedAt: Date | null; confirmedAt: Date | null }>();
    responses.forEach(r => {
      responseMap.set(r.circularId, { viewedAt: r.viewedAt, confirmedAt: r.confirmedAt });
    });

    // Mark viewed for any newly fetched relevant circular
    for (const c of relevantCirculars) {
      if (!responseMap.has(c.id)) {
        await db.insert(circularResponses).values({
          circularId: c.id,
          teacherId,
          viewedAt: new Date()
        }).onConflictDoNothing();
      }
    }

    const circularsWithStatus = relevantCirculars.map(c => {
      const resp = responseMap.get(c.id);
      return {
        ...c,
        isConfirmed: !!resp?.confirmedAt,
        confirmedAt: resp?.confirmedAt || null
      };
    });

    // Fetch accountability docs for this teacher
    const docs = await db.select().from(accountability).where(eq(accountability.teacherId, teacherId)).orderBy(accountability.createdAt);

    const awards = await db.select().from(appreciationLetters).where(eq(appreciationLetters.teacherId, teacherId)).orderBy(appreciationLetters.createdAt);
    
    // Fetch motivation points logs
    const motivationLogs = await db.select().from(motivationPoints).where(eq(motivationPoints.teacherId, teacherId)).orderBy(desc(motivationPoints.createdAt));

    const totalPoints = teacher[0].points || 0;
    const badgeData = calculateBadges(totalPoints);

    return NextResponse.json({
      teacher: teacher[0],
      circulars: circularsWithStatus,
      accountability: docs,
      awards: awards,
      motivation: {
        ...badgeData,
        logs: motivationLogs,
      }
    });
  } catch (error) {
    console.error("Teacher Access API error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // For signing/confirming
  const body = await req.json();
  const { id, token, action, targetId, responseText, signatureUrl } = body;

  if (!id || !token || !verifyTeacherToken(id, token)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const teacherId = parseInt(id);

    if (action === 'confirm_circular') {
      await db.insert(circularResponses).values({
        circularId: parseInt(targetId),
        teacherId,
        confirmedAt: new Date(),
        viewedAt: new Date()
      }).onConflictDoUpdate({
        target: [circularResponses.circularId, circularResponses.teacherId], // Need to add unique constraint for this in schema
        set: { confirmedAt: new Date() }
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'sign_accountability') {
      await db.update(accountability)
        .set({
          responseText,
          signatureUrl,
          signedAt: new Date(),
          status: 'signed'
        })
        .where(and(eq(accountability.id, parseInt(targetId)), eq(accountability.teacherId, teacherId)));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error("Teacher Action API error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
