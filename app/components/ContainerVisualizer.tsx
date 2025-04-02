import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { useEffect, useRef } from "react";
import { useWebContainer } from "../contexts/WebContainerContext";

import '@xterm/xterm/css/xterm.css';
import CodeEditor from "./CodeEditor";

interface ContainerVisualizerProps {
  testCaseId: string;
  className?: string;
}

const ContainerVisualizer = ({ className, testCaseId }: ContainerVisualizerProps) => {
  const webContainerInstance = useWebContainer();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);

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

        webContainerInstance.on('server-ready', (_port: number, url: string) => {
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

  return (
    <div className={cn("flex flex-col gap-4 p-4", className)}>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 min-h-[300px] rounded-lg border"
      >
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full p-2">
            <CodeEditor
              key={testCaseId}
              testCaseId={testCaseId}
              webContainerInstance={webContainerInstance}
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
