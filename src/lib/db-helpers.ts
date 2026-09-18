import { db } from '../db/index';
import { teachers, circulars, circularResponses, accountability, appreciationLetters, users } from '../db/schema';
import { eq, count, and, desc, isNotNull } from 'drizzle-orm';

export async function getDashboardStats() {
  try {
    const teacherCount = await db.select({ value: count() }).from(teachers);
    const circularSent = await db.select({ value: count() }).from(circulars).where(eq(circulars.status, 'sent'));
    const circularViewedCount = await db.select({ value: count() }).from(circularResponses).where(isNotNull(circularResponses.viewedAt));
    const accountabilitySent = await db.select({ value: count() }).from(accountability).where(eq(accountability.status, 'sent'));
    const appreciationCount = await db.select({ value: count() }).from(appreciationLetters);

    // Badges statistics calculation
    const allTeacherPoints = await db.select({ points: teachers.points }).from(teachers);
    let progressCount = 0;
    let excellenceCount = 0;
    let stardomCount = 0;
    let inProgressCount = 0;

    allTeacherPoints.forEach(t => {
      const p = t.points || 0;
      if (p >= 300) {
        stardomCount++;
      } else if (p >= 200) {
        excellenceCount++;
      } else if (p >= 100) {
        progressCount++;
      } else {
        inProgressCount++;
      }
    });

    return {
      totalTeachers: teacherCount[0].value,
      circulars: {
        sent: circularSent[0].value,
        viewed: circularViewedCount[0]?.value || 0,
        pending: Math.max(0, (teacherCount[0].value * (circularSent[0].value || 0)) - (circularViewedCount[0]?.value || 0)),
      },
      accountability: {
        sent: accountabilitySent[0].value,
        signed: 0,
        pending: 0,
      },
      appreciationLetters: appreciationCount[0].value,
      badges: {
        progress: progressCount,
        excellence: excellenceCount,
        stardom: stardomCount,
        inProgress: inProgressCount,
        totalAwarded: progressCount + excellenceCount + stardomCount,
        // Cumulative count (all who reached or exceeded tier)
        cumulativeProgress: progressCount + excellenceCount + stardomCount,
        cumulativeExcellence: excellenceCount + stardomCount,
        cumulativeStardom: stardomCount,
      }
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw new Error("Could not fetch statistics.", { cause: error });
  }
}

export async function getAllTeachers() {
  try {
    return await db.select().from(teachers).orderBy(teachers.name);
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    throw new Error("Could not fetch teachers list.", { cause: error });
  }
}

export async function addTeacher(data: any) {
  try {
    return await db.insert(teachers).values(data).returning();
  } catch (error) {
    console.error("Failed to add teacher:", error);
    throw new Error("Could not add teacher.", { cause: error });
  }
}

export async function updateTeacher(id: number, data: any) {
  try {
    return await db.update(teachers).set(data).where(eq(teachers.id, id)).returning();
  } catch (error) {
    console.error("Failed to update teacher:", error);
    throw new Error("Could not update teacher.", { cause: error });
  }
}

export async function deleteTeacher(id: number) {
  try {
    await db.delete(accountability).where(eq(accountability.teacherId, id));
    await db.delete(circularResponses).where(eq(circularResponses.teacherId, id));
    return await db.delete(teachers).where(eq(teachers.id, id)).returning();
  } catch (error) {
    console.error("Failed to delete teacher:", error);
    throw new Error("Could not delete teacher.", { cause: error });
  }
}

// Circulars Helpers
export async function getAllCirculars() {
  try {
    let list = await db.select().from(circulars).orderBy(desc(circulars.createdAt));

    // Auto seed templates if database is empty
    if (list.length === 0) {
      const seedTemplates = [
        {
          title: 'تعميم التقيد بأوقات الدوام الرسمي والالتزام بالحضور الصباحي',
          category: 'انضباط ودوام',
          targetLevel: 'كامل المجمع',
          status: 'sent',
          content: `المكرمون منسوبو مجمع الشريعة التعليمي المحترمون،\nالسلام عليكم ورحمة الله وبركاته،،\n\nانطلاقاً من الحرص على انضباط العملية التعليمية والتربوية، وتأكيداً على اللوائح المنظمة لدوام المنسوبين:\n1. التأكيد على الحضور قبل بدء الاصطفاف الصباحي في تمام الساعة 6:45 صباحاً.\n2. تسجيل الحضور والانصراف عبر البصمة الإلكترونية والنظام المعتمد بدقة.\n3. الالتزام بالحصص الدراسية والمناوبة اليومية وفق الجدول المعتمد.\n4. رفع الأعذار والتقارير الطبية فور وقوعها عبر منصة فارس خلال المدة النظامية.\n\nشاكرين لكم حسن تعاونكم واستشعاركم للمسؤولية.\n\nإدارة مجمع الشريعة التعليمي`
        },
        {
          title: 'تعميم تنظيم الإشراف اليومي والمناوبة المدرسية وضمان سلامة الطلاب',
          category: 'إشراف ومناوبة',
          targetLevel: 'كامل المجمع',
          status: 'sent',
          content: `المكرمون المعلمون القائمون على الإشراف والمناوبة المحترمون،\nالسلام عليكم ورحمة الله وبركاته،،\n\nنظراً لما يمثله الإشراف والمناوبة من أهمية بالغة في حفظ سلامة الطلاب وسير اليوم الدراسي بانسيابية:\n1. التواجد في أماكن الإشراف المحددة (الساحات، الممرات، المقصف المدرسي) قبل الاصطفاف الصباحي وخلال الفسحة.\n2. التزام المشرفين بالمناوبة حتى انصراف آخر طالب من المجمع والتأكد من صعود الطلاب لوسائل النقل.\n3. متابعة سلوكيات الطلاب وتدوين أي ملاحظات في سجل المناوبة لدى وكيل شؤون الطلاب فوراً.\n\nنثمن جهودكم المخلصة في رعاية أبنائنا وضمان سلامتهم.\n\nلجنة الإشراف والمناوبة - مجمع الشريعة التعليمي`
        },
        {
          title: 'تعميم استكمال رصد المهارات والدرجات في نظام نور وتحديث سجلات المتابعة',
          category: 'شؤون تعليمية ونور',
          targetLevel: 'كامل المجمع',
          status: 'sent',
          content: `المكرمون معلمو المراحل التعليمية بالمجمع المحترمون،\nالسلام عليكم ورحمة الله وبركاته،،\n\nحرصاً على دقة التقويم المستمر وسرعة إطلاع أولياء الأمور عبر منصة مدرستي ونظام نور:\n1. رصد درجات أعمال السنة والاختبارات القصيرة والمهمات الأدائية أولاً بأول في نظام نور.\n2. مطابقة الكشوف الورقية بسجلات النظام للتأكد من اكتمال رصد كافة الطلاب.\n3. تسليم كشوف الدرجات المعتمدة لوكيل الشؤون التعليمية والمدرسية قبل نهاية دوام الخميس القادم.\n4. إشعار المرشد الطلابي بأي حالات تدني مستوى دراسي لمعالجتها مبكراً.\n\nوكيل الشؤون التعليمية والمدرسية - مجمع الشريعة التعليمي`
        },
        {
          title: 'تعميم تعليمات إعداد وتسليم أسئلة الاختبارات ولجان الكنترول والرصد',
          category: 'اختبارات وكنترول',
          targetLevel: 'المتوسطة والثانوية',
          status: 'sent',
          content: `المكرمون معلمو المراحل المستهدفة بالاختبارات المحترمون،\nالسلام عليكم ورحمة الله وبركاته،،\n\nمع اقتراب فترة الاختبارات، نؤكد على ضرورة الالتزام بالمعايير والضوابط الوزارية المنظمة:\n1. إعداد الأسئلة وفق جدول المواصفات مع نموذج إجابة مفصل يوضح توزيع الدرجات بدقة.\n2. تسليم أظرف الأسئلة مغلقة ومختومة وموقعة لإدارة الكنترول في الموعد المحدد مع حفظ سريتها التامة.\n3. التقيد بجدول الملاحظة والتصحيح والمراجعة الفورية داخل غرفة الكنترول.\n4. عدم مغادرة مقر الكنترول إلا بعد اكتمال تدقيق ورصد المادة.\n\nلجنة الاختبارات والكنترول - مجمع الشريعة التعليمي`
        },
        {
          title: 'تعميم خطة الطوارئ وتطبيق معايير الأمن والسلامة المدرسية',
          category: 'أمن وسلامة',
          targetLevel: 'كامل المجمع',
          status: 'sent',
          content: `المكرمون منسوبو مجمع الشريعة التعليمي (الهيئة التعليمية والإدارية) المحترمون،\nالسلام عليكم ورحمة الله وبركاته،،\n\nحرصاً على توفير بيئة مدرسية آمنة وصحية لجميع الطلاب والمنسوبين:\n1. التأكد من خلو مخارج وممرات الطوارئ والسلالم من أي عوائق بصفة دائمة.\n2. فحص وتفقد طفايات الحريق وخراطيم الإطفاء وأجهزة الإنذار في كافة الأدوار والمرافق.\n3. تدريب الطلاب على خطة الإخلاء الافتراضية والتوجه إلى نقاط التجمع الآمنة في الفناء الخارجي.\n4. الإبلاغ الفوري لإدارة المجمع أو منسق السلامة عن أي التماس أو خطر محتمل.\n\nمنسق الأمن والسلامة المدرسية - مجمع الشريعة التعليمي`
        },
        {
          title: 'تعميم خطة البرامج والأنشطة الطلابية والفعاليات والبرامج اللاصفية',
          category: 'أنشطة وفعاليات',
          targetLevel: 'كامل المجمع',
          status: 'sent',
          content: `المكرمون رواد الفصول ومعلمو المجمع المحترمون،\nالسلام عليكم ورحمة الله وبركاته،،\n\nسعياً لتحقيق مستهدفات الأنشطة اللاصفية وصقل مواهب الطلاب وتنمية مهاراتهم:\n1. تفعيل الإذاعة المدرسية الصباحية وحث الطلاب على المشاركة النوعية والمواضيع الهادفة.\n2. حصر وترشيح الطلاب المتميزين والموهوبين في الأنشطة الرياضية، العلمية، والثقافية.\n3. المشاركة الفاعلة في البرامج والمسابقات الوزارية والاحتفاء بالمناسبات الوطنية المعتمدة.\n4. التنسيق مع رائد النشاط لتوثيق الفعاليات ورفع تقارير الأنشطة الدورية.\n\nرائد النشاط الطلابي - مجمع الشريعة التعليمي`
        },
        {
          title: 'تعميم إداري عام لمنسوبي مجمع الشريعة التعليمي',
          category: 'عام',
          targetLevel: 'كامل المجمع',
          status: 'sent',
          content: `المكرمون منسوبو مجمع الشريعة التعليمي المحترمون،\nالسلام عليكم ورحمة الله وبركاته،،\n\nيسر إدارة مجمع الشريعة التعليمي أن تتوجه لكم بخالص الشكر والتقدير على جهودكم المتميزة في خدمة العملية التعليمية.\nنود التأكيد على ما يلي:\n1. متابعة الرسائل والتعاميم الصادرة عبر المنصة بصفة دورية والاطلاع عليها وتأكيد القراءة إلكترونياً.\n2. التعاون المشترك بين كافة الفرق التعليمية والإدارية لما فيه مصلحة أبنائنا الطلاب.\n3. التواصل مع إدارة المجمع لأي مقترحات أو استفسارات تطويرية تساهم في تحسين البيئة المدرسية.\n\nوفقنا الله وإياكم لما فيه الخير والسداد.\n\nمدير مجمع الشريعة التعليمي`
        }
      ];

      for (const t of seedTemplates) {
        await db.insert(circulars).values(t);
      }
      list = await db.select().from(circulars).orderBy(desc(circulars.createdAt));
    }
    
    // Get response stats for each circular
    const responses = await db.select({
      circularId: circularResponses.circularId,
      viewedCount: count(circularResponses.viewedAt),
      confirmedCount: count(circularResponses.confirmedAt)
    }).from(circularResponses).groupBy(circularResponses.circularId);

    const statsMap = new Map<number, { viewed: number; confirmed: number }>();
    responses.forEach(r => {
      statsMap.set(r.circularId, { viewed: Number(r.viewedCount), confirmed: Number(r.confirmedCount) });
    });

    const teacherCountResult = await db.select({ value: count() }).from(teachers).where(eq(teachers.status, 'active'));
    const totalActiveTeachers = Number(teacherCountResult[0]?.value || 0);

    return list.map(c => {
      let targetCount = totalActiveTeachers;
      if (c.targetType === 'selected' && c.targetTeacherIds) {
        try {
          const parsed = JSON.parse(c.targetTeacherIds);
          if (Array.isArray(parsed)) {
            targetCount = parsed.length;
          }
        } catch {
          targetCount = totalActiveTeachers;
        }
      }

      return {
        ...c,
        stats: {
          totalTarget: targetCount,
          viewed: statsMap.get(c.id)?.viewed || 0,
          confirmed: statsMap.get(c.id)?.confirmed || 0
        }
      };
    });
  } catch (error) {
    console.error("Failed to fetch circulars:", error);
    throw new Error("Could not fetch circulars list.", { cause: error });
  }
}

export async function getCircularSignaturesStatus(circularId: number) {
  try {
    const circ = await db.select().from(circulars).where(eq(circulars.id, circularId)).limit(1);
    if (!circ || circ.length === 0) return null;
    const circular = circ[0];

    // Fetch all active teachers
    const allTeachers = await db.select().from(teachers).where(eq(teachers.status, 'active')).orderBy(teachers.name);

    // Filter target teachers if selected
    let targetedTeachers = allTeachers;
    if (circular.targetType === 'selected' && circular.targetTeacherIds) {
      try {
        const idList: number[] = JSON.parse(circular.targetTeacherIds);
        const idSet = new Set(idList);
        targetedTeachers = allTeachers.filter(t => idSet.has(t.id));
      } catch (e) {
        console.error("Failed to parse targetTeacherIds:", e);
      }
    }

    // Fetch all responses for this circular
    const responses = await db.select().from(circularResponses).where(eq(circularResponses.circularId, circularId));
    const responseMap = new Map<number, { viewedAt: Date | null; confirmedAt: Date | null }>();
    responses.forEach(r => {
      responseMap.set(r.teacherId, { viewedAt: r.viewedAt, confirmedAt: r.confirmedAt });
    });

    const signedTeachers: any[] = [];
    const unsignedTeachers: any[] = [];

    targetedTeachers.forEach(t => {
      const resp = responseMap.get(t.id);
      const isSigned = !!resp?.confirmedAt;
      const isViewed = !!resp?.viewedAt;

      const item = {
        id: t.id,
        name: t.name,
        phone: t.phone,
        jobTitle: t.jobTitle,
        discipline: t.discipline,
        level: t.level,
        employeeId: t.employeeId,
        isSigned,
        isViewed,
        viewedAt: resp?.viewedAt || null,
        signedAt: resp?.confirmedAt || null,
      };

      if (isSigned) {
        signedTeachers.push(item);
      } else {
        unsignedTeachers.push(item);
      }
    });

    return {
      circular,
      summary: {
        totalTarget: targetedTeachers.length,
        signedCount: signedTeachers.length,
        unsignedCount: unsignedTeachers.length,
        percentage: targetedTeachers.length > 0 ? Math.round((signedTeachers.length / targetedTeachers.length) * 100) : 0
      },
      signedTeachers,
      unsignedTeachers
    };
  } catch (error) {
    console.error("Failed to get circular signature status:", error);
    throw new Error("Could not retrieve circular signatures status.", { cause: error });
  }
}

export async function addCircular(data: any) {
  try {
    return await db.insert(circulars).values(data).returning();
  } catch (error) {
    console.error("Failed to add circular:", error);
    throw new Error("Could not add circular.", { cause: error });
  }
}

export async function updateCircular(id: number, data: any) {
  try {
    return await db.update(circulars).set(data).where(eq(circulars.id, id)).returning();
  } catch (error) {
    console.error("Failed to update circular:", error);
    throw new Error("Could not update circular.", { cause: error });
  }
}

export async function deleteCircular(id: number) {
  try {
    await db.delete(circularResponses).where(eq(circularResponses.circularId, id));
    return await db.delete(circulars).where(eq(circulars.id, id)).returning();
  } catch (error) {
    console.error("Failed to delete circular:", error);
    throw new Error("Could not delete circular.", { cause: error });
  }
}

export async function getOrCreateAdmin(uid: string, email: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) return existing[0];

    const result = await db.insert(users).values({ uid, email, role: 'admin' }).returning();
    return result[0];
  } catch (error) {
    console.error("Failed to get/create admin:", error);
    throw new Error("Authentication synchronization failed.", { cause: error });
  }
}
