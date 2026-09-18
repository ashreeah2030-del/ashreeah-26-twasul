import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Teacher interface
content = content.replace(
    "  employeeId?: string;\n  status: 'active' | 'suspended';",
    "  employeeId?: string;\n  status: 'active' | 'suspended';\n  portalToken?: string;"
)

# 2. Add state for accountability and awards
state_str = """  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [circularSearch, setCircularSearch] = useState<string>('');
  const [isCreateCircularOpen, setIsCreateCircularOpen] = useState(false);
  const [viewingCircular, setViewingCircular] = useState<Circular | null>(null);
  const [deletingCircular, setDeletingCircular] = useState<Circular | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [accountabilityDocs, setAccountabilityDocs] = useState<any[]>([]);
  const [isCreateAccountabilityOpen, setIsCreateAccountabilityOpen] = useState(false);
  const [newAccTeacherId, setNewAccTeacherId] = useState<string>('');
  const [newAccTitle, setNewAccTitle] = useState<string>('');
  const [newAccSubject, setNewAccSubject] = useState<string>('');
  const [newAccDetails, setNewAccDetails] = useState<string>('');

  const [awards, setAwards] = useState<any[]>([]);
  const [isCreateAwardOpen, setIsCreateAwardOpen] = useState(false);
  const [newAwardTeacherId, setNewAwardTeacherId] = useState<string>('');
  const [newAwardReason, setNewAwardReason] = useState<string>('');"""

content = re.sub(
    r"  const \[circulars.*?useState<string \| null>\(null\);",
    state_str,
    content,
    flags=re.DOTALL
)

# 3. Update fetchData
fetchdata_str = """        fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/teachers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/circulars', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/accountability', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/awards', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json();
      const teachersData = await teachersRes.json();
      const circularsData = await circularsRes.json();
      const accData = await accRes.json();
      const awardsData = await awardsRes.json();
      
      if (!statsData.error) setStats(statsData);
      if (!teachersData.error) setTeachers(teachersData);
      if (!circularsData.error) setCirculars(circularsData);
      if (!accData.error) setAccountabilityDocs(accData);
      if (!awardsData.error) setAwards(awardsData);"""

content = re.sub(
    r"        fetch\('/api/stats.*?setCirculars\(circularsData\);",
    fetchdata_str,
    content,
    flags=re.DOTALL
)
content = content.replace("const [statsRes, teachersRes, circularsRes] = await Promise.all([", "const [statsRes, teachersRes, circularsRes, accRes, awardsRes] = await Promise.all([")

# 4. Add handlers for creating accountability and awards
handlers_str = """  const handleCreateAccountability = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/accountability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          teacherId: newAccTeacherId,
          title: newAccTitle,
          subject: newAccSubject,
          details: newAccDetails
        })
      });
      if (res.ok) {
        setIsCreateAccountabilityOpen(false);
        setNewAccTeacherId(''); setNewAccTitle(''); setNewAccSubject(''); setNewAccDetails('');
        fetchData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAward = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          teacherId: newAwardTeacherId,
          reason: newAwardReason
        })
      });
      if (res.ok) {
        setIsCreateAwardOpen(false);
        setNewAwardTeacherId(''); setNewAwardReason('');
        fetchData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getTeacherPortalUrl = (t: Teacher) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/teacher/${t.id}/${t.portalToken}`;
  };

  const handleShareTeacherPortal = (t: Teacher) => {
    const url = getTeacherPortalUrl(t);
    const msg = `*مجمع الشريعة التعليمي*\n\nأهلاً بك أ. ${t.name}\n\nيمكنك الآن الدخول إلى بوابة الموظف الخاصة بك عبر الرابط التالي للاطلاع على التعاميم وأوراق المساءلة وشهادات التحفيز الخاصة بك:\n\n${url}`;
    window.open(`https://wa.me/966${t.phone.replace(/^0+/, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareAccountability = (doc: any) => {
    const t = teachers.find(x => x.id === doc.teacherId);
    if (!t) return;
    const url = getTeacherPortalUrl(t);
    const msg = `*مجمع الشريعة التعليمي - إشعار مساءلة*\n\nالمكرم أ. ${t.name}\n\nنأمل منكم الدخول للبوابة للاطلاع على ورقة المساءلة بعنوان: "${doc.title}" والرد عليها عبر الرابط التالي:\n\n${url}`;
    window.open(`https://wa.me/966${t.phone.replace(/^0+/, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareAward = (award: any) => {
    const t = teachers.find(x => x.id === award.teacherId);
    if (!t) return;
    const url = getTeacherPortalUrl(t);
    const msg = `*مجمع الشريعة التعليمي - شهادة شكر وتقدير*\n\nالمكرم أ. ${t.name}\n\nيسر إدارة المجمع أن تتقدم لكم بخالص الشكر والتقدير لجهودكم المبذولة. تم إصدار شهادة تحفيز لكم، يمكنكم الاطلاع عليها عبر بوابتكم الخاصة:\n\n${url}`;
    window.open(`https://wa.me/966${t.phone.replace(/^0+/, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareCircularWhatsApp ="""

content = content.replace("  const handleShareCircularWhatsApp =", handlers_str)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
