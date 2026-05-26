<?php
/**
 * DIAGNÓSTICO WOMPI — Raizen Hostel
 * Acceder en: http://localhost/RaizenHostel/backend/test_wompi.php
 * ELIMINAR este archivo antes de ir a producción.
 */

// ── 1. Verificar firma con el ejemplo OFICIAL de la documentación ──────────────
$ref_doc    = 'sk8-438k4-xmxm392-sn2m';
$monto_doc  = '2490000';
$moneda_doc = 'COP';
$secret_doc = 'prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6';
$esperado   = '37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5';

$cadena_doc  = $ref_doc . $monto_doc . $moneda_doc . $secret_doc;
$calculado   = hash('sha256', $cadena_doc);
$doc_ok      = ($calculado === $esperado);

// ── 2. Verificar firma con las credenciales REALES del hostel ─────────────────
$PUBLIC_KEY  = 'pub_test_vF4ZRuWXf7NkZzMy2TrckwumVbjyLhv6';
$INTEGRITY   = 'test_integrity_1i1CW1dOM8ENtpvjiwC8sY2RIPsXftN8';

// Simular una reserva de prueba
$ref_test   = 'RZ-TEST001';
$monto_test = 5900000; // $59.000 COP en centavos
$cadena_real = $ref_test . $monto_test . 'COP' . $INTEGRITY;
$firma_real  = hash('sha256', $cadena_real);

// ── 3. Consultar la última reserva de la base de datos ────────────────────────
$db_error = '';
$ultima_reserva = null;
try {
    require_once __DIR__ . '/api/config/database.php';
    $db   = (new Database())->getConnection();
    $stmt = $db->query("SELECT id, codigo, total, estado FROM reservas ORDER BY id DESC LIMIT 5");
    $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($reservas)) {
        $ultima_reserva = $reservas[0];
        $monto_cents    = (int)round($ultima_reserva['total'] * 100);
        $cadena_reserva = $ultima_reserva['codigo'] . $monto_cents . 'COP' . $INTEGRITY;
        $firma_reserva  = hash('sha256', $cadena_reserva);
    }
} catch (Exception $e) {
    $db_error = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Diagnóstico Wompi — Raizen Hostel</title>
<style>
  body { font-family: monospace; background: #1a1a1a; color: #eee; padding: 2rem; }
  h1 { color: #c8a96e; }
  .ok  { color: #4caf50; }
  .err { color: #f44336; }
  .box { background: #2a2a2a; border: 1px solid #444; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
  .label { color: #aaa; font-size: 0.85rem; }
  code { background: #333; padding: 2px 6px; border-radius: 4px; word-break: break-all; }
  table { border-collapse: collapse; width: 100%; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #444; }
  th { color: #c8a96e; }
  a { color: #90caf9; }
</style>
</head>
<body>
<h1>🔍 Diagnóstico Wompi — Raizen Hostel</h1>

<!-- TEST 1: Verificación con ejemplo oficial -->
<div class="box">
  <h2>1. ¿El algoritmo SHA-256 funciona correctamente?</h2>
  <p class="label">Usando el ejemplo OFICIAL de la documentación de Wompi:</p>
  <p>Cadena: <code><?= htmlspecialchars($cadena_doc) ?></code></p>
  <p>Esperado:  <code><?= $esperado ?></code></p>
  <p>Calculado: <code><?= $calculado ?></code></p>
  <p class="<?= $doc_ok ? 'ok' : 'err' ?>">
    <?= $doc_ok ? '✅ CORRECTO — El algoritmo SHA-256 funciona bien.' : '❌ ERROR — El algoritmo no genera el hash correcto.' ?>
  </p>
</div>

<!-- TEST 2: Firma con credenciales reales -->
<div class="box">
  <h2>2. Firma con tus credenciales reales</h2>
  <p class="label">Usando: referencia=<?= $ref_test ?>, monto=<?= $monto_test ?> centavos, moneda=COP</p>
  <p>Llave pública: <code><?= $PUBLIC_KEY ?></code></p>
  <p>Secreto integridad: <code><?= $INTEGRITY ?></code></p>
  <p>Cadena: <code><?= htmlspecialchars($cadena_real) ?></code></p>
  <p>Firma generada: <code><?= $firma_real ?></code></p>
  <p>
    🔗 <a href="https://checkout.wompi.co/p/?public-key=<?= urlencode($PUBLIC_KEY) ?>&currency=COP&amount-in-cents=<?= $monto_test ?>&reference=<?= urlencode($ref_test) ?>&signature:integrity=<?= urlencode($firma_real) ?>" target="_blank">
      ▶ Probar este pago en Wompi (abre en nueva pestaña)
    </a>
  </p>
  <p><small>Si esta URL también da 403, el problema es la cuenta Wompi, no el código.</small></p>
</div>

<!-- TEST 3: Base de datos -->
<div class="box">
  <h2>3. Últimas reservas en la base de datos</h2>
  <?php if ($db_error): ?>
    <p class="err">❌ Error de BD: <?= htmlspecialchars($db_error) ?></p>
  <?php elseif (empty($reservas)): ?>
    <p class="err">⚠️ No hay reservas en la base de datos.</p>
  <?php else: ?>
    <table>
      <tr><th>ID</th><th>Código</th><th>Total (pesos)</th><th>Centavos</th><th>Estado</th><th>Firma</th></tr>
      <?php foreach ($reservas as $r):
        $mc = (int)round($r['total'] * 100);
        $cadena_r = $r['codigo'] . $mc . 'COP' . $INTEGRITY;
        $firma_r  = hash('sha256', $cadena_r);
      ?>
      <tr>
        <td><?= $r['id'] ?></td>
        <td><?= htmlspecialchars($r['codigo']) ?></td>
        <td>$<?= number_format($r['total'], 0, ',', '.') ?></td>
        <td><?= $mc ?></td>
        <td><?= $r['estado'] ?></td>
        <td>
          <code style="font-size:0.7rem"><?= $firma_r ?></code><br>
          <a href="https://checkout.wompi.co/p/?public-key=<?= urlencode($PUBLIC_KEY) ?>&currency=COP&amount-in-cents=<?= $mc ?>&reference=<?= urlencode($r['codigo']) ?>&signature:integrity=<?= urlencode($firma_r) ?>" target="_blank">▶ Probar</a>
        </td>
      </tr>
      <?php endforeach; ?>
    </table>
  <?php endif; ?>
</div>

<div class="box">
  <h2>📋 Qué hacer si sigues viendo el error 403</h2>
  <ol>
    <li>Ingresa a <a href="https://comercios.wompi.co" target="_blank">comercios.wompi.co</a> y verifica que tu cuenta esté <strong>completamente verificada</strong>.</li>
    <li>Asegúrate de que el email de tu cuenta Wompi esté confirmado.</li>
    <li>Ve a <strong>Desarrolladores → Secretos para integración técnica</strong> y confirma que las llaves coincidan exactamente con las que tienes en el código.</li>
    <li>Si en esta misma página el botón "▶ Probar" da 403, el problema es la cuenta, no el código.</li>
  </ol>
</div>
</body>
</html>
