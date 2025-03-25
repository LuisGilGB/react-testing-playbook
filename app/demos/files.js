/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files = {
  'package.json': {
    file: {
      contents: `
{
  "name": "react-testing-demo-001",
  "type": "module",
  "dependencies": {
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@testing-library/dom": "latest",
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
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}`,
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
  'index.test.tsx': {
    file: {
      contents: `
import { render } from "@testing-library/react"

it("renders without crashing", () => {
  render(<div>Hello World</div>)
})
`,
    },
  },
};