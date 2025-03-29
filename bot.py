import os
import logging
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

# ----- Получаем токен из переменных окружения -----
TOKEN = os.getenv("BOT_TOKEN")  # В Railway: Shared Variables -> BOT_TOKEN = 7283570898:AAH28...
if not TOKEN:
    raise ValueError("❌ BOT_TOKEN не найден! Убедитесь, что вы добавили переменную окружения BOT_TOKEN.")

# ----- Создаём бота и диспетчер -----
bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# ----- Описываем состояния -----
class OrderState(StatesGroup):
    waiting_for_material = State()
    waiting_for_size = State()

# ----- Хендлер на /start -----
@dp.message(Command(commands=["start"]))
async def start_command(message: types.Message, state: FSMContext):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🟦 Керамика", callback_data="material_keramika")],
        [InlineKeyboardButton(text="🟨 Металлокерамика (овал)", callback_data="material_metal_oval")],
        [InlineKeyboardButton(text="🟥 Металлокерамика (прямоугольная)", callback_data="material_metal_pryam")],
        [InlineKeyboardButton(text="🔷 Своя форма", callback_data="material_custom")]
    ])
    await message.answer(
        "Привет! Я бот для оформления заказа на фотокерамику.\n\n"
        "Выберите тип изделия:", 
        reply_markup=keyboard
    )
    await state.set_state(OrderState.waiting_for_material)

# ----- Хендлер на выбор материала -----
@dp.callback_query(lambda c: c.data.startswith("material_"))
async def material_chosen(callback: types.CallbackQuery, state: FSMContext):
    material = callback.data.replace("material_", "")
    await state.update_data(material=material)
    await callback.answer()
    await callback.message.answer(
        f"Вы выбрали: {material}\nТеперь выберите размер (например, 13x18, 18x24 и т.д.):"
    )
    await state.set_state(OrderState.waiting_for_size)

# ----- Логика для любого сообщения, если ждём размер -----
@dp.message(OrderState.waiting_for_size)
async def set_size(message: types.Message, state: FSMContext):
    size_text = message.text
    data = await state.get_data()
    chosen_material = data.get("material", "неизвестно")
    
    # Сохраняем размер
    await state.update_data(size=size_text)
    
    await message.answer(
        f"Отлично, вы выбрали материал: {chosen_material}, размер: {size_text}\n"
        "Здесь можно продолжить логику: добавить надпись, фон, фото и т.д."
    )
    # Сбрасываем состояние (или ставим следующее) 
    await state.clear()

# ----- Точка входа: запускаем бота -----
async def main():
    logging.basicConfig(level=logging.INFO)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
