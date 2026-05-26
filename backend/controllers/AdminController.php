<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/ReservaService.php';
require_once __DIR__ . '/../services/HabitacionService.php';
require_once __DIR__ . '/../services/PagoService.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../helpers/response.php';

class AdminController {
    private ReservaService $resSvc;
    private HabitacionService $habSvc;
    private PagoService $pagoSvc;
    private AuthService $authSvc;

    private Reserva $resModel;
    private Pago $pagoModel;
    private Usuario $usrModel;

    public function __construct() {
        $db = (new Database())->getConnection();
        $this->resSvc = new ReservaService($db);
        $this->habSvc = new HabitacionService($db);
        $this->pagoSvc = new PagoService($db);
        $this->authSvc = new AuthService($db);

        $this->resModel = new Reserva($db);
        $this->pagoModel = new Pago($db);
        $this->usrModel = new Usuario($db);
    }

    // ── Dashboard KPIs ───────────────────────────────────────
    public function kpis(): void {
        try {
            $hoy = date('Y-m-d');
            $kpis = $this->resModel->getKPIs($hoy);
            $ingresosHoy = $this->pagoModel->getIngresosHoy($hoy);

            json_response([
                'ocupacion_porcentaje' => $kpis['total_unidades'] > 0 ? round(($kpis['unidades_ocupadas'] / $kpis['total_unidades']) * 100) : 0,
                'checkins_hoy'         => $kpis['checkins_hoy'],
                'checkouts_hoy'        => $kpis['checkouts_hoy'],
                'ingresos_hoy'         => $ingresosHoy,
                'reservas_pendientes'  => $kpis['reservas_pendientes'],
                'total_unidades'       => $kpis['total_unidades'],
                'unidades_ocupadas'    => $kpis['unidades_ocupadas'],
            ]);
        } catch (Throwable $e) {
            json_error('Error al obtener KPIs del dashboard.', 500);
        }
    }

    // ── Reservas admin ───────────────────────────────────────
    public function reservas(): void {
        try {
            $estado = $_GET['estado'] ?? '';
            $limit  = min((int)($_GET['limit'] ?? 50), 200);
            $orden  = ($_GET['orden'] ?? 'desc') === 'asc' ? 'ASC' : 'DESC';

            $filters = [];
            if ($estado) {
                $filters['estado'] = $estado;
            }

            $reservas = $this->resModel->getAll($filters, $orden, $limit);

            $result = array_map(function ($r) {
                return [
                    'id'         => (int)$r['id'],
                    'codigo'     => $r['codigo'],
                    'checkin'    => $r['checkin'],
                    'checkout'   => $r['checkout'],
                    'noches'     => (int)$r['noches'],
                    'total'      => (float)$r['total'],
                    'estado'     => $r['estado'],
                    'notas'      => $r['notas'] ?? '',
                    'created_at' => $r['created_at'],
                    'unidad'     => ['numero' => $r['numero'], 'nombre_display' => $r['nombre_display']],
                    'usuario'    => ['nombre' => $r['usuario_nombre'], 'email' => $r['usuario_email']],
                ];
            }, $reservas);

            json_response($result);
        } catch (Throwable $e) {
            json_error('Error al listar reservas.', 500);
        }
    }

    public function cambiarEstadoReserva(int $id): void {
        try {
            $data = get_json_body();
            $estado = $data['estado'] ?? '';
            $validos = ['pendiente','pago_pendiente','confirmada','en_curso','completada','cancelada'];

            if (!in_array($estado, $validos, true)) {
                json_error('Estado inválido.', 400);
            }

            $success = $this->resModel->updateEstado($id, $estado);
            if (!$success) {
                json_error('Reserva no encontrada o sin cambios.', 404);
            }

            json_response(['id' => $id, 'estado' => $estado]);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al cambiar el estado de la reserva.', 500);
        }
    }

    public function crearReservaManual(): void {
        try {
            $data = get_json_body();
            $res = $this->resSvc->createReservaManual($data);
            json_response($res);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al crear walk-in reserva.', 500);
        }
    }

    // ── Huéspedes actuales ───────────────────────────────────
    public function huespedesActuales(): void {
        try {
            $reservas = $this->resModel->getHuespedesActuales();

            $result = array_map(function ($r) {
                return [
                    'id'           => (int)$r['id'],
                    'codigo'       => $r['codigo'],
                    'checkin'      => $r['checkin'],
                    'checkout'     => $r['checkout'],
                    'noches'       => (int)$r['noches'],
                    'num_personas' => (int)$r['num_personas'],
                    'precio_noche' => (float)$r['precio_noche'],
                    'total'        => (float)$r['total'],
                    'estado'       => $r['estado'],
                    'notas'        => $r['notas'] ?? '',
                    'created_at'   => $r['created_at'],
                    'unidad'       => [
                        'numero'         => $r['numero'],
                        'nombre_display' => $r['nombre_display'],
                    ],
                    'usuario'      => [
                        'nombre'    => $r['usuario_nombre'],
                        'email'     => $r['usuario_email'],
                        'telefono'  => $r['usuario_telefono'] ?? '',
                        'documento' => $r['usuario_documento'] ?? '',
                    ]
                ];
            }, $reservas);

            json_response($result);
        } catch (Throwable $e) {
            json_error('Error al listar huéspedes actuales.', 500);
        }
    }

