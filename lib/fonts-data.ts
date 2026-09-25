export interface FontOption {
  name: string;
  family: string;
  category: "serif" | "sans-serif" | "monospace" | "dyslexic";
}

export const DATABASE_NAME = "100+ Google Fonts Database for LuminaReader";

export const GOOGLE_FONTS: FontOption[] = [
  // --- SERIF (Book Classics) ---
  { name: "Merriweather", family: "'Merriweather', serif", category: "serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif", category: "serif" },
  { name: "Lora", family: "'Lora', serif", category: "serif" },
  { name: "EB Garamond", family: "'EB Garamond', serif", category: "serif" },
  { name: "Cormorant Garamond", family: "'Cormorant Garamond', serif", category: "serif" },
  { name: "Libre Baskerville", family: "'Libre Baskerville', serif", category: "serif" },
  { name: "PT Serif", family: "'PT Serif', serif", category: "serif" },
  { name: "Crimson Text", family: "'Crimson Text', serif", category: "serif" },
  { name: "Crimson Pro", family: "'Crimson Pro', serif", category: "serif" },
  { name: "Bitter", family: "'Bitter', serif", category: "serif" },
  { name: "Spectral", family: "'Spectral', serif", category: "serif" },
  { name: "Noto Serif", family: "'Noto Serif', serif", category: "serif" },
  { name: "Cardo", family: "'Cardo', serif", category: "serif" },
  { name: "Alegreya", family: "'Alegreya', serif", category: "serif" },
  { name: "Domine", family: "'Domine', serif", category: "serif" },
  { name: "Arvo", family: "'Arvo', serif", category: "serif" },
  { name: "Baskervville", family: "'Baskervville', serif", category: "serif" },
  { name: "Cinzel", family: "'Cinzel', serif", category: "serif" },
  { name: "Frank Ruhl Libre", family: "'Frank Ruhl Libre', serif", category: "serif" },
  { name: "Newsreader", family: "'Newsreader', serif", category: "serif" },
  { name: "Bodoni Moda", family: "'Bodoni Moda', serif", category: "serif" },
  { name: "Faustina", family: "'Faustina', serif", category: "serif" },
  { name: "Vollkorn", family: "'Vollkorn', serif", category: "serif" },
  { name: "Zilla Slab", family: "'Zilla Slab', serif", category: "serif" },
  { name: "Philosopher", family: "'Philosopher', serif", category: "serif" },
  { name: "Gupter", family: "'Gupter', serif", category: "serif" },
  { name: "Prata", family: "'Prata', serif", category: "serif" },
  { name: "Literata", family: "'Literata', serif", category: "serif" },
  { name: "Sorts Mill Goudy", family: "'Sorts Mill Goudy', serif", category: "serif" },

  // --- SANS-SERIF (Modern Clean) ---
  { name: "Inter", family: "'Inter', sans-serif", category: "sans-serif" },
  { name: "Roboto", family: "'Roboto', sans-serif", category: "sans-serif" },
  { name: "Open Sans", family: "'Open Sans', sans-serif", category: "sans-serif" },
  { name: "Lato", family: "'Lato', sans-serif", category: "sans-serif" },
  { name: "Montserrat", family: "'Montserrat', sans-serif", category: "sans-serif" },
  { name: "Poppins", family: "'Poppins', sans-serif", category: "sans-serif" },
  { name: "Nunito", family: "'Nunito', sans-serif", category: "sans-serif" },
  { name: "Raleway", family: "'Raleway', sans-serif", category: "sans-serif" },
  { name: "Work Sans", family: "'Work Sans', sans-serif", category: "sans-serif" },
  { name: "DM Sans", family: "'DM Sans', sans-serif", category: "sans-serif" },
  { name: "Plus Jakarta Sans", family: "'Plus Jakarta Sans', sans-serif", category: "sans-serif" },
  { name: "Outfit", family: "'Outfit', sans-serif", category: "sans-serif" },
  { name: "Quicksand", family: "'Quicksand', sans-serif", category: "sans-serif" },
  { name: "Rubik", family: "'Rubik', sans-serif", category: "sans-serif" },
  { name: "Fira Sans", family: "'Fira Sans', sans-serif", category: "sans-serif" },
  { name: "Jost", family: "'Jost', sans-serif", category: "sans-serif" },
  { name: "Cabin", family: "'Cabin', sans-serif", category: "sans-serif" },
  { name: "PT Sans", family: "'PT Sans', sans-serif", category: "sans-serif" },
  { name: "Karla", family: "'Karla', sans-serif", category: "sans-serif" },
  { name: "Mulish", family: "'Mulish', sans-serif", category: "sans-serif" },
  { name: "Barlow", family: "'Barlow', sans-serif", category: "sans-serif" },
  { name: "Kanit", family: "'Kanit', sans-serif", category: "sans-serif" },
  { name: "Ubuntu", family: "'Ubuntu', sans-serif", category: "sans-serif" },
  { name: "Josefin Sans", family: "'Josefin Sans', sans-serif", category: "sans-serif" },
  { name: "Assistant", family: "'Assistant', sans-serif", category: "sans-serif" },

  // --- DYSLEXIC & ACCESSIBILITY FONTS ---
  { name: "Atkinson Hyperlegible", family: "'Atkinson Hyperlegible', sans-serif", category: "dyslexic" },
  { name: "Lexend", family: "'Lexend', sans-serif", category: "dyslexic" },
  { name: "Lexend Deca", family: "'Lexend Deca', sans-serif", category: "dyslexic" },
  { name: "Andika", family: "'Andika', sans-serif", category: "dyslexic" },
  { name: "Comfortaa", family: "'Comfortaa', sans-serif", category: "dyslexic" },

  // --- MONOSPACE ---
  { name: "Fira Code", family: "'Fira Code', monospace", category: "monospace" },
  { name: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "monospace" },
  { name: "Source Code Pro", family: "'Source Code Pro', monospace", category: "monospace" },
  { name: "Inconsolata", family: "'Inconsolata', monospace", category: "monospace" },
  { name: "Roboto Mono", family: "'Roboto Mono', monospace", category: "monospace" },
  { name: "Space Mono", family: "'Space Mono', monospace", category: "monospace" },
  { name: "IBM Plex Mono", family: "'IBM Plex Mono', monospace", category: "monospace" },
  { name: "Courier Prime", family: "'Courier Prime', monospace", category: "monospace" },
];
