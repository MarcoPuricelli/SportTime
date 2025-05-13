<?php
header('Content-Type: application/json');
require_once '../config/database.php';

//gestione delle richieste
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        //erifica del tipo di richiesta
        $action = $_GET['action'] ?? '';
        
        if ($action === 'register') {
            register($pdo);
        } elseif ($action === 'login') {
            login($pdo);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
        break;
    default:
        http_response_code(405); //method Not Allowed
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

//funzione per la registrazione
function register($pdo) {
    try {
        //ottenere dati dal corpo della richiesta
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validazione dei dati
        if (!isset($data['firstName']) || !isset($data['lastName']) || 
            !isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        // Verifica se l'email è già in uso
        $sql = "SELECT id FROM users WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['email' => $data['email']]);
        
        if ($stmt->rowCount() > 0) {
            http_response_code(409); // Conflict
            echo json_encode(['error' => 'Email already in use']);
            return;
        }
        
        // Hash della password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Inserisci l'utente
        $sql = "INSERT INTO users (first_name, last_name, email, password) 
                VALUES (:first_name, :last_name, :email, :password)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'email' => $data['email'],
            'password' => $hashedPassword
        ]);
        
        $userId = $pdo->lastInsertId();
        
        http_response_code(201); // Created
        echo json_encode([
            'success' => true,
            'message' => 'User registered successfully',
            'user_id' => $userId
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Funzione per il login
function login($pdo) {
    try {
        // Ottieni i dati dal corpo della richiesta
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validazione dei dati
        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing email or password']);
            return;
        }
        
        // Cerca l'utente
        $sql = "SELECT id, first_name, last_name, email, password FROM users WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['email' => $data['email']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($data['password'], $user['password'])) {
            http_response_code(401); // Unauthorized
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }
        
        // Rimuovi la password dall'oggetto utente
        unset($user['password']);
        
        // Inizia la sessione
        session_start();
        $_SESSION['user'] = $user;
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}