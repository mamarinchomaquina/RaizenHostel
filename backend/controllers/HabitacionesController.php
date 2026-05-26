<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/HabitacionService.php';
require_once __DIR__ . '/../helpers/response.php';

class HabitacionesController {
    private HabitacionService $service;

    public function __construct() {
        $db = (new Database())->getConnection();
        $this->service = new HabitacionService($db);
    }

    /**
     * Endpoint: GET /habitaciones/tipos
     */
    public function listarTipos(): void {
        try {
            $result = $this->service->getTipos();
            json_response($result);
        } catch (Throwable $e) {
            json_error('Error al listar tipos de habitación.', 500);
        }
    }

    /**
     * Endpoint: GET /habitaciones
     */
    public function listar(): void {
        try {
            $unidades = $this->service->getAll();
            $host = isset($_SERVER['HTTP_HOST']) ? 'http://' . $_SERVER['HTTP_HOST'] : 'http://localhost';

            $result = [];
            foreach ($unidades as $u) {
                $imagenesFormatted = array_map(function ($img) use ($host) {
                    $img['url'] = $host . $img['url'];
                    return $img;
                }, $u['imagenes']);

                $result[] = [
                    'id'             => (int)$u['id'],
                    'tipo_id'        => (int)$u['tipo_id'],
                    'numero'         => $u['numero'],
                    'nombre_display' => $u['nombre_display'],
                    'descripcion'    => $u['descripcion'] ?? '',
                    'precio'         => (float)$u['precio'],
                    'disponible'     => (bool)(int)$u['disponible'],
                    'orden'          => (int)$u['orden'],
                    'tipo'           => [
                        'slug'      => $u['tipo_nombre'] ? strtolower(str_replace(' ', '-', $u['tipo_nombre'])) : 'cama',
                        'nombre'    => $u['tipo_nombre'],
                        'capacidad' => (int)$u['tipo_capacidad'],
                    ],
                    'imagenes'       => $imagenesFormatted,
                ];
            }

            json_response($result);
        } catch (Throwable $e) {
            json_error('Error al listar habitaciones.', 500);
        }
    }

    /**
     * Endpoint: GET /habitaciones/:id
     */
    public function detalle(int $id): void {
        try {
            $u = $this->service->getById($id);
            $host = isset($_SERVER['HTTP_HOST']) ? 'http://' . $_SERVER['HTTP_HOST'] : 'http://localhost';

            $imagenesFormatted = array_map(function ($img) use ($host) {
                $img['url'] = $host . $img['url'];
                return $img;
            }, $u['imagenes']);

            json_response([
                'id'             => (int)$u['id'],
                'numero'         => $u['numero'],
                'nombre_display' => $u['nombre_display'],
                'descripcion'    => $u['descripcion'] ?? '',
                'precio'         => (float)$u['precio'],
                'disponible'     => (bool)$u['disponible'],
                'tipo'           => [
                    'slug'        => $u['tipo_nombre'] ? strtolower(str_replace(' ', '-', $u['tipo_nombre'])) : 'cama',
                    'nombre'      => $u['tipo_nombre'],
                    'capacidad'   => (int)$u['tipo_capacidad'],
                    'descripcion' => $u['descripcion'] ?? '',
                ],
                'imagenes'       => $imagenesFormatted,
            ]);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 404);
        } catch (Throwable $e) {
            json_error('Error al obtener detalle de la habitación.', 500);
        }
    }

    /**
     * Endpoint: GET /habitaciones/:id/disponibilidad
     */
    public function disponibilidad(int $id): void {
        try {
            $checkin  = $_GET['checkin']  ?? '';
            $checkout = $_GET['checkout'] ?? '';

            if (!$checkin || !$checkout) {
                json_error('Se requieren parámetros checkin y checkout.', 400);
            }

            $res = $this->service->checkDisponibilidad($id, $checkin, $checkout);
            json_response(['disponible' => $res['disponible']]);
        } catch (Throwable $e) {
            json_error('Error al verificar disponibilidad.', 500);
        }
    }

    /**
     * Endpoint: GET /habitaciones/:id/reservas
     */
    public function reservasUnidad(int $id): void {
        try {
            $result = $this->service->getReservasUnidad($id);
            json_response($result);
        } catch (Throwable $e) {
            json_error('Error al obtener fechas de reserva.', 500);
        }
    }
}
