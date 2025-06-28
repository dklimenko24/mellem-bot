import { useState } from 'react'
import { Search, Filter, Grid, List, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const BACKGROUND_CATEGORIES = [
  'Все',
  'Природа',
  'Храмы',
  'Символика',
  'Абстракция',
  'Цветы',
  'Небо',
  'Море',
]

const BACKGROUND_IMAGES = [
  {
    id: 1,
    url: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Природа',
    title: 'Лесной пейзаж',
    description: 'Спокойный лесной пейзаж с мягким освещением'
  },
  {
    id: 2,
    url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Храмы',
    title: 'Церковь',
    description: 'Красивая православная церковь'
  },
  {
    id: 3,
    url: 'https://images.pexels.com/photos/1323713/pexels-photo-1323713.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Небо',
    title: 'Облачное небо',
    description: 'Драматичное небо с облаками'
  },
  {
    id: 4,
    url: 'https://images.pexels.com/photos/1323715/pexels-photo-1323715.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Цветы',
    title: 'Полевые цветы',
    description: 'Нежные полевые цветы'
  },
  {
    id: 5,
    url: 'https://images.pexels.com/photos/1323716/pexels-photo-1323716.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Море',
    title: 'Морской берег',
    description: 'Спокойный морской пейзаж'
  },
  {
    id: 6,
    url: 'https://images.pexels.com/photos/1323717/pexels-photo-1323717.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Символика',
    title: 'Крест',
    description: 'Символический крест на фоне неба'
  },
  {
    id: 7,
    url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Природа',
    title: 'Горный пейзаж',
    description: 'Величественные горы'
  },
  {
    id: 8,
    url: 'https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Абстракция',
    title: 'Абстрактный фон',
    description: 'Мягкий абстрактный градиент'
  },
]

export default function BackgroundCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredImages = BACKGROUND_IMAGES.filter(image => {
    const matchesCategory = selectedCategory === 'Все' || image.category === selectedCategory
    const matchesSearch = image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 section-padding">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Каталог фонов
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Выберите подходящий фон для вашего портрета из нашей коллекции
          </p>
        </div>

        {/* Filters and Search */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
                placeholder="Поиск фонов..."
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-6">
            {BACKGROUND_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Найдено фонов: {filteredImages.length}
          </p>
        </div>

        {/* Images Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div key={image.id} className="card group hover:scale-105 transform transition-all duration-300">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <Link
                      to={`/background-editor?bg=${encodeURIComponent(image.url)}`}
                      className="opacity-0 group-hover:opacity-100 btn-primary transform scale-90 group-hover:scale-100 transition-all duration-300"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Использовать
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {image.title}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full">
                      {image.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {image.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredImages.map((image) => (
              <div key={image.id} className="card">
                <div className="flex items-center space-x-6">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {image.title}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full">
                        {image.category}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {image.description}
                    </p>
                    <Link
                      to={`/background-editor?bg=${encodeURIComponent(image.url)}`}
                      className="btn-primary inline-flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Использовать фон
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Фоны не найдены
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Попробуйте изменить критерии поиска или выберите другую категорию
            </p>
          </div>
        )}
      </div>
    </div>
  )
}