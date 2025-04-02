import { createContext, useContext, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getContainerFiles } from "@/server-functions/getContainerFiles";

interface ContainerFilesContextValue {
  files: Record<string, { file: { contents: string } }>;
}

const ContainerFilesContext = createContext<ContainerFilesContextValue>({
  files: {}
});

export const ContainerFilesProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [files, setFiles] = useState<Record<string, { file: { contents: string } }>>({});
  const filesFn = useServerFn(getContainerFiles);

  useEffect(() => {
    filesFn().then(setFiles).catch(console.error).finally(() => setReady(true));
  }, []);

  return (
    <ContainerFilesContext.Provider value={{ files }}>
      {ready ? children : null}
    </ContainerFilesContext.Provider>
  );
};

export const useContainerFiles = () => {
  return useContext(ContainerFilesContext);
};