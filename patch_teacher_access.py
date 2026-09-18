with open('app/api/teacher-access/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { teachers, circulars, accountability, circularResponses } from '@/src/db/schema';", "import { teachers, circulars, accountability, circularResponses, appreciationLetters } from '@/src/db/schema';")

awards_str = """    const awards = await db.select().from(appreciationLetters).where(eq(appreciationLetters.teacherId, teacherId)).orderBy(appreciationLetters.createdAt);
    
    return NextResponse.json({
      teacher: teacher[0],
      circulars: circularsWithStatus,
      accountability: docs,
      awards: awards
    });"""

content = content.replace("""    return NextResponse.json({
      teacher: teacher[0],
      circulars: circularsWithStatus,
      accountability: docs
    });""", awards_str)

with open('app/api/teacher-access/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
