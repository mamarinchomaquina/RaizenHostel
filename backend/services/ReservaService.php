<?php

require_once __DIR__ . '/../models/Reserva.php';
require_once __DIR__ . '/../models/Habitacion.php';
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../models/Pago.php';
require_once __DIR__ . '/../helpers/mailer.php';

class ReservaService {
    private Reserva $resModel;
    private Habitacion $habModel;
    private Usuario $usrModel;
    private Pago $pagoModel;

    public function __construct(PDO $db) {
        $this->resModel = new Reserva($db);
        $this->habModel = new Habitacion($db);
        $this->usrModel = new Usuario($db);
        $this->pagoModel = new Pago($db);
    }

    public function createReserva(int $usuarioId, int $unidadId, string $checkin, string $checkout, int $numPersonas, ?string $notas): array {
        // 1. Check availability
        if (!$this->resModel->checkDisponibilidad($unidadId, $checkin, $checkout)) {
            throw new Exception('La habitación ya está ocupada en esas fechas.', 409);
        }

        // 2. Fetch unit details
        $unidad = $this->habModel->getById($unidadId);
        if (!$unidad) {
            throw new Exception('Habitación no encontrada.', 404);
        }

        $precioNoche = (float)$unidad['precio'];
        $noches = max(1, (int)((strtotime($checkout) - strtotime($checkin)) / 86400));
        $total = $precioNoche * $noches;
        $codigo = 'RZ-' . strtoupper(bin2hex(random_bytes(4)));

        // 3. Create reserva
        $resId = $this->resModel->create($codigo, $usuarioId, $unidadId, $checkin, $checkout, $numPersonas, $precioNoche, $total, 'pago_pendiente', $notas);

        return [
            'id'           => $resId,
            'codigo'       => $codigo,
            'checkin'      => $checkin,
            'checkout'     => $checkout,
            'noches'       => $noches,
            'precio_noche' => $precioNoche,
            'total'        => $total,
            'estado'       => 'pago_pendiente'
        ];
    }

    public function createReservaManual(array $data): array {
        $nombre    = trim($data['nombre'] ?? '');
        $documento = trim($data['documento'] ?? '');
        $email     = trim($data['email'] ?? '');
        $telefono  = trim($data['telefono'] ?? '');
        $unidadId  = (int)($data['unidad_id'] ?? 0);
        $checkin   = $data['checkin'] ?? '';
        $checkout  = $data['checkout'] ?? '';
        $estado    = $data['estado'] ?? 'confirmada';

        if (!$nombre) $nombre = 'Huésped Anónimo';

        if (!$unidadId || !$checkin || !$checkout) {
            throw new Exception('La unidad, check-in y check-out son requeridos.', 400);
        }

        // Generate mock email if empty to satisfy DB
        if (!$email) {
            $email = 'guest_' . bin2hex(random_bytes(4)) . '@raizenhostel.local';
        }

        // Find or create user
        $user = $this->usrModel->findByEmail($email);
        if ($user) {
            $usuarioId = $user['id'];
        } else {
            $hash = password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            $usuarioId = $this->usrModel->create($nombre, $email, $hash, $telefono, 'huesped', $documento);
        }

        // Verify availability
        if ($this->resModel->checkOverlappingReservations($unidadId, $checkin, $checkout) > 0) {
            throw new Exception('La habitación ya está ocupada en esas fechas.', 409);
        }

        // Fetch unit details
        $unidad = $this->habModel->getById($unidadId);
        if (!$unidad) {
            throw new Exception('Habitación no encontrada.', 404);
        }

        $precioNoche = (float)$unidad['precio'];
        $noches = max(1, (int)((strtotime($checkout) - strtotime($checkin)) / 86400));
        $total = $precioNoche * $noches;
        $codigo = 'RZ-' . strtoupper(bin2hex(random_bytes(4)));

        $resId = $this->resModel->create($codigo, $usuarioId, $unidadId, $checkin, $checkout, 1, $precioNoche, $total, $estado, 'Walk-in registrado en recepción');

        // Create approved local cash/terminal payment
        $this->pagoModel->create($resId, 'LOCAL', $total, 'aprobado');

        // Send email confirmation if real email
        if ($email && !str_ends_with($email, '@raizenhostel.local')) {
            @Mailer::sendReservaConfirmation($email, $nombre, $codigo, $checkin, $checkout, $total);
        }

        return ['ok' => true, 'id' => $resId, 'codigo' => $codigo];
    }

    public function getMisReservas(int $usuarioId): array {
        return $this->resModel->getAll(['usuario_id' => $usuarioId]);
    }

    public function getById(int $id) {
        return $this->resModel->getById($id);
    }

    public function getReservasUnidad(int $unidadId): array {
        return $this->resModel->getReservasUnidad($unidadId);
    }

    public function checkDisponibilidad(int $unidadId, string $checkin, string $checkout): array {
        $disponibles = $this->resModel->checkDisponibilidad($unidadId, $checkin, $checkout);
        return [
            'disponible' => $disponibles,
            'mensaje'    => $disponibles ? 'Habitación disponible' : 'Habitación no disponible en esas fechas'
        ];
    }
}
