<?php

require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/response.php';

function require_auth(): array {
    // Apache puede poner el header en distintos lugares
    $header = $_SERVER['HTTP_AUTHORIZATION']
           ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
           ?? '';

    // Fallback: apache_request_headers()
    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
        json_error('Token de autenticación requerido.', 401);
    }

    $payload = JWT::decode($m[1]);
    if (!$payload || !isset($payload['user'])) {
        json_error('Token inválido o expirado.', 401);
    }

    return $payload['user'];
}
