export interface OfflineDefinition {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
  synonyms?: string[];
}

// Lemmatization / Stemming root mappings for irregular or inflected words
export const LEMMA_MAPPINGS: Record<string, string> = {
  // Irregular verbs & forms
  "abhorrent": "abhor",
  "predominates": "predominate",
  "predominated": "predominate",
  "eclipses": "eclipse",
  "eclipsed": "eclipse",
  "eclipsing": "eclipse",
  "intruding": "intrude",
  "intrusion": "intrude",
  "florid": "florid",
  "abruptly": "abrupt",
  "admirably": "admirable",
  "reasoning": "reason",
  "observing": "observe",
  "glittering": "glitter",
  "swollen": "swell",
  "swelling": "swell",
  "aching": "ache",
  "gathering": "gather",
  "gathered": "gather",
  "villagers": "villager",
  "annual": "annual",
  "carried": "carry",
  "carrying": "carry",
  "running": "run",
  "ran": "run",
  "written": "write",
  "wrote": "write",
  "writing": "write",
  "teeth": "tooth",
  "feet": "foot",
  "children": "child",
  "women": "woman",
  "men": "man",
  "wives": "wife",
  "lives": "life",
  "wolves": "wolf",
  "leaves": "leaf",
  "knives": "knife",
  "happily": "happy",
  "heavily": "heavy",
  "gently": "gentle",
  "quickly": "quick",
  "slowly": "slow",
  "quietly": "quiet",
  "brightly": "bright",
  "darkest": "dark",
  "brighter": "bright",
  "greater": "great",
  "greatest": "great",
  "better": "good",
  "best": "good",
  "worse": "bad",
  "worst": "bad"
};

