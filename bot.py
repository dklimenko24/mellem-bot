import logging
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.fsm.context import FSMContext
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
import os

TOKEN = os.getenv("BOT_TOKEN")
ADMIN_CHAT_ID = int(os.getenv("ADMIN_CHAT_ID", "0"))

bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())

class OrderState(StatesGroup):
    waiting_for_material = State()
    waiting_for_size = State()

@dp.message(lambda msg: msg.text.lower() == "/start")
async def start_handler(message: types.Message, state: FSMContext):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🟦 Керамика", callback_data="material_keramika")],
        [InlineKeyboardButton(text="🟨 Металлокерамика (овал)", callback_data="material_metal_oval")],
        [InlineKeyboardButton(text="🟥 Металлокерамика (прямоугольная)", callback_data="material_metal_pryam")],
        [InlineKeyboardButton(text="🔷 Своя форма", callback_data="material_custom")]
    ])
    await message.answer("Привет! Давайте оформим заказ.\n\nВыберите тип изделия:", reply_markup=keyboard)
    await state.set_state(OrderState.waiting_for_material)

@dp.callback_query(lambda c: c.data.startswith("material_"))
async def material_chosen(callback: types.CallbackQuery, state: FSMContext):
    material = callback.data.replace("material_", "")
    await state.update_data(material=material)
    await callback.answer()
    await callback.message.answer(f"Вы выбрали: {material}\nТеперь выберите размер:")
    await state.set_state(OrderState.waiting_for_size)

async def main():
    logging.basicConfig(level=logging.INFO)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
