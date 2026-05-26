<?php
/**
 * Mailer helper — envia correos usando la API REST de EmailJS.
 */

class Mailer {
    private static ?array $config = null;

    private static function getConfig(): array {
        if (self::$config === null) {
            self::$config = require __DIR__ . '/../config/mail.php';
        }
        return self::$config;
    }

    /**
     * Llama a la API de EmailJS.
     */
    private static function sendEmailJs(string $templateId, array $templateParams): bool {
        $cfg = self::getConfig();

        if (empty($cfg['EMAILJS_SERVICE_ID']) || empty($cfg['EMAILJS_PUBLIC_KEY'])) {
            error_log("[Mailer] EmailJS no configurado. Faltan claves en mail.php");
            return false;
        }

        $url = 'https://api.emailjs.com/api/v1.0/email/send';
        $data = [
            'service_id'      => $cfg['EMAILJS_SERVICE_ID'],
            'template_id'     => $templateId,
            'user_id'         => $cfg['EMAILJS_PUBLIC_KEY'],
            'accessToken'     => $cfg['EMAILJS_ACCESS_TOKEN'],
            'template_params' => $templateParams
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_SSL_VERIFYPEER => false, // Útil en entornos locales como XAMPP
        ]);

        $result = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($result === false) {
            error_log("[Mailer] Error de cURL: " . $error);
            return false;
        }

        // EmailJS retorna simplemente "OK" si funciona
        if (str_contains($result, 'OK')) {
            return true;
        }

        error_log("[Mailer] EmailJS rechazó la petición: " . $result);
        return false;
    }

    /**
     * Notify admin about a new contact form submission.
     */
    public static function notifyNewContact(string $nombre, string $email, string $asunto, string $mensaje): bool {
        $cfg = self::getConfig();
        $templateId = $cfg['EMAILJS_TEMPLATE_ADMIN'];
        
        if (!$templateId) return false;

        $params = [
            'admin_email' => $cfg['MAIL_ADMIN'],
            'name'        => $nombre,   // Coincide con {{name}} de tu imagen
            'email'       => $email,    // Coincide con {{email}}
            'title'       => $asunto,   // Coincide con {{title}}
            'message'     => $mensaje,  // Coincide con {{message}}
        ];

        return self::sendEmailJs($templateId, $params);
    }

    /**
     * Send a welcome email to a new user.
     */
    public static function sendWelcomeEmail(string $to, string $nombre): bool {
        $cfg = self::getConfig();
        $templateId = $cfg['EMAILJS_TEMPLATE_BIENVENIDA'];

        if (!$templateId) return false;

        $params = [
            'client_email' => $to,
            'nombre'       => $nombre,
        ];

        return self::sendEmailJs($templateId, $params);
    }

    /**
     * Notify admin about a new reservation (pending payment).
     */
    public static function notifyNewReservation(array $data): bool {
        $cfg = self::getConfig();
        $templateId = $cfg['EMAILJS_TEMPLATE_ADMIN_RESERVA'];

        if (!$templateId) return false;

        $params = [
            'admin_email' => $cfg['MAIL_ADMIN'],
            'codigo'      => $data['codigo'],
            'cliente'     => $data['nombre'],
            'checkin'     => $data['checkin'],
            'checkout'    => $data['checkout'],
            'total'       => number_format($data['total'], 0, ',', '.'),
        ];

        return self::sendEmailJs($templateId, $params);
    }

    /**
     * Send a reply to a contact message.
     */
    public static function sendReply(string $to, string $nombreCliente, string $respuesta, string $mensajeOriginal): bool {
        $cfg = self::getConfig();
        $templateId = $cfg['EMAILJS_TEMPLATE_CLIENTE'];

        if (!$templateId) return false;

        $params = [
            'client_email'    => $to,
            'nombreCliente'   => $nombreCliente,
            'respuesta'       => $respuesta,
            'mensajeOriginal' => $mensajeOriginal,
        ];

        return self::sendEmailJs($templateId, $params);
    }

    /**
     * Send reservation confirmation to the client (Payment Success).
     */
    public static function sendReservaConfirmation(string $to, string $nombreCliente, string $codigo, string $checkin, string $checkout, float $total): bool {
        $cfg = self::getConfig();
        $templateId = $cfg['EMAILJS_TEMPLATE_RESERVA'];

        if (!$templateId) return false;

        $params = [
            'client_email'  => $to,
            'nombreCliente' => $nombreCliente,
            'codigo'        => $codigo,
            'checkin'       => $checkin,
            'checkout'      => $checkout,
            'total'         => number_format($total, 0, ',', '.'),
        ];

        return self::sendEmailJs($templateId, $params);
    }
}
