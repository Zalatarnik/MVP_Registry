import telebot
from telebot import types
import json
import os
import re
from datetime import datetime

# Инициализация бота
bot = telebot.TeleBot('7898905655:AAGAQK6WuK7tY4z1B96NcAPl6Xe35N-wDig')

# Файлы для хранения данных
USERS_FILE = 'users.json'
FORMS_FILE = 'forms.json'
ADMINS_FILE = 'admins.json'
PENDING_ADMINS_FILE = 'pending_admins.json'

# ID главного администратора (ваш ID)
MAIN_ADMIN_ID = 1091927398

# Загрузка данных
def load_data(filename):
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

# Сохранение данных
def save_data(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# Получение username пользователя
def get_username(message):
    return f"@{message.from_user.username}" if message.from_user.username else "no_username"

# Проверка сложности пароля (упрощенная версия)
def is_password_strong(password):
    if len(password) < 8:
        return False
    if not re.search(r'[0-9]', password):
        return False
    if not re.search(r'[^A-Za-zА-Яа-яЁё0-9]', password):
        return False
    return True

# Загрузка пользователей, форм и администраторов
users = load_data(USERS_FILE)
forms = load_data(FORMS_FILE)
admins = load_data(ADMINS_FILE)
pending_admins = load_data(PENDING_ADMINS_FILE)

# Состояния пользователя
user_states = {}

# Варианты статуса мероприятия
EVENT_STATUSES = [
    "Внутривузовский",
    "Региональный",
    "Городской",
    "Всероссийский",
    "Международный"
]

# Обработчик команды /start
@bot.message_handler(commands=['start'])
def start(message):
    user_id = str(message.from_user.id)
    username = get_username(message)
    
    if user_id in admins:
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        btn_form = types.KeyboardButton('📝 Заполнить форму')
        btn_profile = types.KeyboardButton('👤 Мой профиль')
        btn_admin = types.KeyboardButton('⚙️ Панель администратора')
        markup.add(btn_form, btn_profile, btn_admin)
        bot.send_message(message.chat.id, f"Добро пожаловать, администратор! Выберите действие:", reply_markup=markup)
    elif user_id in users:
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        btn_form = types.KeyboardButton('📝 Заполнить форму')
        btn_profile = types.KeyboardButton('👤 Мой профиль')
        btn_admin = types.KeyboardButton('🔒 Стать администратором')
        markup.add(btn_form, btn_profile, btn_admin)
        bot.send_message(message.chat.id, "Выберите действие:", reply_markup=markup)
    else:
        user_states[user_id] = {
            'state': 'register_login',
            'username': username
        }
        bot.send_message(message.chat.id, "Добро пожаловать! Для регистрации введите логин:")

# Обработчик текстовых сообщений
@bot.message_handler(content_types=['text'])
def handle_text(message):
    user_id = str(message.from_user.id)
    chat_id = message.chat.id
    text = message.text
    
    if user_id in user_states:
        state = user_states[user_id]['state']
        
        if state == 'admin_fio':
            text = ' '.join(word.capitalize() for word in text.lower().split())
            
            if not re.fullmatch(r'^[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+$', text):
                bot.send_message(chat_id, "Пожалуйста, введите ФИО в формате 'Иванов Иван Иванович':")
                return
                
            user_states[user_id]['admin_data'] = {
                'fio': text,
                'username': get_username(message)
            }
            user_states[user_id]['state'] = 'admin_login'
            bot.send_message(chat_id, "Придумайте логин для администратора (минимум 4 символа):")
        
        elif state == 'admin_login':
            if len(text) < 4:
                bot.send_message(chat_id, "Логин должен содержать минимум 4 символа. Попробуйте еще раз:")
                return
            
            if any(user['login'] == text for user in users.values()):
                bot.send_message(chat_id, "Этот логин уже занят обычным пользователем. Пожалуйста, выберите другой:")
                return
            if any(admin['login'] == text for admin in admins.values()):
                bot.send_message(chat_id, "Этот логин уже занят администратором. Пожалуйста, выберите другой:")
                return
                
            user_states[user_id]['admin_data']['login'] = text
            user_states[user_id]['state'] = 'admin_password'
            bot.send_message(chat_id, "Придумайте надежный пароль (минимум 8 символов, включая цифры и спецсимволы):")
        
        elif state == 'admin_password':
            if not is_password_strong(text):
                bot.send_message(chat_id, "Пароль слишком слабый. Пароль должен содержать:\n- минимум 8 символов\n- цифры\n- спецсимволы\n\nПопробуйте еще раз:")
                return
                
            user_states[user_id]['admin_data']['password'] = text
            user_states[user_id]['admin_data']['user_id'] = user_id
            
            admin_data = user_states[user_id]['admin_data']
            markup = types.InlineKeyboardMarkup()
            btn_approve = types.InlineKeyboardButton("✅ Одобрить", callback_data=f"approve_admin_{user_id}")
            btn_reject = types.InlineKeyboardButton("❌ Отклонить", callback_data=f"reject_admin_{user_id}")
            markup.add(btn_approve, btn_reject)
            
            bot.send_message(
                MAIN_ADMIN_ID,
                f"🔔 Новая заявка на администратора:\n\n"
                f"👤 ФИО: {admin_data['fio']}\n"
                f"🆔 ID: {user_id}\n"
                f"📱 Username: {admin_data['username']}\n"
                f"🔑 Логин: {admin_data['login']}\n"
                f"🔒 Пароль: {admin_data['password']}\n\n"
                f"Одобрить заявку?",
                reply_markup=markup
            )
            
            pending_admins[user_id] = admin_data
            save_data(pending_admins, PENDING_ADMINS_FILE)
            
            del user_states[user_id]
            
            bot.send_message(chat_id, "Ваша заявка на администратора отправлена на рассмотрение. Ожидайте подтверждения.")
        
        elif state == 'register_login':
            if len(text) < 4:
                bot.send_message(chat_id, "Логин должен содержать минимум 4 символа. Попробуйте еще раз:")
                return
            
            if any(user['login'] == text for user in users.values()):
                bot.send_message(chat_id, "Этот логин уже занят. Пожалуйста, выберите другой:")
                return
                
            user_states[user_id]['login'] = text
            user_states[user_id]['state'] = 'register_password'
            bot.send_message(chat_id, "Отлично! Теперь придумайте пароль (минимум 6 символов):")
        
        elif state == 'register_password':
            if len(text) < 6:
                bot.send_message(chat_id, "Пароль должен содержать минимум 6 символов. Попробуйте еще раз:")
                return
                
            user_states[user_id]['password'] = text
            users[user_id] = {
                'login': user_states[user_id]['login'],
                'password': user_states[user_id]['password'],
                'username': user_states[user_id].get('username', 'no_username')
            }
            save_data(users, USERS_FILE)
            
            del user_states[user_id]
            
            markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
            btn_form = types.KeyboardButton('📝 Заполнить форму')
            btn_profile = types.KeyboardButton('👤 Мой профиль')
            btn_admin = types.KeyboardButton('🔒 Стать администратором')
            markup.add(btn_form, btn_profile, btn_admin)
            
            bot.send_message(chat_id, "Регистрация завершена!", reply_markup=markup)
        
        elif state == 'form_last_name':
            if not re.fullmatch(r'^[А-ЯЁ][а-яё]+$', text):
                bot.send_message(chat_id, "Пожалуйста, введите фамилию с большой буквы (только буквы, без пробелов):")
                return
                
            user_states[user_id]['form_data'] = {
                'last_name': text,
                'username': users.get(user_id, {}).get('username', 'no_username')
            }
            user_states[user_id]['state'] = 'form_first_name'
            bot.send_message(chat_id, "Введите имя*:")
        
        elif state == 'form_first_name':
            if not re.fullmatch(r'^[А-ЯЁ][а-яё]+$', text):
                bot.send_message(chat_id, "Пожалуйста, введите имя с большой буквы (только буквы, без пробелов):")
                return
                
            user_states[user_id]['form_data']['first_name'] = text
            user_states[user_id]['state'] = 'form_middle_name'
            bot.send_message(chat_id, "Введите отчество (или отправьте '-' если отчества нет):")
        
        elif state == 'form_middle_name':
            if text != '-':
                if not re.fullmatch(r'^[А-ЯЁ][а-яё]+$', text):
                    bot.send_message(chat_id, "Пожалуйста, введите отчество с большой буквы (только буквы, без пробелов) или отправьте '-' если отчества нет:")
                    return
                user_states[user_id]['form_data']['middle_name'] = text
            else:
                user_states[user_id]['form_data']['middle_name'] = ''
            
            user_states[user_id]['state'] = 'form_student_id'
            bot.send_message(chat_id, "Введите номер студенческого билета* (только цифры):")
        
        elif state == 'form_student_id':
            if not text.isdigit():
                bot.send_message(chat_id, "Номер студенческого должен содержать только цифры. Попробуйте еще раз:")
                return
                
            user_states[user_id]['form_data']['student_id'] = text
            user_states[user_id]['state'] = 'form_group'
            bot.send_message(chat_id, "Введите название группы* (например, ПИб-1 или 2-ПМИб-1):")
        
        elif state == 'form_group':
            if not re.fullmatch(r'^(\d?-?[А-ЯЁа-яё]+-\d+)$', text):
                bot.send_message(chat_id, "Пожалуйста, введите название группы в формате 'ПИб-1' или '2-ПМИб-1':")
                return
                
            user_states[user_id]['form_data']['group'] = text
            user_states[user_id]['state'] = 'form_teacher'
            bot.send_message(chat_id, "Введите ФИО руководителя* (например: 'Иванов Иван Иванович' или 'иванов иван иванович'):")
        
        elif state == 'form_teacher':
            text = ' '.join(word.capitalize() for word in text.lower().split())
            
            if not re.fullmatch(r'^[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+$', text):
                bot.send_message(chat_id, "Пожалуйста, введите ФИО руководителя в формате 'Иванов Иван Иванович':")
                return
                
            user_states[user_id]['form_data']['teacher'] = text
            user_states[user_id]['state'] = 'form_activity'
            bot.send_message(chat_id, "Введите название активности/соревнования*:")
        
        elif state == 'form_activity':
            if len(text) < 3:
                bot.send_message(chat_id, "Название активности должно содержать минимум 3 символа. Попробуйте еще раз:")
                return
                
            user_states[user_id]['form_data']['activity'] = text
            user_states[user_id]['state'] = 'form_event_status'
            
            markup = types.InlineKeyboardMarkup()
            for status in EVENT_STATUSES:
                markup.add(types.InlineKeyboardButton(status, callback_data=f"status_{status}"))
            
            bot.send_message(chat_id, "Выберите статус мероприятия*:", reply_markup=markup)
        
        elif state == 'form_event_date':
            try:
                date = datetime.strptime(text, '%d.%m.%Y').date()
                today = datetime.now().date()
                if date > today:
                    bot.send_message(chat_id, "Дата не может быть в будущем. Пожалуйста, введите корректную дату:")
                    return
                
                user_states[user_id]['form_data']['event_date'] = text
                user_states[user_id]['state'] = 'form_file'
                bot.send_message(chat_id, "Теперь загрузите файл, подтверждающий участие* (документ или фото):")
            except ValueError:
                bot.send_message(chat_id, "Неверный формат даты. Пожалуйста, введите дату в формате ДД.ММ.ГГГГ:")
        
        elif state == 'form_file_comment':
            user_states[user_id]['form_data']['file_comment'] = text if text != '-' else ''
            
            form_data = user_states[user_id]['form_data']
            form_data['user_id'] = user_id
            forms[user_id] = form_data
            save_data(forms, FORMS_FILE)
            
            del user_states[user_id]
            
            markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
            btn_form = types.KeyboardButton('📝 Заполнить форму')
            btn_profile = types.KeyboardButton('👤 Мой профиль')
            btn_admin = types.KeyboardButton('🔒 Стать администратором')
            markup.add(btn_form, btn_profile, btn_admin)
            
            bot.send_message(chat_id, "Форма успешно сохранена!", reply_markup=markup)
    
    elif text == '📝 Заполнить форму':
        user_states[user_id] = {
            'state': 'form_last_name',
            'username': users.get(user_id, {}).get('username', 'no_username')
        }
        bot.send_message(chat_id, "Пожалуйста, введите вашу фамилию* (с большой буквы, только буквы):")
    
    elif text == '👤 Мой профиль':
        if user_id in admins:
            profile_info = f"👤 Ваш профиль (администратор):\nФИО: {admins[user_id]['fio']}\nЛогин: {admins[user_id]['login']}\nUsername: {admins[user_id]['username']}"
        elif user_id in users:
            profile_info = f"👤 Ваш профиль:\nЛогин: {users[user_id]['login']}\nUsername: {users[user_id].get('username', 'no_username')}"
        else:
            profile_info = "Произошла ошибка. Попробуйте снова."
        bot.send_message(chat_id, profile_info)
    
    elif text == '🔒 Стать администратором':
        if user_id in admins:
            bot.send_message(chat_id, "Вы уже являетесь администратором!")
        else:
            user_states[user_id] = {
                'state': 'admin_fio',
                'username': users.get(user_id, {}).get('username', 'no_username')
            }
            bot.send_message(chat_id, "Для регистрации в качестве администратора введите ваше ФИО (в формате 'Иванов Иван Иванович'):")
    
    elif text == '⚙️ Панель администратора' and user_id in admins:
        bot.send_message(chat_id, "Панель администратора в разработке...")

# Обработчик inline-кнопок
@bot.callback_query_handler(func=lambda call: True)
def callback_inline(call):
    user_id = str(call.from_user.id)
    chat_id = call.message.chat.id
    
    if user_id in user_states and user_states[user_id]['state'] == 'form_event_status':
        if call.data.startswith('status_'):
            status = call.data[7:]
            
            user_states[user_id]['form_data']['event_status'] = status
            user_states[user_id]['state'] = 'form_event_date'
            
            bot.edit_message_reply_markup(
                chat_id=chat_id,
                message_id=call.message.message_id,
                reply_markup=None
            )
            
            bot.send_message(chat_id, "Введите дату проведения мероприятия* (в формате ДД.ММ.ГГГГ):")
    
    elif call.data.startswith('approve_admin_'):
        user_id_to_approve = call.data[14:]
        if user_id_to_approve in pending_admins:
            admins[user_id_to_approve] = pending_admins[user_id_to_approve]
            save_data(admins, ADMINS_FILE)
            
            del pending_admins[user_id_to_approve]
            save_data(pending_admins, PENDING_ADMINS_FILE)
            
            bot.send_message(user_id_to_approve, "🎉 Поздравляем! Ваша заявка на администратора была одобрена.")
            
            bot.edit_message_reply_markup(
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                reply_markup=None
            )
            bot.send_message(call.message.chat.id, f"Заявка пользователя {user_id_to_approve} одобрена.")
    
    elif call.data.startswith('reject_admin_'):
        user_id_to_reject = call.data[13:]
        if user_id_to_reject in pending_admins:
            del pending_admins[user_id_to_reject]
            save_data(pending_admins, PENDING_ADMINS_FILE)
            
            bot.send_message(user_id_to_reject, "❌ Ваша заявка на администратора была отклонена.")
            
            bot.edit_message_reply_markup(
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                reply_markup=None
            )
            bot.send_message(call.message.chat.id, f"Заявка пользователя {user_id_to_reject} отклонена.")

# Обработчик файлов
@bot.message_handler(content_types=['document', 'photo'])
def handle_file(message):
    user_id = str(message.from_user.id)
    
    if user_id in user_states and user_states[user_id]['state'] == 'form_file':
        chat_id = message.chat.id
        
        try:
            if message.content_type == 'document':
                file_info = bot.get_file(message.document.file_id)
                file_name = message.document.file_name
            else:
                file_info = bot.get_file(message.photo[-1].file_id)
                file_name = f"photo_{file_info.file_id}.jpg"
            
            user_states[user_id]['form_data']['file_id'] = file_info.file_id
            user_states[user_id]['form_data']['file_name'] = file_name
            
            user_states[user_id]['state'] = 'form_file_comment'
            bot.send_message(chat_id, "Введите комментарий к файлу (или отправьте '-' если комментария нет):")
        
        except Exception as e:
            bot.send_message(chat_id, f"Произошла ошибка: {str(e)}. Попробуйте снова.")

# Запуск бота
if __name__ == '__main__':
    for filename in [USERS_FILE, FORMS_FILE, ADMINS_FILE, PENDING_ADMINS_FILE]:
        if not os.path.exists(filename):
            save_data({}, filename)
    
    print("Бот запущен...")
    bot.polling(none_stop=True)