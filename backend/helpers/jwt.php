<?php

class JWT {
    private static string $secret = 'raizen_hostel_jwt_secret_change_me';
    private static int    $ttl    = 86400; // 24 horas

    public static function encode(array $payload): string {
        $header = self::base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));

        $payload['iat'] = time();
        $payload['exp'] = time() + self::$ttl;
        $body = self::base64url(json_encode($payload));

        $signature = self::base64url(
            hash_hmac('sha256', "$header.$body", self::$secret, true)
        );

        return "$header.$body.$signature";
    }

    public static function decode(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $body, $signature] = $parts;

        $expected = self::base64url(
            hash_hmac('sha256', "$header.$body", self::$secret, true)
        );

        if (!hash_equals($expected, $signature)) return null;

        $payload = json_decode(self::base64urlDecode($body), true);
        if (!$payload || ($payload['exp'] ?? 0) < time()) return null;

        return $payload;
    }

    private static function base64url(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64urlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
