import React, { useState, useEffect } from 'react'
import { Shield, Package } from 'lucide-react'
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
  admin_notes?: string
  user_id: string
  profiles?: {
    full_name: string
    phone: string
    telegram_id: string
  }
}

export default function AdminPage() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [sketchFile, setSketchFile] = useState<File | null>(null)

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchOrders()
    }
  }, [profile])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            full_name,
            phone,
            telegram_id
          )
        `)
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

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)

      if (error) throw error

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      ))

      toast.success('Заказ обновлен')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Ошибка обновления заказа')
    }
  }

  const uploadSketch = async (orderId: string, file: File) => {
    try {
      const fileName = `sketch-${orderId}-${Date.now()}.${file.name.split('.').pop()}`
      const { data, error } = await supabase.storage
        .from('sketches')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('sketches')
        .getPublicUrl(fileName)

      await updateOrder(orderId, { sketch_url: publicUrl })
      setSketchFile(null)
    } catch (error) {
      console.error('Error uploading sketch:', error)
      toast.error('Ошибка загрузки эскиза')
    }
  }

  const handleOrderUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    const updates: Partial<Order> = {}
    
    if (adminNotes !== selectedOrder.admin_notes) {
      updates.admin_notes = adminNotes
    }
    
    if (newStatus && newStatus !== selectedOrder.status) {
      updates.status = newStatus as any
    }

    if (Object.keys(updates).length > 0) {
      await updateOrder(selectedOrder.id, updates)
    }

    if (sketchFile) {
      await uploadSketch(selectedOrder.id, sketchFile)
    }

    setSelectedOrder(null)
    setAdminNotes('')
    setNewStatus('')
  }

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order)
    setAdminNotes(order.admin_notes || '')
    setNewStatus(order.status)
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            У вас нет прав администратора
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 section-padding">
      <div className="container-max">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary-500 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Панель администратора
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Управление заказами и клиентами
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Всего заказов</p>
            </div>
            <div className="card text-center">
              <Package className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'pending').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Ожидают</p>
            </div>
            <div className="card text-center">
              <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'processing').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">В работе</p>
            </div>
            <div className="card text-center">
              <Package className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'ready').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Готовы</p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Все заказы
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Заказ
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Клиент
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Услуга
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Статус
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Сумма
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              #{order.order_number}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {order.profiles?.full_name || 'Не указано'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.profiles?.phone || 'Нет телефона'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-gray-900 dark:text-white">
                              {order.service_type}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.size} • {order.material}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' :
                            order.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
                          }`}>
                            {order.status === 'pending' ? 'Ожидает' :
                             order.status === 'processing' ? 'В работе' :
                             order.status === 'ready' ? 'Готов' :
                             order.status === 'completed' ? 'Завершен' :
                             'Отменен'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {order.price} ₽
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                          >
                            Управление
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Заказ #{selectedOrder.order_number}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleOrderUpdate} className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Клиент
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedOrder.profiles?.full_name || 'Не указано'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Телефон
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedOrder.profiles?.phone || 'Не указан'}
                    </p>
                  </div>
                </div>

                {/* Photos */}
                {selectedOrder.photo_urls.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Фотографии
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedOrder.photo_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Статус
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="pending">Ожидает обработки</option>
                    <option value="processing">В работе</option>
                    <option value="ready">Готов</option>
                    <option value="completed">Завершен</option>
                    <option value="cancelled">Отменен</option>
                  </select>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Комментарии администратора
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Добавьте комментарий..."
                  />
                </div>

                {/* Sketch Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Загрузить эскиз
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSketchFile(e.target.files?.[0] || null)}
                    className="input-field"
                  />
                  {selectedOrder.sketch_url && (
                    <div className="mt-2">
                      <a
                        href={selectedOrder.sketch_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                      >
                        Посмотреть текущий эскиз
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Сохранить изменения
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="btn-secondary flex-1"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}