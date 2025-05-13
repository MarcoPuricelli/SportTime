<?php
require_once '../config/database.php';
require_once '../vendor/autoload.php'; // Richiede FPDF (installabile con Composer)

use FPDF\FPDF;

// Verifica se è stato fornito l'ID del risultato
if (!isset($_GET['result_id'])) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['error' => 'Result ID is required']);
    exit;
}

$resultId = $_GET['result_id'];

try {
    // Ottieni i dati del risultato
    $sql = "SELECT r.*, p.first_name, p.last_name, p.gender, p.birth_date, p.nationality, 
                   p.team_name, e.title as event_title, e.date as event_date, 
                   rt.name as route_name, c.name as category_name
            FROM results r 
            JOIN participants p ON r.participant_id = p.id 
            JOIN events e ON r.event_id = e.id 
            JOIN routes rt ON r.route_id = rt.id 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE r.id = :result_id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['result_id' => $resultId]);
    $result = $stmt->fetch();
    
    if (!$result) {
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['error' => 'Result not found']);
        exit;
    }
    
    // Crea il PDF
    $pdf = new FPDF('L', 'mm', 'A4'); // Orizzontale (Landscape)
    $pdf->AddPage();
    
    // Imposta lo sfondo
    $pdf->Image('../public/images/certificate-bg.jpg', 0, 0, 297, 210); // A4 landscape dimensions
    
    // Titolo
    $pdf->SetFont('Arial', 'B', 24);
    $pdf->SetTextColor(50, 50, 50);
    $pdf->Cell(0, 20, 'CERTIFICATO DI PARTECIPAZIONE', 0, 1, 'C');
    
    // Evento e data
    $pdf->SetFont('Arial', 'B', 16);
    $pdf->Cell(0, 15, $result['event_title'] . ' - ' . date('d/m/Y', strtotime($result['event_date'])), 0, 1, 'C');
    
    // Dati partecipante
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->Cell(0, 20, 'Questo certifica che', 0, 1, 'C');
    
    $pdf->SetFont('Arial', 'B', 22);
    $pdf->Cell(0, 15, $result['first_name'] . ' ' . $result['last_name'], 0, 1, 'C');
    
    $pdf->SetFont('Arial', '', 14);
    $pdf->Cell(0, 10, 'ha completato con successo', 0, 1, 'C');
    
    $pdf->SetFont('Arial', 'B', 18);
    $pdf->Cell(0, 15, $result['route_name'], 0, 1, 'C');
    
    // Risultati
    $pdf->SetFont('Arial', '', 14);
    $pdf->Cell(0, 10, 'Tempo reale: ' . $result['real_time'], 0, 1, 'C');
    $pdf->Cell(0, 10, 'Posizione generale: ' . $result['position'], 0, 1, 'C');
    
    if ($result['gender'] === 'M') {
        $genderText = 'maschile';
    } else {
        $genderText = 'femminile';
    }
    
    $pdf->Cell(0, 10, 'Posizione ' . $genderText . ': ' . $result['gender_position'], 0, 1, 'C');
    $pdf->Cell(0, 10, 'Posizione categoria ' . $result['category_name'] . ': ' . $result['category_position'], 0, 1, 'C');
    
    // Data generazione certificato
    $pdf->SetFont('Arial', 'I', 10);
    $pdf->Cell(0, 20, 'Certificato generato il ' . date('d/m/Y'), 0, 1, 'C');
    
    // Output del PDF
    $pdf->Output('D', 'certificato_' . $result['first_name'] . '_' . $result['last_name'] . '.pdf');
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}