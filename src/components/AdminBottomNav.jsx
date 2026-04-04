import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Images } from 'lucide-react'

const tabs = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/portfolio-photos', label: 'Portfolio Photos', icon: Images },
]

export default function AdminBottomNav() {
  const { pathname } = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-orange-200 bg-[#fdf6f0] shadow-[0_-2px_16px_rgba(194,87,11,0.08)]">
      <div className="flex mx-auto max-w-screen-xl">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              to={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors relative ${
                active ? 'text-[#C2570B]' : 'text-gray-500 hover:text-[#C2570B]'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#C2570B] rounded-b-full" />
              )}
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
