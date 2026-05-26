<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/ReservaService.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';

class ReservasController {
    private ReservaService $service;

    public function __construct() {
        $db = (new Database())->getConnection();
        $this->service = new ReservaService($db);
    }

    /**
     * Endpoint: POST /reservas
     */
    public function crear(): void {
        try {
            $user = require_auth();
            $data = get_json_body();

            $unidadId    = (int)($data['unidad_id'] ?? 0);
            $checkin     = $data['checkin']     ?? '';
            $checkout    = $data['checkout']    ?? '';
            $numPersonas = (int)($data['num_personas'] ?? 1);
            $notas       = trim($data['notas'] ?? '');

            if (!$unidadId || !$checkin || !$checkout) {
                json_error('unidad_id, checkin y checkout son requeridos.', 400);
            }

            $res = $this->service->createReserva($user['id'], $unidadId, $checkin, $checkout, $numPersonas, $notas);

            // Notify admin
            require_once __DIR__ . '/../helpers/mailer.php';
            @Mailer::notifyNewReservation([
                'codigo'   => $res['codigo'],
                'nombre'   => $user['nombre'],
                'checkin'  => $checkin,
                'checkout' => $checkout,
                'total'    => $res['total']
            ]);

            json_response($res, 201);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al crear la reserva.', 500);
        }
    }

    /**
     * Endpoint: GET /reservas/:id
     */
    public function getById(int $id): void {
        try {
            $user = require_auth();
            $reserva = $this->service->getById($id);

            if (!$reserva || (int)$reserva['usuario_id'] !== $user['id']) {
                json_error('Reserva no encontrada.', 404);
            }

            json_response([
                'id'            => (int)$reserva['id'],
                'codigo'        => $reserva['codigo'],
                'usuario_id'    => (int)$reserva['usuario_id'],
                'unidad_id'     => (int)$reserva['unidad_id'],
                'unidad'        => [
                    'numero'         => $reserva['numero'],
                    'nombre_display' => $reserva['nombre_display'],
                ],
                'checkin'       => $reserva['checkin'],
                'checkout'      => $reserva['checkout'],
                'noches'        => max(1, (int)((strtotime($reserva['checkout']) - strtotime($reserva['checkin'])) / 86400)),
                'num_personas'  => (int)$reserva['num_personas'],
                'precio_noche'  => (float)$reserva['precio_noche'],
                'total'         => (float)$reserva['total'],
                'estado'        => $reserva['estado'],
                'notes'         => $reserva['notas'] ?? '',
                'created_at'    => $reserva['created_at'],
            ]);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 404);
        } catch (Throwable $e) {
            json_error('Error al obtener la reserva.', 500);
        }
    }

    /**
     * Endpoint: GET /reservas/mis-reservas
     */
    public function misReservas(): void {
        try {
            $user = require_auth();
            $result = $this->service->getMisReservas($user['id']);
            json_response($result);
        } catch (Throwable $e) {
            json_error('Error al obtener tus reservas.', 500);
        }
    }
}
