const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// The block to remove is from 
// {/* ── CONTINUE READING & MY LIBRARY ──────────────────────────────────── */}
// to 
// {isReading ? (
//    /* ── READING MODE ─────────────────────────────────────────────────── */

const targetRegex = /\{\/\* ── CONTINUE READING & MY LIBRARY ──────────────────────────────────── \*\/\}[\s\S]*?(?=\{\/\* ── READING MODE ─────────────────────────────────────────────────── \*\/)/;

if (targetRegex.test(code)) {
    code = code.replace(targetRegex, '');
} else {
    console.log("Regex didn't match.");
}

// Also ensure the dropzone uses !pdfModePrompt
code = code.replace(/\{!isReading && !loading \? \(/g, '{!isReading && !loading && !pdfModePrompt ? (');

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
