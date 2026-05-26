<?php

class Pago {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function findById(int $id) {
        $stmt = $this->db->prepare('SELECT * FROM pagos WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function create(int $reservaId, string $proveedor, float $monto, string $estado, ?string $proveedorId = null): int {
        $stmt = $this->db->prepare(
            'INSERT INTO pagos (reserva_id, proveedor, monto, estado, proveedor_id) 
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$reservaId, $proveedor, $monto, $estado, $proveedorId]);
        return (int)$this->db->lastInsertId();
    }

    public function updateEstado(int $id, string $estado, ?string $proveedorId = null): bool {
        $sql = 'UPDATE pagos SET estado = ?';
        $params = [$estado];

        if ($proveedorId !== null) {
            $sql .= ', proveedor_id = ?';
            $params[] = $proveedorId;
        }

        $sql .= ' WHERE id = ?';
        $params[] = $id;

        return $this->db->prepare($sql)->execute($params);
    }

    public function getIngresosHoy(string $hoy): float {
        $stmt = $this->db->prepare(
            'SELECT COALESCE(SUM(p.monto), 0) FROM pagos p WHERE p.estado = "aprobado" AND DATE(p.created_at) = ?'
        );
        $stmt->execute([$hoy]);
        return (float)$stmt->fetchColumn();
    }

    public function getReporteIngresos(string $groupBy): array {
        $stmt = $this->db->query(
            "SELECT $groupBy AS periodo, SUM(p.monto) AS total, COUNT(DISTINCT p.reserva_id) AS reservas
             FROM pagos p
             WHERE p.estado = 'aprobado'
             GROUP BY periodo
             ORDER BY periodo DESC
             LIMIT 12"
        );
        return $stmt->fetchAll();
    }
}
