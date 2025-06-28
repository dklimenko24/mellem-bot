import { createContext, useContext, useState } from 'react'

export interface OrderData {
  serviceType: string
  size: string
  material: string
  price: number
  options: {
    retouch?: 'none' | 'basic' | 'advanced' | 'reconstruction'
    oldPhotoImprovement?: boolean
    qrBiography?: boolean
    plateOnly?: boolean
    subscription?: string
    [key: string]: any
  }
  photoUrls: string[]
  customText?: string
}

interface OrderContextType {
  orderData: OrderData
  updateOrder: (data: Partial<OrderData>) => void
  resetOrder: () => void
  calculatePrice: () => number
}

const defaultOrder: OrderData = {
  serviceType: '',
  size: '',
  material: '',
  price: 0,
  options: {},
  photoUrls: [],
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function useOrder() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}

// Фиксированные цены
const FIXED_PRICES: Record<string, number> = {
  "13×18": 800,
  "18×24": 1300,
  "20×30": 1900,
  "24×30": 2400,
  "30×40": 3700,
  "40×60": 6100,
  "50×70": 12100,
  "55×80": 16100,
  "60×100": 25100,
  "60×120": 27100,
  "100×70": 43100,
  "120×50": 24100,
  "120×70": 36100,
  "120×80": 41100,
  "130×60": 34100,
  "130×70": 39100,
  "140×60": 36100,
  "140×70": 42100,
  "150×60": 38100,
  "150×70": 44100,
  "150×80": 50100,
  "160×60": 41100,
  "160×70": 47100,
  "170×50": 36100,
  "170×60": 43100,
  "170×70": 50100,
  "180×60": 46100,
  "180×80": 60100,
  "180×90": 67100,
  "190×90": 71100,
  "200×80": 72100,
  "200×90": 81100,
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orderData, setOrderData] = useState<OrderData>(defaultOrder)

  const updateOrder = (data: Partial<OrderData>) => {
    setOrderData(prev => ({ ...prev, ...data }))
  }

  const resetOrder = () => {
    setOrderData(defaultOrder)
  }

  const calculatePrice = () => {
    let basePrice = 0

    // Базовая цена за размер
    if (orderData.size) {
      if (FIXED_PRICES[orderData.size]) {
        basePrice = FIXED_PRICES[orderData.size]
      } else {
        // Расчет по формуле
        const [width, height] = orderData.size.split('×').map(Number)
        const area = width * height
        
        let multiplier = 1.35
        if (area > 40 * 60 && area <= 50 * 70) {
          multiplier = 1.35
        } else if (area > 50 * 70) {
          multiplier = 1.5
        }
        
        basePrice = Math.round(area * multiplier)
      }
    }

    // Табличка без портрета
    if (orderData.options.plateOnly) {
      basePrice = 600
    }

    // Дополнительные опции
    let additionalCost = 0

    if (orderData.options.retouch === 'basic') {
      additionalCost += 300
    } else if (orderData.options.retouch === 'advanced') {
      additionalCost += 600
    } else if (orderData.options.retouch === 'reconstruction') {
      additionalCost += 1000
    }

    if (orderData.options.oldPhotoImprovement) {
      additionalCost += 400
    }

    if (orderData.options.qrBiography) {
      additionalCost += 500
    }

    // Подписки для оптовиков
    if (orderData.options.subscription) {
      const subscriptionPrices: Record<string, number> = {
        '10': 2700,
        '30': 7500,
        '60': 13800,
        '100': 20000,
      }
      return subscriptionPrices[orderData.options.subscription] || 0
    }

    return basePrice + additionalCost
  }

  const value = {
    orderData,
    updateOrder,
    resetOrder,
    calculatePrice,
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}