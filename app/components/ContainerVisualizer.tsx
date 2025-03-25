import { useEffect, useRef } from "react";
import { useWebContainer } from "../contexts/WebContainerContext";
import { files } from "../demos/files";
import { WebContainer } from "@webcontainer/api";

const installDependencies = async (webContainerInstance: WebContainer) => {
  // Install dependencies
  const installProcess = await webContainerInstance.spawn('npm', ['install']);
  // Wait for install command to exit
  await installProcess.exit;
  return installProcess;
}

const startDevServer = async (webContainerInstance: WebContainer, iframeEl: HTMLIFrameElement) => {
  // Run `npm run start` to start the Express app
  await webContainerInstance.spawn('npm', ['run', 'start']);

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

  useEffect(() => {
    if (webContainerInstance) {
      installDependencies(webContainerInstance)
        .then(installProcess => {
          installProcess.output.pipeTo(new WritableStream({
            write(data) {
              console.log(data);
            }
          }));
          startDevServer(webContainerInstance, iframeRef.current!);
        })
        .catch(console.error);
    }
  }, [webContainerInstance]);

  return (
    <div className="container">
      <div className="editor">
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
      <div className="preview">
        <iframe ref={iframeRef} src="about:blank"></iframe>
      </div>
    </div>
  );
};

export default ContainerVisualizer;
