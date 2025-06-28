import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, ArrowRight, Upload, Check } from 'lucide-react'
import { useOrder } from '../contexts/OrderContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const SIZES = [
  '9×12', '10×15', '11×15', '13×18', '15×20', '16×22', '18×24', '20×25',
  '20×30', '24×30', '24×34', '25×35', '30×40', '30×45', '30×50', '30×60',
  '35×45', '40×50', '40×60', '40×70', '45×60', '50×70', '55×80', '60×80',
  '60×90', '60×100', '60×120', '70×90', '100×70', '120×50', '120×70',
  '120×80', '130×60', '130×70', '140×60', '140×70', '150×60', '150×70',
  '150×80', '160×60', '160×70', '170×50', '170×60', '170×70', '180×60',
  '180×80', '180×90', '190×90', '200×80', '200×90'
]

const MATERIALS = [
  { id: 'ceramic-russia', name: 'Керамогранит (Россия)', description: 'Качественный российский керамогранит' },
  { id: 'ceramic-italy', name: 'Керамогранит (Италия)', description: 'Премиальный итальянский керамогранит' },
  { id: 'glass', name: 'Стекло', description: 'Закаленное стекло высокого качества' },
  { id: 'metal', name: 'Металл', description: 'Металлическая основа с покрытием' },
]

const SERVICES = [
  { id: 'photoceramics', name: 'Фотокерамика', description: 'Печать портрета на керамике' },
  { id: 'ceramic-portrait', name: 'Портрет на керамограните', description: 'Долговечный портрет на керамограните' },
  { id: 'plate-only', name: 'Только табличка', description: 'Табличка без портрета', fixedPrice: 600 },
]

export default function CalculatorPage() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [retouch, setRetouch] = useState('none')
  const [oldPhotoImprovement, setOldPhotoImprovement] = useState(false)
  const [qrBiography, setQrBiography] = useState(false)
  const [subscription, setSubscription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const { updateOrder, calculatePrice } = useOrder()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    updateOrder({ 
      serviceType: serviceId,
      options: { plateOnly: serviceId === 'plate-only' }
    })
    setStep(2)
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    updateOrder({ size })
    setStep(3)
  }

  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterial(materialId)
    updateOrder({ material: materialId })
    setStep(4)
  }

  const handleOptionsUpdate = () => {
    updateOrder({
      options: {
        retouch,
        oldPhotoImprovement,
        qrBiography,
        subscription,
        plateOnly: selectedService === 'plate-only'
      }
    })
    setStep(5)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setPhotos(prev => [...prev, ...files])
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitOrder = async () => {
    if (!user) {
      toast.error('Необходимо войти в систему')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      // Upload photos
      const photoUrls: string[] = []
      for (const photo of photos) {
        const fileName = `${Date.now()}-${photo.name}`
        const { data, error } = await supabase.storage
          .from('order-photos')
          .upload(fileName, photo)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('order-photos')
          .getPublicUrl(fileName)

        photoUrls.push(publicUrl)
      }

      // Create order
      const orderNumber = `ORD-${Date.now()}`
      const price = calculatePrice()

      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          service_type: selectedService,
          size: selectedSize,
          material: selectedMaterial,
          price,
          options: {
            retouch,
            oldPhotoImprovement,
            qrBiography,
            subscription,
            plateOnly: selectedService === 'plate-only'
          },
          photo_urls: photoUrls,
          status: 'pending'
        })

      if (error) throw error

      toast.success('Заказ успешно создан!')
      
      // Send to WhatsApp
      const message = `Новый заказ ${orderNumber}
Услуга: ${SERVICES.find(s => s.id === selectedService)?.name}
Размер: ${selectedSize}
Материал: ${MATERIALS.find(m => m.id === selectedMaterial)?.name}
Стоимость: ${price} ₽`

      window.open(`https://wa.me/79999999999?text=${encodeURIComponent(message)}`, '_blank')
      
      navigate('/profile')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Ошибка при создании заказа')
    } finally {
      setLoading(false)
    }
  }

  const currentPrice = calculatePrice()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 section-padding">
      <div className="container-max">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="w-8 h-8 text-primary-500 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Калькулятор стоимости
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Рассчитайте стоимость вашего заказа за несколько шагов
            </p>
          </div>

          {/* Progress */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                  </div>
                  {stepNumber < 5 && (
                    <div className={`w-8 h-0.5 ${
                      step > stepNumber ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Шаг {step} из 5
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="card">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Выберите услугу
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {SERVICES.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-200 text-left group"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {service.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {service.description}
                      </p>
                      {service.fixedPrice && (
                        <p className="text-primary-600 dark:text-primary-400 font-semibold">
                          {service.fixedPrice} ₽
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Выберите размер
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-200 text-center group"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {size}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Выберите материал
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {MATERIALS.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => handleMaterialSelect(material.id)}
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-200 text-left group"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {material.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {material.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Дополнительные опции
                </h2>
                <div className="space-y-6">
                  {/* Retouch */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Ретушь фото
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { value: 'none', label: 'Без ретуши', price: 0 },
                        { value: 'basic', label: 'Обычная', price: 300 },
                        { value: 'advanced', label: 'Сложная', price: 600 },
                        { value: 'reconstruction', label: 'Реконструкция лица', price: 1000 },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700">
                          <input
                            type="radio"
                            name="retouch"
                            value={option.value}
                            checked={retouch === option.value}
                            onChange={(e) => setRetouch(e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {option.price > 0 ? `+${option.price} ₽` : 'Бесплатно'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional options */}
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700">
                      <input
                        type="checkbox"
                        checked={oldPhotoImprovement}
                        onChange={(e) => setOldPhotoImprovement(e.target.checked)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Улучшение старого фото
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          +400 ₽
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700">
                      <input
                        type="checkbox"
                        checked={qrBiography}
                        onChange={(e) => setQrBiography(e.target.checked)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          QR-биография
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          +500 ₽
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Subscription for wholesalers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Подписка для оптовиков
                    </label>
                    <select
                      value={subscription}
                      onChange={(e) => setSubscription(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Не выбрано</option>
                      <option value="10">10 эскизов - 2700 ₽</option>
                      <option value="30">30 эскизов - 7500 ₽</option>
                      <option value="60">60 эскизов - 13800 ₽</option>
                      <option value="100">100 эскизов - 20000 ₽</option>
                    </select>
                  </div>

                  <button
                    onClick={handleOptionsUpdate}
                    className="btn-primary w-full"
                  >
                    Продолжить
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Загрузите фотографии
                </h2>
                
                <div className="mb-6">
                  <label className="block w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-200">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Нажмите для выбора файлов
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Поддерживаются форматы: JPG, PNG, WEBP
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Загруженные фото ({photos.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors duration-200"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Итого к оплате
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Услуга:</span>
                      <span className="text-gray-900 dark:text-white">
                        {SERVICES.find(s => s.id === selectedService)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Размер:</span>
                      <span className="text-gray-900 dark:text-white">{selectedSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Материал:</span>
                      <span className="text-gray-900 dark:text-white">
                        {MATERIALS.find(m => m.id === selectedMaterial)?.name}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900 dark:text-white">Общая стоимость:</span>
                        <span className="text-primary-600 dark:text-primary-400">
                          {currentPrice} ₽
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={loading || photos.length === 0}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="loading-spinner mx-auto" />
                  ) : (
                    <>
                      Оформить заказ
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}