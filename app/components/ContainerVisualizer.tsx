import { useEffect, useRef } from "react";
import { useWebContainer } from "../contexts/WebContainerContext";
import { files } from "../demos/files";
import { WebContainer } from "@webcontainer/api";
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

const installDependencies = async (webContainerInstance: WebContainer) => {
  // Install dependencies
  const installProcess = await webContainerInstance.spawn('npm', ['install']);
  // Wait for install command to exit
  await installProcess.exit;
  return installProcess;
}

const startDevServer = async (webContainerInstance: WebContainer, iframeEl: HTMLIFrameElement, terminal: Terminal) => {
  const serverProcess = await webContainerInstance.spawn('npm', ['run', 'start']);

  serverProcess.output.pipeTo(new WritableStream({
    write(data) {
      terminal.write(data);
    }
  }));

  // Wait for `server-ready` event
  webContainerInstance.on('server-ready', (_port: number, url: string) => {
    iframeEl.src = url;
  });
}

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
      terminal.current = new Terminal({
        convertEol: true
      });
      terminal.current.open(terminalRef.current!);
      installDependencies(webContainerInstance)
        .then(installProcess => {
          installProcess.output.pipeTo(new WritableStream({
            write(data) {
              terminal.current?.write(data);
            }
          }));
          startDevServer(webContainerInstance, iframeRef.current!, terminal.current!);
        })
        .catch(console.error);
    }
  }, [webContainerInstance]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
        <div className="editor" style={{ flex: 1 }}>
          <textarea
            defaultValue={files['index.js'].file.contents}
            disabled={!webContainerInstance}
            onChange={(e) => {
              if (webContainerInstance) {
                writeIndexJs(webContainerInstance, e.target.value);
              }
            }}
          />
        </div>
        <div className="preview" style={{ flex: 1 }}>
          <iframe ref={iframeRef} src="about:blank"></iframe>
        </div>
      </div>
      <div className="terminal" ref={terminalRef}></div>
    </div>
  );
};

export default ContainerVisualizer;
