import { cn } from "@/lib/utils";
import Editor, { Monaco } from "@monaco-editor/react";
import { WebContainer } from "@webcontainer/api";
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { useEffect, useRef, useState } from "react";
import { useWebContainer } from "../contexts/WebContainerContext";
import { files } from "../demos/files";

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
    // Configure TypeScript compiler options to match the tsconfig.json in the files template
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX, // matches "react-jsx" in tsconfig
      esModuleInterop: true,
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      isolatedModules: true,
      noEmit: true
    });

    // Add type definitions for React
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

      // Vitest globals
      declare global {
        // Test functions
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

  return (
    <div className={cn("flex flex-col gap-4 p-4", className)}>
      <div className="flex-1 flex flex-row gap-4 min-h-[300px]">
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            defaultValue={editorContent}
            theme="vs-dark"
            path="index.test.tsx"
            beforeMount={handleEditorWillMount}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              readOnly: !webContainerInstance
            }}
            onChange={handleEditorChange}
          />
        </div>
        <div className="flex-1 overflow-hidden border rounded">
          <iframe ref={iframeRef} className="w-full h-full" src="about:blank" title="WebContainer"></iframe>
        </div>
      </div>
      <div className="terminal h-[300px] overflow-hidden" ref={terminalRef}></div>
    </div>
  );
};

export default ContainerVisualizer;
