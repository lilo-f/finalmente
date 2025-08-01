<?php
// ==============================================
// CONFIGURAÇÕES INICIAIS
// ==============================================

// Habilitar relatório de erros (apenas para desenvolvimento)
ini_set('display_errors', 1);
error_reporting(E_ALL);

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

// Verifica se é POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

// ==============================================
// CONEXÃO COM O BANCO DE DADOS
// ==============================================

require_once 'conexao.php'; // Arquivo com as credenciais de conexão

// ==============================================
// PROCESSAMENTO DA REQUISIÇÃO
// ==============================================

// Obter os dados JSON da requisição
$input = json_decode(file_get_contents('php://input'), true);

// Verificar se o JSON é válido
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Dados JSON inválidos'
    ]);
    exit();
}

// Verificar se a ação foi especificada
if (empty($input['action'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Parâmetro "action" não especificado'
    ]);
    exit();
}

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================

function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validateCPF($cpf) {
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    return strlen($cpf) == 11;
}

// ==============================================
// LÓGICA PRINCIPAL
// ==============================================

try {
    $response = [];
    
    switch ($input['action']) {
        case 'register':
            // Validação dos campos obrigatórios
            $requiredFields = ['firstName', 'lastName', 'email', 'phone', 'cpf', 'password'];
            foreach ($requiredFields as $field) {
                if (empty($input[$field])) {
                    throw new Exception("O campo {$field} é obrigatório");
                }
            }

            // Sanitização dos dados
            $firstName = sanitizeInput($input['firstName']);
            $lastName = sanitizeInput($input['lastName']);
            $email = sanitizeInput($input['email']);
            $phone = preg_replace('/[^0-9]/', '', $input['phone']);
            $cpf = preg_replace('/[^0-9]/', '', $input['cpf']);
            $password = $input['password'];

            // Validações específicas
            if (!validateEmail($email)) {
                throw new Exception("E-mail inválido");
            }

            if (!validateCPF($cpf)) {
                throw new Exception("CPF inválido");
            }

            if (strlen($password) < 6) {
                throw new Exception("A senha deve ter pelo menos 6 caracteres");
            }

            // Verificar se usuário já existe
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? OR cpf = ?");
            $stmt->execute([$email, $cpf]);
            
            if ($stmt->rowCount() > 0) {
                throw new Exception("E-mail ou CPF já cadastrado");
            }

            // Hash da senha
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);

            // Inserir novo usuário
            $stmt = $conn->prepare("INSERT INTO users 
                (first_name, last_name, email, phone, cpf, password) 
                VALUES (?, ?, ?, ?, ?, ?)");
            
            $success = $stmt->execute([
                $firstName,
                $lastName,
                $email,
                $phone,
                $cpf,
                $passwordHash
            ]);

            if (!$success) {
                throw new Exception("Erro ao registrar usuário no banco de dados");
            }

            $response = [
                'success' => true,
                'message' => 'Usuário registrado com sucesso',
                'userId' => $conn->lastInsertId()
            ];
            break;

        case 'login':
            // Validação dos campos
            if (empty($input['email']) || empty($input['password'])) {
                throw new Exception("E-mail e senha são obrigatórios");
            }

            $email = sanitizeInput($input['email']);
            $password = $input['password'];

            // Buscar usuário
            $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception("Credenciais inválidas");
            }

            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verificar senha
            if (!password_verify($password, $user['password'])) {
                throw new Exception("Credenciais inválidas");
            }

            // Preparar dados do usuário para retorno
            unset($user['password']); // Remove a senha hash
            
            // Adiciona campos formatados para o frontend
            $user['name'] = $user['first_name'] . ' ' . $user['last_name'];
            $user['joinDate'] = $user['created_at'];
            $user['points'] = $user['loyalty_points'] ?? 0;
            
            // Adiciona campos que podem ser usados no frontend
            $user['avatar'] = $user['avatar'] ?? null;
            $user['phone'] = $user['phone'] ?? '';
            $user['email'] = $user['email'] ?? '';
            
            $response = [
                'success' => true,
                'message' => 'Login realizado com sucesso',
                'user' => $user
            ];
            break;

        default:
            throw new Exception("Ação inválida");
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
