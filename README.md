CREATE DATABASE IF NOT EXISTS raven_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE raven_studio;

CREATE TABLE IF NOT EXISTS users (
  id INT(11) NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  loyalty_points INT(11) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  UNIQUE KEY cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE users MODIFY avatar LONGTEXT DEFAULT NULL;
ALTER TABLE users MODIFY loyalty_points INT(11) DEFAULT 0 NOT NULL;

 use raven_studio
ALTER TABLE users ADD COLUMN isAdmin BOOLEAN DEFAULT FALSE;

INSERT INTO users (first_name, last_name, email, phone, cpf, password, isAdmin)
VALUES ('Admin', 'Raven', 'ravenstudio@gmail.com', '11999999999', '12345678901', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE);
