<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/database.php';
header("Content-Type: application/json");
require_once '../config/database.php';

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    switch ($action) {
        case 'get_all':
            // Obter todos os agendamentos com informações do usuário
            $stmt = $pdo->prepare("
                SELECT a.*, u.first_name, u.last_name, u.email, u.phone, 
                       CONCAT(u.first_name, ' ', u.last_name) as user_name
                FROM appointments a
                JOIN users u ON a.user_id = u.id
                ORDER BY a.preferred_date1, a.preferred_time1 DESC
            ");
            $stmt->execute();
            $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'appointments' => $appointments
            ]);
            break;

        case 'get_details':
            // Obter detalhes de um agendamento específico
            $appointmentId = $_GET['id'] ?? 0;
            
            $stmt = $pdo->prepare("
                SELECT a.*, u.first_name, u.last_name, u.email, u.phone, 
                       CONCAT(u.first_name, ' ', u.last_name) as user_name
                FROM appointments a
                JOIN users u ON a.user_id = u.id
                WHERE a.id = ?
            ");
            $stmt->execute([$appointmentId]);
            $appointment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($appointment) {
                echo json_encode([
                    'success' => true,
                    'appointment' => $appointment
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Agendamento não encontrado'
                ]);
            }
            break;

        case 'update_status':
            // Atualizar o status de um agendamento
            $data = json_decode(file_get_contents('php://input'), true);
            
            $appointmentId = $data['appointmentId'] ?? 0;
            $newStatus = $data['newStatus'] ?? '';
            $changeReason = $data['changeReason'] ?? '';
            
            // Validar status
            $validStatuses = ['Pendente', 'Confirmado', 'Cancelado', 'Concluído'];
            if (!in_array($newStatus, $validStatuses)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Status inválido'
                ]);
                exit;
            }
            
            // Iniciar transação
            $pdo->beginTransaction();
            
            try {
                // 1. Obter o status atual para registro no log
                $stmt = $pdo->prepare("SELECT status FROM appointments WHERE id = ?");
                $stmt->execute([$appointmentId]);
                $currentStatus = $stmt->fetchColumn();
                
                if ($currentStatus === false) {
                    throw new Exception("Agendamento não encontrado");
                }
                
                // 2. Atualizar o status do agendamento
                $stmt = $pdo->prepare("
                    UPDATE appointments 
                    SET status = ?, updated_at = NOW() 
                    WHERE id = ?
                ");
                $stmt->execute([$newStatus, $appointmentId]);
                
                // 3. Registrar a alteração no log
                $stmt = $pdo->prepare("
                    INSERT INTO appointment_logs 
                    (appointment_id, changed_by, previous_status, new_status, change_reason) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $appointmentId,
                    1, // ID do admin (deveria ser obtido da sessão em um sistema real)
                    $currentStatus,
                    $newStatus,
                    $changeReason
                ]);
                
                $pdo->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Status atualizado com sucesso'
                ]);
                
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode([
                    'success' => false,
                    'message' => 'Erro ao atualizar status: ' . $e->getMessage()
                ]);
            }
            break;

        case 'get_available_times':
            // Obter horários disponíveis para um artista em uma data específica
            $artistId = $_GET['artistId'] ?? '';
            $date = $_GET['date'] ?? '';
            
            if (empty($artistId) || empty($date)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Artista e data são obrigatórios'
                ]);
                exit;
            }
            
            // Verificar se a data é válida
            if (!strtotime($date)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Data inválida'
                ]);
                exit;
            }
            
            // Horários de trabalho padrão (10:00 às 18:00)
            $startHour = 10;
            $endHour = 18;
            $allTimes = [];
            
            for ($hour = $startHour; $hour <= $endHour; $hour++) {
                $allTimes[] = sprintf("%02d:00", $hour);
            }
            
            // Obter horários já agendados para este artista na data especificada
            $stmt = $pdo->prepare("
                SELECT preferred_time1 
                FROM appointments 
                WHERE artist_id = ? 
                AND preferred_date1 = ? 
                AND status NOT IN ('Cancelado')
            ");
            $stmt->execute([$artistId, $date]);
            $bookedTimes = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
            
            // Filtrar horários disponíveis
            $availableTimes = array_diff($allTimes, $bookedTimes);
            
            echo json_encode([
                'success' => true,
                'availableTimes' => array_values($availableTimes)
            ]);
            break;

        default:
            echo json_encode([
                'success' => false,
                'message' => 'Ação não especificada'
            ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro de banco de dados: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ]);
}
?>