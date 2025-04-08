/** @satisfies {import('@webcontainer/api').FileSystemTree} */


const files = {
  "package.json": {
    "file": {
      "contents": "\n{\n  \"name\": \"react-testing-demos\",\n  \"type\": \"module\",\n  \"dependencies\": {\n    \"react\": \"latest\",\n    \"react-dom\": \"latest\"\n  },\n  \"devDependencies\": {\n    \"@testing-library/dom\": \"latest\",\n    \"@testing-library/jest-dom\": \"latest\",\n    \"@testing-library/react\": \"latest\",\n    \"@types/react\": \"latest\",\n    \"@types/react-dom\": \"latest\",\n    \"@vitest/ui\": \"latest\",\n    \"global-jsdom\": \"latest\",\n    \"jsdom\": \"latest\",\n    \"typescript\": \"latest\",\n    \"vite\": \"latest\",\n    \"vitest\": \"latest\"\n  },\n  \"scripts\": {\n    \"test\": \"vitest\",\n    \"test:ui\": \"vitest --ui --watch\",\n    \"test:run\": \"vitest run\"\n  }\n}"
    }
  },
  "setupTests.js": {
    "file": {
      "contents": "\nimport '@testing-library/jest-dom';\n"
    }
  },
  "vitest.config.js": {
    "file": {
      "contents": "\nimport { defineConfig } from 'vitest/config'\n\nexport default defineConfig({\n  test: {\n    globals: true,\n    environment: 'jsdom',\n    setupFiles: [\"./setupTests.js\"],\n  },\n})\n"
    }
  },
  "tsconfig.json": {
    "file": {
      "contents": "\n{\n  \"compilerOptions\": {\n    \"target\": \"ESNext\",\n    \"module\": \"ESNext\",\n    \"moduleDetection\": \"force\",\n    \"jsx\": \"react-jsx\",\n    \"esModuleInterop\": true,\n    \"allowJs\": true,\n    \"resolveJsonModule\": true,\n    \"skipLibCheck\": true,\n    \"noEmit\": true,\n    \"strict\": true,\n    \"noUncheckedIndexedAccess\": true,\n    \"noFallthroughCasesInSwitch\": true,\n    \"isolatedModules\": true,\n    \"noImplicitOverride\": true,\n    \"noUnusedLocals\": false,\n    \"noUnusedParameters\": false,\n    \"noPropertyAccessFromIndexSignature\": false\n  },\n  \"include\": [\"src/**/*\", \"index.test.tsx\"],\n  \"exclude\": [\"node_modules\"]\n}\n"
    }
  },
  "basic-render.test.tsx": {
    "file": {
      "contents": "import { render } from \"@testing-library/react\"\n\nit(\"renders without crashing\", () => {\n  render(<div>Hello World</div>)\n})\n"
    }
  },
  "find-by-text.test.tsx": {
    "file": {
      "contents": "import { render, screen } from \"@testing-library/react\"\nimport { useEffect, useState } from \"react\"\n\nconst AsyncComponent = () => {\n  const [isLoaded, setIsLoaded] = useState(false)\n  \n  useEffect(() => {\n    // Simulate data loading\n    const timer = setTimeout(() => {\n      setIsLoaded(true)\n    }, 100)\n    \n    return () => clearTimeout(timer)\n  }, [])\n  \n  return (\n    <div>\n      {isLoaded ? (\n        <p>Data has been loaded!</p>\n      ) : (\n        <p>Loading data...</p>\n      )}\n    </div>\n  )\n}\n\nit(\"finds elements that appear asynchronously\", async () => {\n  render(<AsyncComponent />)\n  \n  // First, we can verify the loading state is shown\n  expect(screen.getByText(\"Loading data...\")).toBeInTheDocument()\n  \n  // Then, we can wait for the loaded state to appear\n  const loadedElement = await screen.findByText(\"Data has been loaded!\")\n  expect(loadedElement).toBeInTheDocument()\n});\n"
    }
  },
  "get-by-label-text.test.tsx": {
    "file": {
      "contents": "import { render } from \"@testing-library/react\"\n\nit(\"gets form elements by their associated label text\", () => {\n  const { getByLabelText } = render(\n    <form>\n      <label htmlFor=\"username\">Username</label>\n      <input id=\"username\" type=\"text\" />\n      \n      <label htmlFor=\"password\">Password</label>\n      <input id=\"password\" type=\"password\" />\n      \n      <label>\n        <input type=\"checkbox\" /> Remember me\n      </label>\n    </form>\n  )\n\n  const usernameInput = getByLabelText(\"Username\")\n  const passwordInput = getByLabelText(\"Password\")\n  const rememberMeCheckbox = getByLabelText(\"Remember me\")\n  \n  expect(usernameInput).toBeInTheDocument()\n  expect(passwordInput).toBeInTheDocument()\n  expect(rememberMeCheckbox).toBeInTheDocument()\n});\n"
    }
  },
  "get-by-placeholder-text.test.tsx": {
    "file": {
      "contents": "import { render } from \"@testing-library/react\"\n\nit(\"gets input elements by their placeholder text\", () => {\n  const { getByPlaceholderText } = render(\n    <form>\n      <input \n        type=\"text\" \n        placeholder=\"Enter your email\" \n      />\n      <input \n        type=\"text\" \n        placeholder=\"Enter your username\" \n      />\n      <textarea \n        placeholder=\"Write your message here\"\n      ></textarea>\n    </form>\n  )\n\n  const emailInput = getByPlaceholderText(\"Enter your email\")\n  const usernameInput = getByPlaceholderText(\"Enter your username\")\n  const messageTextarea = getByPlaceholderText(\"Write your message here\")\n  \n  expect(emailInput).toBeInTheDocument()\n  expect(usernameInput).toBeInTheDocument()\n  expect(messageTextarea).toBeInTheDocument()\n});\n"
    }
  },
  "get-by-role.test.tsx": {
    "file": {
      "contents": "import { render } from \"@testing-library/react\"\n\nit(\"gets an element by its ARIA role\", () => {\n  const { getByRole } = render(\n    <div>\n      <button>Click me</button>\n      <a href=\"https://example.com\">Visit example</a>\n      <input type=\"checkbox\" aria-label=\"Accept terms\" />\n    </div>\n  )\n\n  const button = getByRole(\"button\")\n  const link = getByRole(\"link\")\n  const checkbox = getByRole(\"checkbox\")\n  \n  expect(button).toBeInTheDocument()\n  expect(link).toBeInTheDocument()\n  expect(checkbox).toBeInTheDocument()\n});\n"
    }
  },
  "get-by-text.test.tsx": {
    "file": {
      "contents": "import { render } from \"@testing-library/react\"\n\nit(\"gets and element with the given text\", () => {\n  const { getByText } = render(\n    <ul>\n      <li>First</li>\n      <li>Second</li>\n      <li>Third</li>\n    </ul>\n  )\n\n  const third = getByText(\"Third\")\n  expect(third).toBeInTheDocument()\n});\n"
    }
  }
};

export { files };