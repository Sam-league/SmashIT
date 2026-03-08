'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, BarChart2, Users, User } from 'lucide-react'

const tabs = [
  { label: 'Home',  href: '/dashboard',   icon: Home },
  { label: 'Tasks', href: '/tasks',        icon: CheckSquare },
  { label: 'Stats', href: '/analytics',    icon: BarChart2 },
  { label: 'Social',href: '/leaderboard',  icon: Users },
  { label: 'Me',    href: '/profile',      icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[52px]"
            >
              <Icon
                size={22}
                className={active ? 'text-dark' : 'text-muted'}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-medium leading-none ${
                  active ? 'text-dark' : 'text-muted'
                }`}
              >
                {label}
              </span>
              {/* active dot */}
              <span
                className={`w-1 h-1 rounded-full mt-0.5 transition-all ${
                  active ? 'bg-accent' : 'bg-transparent'
                }`}
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
