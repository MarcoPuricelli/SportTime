<?php
header('Content-Type: application/json');

// Gestione delle richieste
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Ottieni i dati dal corpo della richiesta
$data = json_decode(file_get_contents('php://input'), true);

// Validazione dei dati
if (!isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email']) || 
    !isset($data['subject']) || !isset($data['message']) || !isset($data['privacyAccepted'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

if (!$data['privacyAccepted']) {
    http_response_code(400);
    echo json_encode(['error' => 'Privacy policy must be accepted']);
    exit;
}

// In un'applicazione reale, qui invieresti l'email
// Per questa demo, simuliamo un'operazione riuscita

// Prepara i dati per l'email
$to = 'info@sporttime.com';
$subject = 'Nuovo messaggio dal sito: ' . $data['subject'];
$message = "Nome: " . $data['firstName'] . " " . $data['lastName'] . "\n";
$message .= "Email: " . $data['email'] . "\n";
if (isset($data['phone']) && !empty($data['phone'])) {
    $message .= "Telefono: " . $data['phone'] . "\n";
}
$message .= "Messaggio: " . $data['message'];

$headers = 'From: ' . $data['email'] . "\r\n" .
    'Reply-To: ' . $data['email'] . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

// In un'applicazione reale, qui invieresti l'email
// mail($to, $subject, $message, $headers);

// Simula un ritardo per l'invio dell'email
sleep(1);

// Restituisci una risposta di successo
echo json_encode([
    'success' => true,
    'message' => 'Messaggio inviato con successo!'
]);