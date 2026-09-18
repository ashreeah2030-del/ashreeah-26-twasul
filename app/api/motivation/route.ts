import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { db } from '@/src/db/index';
import { teachers, motivationDomains, motivationPoints } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { calculateBadges } from '@/src/lib/motivation';

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
    // 1. Fetch all domains
    const domains = await db.select().from(motivationDomains).orderBy(motivationDomains.id);

    // 2. Fetch all teachers ordered by points desc
    const allTeachers = await db.select().from(teachers).orderBy(desc(teachers.points));

    const teachersWithBadges = allTeachers.map((t, idx) => {
      const badgeCalc = calculateBadges(t.points || 0);
      return {
        ...t,
        rank: idx + 1,
        ...badgeCalc,
      };
    });

    // 3. Fetch recent points logs with teacher info
    const logs = await db
      .select({
        id: motivationPoints.id,
        teacherId: motivationPoints.teacherId,
        domainId: motivationPoints.domainId,
        domainTitle: motivationPoints.domainTitle,
        points: motivationPoints.points,
        notes: motivationPoints.notes,
        grantedBy: motivationPoints.grantedBy,
        createdAt: motivationPoints.createdAt,
        teacherName: teachers.name,
        teacherPhone: teachers.phone,
        teacherSpecialty: teachers.specialty,
      })
      .from(motivationPoints)
      .leftJoin(teachers, eq(motivationPoints.teacherId, teachers.id))
      .orderBy(desc(motivationPoints.createdAt))
      .limit(50);

    // 4. Calculate summary stats
    let totalPointsAwarded = 0;
    let progressBadgesCount = 0;
    let excellenceBadgesCount = 0;
    let stardomBadgesCount = 0;

    teachersWithBadges.forEach(t => {
      const p = t.points || 0;
      totalPointsAwarded += p;
      if (p >= 100) progressBadgesCount++;
      if (p >= 200) excellenceBadgesCount++;
      if (p >= 300) stardomBadgesCount++;
    });

    return NextResponse.json({
      domains,
      teachers: teachersWithBadges,
      logs,
      summary: {
        totalTeachers: teachersWithBadges.length,
        totalPointsAwarded,
        progressBadgesCount,
        excellenceBadgesCount,
        stardomBadgesCount,
      }
    });
  } catch (error) {
    console.error("Failed to load motivation data:", error);
    return NextResponse.json({ error: 'Failed to load motivation data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    // --- Action: Add / Create New Domain ---
    if (action === 'create_domain') {
      const { title, description, points, category, icon } = body;
      if (!title || !points) {
        return NextResponse.json({ error: 'اسم المجال والنقاط مطلوبان' }, { status: 400 });
      }

      const createdDomain = await db.insert(motivationDomains).values({
        title: title.trim(),
        description: description?.trim() || null,
        points: Number(points),
        category: category?.trim() || 'عام',
        icon: icon || 'Star',
      }).returning();

      return NextResponse.json({ success: true, domain: createdDomain[0] });
    }

    // --- Action: Delete Domain ---
    if (action === 'delete_domain') {
      const { domainId } = body;
      if (!domainId) {
        return NextResponse.json({ error: 'رقم المجال مطلوب' }, { status: 400 });
      }

      await db.delete(motivationDomains).where(eq(motivationDomains.id, Number(domainId)));
      return NextResponse.json({ success: true });
    }

    // --- Default Action: Grant Points to Teacher ---
    const { teacherId, domainId, domainTitle, points, notes, grantedBy } = body;

    if (!teacherId || points === undefined || points === null) {
      return NextResponse.json({ error: 'الموظف وعدد النقاط مطلوبان' }, { status: 400 });
    }

    const tId = Number(teacherId);
    const pts = Number(points);

    // Fetch existing teacher to calculate previous badge and new badge
    const existing = await db.select().from(teachers).where(eq(teachers.id, tId)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 });
    }

    const teacher = existing[0];
    const prevPoints = teacher.points || 0;
    const newTotalPoints = Math.max(0, prevPoints + pts);

    // Insert log
    const logEntry = await db.insert(motivationPoints).values({
      teacherId: tId,
      domainId: domainId ? Number(domainId) : null,
      domainTitle: domainTitle || 'إنجاز متميز',
      points: pts,
      notes: notes || null,
      grantedBy: grantedBy || 'مدير مجمع الشريعة التعليمي',
    }).returning();

    // Update teacher total points
    const updatedTeacher = await db.update(teachers)
      .set({ points: newTotalPoints })
      .where(eq(teachers.id, tId))
      .returning();

    // Check newly unlocked badge
    let newlyUnlockedBadge: string | null = null;
    if (prevPoints < 100 && newTotalPoints >= 100) {
      newlyUnlockedBadge = 'وسام التقدم';
    }
    if (prevPoints < 200 && newTotalPoints >= 200) {
      newlyUnlockedBadge = 'وسام المثالية';
    }
    if (prevPoints < 300 && newTotalPoints >= 300) {
      newlyUnlockedBadge = 'وسام النجومية';
    }

    const badgeStatus = calculateBadges(newTotalPoints);

    return NextResponse.json({
      success: true,
      log: logEntry[0],
      teacher: updatedTeacher[0],
      newlyUnlockedBadge,
      badgeStatus,
    });
  } catch (error) {
    console.error("Failed to grant motivation points:", error);
    return NextResponse.json({ error: 'فشل منح نقاط التكريم' }, { status: 500 });
  }
}
