<?php
header('Content-Type: text/html; charset=utf-8');
session_start();

// Verificar se o usuário é administrador
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    header('Location: /pages/login.html');
    exit();
}

// Conexão com o banco de dados
$host = 'localhost';
$dbname = 'raven_studio';
$username = 'root'; // Altere conforme necessário
$password = ''; // Altere conforme necessário

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erro na conexão com o banco de dados: " . $e->getMessage());
}

// Atualizar status do agendamento se o formulário foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['appointment_id'], $_POST['new_status'])) {
    $appointmentId = $_POST['appointment_id'];
    $newStatus = $_POST['new_status'];
    
    try {
        $stmt = $pdo->prepare("UPDATE appointments SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $newStatus, ':id' => $appointmentId]);
        
        // Mensagem de sucesso
        $_SESSION['message'] = "Status do agendamento #$appointmentId atualizado para $newStatus com sucesso!";
        $_SESSION['message_type'] = "success";
        
        // Redirecionar para evitar reenvio do formulário
        header("Location: admin_appointments.php");
        exit();
    } catch (PDOException $e) {
        $_SESSION['message'] = "Erro ao atualizar status: " . $e->getMessage();
        $_SESSION['message_type'] = "error";
    }
}

// Buscar todos os agendamentos
try {
    $stmt = $pdo->query("
        SELECT a.*, u.first_name, u.last_name, u.email, u.phone 
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.preferred_date1, a.preferred_time1
    ");
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Erro ao buscar agendamentos: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Agendamentos | Raven Studio</title>
    <link rel="icon" href="/img/raven.ico" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-black: #000000;
            --secondary-black: #0a0a0a;
            --dark-gray: #1a1a1a;
            --light-gray: #d1d5db;
            --soft-blue: #3b82f6;
            --neon-blue: #00f0ff;
            --soft-green: #22c55e;
            --soft-red: #ef4444;
            --soft-yellow: #f59e0b;
            --font-display: 'Arial', sans-serif;
            --font-body: 'Arial', sans-serif;
        }

        body {
            font-family: var(--font-body);
            background-color: #f5f5f5;
            color: #333;
            margin: 0;
            padding: 0;
        }

        .admin-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .admin-header {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .admin-header h1 {
            margin: 0;
            font-size: 2rem;
        }

        .admin-nav {
            margin-top: 20px;
        }

        .admin-nav a {
            color: white;
            text-decoration: none;
            margin-right: 15px;
            padding: 5px 10px;
            border-radius: 4px;
            transition: background-color 0.3s;
        }

        .admin-nav a:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }

        .message {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-weight: bold;
        }

        .message.success {
            background-color: #d1fae5;
            color: #065f46;
            border-left: 4px solid #10b981;
        }

        .message.error {
            background-color: #fee2e2;
            color: #991b1b;
            border-left: 4px solid #ef4444;
        }

        .appointments-table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        .appointments-table th,
        .appointments-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        .appointments-table th {
            background-color: #3b82f6;
            color: white;
            font-weight: bold;
        }

        .appointments-table tr:nth-child(even) {
            background-color: #f9fafb;
        }

        .appointments-table tr:hover {
            background-color: #f3f4f6;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-pendente {
            background-color: rgba(251, 191, 36, 0.2);
            color: #d97706;
            border: 1px solid #f59e0b;
        }

        .status-confirmado {
            background-color: rgba(52, 211, 153, 0.2);
            color: #065f46;
            border: 1px solid #10b981;
        }

        .status-cancelado {
            background-color: rgba(248, 113, 113, 0.2);
            color: #991b1b;
            border: 1px solid #ef4444;
        }

        .status-concluido {
            background-color: rgba(59, 130, 246, 0.2);
            color: #1e40af;
            border: 1px solid #3b82f6;
        }

        .action-form {
            display: flex;
            gap: 5px;
        }

        .status-select {
            padding: 5px;
            border-radius: 4px;
            border: 1px solid #d1d5db;
            background-color: white;
        }

        .update-btn {
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .update-btn:hover {
            background-color: #2563eb;
        }

        .artist-image {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e5e7eb;
        }

        .no-appointments {
            text-align: center;
            padding: 40px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
            .appointments-table {
                display: block;
                overflow-x: auto;
            }
            
            .admin-header h1 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="admin-header">
            <h1><i class="fas fa-calendar-alt"></i> Gerenciar Agendamentos</h1>
            <div class="admin-nav">
                <a href="admin_dashboard.php"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                <a href="admin_users.php"><i class="fas fa-users"></i> Usuários</a>
                <a href="admin_appointments.php"><i class="fas fa-calendar-check"></i> Agendamentos</a>
                <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Sair</a>
            </div>
        </div>

        <?php if (isset($_SESSION['message'])): ?>
            <div class="message <?php echo $_SESSION['message_type']; ?>">
                <?php 
                    echo $_SESSION['message'];
                    unset($_SESSION['message']);
                    unset($_SESSION['message_type']);
                ?>
            </div>
        <?php endif; ?>

        <?php if (count($appointments) > 0): ?>
            <table class="appointments-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Artista</th>
                        <th>Data/Hora</th>
                        <th>Estilo</th>
                        <th>Orçamento</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($appointments as $appointment): ?>
                        <tr>
                            <td>#<?php echo htmlspecialchars($appointment['id']); ?></td>
                            <td>
                                <?php echo htmlspecialchars($appointment['first_name'] . ' ' . $appointment['last_name']); ?><br>
                                <small><?php echo htmlspecialchars($appointment['email']); ?></small><br>
                                <small><?php echo htmlspecialchars($appointment['phone']); ?></small>
                            </td>
                            <td>
                                <?php if ($appointment['artist_image']): ?>
                                    <img src="<?php echo htmlspecialchars($appointment['artist_image']); ?>" alt="<?php echo htmlspecialchars($appointment['artist_name']); ?>" class="artist-image">
                                <?php endif; ?>
                                <?php echo htmlspecialchars($appointment['artist_name']); ?>
                            </td>
                            <td>
                                <?php 
                                    $date = new DateTime($appointment['preferred_date1']);
                                    echo $date->format('d/m/Y');
                                ?><br>
                                <?php 
                                    $time = new DateTime($appointment['preferred_time1']);
                                    echo $time->format('H:i');
                                ?>
                            </td>
                            <td><?php echo htmlspecialchars($appointment['tattoo_style']); ?></td>
                            <td>R$ <?php echo number_format($appointment['budget'], 2, ',', '.'); ?></td>
                            <td>
                                <span class="status-badge status-<?php echo strtolower($appointment['status']); ?>">
                                    <?php echo htmlspecialchars($appointment['status']); ?>
                                </span>
                            </td>
                            <td>
                                <form method="post" class="action-form">
                                    <input type="hidden" name="appointment_id" value="<?php echo $appointment['id']; ?>">
                                    <select name="new_status" class="status-select" required>
                                        <option value="Pendente" <?php echo $appointment['status'] === 'Pendente' ? 'selected' : ''; ?>>Pendente</option>
                                        <option value="Confirmado" <?php echo $appointment['status'] === 'Confirmado' ? 'selected' : ''; ?>>Confirmado</option>
                                        <option value="Cancelado" <?php echo $appointment['status'] === 'Cancelado' ? 'selected' : ''; ?>>Cancelado</option>
                                        <option value="Concluído" <?php echo $appointment['status'] === 'Concluído' ? 'selected' : ''; ?>>Concluído</option>
                                    </select>
                                    <button type="submit" class="update-btn">
                                        <i class="fas fa-sync-alt"></i> Atualizar
                                    </button>
                                </form>
                                <div style="margin-top: 5px;">
                                    <a href="#" onclick="showDetails(<?php echo $appointment['id']; ?>)" style="color: #3b82f6; text-decoration: none;">
                                        <i class="fas fa-eye"></i> Detalhes
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <tr id="details-<?php echo $appointment['id']; ?>" style="display: none;">
                            <td colspan="8" style="background-color: #f9fafb; padding: 15px;">
                                <h4>Descrição da Tatuagem:</h4>
                                <p><?php echo nl2br(htmlspecialchars($appointment['tattoo_description'])); ?></p>
                                <p><strong>Criado em:</strong> <?php echo (new DateTime($appointment['created_at']))->format('d/m/Y H:i'); ?></p>
                                <?php if ($appointment['updated_at']): ?>
                                    <p><strong>Última atualização:</strong> <?php echo (new DateTime($appointment['updated_at']))->format('d/m/Y H:i'); ?></p>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <div class="no-appointments">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: #9ca3af; margin-bottom: 15px;"></i>
                <h3>Nenhum agendamento encontrado</h3>
                <p>Não há agendamentos cadastrados no sistema.</p>
            </div>
        <?php endif; ?>
    </div>

    <script>
        function showDetails(appointmentId) {
            const detailsRow = document.getElementById(`details-${appointmentId}`);
            if (detailsRow.style.display === 'none') {
                detailsRow.style.display = 'table-row';
            } else {
                detailsRow.style.display = 'none';
            }
        }
    </script>
</body>
</html>