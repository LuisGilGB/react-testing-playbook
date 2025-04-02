import { useContainerFiles } from "@/contexts/ContainerFilesContext";
import { WebContainer } from "@webcontainer/api";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface WebContainerContextValue {
  webcontainerInstance: WebContainer | null;
  mountTestCase: (testCaseId: string) => Promise<void>;
}

const WebContainerContext = createContext<WebContainerContextValue>({
  webcontainerInstance: null,
  mountTestCase: async () => { }
});

export const WebContainerProvider = ({ children }: { children: React.ReactNode }) => {
  const { files } = useContainerFiles();
  const webcontainerInstanceRef = useRef<WebContainer | null>(null);
  const [webcontainerInstance, setWebcontainerInstance] = useState<WebContainer | null>(null);

  useEffect(() => {
    WebContainer.boot().then(async (instance) => {
      webcontainerInstanceRef.current = instance;
      await instance.mount(files);
      setWebcontainerInstance(instance);
    });
  }, []);

  const mountTestCase = useCallback(async (testCaseId: string) => {
    if (!webcontainerInstance) return;
    await webcontainerInstance.mount(files);
  }, [webcontainerInstance, files]);

  return (
    <WebContainerContext value={{ webcontainerInstance, mountTestCase }}>
      {children}
    </WebContainerContext>
  );
};

export const useWebContainer = (): WebContainer | null => {
  const { webcontainerInstance } = useContext(WebContainerContext);

  return webcontainerInstance;
};

export const useWebContainerContext = () => {
  return useContext(WebContainerContext);
};
