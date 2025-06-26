'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { 
    name: 'Дашборд', 
    href: '/admin/dashboard', 
    icon: '📊',
    description: 'Общая статистика'
  },
  { 
    name: 'Пользователи', 
    href: '/admin/users', 
    icon: '👥',
    description: 'Управление пользователями'
  },
  { 
    name: 'Контент', 
    href: '/admin/content', 
    icon: '📝',
    description: 'Управление контентом'
  },
  { 
    name: 'Заказы', 
    href: '/admin/orders', 
    icon: '🛒',
    description: 'Управление заказами'
  },
  { 
    name: 'Аналитика', 
    href: '/admin/analytics', 
    icon: '📈',
    description: 'Отчеты и аналитика'
  },
  { 
    name: 'Настройки', 
    href: '/admin/settings', 
    icon: '⚙️',
    description: 'Настройки системы'
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="flex flex-col flex-1">
        {/* Logo/Header */}
        <div className="flex items-center justify-center h-16 px-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Админ панель</h2>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200'
                )}
                title={item.description}
              >
                <span className="mr-3 text-lg flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-1 bg-blue-700 rounded-full"></div>
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Версия 1.0.0
          </div>
        </div>
      </div>
    </div>
  )
}
