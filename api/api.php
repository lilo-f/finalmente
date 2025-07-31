<?php
require_once 'conexao.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

function clean_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

$response = [];
$request_method = $_SERVER['REQUEST_METHOD'];
$endpoint = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($request_method) {
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            
            if ($endpoint === 'login') {
                // Login
                $email = clean_input($data['email']);
                $password = clean_input($data['password']);
                
                $stmt = $conexao->prepare("SELECT * FROM users WHERE email = ?");
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $user = $result->fetch_assoc();
                    
                    if (password_verify($password, $user['password'])) {
                        unset($user['password']);
                        $response = [
                            'success' => true,
                            'user' => $user,
                            'message' => 'Login realizado com sucesso'
                        ];
                    } else {
                        throw new Exception('Credenciais inválidas');
                    }
                } else {
                    throw new Exception('Usuário não encontrado');
                }
                
            } elseif ($endpoint === 'register') {
                // Cadastro
                $userData = [
                    'first_name' => clean_input($data['firstName']),
                    'last_name' => clean_input($data['lastName']),
                    'email' => clean_input($data['email']),
                    'phone' => preg_replace('/\D/', '', clean_input($data['phone'])),
                    'cpf' => preg_replace('/\D/', '', clean_input($data['cpf'])),
                    'password' => password_hash(clean_input($data['password']), PASSWORD_DEFAULT)
                ];
                
                // Verifica se usuário já existe
                $check = $conexao->prepare("SELECT id FROM users WHERE email = ? OR cpf = ?");
                $check->bind_param("ss", $userData['email'], $userData['cpf']);
                $check->execute();
                
                if ($check->get_result()->num_rows > 0) {
                    throw new Exception('E-mail ou CPF já cadastrados');
                }
                
                // Insere novo usuário
                $stmt = $conexao->prepare("INSERT INTO users (first_name, last_name, email, phone, cpf, password) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("ssssss", 
                    $userData['first_name'],
                    $userData['last_name'],
                    $userData['email'],
                    $userData['phone'],
                    $userData['cpf'],
                    $userData['password']
                );
                
                if ($stmt->execute()) {
                    $user_id = $conexao->insert_id;
                    $response = [
                        'success' => true,
                        'user_id' => $user_id,
                        'message' => 'Usuário cadastrado com sucesso'
                    ];
                } else {
                    throw new Exception('Erro ao cadastrar usuário');
                }
            }
            break;
            
        default:
            throw new Exception('Método não permitido');
    }
    
    http_response_code(200);
    
} catch (Exception $e) {
    http_response_code(400);
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

echo json_encode($response);
$conexao->close();
?>