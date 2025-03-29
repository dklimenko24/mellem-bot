import os
import logging
import math
import asyncio

from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import Command
from aiogram.filters.state import StateFilter
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


TOKEN = os.getenv("BOT_TOKEN")
if not TOKEN:
    raise ValueError("❌ BOT_TOKEN не найден!")

# Инициализация бота и диспетчера
bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# Состояния
class OrderState(StatesGroup):
    waiting_for_material = State()
    waiting_for_size = State()

# Пример словаря
KERAMIKA_PRICES = {
    "13x18": 1100,
    "15x20": 1400,
}

def calculate_retail_price(wholesale_price: int) -> int:
    retail = wholesale_price * 1.3
    # округление вниз до ближайших 50
    return math.floor(retail / 50) * 50


# ------------------- Хендлеры -------------------

async def cmd_start(message: types.Message, state):
    """Обработчик для /start"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Керамика", callback_data="material_keramika")],
        [InlineKeyboardButton(text="Металлокерамика (овал)", callback_data="material_metal_oval")],
    ])
    await message.answer(
        "Привет! Я бот для оформления заказа на фотокерамику.\n\n"
        "Выберите тип изделия:", 
        reply_markup=keyboard
    )
    await state.set_state(OrderState.waiting_for_material)


async def material_chosen(callback: types.CallbackQuery, state: types.fsm.FSMContext):
    """Обработчик для выбора материала"""
    material = callback.data.replace("material_", "")
    await state.update_data(material=material)

    if material == "keramika":
        size_keyboard = InlineKeyboardMarkup()
        for size, price in KERAMIKA_PRICES.items():
            ret_price = calculate_retail_price(price)
            button_text = f"{size} – {ret_price} руб."
            size_keyboard.add(InlineKeyboardButton(text=button_text, callback_data=f"size_{size}"))
        await callback.message.answer(
            "Вы выбрали: керамика.\nТеперь выберите размер:",
            reply_markup=size_keyboard
        )
        await state.set_state(OrderState.waiting_for_size)
    else:
        await callback.message.answer("Пока не поддерживается!")
        await state.clear()

async def size_chosen(callback: types.CallbackQuery, state: types.fsm.FSMContext):
    """Обработчик для выбора размера"""
    size = callback.data.replace("size_", "")
    data = await state.get_data()
    material = data.get("material")

    # В реальном коде тут нужно брать словарь цен по материалу, а не только керамику
    wholesale_price = KERAMIKA_PRICES.get(size, 0)
    retail_price = calculate_retail_price(wholesale_price)

    await callback.message.answer(
        f"Материал: {material}\n"
        f"Размер: {size}\n"
        f"Цена: {retail_price} руб."
    )
    await state.clear()


# ------------------- Регистрация хендлеров -------------------
def register_handlers(dp: Dispatcher):
    # Хендлер команды /start
    dp.message.register(cmd_start, Command(commands=["start"]))

    # Хендлер на выбор материала (состояние waiting_for_material)
    # F.data.startswith("material_") — функциональный фильтр по data
    # StateFilter(OrderState.waiting_for_material) — фильтр по состоянию
    dp.callback_query.register(
        material_chosen,
        F.data.startswith("material_"),
        StateFilter(OrderState.waiting_for_material)
    )

    # Хендлер на выбор размера (состояние waiting_for_size)
    dp.callback_query.register(
        size_chosen,
        F.data.startswith("size_"),
        StateFilter(OrderState.waiting_for_size)
    )

# ------------------- Точка входа -------------------
async def main():
    logging.basicConfig(level=logging.INFO)

    register_handlers(dp)

    # Запуск бота
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
