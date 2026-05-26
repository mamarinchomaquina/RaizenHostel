<?php

class Wompi {
    private static string $baseUrl    = 'https://sandbox.wompi.co/v1';
    private static string $publicKey  = 'pub_test_vF4ZRuWXf7NkZzMy2TrckwumVbjyLhv6';
    private static string $privateKey = 'prv_test_dsiYhxrE8fWe11jSZb91pnJTwgOH4YTM';
    private static string $integridad = 'test_integrity_1i1CW1dOM8ENtpvjiwC8sY2RIPsXftN8';
    private static string $eventsKey  = 'test_events_vZ0K77FjGfzlZgtW1ReXw8WUxEYnSOgf';

    /**
     * Genera la firma de integridad requerida por el Widget de Wompi
     * concat(referencia, monto_centavos, moneda, secreto_integridad)
     */
    public static function generateIntegritySignature(string $reference, int $amountCents, string $currency = 'COP'): string {
        $chain = $reference . $amountCents . $currency . self::$integridad;
        return hash('sha256', $chain);
    }

    public static function getPublicKey(): string {
        return self::$publicKey;
    }

    public static function createTransaction(array $data): array {
        $payload = [
            'amount_in_cents'    => (int)($data['monto'] * 100),
            'currency'           => 'COP',
            'customer_email'     => $data['email'],
            'reference'          => $data['referencia'],
            'payment_method'     => $data['metodo'] ?? [],
            'redirect_url'       => $data['redirect_url'] ?? '',
        ];

        return self::post('/transactions', $payload);
    }

    public static function getTransaction(string $id): array {
        return self::get("/transactions/$id");
    }

    public static function verifyWebhookSignature(string $body, string $signature): bool {
        $expected = hash_hmac('sha256', $body, self::$eventsKey);
        return hash_equals($expected, $signature);
    }

    private static function post(string $endpoint, array $data): array {
        $ch = curl_init(self::$baseUrl . $endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . self::$privateKey,
            ],
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true) ?? [];
    }

    private static function get(string $endpoint): array {
        $ch = curl_init(self::$baseUrl . $endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . self::$privateKey,
            ],
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true) ?? [];
    }
}
