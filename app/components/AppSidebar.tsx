import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"

export const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="p-2 hover:bg-gray-100 focus:bg-gray-100 transition-colors">
          <h1 className="text-2xl">React Testing Playbook</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Test cases</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/tests/basic-render">Basic render</Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link to="/tests/get-by-text">Get by text</Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
