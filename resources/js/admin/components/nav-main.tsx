import * as React from "react"

import { Link, usePage } from "@inertiajs/react"
import { ChevronRightIcon, type LucideIcon } from "lucide-react"

import {OnboardingMenuHint, type MenuHint} from '@/components/onboarding/menu-hint';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export interface NavSubItem {
  title: string
  url: string
  /** Счётчик у пункта; 0 и undefined бейдж не рисуют. */
  badge?: number
}

export interface NavItem {
  title: string
  /** Не задан у пунктов-групп: они не ведут на страницу, а раскрывают вложенный список. */
  url?: string
  icon?: LucideIcon
  hint?: MenuHint
  items?: NavSubItem[]
  /** Счётчик у пункта; у группы — сумма по вложенным. */
  badge?: number
}

const MAX_BADGE_COUNT = 99

function NavBadge({count}: {count: number | undefined}) {
  if (!count) {
    return null
  }

  return (
    <SidebarMenuBadge className="static ml-auto rounded-full bg-primary/10 text-primary">
      {count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : count}
    </SidebarMenuBadge>
  )
}

function isActiveUrl(currentUrl: string, url: string): boolean {
  return currentUrl === url || currentUrl.startsWith(`${url}/`)
}

/**
 * Пункт с вложенным списком. Раскрытие держим на локальном стейте:
 * Collapsible из Radix в проект не подключён, а поведение тут простое.
 */
function NavGroupItem({ item, currentUrl }: { item: NavItem; currentUrl: string }) {
  const subItems = item.items ?? []
  const hasActiveChild = subItems.some((subItem) => isActiveUrl(currentUrl, subItem.url))
  const [isOpen, setIsOpen] = React.useState(hasActiveChild)

  // Переход на вложенную страницу должен раскрывать группу, даже если её свернули руками.
  React.useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true)
    }
  }, [hasActiveChild])

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-expanded={isOpen}
        isActive={hasActiveChild ? !isOpen : false}
        tooltip={item.title}
        onClick={() => {
          setIsOpen((previous) => !previous)
        }}
      >
        {!!item.icon && <item.icon />}
        <span>{item.title}</span>
        {isOpen ? null : <NavBadge count={item.badge} />}
        <ChevronRightIcon
          className={cn("ml-auto transition-transform duration-200", isOpen && "rotate-90")}
        />
      </SidebarMenuButton>
      {isOpen ? (
        <SidebarMenuSub>
          {subItems.map((subItem) => (
            <SidebarMenuSubItem key={subItem.url}>
              <SidebarMenuSubButton asChild isActive={isActiveUrl(currentUrl, subItem.url)}>
                <Link href={subItem.url}>
                  <span>{subItem.title}</span>
                  <NavBadge count={subItem.badge} />
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  )
}

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  const { url: currentUrl } = usePage()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) =>
            item.items?.length ? (
              <NavGroupItem key={item.title} currentUrl={currentUrl} item={item} />
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={!!item.url && isActiveUrl(currentUrl, item.url)}
                  tooltip={item.title}
                >
                  <Link href={item.url ?? "#"}>
                    {!!item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <NavBadge count={item.badge} />
                  </Link>
                </SidebarMenuButton>
                {item.hint ? <OnboardingMenuHint hint={item.hint}/> : null}
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
