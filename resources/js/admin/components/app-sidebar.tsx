import * as React from "react"

import {
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useLang } from "@/lib/lang"
import type { User } from "@/types/inertia"

const navClouds = [
  {
    title: "Capture",
    icon: CameraIcon,
    isActive: true,
    url: "#",
    items: [
      {
        title: "Active Proposals",
        url: "#",
      },
      {
        title: "Archived",
        url: "#",
      },
    ],
  },
  {
    title: "Proposal",
    icon: FileTextIcon,
    url: "#",
    items: [
      {
        title: "Active Proposals",
        url: "#",
      },
      {
        title: "Archived",
        url: "#",
      },
    ],
  },
  {
    title: "Prompts",
    icon: FileCodeIcon,
    url: "#",
    items: [
      {
        title: "Active Proposals",
        url: "#",
      },
      {
        title: "Archived",
        url: "#",
      },
    ],
  },
]

const documents = [
  {
    name: "Data Library",
    url: "#",
    icon: DatabaseIcon,
  },
  {
    name: "Reports",
    url: "#",
    icon: ClipboardListIcon,
  },
  {
    name: "Word Assistant",
    url: "#",
    icon: FileIcon,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { t } = useLang()

  const data = {
    navMain: [
      {
        title: t('admin.nav.dashboard'),
        url: "/sb/admin/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: t('admin.nav.products'),
        url: "/sb/admin/products",
        icon: PackageIcon,
      },
      {
        title: t('admin.nav.users'),
        url: "/sb/admin/users",
        icon: UserIcon,
      },
    ],
    navClouds,
    navSecondary: [
      {
        title: t('admin.nav.settings'),
        url: "#",
        icon: SettingsIcon,
      },
    ],
    documents,
  }
  // Prepare user data for NavUser component with default avatar
  const navUserData = user
    ? {
        name: `${user.first_name} ${user.last_name}`.trim() || user.email,
        email: user.email,
        avatar: "/avatars/default.jpg", // Default avatar since User type doesn't have avatar field
      }
    : {
        name: "Guest",
        email: "guest@example.com",
        avatar: "/avatars/default.jpg",
      }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <button type="button">
                <span className="text-base font-semibold">SPRABY</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/*<NavDocuments items={data.documents} />*/}
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUserData} />
      </SidebarFooter>
    </Sidebar>
  )
}
