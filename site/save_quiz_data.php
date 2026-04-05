<?php
// Включаем вывод всех ошибок
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Получаем данные
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Функция для получения ID по названию
function getIdByTitle($conn, $table, $title, $idField) {
    if (empty($title)) return null;

    $stmt = $conn->prepare("SELECT $idField FROM $table WHERE title = ?");
    $stmt->bind_param("s", $title);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        return $row[$idField];
    }
    return null;
}

// Функция для получения ID зоны
function getZoneId($conn, $zoneTitle) {
    if (empty($zoneTitle)) return null;

    $stmt = $conn->prepare("SELECT zns_id FROM zones WHERE title = ?");
    $stmt->bind_param("s", $zoneTitle);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        return $row['zns_id'];
    }
    return null;
}

try {
    // Подключение к БД
    $conn = new mysqli('localhost', 'quiz_api', 'Str0ngPass!23', 'mydb');

    if ($conn->connect_error) {
        // Пробуем root если quiz_api не работает
        $conn = new mysqli('localhost', 'root', '', 'mydb');
        if ($conn->connect_error) {
            throw new Exception("Ошибка подключения: " . $conn->connect_error);
        }
    }

    $conn->set_charset("utf8mb4");

    // Получаем ID из справочных таблиц
    $roomTypeId = getIdByTitle($conn, 'room_types', $data['room_type'], 'rtp_id');
    $styleId = getIdByTitle($conn, 'styles', $data['style'], 'stl_id');
    $budgetId = getIdByTitle($conn, 'budgets', $data['budget'], 'bdt_id');

    // Если ID не найдены, используем значения по умолчанию
    if (!$roomTypeId) $roomTypeId = 1;
    if (!$styleId) $styleId = 1;
    if (!$budgetId) $budgetId = 1;

    // Подготовка данных
    $name = !empty($data['name']) ? $data['name'] : 'Аноним';
    $phone = !empty($data['phone']) ? $data['phone'] : '';
    $email = !empty($data['email']) ? $data['email'] : '';
    $comment = !empty($data['comment']) ? $data['comment'] : '';
    $area = !empty($data['area']) ? (int)$data['area'] : 0;
    $consentAccepted = isset($data['consent_accepted']) ? (int)$data['consent_accepted'] : 1;

    // Вставляем в таблицу leads
    $sql = "INSERT INTO leads (first_name, phone_number, email, comment, budgets_bdt_id, styles_stl_id, room_types_rtp_id, area, consent_accepted, time_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssiiiii",
        $name,
        $phone,
        $email,
        $comment,
        $budgetId,
        $styleId,
        $roomTypeId,
        $area,
        $consentAccepted
    );

    if (!$stmt->execute()) {
        throw new Exception("Ошибка вставки: " . $stmt->error);
    }

    $leadId = $stmt->insert_id;

    // Вставляем выбранные зоны
    if (!empty($data['zones']) && is_array($data['zones'])) {
        $zoneStmt = $conn->prepare("INSERT INTO leads_has_zones (leads_lds_id, zones_zns_id) VALUES (?, ?)");

        foreach ($data['zones'] as $zoneTitle) {
            $zoneId = getZoneId($conn, $zoneTitle);
            if ($zoneId) {
                $zoneStmt->bind_param("ii", $leadId, $zoneId);
                $zoneStmt->execute();
            }
        }
        $zoneStmt->close();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Заявка успешно сохранена',
        'lead_id' => $leadId,
        'debug' => [
            'room_type_id' => $roomTypeId,
            'style_id' => $styleId,
            'budget_id' => $budgetId
        ]
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>