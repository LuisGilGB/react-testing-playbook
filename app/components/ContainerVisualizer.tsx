import { cn } from "@/lib/utils";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { WebContainer } from "@webcontainer/api";
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { useEffect, useRef, useState } from "react";
import { useWebContainer } from "../contexts/WebContainerContext";
import { files } from "../demos/files";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import '@xterm/xterm/css/xterm.css';

const writeIndexTestTsx = async (webContainerInstance: WebContainer, content: string) => {
  await webContainerInstance.fs.writeFile('index.test.tsx', content);
}

interface ContainerVisualizerProps {
  className?: string;
}

const ContainerVisualizer = ({ className }: ContainerVisualizerProps) => {
  const webContainerInstance = useWebContainer();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const [editorContent, setEditorContent] = useState<string>(files['index.test.tsx'].file.contents);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (webContainerInstance) {
      const installDependencies = async () => {
        const installProcess = await webContainerInstance.spawn('npm', ['install'], {
          terminal: {
            rows: terminal.current!.rows,
            cols: terminal.current!.cols
          }
        });

        await installProcess.exit;
        return installProcess;
      };

      const startDevServer = async () => {
        const serverProcess = await webContainerInstance.spawn('npm', ['run', 'test:ui'], {
          terminal: {
            rows: terminal.current!.rows,
            cols: terminal.current!.cols
          }
        });

        serverProcess.output.pipeTo(new WritableStream({
          write(data) {
            terminal.current?.write(data);
          }
        }));

        webContainerInstance.on('server-ready', (port: number, url: string) => {
          console.log('Port', port, url);
          iframeRef.current!.src = `${url}/__vitest__/`;
        });
      }

      terminal.current = new Terminal({
        convertEol: true
      });
      const fitAddon = new FitAddon();
      terminal.current.loadAddon(fitAddon);
      terminal.current.open(terminalRef.current!);
      fitAddon.fit();
      terminal.current.onResize(() => {
        fitAddon.fit();
      });
      installDependencies()
        .then(installProcess => {
          installProcess.output.pipeTo(new WritableStream({
            write(data) {
              terminal.current?.write(data);
            }
          }));
          startDevServer();
        })
        .catch(console.error);
    }
  }, [webContainerInstance]);

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

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      if (webContainerInstance) {
        writeIndexTestTsx(webContainerInstance, value);
      }
    }
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

  return (
    <div className={cn("flex flex-col gap-4 p-4", className)}>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 min-h-[300px] rounded-lg border"
      >
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full p-2">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              defaultValue={editorContent}
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
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full overflow-hidden">
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              src="about:blank"
              title="WebContainer"
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="terminal h-[300px] overflow-hidden border rounded-lg" ref={terminalRef}></div>
    </div>
  );
};

export type ContainerVisualizerType = typeof ContainerVisualizer;

export default ContainerVisualizer;
