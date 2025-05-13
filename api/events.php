<?php
header('Content-Type: application/json');
require_once '../config/database.php';

// Gestione delle richieste
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Verifica se è richiesto un evento specifico
        if (isset($_GET['id'])) {
            getEvent($pdo, $_GET['id']);
        } else {
            // Verifica se è richiesto il filtro per eventi passati o futuri
            $type = isset($_GET['type']) ? $_GET['type'] : 'upcoming';
            getEvents($pdo, $type);
        }
        break;
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Funzione per ottenere tutti gli eventi
function getEvents($pdo, $type = 'upcoming') {
    try {
        $today = date('Y-m-d');
        
        if ($type === 'past') {
            $sql = "SELECT e.*, COUNT(p.id) as participants_count 
                    FROM events e 
                    LEFT JOIN participants p ON e.id = p.event_id 
                    WHERE e.date < :today 
                    GROUP BY e.id 
                    ORDER BY e.date DESC";
        } else {
            $sql = "SELECT e.*, COUNT(p.id) as participants_count 
                    FROM events e 
                    LEFT JOIN participants p ON e.id = p.event_id 
                    WHERE e.date >= :today 
                    GROUP BY e.id 
                    ORDER BY e.date ASC";
        }
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['today' => $today]);
        $events = $stmt->fetchAll();
        
        echo json_encode($events);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Funzione per ottenere un evento specifico
/*function getEvent($pdo, $id) {
    try {
        // Ottieni i dettagli dell'evento
        $sql = "SELECT * FROM events WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $event = $stmt->fetch();
        
        if (!$event) {
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
            return;
        }
        
        // Ottieni i percorsi dell'evento
        $sql = "SELECT * FROM routes WHERE event_id = :event_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['event_id' => $id]);
        $routes = $stmt->fetchAll();
        
        // Aggiungi i percorsi all'evento
        $event['routes'] = $routes;
        
        // Calcola se l'evento è passato
        $event['is_past'] = strtotime($event['date']) < strtotime(date('Y-m-d'));
        
        echo json_encode($event);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}*/

// Funzione per ottenere un evento specifico
function getEvent($pdo, $id) {
    try {
        // Ottieni i dettagli dell'evento
        $sql = "SELECT * FROM events WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $event = $stmt->fetch();
        
        if (!$event) {
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
            return;
        }
        
        // Ottieni i percorsi dell'evento
        $sql = "SELECT * FROM routes WHERE event_id = :event_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['event_id' => $id]);
        $routes = $stmt->fetchAll();
        
        // Aggiungi i percorsi all'evento
        $event['routes'] = $routes;
        
        // Calcola se l'evento è passato
        $event['is_past'] = strtotime($event['date']) < strtotime(date('Y-m-d'));
        
        // Aggiungi le categorie
        $sql = "SELECT * FROM categories"; // Supponiamo che ci sia una tabella 'categories'
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $categories = $stmt->fetchAll();
        $event['categories'] = $categories;

        // Aggiungi le nazionalità
        $sql = "SELECT DISTINCT nationality FROM participants WHERE event_id = :event_id"; // Otteniamo le nazionalità uniche
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['event_id' => $id]);
        $nationalities = $stmt->fetchAll(PDO::FETCH_COLUMN); // Recuperiamo solo i valori delle nazionalità
        $event['nationalities'] = $nationalities;
        
        echo json_encode($event);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}