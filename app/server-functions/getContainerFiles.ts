import { createServerFn } from "@tanstack/react-start"
import { files } from "public/test-cases/files";

// TODO: make this static when the bug is fixed: https://github.com/TanStack/router/issues/3823
export const getContainerFiles = createServerFn(/*{ type: 'static' }*/).handler(async () => {
  return files;
});
