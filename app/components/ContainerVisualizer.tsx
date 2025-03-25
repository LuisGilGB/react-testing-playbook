import { useEffect, useRef } from "react";
import { useWebContainer } from "../contexts/WebContainerContext";
import { files } from "../demos/files";
import { WebContainer } from "@webcontainer/api";
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

const writeIndexJs = async (webContainerInstance: WebContainer, content: string) => {
  await webContainerInstance.fs.writeFile('index.js', content);
}

const ContainerVisualizer = () => {
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
        const serverProcess = await webContainerInstance.spawn('npm', ['run', 'start'], {
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
          iframeRef.current!.src = url;
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
    <div className="h-[100vh] flex flex-col gap-4 p-4">
      <div className="flex-1 flex flex-row gap-4">
        <div className="flex-1">
          <textarea
            defaultValue={files['index.js'].file.contents}
            className="w-full h-full resize-none border rounded px-4 py-2 bg-black text-white"
            disabled={!webContainerInstance}
            onChange={(e) => {
              if (webContainerInstance) {
                writeIndexJs(webContainerInstance, e.target.value);
              }
            }}
          />
        </div>
        <div className="flex-1 overflow-hidden border rounded">
          <iframe ref={iframeRef} className="w-full h-full" src="about:blank"></iframe>
        </div>
      </div>
      <div className="terminal h-[300px] overflow-hidden" ref={terminalRef}></div>
    </div>
  );
};

export default ContainerVisualizer;
