<?php
// ==============================================
// CONFIGURAÇÕES INICIAIS
// ==============================================

// Configuração de erros (desative em produção)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Limpar buffer de saída
while (ob_get_level()) ob_end_clean();

// Configurações de CORS
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Responder imediatamente para requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==============================================
// CONEXÃO COM O BANCO DE DADOS E DEPENDÊNCIAS
// ==============================================

require_once 'conexao.php'; // Arquivo com as credenciais de conexão

// Inicializar sessão
session_start();

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================

/**
 * Verifica autenticação do usuário
 */
function checkAuth() {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Não autenticado']);
        exit();
    }
    return $_SESSION['user_id'];
}

/**
 * Sanitiza dados de entrada
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data ?? '')));
}

// ==============================================
// PROCESSAMENTO DA REQUISIÇÃO
// ==============================================

try {
    // Obter dados JSON da requisição
    $jsonInput = file_get_contents('php://input');
    $input = json_decode($jsonInput, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Dados JSON inválidos');
    }

    // Verificar ação
    if (empty($input['action'])) {
        throw new Exception('Parâmetro "action" não especificado');
    }

    // Inicializar banco de dados
    $blogDB = new BlogDB();
    
    // Processar ações
    switch ($input['action']) {
        case 'get_posts':
            $posts = $blogDB->getAllPosts();
            
            if (!empty($_SESSION['user_id'])) {
                $userId = $_SESSION['user_id'];
                foreach ($posts as &$post) {
                    $post['userLiked'] = $blogDB->userLikedPost($post['id'], $userId);
                }
            }
            
            echo json_encode([
                'success' => true, 
                'posts' => $posts,
                'user' => $_SESSION['user_id'] ?? null
            ]);
            exit();

        case 'create_post':
            $userId = checkAuth();
            $content = sanitizeInput($input['content'] ?? '');
            $image = sanitizeInput($input['image'] ?? null);
            
            if (empty($content) && empty($image)) {
                throw new Exception("O conteúdo do post não pode estar vazio");
            }
            
            $postId = $blogDB->createPost($userId, $content, $image);
            
            if ($postId === false) {
                throw new Exception("Falha ao criar post no banco de dados");
            }
            
            $newPost = $blogDB->getPostById($postId);
            $newPost['userLiked'] = false;
            
            echo json_encode([
                'success' => true,
                'post' => $newPost,
                'message' => 'Post criado com sucesso'
            ]);
            exit();

        case 'toggle_like':
            $userId = checkAuth();
            $postId = $input['post_id'] ?? 0;
            
            if (empty($postId)) {
                throw new Exception("ID do post não especificado");
            }
            
            $result = $blogDB->toggleLike($postId, $userId);
            
            echo json_encode([
                'success' => $result !== false,
                'action' => $result,
                'likes' => $blogDB->getLikeCount($postId),
                'message' => $result !== false ? 'Ação realizada com sucesso' : 'Falha ao realizar ação'
            ]);
            exit();

        case 'add_comment':
            $userId = checkAuth();
            $postId = $input['post_id'] ?? 0;
            $content = sanitizeInput($input['content'] ?? '');
            
            if (empty($postId)) {
                throw new Exception("ID do post não especificado");
            }
            
            if (empty($content)) {
                throw new Exception("O conteúdo do comentário não pode estar vazio");
            }
            
            $commentId = $blogDB->addComment($postId, $userId, $content);
            
            if ($commentId === false) {
                throw new Exception("Falha ao adicionar comentário");
            }
            
            $newComment = $blogDB->getCommentById($commentId);
            
            echo json_encode([
                'success' => true,
                'comment' => $newComment,
                'message' => 'Comentário adicionado com sucesso'
            ]);
            exit();

        default:
            throw new Exception("Ação inválida: " . $input['action']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro no servidor',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    exit();
}