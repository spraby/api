import * as React from "react"

import {
    ChevronDownIcon,
    ExternalLinkIcon,
    InstagramIcon,
    LifeBuoyIcon,
    NewspaperIcon,
    SendIcon,
    type LucideIcon,
} from "lucide-react"

import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {SidebarMenuButton, SidebarMenuItem, useSidebar} from "@/components/ui/sidebar"
import {useLang} from "@/lib/lang"

const NEWS_URL = "https://t.me/spraby_update"

const SUPPORT_CHANNELS: { title: string, handle: string, url: string, icon: LucideIcon }[] = [
    {title: "Telegram", handle: "@spraby", url: "https://t.me/spraby", icon: SendIcon},
    {title: "Instagram", handle: "@spra.by", url: "https://www.instagram.com/spra.by", icon: InstagramIcon},
]

/**
 * News channel and support contacts for managers. Rendered inside the
 * sidebar's secondary menu, under "Settings". All links leave the admin, so
 * they open in a new tab without handing it a window.opener.
 */
export function NavManagerLinks() {
    const {t} = useLang()
    const {isMobile} = useSidebar()
    const [supportOpen, setSupportOpen] = React.useState(false)

    return (
        <>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <a href={NEWS_URL} rel="noopener noreferrer" target="_blank">
                        <NewspaperIcon/>
                        <span>{t('admin.nav.news')}</span>
                        <ExternalLinkIcon className="ml-auto text-muted-foreground"/>
                    </a>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
                <Popover open={supportOpen} onOpenChange={setSupportOpen}>
                    <PopoverTrigger asChild>
                        <SidebarMenuButton isActive={supportOpen}>
                            <LifeBuoyIcon/>
                            <span>{t('admin.nav.support')}</span>
                            <ChevronDownIcon
                                className={`ml-auto text-muted-foreground transition-transform ${supportOpen ? "rotate-180" : ""}`}
                            />
                        </SidebarMenuButton>
                    </PopoverTrigger>
                    <PopoverContent
                        align="end"
                        className="w-72 rounded-xl p-0"
                        side={isMobile ? "top" : "right"}
                        sideOffset={8}
                    >
                        <div className="border-b px-4 py-3 text-sm font-semibold">
                            {t('admin.nav.support')}
                        </div>
                        <ul className="flex flex-col gap-1 p-2">
                            {SUPPORT_CHANNELS.map((channel) => (
                                <li key={channel.url}>
                                    <a
                                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                                        href={channel.url}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        onClick={() => { setSupportOpen(false) }}
                                    >
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <channel.icon className="size-5"/>
                                        </span>
                                        <span className="flex min-w-0 flex-col">
                                            <span className="text-sm font-medium">{channel.title}</span>
                                            <span className="truncate text-xs text-muted-foreground">{channel.handle}</span>
                                        </span>
                                        <ExternalLinkIcon className="ml-auto size-4 shrink-0 text-muted-foreground"/>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </PopoverContent>
                </Popover>
            </SidebarMenuItem>
        </>
    )
}
