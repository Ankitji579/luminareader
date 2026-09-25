const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

code = code.replace(/\\n"use client";/, '\\n"use client";');
fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
