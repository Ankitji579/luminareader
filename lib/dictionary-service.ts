import { COMMON_DICTIONARY, LEMMA_MAPPINGS } from "./dictionary-data";

export interface MeaningItem {
  partOfSpeech: string;
  definition: string;
  example?: string;
  synonyms?: string[];
}

export interface DictionaryResult {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meanings: MeaningItem[];
  audioUrl?: string;
  source: string;
  hindiTranslation?: string;
}

// Fetch helper with timeout to avoid hanging
async function fetchWithTimeout(url: string, timeoutMs = 4000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Strip HTML tags from Wiktionary/Wikipedia response
function stripHtml(html: string): string {
  if (typeof document !== "undefined") {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  return html.replace(/<[^>]*>?/gm, "");
}

// Fetch Hindi translation using Google Translate API (fast, free tier endpoint)
export async function fetchHindiTranslation(text: string): Promise<string | undefined> {
  // Check cache first
  const cacheKey = `lumina_tr_${text.toLowerCase()}`;
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetchWithTimeout(url, 4000);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        // Concatenate all translation segments
        const translated = data[0].map((item: any) => item[0]).join('');
        if (translated && translated.trim()) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(cacheKey, translated);
          }
          return translated;
        }
      }
    }
  } catch {
    // Fail silently
  }
  return undefined;
}

