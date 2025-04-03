import { createServerFn } from "@tanstack/react-start"
import { files } from "@/test-cases/files";

// TODO: make this static when the bug is fixed: https://github.com/TanStack/router/issues/3823
export const getContainerFiles = createServerFn(/*{ type: 'static' }*/).handler(async () => {
  try {
    return files;
  } catch (error) {
    console.error(error);
    return { error: error as string };
  }
});
