<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/PagoService.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';

class PagosController {
    private PagoService $service;

    public function __construct() {
        $db = (new Database())->getConnection();
        $this->service = new PagoService($db);
    }

    /**
     * Endpoint: POST /pagos/iniciar
     */
    public function iniciar(): void {
        try {
            $user = require_auth();
            $data = get_json_body();
            $reservaId = (int)($data['reserva_id'] ?? $data['reservaId'] ?? 0);

            if (!$reservaId) {
                json_error('reserva_id es requerido.', 400);
            }

            $res = $this->service->iniciarPago($reservaId, $user['id']);
            json_response($res);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al iniciar el pago.', 500);
        }
    }

    /**
     * Endpoint: POST /pagos/confirmar-wompi
     */
    public function confirmarWompi(): void {
        try {
            require_auth();
            $data = get_json_body();
            $txId = trim($data['transaction_id'] ?? '');

            if (!$txId) {
                json_error('transaction_id es requerido.', 400);
            }

            $res = $this->service->confirmarWompi($txId);
            json_response($res);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al confirmar transacción de Wompi.', 500);
        }
    }

    /**
     * Endpoint: GET /pagos/:id/estado
     */
    public function estado(int $pagoId): void {
        try {
            require_auth();
            $res = $this->service->getEstado($pagoId);
            json_response($res);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al obtener estado del pago.', 500);
        }
    }

    /**
     * Endpoint: POST /pagos/webhook-wompi
     */
    public function webhookWompi(): void {
        try {
            $body = file_get_contents('php://input');
            $signature = $_SERVER['HTTP_X_WOMPI_SIGNATURE'] ?? '';

            $this->service->processWebhook($body, $signature);
            json_response(['ok' => true]);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_response(['ok' => false]);
        }
    }
}
