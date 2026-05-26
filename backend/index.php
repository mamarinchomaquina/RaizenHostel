<?php
// Root index.php in /backend for standalone PHP built-in CLI server compatibility
if (php_sapi_name() === 'cli-server') {
    $url = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . $url['path'];
    if (is_file($file)) {
        return false;
    }
}

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/routes/api.php';

cors();

// Parse request URI segments, auto-detecting base path
$requestUri = $_SERVER['REQUEST_URI'];
$path       = parse_url($requestUri, PHP_URL_PATH);

// Strip common base path suffixes if present
$prefixes = ['/RaizenHostel/backend/api', '/RaizenHostel/backend', '/backend/api', '/api'];
foreach ($prefixes as $prefix) {
    if (str_starts_with($path, $prefix)) {
        $path = substr($path, strlen($prefix));
        break;
    }
}

$path     = trim($path, '/');
$segments = $path ? explode('/', $path) : [];
$method   = $_SERVER['REQUEST_METHOD'];

try {
    dispatchRoute($method, $segments);
} catch (PDOException $e) {
    json_error('Error de base de datos: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    json_error('Error interno del servidor: ' . $e->getMessage(), 500);
}
