/** @satisfies {import('@webcontainer/api').FileSystemTree} */

import * as fs from 'node:fs';
import * as path from 'node:path';

const files = {
  'package.json': {
    file: {
      contents: `
{
  "name": "react-testing-demos",
  "type": "module",
  "dependencies": {
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@testing-library/dom": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@vitest/ui": "latest",
    "global-jsdom": "latest",
    "jsdom": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vitest": "latest"
  },
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui --watch",
    "test:run": "vitest run"
  }
}`,
    },
  },
  'setupTests.js': {
    file: {
      contents: `
import '@testing-library/jest-dom';
`,
    },
  },
  'vitest.config.js': {
    file: {
      contents: `
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ["./setupTests.js"],
  },
})
`,
    },
  },
  'tsconfig.json': {
    file: {
      contents: `
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "allowJs": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noEmit": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "noImplicitOverride": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false
  },
  "include": ["src/**/*", "index.test.tsx"],
  "exclude": ["node_modules"]
}
`,
    },
  },
};


const dirname = path.dirname(new URL(import.meta.url).pathname);
const templatesDirPath = path.join(dirname, 'templates');

for (const file of fs.readdirSync(templatesDirPath)) {
  files[file.substring(0, file.length - '.template'.length)] = {
    file: {
      contents: fs.readFileSync(`${templatesDirPath}/${file}`, 'utf-8'),
    },
  };
}

export { files };
