import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

// Компоненты для статистики
function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  positive = true 
}: {
  title: string
  value: string | number
  change: string
  icon: string
  positive?: boolean
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${
          positive ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
        <span className="text-sm text-gray-500 ml-1">за последний месяц</span>
      </div>
    </div>
  )
}

function RecentActivity() {
  const activities = [
    { id: 1, action: 'Новая регистрация', user: 'john@example.com', time: '2 мин назад' },
    { id: 2, action: 'Новый заказ', user: 'admin@site.com', time: '15 мин назад' },
    { id: 3, action: 'Обновление профиля', user: 'user@test.com', time: '1 час назад' },
    { id: 4, action: 'Отмена заказа', user: 'customer@mail.com', time: '2 часа назад' },
  ]

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Последняя активность</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.user}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Посмотреть всю активность →
          </button>
        </div>
      </div>
    </div>
  )
}

function QuickActions() {
  const actions = [
    { name: 'Добавить пользователя', href: '/admin/users/new', icon: '👤', color: 'bg-blue-500' },
    { name: 'Создать контент', href: '/admin/content/new', icon: '📝', color: 'bg-green-500' },
    { name: 'Просмотр заказов', href: '/admin/orders', icon: '🛒', color: 'bg-yellow-500' },
    { name: 'Настройки', href: '/admin/settings', icon: '⚙️', color: 'bg-gray-500' },
  ]

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Быстрые действия</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200 group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-xl mb-2 group-hover:scale-105 transition-transform duration-200`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{action.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  // Получаем статистику (пока моковые данные, потом замените на реальные запросы)
  const stats = {
    totalUsers: 1247,
    totalOrders: 89,
    totalRevenue: 245680,
    activeUsers: 156
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600 mt-1">
          Добро пожаловать, {session.user.email}! Вот обзор вашей системы.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего пользователей"
          value={stats.totalUsers.toLocaleString()}
          change="+12%"
          icon="👥"
          positive={true}
        />
        <StatCard
          title="Заказы"
          value={stats.totalOrders}
          change="+8%"
          icon="🛒"
          positive={true}
        />
        <StatCard
          title="Доход"
          value={`₽${stats.totalRevenue.toLocaleString()}`}
          change="+23%"
          icon="💰"
          positive={true}
        />
        <StatCard
          title="Активные пользователи"
          value={stats.activeUsers}
          change="-2%"
          icon="📊"
          positive={false}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        
        {/* Quick Actions - takes 1 column */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-blue-600 text-2xl mr-3">💡</div>
          <div>
            <h3 className="text-lg font-medium text-blue-900">Совет дня</h3>
            <p className="text-blue-700 mt-1">
              Регулярно проверяйте активность пользователей и анализируйте метрики для улучшения работы сайта.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}