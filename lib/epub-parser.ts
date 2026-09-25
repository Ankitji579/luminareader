import JSZip from "jszip";

export interface ParsedChapter {
  id: string;
  fullPath: string;
  fileName: string;
  title: string;
  html: string;
  textLength: number;
}

export interface TocItem {
  label: string;
  chapterIndex: number;
  href?: string;
  anchor?: string;
}

export interface ParsedBook {
  title: string;
  author: string;
  coverUrl?: string;
  chapters: ParsedChapter[];
  toc: TocItem[];
  pathMap: Record<string, number>;
}

// Helper to resolve relative path
function resolveRelativePath(basePath: string, relativePath: string): string {
  const stack = basePath.split("/");
  stack.pop(); // Remove filename

  const parts = relativePath.split("/");
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join("/").replace(/^\//, "");
}

export async function parseEpubArchive(buffer: ArrayBuffer, defaultFileName = "E-Book"): Promise<ParsedBook> {
  const zip = await JSZip.loadAsync(buffer);

  // 1. Locate the OPF package rootfile from META-INF/container.xml
  let opfPath = "";
  const containerFile = zip.file("META-INF/container.xml");
  if (containerFile) {
    const containerXml = await containerFile.async("string");
    const match = containerXml.match(/full-path="([^"]+)"/i);
    if (match && match[1]) {
      opfPath = match[1].trim();
    }
  }

  // Fallback search for any .opf file in the zip
  if (!opfPath) {
    const opfEntries = Object.keys(zip.files).filter(name => name.endsWith(".opf"));
    if (opfEntries.length > 0) {
      opfPath = opfEntries[0];
    }
  }

  // 2. Parse OPF metadata, manifest, and spine
  const manifestMap: Record<string, { href: string; mediaType: string }> = {};
  const spineIds: string[] = [];
  let bookTitle = defaultFileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
  let bookAuthor = "Classic Author";
  let ncxPath = "";
  let navPath = "";
  const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/")) : "";

  if (opfPath && zip.file(opfPath)) {
    const opfContent = await zip.file(opfPath)!.async("string");
    
    // Extract Title
    const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
    if (titleMatch && titleMatch[1]) bookTitle = titleMatch[1].trim();

    // Extract Creator/Author
    const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
    if (authorMatch && authorMatch[1]) bookAuthor = authorMatch[1].trim();

    // Parse Manifest items
    const itemRegex = /<item\s+[^>]*?id="([^"]+)"[^>]*?href="([^"]+)"[^>]*?media-type="([^"]+)"/gi;
    let itemMatch: RegExpExecArray | null;
    while ((itemMatch = itemRegex.exec(opfContent)) !== null) {
      const id = itemMatch[1];
      const href = itemMatch[2];
      const mediaType = itemMatch[3];
      const resolvedHref = opfDir ? `${opfDir}/${href}`.replace(/\/+/g, "/") : href;
      manifestMap[id] = { href: resolvedHref, mediaType };

      if (mediaType === "application/x-dtbncx+xml" || id.toLowerCase().includes("ncx") || href.endsWith(".ncx")) {
        ncxPath = resolvedHref;
      }
      if (href.toLowerCase().includes("nav.") || mediaType.includes("nav")) {
        navPath = resolvedHref;
      }
    }

    // Secondary manifest regex if attributes order is swapped
    if (Object.keys(manifestMap).length === 0) {
      const altItemRegex = /<item\s+[^>]*?href="([^"]+)"[^>]*?id="([^"]+)"[^>]*?media-type="([^"]+)"/gi;
      while ((itemMatch = altItemRegex.exec(opfContent)) !== null) {
        const href = itemMatch[1];
        const id = itemMatch[2];
        const mediaType = itemMatch[3];
        const resolvedHref = opfDir ? `${opfDir}/${href}`.replace(/\/+/g, "/") : href;
        manifestMap[id] = { href: resolvedHref, mediaType };
        if (mediaType === "application/x-dtbncx+xml" || href.endsWith(".ncx")) ncxPath = resolvedHref;
      }
    }

    // Parse Spine itemrefs
    const spineRegex = /<itemref\s+[^>]*?idref="([^"]+)"/gi;
    let spineMatch: RegExpExecArray | null;
    while ((spineMatch = spineRegex.exec(opfContent)) !== null) {
      spineIds.push(spineMatch[1]);
    }
  }

  // 3. Extract and cache all image assets as base64 data URLs
  const imageCache: Record<string, string> = {};
  for (const path of Object.keys(zip.files)) {
    const lower = path.toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      try {
        const file = zip.files[path];
        if (!file.dir) {
          const base64 = await file.async("base64");
          let mime = "image/jpeg";
          if (lower.endsWith(".png")) mime = "image/png";
          else if (lower.endsWith(".svg")) mime = "image/svg+xml";
          else if (lower.endsWith(".gif")) mime = "image/gif";
          else if (lower.endsWith(".webp")) mime = "image/webp";

          const dataUrl = `data:${mime};base64,${base64}`;
          imageCache[path] = dataUrl;
          imageCache[path.split("/").pop()!] = dataUrl;
        }
      } catch (e) {
        console.warn("Could not encode image asset:", path);
      }
    }
  }

  // 4. Extract chapters in ordered spine sequence
  const chapterFilesToLoad: { id: string; fullPath: string }[] = [];
  if (spineIds.length > 0) {
    for (const id of spineIds) {
      if (manifestMap[id]) {
        chapterFilesToLoad.push({ id, fullPath: manifestMap[id].href });
      }
    }
  }

  // Fallback: If spine was empty, grab all HTML/XHTML files in natural sort order
  if (chapterFilesToLoad.length === 0) {
    const allHtml = Object.keys(zip.files).filter(name => 
      (name.endsWith(".html") || name.endsWith(".xhtml") || name.endsWith(".htm")) &&
      !name.toLowerCase().includes("toc.") &&
      !name.toLowerCase().includes("nav.")
    );
    allHtml.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
    for (const f of allHtml) {
      chapterFilesToLoad.push({ id: f, fullPath: f });
    }
  }

  // 5. Pre-build path mapping
  const pathMap: Record<string, number> = {};
  chapterFilesToLoad.forEach((item, index) => {
    const fileName = item.fullPath.split("/").pop() || item.fullPath;
    pathMap[item.fullPath] = index;
    pathMap[fileName] = index;
    pathMap[item.id] = index;
  });

  // 6. Parse each chapter HTML file
  const chapters: ParsedChapter[] = [];

  for (let i = 0; i < chapterFilesToLoad.length; i++) {
    const { id, fullPath } = chapterFilesToLoad[i];
    const fileName = fullPath.split("/").pop() || fullPath;
    let file = zip.file(fullPath);
    if (!file) {
      const cleanName = fullPath.split("/").pop();
      const matched = Object.keys(zip.files).find(k => k.endsWith(cleanName!));
      if (matched) file = zip.file(matched);
    }

    if (file && !file.dir) {
      try {
        let rawHtml = await file.async("string");

        if (typeof document !== "undefined") {
          const parser = new DOMParser();
          const doc = parser.parseFromString(rawHtml, "text/html");

          // Remove script, external css, and style tags to ensure clean layout
          doc.querySelectorAll("script, link[rel='stylesheet'], style").forEach(el => el.remove());

          // Rewrite image src to inline base64
          doc.querySelectorAll("img, image").forEach(img => {
            const src = img.getAttribute("src") || img.getAttribute("xlink:href") || "";
            if (src && !src.startsWith("data:")) {
              const resolvedImgPath = resolveRelativePath(fullPath, src);
              const cleanImgName = src.split("/").pop() || "";
              const dataUrl = imageCache[resolvedImgPath] || imageCache[cleanImgName] || imageCache[src];
              if (dataUrl) {
                img.setAttribute("src", dataUrl);
                img.removeAttribute("xlink:href");
              }
            }
          });

          // Rewrite <a> tags to prevent browser from navigating away to 404
          doc.querySelectorAll("a").forEach(a => {
            const href = a.getAttribute("href") || "";
            if (href) {
              if (href.startsWith("http://") || href.startsWith("https://")) {
                a.setAttribute("target", "_blank");
                a.setAttribute("rel", "noopener noreferrer");
              } else {
                // Internal book link
                const parts = href.split("#");
                const targetFile = parts[0] ? parts[0].split("/").pop() : fileName;
                const anchor = parts[1] || "";
                a.setAttribute("data-chapter-target", targetFile || "");
                if (anchor) a.setAttribute("data-anchor-target", anchor);
                a.setAttribute("href", "javascript:void(0);");
                a.style.cursor = "pointer";
                a.style.color = "inherit";
                a.style.textDecoration = "underline";
              }
            }
          });

          // Detect Chapter Title
          let title = doc.querySelector("h1, h2, h3, title, .chapter-title, .title")?.textContent?.trim() || "";
          if (!title || title.length < 2 || title.toLowerCase() === "untitled") {
            title = `Section ${chapters.length + 1}`;
          }

          const bodyContent = doc.body ? doc.body.innerHTML : rawHtml;
          const textOnly = doc.body ? doc.body.textContent || "" : rawHtml;

          chapters.push({
            id: id || `chapter-${i}`,
            fullPath,
            fileName,
            title,
            html: bodyContent,
            textLength: textOnly.length
          });

          pathMap[fileName] = chapters.length - 1;
          pathMap[fullPath] = chapters.length - 1;
        } else {
          chapters.push({
            id: id || `chapter-${i}`,
            fullPath,
            fileName,
            title: `Chapter ${i + 1}`,
            html: rawHtml,
            textLength: rawHtml.length
          });
        }
      } catch (e) {
        console.warn("Chapter parse error for:", fullPath, e);
      }
    }
  }

  // 7. Parse NCX / Nav Table of Contents if available
  const parsedToc: TocItem[] = [];

  // Try parsing NCX TOC
  if (ncxPath && zip.file(ncxPath)) {
    try {
      const ncxXml = await zip.file(ncxPath)!.async("string");
      const navPointRegex = /<navPoint[^>]*>[\s\S]*?<text>([^<]+)<\/text>[\s\S]*?<content\s+src="([^"]+)"[\s\S]*?<\/navPoint>/gi;
      let navMatch: RegExpExecArray | null;
      while ((navMatch = navPointRegex.exec(ncxXml)) !== null) {
        const label = navMatch[1].trim();
        const src = navMatch[2].trim();
        const parts = src.split("#");
        const fileTarget = parts[0].split("/").pop() || parts[0];
        const anchor = parts[1] || "";
        const chapterIdx = pathMap[fileTarget] ?? pathMap[src] ?? 0;

        if (label && label.length > 1) {
          parsedToc.push({
            label,
            chapterIndex: chapterIdx,
            href: src,
            anchor
          });
        }
      }
    } catch (e) {
      console.warn("NCX TOC parse skipped:", e);
    }
  }

  // Fallback TOC from extracted chapters
  const finalToc: TocItem[] = parsedToc.length > 0 
    ? parsedToc 
    : chapters.map((ch, idx) => ({
        label: ch.title,
        chapterIndex: idx,
        href: ch.fileName
      }));

  // Cover image fallback
  let coverUrl: string | undefined;
  const coverKey = Object.keys(imageCache).find(k => k.toLowerCase().includes("cover"));
  if (coverKey) coverUrl = imageCache[coverKey];

  return {
    title: bookTitle,
    author: bookAuthor,
    coverUrl,
    chapters: chapters.length > 0 ? chapters : [{ id: "c1", fullPath: "ch1.html", fileName: "ch1.html", title: bookTitle, html: "<p>Could not extract text.</p>", textLength: 100 }],
    toc: finalToc.length > 0 ? finalToc : [{ label: "Start Reading", chapterIndex: 0 }],
    pathMap
  };
}
