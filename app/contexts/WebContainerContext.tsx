import { WebContainer } from "@webcontainer/api";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { files } from "../demos/files";

const WebContainerContext = createContext<WebContainer | null>(null);

export const WebContainerProvider = ({ children }: { children: React.ReactNode }) => {
  const webcontainerInstanceRef = useRef<WebContainer | null>(null);
  const [webcontainerInstance, setWebcontainerInstance] = useState<WebContainer | null>(null);

  useEffect(() => {
    WebContainer.boot().then(async (instance) => {
      webcontainerInstanceRef.current = instance;
      await instance.mount(files);
      setWebcontainerInstance(instance);
    });
  }, []);

  return (
    <WebContainerContext value={webcontainerInstance}>
      {children}
    </WebContainerContext>
  );
};

export const useWebContainer = (): WebContainer | null => {
  const webcontainerInstance = useContext(WebContainerContext);

  return webcontainerInstance;
};
