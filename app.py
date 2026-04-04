#Тестовый, определяет БД
import mysql.connector
from mysql.connector import Error
import os

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'mydb'),
    'user': os.getenv('DB_USER', 'quiz_api'),
    'password': os.getenv('DB_PASSWORD', 'Str0ngPass!23'),
    'port': 3306,
    'charset': 'utf8mb4',
    'use_pure': True
}

def create_lead(data: dict, zone_ids: list[int]) -> int:
    """
    Создает заявку и возвращает её ID.
    data: dict с полями phone_number, name, area, room_types_rtp_id, budgets_bdt_id, styles_stl_id, status, consent_accepted, page_url, utm_source
    zone_ids: список ID выбранных зон, например [1, 3, 5]
    """
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        connection.start_transaction()
        cursor = connection.cursor()
        insert_lead_sql = """
                INSERT INTO leads 
                (phone_number, name, area, room_types_rtp_id, budgets_bdt_id, styles_stl_id, status, consent_accepted, page_url, utm_source)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
        lead_values = (
        data['phone_number'],
        data.get('name'),
        data['area'],
        data['room_types_rtp_id'],
        data.get('budgets_bdt_id'),
        data.get('styles_stl_id'),
        data.get('status', 'new'),
        data.get('consent_accepted', 1),
        data.get('page_url'),
        data.get('utm_source')
    )
        cursor.execute(insert_lead_sql, lead_values)
        new_lead_id = cursor.lastrowid
        if zone_ids:
            insert_zones_sql = """
                      INSERT INTO leads_has_zones (leads_lds_id, zones_zns_id)
                      VALUES (%s, %s)
                  """
            zones_data = [(new_lead_id, zone_id) for zone_id in zone_ids]
            cursor.executemany(insert_zones_sql, zones_data)

        connection.commit()
        print(f"Заявка успешно создана! ID: {new_lead_id}")
        return new_lead_id

    except Error as e:
        if connection and connection.is_connected():
                connection.rollback()
        print(f"Ошибка базы данных: {e}")
        raise e
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

