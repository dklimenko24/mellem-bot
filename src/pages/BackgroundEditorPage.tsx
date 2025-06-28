import React, { useState, useRef, useEffect } from 'react'
import { Upload, Download, RotateCcw, Palette, Sliders, Save } from 'lucide-react'
import { fabric } from 'fabric'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

const BACKGROUND_IMAGES = [
  'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1323713/pexels-photo-1323713.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1323715/pexels-photo-1323715.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1323716/pexels-photo-1323716.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1323717/pexels-photo-1323717.jpeg?auto=compress&cs=tinysrgb&w=800',
]

export default function BackgroundEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [portraitImage, setPortraitImage] = useState<string | null>(null)
  const [selectedBackground, setSelectedBackground] = useState<string>(BACKGROUND_IMAGES[0])
  const [isGrayscale, setIsGrayscale] = useState(false)
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [saturation, setSaturation] = useState(0)

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 800,
        backgroundColor: '#ffffff',
      })

      setCanvas(fabricCanvas)

      // Load default background
      loadBackground(BACKGROUND_IMAGES[0], fabricCanvas)

      return () => {
        fabricCanvas.dispose()
      }
    }
  }, [])

  const loadBackground = (imageUrl: string, fabricCanvas: fabric.Canvas) => {
    fabric.Image.fromURL(imageUrl, (img) => {
      img.scaleToWidth(fabricCanvas.width!)
      img.scaleToHeight(fabricCanvas.height!)
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      })
      
      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas))
    }, { crossOrigin: 'anonymous' })
  }

  const handlePortraitUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && canvas) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setPortraitImage(imageUrl)
        
        fabric.Image.fromURL(imageUrl, (img) => {
          // Scale image to fit nicely on canvas
          const maxWidth = canvas.width! * 0.6
          const maxHeight = canvas.height! * 0.8
          
          if (img.width! > maxWidth) {
            img.scaleToWidth(maxWidth)
          }
          if (img.height! > maxHeight) {
            img.scaleToHeight(maxHeight)
          }
          
          img.set({
            left: canvas.width! / 2 - img.getScaledWidth() / 2,
            top: canvas.height! / 2 - img.getScaledHeight() / 2,
            cornerStyle: 'circle',
            cornerColor: '#4361ee',
            cornerSize: 12,
            transparentCorners: false,
          })
          
          // Remove existing portrait if any
          const existingPortrait = canvas.getObjects().find(obj => obj.name === 'portrait')
          if (existingPortrait) {
            canvas.remove(existingPortrait)
          }
          
          img.name = 'portrait'
          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackgroundChange = (imageUrl: string) => {
    setSelectedBackground(imageUrl)
    if (canvas) {
      loadBackground(imageUrl, canvas)
    }
  }

  const applyFilters = () => {
    if (!canvas) return

    const portrait = canvas.getObjects().find(obj => obj.name === 'portrait') as fabric.Image
    if (!portrait) return

    const filters: fabric.IBaseFilter[] = []

    if (isGrayscale) {
      filters.push(new fabric.Image.filters.Grayscale())
    }

    if (brightness !== 0) {
      filters.push(new fabric.Image.filters.Brightness({ brightness: brightness / 100 }))
    }

    if (contrast !== 0) {
      filters.push(new fabric.Image.filters.Contrast({ contrast: contrast / 100 }))
    }

    if (saturation !== 0) {
      filters.push(new fabric.Image.filters.Saturation({ saturation: saturation / 100 }))
    }

    portrait.filters = filters
    portrait.applyFilters()
    canvas.renderAll()
  }

  useEffect(() => {
    applyFilters()
  }, [isGrayscale, brightness, contrast, saturation])

  const resetFilters = () => {
    setIsGrayscale(false)
    setBrightness(0)
    setContrast(0)
    setSaturation(0)
  }

  const downloadImage = () => {
    if (!canvas) return

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, // Higher resolution
    })

    const link = document.createElement('a')
    link.download = 'portrait-with-background.png'
    link.href = dataURL
    link.click()

    toast.success('Изображение скачано!')
  }

  const saveToOrder = () => {
    if (!canvas) return

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    })

    // Here you would typically save to order context or send to backend
    toast.success('Дизайн сохранен в заказ!')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 section-padding">
      <div className="container-max">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Palette className="w-8 h-8 text-primary-500 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Редактор фонов
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Создайте портрет с красивым фоном
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Холст для редактирования
                  </h2>
                  <div className="flex justify-center">
                    <div className="canvas-container">
                      <canvas ref={canvasRef} />
                    </div>
                  </div>
                </div>

                {/* Canvas Controls */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={downloadImage}
                    className="btn-primary"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Скачать
                  </button>
                  <button
                    onClick={saveToOrder}
                    className="btn-secondary"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Заказать
                  </button>
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="space-y-6">
              {/* Upload Portrait */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Загрузить портрет
                </h3>
                <label className="block w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-200">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Выберите фото
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortraitUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Background Selection */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Выбор фона
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {BACKGROUND_IMAGES.map((bg, index) => (
                    <button
                      key={index}
                      onClick={() => handleBackgroundChange(bg)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedBackground === bg
                          ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <img
                        src={bg}
                        alt={`Background ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Фильтры
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Сбросить
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Grayscale Toggle */}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isGrayscale}
                      onChange={(e) => setIsGrayscale(e.target.checked)}
                      className="mr-3"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Черно-белый
                    </span>
                  </label>

                  {/* Brightness */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Яркость: {brightness}%
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Контрастность: {contrast}%
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Насыщенность: {saturation}%
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}