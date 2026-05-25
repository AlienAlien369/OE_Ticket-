// ============================================================
// DASHBOARD LAYOUT — sidebar + topbar + content area
// Features: collapsible sidebar, RBAC nav items, theme toggle
// ============================================================

import { memo, useState, useCallback } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShieldCheck,
  UserPlus,
  Printer,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { useLogout } from '@features/auth/hooks/use-auth'
import { useAuthStore } from '@features/auth/store/auth.store'
import { ThemeToggle } from '@components/ui/ThemeToggle'
import { UserAvatar } from '@components/ui/UserAvatar'
import { ROUTES, PAGES } from '@config/index'
import { cn } from '@utils/cn'

// All possible nav items keyed by page
const ALL_NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    pageKey: null, // always visible when logged in
  },
  {
    label: 'New Token',
    href: ROUTES.CREATE_PROFILE,
    icon: UserPlus,
    pageKey: PAGES.NEW_TOKEN.key,
  },
  {
    label: 'Print',
    href: ROUTES.PRINT,
    icon: Printer,
    pageKey: PAGES.PRINT.key,
  },
  {
    label: 'Access Control',
    href: ROUTES.ACCESS_CONTROL,
    icon: ShieldCheck,
    pageKey: PAGES.ACCESS_CONTROL.key,
  },
]

// ---- Sidebar nav item ----
const SidebarNavItem = memo(
  ({ item, isCollapsed }: { item: typeof ALL_NAV_ITEMS[0]; isCollapsed: boolean }) => {
    const location = useLocation()
    const isActive =
      item.href === ROUTES.DASHBOARD
        ? location.pathname === ROUTES.DASHBOARD
        : location.pathname.startsWith(item.href)

    return (
      <NavLink
        to={item.href}
        end={item.href === ROUTES.DASHBOARD}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2 rounded-lg',
          'text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-primary text-primary-foreground shadow-glow-sm'
            : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <item.icon
          className={cn(
            'w-4.5 h-4.5 shrink-0',
            isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
          )}
        />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {isActive && !isCollapsed && (
          <ChevronRight className="ml-auto w-3.5 h-3.5 text-primary-foreground/60" />
        )}
        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div
            className={cn(
              'absolute left-full ml-2 px-2 py-1 rounded-md z-50',
              'bg-popover text-popover-foreground text-xs font-medium',
              'shadow-md border border-border',
              'opacity-0 group-hover:opacity-100 pointer-events-none',
              'transition-opacity duration-150 whitespace-nowrap'
            )}
          >
            {item.label}
          </div>
        )}
      </NavLink>
    )
  }
)
SidebarNavItem.displayName = 'SidebarNavItem'

// ---- Sidebar ----
const Sidebar = memo(
  ({
    isCollapsed,
    onToggle,
    isMobileOpen,
    onMobileClose,
  }: {
    isCollapsed: boolean
    onToggle: () => void
    isMobileOpen: boolean
    onMobileClose: () => void
  }) => {
    const { user, canAccessPage } = useAuthStore()
    const { mutate: logout } = useLogout()

    // Filter nav items based on page permissions
    const visibleItems = ALL_NAV_ITEMS.filter(
      (item) => item.pageKey === null || canAccessPage(item.pageKey)
    )

    const sidebarContent = (
      <div
        className={cn(
          'flex flex-col h-full',
          'bg-sidebar border-r border-sidebar-border',
          'transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" fill="currentColor" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-sidebar-foreground tracking-tight"
                >
                  OE Ticket
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={onToggle}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            onClick={onMobileClose}
            className="md:hidden flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
          {visibleItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-lg',
              'hover:bg-accent transition-colors cursor-pointer'
            )}
          >
            <UserAvatar user={user} size="sm" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => logout()}
            className={cn(
              'mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg',
              'text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10',
              'transition-colors duration-150'
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    )

    return (
      <>
        {/* Desktop sidebar */}
        <aside className="hidden md:flex h-screen sticky top-0">{sidebarContent}</aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onMobileClose}
                className="fixed inset-0 z-40 bg-black/60 md:hidden"
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 z-50 h-full md:hidden"
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }
)
Sidebar.displayName = 'Sidebar'

// ---- Top bar ----
const Topbar = memo(({ onMenuClick }: { onMenuClick: () => void }) => {
  const location = useLocation()

  const pageTitle =
    ALL_NAV_ITEMS.find((item) =>
      item.href === ROUTES.DASHBOARD
        ? location.pathname === ROUTES.DASHBOARD
        : location.pathname.startsWith(item.href)
    )?.label ?? 'OE Ticket'

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="md:hidden flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
        </button>
      </div>
    </header>
  )
})
Topbar.displayName = 'Topbar'

// ============================================================
// MAIN DASHBOARD LAYOUT
// ============================================================
export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleToggle = useCallback(() => setIsCollapsed((c) => !c), [])
  const handleMobileClose = useCallback(() => setIsMobileOpen(false), [])
  const handleMenuClick = useCallback(() => setIsMobileOpen(true), [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
        isMobileOpen={isMobileOpen}
        onMobileClose={handleMobileClose}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
