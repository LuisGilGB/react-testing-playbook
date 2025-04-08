/** @satisfies {import('@webcontainer/api').FileSystemTree} */


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

try {
  const modules = import.meta.glob('./templates/*.template');
  const imports = await Promise.all(Object.keys(modules).map((path, _i, _arr) => new Promise((resolve) => {
    import(/* @vite-ignore */ `${path}?raw`).then((content) => {
      resolve([path, content.default]);
    })
  })));

  for (const [path, content] of imports) {
    let fileName = path.split('/').at(-1)
    fileName = fileName.substring(0, fileName.length - '.template'.length);
    files[fileName] = {
      file: {
        contents: content,
      },
    };
  }
} catch (error) {
  console.error(error);
  files['error'] = error;
}

export { files };
