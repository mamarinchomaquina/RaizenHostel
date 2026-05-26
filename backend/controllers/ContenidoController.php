<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/ContenidoService.php';
require_once __DIR__ . '/../helpers/response.php';

class ContenidoController {
    private ContenidoService $service;

    public function __construct() {
        $db = (new Database())->getConnection();
        $this->service = new ContenidoService($db);
    }

    public function getSeccion(string $seccion): void {
        try {
            $data = $this->service->getSeccion($seccion);
            if (empty($data)) {
                json_error('Sección no encontrada.', 404);
            }
            json_response($data);
        } catch (Throwable $e) {
            json_error('Error al obtener la sección.', 500);
        }
    }

    public function updateSeccion(string $seccion, int $adminId): void {
        try {
            $data = get_json_body();
            $this->service->updateSeccion($seccion, $data, $adminId);
            json_response($data);
        } catch (Throwable $e) {
            json_error('Error al actualizar la sección.', 500);
        }
    }

    public function getServicios(): void {
        try {
            $result = $this->service->getServicios();
            json_response($result);
        } catch (Throwable $e) {
            json_error('Error al obtener servicios.', 500);
        }
    }
}
