import * as React from "react"

import {
    CameraIcon,
    ClipboardListIcon,
    DatabaseIcon,
    FileCodeIcon,
    FileIcon,
    FileTextIcon,
    FolderOpenIcon,
    ImageIcon,
    InboxIcon,
    LayoutDashboardIcon,
    ListTreeIcon,
    PackageIcon,
    SettingsIcon,
    ShoppingCartIcon,
    SlidersHorizontalIcon,
    StoreIcon,
    UserIcon,
} from "lucide-react"

import {NavMain} from "@/components/nav-main"
import {NavSecondary} from "@/components/nav-secondary"
import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {useLang} from "@/lib/lang"
import {can, Permission} from "@/lib/permissions"
import type {User} from "@/types/inertia"

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

export function AppSidebar({user, ...props}: AppSidebarProps) {
    const {t} = useLang()

    const navMain = [
        {
            title: t('admin.nav.dashboard'),
            url: "/admin/dashboard",
            icon: LayoutDashboardIcon,
        },
        // Users - requires read_users permission
        ...(can(user, Permission.READ_USERS) ? [{
            title: t('admin.nav.users'),
            url: "/admin/users",
            icon: UserIcon,
        }] : []),
        // Brands - requires read_brands permission (admin only)
        ...(can(user, Permission.READ_BRANDS) ? [{
            title: t('admin.nav.brands'),
            url: "/admin/brands",
            icon: StoreIcon,
        }] : []),
        // Categories - requires write_categories permission (admin only)
        ...(can(user, Permission.WRITE_CATEGORIES) ? [{
            title: t('admin.nav.categories'),
            url: "/admin/categories",
            icon: ListTreeIcon,
        }] : []),
        // Collections - requires write_collections permission (admin only)
        ...(can(user, Permission.WRITE_COLLECTIONS) ? [{
            title: t('admin.nav.collections'),
            url: "/admin/collections",
            icon: FolderOpenIcon,
        }] : []),
        // Options - requires write_options permission (admin only)
        ...(can(user, Permission.WRITE_OPTIONS) ? [{
            title: t('admin.nav.options'),
            url: "/admin/options",
            icon: SlidersHorizontalIcon,
        }] : []),
        // Media - requires read_images permission (manager only)
        ...(can(user, Permission.READ_IMAGES) ? [{
            title: t('admin.nav.media'),
            url: "/admin/media",
            icon: ImageIcon,
        }] : []),
        // Products - requires read_products permission (manager only)
        ...(can(user, Permission.READ_PRODUCTS) ? [{
            title: t('admin.nav.products'),
            url: "/admin/products",
            icon: PackageIcon,
        }] : []),
        // Orders - requires read_orders permission (manager only)
        ...(can(user, Permission.READ_ORDERS) ? [{
            title: t('admin.nav.orders'),
            url: "/admin/orders",
            icon: ShoppingCartIcon,
        }] : []),
        // Brand Requests - requires read_brand_requests permission (admin only)
        ...(can(user, Permission.READ_BRAND_REQUESTS) ? [{
            title: t('admin.nav.brand_requests'),
            url: "/admin/brand-requests",
            icon: InboxIcon,
        }] : []),
    ]

    const data = {
        navMain,
        navClouds,
        navSecondary: [
            {
                title: t('admin.nav.settings'),
                url: "/admin/settings",
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
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <button type="button">
                                <span className="text-base font-semibold">SPRABY</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain}/>
                {/*<NavDocuments items={data.documents} />*/}
                <NavSecondary className="mt-auto" items={data.navSecondary}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={navUserData}/>
            </SidebarFooter>
        </Sidebar>
    )
}
