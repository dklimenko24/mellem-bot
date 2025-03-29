import os
import math
import asyncio
import logging

from aiogram import Bot, Dispatcher, F, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command
from aiogram.filters.state import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

# --- ИНИЦИАЛИЗАЦИЯ ---
TOKEN = os.getenv("BOT_TOKEN")
if not TOKEN:
    raise ValueError("❌ BOT_TOKEN не найден!")

bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# --- СОСТОЯНИЯ ---
class OrderState(StatesGroup):
    waiting_for_material = State()
    waiting_for_size = State()

# --- ЦЕНЫ (оптовые) ---
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

# --- ПЕРЕСЧЁТ ЦЕНЫ ---
def calculate_retail_price(wholesale_price: int) -> int:
    return math.floor(wholesale_price * 1.3 / 50) * 50

# --- ГЕНЕРАЦИЯ КЛАВИАТУРЫ ---
def create_size_keyboard(prices: dict) -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(
            text=f"{size} – {calculate_retail_price(price)} руб.",
            callback_data=f"size_{size}"
        )]
        for size, price in prices.items()
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

# --- ХЕНДЛЕРЫ ---
async def cmd_start(message: types.Message, state: FSMContext):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🟦 Керамика", callback_data="material_keramika")],
        [InlineKeyboardButton(text="🟨 Металлокерамика (овал)", callback_data="material_metal_oval")],
        [InlineKeyboardButton(text="🟥 Металлокерамика (прямоугольная)", callback_data="material_metal_pryam")],
        [InlineKeyboardButton(text="🔷 Своя форма", callback_data="material_custom")]
    ])
    await message.answer("Привет! Выберите тип изделия:", reply_markup=keyboard)
    await state.set_state(OrderState.waiting_for_material)

async def material_chosen(callback: types.CallbackQuery, state: FSMContext):
    material = callback.data.replace("material_", "")
    await state.update_data(material=material)
    await callback.answer()

    if material == "keramika":
        prices = KERAMIKA_PRICES
    elif material == "metal_oval":
        prices = METAL_OVAL_PRICES
    elif material == "metal_pryam":
        prices = METAL_PRYAM_PRICES
    elif material == "custom":
        await callback.message.answer("Функция 'своя форма' пока в разработке.")
        await state.clear()
        return
    else:
        await callback.message.answer("Неизвестный материал.")
        await state.clear()
        return

    keyboard = create_size_keyboard(prices)
    await callback.message.answer("Теперь выберите размер:", reply_markup=keyboard)
    await state.update_data(prices_dict=material)
    await state.set_state(OrderState.waiting_for_size)

async def size_chosen(callback: types.CallbackQuery, state: FSMContext):
    size = callback.data.replace("size_", "")
    data = await state.get_data()
    material = data.get("material")
    prices_key = data.get("prices_dict")

    if prices_key == "keramika":
        price = KERAMIKA_PRICES.get(size)
    elif prices_key == "metal_oval":
        price = METAL_OVAL_PRICES.get(size)
    elif prices_key == "metal_pryam":
        price = METAL_PRYAM_PRICES.get(size)
    else:
        price = None

    if price is None:
        await callback.message.answer("Ошибка: размер не найден.")
    else:
        retail = calculate_retail_price(price)
        await callback.message.answer(
            f"Вы выбрали:\nМатериал: {material}\nРазмер: {size}\nЦена: {retail} руб."
        )

    await state.clear()

# --- РЕГИСТРАЦИЯ ХЕНДЛЕРОВ ---
def register_handlers(dp: Dispatcher):
    dp.message.register(cmd_start, Command(commands=["start"]))
    dp.callback_query.register(material_chosen,
        F.data.startswith("material_"),
        StateFilter(OrderState.waiting_for_material)
    )
    dp.callback_query.register(size_chosen,
        F.data.startswith("size_"),
        StateFilter(OrderState.waiting_for_size)
    )

# --- ЗАПУСК БОТА ---
async def main():
    logging.basicConfig(level=logging.INFO)
    register_handlers(dp)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
