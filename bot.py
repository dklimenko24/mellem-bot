import os
import math
import asyncio
import logging
import requests  # <-- нужно для запросов к GitHub API

from aiogram import Bot, Dispatcher, F, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command
from aiogram.filters.state import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

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

# --- ПАПКА, ОТКУДА БЕРЁМ ШРИФТЫ ---
OWNER = "dklimenko24"
REPO = "mellem-bot"
FOLDER_PATH = "font_examples"  # папка с 32 картинками
BRANCH = "main"

# --- ЦЕНЫ (оптовые) ---
KERAMIKA_PRICES = {
    "13x18": 1100, "15x20": 1400, "18x24": 2000, "20x30": 2700,
    "24x30": 3300, "30x40": 5000, "40x50": 13000, "40x60": 13300,
    "50x70": 17200, "50x90": 27000, "50x100": 32000, "60x20": 44000,
}

METAL_OVAL_PRICES = {
    "13x18": 850, "14x25": 950, "16x23": 1000, "18x24": 1100,
    "20x30": 1500, "24x30": 1700, "25x40": 2600, "30x40": 3500,
}

METAL_PRYAM_PRICES = {
    "13x18": 850, "15x20": 1050, "18x24": 1150, "20x30": 1550,
    "24x30": 1750, "30x40": 3600, "40x50": 14000,
}

# --- 1) ФУНКЦИЯ ПОЛУЧЕНИЯ СПИСКА ШРИФТОВ С RAW-ССЫЛКАМИ ---
def get_font_urls():
    """
    Обращается к GitHub API и возвращает словарь { "имя_файла": "raw_url", ... }
    """
    api_url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{FOLDER_PATH}?ref={BRANCH}"
    resp = requests.get(api_url)
    if resp.status_code != 200:
        logging.error(f"Ошибка запроса к GitHub API: {resp.status_code} {resp.text}")
        return {}

    data = resp.json()
    font_urls = {}
    for file_info in data:
        if file_info["type"] == "file":
            # download_url даёт прямую (raw) ссылку на файл
            filename = file_info["name"]  # например "A (10).jpg"
            raw_url = file_info["download_url"]
            font_urls[filename] = raw_url
    return font_urls

# --- 2) Грузим список шрифтов в ГЛОБАЛЬНУЮ ПЕРЕМЕННУЮ (чтобы не запрашивать каждый раз) ---
FONTS = get_font_urls()

# --- ПОДСЧЁТ РОЗНИЧНОЙ ЦЕНЫ ---
def calculate_retail_price(wholesale_price: int) -> int:
    return math.floor(wholesale_price * 1.3 / 50) * 50

# --- КЛАВИАТУРЫ ---
def create_size_keyboard(prices: dict) -> InlineKeyboardMarkup:
    rows = []
    for size, price in prices.items():
        text = f"{size} – {calculate_retail_price(price)} руб."
        rows.append([InlineKeyboardButton(text=text, callback_data=f"size_{size}")])
    return InlineKeyboardMarkup(inline_keyboard=rows)

def format_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🖼 Портрет с надписью", callback_data="format_with_text")],
        [InlineKeyboardButton(text="🖼 Портрет без надписи", callback_data="format_without_text")],
        [InlineKeyboardButton(text="🔤 Только надпись", callback_data="format_text_only")],
    ])

# --- ХЕНДЛЕРЫ ---

# /start
async def cmd_start(message: types.Message, state: FSMContext):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🟦 Керамика", callback_data="material_keramika")],
        [InlineKeyboardButton(text="🟨 Металлокерамика (овал)", callback_data="material_metal_oval")],
        [InlineKeyboardButton(text="🟥 Металлокерамика (прямоугольная)", callback_data="material_metal_pryam")],
        [InlineKeyboardButton(text="🔷 Своя форма", callback_data="material_custom")]
    ])
    await message.answer("Привет! Выберите тип изделия:", reply_markup=keyboard)
    await state.set_state(OrderState.waiting_for_material)

# Выбор материала
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
    else:
        await callback.message.answer("Функция 'своя форма' пока в разработке.")
        await state.clear()
        return

    keyboard = create_size_keyboard(prices)
    await state.update_data(prices_dict=material)
    await callback.message.answer("Теперь выберите размер:", reply_markup=keyboard)
    await state.set_state(OrderState.waiting_for_size)

# Выбор размера
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
        await state.clear()
        return

    retail = calculate_retail_price(price)
    await state.update_data(size=size, price=retail)
    await callback.message.answer(
        f"Вы выбрали:\nМатериал: {material}\nРазмер: {size}\nЦена: {ret
