
<?php
// Configuração precisa de CORS
$allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501",
    "http://localhost"
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: http://localhost");
}

header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Responder imediatamente a requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Restante do código...

// Iniciar sessão e verificar autenticação
session_start();

// Debug: Ver conteúdo da sessão
error_log("Dados da sessão: " . print_r($_SESSION, true));

if (!isset($_SESSION['user'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Usuário não logado',
        'redirect' => '/pages/login.html',
        'session_debug' => $_SESSION
    ]);
    exit;
}

if (!isset($_SESSION['user']['isAdmin']) || !$_SESSION['user']['isAdmin']) {
    echo json_encode([
        'success' => false,
        'message' => 'Acesso restrito a administradores',
        'redirect' => '/pages/home.html',
        'user_data' => $_SESSION['user']
    ]);
    exit;
}

// Incluir configuração do banco de dados
require_once '../config/database.php';
require_once '../middleware/auth-middleware.php';
authenticateAdmin();
// Obter a ação da requisição
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

// Array para a resposta
$response = ['success' => false, 'message' => 'Ação não reconhecida'];

try {
    // Conectar ao banco de dados
    $db = new Database();
    $conn = $db->connect();

    // Verificar conexão com o banco (apenas para debug)
    $conn->query("SELECT 1");

    // Processar diferentes ações
    switch ($action) {
        case 'get_all_orders':
            $stmt = $conn->prepare("
                SELECT o.*, u.first_name, u.email 
                FROM orders o
                JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC
            ");
            $stmt->execute();
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Obter itens para cada pedido
            foreach ($orders as &$order) {
                $stmt = $conn->prepare("
                    SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                ");
                $stmt->execute([$order['id']]);
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            $response = [
                'success' => true,
                'orders' => $orders
            ];
            break;
            
        case 'get_order_details':
            $orderId = $input['orderId'] ?? 0;
            
            $stmt = $conn->prepare("
                SELECT o.*, u.first_name, u.last_name, u.email, u.phone,
                       a.street, a.number, a.complement, a.neighborhood, a.city, a.state, a.cep
                FROM orders o
                JOIN users u ON o.user_id = u.id
                LEFT JOIN addresses a ON o.address_id = a.id
                WHERE o.id = ?
            ");
            $stmt->execute([$orderId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($order) {
                $stmt = $conn->prepare("
                    SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                ");
                $stmt->execute([$orderId]);
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $response = [
                    'success' => true,
                    'order' => $order
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ];
            }
            break;
            
        case 'update_order_status':
            $orderId = $input['orderId'] ?? 0;
            $newStatus = $input['newStatus'] ?? '';
            
            $allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];
            if (!in_array($newStatus, $allowedStatuses)) {
                $response = [
                    'success' => false,
                    'message' => 'Status inválido'
                ];
                break;
            }
            
            $stmt = $conn->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$newStatus, $orderId]);
            
            $response = [
                'success' => true,
                'message' => 'Status do pedido atualizado com sucesso'
            ];
            break;
            
        case 'get_all_appointments':
            $stmt = $conn->prepare("
                SELECT a.*, u.first_name as client_name, u.email as client_email 
                FROM appointments a
                JOIN users u ON a.user_id = u.id
                ORDER BY a.preferred_date1, a.preferred_time1
            ");
            $stmt->execute();
            $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response = [
                'success' => true,
                'appointments' => $appointments
            ];
            break;
            
        case 'get_appointment_details':
            $appointmentId = $input['appointmentId'] ?? 0;
            
            $stmt = $conn->prepare("
                SELECT a.*, u.first_name as client_name, u.email as client_email 
                FROM appointments a
                JOIN users u ON a.user_id = u.id
                WHERE a.id = ?
            ");
            $stmt->execute([$appointmentId]);
            $appointment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($appointment) {
                $response = [
                    'success' => true,
                    'appointment' => $appointment
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Agendamento não encontrado'
                ];
            }
            break;
            
        case 'cancel_appointment':
            $appointmentId = $input['appointmentId'] ?? 0;
            
            $stmt = $conn->prepare("UPDATE appointments SET status = 'Cancelado', updated_at = NOW() WHERE id = ?");
            $stmt->execute([$appointmentId]);
            
            $response = [
                'success' => true,
                'message' => 'Agendamento cancelado com sucesso'
            ];
            break;
            
        case 'confirm_appointment':
            $appointmentId = $input['appointmentId'] ?? 0;
            
            $stmt = $conn->prepare("UPDATE appointments SET status = 'Confirmado', updated_at = NOW() WHERE id = ?");
            $stmt->execute([$appointmentId]);
            
            $response = [
                'success' => true,
                'message' => 'Agendamento confirmado com sucesso'
            ];
            break;
            
        case 'complete_appointment':
            $appointmentId = $input['appointmentId'] ?? 0;
            
            $stmt = $conn->prepare("UPDATE appointments SET status = 'Concluído', updated_at = NOW() WHERE id = ?");
            $stmt->execute([$appointmentId]);
            
            $response = [
                'success' => true,
                'message' => 'Agendamento marcado como concluído'
            ];
            break;
            
        case 'save_appointment_notes':
            $appointmentId = $input['appointmentId'] ?? 0;
            $notes = $input['notes'] ?? '';
            
            $stmt = $conn->prepare("UPDATE appointments SET notes = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$notes, $appointmentId]);
            
            $response = [
                'success' => true,
                'message' => 'Observações salvas com sucesso'
            ];
            break;
            
        default:
            $response = [
                'success' => false,
                'message' => 'Ação não reconhecida',
                'received_action' => $action
            ];
    }
} catch (PDOException $e) {
    $response = [
        'success' => false,
        'message' => 'Erro no banco de dados: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ];
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ];
}

// Retornar resposta como JSON
echo json_encode($response);
?>