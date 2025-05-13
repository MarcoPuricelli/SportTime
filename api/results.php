<?php
header('Content-Type: application/json');
require_once '../config/database.php';

// Gestione delle richieste
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Verifica se è richiesto un evento specifico
        if (isset($_GET['event_id'])) {
            getResultsByEvent($pdo, $_GET['event_id']);
        } elseif (isset($_GET['participant_id'])) {
            getResultsByParticipant($pdo, $_GET['participant_id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Event ID or Participant ID is required']);
        }
        break;
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Funzione per ottenere i risultati di un evento
function getResultsByEvent($pdo, $eventId) {
    try {
        // Applica i filtri se presenti
        $params = ['event_id' => $eventId];
        $conditions = ['r.event_id = :event_id'];
        
        if (isset($_GET['gender']) && $_GET['gender'] !== 'all-genders') {
            $conditions[] = 'p.gender = :gender';
            $params['gender'] = $_GET['gender'];
        }
        
        if (isset($_GET['category']) && $_GET['category'] !== 'all-categories') {
            $conditions[] = 'c.name = :category';
            $params['category'] = $_GET['category'];
        }
        
        if (isset($_GET['nationality']) && $_GET['nationality'] !== 'all-nationalities') {
            $conditions[] = 'p.nationality = :nationality';
            $params['nationality'] = $_GET['nationality'];
        }
        
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $conditions[] = '(p.first_name LIKE :search OR p.last_name LIKE :search OR p.team_name LIKE :search OR p.bib_number LIKE :search)';
            $params['search'] = '%' . $_GET['search'] . '%';
        }
        
        $whereClause = implode(' AND ', $conditions);
        
        $sql = "SELECT r.*, p.bib_number, p.first_name, p.last_name, p.gender, p.birth_date, 
                       p.nationality, p.team_name, c.name as category_name, rt.name as route_name,
                       TIME_TO_SEC(r.gun_time) as gun_time_seconds,
                       TIME_TO_SEC(r.real_time) as real_time_seconds
                FROM results r 
                JOIN participants p ON r.participant_id = p.id 
                LEFT JOIN categories c ON p.category_id = c.id 
                LEFT JOIN routes rt ON r.route_id = rt.id 
                WHERE $whereClause 
                ORDER BY r.position ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll();
        
        // Calcola il passo e formatta i tempi
        foreach ($results as &$result) {
            // Ottieni la distanza dal nome del percorso (es. "10K Race" -> 10)
            preg_match('/(\d+)/', $result['route_name'], $matches);
            $distance = isset($matches[1]) ? (int)$matches[1] : 10; // Default a 10 se non trovato
            
            // Calcola il passo in minuti per km
            $paceSeconds = $result['real_time_seconds'] / $distance;
            $paceMinutes = floor($paceSeconds / 60);
            $paceRemainingSeconds = floor($paceSeconds % 60);
            $result['pace'] = sprintf("%d:%02d", $paceMinutes, $paceRemainingSeconds);
            
            // Calcola il gap dal primo
            if ($result['position'] == 1) {
                $result['gap'] = '+0:00';
            } else {
                // Trova il tempo del primo classificato
                $sqlFirst = "SELECT TIME_TO_SEC(real_time) as winner_time 
                             FROM results 
                             WHERE event_id = :event_id AND position = 1";
                $stmtFirst = $pdo->prepare($sqlFirst);
                $stmtFirst->execute(['event_id' => $eventId]);
                $firstResult = $stmtFirst->fetch();
                
                if ($firstResult) {
                    $gapSeconds = $result['real_time_seconds'] - $firstResult['winner_time'];
                    $gapMinutes = floor($gapSeconds / 60);
                    $gapRemainingSeconds = floor($gapSeconds % 60);
                    $result['gap'] = sprintf("+%d:%02d", $gapMinutes, $gapRemainingSeconds);
                } else {
                    $result['gap'] = 'N/A';
                }
            }
        }
        
        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Funzione per ottenere i risultati di un partecipante
function getResultsByParticipant($pdo, $participantId) {
    try {
        $sql = "SELECT r.*, e.title as event_title, e.date as event_date, 
                       rt.name as route_name, rt.distance as route_distance
                FROM results r 
                JOIN events e ON r.event_id = e.id 
                JOIN routes rt ON r.route_id = rt.id 
                WHERE r.participant_id = :participant_id 
                ORDER BY e.date DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['participant_id' => $participantId]);
        $results = $stmt->fetchAll();
        
        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}