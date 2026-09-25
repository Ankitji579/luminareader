export interface FontOption {
  name: string;
  googleName: string;
  family: string;
  category: "serif" | "sans-serif" | "monospace" | "dyslexic" | "display" | "script";
}

export const DATABASE_NAME = "105+ Curated Google Fonts Database for LuminaReader";

export const GOOGLE_FONTS: FontOption[] = [
  // ==========================================
  // --- SERIF (Book & Literary Classics) --- (35 fonts)
  // ==========================================
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
  { name: "Goudy Bookletter 1911", googleName: "Goudy+Bookletter+1911", family: "'Goudy Bookletter 1911', serif", category: "serif" },
  { name: "Faustina", googleName: "Faustina", family: "'Faustina', serif", category: "serif" },
  { name: "Frank Ruhl Libre", googleName: "Frank+Ruhl+Libre", family: "'Frank Ruhl Libre', serif", category: "serif" },
  { name: "Castoro", googleName: "Castoro", family: "'Castoro', serif", category: "serif" },
  { name: "Besley", googleName: "Besley", family: "'Besley', serif", category: "serif" },
  { name: "Bodoni Moda", googleName: "Bodoni+Moda", family: "'Bodoni Moda', serif", category: "serif" },
  { name: "Prata", googleName: "Prata", family: "'Prata', serif", category: "serif" },
  { name: "Tinos", googleName: "Tinos", family: "'Tinos', serif", category: "serif" },
  { name: "Quattrocento", googleName: "Quattrocento", family: "'Quattrocento', serif", category: "serif" },
  { name: "Old Standard TT", googleName: "Old+Standard+TT", family: "'Old Standard TT', serif", category: "serif" },
  { name: "Alice", googleName: "Alice", family: "'Alice', serif", category: "serif" },
  { name: "Petrona", googleName: "Petrona", family: "'Petrona', serif", category: "serif" },
  { name: "BioRhyme", googleName: "BioRhyme", family: "'BioRhyme', serif", category: "serif" },
  { name: "Markazi Text", googleName: "Markazi+Text", family: "'Markazi Text', serif", category: "serif" },

  // ==========================================
  // --- SANS-SERIF (Modern, Clean & Sharp) --- (35 fonts)
  // ==========================================
  { name: "Inter", googleName: "Inter", family: "'Inter', sans-serif", category: "sans-serif" },
  { name: "Roboto", googleName: "Roboto", family: "'Roboto', sans-serif", category: "sans-serif" },
  { name: "Open Sans", googleName: "Open+Sans", family: "'Open Sans', sans-serif", category: "sans-serif" },
  { name: "Lato", googleName: "Lato", family: "'Lato', sans-serif", category: "sans-serif" },
  { name: "Montserrat", googleName: "Montserrat", family: "'Montserrat', sans-serif", category: "sans-serif" },
  { name: "Poppins", googleName: "Poppins", family: "'Poppins', sans-serif", category: "sans-serif" },
  { name: "Nunito", googleName: "Nunito", family: "'Nunito', sans-serif", category: "sans-serif" },
  { name: "Nunito Sans", googleName: "Nunito+Sans", family: "'Nunito Sans', sans-serif", category: "sans-serif" },
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
  { name: "Karla", googleName: "Karla", family: "'Karla', sans-serif", category: "sans-serif" },
  { name: "Mulish", googleName: "Mulish", family: "'Mulish', sans-serif", category: "sans-serif" },
  { name: "Barlow", googleName: "Barlow", family: "'Barlow', sans-serif", category: "sans-serif" },
  { name: "Heebo", googleName: "Heebo", family: "'Heebo', sans-serif", category: "sans-serif" },
  { name: "Overpass", googleName: "Overpass", family: "'Overpass', sans-serif", category: "sans-serif" },
  { name: "Maven Pro", googleName: "Maven+Pro", family: "'Maven Pro', sans-serif", category: "sans-serif" },
  { name: "Manrope", googleName: "Manrope", family: "'Manrope', sans-serif", category: "sans-serif" },
  { name: "Albert Sans", googleName: "Albert+Sans", family: "'Albert Sans', sans-serif", category: "sans-serif" },
  { name: "Urbanist", googleName: "Urbanist", family: "'Urbanist', sans-serif", category: "sans-serif" },
  { name: "Space Grotesk", googleName: "Space+Grotesk", family: "'Space Grotesk', sans-serif", category: "sans-serif" },
  { name: "Public Sans", googleName: "Public+Sans", family: "'Public Sans', sans-serif", category: "sans-serif" },
  { name: "Figtree", googleName: "Figtree", family: "'Figtree', sans-serif", category: "sans-serif" },
  { name: "Red Hat Display", googleName: "Red+Hat+Display", family: "'Red Hat Display', sans-serif", category: "sans-serif" },
  { name: "Be Vietnam Pro", googleName: "Be+Vietnam+Pro", family: "'Be Vietnam Pro', sans-serif", category: "sans-serif" },
  { name: "Syne", googleName: "Syne", family: "'Syne', sans-serif", category: "sans-serif" },
  { name: "Source Sans 3", googleName: "Source+Sans+3", family: "'Source Sans 3', sans-serif", category: "sans-serif" },

  // ==========================================
  // --- DYSLEXIC & ACCESSIBILITY FONTS --- (12 fonts)
  // ==========================================
  { name: "Atkinson Hyperlegible", googleName: "Atkinson+Hyperlegible", family: "'Atkinson Hyperlegible', sans-serif", category: "dyslexic" },
  { name: "Lexend", googleName: "Lexend", family: "'Lexend', sans-serif", category: "dyslexic" },
  { name: "Lexend Deca", googleName: "Lexend+Deca", family: "'Lexend Deca', sans-serif", category: "dyslexic" },
  { name: "Lexend Exa", googleName: "Lexend+Exa", family: "'Lexend Exa', sans-serif", category: "dyslexic" },
  { name: "Lexend Giga", googleName: "Lexend+Giga", family: "'Lexend Giga', sans-serif", category: "dyslexic" },
  { name: "Lexend Mega", googleName: "Lexend+Mega", family: "'Lexend Mega', sans-serif", category: "dyslexic" },
  { name: "Lexend Peta", googleName: "Lexend+Peta", family: "'Lexend Peta', sans-serif", category: "dyslexic" },
  { name: "Lexend Tera", googleName: "Lexend+Tera", family: "'Lexend Tera', sans-serif", category: "dyslexic" },
  { name: "Lexend Zetta", googleName: "Lexend+Zetta", family: "'Lexend Zetta', sans-serif", category: "dyslexic" },
  { name: "Comfortaa", googleName: "Comfortaa", family: "'Comfortaa', sans-serif", category: "dyslexic" },
  { name: "Readex Pro", googleName: "Readex+Pro", family: "'Readex Pro', sans-serif", category: "dyslexic" },
  { name: "Andika", googleName: "Andika", family: "'Andika', sans-serif", category: "dyslexic" },

  // ==========================================
  // --- MONOSPACE (Code & Technical Reading) --- (12 fonts)
  // ==========================================
  { name: "Fira Code", googleName: "Fira+Code", family: "'Fira Code', monospace", category: "monospace" },
  { name: "JetBrains Mono", googleName: "JetBrains+Mono", family: "'JetBrains Mono', monospace", category: "monospace" },
  { name: "Source Code Pro", googleName: "Source+Code+Pro", family: "'Source Code Pro', monospace", category: "monospace" },
  { name: "Inconsolata", googleName: "Inconsolata", family: "'Inconsolata', monospace", category: "monospace" },
  { name: "Roboto Mono", googleName: "Roboto+Mono", family: "'Roboto Mono', monospace", category: "monospace" },
  { name: "Space Mono", googleName: "Space+Mono", family: "'Space Mono', monospace", category: "monospace" },
  { name: "IBM Plex Mono", googleName: "IBM+Plex+Mono", family: "'IBM Plex Mono', monospace", category: "monospace" },
  { name: "Ubuntu Mono", googleName: "Ubuntu+Mono", family: "'Ubuntu Mono', monospace", category: "monospace" },
  { name: "Anonymous Pro", googleName: "Anonymous+Pro", family: "'Anonymous Pro', monospace", category: "monospace" },
  { name: "Cousine", googleName: "Cousine", family: "'Cousine', monospace", category: "monospace" },
  { name: "Overpass Mono", googleName: "Overpass+Mono", family: "'Overpass Mono', monospace", category: "monospace" },
  { name: "DM Mono", googleName: "DM+Mono", family: "'DM Mono', monospace", category: "monospace" },

  // ==========================================
  // --- SCRIPT & HANDWRITING (Poetry & Journal) --- (12 fonts)
  // ==========================================
  { name: "Caveat", googleName: "Caveat", family: "'Caveat', cursive", category: "script" },
  { name: "Dancing Script", googleName: "Dancing+Script", family: "'Dancing Script', cursive", category: "script" },
  { name: "Pacifico", googleName: "Pacifico", family: "'Pacifico', cursive", category: "script" },
  { name: "Great Vibes", googleName: "Great+Vibes", family: "'Great Vibes', cursive", category: "script" },
  { name: "Sacramento", googleName: "Sacramento", family: "'Sacramento', cursive", category: "script" },
  { name: "Indie Flower", googleName: "Indie+Flower", family: "'Indie Flower', cursive", category: "script" },
  { name: "Shadows Into Light", googleName: "Shadows+Into+Light", family: "'Shadows Into Light', cursive", category: "script" },
  { name: "Satisfy", googleName: "Satisfy", family: "'Satisfy', cursive", category: "script" },
  { name: "Amatic SC", googleName: "Amatic+SC", family: "'Amatic SC', cursive", category: "script" },
  { name: "Kalam", googleName: "Kalam", family: "'Kalam', cursive", category: "script" },
  { name: "Marck Script", googleName: "Marck+Script", family: "'Marck Script', cursive", category: "script" },
  { name: "Alex Brush", googleName: "Alex+Brush", family: "'Alex Brush', cursive", category: "script" },

  // ==========================================
  // --- DISPLAY & HEADERS (Special Formatting) --- (10 fonts)
  // ==========================================
  { name: "Abril Fatface", googleName: "Abril+Fatface", family: "'Abril Fatface', display", category: "display" },
  { name: "Righteous", googleName: "Righteous", family: "'Righteous', display", category: "display" },
  { name: "Shrikhand", googleName: "Shrikhand", family: "'Shrikhand', display", category: "display" },
  { name: "Cinzel Decorative", googleName: "Cinzel+Decorative", family: "'Cinzel Decorative', display", category: "display" },
  { name: "Bungee", googleName: "Bungee", family: "'Bungee', display", category: "display" },
  { name: "Permanent Marker", googleName: "Permanent+Marker", family: "'Permanent Marker', display", category: "display" },
  { name: "Monoton", googleName: "Monoton", family: "'Monoton', display", category: "display" },
  { name: "Alfa Slab One", googleName: "Alfa+Slab+One", family: "'Alfa Slab One', display", category: "display" },
  { name: "Fredoka", googleName: "Fredoka", family: "'Fredoka', display", category: "display" },
  { name: "Lobster", googleName: "Lobster", family: "'Lobster', display", category: "display" }
];
