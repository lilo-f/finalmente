<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "raven_studio";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    header("Content-Type: application/json");
    die(json_encode([
        'success' => false,
        'message' => 'Erro de conexão com o banco de dados',
        'error' => $e->getMessage()
    ]));
}