export const COMMON_DICTIONARY: Record<string, OfflineDefinition> = {
  // Classic literature vocabulary & Sherlock Holmes vocabulary
  "abhor": {
    word: "abhor",
    phonetic: "/əbˈhɔːr/",
    partOfSpeech: "verb",
    definition: "Regard with disgust and hatred; loathe or detest utterly.",
    example: "All emotions were abhorrent to his cold, precise mind.",
    synonyms: ["detest", "hate", "loathe", "despise"]
  },
  "abrupt": {
    word: "abrupt",
    phonetic: "/əˈbrʌpt/",
    partOfSpeech: "adjective",
    definition: "Sudden and unexpected; brief to the point of rudeness.",
    example: "He pulled me abruptly into the room.",
    synonyms: ["sudden", "unexpected", "curt", "brusque"]
  },
  "admirable": {
    word: "admirable",
    phonetic: "/ˈæd.mɚ.ə.bəl/",
    partOfSpeech: "adjective",
    definition: "Arousing or deserving respect and approval.",
    example: "His admirably balanced mind approached the problem logically.",
    synonyms: ["praiseworthy", "commendable", "splendid"]
  },
  "advance": {
    word: "advance",
    phonetic: "/ədˈvæns/",
    partOfSpeech: "verb / noun",
    definition: "Move forward in a purposeful way; make progress or development.",
    example: "The scientific team made a tremendous advance in medical research.",
    synonyms: ["progress", "proceed", "develop"]
  },
  "akin": {
    word: "akin",
    phonetic: "/əˈkɪn/",
    partOfSpeech: "adjective",
    definition: "Of similar character; related by blood or closely resembling.",
    example: "It was not that he felt any emotion akin to love for Irene Adler.",
    synonyms: ["similar", "related", "comparable", "analogous"]
  },
  "apology": {
    word: "apology",
    phonetic: "/əˈpɑː.lə.dʒi/",
    partOfSpeech: "noun",
    definition: "A regretful acknowledgment of an offense, mistake, or intrusion.",
    example: "With an apology for my intrusion, I offered to withdraw.",
    synonyms: ["regret", "excuse", "amends"]
  },
  "autumn": {
    word: "autumn",
    phonetic: "/ˈɑː.t̬əm/",
    partOfSpeech: "noun",
    definition: "The season after summer and before winter, often called fall.",
    example: "I called upon my friend one day in the autumn of last year.",
    synonyms: ["fall"]
  },
  "beast": {
    word: "beast",
    phonetic: "/biːst/",
    partOfSpeech: "noun",
    definition: "An animal, especially a large or dangerous four-footed wild creature.",
    example: "The brave gladiator stood firm against the charging beast.",
    synonyms: ["animal", "creature", "monster"]
  },
  "bohemia": {
    word: "bohemia",
    phonetic: "/boʊˈhiː.mi.ə/",
    partOfSpeech: "proper noun",
    definition: "A historical region in Central Europe occupying the western two-thirds of the Czech Republic.",
    example: "A Scandal in Bohemia is the famous opening story.",
    synonyms: ["Czech lands"]
  },
  "bus": {
    word: "bus",
    phonetic: "/bʌs/",
    partOfSpeech: "noun",
    definition: "A large motor vehicle carrying passengers by road, typically along a scheduled route.",
    example: "The evening bus arrived right on schedule."
  },
  "chapter": {
    word: "chapter",
    phonetic: "/ˈtʃæp.tɚ/",
    partOfSpeech: "noun",
    definition: "A main division of a book, typically with a number or title.",
    example: "He began reading the thrilling third chapter.",
    synonyms: ["section", "division", "segment"]
  },
  "coffee": {
    word: "coffee",
    phonetic: "/ˈkɑː.fi/",
    partOfSpeech: "noun",
    definition: "A hot beverage brewed from roasted, ground coffee beans.",
    example: "He poured a fresh cup of dark coffee while reading."
  },
  "curb": {
    word: "curb",
    phonetic: "/kɝːb/",
    partOfSpeech: "noun / verb",
    definition: "A stone or concrete edging along a sidewalk; or to restrain/check something.",
    example: "The taxi stopped beside the curb.",
    synonyms: ["edge", "verge", "restraint"]
  },
  "drugstore": {
    word: "drugstore",
    phonetic: "/ˈdrʌɡ.stɔːr/",
    partOfSpeech: "noun",
    definition: "A pharmacy store that also sells cosmetics, toiletries, and light meals.",
    example: "She picked up a magazine at the corner drugstore."
  },
  "eclipse": {
    word: "eclipse",
    phonetic: "/ɪˈklɪps/",
    partOfSpeech: "verb / noun",
    definition: "To obscure the light from one celestial body; or to surpass and overshadow in importance.",
    example: "In his eyes she eclipses and predominates the whole of her sex.",
    synonyms: ["overshadow", "outshine", "surpass", "obscure"]
  },
  "emotion": {
    word: "emotion",
    phonetic: "/ɪˈmoʊ.ʃən/",
    partOfSpeech: "noun",
    definition: "A natural instinctive state of mind deriving from one's circumstances, mood, or relationships.",
    example: "All emotions were foreign to his analytical deductions.",
    synonyms: ["feeling", "sentiment", "passion"]
  },
  "florid": {
    word: "florid",
    phonetic: "/ˈflɔːr.ɪd/",
    partOfSpeech: "adjective",
    definition: "Having a red or flushed complexion; or elaborately intricate in style.",
    example: "A stout, florid-faced gentleman sat beside the desk.",
    synonyms: ["ruddy", "flushed", "ornate"]
  },
  "future": {
    word: "future",
    phonetic: "/ˈfjuː.tʃɚ/",
    partOfSpeech: "noun / adjective",
    definition: "The time or period of events still to come.",
    example: "They discussed their hopes for the future.",
    synonyms: ["tomorrow", "destiny", "forthcoming"]
  },
  "garden": {
    word: "garden",
    phonetic: "/ˈɡɑːr.dən/",
    partOfSpeech: "noun",
    definition: "A piece of ground used for growing flowers, trees, or vegetables.",
    example: "The fragrance of roses filled the quiet garden."
  },
  "gladiator": {
    word: "gladiator",
    phonetic: "/ˈɡlæd.i.eɪ.t̬ɚ/",
    partOfSpeech: "noun",
    definition: "In ancient Rome, a trained warrior who fought in public arenas.",
    example: "The gladiator held his shield against the attack.",
    synonyms: ["warrior", "fighter", "swordsman"]
  },
  "glitter": {
    word: "glitter",
    phonetic: "/ˈɡlɪt.ɚ/",
    partOfSpeech: "verb / noun",
    definition: "Shine with a shimmering or sparkling reflected light.",
    example: "The glittering moonlight illuminated the lake.",
    synonyms: ["sparkle", "shimmer", "glisten", "twinkle"]
  },
  "handkerchief": {
    word: "handkerchief",
    phonetic: "/ˈhæŋ.kɚ.tʃiːf/",
    partOfSpeech: "noun",
    definition: "A square piece of cloth or paper for wiping the face, eyes, or hands.",
    example: "He dabbed his forehead with a silk handkerchief."
  },
  "homework": {
    word: "homework",
    phonetic: "/ˈhoʊm.wɝːk/",
    partOfSpeech: "noun",
    definition: "Assignments given to students to be completed outside of class.",
    example: "She finished her evening homework before reading."
  },
  "husband": {
    word: "husband",
    phonetic: "/ˈhʌz.bənd/",
    partOfSpeech: "noun",
    definition: "A married man in relation to his spouse.",
    example: "She introduced her husband to the dinner guests."
  },
  "intrusion": {
    word: "intrusion",
    phonetic: "/ɪnˈtruː.ʒən/",
    partOfSpeech: "noun",
    definition: "The act of putting oneself into a place or situation where one is uninvited.",
    example: "Please excuse my sudden intrusion into your private study.",
    synonyms: ["interruption", "encroachment", "trespass"]
  },
  "jaw": {
    word: "jaw",
    phonetic: "/dʒɑː/",
    partOfSpeech: "noun",
    definition: "Each of the upper and lower bony structures forming the mouth and holding teeth.",
    example: "He clenched his jaw with deep determination."
  },
  "lottery": {
    word: "lottery",
    phonetic: "/ˈlɑː.t̬ɚ.i/",
    partOfSpeech: "noun",
    definition: "A process whose outcome is determined by chance; or a gambling game of numbered tickets.",
    example: "The villagers gathered in the town square for the annual lottery.",
    synonyms: ["draw", "raffle", "sweepstakes"]
  },
  "madman": {
    word: "madman",
    phonetic: "/ˈmæd.mæn/",
    partOfSpeech: "noun",
    definition: "A person who is mentally disordered or acts in a wild, reckless manner.",
    example: "He rode through the storm like a madman.",
    synonyms: ["lunatic", "maniac"]
  },
  "midnight": {
    word: "midnight",
    phonetic: "/ˈmɪd.naɪt/",
    partOfSpeech: "noun",
    definition: "Twelve o'clock at night; the middle of the night.",
    example: "The clock struck twelve at midnight."
  },
  "moonlight": {
    word: "moonlight",
    phonetic: "/ˈmuːn.laɪt/",
    partOfSpeech: "noun",
    definition: "The gentle light that shines from the moon at night.",
    example: "They walked across the terrace under the silver moonlight."
  },
  "open": {
    word: "open",
    phonetic: "/ˈoʊ.pən/",
    partOfSpeech: "adjective / verb",
    definition: "Allowing access, passage, or view; not closed or obstructed.",
    example: "She held the open book in her hands.",
    synonyms: ["unclosed", "unlocked", "accessible"]
  },
  "party": {
    word: "party",
    phonetic: "/ˈpɑːr.t̬i/",
    partOfSpeech: "noun",
    definition: "A social gathering of invited guests for celebration or conversation.",
    example: "They celebrated his birthday with a joyful party."
  },
  "patron": {
    word: "patron",
    phonetic: "/ˈpeɪ.trən/",
    partOfSpeech: "noun",
    definition: "A customer of a business; or a person who gives financial support to arts or causes.",
    example: "He was a generous patron of the local library.",
    synonyms: ["customer", "client", "benefactor", "sponsor"]
  },
  "penmanship": {
    word: "penmanship",
    phonetic: "/ˈpen.mən.ʃɪp/",
    partOfSpeech: "noun",
    definition: "The art, skill, or style of handwriting.",
    example: "His elegant penmanship made the old letters a pleasure to read.",
    synonyms: ["handwriting", "calligraphy"]
  },
  "pneumonia": {
    word: "pneumonia",
    phonetic: "/nuːˈmoʊ.njə/",
    partOfSpeech: "noun",
    definition: "Lung inflammation caused by bacterial or viral infection, making breathing painful.",
    example: "The doctor prescribed rest to help him recover from pneumonia."
  },
  "precise": {
    word: "precise",
    phonetic: "/prəˈsaɪs/",
    partOfSpeech: "adjective",
    definition: "Marked by exactness and accuracy of expression or detail.",
    example: "His precise mathematical reasoning solved the mystery.",
    synonyms: ["exact", "accurate", "meticulous", "definite"]
  },
  "predominate": {
    word: "predominate",
    phonetic: "/prɪˈdɑː.mə.neɪt/",
    partOfSpeech: "verb",
    definition: "Be the strongest or main element; have controlling power or influence.",
    example: "In his eyes she eclipses and predominates all others.",
    synonyms: ["dominate", "prevail", "command"]
  },
  "reason": {
    word: "reason",
    phonetic: "/ˈriː.zən/",
    partOfSpeech: "noun / verb",
    definition: "The power of the mind to think, understand, and form judgments logically.",
    example: "He was the most perfect reasoning and observing machine the world has seen.",
    synonyms: ["logic", "intellect", "rationality"]
  },
  "scandal": {
    word: "scandal",
    phonetic: "/ˈskæn.dəl/",
    partOfSpeech: "noun",
    definition: "An action or event regarded as morally or legally wrong and causing public outrage.",
    example: "The royal house feared a devastating public scandal.",
    synonyms: ["outrage", "disgrace", "shame"]
  },
  "school": {
    word: "school",
    phonetic: "/skuːl/",
    partOfSpeech: "noun",
    definition: "An institution for educating students.",
    example: "The bell rang throughout the school."
  },
  "senior": {
    word: "senior",
    phonetic: "/ˈsiː.njɚ/",
    partOfSpeech: "noun / adjective",
    definition: "A student in the final year of high school or college; or an older, experienced person.",
    example: "He graduated as a senior with highest honors."
  },
  "sherlock": {
    word: "sherlock",
    phonetic: "/ˈʃɝː.lɑːk/",
    partOfSpeech: "proper noun",
    definition: "Sherlock Holmes, the legendary fictional consulting detective created by Sir Arthur Conan Doyle.",
    example: "Sherlock Holmes examined the footprints with a magnifying glass."
  },
  "sidewalk": {
    word: "sidewalk",
    phonetic: "/ˈsaɪd.wɑːk/",
    partOfSpeech: "noun",
    definition: "A paved walkway along the side of a street for pedestrians.",
    example: "Children rode their bicycles along the sidewalk."
  },
  "station": {
    word: "station",
    phonetic: "/ˈsteɪ.ʃən/",
    partOfSpeech: "noun",
    definition: "A regular stopping place along a transportation route, such as a train or bus depot.",
    example: "The train pulled into the central station."
  },
  "stout": {
    word: "stout",
    phonetic: "/staʊt/",
    partOfSpeech: "adjective",
    definition: "Somewhat heavy or solidly built; brave and resolute.",
    example: "A stout, well-dressed gentleman stepped into the hall.",
    synonyms: ["plump", "heavyset", "sturdy", "brave"]
  },
  "swell": {
    word: "swell",
    phonetic: "/swel/",
    partOfSpeech: "verb / noun",
    definition: "Become larger or rounded in size, often due to internal fluid or inflammation.",
    example: "His jaw was swollen from the cold night air.",
    synonyms: ["expand", "inflate", "distend"]
  },
  "the": {
    word: "the",
    phonetic: "/ðə/",
    partOfSpeech: "definite article",
    definition: "Denoting one or more people or things already mentioned or assumed to be common knowledge.",
    example: "To Sherlock Holmes she is always THE woman."
  },
  "theatre": {
    word: "theatre",
    phonetic: "/ˈθiː.ə.t̬ɚ/",
    partOfSpeech: "noun",
    definition: "A building or outdoor space where dramatic plays, movies, or concerts are performed.",
    example: "The evening crowd gathered outside the theatre doors.",
    synonyms: ["playhouse", "auditorium"]
  },
  "tooth": {
    word: "tooth",
    phonetic: "/tuːθ/",
    partOfSpeech: "noun",
    definition: "Each of the hard, bony structures in the mouth used for biting and chewing food.",
    example: "He held a cloth against his aching tooth.",
    synonyms: ["fang", "tusk", "molar"]
  },
  "wife": {
    word: "wife",
    phonetic: "/waɪf/",
    partOfSpeech: "noun",
    definition: "A married woman in relation to her spouse.",
    example: "He returned home to his wife and family."
  },
  "withdraw": {
    word: "withdraw",
    phonetic: "/wɪðˈdrɑː/",
    partOfSpeech: "verb",
    definition: "Remove oneself from a room or situation; pull back or retreat.",
    example: "I was about to withdraw when Holmes pulled me into the room.",
    synonyms: ["depart", "leave", "retreat", "retire"]
  },
  "world": {
    word: "world",
    phonetic: "/wɝːld/",
    partOfSpeech: "noun",
    definition: "The earth, together with all of its people, places, civilizations, and nature.",
    example: "He had traveled across the entire world.",
    synonyms: ["earth", "globe", "planet", "universe"]
  }
};
