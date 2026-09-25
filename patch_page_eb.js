const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(
  'import ReaderWorkspace from "@/components/reader/ReaderWorkspace";',
  'import ReaderWorkspace from "@/components/reader/ReaderWorkspace";\nimport { ErrorBoundary } from "@/components/ErrorBoundary";'
);

code = code.replace(
  '<ReaderWorkspace />',
  '<ErrorBoundary><ReaderWorkspace /></ErrorBoundary>'
);

fs.writeFileSync('app/page.tsx', code);
