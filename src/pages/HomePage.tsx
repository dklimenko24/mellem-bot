import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Shield, Clock, Users, Camera, Palette, Calculator, Phone } from 'lucide-react'

export default function HomePage() {
  const services = [
    {
      title: 'Фотокерамика',
      description: 'Профессиональная печать портретов на керамике высочайшего качества',
      icon: Camera,
      price: 'от 800 ₽',
      link: '/calculator'
    },
    {
      title: 'Портреты на керамограните',
      description: 'Долговечные портреты на итальянском керамограните',
      icon: Palette,
      price: 'от 1300 ₽',
      link: '/background-editor'
    },
    {
      title: 'Ретушь фото',
      description: 'Профессиональная обработка и восстановление фотографий',
      icon: Star,
      price: 'от 300 ₽',
      link: '/calculator'
    },
    {
      title: 'Улучшение старых фотографий',
      description: 'Восстановление и цифровая реставрация старых снимков',
      icon: Shield,
      price: 'от 400 ₽',
      link: '/calculator'
    },
    {
      title: 'QR-биография',
      description: 'Создание цифровой страницы памяти с QR-кодом',
      icon: Users,
      price: 'от 500 ₽',
      link: '/calculator'
    },
    {
      title: 'Таблички',
      description: 'Изготовление памятных табличек без портрета',
      icon: Clock,
      price: '600 ₽',
      link: '/plate-editor'
    }
  ]

  const features = [
    {
      title: 'Высокое качество',
      description: 'Используем только профессиональное оборудование и материалы премиум-класса',
      icon: Star
    },
    {
      title: 'Быстрое изготовление',
      description: 'Стандартный срок изготовления 3-5 рабочих дней',
      icon: Clock
    },
    {
      title: 'Гарантия качества',
      description: 'Предоставляем гарантию на все виды работ и материалы',
      icon: Shield
    },
    {
      title: 'Опытные мастера',
      description: 'Команда профессионалов с многолетним опытом работы',
      icon: Users
    }
  ]

  const sizes = [
    '9×12', '10×15', '11×15', '13×18', '15×20', '16×22', '18×24', '20×25',
    '20×30', '24×30', '24×34', '25×35', '30×40', '30×45', '30×50', '30×60',
    '35×45', '40×50', '40×60', '40×70', '45×60', '50×70', '55×80', '60×80',
    '60×90', '60×100', '60×120', '70×90', '100×70', '120×50', '120×70',
    '120×80', '130×60', '130×70', '140×60', '140×70', '150×60', '150×70',
    '150×80', '160×60', '160×70', '170×50', '170×60', '170×70', '180×60',
    '180×80', '180×90', '190×90', '200×80', '200×90'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Mellem
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 animate-slide-up">
              Профессиональная фотокерамика и ритуальные услуги
            </p>
            <p className="text-lg mb-12 text-primary-200 max-w-2xl mx-auto">
              Качество и память на века. Используем только премиальные материалы 
              и современные технологии для создания долговечных портретов.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/calculator"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center justify-center"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Рассчитать стоимость
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a
                href="https://wa.me/79999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600 inline-flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Консультация в WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-gray-50 dark:bg-dark-800">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Наши услуги
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Полный спектр услуг для создания качественных памятных изделий
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <Link
                  key={index}
                  to={service.link}
                  className="card hover:scale-105 transform transition-all duration-300 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mr-4">
                      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {service.title}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 font-medium">
                        {service.price}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {service.description}
                  </p>
                  <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-200">
                    Подробнее
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Почему выбирают нас
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Мы гарантируем высочайшее качество и индивидуальный подход к каждому заказу
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sizes Section */}
      <section className="section-padding bg-gray-50 dark:bg-dark-800">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Доступные размеры
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Широкий выбор размеров для любых потребностей
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {sizes.map((size, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-900 rounded-lg p-3 text-center shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-200"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {size}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/calculator"
              className="btn-primary inline-flex items-center"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Рассчитать стоимость
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-600">
        <div className="container-max">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Готовы сделать заказ?
            </h2>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Свяжитесь с нами для консультации или воспользуйтесь онлайн-калькулятором
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/calculator"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center justify-center"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Калькулятор стоимости
              </Link>
              <a
                href="https://wa.me/79999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600 inline-flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}