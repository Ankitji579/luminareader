import { COMMON_DICTIONARY, LEMMA_MAPPINGS, OfflineDefinition } from "./dictionary-data";

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
}

// Fetch helper with timeout to avoid hanging
async function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<Response> {
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
  if (typeof document !== 'undefined') {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  return html.replace(/<[^>]*>?/gm, '');
}

export async function lookupWordComprehensive(rawWord: string): Promise<DictionaryResult> {
  const cleanWord = rawWord.toLowerCase().replace(/[^a-z]/g, '').trim();
  if (!cleanWord) {
    return {
      word: rawWord,
      phonetic: "",
      partOfSpeech: "term",
      meanings: [{ partOfSpeech: "definition", definition: "Please select or enter a valid word." }],
      source: "local"
    };
  }

  // 1. Check direct Local Offline Database
  if (COMMON_DICTIONARY[cleanWord]) {
    const item = COMMON_DICTIONARY[cleanWord];
    return {
      word: item.word,
      phonetic: item.phonetic || `/${item.word}/`,
      partOfSpeech: item.partOfSpeech,
      meanings: [{
        partOfSpeech: item.partOfSpeech,
        definition: item.definition,
        example: item.example,
        synonyms: item.synonyms
      }],
      source: "Built-in Lexicon"
    };
  }

  // 2. Check Lemma / Root Form in Local Database
  const lemma = LEMMA_MAPPINGS[cleanWord];
  if (lemma && COMMON_DICTIONARY[lemma]) {
    const item = COMMON_DICTIONARY[lemma];
    return {
      word: cleanWord,
      phonetic: item.phonetic || `/${cleanWord}/`,
      partOfSpeech: item.partOfSpeech,
      meanings: [
        {
          partOfSpeech: item.partOfSpeech,
          definition: `Form of "${lemma}": ${item.definition}`,
          example: item.example,
          synonyms: item.synonyms
        }
      ],
      source: "Built-in Lexicon"
    };
  }

  // 3. Try Free Dictionary API (Rich definitions + audio)
  try {
    const res = await fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || `/${cleanWord}/`;
        const audioUrl = entry.phonetics?.find((p: any) => p.audio && p.audio.length > 0)?.audio;
        
        const meanings: MeaningItem[] = [];
        entry.meanings?.forEach((m: any) => {
          m.definitions?.slice(0, 3).forEach((d: any) => {
            if (d.definition) {
              meanings.push({
                partOfSpeech: m.partOfSpeech || 'definition',
                definition: d.definition,
                example: d.example,
                synonyms: d.synonyms?.slice(0, 4) || m.synonyms?.slice(0, 4)
              });
            }
          });
        });

        if (meanings.length > 0) {
          return {
            word: cleanWord,
            phonetic,
            partOfSpeech: meanings[0].partOfSpeech,
            meanings,
            audioUrl,
            source: "Free Dictionary API"
          };
        }
      }
    }
  } catch {
    // Continue to next provider
  }

  // 4. Try Wiktionary REST API (Comprehensive world vocabulary)
  try {
    const res = await fetchWithTimeout(`https://en.wiktionary.org/api/rest_v1/page/definition/${cleanWord}`);
    if (res.ok) {
      const data = await res.json();
      if (data.en && Array.isArray(data.en)) {
        const meanings: MeaningItem[] = [];
        data.en.forEach((section: any) => {
          const pos = section.partOfSpeech || "definition";
          section.definitions?.slice(0, 3).forEach((d: any) => {
            const rawDef = typeof d === 'string' ? d : d.definition;
            if (rawDef) {
              const cleanDef = stripHtml(rawDef).trim();
              if (cleanDef) {
                meanings.push({
                  partOfSpeech: pos,
                  definition: cleanDef,
                  example: d.examples?.[0] ? stripHtml(d.examples[0]) : undefined
                });
              }
            }
          });
        });

        if (meanings.length > 0) {
          return {
            word: cleanWord,
            phonetic: `/${cleanWord}/`,
            partOfSpeech: meanings[0].partOfSpeech,
            meanings,
            source: "Wiktionary"
          };
        }
      }
    }
  } catch {
    // Continue to next provider
  }

  // 5. Try Datamuse Definitions API
  try {
    const res = await fetchWithTimeout(`https://api.datamuse.com/words?sp=${cleanWord}&md=d&max=3`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].defs) {
        const meanings: MeaningItem[] = data[0].defs.map((defStr: string) => {
          const [tag, ...rest] = defStr.split('\t');
          const defText = rest.join(' ');
          const posMap: Record<string, string> = {
            n: "noun",
            v: "verb",
            adj: "adjective",
            adv: "adverb",
            u: "definition"
          };
          return {
            partOfSpeech: posMap[tag] || tag || "definition",
            definition: defText || defStr
          };
        });

        if (meanings.length > 0) {
          return {
            word: cleanWord,
            phonetic: `/${cleanWord}/`,
            partOfSpeech: meanings[0].partOfSpeech,
            meanings,
            source: "Datamuse Lexicon"
          };
        }
      }
    }
  } catch {
    // Continue to next provider
  }

  // 6. Try Wikipedia Summary API (For historical figures, geographical places, scientific terms)
  try {
    const res = await fetchWithTimeout(`https://en.wikipedia.org/api/rest_v1/page/summary/${cleanWord}`);
    if (res.ok) {
      const data = await res.json();
      if (data.extract && !data.title?.includes("Not found")) {
        return {
          word: data.title || cleanWord,
          phonetic: `/${cleanWord}/`,
          partOfSpeech: data.description || "Encyclopedia Entry",
          meanings: [{
            partOfSpeech: data.description || "Encyclopedia Entry",
            definition: data.extract
          }],
          source: "Wikipedia Encyclopedia"
        };
      }
    }
  } catch {
    // Continue to fallback
  }

  // 7. Morphological & Etymological Fallback Generator
  // If word has common suffixes/prefixes, provide structured explanation
  if (cleanWord.endsWith("ing")) {
    const base = cleanWord.slice(0, -3);
    return {
      word: cleanWord,
      phonetic: `/${cleanWord}/`,
      partOfSpeech: "verb / participle",
      meanings: [{
        partOfSpeech: "present participle / gerund",
        definition: `Active or continuous action related to "${base}". Expresses ongoing occurrence or state.`
      }],
      source: "Lumina Linguistic Engine"
    };
  }

  if (cleanWord.endsWith("ed")) {
    const base = cleanWord.slice(0, -2);
    return {
      word: cleanWord,
      phonetic: `/${cleanWord}/`,
      partOfSpeech: "verb / adjective",
      meanings: [{
        partOfSpeech: "past tense / participle",
        definition: `Completed past action or state resulting from "${base}".`
      }],
      source: "Lumina Linguistic Engine"
    };
  }

  if (cleanWord.endsWith("ly")) {
    const base = cleanWord.slice(0, -2);
    return {
      word: cleanWord,
      phonetic: `/${cleanWord}/`,
      partOfSpeech: "adverb",
      meanings: [{
        partOfSpeech: "adverb",
        definition: `In a manner characterized by or resembling being ${base}.`
      }],
      source: "Lumina Linguistic Engine"
    };
  }

  // 8. General High-Legibility Fallback
  return {
    word: cleanWord,
    phonetic: `/${cleanWord}/`,
    partOfSpeech: "word",
    meanings: [{
      partOfSpeech: "lexicon entry",
      definition: `English vocabulary term "${cleanWord}". Use speech pronunciation or check exact literary context in the text.`
    }],
    source: "Lumina Lexicon"
  };
}
