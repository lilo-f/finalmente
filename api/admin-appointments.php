<?php
// ==============================================
// CONFIGURAÇÕES INICIAIS
// ==============================================

// Habilitar relatório de erros (apenas para desenvolvimento)
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *"); // No início do arquivo, após as outras headers
// Permite acesso do Live Server (desenvolvimento)
$allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501", 
    "http://127.0.0.1:5502",
    "http://localhost"
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $origin);
}
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Função para enviar erros como JSON
function sendError($message, $code = 400) {
    http_response_code($code);
    die(json_encode(['success' => false, 'message' => $message]));
}

// Responde imediatamente para requisições OPTIONS (pré-voo CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar se é POST ou GET
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'GET'])) {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

// ==============================================
// CONEXÃO COM O BANCO DE DADOS
// ==============================================

require_once 'conexao.php'; // Arquivo com as credenciais de conexão

// ==============================================
// AUTENTICAÇÃO DO ADMIN
// ==============================================

// Verificar credenciais do admin (simplificado para exemplo)
// Em produção, use um sistema de autenticação mais robusto
function authenticateAdmin($conn) {
    // Obter o token de autorização do cabeçalho
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        sendError('Token de autenticação não fornecido', 401);
    }
    
    $token = $matches[1];
    
    // Verificar o token (em produção, use JWT ou outro método seguro)
    $validToken = 'admin_raven_studio_token'; // Substitua por um sistema real de autenticação
    
    if ($token !== $validToken) {
        sendError('Token de autenticação inválido', 403);
    }
    
    return true;
}

// Autenticar o admin
authenticateAdmin($conn);

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================

function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) == $date;
}

// ==============================================
// PROCESSAMENTO DA REQUISIÇÃO
// ==============================================

try {
    $response = [];
    
    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        // Obter todos os agendamentos
        $stmt = $conn->prepare("
            SELECT a.*, u.first_name, u.last_name, u.email, u.phone 
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.preferred_date1 DESC, a.preferred_time1 DESC
        ");
        $stmt->execute();
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $response = [
            'success' => true,
            'appointments' => $appointments
        ];
    } else {
        // POST requests - ações administrativas
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('Dados JSON inválidos');
        }
        
        if (empty($input['action'])) {
            sendError('Parâmetro "action" não especificado');
        }
        
        switch ($input['action']) {
            case 'update_status':
                // Validação dos campos obrigatórios
                if (empty($input['appointmentId']) || empty($input['status'])) {
                    throw new Exception("ID do agendamento e status são obrigatórios");
                }
                
                $appointmentId = (int)$input['appointmentId'];
                $status = sanitizeInput($input['status']);
                
                // Verificar se o status é válido
                $validStatuses = ['Pendente', 'Confirmado', 'Cancelado', 'Concluído'];
                if (!in_array($status, $validStatuses)) {
                    throw new Exception("Status inválido");
                }
                
                // Atualizar status
                $stmt = $conn->prepare("
                    UPDATE appointments 
                    SET status = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                ");
                $success = $stmt->execute([$status, $appointmentId]);
                
                if (!$success) {
                    throw new Exception("Erro ao atualizar status do agendamento");
                }
                
                // Obter os dados atualizados do agendamento
                $stmt = $conn->prepare("SELECT * FROM appointments WHERE id = ?");
                $stmt->execute([$appointmentId]);
                $updatedAppointment = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $response = [
                    'success' => true,
                    'message' => 'Status do agendamento atualizado com sucesso',
                    'appointment' => $updatedAppointment
                ];
                break;
                
            default:
                throw new Exception("Ação inválida");
        }
    }
    
    http_response_code(200);
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Fechar conexão
$conn = null;
?>