    // ── Reportes ─────────────────────────────────────────────
    public function reporteOcupacion(): void {
        try {
            $dias = min((int)($_GET['dias'] ?? 30), 90);
            $totalUnidades = (int)$this->resModel->getKPIs(date('Y-m-d'))['total_unidades'];
            $result = [];

            for ($i = $dias - 1; $i >= 0; $i--) {
                $fecha = date('Y-m-d', strtotime("-$i days"));
                $ocupadas = $this->resModel->getOcupacionDiaria($fecha);

                $result[] = [
                    'fecha'      => $fecha,
                    'porcentaje' => $totalUnidades > 0 ? round(($ocupadas / $totalUnidades) * 100) : 0,
                    'ocupadas'   => $ocupadas,
                    'total'      => $totalUnidades,
                ];
            }

            json_response($result);
        } catch (Throwable $e) {
            json_error('Error al generar reporte de ocupación.', 500);
        }
    }

    public function reporteIngresos(): void {
        try {
            $periodo = $_GET['periodo'] ?? 'mes';
            $groupBy = ($periodo === 'semana') ? "DATE_FORMAT(p.created_at, '%x-W%v')" : "DATE_FORMAT(p.created_at, '%Y-%m')";

            $rows = $this->pagoModel->getReporteIngresos($groupBy);

            $result = array_map(function ($row) {
                return [
                    'periodo'  => $row['periodo'],
                    'total'    => (float)$row['total'],
                    'reservas' => (int)$row['reservas'],
                ];
            }, $rows);

            json_response(array_reverse($result));
        } catch (Throwable $e) {
            json_error('Error al generar reporte de ingresos.', 500);
        }
    }

    // ── Tipos de habitación admin ────────────────────────────
    public function getTipos(): void {
        try {
            $result = $this->habSvc->getAdminTipos();
            json_response($result);
        } catch (Throwable $e) {
            json_error('Error al listar tipos de habitación.', 500);
        }
    }

    public function updateTipo(int $id): void {
        try {
            $data = get_json_body();
            $res = $this->habSvc->updateTipo($id, $data);
            json_response($res);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al actualizar tipo de habitación.', 500);
        }
    }

    // ── Habitaciones admin ───────────────────────────────────
    public function updateHabitacion(int $id): void {
        try {
            $data = get_json_body();
            $res = $this->habSvc->updateHabitacion($id, $data);
            json_response($res);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al actualizar la habitación.', 500);
        }
    }

    public function subirImagenHabitacion(int $id): void {
        try {
            if (!isset($_FILES['imagen'])) {
                json_error('Se requiere un archivo de imagen.', 400);
            }
            $file = $_FILES['imagen'];
            $altText = trim($_POST['alt_text'] ?? '');

            $res = $this->habSvc->subirImagenHabitacion($id, $file, $altText);
            json_response($res, 201);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al subir imagen.', 500);
        }
    }

