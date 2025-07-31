<?php
// ==============================================
// CONFIGURAÇÕES INICIAIS
// ==============================================

// Habilitar relatório de erros (apenas para desenvolvimento)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Por esta versão mais robusta:
header("Access-Control-Allow-Origin: *"); // Em desenvolvimento, pode ser específico depois
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// Resposta para requisições OPTIONS (pré-voo CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
// Permitir apenas POST para a API
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido. Use POST.'
    ]);
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

            // Remover senha do objeto de retorno
            unset($user['password']);
            
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