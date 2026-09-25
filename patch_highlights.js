const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// Replace customHighlightsRef type
code = code.replace(
  /const customHighlightsRef = useRef<\{ id: string; range: Range; colorId: string \}\[\]>\(\[\]\);/,
  `type PersistentHighlight = {
    id: string;
    chapterIndex: number;
    startOffset: number;
    endOffset: number;
    colorId: string;
  };
  const customHighlightsRef = useRef<PersistentHighlight[]>([]);`
);

const highlighterLogic = `
  // ─── PERMANENT HIGHLIGHTER SYSTEM (CSS Custom Highlights) ────────────────
  
  // DOM Walker to get exact character offsets relative to a container
  const getSelectionOffsets = (container: HTMLElement, range: Range) => {
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    return { start, end: start + range.toString().length };
  };

  // DOM Walker to restore a Range from exact character offsets
  const createRangeFromOffsets = (container: HTMLElement, start: number, end: number): Range | null => {
    let charIndex = 0;
    const range = document.createRange();
    range.setStart(container, 0);
    range.collapse(true);
    
    const nodeStack: Node[] = [container];
    let node: Node | undefined;
    let foundStart = false;
    let stop = false;

    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType === 3) {
        const textLength = node.nodeValue?.length || 0;
        const nextCharIndex = charIndex + textLength;
        
        if (!foundStart && start >= charIndex && start <= nextCharIndex) {
          range.setStart(node, start - charIndex);
          foundStart = true;
        }
        if (foundStart && end >= charIndex && end <= nextCharIndex) {
          range.setEnd(node, end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }
    return stop ? range : null;
  };

  const renderCSSHighlights = useCallback(() => {
    if (typeof CSS === "undefined" || !("highlights" in CSS)) return;
    
    const groups: Record<string, Range[]> = {};
    HIGHLIGHT_COLORS.forEach(c => groups[c.id] = []);

    customHighlightsRef.current.forEach(h => {
      const article = document.getElementById(\`chapter-container-\${h.chapterIndex}\`);
      if (!article) return;
      const range = createRangeFromOffsets(article, h.startOffset, h.endOffset);
      if (range && groups[h.colorId]) {
        groups[h.colorId].push(range);
      }
    });

    HIGHLIGHT_COLORS.forEach(c => {
      const highlightName = \`lumina-hl-\${c.id}\`;
      try {
        (CSS as any).highlights.delete(highlightName);
        if (groups[c.id].length > 0) {
          const highlight = new (window as any).Highlight(...groups[c.id]);
          (CSS as any).highlights.set(highlightName, highlight);
        }
      } catch (e) {
        console.error("CSS Highlights error", e);
      }
    });
  }, []);

  const saveHighlightsLocal = () => {
    if (typeof window !== "undefined" && bookTitle) {
      localStorage.setItem(\`lumina_hl_\${bookTitle}\`, JSON.stringify(customHighlightsRef.current));
    }
  };

  const applyHighlightColor = useCallback((range: Range, color: typeof HIGHLIGHT_COLORS[0]) => {
    let container: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
    if (container.nodeType === 3) container = container.parentElement;
    const article = container?.closest('article[id^="chapter-container-"]');
    
    if (!article) return;
    const chapterIndex = parseInt(article.id.replace('chapter-container-', ''), 10);
    const { start, end } = getSelectionOffsets(article as HTMLElement, range);
    
    customHighlightsRef.current.push({
      id: Date.now().toString(),
      chapterIndex,
      startOffset: start,
      endOffset: end,
      colorId: color.id
    });
    
    saveHighlightsLocal();
    renderCSSHighlights();
  }, [renderCSSHighlights, bookTitle]);

  const eraseHighlights = useCallback((range: Range) => {
    let container: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
    if (container.nodeType === 3) container = container.parentElement;
    const article = container?.closest('article[id^="chapter-container-"]');
    if (!article) return;
    const chapterIndex = parseInt(article.id.replace('chapter-container-', ''), 10);
    const { start, end } = getSelectionOffsets(article as HTMLElement, range);

    customHighlightsRef.current = customHighlightsRef.current.filter(h => {
      if (h.chapterIndex !== chapterIndex) return true;
      // Intersection math on character offsets
      const overlap = Math.max(start, h.startOffset) < Math.min(end, h.endOffset);
      return !overlap;
    });

    saveHighlightsLocal();
    renderCSSHighlights();
  }, [renderCSSHighlights, bookTitle]);
`;

const oldHighlighterRegex = /\/\/ ─── PERMANENT HIGHLIGHTER SYSTEM \(CSS Custom Highlights\) ────────────────[\s\S]*?renderCSSHighlights\(\);\n  \}, \[renderCSSHighlights\]\);/g;
code = code.replace(oldHighlighterRegex, highlighterLogic);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
