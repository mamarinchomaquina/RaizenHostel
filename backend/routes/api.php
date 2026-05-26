<?php

/**
 * Raizen Hostel API Router
 * Dispatches request paths and methods to specific controllers
 */
function dispatchRoute(string $method, array $segments): void {
    if (empty($segments)) {
        json_error('Endpoint base de la API. Bienvenido.', 200);
    }

    $firstSegment = $segments[0];

    // AUTH
    if ($firstSegment === 'auth') {
        require_once __DIR__ . '/../controllers/AuthController.php';
        $c = new AuthController();
        $sub = $segments[1] ?? '';

        match (true) {
            $method === 'GET'  && $sub === 'captcha'  => $c->captcha(),
            $method === 'POST' && $sub === 'login'    => $c->login(),
            $method === 'POST' && $sub === 'registro' => $c->registro(),
            default => json_error('Ruta de autenticación no encontrada.', 404),
        };
    }

    // HABITACIONES
    elseif ($firstSegment === 'habitaciones') {
        require_once __DIR__ . '/../controllers/HabitacionesController.php';
        $c = new HabitacionesController();
        $id = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : 0;
        $sub = $segments[2] ?? '';

        match (true) {
            $method === 'GET' && ($segments[1] ?? '') === 'tipos'   => $c->listarTipos(),
            $method === 'GET' && !$id                               => $c->listar(),
            $method === 'GET' && $id && $sub === 'disponibilidad'    => $c->disponibilidad($id),
            $method === 'GET' && $id && $sub === 'reservas'          => $c->reservasUnidad($id),
            $method === 'GET' && $id                                => $c->detalle($id),
            default => json_error('Ruta de habitaciones no encontrada.', 404),
        };
    }

    // RESERVAS
    elseif ($firstSegment === 'reservas') {
        require_once __DIR__ . '/../controllers/ReservasController.php';
        $c = new ReservasController();
        $resId = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : 0;

        match (true) {
            $method === 'POST'                                           => $c->crear(),
            $method === 'GET' && ($segments[1] ?? '') === 'mis-reservas' => $c->misReservas(),
            $method === 'GET' && $resId                                  => $c->getById($resId),
            default => json_error('Ruta de reservas no encontrada.', 404),
        };
    }

    // PAGOS
    elseif ($firstSegment === 'pagos') {
        require_once __DIR__ . '/../controllers/PagosController.php';
        $c = new PagosController();
        $pagoId = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : 0;
        $sub = $segments[2] ?? '';

        match (true) {
            $method === 'POST' && ($segments[1] ?? '') === 'iniciar'           => $c->iniciar(),
            $method === 'POST' && ($segments[1] ?? '') === 'confirmar-wompi'   => $c->confirmarWompi(),
            $method === 'POST' && ($segments[1] ?? '') === 'webhook' && ($segments[2] ?? '') === 'wompi' => $c->webhookWompi(),
            $method === 'GET'  && $pagoId && $sub === 'estado'                  => $c->estado($pagoId),
            default => json_error('Ruta de pagos no encontrada.', 404),
        };
    }

    // CONTACTO
    elseif ($firstSegment === 'contacto') {
        require_once __DIR__ . '/../controllers/ContactoController.php';
        $c = new ContactoController();

        if ($method === 'POST') {
            $c->enviar();
        } else {
            json_error('Método no permitido para contacto.', 405);
        }
    }

    // GALERÍA
    elseif ($firstSegment === 'galeria') {
        require_once __DIR__ . '/../controllers/GaleriaController.php';
        $c = new GaleriaController();

        if ($method === 'GET') {
            $c->listar();
        } else {
            json_error('Método no permitido para galería pública.', 405);
        }
    }

    // CONTENIDO
    elseif ($firstSegment === 'contenido' && isset($segments[1])) {
        require_once __DIR__ . '/../controllers/ContenidoController.php';
        $c = new ContenidoController();

        if ($method === 'GET') {
            $c->getSeccion($segments[1]);
        } else {
            json_error('Método no permitido para contenido público.', 405);
        }
    }

    // SERVICIOS
    elseif ($firstSegment === 'servicios') {
        require_once __DIR__ . '/../controllers/ContenidoController.php';
        $c = new ContenidoController();

        if ($method === 'GET') {
            $c->getServicios();
        } else {
            json_error('Método no permitido para servicios.', 405);
        }
    }

    // ADMIN
    elseif ($firstSegment === 'admin') {
        require_once __DIR__ . '/../middleware/admin.php';
        $admin = require_admin();

        require_once __DIR__ . '/../controllers/AdminController.php';
        $ac = new AdminController();

        $sub = $segments[1] ?? '';
        $sub2 = $segments[2] ?? '';
        $sub3 = $segments[3] ?? '';
        $subId = isset($segments[2]) && is_numeric($segments[2]) ? (int)$segments[2] : 0;

        match (true) {
            // Dashboard
            $method === 'GET' && $sub === 'dashboard' && $sub2 === 'kpis' => $ac->kpis(),

            // Reservas admin
            $method === 'GET'   && $sub === 'reservas' && !$subId   => $ac->reservas(),
            $method === 'POST'  && $sub === 'reservas'              => $ac->crearReservaManual(),
            $method === 'PATCH' && $sub === 'reservas' && $subId && $sub3 === 'estado' => $ac->cambiarEstadoReserva($subId),

            // Huéspedes
            $method === 'GET' && $sub === 'huespedes' && $sub2 === 'actuales' => $ac->huespedesActuales(),

            // Reportes
            $method === 'GET' && $sub === 'reportes' && $sub2 === 'ocupacion' => $ac->reporteOcupacion(),
            $method === 'GET' && $sub === 'reportes' && $sub2 === 'ingresos'  => $ac->reporteIngresos(),

            // Tipos de habitación admin
            $method === 'GET' && $sub === 'tipos-habitacion' && !$subId => $ac->getTipos(),
            $method === 'PUT' && $sub === 'tipos-habitacion' && $subId  => $ac->updateTipo($subId),

            // Habitaciones admin
            $method === 'PUT'  && $sub === 'habitaciones' && $subId && !$sub3 => $ac->updateHabitacion($subId),
            $method === 'POST' && $sub === 'habitaciones' && $subId && $sub3 === 'imagenes' => $ac->subirImagenHabitacion($subId),
            $method === 'DELETE' && $sub === 'habitaciones' && $subId && $sub3 === 'imagenes' && isset($segments[4]) => $ac->eliminarImagenHabitacion((int)$segments[4]),

            // Contenido admin
            $method === 'PUT' && $sub === 'contenido' && $sub2 => (function () use ($sub2, $admin) {
                require_once __DIR__ . '/../controllers/ContenidoController.php';
                (new ContenidoController())->updateSeccion($sub2, $admin['id']);
            })(),

            // Galería admin
            $method === 'POST'   && $sub === 'galeria' && !$subId => (function () {
                require_once __DIR__ . '/../controllers/GaleriaController.php';
                (new GaleriaController())->subir();
            })(),
            $method === 'DELETE' && $sub === 'galeria' && $subId => (function () use ($subId) {
                require_once __DIR__ . '/../controllers/GaleriaController.php';
                (new GaleriaController())->eliminar($subId);
            })(),

            // Usuarios admin
            $method === 'GET'   && $sub === 'usuarios' && !$subId => $ac->getUsuarios(),
            $method === 'POST'  && $sub === 'usuarios'            => $ac->crearUsuario(),
            $method === 'PATCH' && $sub === 'usuarios' && $subId && $sub3 === 'estado' => $ac->toggleUsuarioActivo($subId),

            // Clientes (huéspedes)
            $method === 'GET'   && $sub === 'clientes' && !$subId => $ac->getClientes(),
            $method === 'PATCH' && $sub === 'clientes' && $subId && $sub3 === 'estado' => $ac->toggleClienteActivo($subId),

            // Reportes extras
            $method === 'GET' && $sub === 'reportes' && $sub2 === 'clientes'  => $ac->reporteClientes(),
            $method === 'GET' && $sub === 'reportes' && $sub2 === 'reservas'  => $ac->reporteReservas(),

            // Mensajes de contacto
            $method === 'GET' && $sub === 'mensajes' && !$subId => (function () {
                require_once __DIR__ . '/../controllers/ContactoController.php';
                (new ContactoController())->listar();
            })(),
            $method === 'GET' && $sub === 'mensajes' && $sub2 === 'stats' => (function () {
                require_once __DIR__ . '/../controllers/ContactoController.php';
                (new ContactoController())->stats();
            })(),
            $method === 'GET' && $sub === 'mensajes' && $subId && $sub3 === '' => (function () use ($subId) {
                require_once __DIR__ . '/../controllers/ContactoController.php';
                (new ContactoController())->getById($subId);
            })(),
            $method === 'POST' && $sub === 'mensajes' && $subId && $sub3 === 'responder' => (function () use ($subId, $admin) {
                require_once __DIR__ . '/../controllers/ContactoController.php';
                (new ContactoController())->responder($subId, $admin['id']);
            })(),
            $method === 'DELETE' && $sub === 'mensajes' && $subId => (function () use ($subId) {
                require_once __DIR__ . '/../controllers/ContactoController.php';
                (new ContactoController())->eliminar($subId);
            })(),

            default => json_error('Ruta administrativa no encontrada.', 404),
        };
    }

    else {
        json_error('Ruta principal no encontrada.', 404);
    }
}
