<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/ContenidoService.php';
require_once __DIR__ . '/../helpers/response.php';

class ContactoController {
    private ContenidoService $service;

    public function __construct() {
        $db = (new Database())->getConnection();
        $this->service = new ContenidoService($db);
    }

    /**
     * Endpoint: POST /contacto/enviar
     */
    public function enviar(): void {
        try {
            $data = get_json_body();
            $nombre  = trim($data['nombre']  ?? '');
            $email   = trim($data['email']   ?? '');
            $mensaje = trim($data['mensaje'] ?? '');

            if (!$nombre || !$email || !$mensaje) {
                json_error('Nombre, email y mensaje son requeridos.', 400);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json_error('Email inválido.', 400);
            }

            $this->service->enviarMensaje($nombre, $email, $mensaje);

            // Notify admin via email
            require_once __DIR__ . '/../helpers/mailer.php';
            @Mailer::notifyNewContact($nombre, $email, 'Consulta general', $mensaje);

            json_response(['mensaje' => 'Mensaje enviado. Te responderemos pronto.']);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al enviar el mensaje.', 500);
        }
    }

    /**
     * Endpoint: GET /admin/mensajes
     */
    public function listar(): void {
        try {
            $res = $this->service->getMensajes();
            json_response($res);
        } catch (Throwable $e) {
            json_error('Error al listar mensajes.', 500);
        }
    }

    /**
     * Endpoint: GET /admin/mensajes/:id
     */
    public function getById(int $id): void {
        try {
            $res = $this->service->getMensajeById($id);
            json_response($res);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 404);
        } catch (Throwable $e) {
            json_error('Error al obtener mensaje.', 500);
        }
    }

    /**
     * Endpoint: POST /admin/mensajes/:id/responder
     */
    public function responder(int $id, int $adminId): void {
        try {
            $data = get_json_body();
            $respuesta = trim($data['respuesta'] ?? '');

            if (!$respuesta) {
                json_error('La respuesta es requerida.', 400);
            }

            $this->service->responderMensaje($id, $respuesta, $adminId);

            json_response([
                'id'          => $id,
                'estado'      => 'respondido',
                'respuesta'   => $respuesta,
            ]);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al responder mensaje.', 500);
        }
    }

    /**
     * Endpoint: DELETE /admin/mensajes/:id
     */
    public function eliminar(int $id): void {
        try {
            $this->service->eliminarMensaje($id);
            json_response(['eliminado' => true]);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 404);
        } catch (Throwable $e) {
            json_error('Error al eliminar mensaje.', 500);
        }
    }

    /**
     * Endpoint: GET /admin/mensajes/stats
     */
    public function stats(): void {
        try {
            $res = $this->service->getMensajesStats();
            json_response($res);
        } catch (Throwable $e) {
            json_error('Error al obtener estadísticas de mensajes.', 500);
        }
    }
}
