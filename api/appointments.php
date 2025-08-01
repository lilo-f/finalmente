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
    sendError('Dados JSON inválidos');
}

// Verificar se a ação foi especificada
if (empty($input['action'])) {
    sendError('Parâmetro "action" não especificado');
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

function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) == $date;
}

function validateTime($time, $format = 'H:i') {
    $t = DateTime::createFromFormat($format, $time);
    return $t && $t->format($format) == $time;
}

// Na função checkArtistAvailability, modifique para:
function checkArtistAvailability($conn, $artistId, $date, $time) {
    // Converter o horário para objeto DateTime para manipulação
    $timeObj = DateTime::createFromFormat('H:i', $time);
    $formattedTime = $timeObj->format('H:i:s');
    
    // Verificar se já existe um agendamento exatamente no mesmo horário
    $stmt = $conn->prepare("SELECT id FROM appointments 
                           WHERE artist_id = ? 
                           AND preferred_date1 = ? 
                           AND preferred_time1 = ?
                           AND status NOT IN ('Cancelado', 'Concluído')");
    $stmt->execute([$artistId, $date, $formattedTime]);
    
    return $stmt->rowCount() === 0;
}

// Remova a duplicação do case 'get_available_times' - mantenha apenas um
// ==============================================
// LÓGICA PRINCIPAL
// ==============================================

try {
    $response = [];
    
    switch ($input['action']) {
case 'create':
    // Validação dos campos obrigatórios (existente)
    $requiredFields = ['userId', 'artistId', 'artistName', 'preferredDate1', 'preferredTime1', 'tattooStyle', 'tattooDescription', 'budget'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            throw new Exception("O campo {$field} é obrigatório");
        }
    }

    // Sanitização dos dados (existente)
    $userId = (int)$input['userId'];
    $artistId = sanitizeInput($input['artistId']);
    $artistName = sanitizeInput($input['artistName']);
    $artistImage = !empty($input['artistImage']) ? sanitizeInput($input['artistImage']) : null;
    $preferredDate1 = sanitizeInput($input['preferredDate1']);
    $preferredTime1 = sanitizeInput($input['preferredTime1']);
    $tattooStyle = sanitizeInput($input['tattooStyle']);
    $tattooDescription = sanitizeInput($input['tattooDescription']);
    $budget = (float)$input['budget'];

    // Validações específicas (existente)
    if (!validateDate($preferredDate1)) {
        throw new Exception("Data inválida");
    }

    if (!validateTime($preferredTime1)) {
        throw new Exception("Horário inválido");
    }

    if ($budget <= 0) {
        throw new Exception("Orçamento inválido");
    }

    // Verificar se o usuário existe (existente)
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    
    if ($stmt->rowCount() === 0) {
        throw new Exception("Usuário não encontrado");
    }


// VERIFICAR DISPONIBILIDADE DO ARTISTA (NOVO)
if (!checkArtistAvailability($conn, $artistId, $preferredDate1, $preferredTime1)) {
    throw new Exception("Este artista já possui um agendamento neste horário. Por favor, escolha outra data ou horário.");
}

    // Restante do código para inserir o agendamento (existente)
    $stmt = $conn->prepare("INSERT INTO appointments 
        (user_id, artist_id, artist_name, artist_image, preferred_date1, preferred_time1, tattoo_style, tattoo_description, budget) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $success = $stmt->execute([
        $userId,
        $artistId,
        $artistName,
        $artistImage,
        $preferredDate1,
        $preferredTime1,
        $tattooStyle,
        $tattooDescription,
        $budget
    ]);

            if (!$success) {
                throw new Exception("Erro ao criar agendamento no banco de dados");
            }

            $appointmentId = $conn->lastInsertId();

            // Obter os dados completos do agendamento para retorno
            $stmt = $conn->prepare("SELECT * FROM appointments WHERE id = ?");
            $stmt->execute([$appointmentId]);
            $appointment = $stmt->fetch(PDO::FETCH_ASSOC);

            $response = [
                'success' => true,
                'message' => 'Agendamento criado com sucesso',
                'appointment' => $appointment
            ];
            break;


case 'get_available_times':
    if (empty($input['artistId']) || empty($input['date'])) {
        throw new Exception("Artista e data são obrigatórios");
    }

    $artistId = sanitizeInput($input['artistId']);
    $date = sanitizeInput($input['date']);

    if (!validateDate($date)) {
        throw new Exception("Data inválida");
    }

    // Buscar todos os horários ocupados
    $stmt = $conn->prepare("SELECT preferred_time1 FROM appointments 
                           WHERE artist_id = ? 
                           AND preferred_date1 = ?
                           AND status NOT IN ('Cancelado', 'Concluído')");
    $stmt->execute([$artistId, $date]);
    $busyTimes = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Gerar todos os horários possíveis (9h-18h)
    $allTimes = [];
    for ($h = 9; $h <= 18; $h++) {
        $time = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
        $allTimes[] = $time;
    }

    // Filtrar horários disponíveis
    $availableTimes = array_diff($allTimes, $busyTimes);

    $response = [
        'success' => true,
        'availableTimes' => array_values($availableTimes)
    ];
    break;

case 'get_available_times':
    if (empty($input['artistId']) || empty($input['date'])) {
        throw new Exception("Artista e data são obrigatórios");
    }

    $artistId = sanitizeInput($input['artistId']);
    $date = sanitizeInput($input['date']);

    if (!validateDate($date)) {
        throw new Exception("Data inválida");
    }

    // Buscar todos os horários ocupados
    $stmt = $conn->prepare("SELECT preferred_time1 FROM appointments 
                           WHERE artist_id = ? 
                           AND preferred_date1 = ?
                           AND status NOT IN ('Cancelado', 'Concluído')");
    $stmt->execute([$artistId, $date]);
    $busyTimes = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Gerar todos os horários possíveis (9h-18h)
    $allTimes = [];
    for ($h = 9; $h <= 18; $h++) {
        $time = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
        $allTimes[] = $time;
    }

    // Filtrar horários disponíveis
    $availableTimes = array_diff($allTimes, $busyTimes);

    $response = [
        'success' => true,
        'availableTimes' => array_values($availableTimes)
    ];
    break;

    case 'get_user_appointments':
    if (empty($input['userId'])) {
        throw new Exception("ID do usuário não especificado");
    }

    $userId = (int)$input['userId'];

    $stmt = $conn->prepare("SELECT * FROM appointments WHERE user_id = ? ORDER BY preferred_date1 DESC, preferred_time1 DESC");
    $stmt->execute([$userId]);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = [
        'success' => true,
        'appointments' => $appointments
    ];
    break;

        case 'cancel':
            if (empty($input['appointmentId']) || empty($input['userId'])) {
                throw new Exception("ID do agendamento ou usuário não especificado");
            }

            $appointmentId = (int)$input['appointmentId'];
            $userId = (int)$input['userId'];

            // Verificar se o agendamento pertence ao usuário
            $stmt = $conn->prepare("SELECT id FROM appointments WHERE id = ? AND user_id = ?");
            $stmt->execute([$appointmentId, $userId]);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception("Agendamento não encontrado ou não pertence ao usuário");
            }

            // Atualizar status para Cancelado
            $stmt = $conn->prepare("UPDATE appointments SET status = 'Cancelado', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $success = $stmt->execute([$appointmentId]);

            if (!$success) {
                throw new Exception("Erro ao cancelar agendamento");
            }

            $response = [
                'success' => true,
                'message' => 'Agendamento cancelado com sucesso'
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