export async function lookupWordComprehensive(rawWord: string): Promise<DictionaryResult> {
  const cleanWord = rawWord.toLowerCase().replace(/[^a-z]/g, "").trim();
  if (!cleanWord) {
    return {
      word: rawWord,
      phonetic: "",
      partOfSpeech: "term",
      meanings: [{ partOfSpeech: "definition", definition: "Please select or enter a valid word." }],
      source: "local",
    };
  }

  // Check LocalStorage cache first for instant lookup
  const cacheKey = `lumina_dict_${cleanWord}`;
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as DictionaryResult;
      } catch (e) {}
    }
  }

  let result: DictionaryResult | null = null;

  // 1. Check direct Local Offline Database
  if (COMMON_DICTIONARY[cleanWord]) {
    const item = COMMON_DICTIONARY[cleanWord];
    result = {
      word: item.word,
      phonetic: item.phonetic || `/${item.word}/`,
      partOfSpeech: item.partOfSpeech,
      meanings: [
        {
          partOfSpeech: item.partOfSpeech,
          definition: item.definition,
          example: item.example,
          synonyms: item.synonyms,
        },
      ],
      source: "Built-in Lexicon",
    };
  }

  // 2. Check Lemma / Root Form in Local Database
  if (!result) {
    const lemma = LEMMA_MAPPINGS[cleanWord];
    if (lemma && COMMON_DICTIONARY[lemma]) {
      const item = COMMON_DICTIONARY[lemma];
      result = {
        word: cleanWord,
        phonetic: item.phonetic || `/${cleanWord}/`,
        partOfSpeech: item.partOfSpeech,
        meanings: [
          {
            partOfSpeech: item.partOfSpeech,
            definition: `Form of "${lemma}": ${item.definition}`,
            example: item.example,
            synonyms: item.synonyms,
          },
        ],
        source: "Built-in Lexicon",
      };
    }
  }

  // 3. Try Free Dictionary API (Rich definitions + audio)
  if (!result) {
    try {
      const res = await fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          const phonetic =
            entry.phonetic ||
            entry.phonetics?.find((p: any) => p.text)?.text ||
            `/${cleanWord}/`;
          const audioUrl = entry.phonetics?.find(
            (p: any) => p.audio && p.audio.length > 0
          )?.audio;

          const meanings: MeaningItem[] = [];
          entry.meanings?.forEach((m: any) => {
            m.definitions?.slice(0, 3).forEach((d: any) => {
              if (d.definition) {
                meanings.push({
                  partOfSpeech: m.partOfSpeech || "definition",
                  definition: d.definition,
                  example: d.example,
                  synonyms: d.synonyms?.slice(0, 4) || m.synonyms?.slice(0, 4),
                });
              }
            });
          });

          if (meanings.length > 0) {
            result = {
              word: cleanWord,
              phonetic,
              partOfSpeech: meanings[0].partOfSpeech,
              meanings,
              audioUrl,
              source: "Free Dictionary API",
            };
          }
        }
      }
    } catch {
      // Continue to next provider
    }
  }

  // 4. Try Wiktionary REST API
  if (!result) {
    try {
      const res = await fetchWithTimeout(
        `https://en.wiktionary.org/api/rest_v1/page/definition/${cleanWord}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.en && Array.isArray(data.en)) {
          const meanings: MeaningItem[] = [];
          data.en.forEach((section: any) => {
            const pos = section.partOfSpeech || "definition";
            section.definitions?.slice(0, 3).forEach((d: any) => {
              const rawDef = typeof d === "string" ? d : d.definition;
              if (rawDef) {
                const cleanDef = stripHtml(rawDef).trim();
                if (cleanDef) {
                  meanings.push({
                    partOfSpeech: pos,
                    definition: cleanDef,
                    example: d.examples?.[0] ? stripHtml(d.examples[0]) : undefined,
                  });
                }
              }
            });
          });

          if (meanings.length > 0) {
            result = {
              word: cleanWord,
              phonetic: `/${cleanWord}/`,
              partOfSpeech: meanings[0].partOfSpeech,
              meanings,
              source: "Wiktionary",
            };
          }
        }
      }
    } catch {
      // Continue to next provider
    }
  }

  // 5. Try Datamuse Definitions API
  if (!result) {
    try {
      const res = await fetchWithTimeout(
        `https://api.datamuse.com/words?sp=${cleanWord}&md=d&max=3`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].defs) {
          const meanings: MeaningItem[] = data[0].defs.map((defStr: string) => {
            const [tag, ...rest] = defStr.split("\t");
            const defText = rest.join(" ");
            const posMap: Record<string, string> = {
              n: "noun",
              v: "verb",
              adj: "adjective",
              adv: "adverb",
              u: "definition",
            };
            return {
              partOfSpeech: posMap[tag] || tag || "definition",
              definition: defText || defStr,
            };
          });

          if (meanings.length > 0) {
            result = {
              word: cleanWord,
              phonetic: `/${cleanWord}/`,
              partOfSpeech: meanings[0].partOfSpeech,
              meanings,
              source: "Datamuse Lexicon",
            };
          }
        }
      }
    } catch {
      // Continue to next provider
    }
  }

  // 6. Try Wikipedia Summary API
  if (!result) {
    try {
      const res = await fetchWithTimeout(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${cleanWord}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.extract && !data.title?.includes("Not found")) {
          result = {
            word: data.title || cleanWord,
            phonetic: `/${cleanWord}/`,
            partOfSpeech: data.description || "Encyclopedia Entry",
            meanings: [
              {
                partOfSpeech: data.description || "Encyclopedia Entry",
                definition: data.extract,
              },
            ],
            source: "Wikipedia Encyclopedia",
          };
        }
      }
    } catch {
      // Continue to fallback
    }
  }

  // 7. Morphological Fallback
  if (!result) {
    if (cleanWord.endsWith("ing")) {
      const base = cleanWord.slice(0, -3);
      result = {
        word: cleanWord,
        phonetic: `/${cleanWord}/`,
        partOfSpeech: "verb / participle",
        meanings: [
          {
            partOfSpeech: "present participle / gerund",
            definition: `Active or continuous action related to "${base}". Expresses ongoing occurrence or state.`,
          },
        ],
        source: "Lumina Linguistic Engine",
      };
    } else if (cleanWord.endsWith("ed")) {
      const base = cleanWord.slice(0, -2);
      result = {
        word: cleanWord,
        phonetic: `/${cleanWord}/`,
        partOfSpeech: "verb / adjective",
        meanings: [
          {
            partOfSpeech: "past tense / participle",
            definition: `Completed past action or state resulting from "${base}".`,
          },
        ],
        source: "Lumina Linguistic Engine",
      };
    } else if (cleanWord.endsWith("ly")) {
      const base = cleanWord.slice(0, -2);
      result = {
        word: cleanWord,
        phonetic: `/${cleanWord}/`,
        partOfSpeech: "adverb",
        meanings: [
          {
            partOfSpeech: "adverb",
            definition: `In a manner characterized by or resembling being ${base}.`,
          },
        ],
        source: "Lumina Linguistic Engine",
      };
    }
  }

  // 8. Ultimate Fallback
  if (!result) {
    result = {
      word: cleanWord,
      phonetic: `/${cleanWord}/`,
      partOfSpeech: "word",
      meanings: [
        {
          partOfSpeech: "lexicon entry",
          definition: `English vocabulary term "${cleanWord}". Use speech pronunciation or check exact literary context in the text.`,
        },
      ],
      source: "Lumina Lexicon",
    };
  }

  // Cache the result for instant future lookups
  if (typeof window !== 'undefined' && result) {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  }

  // Hindi translation is now fetched on-demand (user button click), not here
  return result;
}
