<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/ContenidoService.php';
require_once __DIR__ . '/../helpers/response.php';

class GaleriaController {
    private ContenidoService $service;

    public function __construct() {
        $db = (new Database())->getConnection();
        $this->service = new ContenidoService($db);
    }

    /**
     * Endpoint: GET /galeria
     */
    public function listar(): void {
        try {
            $results = $this->service->getGaleria();
            $host = isset($_SERVER['HTTP_HOST']) ? 'http://' . $_SERVER['HTTP_HOST'] : 'http://localhost';

            $formatted = array_map(function ($g) use ($host) {
                $g['url'] = $host . $g['url'];
                return $g;
            }, $results);

            json_response($formatted);
        } catch (Throwable $e) {
            json_error('Error al obtener galería.', 500);
        }
    }

    /**
     * Endpoint: POST /galeria/subir
     */
    public function subir(): void {
        try {
            if (!isset($_FILES['imagen'])) {
                json_error('Se requiere un archivo de imagen.', 400);
            }

            $file = $_FILES['imagen'];
            $allowed = ['image/jpeg', 'image/png', 'image/webp'];

            if (!in_array($file['type'], $allowed, true)) {
                json_error('Formato no permitido. Usa JPG, PNG o WebP.', 400);
            }

            if ($file['size'] > 5 * 1024 * 1024) {
                json_error('La imagen no debe superar 5 MB.', 400);
            }

            $altText = trim($_POST['alt_text'] ?? '');
            $categoria = trim($_POST['categoria'] ?? 'general');
            $spanWide = isset($_POST['span_wide']) ? (bool)$_POST['span_wide'] : false;
            $spanTall = isset($_POST['span_tall']) ? (bool)$_POST['span_tall'] : false;

            $res = $this->service->subirImagenGaleria($file, $altText, $categoria, $spanWide, $spanTall);
            json_response($res, 201);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al subir imagen de galería.', 500);
        }
    }

    /**
     * Endpoint: DELETE /galeria/:id
     */
    public function eliminar(int $id): void {
        try {
            $this->service->eliminarImagenGaleria($id);
            json_response(null, 204);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 404);
        } catch (Throwable $e) {
            json_error('Error al eliminar imagen de galería.', 500);
        }
    }
}
