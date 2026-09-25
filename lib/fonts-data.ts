export interface FontOption {
  name: string;
  googleName: string;
  family: string;
  category: "serif" | "sans-serif" | "monospace" | "dyslexic";
}

export const GOOGLE_FONTS: FontOption[] = [
  // --- SERIF (Book Classics) ---
  { name: "Merriweather", googleName: "Merriweather", family: "'Merriweather', serif", category: "serif" },
  { name: "Playfair Display", googleName: "Playfair+Display", family: "'Playfair Display', serif", category: "serif" },
  { name: "Lora", googleName: "Lora", family: "'Lora', serif", category: "serif" },
  { name: "EB Garamond", googleName: "EB+Garamond", family: "'EB Garamond', serif", category: "serif" },
  { name: "Cormorant Garamond", googleName: "Cormorant+Garamond", family: "'Cormorant Garamond', serif", category: "serif" },
  { name: "Libre Baskerville", googleName: "Libre+Baskerville", family: "'Libre Baskerville', serif", category: "serif" },
  { name: "PT Serif", googleName: "PT+Serif", family: "'PT Serif', serif", category: "serif" },
  { name: "Crimson Text", googleName: "Crimson+Text", family: "'Crimson Text', serif", category: "serif" },
  { name: "Crimson Pro", googleName: "Crimson+Pro", family: "'Crimson Pro', serif", category: "serif" },
  { name: "Bitter", googleName: "Bitter", family: "'Bitter', serif", category: "serif" },
  { name: "Spectral", googleName: "Spectral", family: "'Spectral', serif", category: "serif" },
  { name: "Noto Serif", googleName: "Noto+Serif", family: "'Noto Serif', serif", category: "serif" },
  { name: "Cardo", googleName: "Cardo", family: "'Cardo', serif", category: "serif" },
  { name: "Alegreya", googleName: "Alegreya", family: "'Alegreya', serif", category: "serif" },
  { name: "Domine", googleName: "Domine", family: "'Domine', serif", category: "serif" },
  { name: "Arvo", googleName: "Arvo", family: "'Arvo', serif", category: "serif" },
  { name: "Baskervville", googleName: "Baskervville", family: "'Baskervville', serif", category: "serif" },
  { name: "Cinzel", googleName: "Cinzel", family: "'Cinzel', serif", category: "serif" },
  { name: "Newsreader", googleName: "Newsreader", family: "'Newsreader', serif", category: "serif" },
  { name: "Vollkorn", googleName: "Vollkorn", family: "'Vollkorn', serif", category: "serif" },
  { name: "Literata", googleName: "Literata", family: "'Literata', serif", category: "serif" },

  // --- SANS-SERIF (Modern Clean) ---
  { name: "Inter", googleName: "Inter", family: "'Inter', sans-serif", category: "sans-serif" },
  { name: "Roboto", googleName: "Roboto", family: "'Roboto', sans-serif", category: "sans-serif" },
  { name: "Open Sans", googleName: "Open+Sans", family: "'Open Sans', sans-serif", category: "sans-serif" },
  { name: "Lato", googleName: "Lato", family: "'Lato', sans-serif", category: "sans-serif" },
  { name: "Montserrat", googleName: "Montserrat", family: "'Montserrat', sans-serif", category: "sans-serif" },
  { name: "Poppins", googleName: "Poppins", family: "'Poppins', sans-serif", category: "sans-serif" },
  { name: "Nunito", googleName: "Nunito", family: "'Nunito', sans-serif", category: "sans-serif" },
  { name: "Raleway", googleName: "Raleway", family: "'Raleway', sans-serif", category: "sans-serif" },
  { name: "Work Sans", googleName: "Work+Sans", family: "'Work Sans', sans-serif", category: "sans-serif" },
  { name: "DM Sans", googleName: "DM+Sans", family: "'DM Sans', sans-serif", category: "sans-serif" },
  { name: "Plus Jakarta Sans", googleName: "Plus+Jakarta+Sans", family: "'Plus Jakarta Sans', sans-serif", category: "sans-serif" },
  { name: "Outfit", googleName: "Outfit", family: "'Outfit', sans-serif", category: "sans-serif" },
  { name: "Quicksand", googleName: "Quicksand", family: "'Quicksand', sans-serif", category: "sans-serif" },
  { name: "Rubik", googleName: "Rubik", family: "'Rubik', sans-serif", category: "sans-serif" },
  { name: "Fira Sans", googleName: "Fira+Sans", family: "'Fira Sans', sans-serif", category: "sans-serif" },
  { name: "Jost", googleName: "Jost", family: "'Jost', sans-serif", category: "sans-serif" },
  { name: "Cabin", googleName: "Cabin", family: "'Cabin', sans-serif", category: "sans-serif" },
  { name: "PT Sans", googleName: "PT+Sans", family: "'PT Sans', sans-serif", category: "sans-serif" },

  // --- DYSLEXIC & ACCESSIBILITY ---
  { name: "Atkinson Hyperlegible", googleName: "Atkinson+Hyperlegible", family: "'Atkinson Hyperlegible', sans-serif", category: "dyslexic" },
  { name: "Lexend", googleName: "Lexend", family: "'Lexend', sans-serif", category: "dyslexic" },
  { name: "Lexend Deca", googleName: "Lexend+Deca", family: "'Lexend Deca', sans-serif", category: "dyslexic" },
  { name: "Comfortaa", googleName: "Comfortaa", family: "'Comfortaa', sans-serif", category: "dyslexic" },

  // --- MONOSPACE ---
  { name: "Fira Code", googleName: "Fira+Code", family: "'Fira Code', monospace", category: "monospace" },
  { name: "JetBrains Mono", googleName: "JetBrains+Mono", family: "'JetBrains Mono', monospace", category: "monospace" },
  { name: "Source Code Pro", googleName: "Source+Code+Pro", family: "'Source Code Pro', monospace", category: "monospace" },
  { name: "Inconsolata", googleName: "Inconsolata", family: "'Inconsolata', monospace", category: "monospace" },
  { name: "Roboto Mono", googleName: "Roboto+Mono", family: "'Roboto Mono', monospace", category: "monospace" },
  { name: "Space Mono", googleName: "Space+Mono", family: "'Space Mono', monospace", category: "monospace" },
];
