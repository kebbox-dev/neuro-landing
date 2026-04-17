<?php
/**
 * Telegram Form Proxy
 * Токен читается из .env файла рядом с этим файлом.
 * Сам send.php можно безопасно хранить в Git — токена внутри нет.
 */
date_default_timezone_set('Europe/Moscow');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Only POST allowed']);
    exit;
}

// === Читаем .env (без сторонних библиотек) ===
$envFile = __DIR__ . '/.env';
$botToken = '';
$chatId = '';

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, '#') === 0) continue; // комментарии
        if (strpos($line, '=') === false) continue;
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        if ($key === 'TELEGRAM_BOT_TOKEN') $botToken = $value;
        if ($key === 'TELEGRAM_CHAT_ID')   $chatId   = $value;
    }
}

if (empty($botToken) || empty($chatId)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server not configured']);
    error_log('send.php: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set in .env');
    exit;
}

// === Читаем JSON из тела ===
$input = json_decode(file_get_contents('php://input'), true);
$name    = trim($input['name'] ?? '');
$company = trim($input['company'] ?? 'Не указана');
$phone   = trim($input['phone'] ?? '');
$email   = trim($input['email'] ?? 'Не указан');

if (empty($name) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name and phone required']);
    exit;
}

// === Отправляем в Telegram ===
$htmlText = "🔔 <b>Новая заявка!</b>\n\n"
    . "👤 <b>Имя:</b> " . htmlspecialchars($name) . "\n"
    . "🏢 <b>Компания:</b> " . htmlspecialchars($company) . "\n"
    . "📞 <b>Телефон:</b> " . htmlspecialchars($phone) . "\n"
    . "📧 <b>E-mail:</b> " . htmlspecialchars($email) . "\n"
    . "⏰ <b>Время:</b> " . date('d.m.Y, H:i:s');

$ch = curl_init("https://telegram.anoxx2602.workers.dev/");

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'chat_id'    => $chatId,
    'text'       => $htmlText,
    'parse_mode' => 'HTML',
]));

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: P16BMEQwnk'
]);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$curlErr  = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($curlErr) {
    error_log("send.php: curl error: {$curlErr}");
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => "Curl error: {$curlErr}"]);
    exit;
}

if ($httpCode === 200 && $response) {
    echo json_encode(['success' => true]);
} else {
    error_log("Telegram API error ({$httpCode}): {$response}");
    echo json_encode([
        'success' => false,
        'error'   => "Telegram responded {$httpCode}: {$response}",
    ]);
}
