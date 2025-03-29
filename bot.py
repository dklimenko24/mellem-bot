import os
import math
import asyncio
import logging
import requests
import json
from aiogram import Bot, Dispatcher, F, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from oauth2client.service_account import ServiceAccountCredentials
import gspread

# Глобальные переменные и настройки
TOKEN = os.getenv("BOT_TOKEN")
if not TOKEN:
    raise ValueError("❌ BOT_TOKEN не найден!")

bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())

SCOPE = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/spreadsheets']
google_creds_json = os.getenv('GOOGLE_CREDS_JSON')

if not google_creds_json:
    raise ValueError("❌ GOOGLE_CREDS_JSON не найдена в переменных среды Railway!")

google_creds_dict = json.loads(google_creds_json)
CREDS = ServiceAccountCredentials.from_json_keyfile_dict(google_creds_dict, SCOPE)
gsheet_client = gspread.authorize(CREDS)
sheet = gsheet_client.open_by_key("1Su2wxfGsk2mOhTC6GbUTJSpVY2T7bdhXVAeXcWJ20MM").sheet1

# Состояния заказа
class OrderState(StatesGroup):
    waiting_for_material = State()
    waiting_for_size = State()
    waiting_for_format = State()
    waiting_for_font = State()
    waiting_for_background = State()
    waiting_for_text = State()

# Функции для загрузки файлов с GitHub
OWNER = "dklimenko24"
REPO = "mellem-bot"
FONT_FOLDER = "font_examples"
BACKGROUND_FOLDER = "background_examples"
BRANCH = "main"

def get_files_from_github(folder_path):
    api_url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{folder_path}?ref={BRANCH}"
    resp = requests.get(api_url)
    return {f["name"]: f["download_url"] for f in resp.json() if f["type"] == "file" and not f["name"].startswith('.gitkeep')}

FONTS = get_files_from_github(FONT_FOLDER)
BACKGROUNDS = get_files_from_github(BACKGROUND_FOLDER)

# Обработчики команд и событий
@dp.message(Command(commands=['start']))
async def start(message: types.Message, state: FSMContext):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Керамика", callback_data="material_keramika")]
    ])
    await message.answer("Выберите материал:", reply_markup=keyboard)
    await state.set_state(OrderState.waiting_for_material)

# Добавь остальные обработчики выбора материала, размера, формата аналогично...

# Сохранение данных заказа в Google Sheets
async def save_order(data):
    row = [data.get("material"), data.get("size"), data.get("format"), data.get("font"), data.get("background"), data.get("text")]
    sheet.append_row(row)

# Обработчик текста для надписи
@dp.message(StateFilter(OrderState.waiting_for_text))
async def text_input(message: types.Message, state: FSMContext):
    await state.update_data(text=message.text)
    data = await state.get_data()
    await save_order(data)
    await message.answer("Заказ успешно сохранён! Спасибо!")
    await state.clear()

# Запуск бота
async def main():
    logging.basicConfig(level=logging.INFO)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
