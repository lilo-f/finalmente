<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "raven_studio";

header("Content-Type: application/json");

try {
    $conn = new PDO("mysql:host=localhost;dbname=raven_studio;charset=utf8mb4", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'Falha na conexão com o banco de dados',
        'error' => $e->getMessage()
    ]));
}
?>


