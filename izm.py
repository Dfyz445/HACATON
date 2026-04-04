#Основной код. Добавляет файлы в БД
import mysql.connector
from mysql.connector import Error
import logging

DB_CONFIG = {
    'host': '26.64.81.120',
    'port': 3306,          # <-- МЕНЯЙ ПОРТ ТУТ
    'user': 'quiz_api',
    'password': 'Str0ngPass!23',
    'database': 'mydb',
    'connect_timeout': 5,  # Не даст скрипту зависнуть
    'use_pure': True,
    'charset': 'utf8mb4'
}

def save_lead_to_db(lead_data: dict, zone_ids: list[int] = None):
    conn = None
    try:
        # 1. Подключение
        conn = mysql.connector.connect(**DB_CONFIG)
        conn.start_transaction()
        cursor = conn.cursor()

        # 2. SQL запрос (проверь названия колонок!)
        sql_insert = """
            INSERT INTO leads 
            (phone_number, first_name, last_name, area, room_types_rtp_id, budgets_bdt_id,
             styles_stl_id, status, consent_accepted, page_url, utm_source)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            lead_data['phone'],
            lead_data.get('first_name'),  # поменял местами чтобы было логично
            lead_data.get('last_name'),
            lead_data.get('area'),
            lead_data.get('room_type_id'),
            lead_data.get('budget_id'),
            lead_data.get('style_id'),
            'new',
            1,
            lead_data.get('url'),
            lead_data.get('utm_source')
        )

        cursor.execute(sql_insert, values)
        new_lead_id = cursor.lastrowid
        print(f"✅ Заявка создана под номером: {new_lead_id}")

        if zone_ids and len(zone_ids) > 0:
            sql_zones = "INSERT INTO leads_has_zones (leads_lds_id, zones_zns_id) VALUES (%s, %s)"
            zones_values = [(new_lead_id, zid) for zid in zone_ids]
            cursor.executemany(sql_zones, zones_values)

        # 5. САМОЕ ГЛАВНОЕ: Сохраняем изменения
        conn.commit()
        print(f"✅ Заявка #{new_lead_id} успешно сохранена!")
        return new_lead_id

    except Error as e:
        if conn:
            conn.rollback() # Если ошибка — отменяем всё
        print(f"❌ Ошибка сохранения: {e}")
        logging.error(f"DB Error: {e}")
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    test_data = {
        'phone': '+79990001122',
        'first_name': 'Тестовый Клиент',
        'last_name': 'Тестовый Клиент',
        'area': 60,
        'room_type_id': 1,  # ID из таблицы room_types
        'budget_id': 2,     # ID из budgets
        'style_id': 4,      # ID из styles
        'url': 'https://quiz-site.ru/',
        'utm_source': 'test'
    }
    save_lead_to_db(test_data, zone_ids=[1, 3])

