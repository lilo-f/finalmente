<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Credenciais do administrador (em um sistema real, isso deve ser armazenado de forma segura)
    $adminUsername = 'admin';
    $adminPassword = 'admin123'; // Em produção, use hash de senha

    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username === $adminUsername && $password === $adminPassword) {
        $_SESSION['is_admin'] = true;
        header('Location: admin_appointments.php');
        exit();
    } else {
        $error = "Credenciais inválidas!";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Admin | Raven Studio</title>
    <link rel="icon" href="/img/raven.ico" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-black: #000000;
            --secondary-black: #0a0a0a;
            --dark-gray: #1a1a1a;
            --light-gray: #d1d5db;
            --soft-blue: #3b82f6;
            --soft-green: #22c55e;
            --soft-red: #ef4444;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }

        .login-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 30px;
            width: 100%;
            max-width: 400px;
            text-align: center;
        }

        .login-container h1 {
            color: #3b82f6;
            margin-bottom: 30px;
        }

        .login-container img {
            width: 100px;
            margin-bottom: 20px;
        }

        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }

        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }

        .btn {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
            transition: background-color 0.3s;
        }

        .btn:hover {
            background-color: #2563eb;
        }

        .error {
            color: #ef4444;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <img src="/img/Logo.png" alt="Raven Studio">
        <h1>Área Administrativa</h1>
        
        <?php if (isset($error)): ?>
            <div class="error">
                <i class="fas fa-exclamation-circle"></i> <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <label for="username">Usuário</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn">
                <i class="fas fa-sign-in-alt"></i> Entrar
            </button>
        </form>
    </div>
</body>
</html>