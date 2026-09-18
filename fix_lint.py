with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Close sidebar by default on smaller screens
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);"""

new_code = """  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Target not found directly, checking variations...")
