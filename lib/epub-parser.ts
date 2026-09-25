import JSZip from "jszip";

export interface ParsedChapter {
  id: string;
  title: string;
  html: string;
  textLength: number;
}

export interface TocItem {
  label: string;
  chapterIndex: number;
  href?: string;
}

export interface ParsedBook {
  title: string;
  author: string;
  coverUrl?: string;
  chapters: ParsedChapter[];
  toc: TocItem[];
}

// Clean relative path helper
function resolveRelativePath(basePath: string, relativePath: string): string {
  const stack = basePath.split("/");
  stack.pop(); // Remove current filename

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

export async function parseEpubArchive(buffer: ArrayBuffer, fileName = "E-Book"): Promise<ParsedBook> {
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

  // Fallback: search for any .opf file in the zip
  if (!opfPath) {
    const opfEntries = Object.keys(zip.files).filter(name => name.endsWith(".opf"));
    if (opfEntries.length > 0) {
      opfPath = opfEntries[0];
    }
  }

  // 2. Parse OPF metadata, manifest, and spine
  const manifestMap: Record<string, { href: string; mediaType: string }> = {};
  const spineIds: string[] = [];
  let bookTitle = fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
  let bookAuthor = "Classic Author";
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
    }

    // Secondary manifest regex if attributes are in different order
    if (Object.keys(manifestMap).length === 0) {
      const altItemRegex = /<item\s+[^>]*?href="([^"]+)"[^>]*?id="([^"]+)"[^>]*?media-type="([^"]+)"/gi;
      while ((itemMatch = altItemRegex.exec(opfContent)) !== null) {
        const href = itemMatch[1];
        const id = itemMatch[2];
        const mediaType = itemMatch[3];
        const resolvedHref = opfDir ? `${opfDir}/${href}`.replace(/\/+/g, "/") : href;
        manifestMap[id] = { href: resolvedHref, mediaType };
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
  const chapters: ParsedChapter[] = [];
  const toc: TocItem[] = [];

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

  // 5. Parse each chapter HTML file
  for (let i = 0; i < chapterFilesToLoad.length; i++) {
    const { id, fullPath } = chapterFilesToLoad[i];
    let file = zip.file(fullPath);
    if (!file) {
      // Try resolving relative variations
      const cleanName = fullPath.split("/").pop();
      const matched = Object.keys(zip.files).find(k => k.endsWith(cleanName!));
      if (matched) file = zip.file(matched);
    }

    if (file && !file.dir) {
      try {
        let rawHtml = await file.async("string");

        // Parse DOM to clean & format
        if (typeof document !== "undefined") {
          const parser = new DOMParser();
          const doc = parser.parseFromString(rawHtml, "text/html");

          // Remove harmful or redundant script/style tags
          doc.querySelectorAll("script, link[rel='stylesheet'], style").forEach(el => el.remove());

          // Replace image src with base64 data URLs
          doc.querySelectorAll("img, image").forEach(img => {
            const src = img.getAttribute("src") || img.getAttribute("xlink:href") || "";
            if (src && !src.startsWith("data:")) {
              const resolvedImgPath = resolveRelativePath(fullPath, src);
              const cleanFileName = src.split("/").pop() || "";
              const dataUrl = imageCache[resolvedImgPath] || imageCache[cleanFileName] || imageCache[src];
              if (dataUrl) {
                img.setAttribute("src", dataUrl);
                img.removeAttribute("xlink:href");
              }
            }
          });

          // Detect Title
          let title = doc.querySelector("h1, h2, h3, title, .chapter-title, .title")?.textContent?.trim() || "";
          if (!title || title.length < 2) {
            title = `Chapter ${chapters.length + 1}`;
          }

          const bodyContent = doc.body ? doc.body.innerHTML : rawHtml;
          const textOnly = doc.body ? doc.body.textContent || "" : rawHtml;

          if (textOnly.trim().length > 10 || bodyContent.includes("<img")) {
            chapters.push({
              id: id || `chapter-${i}`,
              title,
              html: bodyContent,
              textLength: textOnly.length
            });

            toc.push({
              label: title,
              chapterIndex: chapters.length - 1,
              href: fullPath
            });
          }
        } else {
          // Node fallback
          chapters.push({
            id: id || `chapter-${i}`,
            title: `Chapter ${i + 1}`,
            html: rawHtml,
            textLength: rawHtml.length
          });
          toc.push({
            label: `Chapter ${i + 1}`,
            chapterIndex: i
          });
        }
      } catch (e) {
        console.warn("Chapter parsing skipped for:", fullPath, e);
      }
    }
  }

  // Cover image fallback
  let coverUrl: string | undefined;
  const coverKey = Object.keys(imageCache).find(k => k.toLowerCase().includes("cover"));
  if (coverKey) coverUrl = imageCache[coverKey];

  return {
    title: bookTitle,
    author: bookAuthor,
    coverUrl,
    chapters: chapters.length > 0 ? chapters : [{ id: "c1", title: bookTitle, html: "<p>Could not extract text.</p>", textLength: 100 }],
    toc: toc.length > 0 ? toc : [{ label: "Start Reading", chapterIndex: 0 }]
  };
}
