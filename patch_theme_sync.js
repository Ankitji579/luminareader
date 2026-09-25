const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// 1. Find the theme state declaration
const themeStateTarget = /const \[theme, setTheme\] = useState<ThemeName>\("light"\);/;

const themeStateNew = `const [theme, setTheme] = useState<ThemeName>("light");
  const { resolvedTheme, setTheme: setNextTheme } = useNextTheme();

  // Sync initial reader theme with global Next.js theme
  useEffect(() => {
    if (resolvedTheme === "dark") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [resolvedTheme]);

  const changeTheme = (newTheme: ThemeName) => {
    setTheme(newTheme);
    if (setNextTheme) {
      setNextTheme(newTheme === "light" || newTheme === "sepia" ? "light" : "dark");
    }
  };`;

code = code.replace(themeStateTarget, themeStateNew);

// 2. Replace setTheme(tid) with changeTheme(tid)
code = code.replace(/setTheme\(tid\)/g, 'changeTheme(tid)');

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
