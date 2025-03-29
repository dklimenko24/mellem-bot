import os
import logging
import math
import asyncio

from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.filters.state import StateFilter
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

# ----- Получаем токен из переменных окружения -----
TOKEN = os.getenv("BOT_TOKEN")
if not TOKEN:
    raise ValueError("❌ BOT_TOKEN не найден! Убедитесь, что вы добавили переменную окружения BOT_TOKEN.")

# ----- Создаём бота и диспетчер -----
bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# ----- Описываем состояния -----
class OrderState(StatesGroup):
    waiting_for_material = State()
    waiting_for_size = State()

# ----- Словари с оптовыми ценами для каждого материала -----
KERAMIKA_PRICES = {
    "13x18": 1100,
    "15x20": 1400,
    "18x24": 2000,
    "20x30": 2700,
    "24x30": 3300,
    "30x40": 5000,
    "40x50": 13000,
    "40x60": 13300,
    "50x70": 17200,
    "50x90": 27000,
    "50x100": 32000,
    "60x20": 44000,
}

METAL_OVAL_PRICES = {
    "13x18": 850,
    "14x25": 950,
    "16x23": 1000,
    "18x24": 1100,
    "20x30": 1500,
    "24x30": 1700,
    "25x40": 2600,
    "30x40": 3500,
}

METAL_PRYAM_PRICES = {
    "13x18": 850,
    "15x20": 1050,
    "18x24": 1150,
    "20x30": 1550,
    "24x30": 1750,
    "30x40": 3600,
    "40x50": 14000,
}

# Функция расчёта розничной цены с наценкой 30% и округлением вниз до ближайших 50 руб.
def calculate_retail_price(wholesale_price: int) -> int:
    retail = wholesale_price * 1.3
    return math.floor(retail / 50) * 50

# Функция для генерации inline-клавиатуры по словарю цен
def create_size_keyboard(prices_dict: dict) -> InlineKeyboardMarkup:
    keyboard = InlineKeyboardMarkup()
    for size, wholesale_price in prices_dict.items():
        retail_price = calculate_retail_price(wholesale_price)
        button_text = f"{size} – {retail_price} руб."
        keyboard.add(InlineKeyboardButton(text=button_text, callback_data=f"size_{size}"))
    return keyboard

# ------------------- Хендлеры -------------------

async def cmd_start(message: types.Message, state: FSMContext):
    """Обработчик для /start"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🟦 Керамика", callback_data="material_keramika")],
        [InlineKeyboardButton(text="🟨 Металлокерамика (овал)", callback_data="material_metal_oval")],
        [InlineKeyboardButton(text="🟥 Металлокерамика (прямоугольная)", callback_data="material_metal_pryam")],
        [InlineKeyboardButton(text="🔷 Своя форма", callback_data="material_custom")]
    ])
    await message.answer(
        "Привет! Я бот для оформления заказа на фотокерамику.\n\nВыберите тип изделия:",
        reply_markup=keyboard
    )
    await state.set_state(OrderState.waiting_for_material)

async def material_chosen(callback: types.CallbackQuery, state: FSMContext):
    """Обработчик выбора материала"""
    material = callback.data.replace("material_", "")
    await state.update_data(material=material)
    await callback.answer()
    
    if material == "keramika":
        size_keyboard = create_size_keyboard(KERAMIKA_PRICES)
        await callback.message.answer(
            "Вы выбрали: керамика.\nТеперь выберите размер:",
            reply_markup=size_keyboard
        )
        await state.update_data(prices_dict="keramika")
        await state.set_state(OrderState.waiting_for_size)
    elif material == "metal_oval":
        size_keyboard = create_size_keyboard(METAL_OVAL_PRICES)
        await callback.message.answer(
            "Вы выбрали: металлокерамика (овал).\nТеперь выберите размер:",
            reply_markup=size_keyboard
        )
        await state.update_data(prices_dict="metal_oval")
        await state.set_state(OrderState.waiting_for_size)
    elif material == "metal_pryam":
        size_keyboard = create_size_keyboard(METAL_PRYAM_PRICES)
        await callback.message.answer(
            "Вы выбрали: металлокерамика (прямоугольная).\nТеперь выберите размер:",
            reply_markup=size_keyboard
        )
        await state.update_data(prices_dict="metal_pryam")
        await state.set_state(OrderState.waiting_for_size)
    elif material == "custom":
        await callback.message.answer("Функционал для 'Своей формы' в разработке. Оставайтесь с нами!")
        await state.clear()
    else:
        await callback.message.answer("Выбранный материал пока не поддерживается.")
        await state.clear()

async def size_chosen(callback: types.CallbackQuery, state: FSMContext):
    """Обработчик выбора размера"""
    size = callback.data.replace("size_", "")
    data = await state.get_data()
    material = data.get("material", "неизвестно")
    prices_dict_key = data.get("prices_dict")
    
    if prices_dict_key == "keramika":
        wholesale_price = KERAMIKA_PRICES.get(size)
    elif prices_dict_key == "metal_oval":
        wholesale_price = METAL_OVAL_PRICES.get(size)
    elif prices_dict_key == "metal_pryam":
        wholesale_price = METAL_PRYAM_PRICES.get(size)
    else:
        wholesale_price = None

    if wholesale_price:
        retail_price = calculate_retail_price(wholesale_price)
        price_info = f"{retail_price} руб."
    else:
        price_info = "N/A"

    await callback.message.answer(
        f"Отлично, вы выбрали материал: {material}\nРазмер: {size}\nРозничная цена: {price_info}\n\n"
        "Дальше можно добавить логику для выбора надписи, фона, фото и прочего."
    )
    await state.clear()

# ------------------- Регистрация хендлеров -------------------
def register_handlers(dp: Dispatcher):
    # Хендлер для команды /start
    dp.message.register(cmd_start, Command(commands=["start"]))

    # Хендлер для выбора материала в состоянии waiting_for_material
    dp.callback_query.register(
        material_chosen,
        F.data.startswith("material_"),
        StateFilter(OrderState.waiting_for_material)
    )

    # Хендлер для выбора размера в состоянии waiting_for_size
    dp.callback_query.register(
        size_chosen,
        F.data.startswith("size_"),
        StateFilter(OrderState.waiting_for_size)
    )

# ------------------- Точка входа -------------------
async def main():
    logging.basicConfig(level=logging.INFO)
    register_handlers(dp)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
