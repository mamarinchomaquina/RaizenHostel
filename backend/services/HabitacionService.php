<?php

require_once __DIR__ . '/../models/Habitacion.php';

class HabitacionService {
    private Habitacion $model;

    public function __construct(PDO $db) {
        $this->model = new Habitacion($db);
    }

    public function getAll(): array {
        return $this->model->getAll();
    }

    public function getTipos(): array {
        $raw = $this->model->getTipos();
        $result = [];
        foreach ($raw as $r) {
            $result[] = [
                'id'                   => (int)$r['id'],
                'slug'                 => $r['slug'],
                'nombre'               => $r['nombre'],
                'descripcion'          => $r['descripcion'] ?? '',
                'capacidad'            => (int)$r['capacidad'],
                'precio'               => (float)$r['precio_base'], // Card price maps to precio_base
                'popular'              => (bool)(int)$r['popular'],
                'categoria'            => ($r['capacidad'] > 2) ? 'compartido' : 'privada',
                'total_unidades'       => (int)$r['total_unidades'],
                'unidades_disponibles' => (int)($r['unidades_disponibles'] ?? 0),
                'imagenes'             => $this->model->getImagenes((int)$r['id']), // Fallback images mapped by type
            ];
        }
        return $result;
    }

    public function getAdminTipos(): array {
        $raw = $this->model->getTipos();
        $result = [];
        foreach ($raw as $r) {
            $result[] = [
                'id'                   => (int)$r['id'],
                'slug'                 => $r['slug'],
                'nombre'               => $r['nombre'],
                'descripcion'          => $r['descripcion'] ?? '',
                'capacidad'            => (int)$r['capacidad'],
                'precio_base'          => (float)$r['precio_base'],
                'popular'              => (bool)(int)$r['popular'],
                'total_unidades'       => (int)$r['total_unidades'],
                'unidades_disponibles' => (int)($r['unidades_disponibles'] ?? 0),
            ];
        }
        return $result;
    }

    public function updateTipo(int $id, array $data): array {
        $success = $this->model->updateTipo($id, $data);
        if (!$success) {
            throw new Exception('No se pudo actualizar el tipo de habitación.', 400);
        }
        // Return updated tipo
        $tipos = $this->model->getTipos();
        foreach ($tipos as $t) {
            if ((int)$t['id'] === $id) return $t;
        }
        throw new Exception('Tipo de habitación no encontrado.', 404);
    }

    public function getById(int $id): array {
        $unidad = $this->model->getById($id);
        if (!$unidad) {
            throw new Exception('Habitación no encontrada.', 404);
        }
        return $unidad;
    }

    public function updateHabitacion(int $id, array $data): array {
        $success = $this->model->update($id, $data);
        if (!$success) {
            throw new Exception('No hay campos para actualizar o la habitación no existe.', 400);
        }
        return $this->model->getById($id);
    }

    public function subirImagenHabitacion(int $id, array $file, ?string $altText): array {
        $ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
        $name = "hab_{$id}_" . time() . '.' . $ext;
        $dest = __DIR__ . '/../../uploads/' . $name;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new Exception('Error al guardar archivo.', 500);
        }

        $url = '/RaizenHostel/backend/uploads/' . $name;
        $altTextStr = trim($altText ?? '');

        $imgId = $this->model->addImagen($id, $url, $altTextStr);

        return [
            'id'       => $imgId,
            'url'      => $url,
            'alt_text' => $altTextStr
        ];
    }

    public function eliminarImagenHabitacion(int $imgId): bool {
        $img = $this->model->getImagenById($imgId);
        if (!$img) {
            throw new Exception('Imagen no encontrada.', 404);
        }

        $this->model->deleteImagen($imgId);

        $filePath = __DIR__ . '/../../' . str_replace('/RaizenHostel/backend/', '', $img['url']);
        if (file_exists($filePath)) {
            @unlink($filePath);
        }

        return true;
    }
}
