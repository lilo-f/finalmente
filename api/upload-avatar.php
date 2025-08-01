<?php
// Configurações iniciais
header("Access-Control-Allow-Origin: *"); // Permite qualquer origem (em desenvolvimento)
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

if (empty($input['email']) || empty($input['avatar'])) {
    sendError('E-mail e avatar são obrigatórios');
}

$email = $input['email'];
$avatarData = $input['avatar'];


// Verificar se é uma string base64 válida
if (!preg_match('/^data:image\/(png|jpeg|jpg);base64,/', $avatarData)) {
    sendError('Formato de imagem não suportado');
}

try {
    // Verificar se o usuário existe
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() === 0) {
        sendError('Usuário não encontrado', 404);
    }
    
    // Validar e limpar a string base64
    $avatarData = preg_replace('/^data:image\/(png|jpeg|jpg);base64,/', '', $input['avatar']);
    $avatarData = str_replace(' ', '+', $avatarData);
    
    // Atualizar o banco de dados com a string base64 limpa
    $stmt = $conn->prepare("UPDATE users SET avatar = ? WHERE email = ?");
    $stmt->execute([$input['avatar'], $email]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Avatar atualizado com sucesso',
        'avatarUrl' => $input['avatar'] // Retornar a URL completa
    ]);
} catch (PDOException $e) {
    sendError('Erro ao atualizar o avatar no banco de dados: ' . $e->getMessage());
}
?>