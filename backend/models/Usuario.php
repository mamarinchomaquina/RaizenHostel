<?php

class Usuario {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function findByEmail(string $email) {
        $stmt = $this->db->prepare('SELECT * FROM usuarios WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function findActiveByEmail(string $email) {
        $stmt = $this->db->prepare('SELECT * FROM usuarios WHERE email = ? AND activo = 1');
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function findById(int $id) {
        $stmt = $this->db->prepare('SELECT id, nombre, email, rol, activo, telefono, documento, created_at FROM usuarios WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function emailExists(string $email): bool {
        $stmt = $this->db->prepare('SELECT id FROM usuarios WHERE email = ?');
        $stmt->execute([$email]);
        return (bool)$stmt->fetch();
    }

    public function create(string $nombre, string $email, string $passwordHash, ?string $telefono, string $rol = 'huesped', ?string $documento = null): int {
        $stmt = $this->db->prepare(
            'INSERT INTO usuarios (nombre, email, password_hash, telefono, rol, documento) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$nombre, $email, $passwordHash, $telefono ?: null, $rol, $documento ?: null]);
        return (int)$this->db->lastInsertId();
    }

    public function getAllAdmins(): array {
        $stmt = $this->db->query('SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE rol = "admin" ORDER BY created_at DESC');
        return $stmt->fetchAll();
    }

    public function getHuespedesStats(): array {
        $stmt = $this->db->query(
            'SELECT u.id, u.nombre, u.email, u.telefono, u.documento, u.activo, u.created_at,
                    COUNT(r.id) AS total_reservas,
                    COALESCE(SUM(r.total), 0) AS total_gastado,
                    MAX(r.created_at) AS ultima_reserva
             FROM usuarios u
             LEFT JOIN reservas r ON u.id = r.usuario_id AND r.estado NOT IN ("cancelada")
             WHERE u.rol = "huesped"
             GROUP BY u.id
             ORDER BY u.created_at DESC'
        );
        return $stmt->fetchAll();
    }

    public function toggleActivo(int $id, int $activo): bool {
        $stmt = $this->db->prepare('UPDATE usuarios SET activo = ? WHERE id = ?');
        return $stmt->execute([$activo, $id]);
    }

    // Refresh Tokens
    public function saveRefreshToken(int $usuarioId, string $tokenHash, string $expiresAt): bool {
        $stmt = $this->db->prepare(
            'INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at) VALUES (?, ?, ?)'
        );
        return $stmt->execute([$usuarioId, $tokenHash, $expiresAt]);
    }
}
