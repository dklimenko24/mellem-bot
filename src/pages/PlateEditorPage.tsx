import { useState, useRef, useEffect } from 'react'
import { Type, Download, Save, RotateCcw } from 'lucide-react'
import { fabric } from 'fabric'
import toast from 'react-hot-toast'

const FONTS = [
  'Arial',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Helvetica',
  'Courier New',
  'Impact',
  'Comic Sans MS',
]

const PLATE_BACKGROUNDS = [
  '#2c3e50', // Dark blue-gray
  '#34495e', // Darker gray
  '#7f8c8d', // Gray
  '#95a5a6', // Light gray
  '#ecf0f1', // Very light gray
  '#ffffff', // White
]

export default function PlateEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [epitaph, setEpitaph] = useState('')
  const [selectedFont, setSelectedFont] = useState('Arial')
  const [fontSize, setFontSize] = useState(24)
  const [textColor, setTextColor] = useState('#ffffff')
  const [backgroundColor, setBackgroundColor] = useState('#2c3e50')

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 300,
        backgroundColor: backgroundColor,
      })

      setCanvas(fabricCanvas)

      // Add initial text
      updatePlateText(fabricCanvas)

      return () => {
        fabricCanvas.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (canvas) {
      canvas.backgroundColor = backgroundColor
      canvas.renderAll()
    }
  }, [backgroundColor, canvas])

  useEffect(() => {
    if (canvas) {
      updatePlateText(canvas)
    }
  }, [fullName, birthDate, deathDate, epitaph, selectedFont, fontSize, textColor, canvas])

  const updatePlateText = (fabricCanvas: fabric.Canvas) => {
    // Clear existing text objects
    const textObjects = fabricCanvas.getObjects().filter(obj => obj.type === 'text')
    textObjects.forEach(obj => fabricCanvas.remove(obj))

    let yPosition = 40

    // Full name
    if (fullName) {
      const nameText = new fabric.Text(fullName, {
        left: fabricCanvas.width! / 2,
        top: yPosition,
        fontFamily: selectedFont,
        fontSize: fontSize + 4,
        fill: textColor,
        textAlign: 'center',
        originX: 'center',
        fontWeight: 'bold',
      })
      fabricCanvas.add(nameText)
      yPosition += fontSize + 20
    }

    // Dates
    if (birthDate || deathDate) {
      const dateText = `${birthDate} - ${deathDate}`
      const datesText = new fabric.Text(dateText, {
        left: fabricCanvas.width! / 2,
        top: yPosition,
        fontFamily: selectedFont,
        fontSize: fontSize - 2,
        fill: textColor,
        textAlign: 'center',
        originX: 'center',
      })
      fabricCanvas.add(datesText)
      yPosition += fontSize + 15
    }

    // Epitaph
    if (epitaph) {
      const epitaphText = new fabric.Text(epitaph, {
        left: fabricCanvas.width! / 2,
        top: yPosition,
        fontFamily: selectedFont,
        fontSize: fontSize - 4,
        fill: textColor,
        textAlign: 'center',
        originX: 'center',
        width: fabricCanvas.width! - 40,
      })
      fabricCanvas.add(epitaphText)
    }

    fabricCanvas.renderAll()
  }

  const resetPlate = () => {
    setFullName('')
    setBirthDate('')
    setDeathDate('')
    setEpitaph('')
    setSelectedFont('Arial')
    setFontSize(24)
    setTextColor('#ffffff')
    setBackgroundColor('#2c3e50')
  }

  const downloadPlate = () => {
    if (!canvas) return

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 3, // Higher resolution
    })

    const link = document.createElement('a')
    link.download = 'memorial-plate.png'
    link.href = dataURL
    link.click()

    toast.success('Табличка скачана!')
  }

  const saveToOrder = () => {
    if (!canvas) return

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 3,
    })

    // Here you would typically save to order context or send to backend
    toast.success('Табличка сохранена в заказ! Стоимость: 600 ₽')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 section-padding">
      <div className="container-max">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Type className="w-8 h-8 text-primary-500 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Редактор табличек
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Создайте памятную табличку с текстом
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Canvas */}
            <div className="card">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Предварительный просмотр
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
                  onClick={downloadPlate}
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
                  Заказать (600 ₽)
                </button>
                <button
                  onClick={resetPlate}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Сбросить
                </button>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="space-y-6">
              {/* Text Content */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Содержание таблички
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Полное имя
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field"
                      placeholder="Иван Иванович Иванов"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Дата рождения
                      </label>
                      <input
                        type="text"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="input-field"
                        placeholder="01.01.1950"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Дата смерти
                      </label>
                      <input
                        type="text"
                        value={deathDate}
                        onChange={(e) => setDeathDate(e.target.value)}
                        className="input-field"
                        placeholder="01.01.2024"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Эпитафия
                    </label>
                    <textarea
                      value={epitaph}
                      onChange={(e) => setEpitaph(e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Светлая память..."
                    />
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Оформление текста
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Шрифт
                    </label>
                    <select
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      className="input-field"
                    >
                      {FONTS.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Размер шрифта: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Цвет текста
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="input-field flex-1"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Background */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Фон таблички
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {PLATE_BACKGROUNDS.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-full h-12 rounded-lg border-2 transition-all duration-200 ${
                        backgroundColor === color
                          ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="input-field flex-1"
                    placeholder="#2c3e50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}