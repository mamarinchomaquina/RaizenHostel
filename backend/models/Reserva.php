<?php

class Reserva {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAll(array $filters = [], string $sortOrder = 'DESC', int $limit = 50): array {
        $sql = 'SELECT r.*, u.numero, u.nombre_display,
                       usr.nombre AS usuario_nombre, usr.email AS usuario_email
                FROM reservas r
                JOIN unidades u ON r.unidad_id = u.id
                JOIN usuarios usr ON r.usuario_id = usr.id';
        $params = [];
        $where = [];

        if (!empty($filters['estado'])) {
            $where[] = 'r.estado = ?';
            $params[] = $filters['estado'];
        }

        if (!empty($filters['fecha'])) {
            $where[] = '(r.checkin = ? OR r.checkout = ?)';
            $params[] = $filters['fecha'];
            $params[] = $filters['fecha'];
        }

        if (!empty($filters['usuario_id'])) {
            $where[] = 'r.usuario_id = ?';
            $params[] = $filters['usuario_id'];
        }

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= " ORDER BY r.created_at $sortOrder LIMIT $limit";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getById(int $id) {
        $stmt = $this->db->prepare(
            'SELECT r.*, u.numero, u.nombre_display,
                    usr.nombre AS usuario_nombre, usr.email AS usuario_email
             FROM reservas r
             JOIN unidades u ON r.unidad_id = u.id
             JOIN usuarios usr ON r.usuario_id = usr.id
             WHERE r.id = ?'
        );
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function checkOverlappingReservations(int $unidadId, string $checkin, string $checkout): int {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM reservas
             WHERE unidad_id = ? AND estado NOT IN ("cancelada","completada")
             AND checkin < ? AND checkout > ?'
        );
        $stmt->execute([$unidadId, $checkout, $checkin]);
        return (int)$stmt->fetchColumn();
    }

    public function create(string $codigo, int $usuarioId, int $unidadId, string $checkin, string $checkout, int $numPersonas, float $precioNoche, float $total, string $estado, ?string $notas): int {
        $stmt = $this->db->prepare(
            'INSERT INTO reservas (codigo, usuario_id, unidad_id, checkin, checkout, num_personas, precio_noche, total, estado, notas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$codigo, $usuarioId, $unidadId, $checkin, $checkout, $numPersonas, $precioNoche, $total, $estado, $notas]);
        return (int)$this->db->lastInsertId();
    }

    public function updateEstado(int $id, string $estado): bool {
        $stmt = $this->db->prepare('UPDATE reservas SET estado = ? WHERE id = ?');
        return $stmt->execute([$estado, $id]);
    }

    public function getHuespedesActuales(): array {
        $stmt = $this->db->prepare(
            'SELECT r.*, u.numero, u.nombre_display,
                    usr.nombre AS usuario_nombre, usr.email AS usuario_email,
                    usr.telefono AS usuario_telefono, usr.documento AS usuario_documento
             FROM reservas r
             JOIN unidades u ON r.unidad_id = u.id
             JOIN usuarios usr ON r.usuario_id = usr.id
             WHERE r.estado IN ("en_curso", "confirmada")
               AND CURRENT_DATE >= r.checkin
               AND CURRENT_DATE <= r.checkout
               AND r.estado != "cancelada"
             ORDER BY r.checkin ASC'
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getReservasUnidad(int $unidadId): array {
        $stmt = $this->db->prepare(
            'SELECT checkin, checkout FROM reservas 
             WHERE unidad_id = ? AND estado NOT IN ("cancelada", "completada")'
        );
        $stmt->execute([$unidadId]);
        return $stmt->fetchAll();
    }

    public function checkDisponibilidad(int $unidadId, string $checkin, string $checkout): bool {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM reservas 
             WHERE unidad_id = ? AND estado NOT IN ("cancelada", "completada")
               AND checkin < ? AND checkout > ?'
        );
        $stmt->execute([$unidadId, $checkout, $checkin]);
        return ((int)$stmt->fetchColumn()) === 0;
    }

    // Dashboard KPIs
    public function getKPIs(string $hoy): array {
        $totalUnidades = (int)$this->db->query('SELECT COUNT(*) FROM unidades')->fetchColumn();

        $stmt = $this->db->prepare(
            'SELECT COUNT(DISTINCT unidad_id) FROM reservas WHERE estado IN ("confirmada","en_curso") AND checkin <= ? AND checkout > ?'
        );
        $stmt->execute([$hoy, $hoy]);
        $ocupadas = (int)$stmt->fetchColumn();

        $stmt = $this->db->prepare('SELECT COUNT(*) FROM reservas WHERE checkin = ?');
        $stmt->execute([$hoy]);
        $checkinsHoy = (int)$stmt->fetchColumn();

        $stmt = $this->db->prepare('SELECT COUNT(*) FROM reservas WHERE checkout = ?');
        $stmt->execute([$hoy]);
        $checkoutsHoy = (int)$stmt->fetchColumn();

        $stmt = $this->db->prepare('SELECT COUNT(*) FROM reservas WHERE estado IN ("pendiente","pago_pendiente")');
        $stmt->execute();
        $pendientes = (int)$stmt->fetchColumn();

        return [
            'total_unidades'      => $totalUnidades,
            'unidades_ocupadas'   => $ocupadas,
            'checkins_hoy'        => $checkinsHoy,
            'checkouts_hoy'       => $checkoutsHoy,
            'reservas_pendientes' => $pendientes
        ];
    }

    // Reportes
    public function getOcupacionDiaria(string $fecha): int {
        $stmt = $this->db->prepare(
            'SELECT COUNT(DISTINCT unidad_id) FROM reservas
             WHERE estado IN ("confirmada","en_curso","completada")
             AND checkin <= ? AND checkout > ?'
        );
        $stmt->execute([$fecha, $fecha]);
        return (int)$stmt->fetchColumn();
    }
}
