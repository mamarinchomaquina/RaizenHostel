<?php
/**
 * Run once to create the mensajes_contacto table.
 * Usage: C:\xampp\php\php.exe migrate_mensajes.php
 */

require_once __DIR__ . '/api/config/database.php';

$db = (new Database())->getConnection();

$db->exec("
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(120) NOT NULL,
  email        VARCHAR(180) NOT NULL,
  asunto       VARCHAR(255) DEFAULT '',
  mensaje      TEXT NOT NULL,
  estado       ENUM('nuevo','leido','respondido') NOT NULL DEFAULT 'nuevo',
  respuesta    TEXT DEFAULT NULL,
  respondido_por INT DEFAULT NULL,
  respondido_at  DATETIME DEFAULT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (respondido_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

echo "Table 'mensajes_contacto' created successfully.\n";
