const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const oldCodeStart = code.indexOf('// ─── VERTICAL SCROLL PROGRESS TRACKER ──────────────────────────────────────');
const oldCodeEnd = code.indexOf('// Reset vertical progress when switching modes');

if (oldCodeStart !== -1 && oldCodeEnd !== -1) {
  const newLogic = `// ─── SCROLL & CHAPTER PROGRESS TRACKER ──────────────────────────────────────
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isReading) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const max = scrollHeight - clientHeight;
      const pct = max <= 0 ? 100 : Math.min(100, Math.round((scrollTop / max) * 100));
      setVerticalProgress(pct);

      if (scrollMode === "horizontal") {
        setChapterProgress(max <= 0 ? 100 : Math.min(100, Math.max(0, (scrollTop / max) * 100)));
      } else {
        // Vertical mode: calculate progress based on the chapter in view
        let found = false;
        const containerRect = container.getBoundingClientRect();
        
        for (let i = 0; i < chapters.length; i++) {
          const el = document.getElementById(\`chapter-container-\${i}\`);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          
          const relTop = rect.top - containerRect.top;
          const relBottom = rect.bottom - containerRect.top;
          
          if (relTop <= containerRect.height && relBottom >= 0) {
            if (relTop <= 0 && relBottom >= 0) {
              const maxScroll = Math.max(1, rect.height - containerRect.height);
              const progress = Math.min(100, Math.max(0, (-relTop / maxScroll) * 100));
              setChapterProgress(progress);
              
              if (currentChapterIndex !== i && -relTop > 50) {
                 setCurrentChapterIndex(i);
              }
              found = true;
              break;
            } else if (relTop > 0) {
              if (!found) setChapterProgress(0);
              found = true;
              break;
            }
          }
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    
    // Slight delay to allow DOM to render before calculating
    setTimeout(handleScroll, 100);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [scrollMode, isReading, chapters, currentChapterIndex]);

  `;

  code = code.substring(0, oldCodeStart) + newLogic + code.substring(oldCodeEnd);
  fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
} else {
  console.log("Could not find boundaries.");
}