    public function eliminarImagenHabitacion(int $imgId): void {
        try {
            $this->habSvc->eliminarImagenHabitacion($imgId);
            json_response(['success' => true]);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 404);
        } catch (Throwable $e) {
            json_error('Error al eliminar imagen.', 500);
        }
    }

    // ── Usuarios admin ───────────────────────────────────────
    public function getUsuarios(): void {
        try {
            $res = $this->usrModel->getAllAdmins();
            json_response($res);
        } catch (Throwable $e) {
            json_error('Error al listar administradores.', 500);
        }
    }

    public function crearUsuario(): void {
        try {
            $data = get_json_body();
            $nombre   = trim($data['nombre'] ?? '');
            $email    = trim($data['email'] ?? '');
            $password = $data['password'] ?? '';

            if (!$nombre || !$email || strlen($password) < 6) {
                json_error('Nombre, email y contraseña (mín. 6 caracteres) son requeridos.', 400);
            }

            if ($this->usrModel->emailExists($email)) {
                json_error('Ya existe un usuario con ese correo.', 409);
            }

            $hash = password_hash($password, PASSWORD_DEFAULT);
            $id = $this->usrModel->create($nombre, $email, $hash, null, 'admin');

            json_response([
                'id'         => $id,
                'nombre'     => $nombre,
                'email'      => $email,
                'rol'        => 'admin',
                'activo'     => true,
                'created_at' => date('Y-m-d H:i:s'),
            ], 201);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al crear administrador.', 500);
        }
    }

    public function toggleUsuarioActivo(int $id): void {
        try {
            $data = get_json_body();
            $activo = $data['activo'] ? 1 : 0;

            $this->usrModel->toggleActivo($id, $activo);
            $user = $this->usrModel->findById($id);

            if (!$user) json_error('Usuario no encontrado.', 404);

            json_response($user);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al activar/desactivar administrador.', 500);
        }
    }

    // ── Clientes (huéspedes) ────────────────────────────────
    public function getClientes(): void {
        try {
            $res = $this->usrModel->getHuespedesStats();
            json_response($res);
        } catch (Throwable $e) {
            json_error('Error al obtener clientes.', 500);
        }
    }

    public function toggleClienteActivo(int $id): void {
        try {
            $data = get_json_body();
            $activo = $data['activo'] ? 1 : 0;

            $this->usrModel->toggleActivo($id, $activo);
            $user = $this->usrModel->findById($id);

            if (!$user) json_error('Cliente no encontrado.', 404);

            json_response($user);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error al cambiar estado del cliente.', 500);
        }
    }

    // ── Reportes extras ─────────────────────────────────────
    public function reporteClientes(): void {
        try {
            $totalClientes = (int)$this->db->query('SELECT COUNT(*) FROM usuarios WHERE rol = "huesped"')->fetchColumn();
            $mesActual = date('Y-m-01');
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM usuarios WHERE rol = "huesped" AND created_at >= ?');
            $stmt->execute([$mesActual]);
            $nuevosEsteMes = (int)$stmt->fetchColumn();

            $conReservas = (int)$this->db->query(
                'SELECT COUNT(DISTINCT usuario_id) FROM reservas WHERE estado NOT IN ("cancelada")'
            )->fetchColumn();

            $top = $this->db->query(
                'SELECT u.id, u.nombre, u.email, COUNT(r.id) AS total_reservas, COALESCE(SUM(r.total),0) AS total_gastado
                 FROM usuarios u
                 JOIN reservas r ON u.id = r.usuario_id AND r.estado NOT IN ("cancelada")
                 WHERE u.rol = "huesped"
                 GROUP BY u.id
                 ORDER BY total_gastado DESC
                 LIMIT 10'
            )->fetchAll();

            $registrosMes = $this->db->query(
                "SELECT DATE_FORMAT(created_at, '%Y-%m') AS mes, COUNT(*) AS total
                 FROM usuarios WHERE rol = 'huesped'
                 GROUP BY mes ORDER BY mes DESC LIMIT 6"
            )->fetchAll();

            json_response([
                'total_clientes'  => $totalClientes,
                'nuevos_este_mes' => $nuevosEsteMes,
                'con_reservas'    => $conReservas,
                'top_clientes'    => $top,
                'registros_mes'   => array_reverse($registrosMes),
            ]);
        } catch (Throwable $e) {
            json_error('Error al generar reporte de clientes.', 500);
        }
    }

    public function reporteReservas(): void {
        try {
            $porEstado = $this->db->query(
                'SELECT estado, COUNT(*) AS total FROM reservas GROUP BY estado'
            )->fetchAll();

            $porMes = $this->db->query(
                "SELECT DATE_FORMAT(created_at, '%Y-%m') AS mes, COUNT(*) AS total, COALESCE(SUM(total),0) AS ingresos
                 FROM reservas WHERE estado NOT IN ('cancelada')
                 GROUP BY mes ORDER BY mes DESC LIMIT 6"
            )->fetchAll();

            $topHabitaciones = $this->db->query(
                'SELECT u.numero, u.nombre_display, COUNT(r.id) AS total_reservas
                 FROM reservas r JOIN unidades u ON r.unidad_id = u.id
                 WHERE r.estado NOT IN ("cancelada")
                 GROUP BY r.unidad_id
                 ORDER BY total_reservas DESC LIMIT 10'
            )->fetchAll();

            $promedioNoches = (float)$this->db->query(
                'SELECT AVG(noches) FROM reservas WHERE estado NOT IN ("cancelada") AND noches > 0'
            )->fetchColumn();

            $activas = (int)$this->db->query(
                'SELECT COUNT(*) FROM reservas WHERE estado IN ("pendiente","pago_pendiente","confirmada","en_curso")'
            )->fetchColumn();

            json_response([
                'por_estado'        => $porEstado,
                'por_mes'           => array_reverse($porMes),
                'top_habitaciones'  => $topHabitaciones,
                'promedio_noches'   => round($promedioNoches, 1),
                'activas'           => $activas,
            ]);
        } catch (Throwable $e) {
            json_error('Error al generar reporte de reservas.', 500);
        }
    }
}
