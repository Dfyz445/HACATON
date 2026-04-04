import sys   #Проверяет подключена ли БД
import os

print("🔍 Шаг 1: Проверяем, установлена ли библиотека...")
try:
    import mysql.connector
    print("✅ mysql.connector найден")
except ImportError:
    print("❌ Библиотека НЕ установлена!")
    print("👉 Выполни в терминале: pip install mysql-connector-python")
    sys.exit(1)

CONFIG = {
    'host': '26.64.81.120',
    'port': 3306,          # <-- МЕНЯЙ ПОРТ ТУТ
    'user': 'quiz_api',
    'password': 'Str0ngPass!23',
    'database': 'mydb',
    'connect_timeout': 5,  # Не даст скрипту зависнуть
    'use_pure': True,
    'charset': 'utf8mb4'
}

print(f"🔌 Шаг 2: Пробуем подключиться к {CONFIG['host']}:{CONFIG['port']}...")
try:
    conn = mysql.connector.connect(**CONFIG)

    if conn.is_connected():
        print("✅ СОЕДИНЕНИЕ УСПЕШНО!")
        cursor = conn.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()[0]
        print(f"📊 Версия сервера: {version}")
        print(f"🗄 Текущая БД: {conn.database}")
        cursor.close()
        conn.close()
    else:
        print("❌ Объект connection создан, но is_connected() == False")

except mysql.connector.Error as e:
    print(f"❌ Ошибка MySQL: {e}")
    print(f"   Код: {e.errno} | SQLState: {e.sqlstate}")
except Exception as e:
    print(f"💥 Неожиданная ошибка: {type(e).name}: {e}")
