import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { WebContainer } from "@webcontainer/api";
import { useContainerFiles } from "../contexts/ContainerFilesContext";
import { useRef, useState } from "react";

interface CodeEditorProps {
  testCaseId: string;
  webContainerInstance: WebContainer | null;
}

const writeIndexTestTsx = async (webContainerInstance: WebContainer, content: string) => {
  await webContainerInstance.fs.writeFile('index.test.tsx', content);
}

const CodeEditor = ({
  testCaseId,
  webContainerInstance,
}: CodeEditorProps) => {
  const { files } = useContainerFiles();
  const [editorContent, setEditorContent] = useState<string | null>(files[`${testCaseId}.test.tsx`]?.file.contents || null);
  const editorRef = useRef<any>(null);

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      esModuleInterop: true,
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      isolatedModules: true,
      noEmit: true
    });

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      declare module "react" {
        export = React;
      }
      
      declare namespace React {
        function createElement(type: any, props?: any, ...children: any[]): any;
        function Fragment(props: any): any;
      }
      
      declare module "@testing-library/react" {
        export function render(component: any, options?: any): any;
      }

      declare global {
        function describe(name: string, fn: () => void): void;
        function it(name: string, fn: () => void | Promise<void>): void;
        function test(name: string, fn: () => void | Promise<void>): void;
        function expect<T>(actual: T): {
          toBe(expected: T): void;
          toEqual(expected: any): void;
          toContain(expected: any): void;
          toBeInTheDocument(): void;
          toHaveTextContent(expected: string): void;
          toBeVisible(): void;
          not: {
            toBe(expected: T): void;
            toEqual(expected: any): void;
            toContain(expected: any): void;
            toBeInTheDocument(): void;
            toHaveTextContent(expected: string): void;
            toBeVisible(): void;
          }
        };
        function beforeEach(fn: () => void | Promise<void>): void;
        function afterEach(fn: () => void | Promise<void>): void;
        function beforeAll(fn: () => void | Promise<void>): void;
        function afterAll(fn: () => void | Promise<void>): void;
        function vi: {
          fn(): jest.Mock;
          mock(path: string): void;
        };
      }
      `,
      'react-types.d.ts'
    );
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.focus();

    editor.onDidChangeModelContent(() => {
      setTimeout(() => {
        if (editorRef.current && document.activeElement !== document.querySelector('.monaco-editor textarea')) {
          editorRef.current.focus();
        }
      }, 10);
    });

    const editorContainer = editor.getDomNode()?.parentElement;
    if (editorContainer) {
      editorContainer.addEventListener('mousedown', (e) => {
        if (e.target === editorContainer) {
          e.preventDefault();
          editor.focus();
        }
      });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      if (webContainerInstance) {
        writeIndexTestTsx(webContainerInstance, value);
      }
    }
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="typescript"
      defaultValue={editorContent ?? undefined}
      theme="vs-dark"
      path="index.test.tsx"
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        readOnly: !webContainerInstance,
        automaticLayout: true,
        fixedOverflowWidgets: true
      }}
      onChange={handleEditorChange}
    />
  )
}

export default CodeEditor;
