import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { WebContainerProvider } from '../contexts/WebContainerContext'
import appCss from "@/styles/app.css?url";
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ContainerFilesProvider } from '@/contexts/ContainerFilesContext';

const RootComponent = () => {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <ContainerFilesProvider>
          <WebContainerProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 flex flex-col">
                <header className="flex flex-row justify-start px-4 py-2">
                  <SidebarTrigger />
                </header>
                <div className="flex-1">
                  {children}
                </div>
              </main>
            </SidebarProvider>
          </WebContainerProvider>
        </ContainerFilesProvider>
        <Scripts />
      </body>
    </html>
  )
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'React Testing Playbook',
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
})
