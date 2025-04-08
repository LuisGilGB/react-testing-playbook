import { defineConfig } from '@tanstack/react-start/config';
import path from 'path';
import fs from 'fs';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    preset: 'netlify',
    routeRules: {
      '**': {
        headers: {
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Opener-Policy': 'same-origin'
        }
      }
    }
  },
  vite: {
    assetsInclude: ['**/*.template'],
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      {
        name: 'load-test-cases-templates',
        buildStart: async () => {
          const templateDir = path.join(import.meta.dirname, './app/test-cases/templates');
          const templateFiles = fs.readdirSync(templateDir).filter((file) => file.endsWith('.template'));
          const files = (await import('./app/test-cases/files.js')).files;

          templateFiles.forEach((file) => {
            const templatePath = path.join(templateDir, file);
            const templateContent = fs.readFileSync(templatePath, 'utf-8');
            const templateName = file.replace('.template', '');
            // Read the json exported from files.js as an object
            (files as Record<string, { file: { contents: string } }>)[templateName] = {
              file: {
                contents: templateContent,
              },
            };
          });

          // Rewrite in the files file the new files object and exports it
          const newFiles = `/** @satisfies {import('@webcontainer/api').FileSystemTree} */\n\n\nconst files = ${JSON.stringify(files, null, 2)};\n\nexport { files };`;
          fs.writeFileSync(path.join(import.meta.dirname, './app/test-cases/files.js'), newFiles);
        },
      }
    ],
  },
})
