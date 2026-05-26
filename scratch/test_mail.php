<?php
/**
 * Script de prueba para el sistema de correos.
 */

// Simular el entorno de la API
require_once 'c:/xampp/htdocs/RaizenHostel/backend/api/helpers/mailer.php';

echo "--- Iniciando prueba de envío de correo ---\n";

$destinatario = 'moraleslyda@yahoo.com.co'; // Correo de prueba
$nombre = 'MATEO MARIN';
$codigo = 'RZ-TEST-123';
$total = 150000;

echo "1. Probando Correo de Bienvenida...\n";
$res1 = Mailer::sendWelcomeEmail($destinatario, $nombre);
echo $res1 ? "✅ Correo de bienvenida enviado con éxito.\n" : "❌ Error enviando correo de bienvenida.\n";

echo "2. Probando Confirmación de Reserva...\n";
$res2 = Mailer::sendReservaConfirmation(
    $destinatario, 
    $nombre, 
    $codigo, 
    '2026-05-01', 
    '2026-05-05', 
    $total
);
echo $res2 ? "✅ Correo de confirmación enviado con éxito.\n" : "❌ Error enviando confirmación de reserva.\n";

echo "--- Fin de la prueba ---\n";
