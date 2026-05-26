<?php

class Contenido {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getSeccion(string $clave) {
        $stmt = $this->db->prepare('SELECT contenido_json FROM contenido_web WHERE seccion_clave = ?');
        $stmt->execute([$clave]);
        return $stmt->fetchColumn();
    }

    public function updateSeccion(string $clave, string $json, int $adminId): bool {
        $stmt = $this->db->prepare(
            'INSERT INTO contenido_web (seccion_clave, contenido_json, actualizado_por) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE contenido_json = ?, actualizado_por = ?'
        );
        return $stmt->execute([$clave, $json, $adminId, $json, $adminId]);
    }

    // Services
    public function getServicios(): array {
        $stmt = $this->db->query('SELECT * FROM servicios WHERE activo = 1 ORDER BY orden ASC');
        return $stmt->fetchAll();
    }

    // Gallery
    public function getGaleria(): array {
        $stmt = $this->db->query('SELECT * FROM galeria WHERE activo = 1 ORDER BY orden ASC');
        return $stmt->fetchAll();
    }

    public function addGaleria(string $url, string $altText, string $categoria, bool $spanWide, bool $spanTall): int {
        $stmt = $this->db->prepare(
            'INSERT INTO galeria (url, alt_text, categoria, span_wide, span_tall, orden) 
             VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(g2.orden),0)+1 FROM galeria g2))'
        );
        $stmt->execute([$url, $altText, $categoria, $spanWide ? 1 : 0, $spanTall ? 1 : 0]);
        return (int)$this->db->lastInsertId();
    }

    public function getGaleriaById(int $id) {
        $stmt = $this->db->prepare('SELECT * FROM galeria WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function deleteGaleria(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM galeria WHERE id = ?');
        return $stmt->execute([$id]);
    }

    // Contact messages (mensajes_contacto)
    public function getMensajes(): array {
        $stmt = $this->db->query('SELECT * FROM mensajes_contacto ORDER BY created_at DESC');
        return $stmt->fetchAll();
    }

    public function getMensajeById(int $id) {
        $stmt = $this->db->prepare('SELECT * FROM mensajes_contacto WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function addMensaje(string $nombre, string $email, string $mensaje): int {
        $stmt = $this->db->prepare(
            'INSERT INTO mensajes_contacto (nombre, email, mensaje) VALUES (?, ?, ?)'
        );
        $stmt->execute([$nombre, $email, $mensaje]);
        return (int)$this->db->lastInsertId();
    }

    public function updateMensajeLeido(int $id, int $leido): bool {
        $stmt = $this->db->prepare('UPDATE mensajes_contacto SET leido = ? WHERE id = ?');
        return $stmt->execute([$leido, $id]);
    }

    public function updateMensajeRespuesta(int $id, string $respuesta, int $adminId): bool {
        $stmt = $this->db->prepare(
            'UPDATE mensajes_contacto SET contestado = 1, respuesta = ?, contestado_por = ?, contestado_at = CURRENT_TIMESTAMP WHERE id = ?'
        );
        return $stmt->execute([$respuesta, $adminId, $id]);
    }

    public function deleteMensaje(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM mensajes_contacto WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function getMensajesStats(): array {
        $total = (int)$this->db->query('SELECT COUNT(*) FROM mensajes_contacto')->fetchColumn();
        $noLeidos = (int)$this->db->query('SELECT COUNT(*) FROM mensajes_contacto WHERE leido = 0')->fetchColumn();
        $contestados = (int)$this->db->query('SELECT COUNT(*) FROM mensajes_contacto WHERE contestado = 1')->fetchColumn();
        return [
            'total' => $total,
            'no_leidos' => $noLeidos,
            'contestados' => $contestados
        ];
    }
}
