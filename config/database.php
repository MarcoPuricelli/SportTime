<?php
// Parametri di connessione al database
$host = 'localhost';
$db_name = 'race_timing';
$username = 'root';
$password = '';
$charset = 'utf8mb4';

// Opzioni PDO
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// Stringa di connessione DSN
$dsn = "mysql:host=$host;dbname=$db_name;charset=$charset";

try {
    // Creazione della connessione PDO
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    // In caso di errore
    throw new PDOException($e->getMessage(), (int)$e->getCode());
}