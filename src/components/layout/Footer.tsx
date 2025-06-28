import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-gray-300">
      <div className="container-max">
        <div className="section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold text-white">Mellem</span>
              </div>
              <p className="text-gray-400 mb-4">
                Профессиональная фотокерамика и ритуальные услуги. 
                Качество и память на века.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://wa.me/79999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-400 transition-colors duration-200"
                >
                  WhatsApp
                </a>
                <a
                  href="https://t.me/mellem_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400 transition-colors duration-200"
                >
                  Telegram
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-semibold mb-4">Услуги</h3>
              <ul className="space-y-2">
                <li><Link to="/calculator" className="hover:text-white transition-colors duration-200">Фотокерамика</Link></li>
                <li><Link to="/background-editor" className="hover:text-white transition-colors duration-200">Портреты на керамограните</Link></li>
                <li><Link to="/plate-editor" className="hover:text-white transition-colors duration-200">Таблички</Link></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Ретушь фото</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">QR-биография</a></li>
              </ul>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-white font-semibold mb-4">Навигация</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-white transition-colors duration-200">Главная</Link></li>
                <li><Link to="/calculator" className="hover:text-white transition-colors duration-200">Калькулятор</Link></li>
                <li><Link to="/backgrounds" className="hover:text-white transition-colors duration-200">Каталог фонов</Link></li>
                <li><Link to="/profile" className="hover:text-white transition-colors duration-200">Личный кабинет</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-semibold mb-4">Контакты</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <span>+7 (999) 999-99-99</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <span>info@mellem.ru</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>Москва, Россия</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>Пн-Вс: 9:00-21:00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Mellem. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}