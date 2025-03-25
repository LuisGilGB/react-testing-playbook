import { useEffect, useRef } from "react";
import { useWebContainer } from "../contexts/WebContainerContext";
import { files } from "../demos/files";
import { WebContainer } from "@webcontainer/api";
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { cn } from "@/lib/utils";

const writeIndexTestJsx = async (webContainerInstance: WebContainer, content: string) => {
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

  return (
    <div className={cn("flex flex-col gap-4 p-4", className)}>
      <div className="flex-1 flex flex-row gap-4 min-h-[300px]">
        <div className="flex-2">
          <textarea
            defaultValue={files['index.test.tsx'].file.contents}
            className="w-full h-full resize-none border rounded px-4 py-2 bg-black text-white"
            disabled={!webContainerInstance}
            onChange={(e) => {
              if (webContainerInstance) {
                writeIndexTestJsx(webContainerInstance, e.target.value);
              }
            }}
          />
        </div>
        <div className="flex-3 overflow-hidden border rounded">
          <iframe ref={iframeRef} className="w-full h-full" src="about:blank" title="WebContainer"></iframe>
        </div>
      </div>
      <div className="terminal h-[300px] overflow-hidden" ref={terminalRef}></div>
    </div>
  );
};

export default ContainerVisualizer;
