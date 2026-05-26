<?php

require_once __DIR__ . '/../models/Contenido.php';

class ContenidoService {
    private Contenido $model;

    public function __construct(PDO $db) {
        $this->model = new Contenido($db);
    }

    public function getSeccion(string $clave): array {
        $json = $this->model->getSeccion($clave);
        if (!$json) return [];
        return json_decode($json, true) ?: [];
    }

    public function updateSeccion(string $clave, array $data, int $adminId): bool {
        $json = json_encode($data);
        return $this->model->updateSeccion($clave, $json, $adminId);
    }

    public function getServicios(): array {
        $raw = $this->model->getServicios();
        $result = [];
        foreach ($raw as $r) {
            $result[] = [
                'id'            => (int)$r['id'],
                'nombre'        => $r['nombre'],
                'descripcion'  => $r['descripcion'],
                'icono_lucide'  => $r['icono_lucide'],
                'orden'         => (int)$r['orden'],
                'activo'        => (bool)(int)$r['activo'],
            ];
        }
        return $result;
    }

    public function getGaleria(): array {
        $raw = $this->model->getGaleria();
        $result = [];
        foreach ($raw as $r) {
            $result[] = [
                'id'        => (int)$r['id'],
                'url'       => $r['url'],
                'alt_text'  => $r['alt_text'],
                'categoria' => $r['categoria'],
                'span_wide' => (bool)(int)$r['span_wide'],
                'span_tall' => (bool)(int)$r['span_tall'],
                'orden'     => (int)$r['orden'],
                'activo'    => (bool)(int)$r['activo'],
            ];
        }
        return $result;
    }

    public function subirImagenGaleria(array $file, ?string $altText, ?string $categoria, ?bool $spanWide, ?bool $spanTall): array {
        $ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
        $name = "gal_" . time() . '.' . $ext;
        $dest = __DIR__ . '/../../uploads/' . $name;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new Exception('Error al guardar archivo.', 500);
        }

        $url = '/RaizenHostel/backend/uploads/' . $name;
        $altTextStr = trim($altText ?? '');
        $cat = trim($categoria ?? 'general');

        $imgId = $this->model->addGaleria($url, $altTextStr, $cat, $spanWide ?? false, $spanTall ?? false);

        return [
            'id'        => $imgId,
            'url'       => $url,
            'alt_text'  => $altTextStr,
            'categoria' => $cat,
            'span_wide' => $spanWide ?? false,
            'span_tall' => $spanTall ?? false
        ];
    }

    public function eliminarImagenGaleria(int $id): bool {
        $img = $this->model->getGaleriaById($id);
        if (!$img) {
            throw new Exception('Imagen de galería no encontrada.', 404);
        }

        $this->model->deleteGaleria($id);

        $filePath = __DIR__ . '/../../' . str_replace('/RaizenHostel/backend/', '', $img['url']);
        if (file_exists($filePath)) {
            @unlink($filePath);
        }

        return true;
    }

    // Contact messages
    public function getMensajes(): array {
        $raw = $this->model->getMensajes();
        $result = [];
        foreach ($raw as $r) {
            $result[] = [
                'id'            => (int)$r['id'],
                'nombre'        => $r['nombre'],
                'email'         => $r['email'],
                'mensaje'       => $r['mensaje'],
                'leido'         => (bool)(int)$r['leido'],
                'contestado'    => (bool)(int)$r['contestado'],
                'respuesta'     => $r['respuesta'],
                'contestado_at' => $r['contestado_at'],
                'created_at'    => $r['created_at'],
            ];
        }
        return $result;
    }

    public function getMensajeById(int $id): array {
        $msg = $this->model->getMensajeById($id);
        if (!$msg) {
            throw new Exception('Mensaje no encontrado.', 404);
        }
        // Mark as read automatically when viewed
        $this->model->updateMensajeLeido($id, 1);

        return [
            'id'            => (int)$msg['id'],
            'nombre'        => $msg['nombre'],
            'email'         => $msg['email'],
            'mensaje'       => $msg['mensaje'],
            'leido'         => true,
            'contestado'    => (bool)(int)$msg['contestado'],
            'respuesta'     => $msg['respuesta'],
            'contestado_at' => $msg['contestado_at'],
            'created_at'    => $msg['created_at'],
        ];
    }

    public function enviarMensaje(string $nombre, string $email, string $mensaje): array {
        if (!$nombre || !$email || !$mensaje) {
            throw new Exception('Todos los campos son obligatorios.', 400);
        }

        $id = $this->model->addMensaje($nombre, $email, $mensaje);

        // Notify admins (optional)
        return ['ok' => true, 'id' => $id];
    }

    public function responderMensaje(int $id, string $respuesta, int $adminId): bool {
        $msg = $this->model->getMensajeById($id);
        if (!$msg) {
            throw new Exception('Mensaje no encontrado.', 404);
        }

        if (empty($respuesta)) {
            throw new Exception('La respuesta no puede estar vacía.', 400);
        }

        $this->model->updateMensajeRespuesta($id, $respuesta, $adminId);

        // Send email response to user
        require_once __DIR__ . '/../helpers/mailer.php';
        @Mailer::sendContactReply($msg['email'], $msg['nombre'], $msg['mensaje'], $respuesta);

        return true;
    }

    public function eliminarMensaje(int $id): bool {
        return $this->model->deleteMensaje($id);
    }

    public function getMensajesStats(): array {
        return $this->model->getMensajesStats();
    }
}
