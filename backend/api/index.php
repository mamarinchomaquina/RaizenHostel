<?php
// PHP built-in CLI server compatibility
if (php_sapi_name() === 'cli-server') {
    $url = parse_url($_SERVER['REQUEST_URI']);
    $file = $_SERVER['DOCUMENT_ROOT'] . $url['path'];
    if (is_file($file)) {
        return false;
    }
}

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../routes/api.php';

cors();

// Parse request URI segments
$requestUri = $_SERVER['REQUEST_URI'];
$basePath   = '/RaizenHostel/backend/api';
$path       = parse_url($requestUri, PHP_URL_PATH);
$path       = str_replace($basePath, '', $path);
$path       = trim($path, '/');
$segments   = $path ? explode('/', $path) : [];
$method     = $_SERVER['REQUEST_METHOD'];

try {
    dispatchRoute($method, $segments);
} catch (PDOException $e) {
    json_error('Error de base de datos en la API: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    json_error('Error interno del servidor en la API: ' . $e->getMessage(), 500);
}
