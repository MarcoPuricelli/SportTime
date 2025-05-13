<?php
header('Content-Type: application/json');
require_once '../config/database.php';

// Gestione delle richieste
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Verifica se è richiesto un evento specifico
        if (isset($_GET['event_id'])) {
            getParticipantsByEvent($pdo, $_GET['event_id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Event ID is required']);
        }
        break;
    case 'POST':
        // Registrazione di un nuovo partecipante
        registerParticipant($pdo);
        break;
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(['error' => 'Method not allowed']);
        break;
}


// Funzione per ottenere i partecipanti di un evento con paginazione
function getParticipantsByEvent($pdo, $eventId) {
    try {
        // Parametri base
        $params = ['event_id' => $eventId];
        $conditions = ['p.event_id = :event_id'];

        // Applica i filtri se presenti
        if (isset($_GET['gender']) && $_GET['gender'] !== 'all') {
            $conditions[] = 'p.gender = :gender';
            $params['gender'] = $_GET['gender'];
        }

        if (isset($_GET['category']) && $_GET['category'] !== 'all') {
            $conditions[] = 'c.name = :category';
            $params['category'] = $_GET['category'];
        }

        if (isset($_GET['nationality']) && $_GET['nationality'] !== 'all') {
            $conditions[] = 'p.nationality = :nationality';
            $params['nationality'] = $_GET['nationality'];
        }

        if (isset($_GET['route']) && $_GET['route'] !== 'all') {
            $conditions[] = 'r.id = :route_id';
            $params['route_id'] = $_GET['route'];
        }

        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $conditions[] = '(p.first_name LIKE :search_first_name OR p.last_name LIKE :search_last_name OR p.team_name LIKE :search_team_name OR p.bib_number LIKE :search_bib_number)';
            $params['search_first_name'] = '%' . $_GET['search'] . '%';
            $params['search_last_name'] = '%' . $_GET['search'] . '%';
            $params['search_team_name'] = '%' . $_GET['search'] . '%';
            $params['search_bib_number'] = '%' . $_GET['search'] . '%';
        }

        // Genera la clausola WHERE
        $whereClause = implode(' AND ', $conditions);

        // Debug della query finale e dei parametri
        //echo "WHERE CLAUSE: $whereClause\n";
        //print_r($params);

        // ✨ Conteggio totale partecipanti per la paginazione
        $countSql = "SELECT COUNT(*) FROM participants p
                     LEFT JOIN categories c ON p.category_id = c.id 
                     LEFT JOIN routes r ON p.route_id = r.id 
                     WHERE $whereClause";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $totalCount = $countStmt->fetchColumn();

        // ✨ Paginazione
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $totalPages = ceil($totalCount / $limit);

        // ✨ Query per ottenere i partecipanti con limit e offset
        $sql = "SELECT p.*, c.name as category_name, r.name as route_name, r.type as route_type 
                FROM participants p 
                LEFT JOIN categories c ON p.category_id = c.id 
                LEFT JOIN routes r ON p.route_id = r.id 
                WHERE $whereClause 
                ORDER BY p.bib_number ASC 
                LIMIT :limit OFFSET :offset";

        // Debug della query finale
        //echo "QUERY: $sql\n";

        $stmt = $pdo->prepare($sql);
        
        // Binding dei parametri
        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }

        // Binding dei parametri di limit e offset
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

        // Esecuzione della query
        $stmt->execute();
        $participants = $stmt->fetchAll();

        // ✨ Restituzione dei dati in formato JSON
        echo json_encode([
            'participants' => $participants,
            'total_count' => $totalCount,
            'total_pages' => $totalPages
        ]);
    } catch (PDOException $e) {
        // In caso di errore, mostrare la query e i parametri
        /*echo "Errore nella query\n";
        echo "WHERE CLAUSE: $whereClause\n";
        print_r($params);
        echo "Messaggio di errore: " . $e->getMessage();
        die();*/
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}


// Funzione per registrare un nuovo partecipante
function registerParticipant($pdo) {
    try {
        // Ottieni i dati dal corpo della richiesta
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validazione dei dati
        if (!isset($data['firstName']) || !isset($data['lastName']) || !isset($data['gender']) || 
            !isset($data['birthDate']) || !isset($data['email']) || !isset($data['eventId']) || 
            !isset($data['routeId'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        // Calcola la categoria in base all'età
        $birthDate = new DateTime($data['birthDate']);
        $today = new DateTime();
        $age = $today->format('Y') - $birthDate->format('Y');

        
        $sql = "SELECT id FROM categories WHERE :age BETWEEN min_age AND max_age";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['age' => $age]);
        $category = $stmt->fetch();
        
        if (!$category) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid age category']);
            return;
        }
        
        // Genera un numero di pettorale
        $sql = "SELECT MAX(bib_number) as max_bib FROM participants WHERE event_id = :event_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['event_id' => $data['eventId']]);
        $result = $stmt->fetch();
        $bibNumber = ($result['max_bib'] ?? 0) + 1;
        
        // Inserisci il partecipante
        $sql = "INSERT INTO participants (
                    bib_number, first_name, last_name, gender, birth_date, nationality, 
                    fiscal_code, email, phone, team_name, team_code, team_type, 
                    category_id, event_id, route_id
                ) VALUES (
                    :bib_number, :first_name, :last_name, :gender, :birth_date, :nationality, 
                    :fiscal_code, :email, :phone, :team_name, :team_code, :team_type, 
                    :category_id, :event_id, :route_id
                )";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'bib_number' => $bibNumber,
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'gender' => $data['gender'],
            'birth_date' => $data['birthDate'],
            'nationality' => $data['nationality'],
            'fiscal_code' => $data['fiscalCode'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'team_name' => $data['teamName'] ?? null,
            'team_code' => $data['teamCode'] ?? null,
            'team_type' => $data['noTeam'] ? 'None' : ($data['teamType'] ?? 'None'),
            'category_id' => $category['id'],
            'event_id' => $data['eventId'],
            'route_id' => $data['routeId']
        ]);
        
        $participantId = $pdo->lastInsertId();
        
        http_response_code(201); // Created
        echo json_encode([
            'success' => true,
            'message' => 'Participant registered successfully',
            'participant_id' => $participantId,
            'bib_number' => $bibNumber
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}