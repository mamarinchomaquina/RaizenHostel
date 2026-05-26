<?php

require_once __DIR__ . '/../models/Pago.php';
require_once __DIR__ . '/../models/Reserva.php';
require_once __DIR__ . '/../helpers/wompi.php';
require_once __DIR__ . '/../helpers/mailer.php';

class PagoService {
    private Pago $pagoModel;
    private Reserva $resModel;
    private PDO $db; // Keep temporary reference for direct transaction if needed, or pass models

    public function __construct(PDO $db) {
        $this->pagoModel = new Pago($db);
        $this->resModel = new Reserva($db);
        $this->db = $db;
    }

    public function iniciarPago(int $reservaId, int $userId): array {
        $reserva = $this->resModel->getById($reservaId);

        if (!$reserva) {
            throw new Exception('Reserva no encontrada.', 404);
        }

        if ($reserva['usuario_id'] !== $userId) {
            throw new Exception('No tiene autorización para pagar esta reserva.', 403);
        }

        if ($reserva['estado'] !== 'pendiente' && $reserva['estado'] !== 'pago_pendiente') {
            throw new Exception('Esta reserva ya fue procesada o no está disponible para pago.', 400);
        }

        // Prepare Wompi Widget specs
        $montoCents = (int)($reserva['total'] * 100);
        $referencia = $reserva['codigo'];
        $moneda = 'COP';
        $signature = Wompi::generateIntegritySignature($referencia, $montoCents, $moneda);

        // Record payment attempt
        $pagoId = $this->pagoModel->create($reservaId, 'wompi', $reserva['total'], 'pendiente');

        return [
            'pago_id'         => $pagoId,
            'public_key'      => Wompi::getPublicKey(),
            'currency'        => $moneda,
            'amount_in_cents' => $montoCents,
            'reference'       => $referencia,
            'signature'       => $signature,
        ];
    }

    public function confirmarWompi(string $txId): array {
        $tx = Wompi::getTransaction($txId);
        $status = $tx['data']['status'] ?? '';
        $ref = $tx['data']['reference'] ?? '';

        if (!$ref) {
            throw new Exception('No se pudo obtener la referencia de la transacción.', 400);
        }

        // Get reserva by code/reference
        $stmt = $this->db->prepare('SELECT id FROM reservas WHERE codigo = ?');
        $stmt->execute([$ref]);
        $reserva = $stmt->fetch();

        if (!$reserva) {
            throw new Exception('Reserva no encontrada para esta transacción.', 404);
        }

        if ($status === 'APPROVED') {
            // Update payment and confirm reservation
            $stmt = $this->db->prepare(
                'UPDATE pagos SET estado = "aprobado", proveedor_id = ?, datos_raw = ? WHERE reserva_id = ?'
            );
            $stmt->execute([$txId, json_encode($tx), $reserva['id']]);

            $this->confirmarYNotificar($reserva['id']);
            return ['ok' => true, 'estado' => 'aprobado'];
        }

        return ['ok' => false, 'estado' => strtolower($status)];
    }

    public function getEstado(int $pagoId): array {
        $pago = $this->pagoModel->findById($pagoId);
        if (!$pago) {
            throw new Exception('Pago no encontrado.', 404);
        }

        // Sandbox check (autocontrol)
        if ($pago['estado'] === 'pendiente' && str_starts_with($pago['proveedor_id'] ?? '', 'sandbox_')) {
            $this->pagoModel->updateEstado($pagoId, 'aprobado');
            $this->confirmarYNotificar($pago['reserva_id']);
            $pago['estado'] = 'aprobado';
        }
        // Poll production Wompi
        elseif ($pago['estado'] === 'pendiente' && $pago['proveedor_id']) {
            $tx = Wompi::getTransaction($pago['proveedor_id']);
            $status = $tx['data']['status'] ?? '';

            if ($status === 'APPROVED') {
                $stmt = $this->db->prepare('UPDATE pagos SET estado = "aprobado", datos_raw = ? WHERE id = ?');
                $stmt->execute([json_encode($tx), $pagoId]);

                $this->confirmarYNotificar($pago['reserva_id']);
                $pago['estado'] = 'aprobado';
            } elseif (in_array($status, ['DECLINED', 'ERROR', 'VOIDED'])) {
                $stmt = $this->db->prepare('UPDATE pagos SET estado = "rechazado", datos_raw = ? WHERE id = ?');
                $stmt->execute([json_encode($tx), $pagoId]);
                $pago['estado'] = 'rechazado';
            }
        }

        return [
            'id'     => (int)$pago['id'],
            'estado' => $pago['estado'],
            'metodo' => $pago['metodo'],
            'monto'  => (float)$pago['monto'],
        ];
    }

    public function processWebhook(string $body, string $signature): bool {
        if (!Wompi::verifyWebhookSignature($body, $signature)) {
            throw new Exception('Firma de webhook inválida.', 401);
        }

        $event = json_decode($body, true);
        $txData = $event['data']['transaction'] ?? [];
        $reference = $txData['reference'] ?? '';
        $status = $txData['status'] ?? '';

        if (!$reference || !$status) {
            return true;
        }

        $nuevoEstado = match ($status) {
            'APPROVED' => 'aprobado',
            'DECLINED', 'ERROR', 'VOIDED' => 'rechazado',
            default => null,
        };

        if ($nuevoEstado) {
            $stmt = $this->db->prepare('SELECT id FROM reservas WHERE codigo = ?');
            $stmt->execute([$reference]);
            $reserva = $stmt->fetch();

            if ($reserva) {
                $stmt = $this->db->prepare('UPDATE pagos SET estado = ?, datos_raw = ? WHERE reserva_id = ?');
                $stmt->execute([$nuevoEstado, $body, $reserva['id']]);

                if ($nuevoEstado === 'aprobado') {
                    $this->confirmarYNotificar($reserva['id']);
                }
            }
        }

        return true;
    }

    public function confirmarYNotificar(int $reservaId): void {
        $this->resModel->updateEstado($reservaId, 'confirmada');

        $reserva = $this->resModel->getById($reservaId);
        if ($reserva) {
            @Mailer::sendReservaConfirmation(
                $reserva['usuario_email'],
                $reserva['usuario_nombre'],
                $reserva['codigo'],
                $reserva['checkin'],
                $reserva['checkout'],
                (float)$reserva['total']
            );
        }
    }
}
