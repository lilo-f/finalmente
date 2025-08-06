<?php
require_once 'conexao.php';

class BlogDB {
    private $conn;

    public function __construct() {
        global $conn;
        $this->conn = $conn;
    }

    public function createPost($userId, $content, $image = null) {
        try {
            $stmt = $this->conn->prepare("INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)");
            $success = $stmt->execute([$userId, $content, $image]);
            return $success ? $this->conn->lastInsertId() : false;
        } catch (PDOException $e) {
            error_log("Erro ao criar post: " . $e->getMessage());
            return false;
        }
    }

    public function getPostById($postId) {
        try {
            $query = "SELECT p.*, 
                     u.first_name, u.last_name, u.avatar, u.isAdmin,
                     (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
                     (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
                     FROM posts p
                     JOIN users u ON p.user_id = u.id
                     WHERE p.id = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$postId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao obter post: " . $e->getMessage());
            return false;
        }
    }

    public function getAllPosts() {
        try {
            $query = "SELECT p.*, 
                     u.first_name, u.last_name, u.avatar, u.isAdmin,
                     (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
                     (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
                     FROM posts p
                     JOIN users u ON p.user_id = u.id
                     ORDER BY p.created_at DESC";
            
            return $this->conn->query($query)->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao obter posts: " . $e->getMessage());
            return [];
        }
    }

    public function toggleLike($postId, $userId) {
        try {
            // Verificar se já curtiu
            $stmt = $this->conn->prepare("SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?");
            $stmt->execute([$postId, $userId]);
            
            if ($stmt->rowCount() > 0) {
                // Remover curtida
                $stmt = $this->conn->prepare("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?");
                $stmt->execute([$postId, $userId]);
                return 'unliked';
            } else {
                // Adicionar curtida
                $stmt = $this->conn->prepare("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)");
                $stmt->execute([$postId, $userId]);
                return 'liked';
            }
        } catch (PDOException $e) {
            error_log("Erro ao alternar curtida: " . $e->getMessage());
            return false;
        }
    }

    public function getLikeCount($postId) {
        try {
            $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?");
            $stmt->execute([$postId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] ?? 0;
        } catch (PDOException $e) {
            error_log("Erro ao contar curtidas: " . $e->getMessage());
            return 0;
        }
    }

    public function addComment($postId, $userId, $content) {
        try {
            $stmt = $this->conn->prepare("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)");
            $success = $stmt->execute([$postId, $userId, $content]);
            return $success ? $this->conn->lastInsertId() : false;
        } catch (PDOException $e) {
            error_log("Erro ao adicionar comentário: " . $e->getMessage());
            return false;
        }
    }

    public function getCommentById($commentId) {
        try {
            $query = "SELECT c.*, u.first_name, u.last_name, u.avatar 
                     FROM comments c
                     JOIN users u ON c.user_id = u.id
                     WHERE c.id = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$commentId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao obter comentário: " . $e->getMessage());
            return false;
        }
    }

    public function getComments($postId) {
        try {
            $query = "SELECT c.*, u.first_name, u.last_name, u.avatar 
                     FROM comments c
                     JOIN users u ON c.user_id = u.id
                     WHERE c.post_id = ?
                     ORDER BY c.created_at ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$postId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao obter comentários: " . $e->getMessage());
            return [];
        }
    }

    public function userLikedPost($postId, $userId) {
        try {
            $stmt = $this->conn->prepare("SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?");
            $stmt->execute([$postId, $userId]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Erro ao verificar curtida: " . $e->getMessage());
            return false;
        }
    }
}
?>