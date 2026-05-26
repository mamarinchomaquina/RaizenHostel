<?php

require_once __DIR__ . '/auth.php';

function require_admin(): array {
    $user = require_auth();

    if (($user['rol'] ?? '') !== 'admin') {
        json_error('Acceso denegado. Se requiere rol de administrador.', 403);
    }

    return $user;
}
