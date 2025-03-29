import os
import math
import asyncio
import logging
import requests
import io
from datetime import datetime

from aiogram import Bot, Dispatcher, F, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, BufferedInputFile
from aiogram.filters import Command
from aiogram.filters.state import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

import gspread
from oauth2client.service_account import ServiceAccountCredentials

# --- GOOGLE SHEETS НАСТРОЙКА ---
SCOPE = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
CREDS = ServiceAccountCredentials.from_json_keyfile_name("mellembot-bdfa39588adc.json", SCOPE)
GSPREAD_CLIENT = gspread.authorize(CREDS)
SHEET = GSPREAD_CLIENT.open_by_key("1Su2wxfGsk2mOhTC6GbUTJSpVY2TbdhXVAeXcWJ20MM").worksheet("Лист1")

# --- ГЛОБАЛЬНЫЕ НАСТРОЙКИ ---
TOKEN = os.getenv("BOT_TOKEN")
if not TOKEN:
    raise ValueError("❌ BOT_TOKEN не найден!")

bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# --- СОСТОЯНИЯ ---
class OrderState(StatesGroup):
    waiting_for_material = State()
    waiting_for_size = State()
    waiting_for_format = State()
    waiting_for_font = State()
    entering_person_data = State()
    showing_fonts = State()
    showing_backgrounds = State()
    uploading_photo = State()
    confirming_order = State()

# Здесь продолжается весь исходный код пользователя с дополнением новых хендлеров и функций:

# Добавлены новые хендлеры для ввода данных усопшего, загрузки фото и сохранения в Google Sheets

async def font_selected(callback: types.CallbackQuery, state: FSMContext):
    font_name = callback.data.replace("font_", "")
    await state.update_data(font=font_name)
    await callback.answer()
    await callback.message.answer("Введите данные усопшего (ФИО и даты):")
    await state.set_state(OrderState.entering_person_data)

async def person_data_entered(message: types.Message, state: FSMContext):
    await state.update_data(person_info=message.text.strip(), shown_bgs=[])
    await message.answer("Теперь выберите фон:")
    await show_next_backgrounds(message, state)

async def background_selected(callback: types.CallbackQuery, state: FSMContext):
    bg_name = callback.data.replace("bg_", "")
    await state.update_data(background=bg_name)
    await callback.answer()
    await callback.message.answer("Загрузите фото усопшего:")
    await state.set_state(OrderState.uploading_photo)

async def photo_uploaded(message: types.Message, state: FSMContext):
    if not message.photo:
        await message.answer("Пожалуйста, отправьте фото в виде изображения.")
        return

    photo = message.photo[-1]
    file_id = photo.file_id

    await state.update_data(photo_id=file_id)

    data = await state.get_data()

    caption = (
        f"Материал: {data['material']}\n"
        f"Размер: {data['size']}\n"
        f"Формат: {data['format']}\n"
        f"Шрифт: {data['font']}\n"
        f"Фон: {data['background']}\n"
        f"Данные усопшего: {data['person_info']}"
    )

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Подтвердить заказ", callback_data="confirm_order")]
    ])

    await message.answer_photo(photo=file_id, caption=caption, reply_markup=kb)
    await state.set_state(OrderState.confirming_order)

async def confirm_order(callback: types.CallbackQuery, state: FSMContext):
    await callback.answer()
    data = await state.get_data()
    user = callback.from_user

    SHEET.append_row([
        datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        user.full_name,
        user.id,
        data.get('material'),
        data.get('size'),
        data.get('format'),
        data.get('font'),
        data.get('person_info'),
        data.get('background'),
        data.get('photo_id')
    ])

    await callback.message.answer("✅ Заказ принят и сохранён. Спасибо!")
    await state.clear()

# --- Регистрация хендлеров ---
def register_handlers(dp: Dispatcher):
    dp.message.register(cmd_start, Command(commands=["start"]))
    dp.callback_query.register(material_chosen, F.data.startswith("material_"), StateFilter(OrderState.waiting_for_material))
    dp.callback_query.register(size_chosen, F.data.startswith("size_"), StateFilter(OrderState.waiting_for_size))
    dp.callback_query.register(format_chosen, F.data.startswith("format_"), StateFilter(OrderState.waiting_for_format))
    dp.callback_query.register(more_fonts, F.data == "more_fonts", StateFilter(OrderState.showing_fonts))
    dp.callback_query.register(font_selected, F.data.startswith("font_"), StateFilter(OrderState.showing_fonts))
    dp.message.register(person_data_entered, StateFilter(OrderState.entering_person_data))
    dp.callback_query.register(more_backgrounds, F.data == "more_bgs", StateFilter(OrderState.showing_backgrounds))
    dp.callback_query.register(background_selected, F.data.startswith("bg_"), StateFilter(OrderState.showing_backgrounds))
    dp.message.register(photo_uploaded, StateFilter(OrderState.uploading_photo))
    dp.callback_query.register(confirm_order, F.data == "confirm_order", StateFilter(OrderState.confirming_order))

if __name__ == "__main__":
    asyncio.run(main())
