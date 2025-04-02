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

const TEST_CASES = [
  { id: "basic-render", label: "Basic render" },
  { id: "get-by-text", label: "Get by text" },
  { id: "get-by-role", label: "Get by role" },
  { id: "get-by-label-text", label: "Get by label text" },
  { id: "get-by-placeholder-text", label: "Get by placeholder text" },
  { id: "find-by-text", label: "Find by text (async)" },
]

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
              {TEST_CASES.map((testCase) => (
                <SidebarMenuItem key={testCase.id}>
                  <Link
                    to="/tests/$testCaseId"
                    params={{ testCaseId: testCase.id }}
                    className="block rounded p-2 hover:translate-x-1 focus:translate-x-1 hover:bg-gray-100 focus:bg-gray-100 transition-[background-color,transform]"
                  >
                    {testCase.label}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
