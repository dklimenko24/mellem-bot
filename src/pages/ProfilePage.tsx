import { useState, useEffect } from 'react'
import { User, Package, Settings, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface Order {
  id: string
  order_number: string
  service_type: string
  size: string
  material: string
  price: number
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'
  created_at: string
  photo_urls: string[]
  sketch_url?: string
}

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    telegram_id: profile?.telegram_id || '',
  })

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        telegram_id: profile.telegram_id || '',
      })
    }
  }, [profile])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Ошибка загрузки заказов')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      setEditMode(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Ошибка обновления профиля')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400'
      case 'processing':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400'
      case 'ready':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400'
      case 'completed':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает обработки'
      case 'processing':
        return 'В работе'
      case 'ready':
        return 'Готов'
      case 'completed':
        return 'Завершен'
      case 'cancelled':
        return 'Отменен'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'processing':
        return <Settings className="w-4 h-4 animate-spin" />
      case 'ready':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Необходима авторизация
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Войдите в систему для просмотра профиля
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 section-padding">
      <div className="container-max">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary-500 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Личный кабинет
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Управляйте своими заказами и настройками профиля
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Профиль
                  </h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    {editMode ? 'Отмена' : 'Редактировать'}
                  </button>
                </div>

                {editMode ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Полное имя
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telegram ID
                      </label>
                      <input
                        type="text"
                        value={formData.telegram_id}
                        onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full">
                      Сохранить
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Полное имя
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {profile?.full_name || 'Не указано'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Телефон
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {profile?.phone || 'Не указан'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Telegram ID
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {profile?.telegram_id || 'Не указан'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Orders */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Мои заказы
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Всего: {orders.length}
                  </span>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="loading-spinner" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Заказов пока нет
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Создайте свой первый заказ в калькуляторе стоимости
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              Заказ #{order.order_number}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-2">{getStatusText(order.status)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Услуга
                            </label>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {order.service_type}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Размер
                            </label>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {order.size}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Материал
                            </label>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {order.material}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {order.photo_urls.length > 0 && (
                              <div className="flex -space-x-2">
                                {order.photo_urls.slice(0, 3).map((url, index) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt={`Photo ${index + 1}`}
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-800 object-cover"
                                  />
                                ))}
                                {order.photo_urls.length > 3 && (
                                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                    +{order.photo_urls.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                            {order.sketch_url && (
                              <a
                                href={order.sketch_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                              >
                                Посмотреть эскиз
                              </a>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {order.price} ₽
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}