import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginTanstackQuery from "@tanstack/eslint-plugin-query";
import pluginTanstackRouter from "@tanstack/eslint-plugin-router";
import pluginStylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  globalIgnores([".config/*", "build/*", "dist/*", "app/routeTree.gen.ts"]),
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  pluginReactHooks.configs['recommended-latest'],
  ...pluginTanstackQuery.configs['flat/recommended'],
  ...pluginTanstackRouter.configs['flat/recommended'],
  {
    plugins: {
      '@stylistic': pluginStylistic
    },
    rules: {
      'indent': ['error', 2],
      '@stylistic/indent': ['error', 2],
      '@stylistic/array-bracket-spacing': ["error", "always", { "arraysInArrays": false, "objectsInArrays": false }],
      'jsx-closing-bracket-location': 1
    }
  }
]);
