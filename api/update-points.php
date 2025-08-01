<?php
// Configurações iniciais
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

require_once 'conexao.php';

function sendError($message, $code = 400) {
    http_response_code($code);
    die(json_encode(['success' => false, 'message' => $message]));
}

// Verificar se é POST ou OPTIONS (pré-voo CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendError('Método não permitido', 405);
}

// Obter os dados da requisição
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['email']) || !isset($input['points'])) {
    sendError('E-mail e pontos são obrigatórios');
}

$email = $input['email'];
$points = (int)$input['points']; // Forçar conversão para inteiro

try {
    // Verificar se o usuário existe
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() === 0) {
        sendError('Usuário não encontrado', 404);
    }
    
    // Atualizar os pontos no banco de dados
    $stmt = $conn->prepare("UPDATE users SET loyalty_points = ? WHERE email = ?");
    $stmt->execute([$points, $email]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Pontos atualizados com sucesso',
        'newPoints' => $points
    ]);
} catch (PDOException $e) {
    sendError('Erro ao atualizar pontos no banco de dados: ' . $e->getMessage());
}
?>