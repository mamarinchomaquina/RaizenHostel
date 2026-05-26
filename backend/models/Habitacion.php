<?php

class Habitacion {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAll(): array {
        // List units with images
        $stmt = $this->db->query(
            'SELECT u.*, t.nombre AS tipo_nombre, t.capacidad AS tipo_capacidad
             FROM unidades u
             JOIN tipos_habitacion t ON u.tipo_id = t.id
             ORDER BY u.orden ASC'
        );
        $unidades = $stmt->fetchAll();

        foreach ($unidades as &$u) {
            $u['imagenes'] = $this->getImagenes($u['id']);
        }
        return $unidades;
    }

    public function getById(int $id) {
        $stmt = $this->db->prepare(
            'SELECT u.*, t.nombre AS tipo_nombre, t.capacidad AS tipo_capacidad
             FROM unidades u
             JOIN tipos_habitacion t ON u.tipo_id = t.id
             WHERE u.id = ?'
        );
        $stmt->execute([$id]);
        $unidad = $stmt->fetch();
        if ($unidad) {
            $unidad['imagenes'] = $this->getImagenes($id);
        }
        return $unidad;
    }

    public function update(int $id, array $data): bool {
        $fields = [];
        $params = [];

        foreach (['nombre_display', 'descripcion', 'precio', 'disponible'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = ?";
                if ($field === 'disponible') {
                    $params[] = $data[$field] ? 1 : 0;
                } else {
                    $params[] = $data[$field];
                }
            }
        }

        if (empty($fields)) return false;

        $params[] = $id;
        $sql = 'UPDATE unidades SET ' . implode(', ', $fields) . ' WHERE id = ?';
        return $this->db->prepare($sql)->execute($params);
    }

    // Categories (tipos_habitacion)
    public function getTipos(): array {
        $stmt = $this->db->query(
            'SELECT t.*, COUNT(u.id) AS total_unidades, SUM(u.disponible) AS unidades_disponibles
             FROM tipos_habitacion t
             LEFT JOIN unidades u ON u.tipo_id = t.id
             GROUP BY t.id ORDER BY t.id'
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateTipo(int $id, array $data): bool {
        $fields = [];
        $params = [];

        foreach (['nombre', 'descripcion', 'precio_base', 'popular'] as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "$f = ?";
                $params[] = $data[$f];
            }
        }
        if (empty($fields)) return false;

        $params[] = $id;
        $success = $this->db->prepare('UPDATE tipos_habitacion SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);

        if ($success && array_key_exists('precio_base', $data)) {
            // Sync unit prices for this type
            $this->db->prepare('UPDATE unidades SET precio = ? WHERE tipo_id = ?')
                     ->execute([(float)$data['precio_base'], $id]);
        }

        return $success;
    }

    // Images (unidad_imagenes)
    public function getImagenes(int $unidadId): array {
        $stmt = $this->db->prepare('SELECT id, url, alt_text, orden FROM unidad_imagenes WHERE unidad_id = ? ORDER BY orden ASC');
        $stmt->execute([$unidadId]);
        return $stmt->fetchAll();
    }

    public function addImagen(int $unidadId, string $url, string $altText): int {
        $stmt = $this->db->prepare(
            'INSERT INTO unidad_imagenes (unidad_id, url, alt_text, orden) 
             VALUES (?, ?, ?, (SELECT COALESCE(MAX(i2.orden),0)+1 FROM unidad_imagenes i2 WHERE i2.unidad_id = ?))'
        );
        $stmt->execute([$unidadId, $url, $altText, $unidadId]);
        return (int)$this->db->lastInsertId();
    }

    public function getImagenById(int $imgId) {
        $stmt = $this->db->prepare('SELECT id, url, unidad_id FROM unidad_imagenes WHERE id = ?');
        $stmt->execute([$imgId]);
        return $stmt->fetch();
    }

    public function deleteImagen(int $imgId): bool {
        $stmt = $this->db->prepare('DELETE FROM unidad_imagenes WHERE id = ?');
        return $stmt->execute([$imgId]);
    }
}
