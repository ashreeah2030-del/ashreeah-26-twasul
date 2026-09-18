import { NextRequest, NextResponse } from 'next/server';
import { getAllTeachers } from '@/src/lib/db-helpers';
import { generateTeacherToken } from '@/src/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'يرجى إدخال رقم الجوال أو السجل المدني' }, { status: 400 });
    }

    const cleanQuery = query.trim().replace(/[^0-9]/g, '');
    if (!cleanQuery) {
      return NextResponse.json({ error: 'مدخل غير صالح' }, { status: 400 });
    }

    const teachers = await getAllTeachers();
    
    // Match by nationalId or phone or employeeId
    const teacher = teachers.find(t => {
      const cleanPhone = (t.phone || '').replace(/[^0-9]/g, '');
      const cleanNationalId = (t.nationalId || '').replace(/[^0-9]/g, '');
      const cleanEmpId = (t.employeeId || '').replace(/[^0-9]/g, '');

      // Check national ID match
      if (cleanNationalId && cleanNationalId === cleanQuery) return true;
      // Check employee ID match
      if (cleanEmpId && cleanEmpId === cleanQuery) return true;
      // Check phone match (supports 05..., 9665..., 5...)
      if (cleanPhone) {
        if (cleanPhone === cleanQuery) return true;
        if (cleanPhone.endsWith(cleanQuery) && cleanQuery.length >= 8) return true;
        if (cleanQuery.endsWith(cleanPhone) && cleanPhone.length >= 8) return true;
      }
      return false;
    });

    if (!teacher) {
      return NextResponse.json({ 
        error: 'لم يتم العثور على سجل مطابق. يرجى التأكد من رقم الجوال أو السجل المدني المسجل بالمجمع' 
      }, { status: 404 });
    }

    const token = generateTeacherToken(teacher.id);
    return NextResponse.json({
      success: true,
      teacherId: teacher.id,
      name: teacher.name,
      portalPath: `/teacher/${teacher.id}/${token}`,
      fullUrl: `https://shreeah2026.ai.studio/teacher/${teacher.id}/${token}`
    });
  } catch (error) {
    console.error('Teacher lookup error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء البحث' }, { status: 500 });
  }
}
