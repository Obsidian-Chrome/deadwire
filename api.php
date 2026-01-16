<?php
// Proxy PHP pour Google Calendar API
// Cache les identifiants côté serveur

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'config.php';

// Récupère les paramètres de la requête
$timeMin = isset($_GET['timeMin']) ? $_GET['timeMin'] : '';
$timeMax = isset($_GET['timeMax']) ? $_GET['timeMax'] : '';

// Validation basique
if (empty($timeMin) || empty($timeMax)) {
    http_response_code(400);
    echo json_encode(['error' => 'Paramètres timeMin et timeMax requis']);
    exit;
}

// Construction de l'URL de l'API Google Calendar
$url = sprintf(
    'https://www.googleapis.com/calendar/v3/calendars/%s/events?key=%s&timeMin=%s&timeMax=%s&maxResults=%d&singleEvents=true&orderBy=startTime',
    urlencode(GOOGLE_CALENDAR_ID),
    GOOGLE_API_KEY,
    urlencode($timeMin),
    urlencode($timeMax),
    MAX_RESULTS
);

// Appel à l'API Google Calendar
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Gestion des erreurs
if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la connexion à Google Calendar: ' . $curlError]);
    exit;
}

// Retourne la réponse de Google Calendar
http_response_code($httpCode);
echo $response;
