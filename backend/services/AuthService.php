<?php

require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../helpers/jwt.php';

class AuthService {
    private Usuario $model;
    private string $salt = 'raizen_secret_captcha_salt_2026';

    public function __construct(PDO $db) {
        $this->model = new Usuario($db);
    }

    /**
     * Generate a cryptographic stateless captcha challenge
     */
    public function generateCaptcha(): array {
        $num1 = rand(1, 9);
        $num2 = rand(1, 9);
        $operators = ['+', '-', '*'];
        $op = $operators[rand(0, 2)];

        $challenge = "$num1 $op $num2";
        $answer = 0;
        switch ($op) {
            case '+': $answer = $num1 + $num2; break;
            case '-': $answer = $num1 - $num2; break;
            case '*': $answer = $num1 * $num2; break;
        }

        // Stateless verification key: hash(answer + salt)
        $hash = hash('sha256', trim($answer) . $this->salt);

        return [
            'challenge' => $challenge,
            'key'       => $hash
        ];
    }

    /**
     * Verify the stateless captcha
     */
    public function verifyCaptcha(string $userAnswer, string $key): bool {
        $expectedHash = hash('sha256', trim($userAnswer) . $this->salt);
        return hash_equals($expectedHash, $key);
    }

    /**
     * Process user login with Captcha validation
     */
    public function login(string $email, string $password, ?string $captchaAnswer, ?string $captchaKey): array {
        // Validate captcha
        if ($captchaAnswer === null || $captchaKey === null) {
            throw new Exception('Captcha de seguridad es requerido.', 400);
        }

        if (!$this->verifyCaptcha($captchaAnswer, $captchaKey)) {
            throw new Exception('El Captcha ingresado es incorrecto.', 400);
        }

        $user = $this->model->findActiveByEmail($email);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new Exception('Credenciales inválidas.', 401);
        }

        $userData = [
            'id'     => $user['id'],
            'nombre' => $user['nombre'],
            'email'  => $user['email'],
            'rol'    => $user['rol'],
        ];

        $token = JWT::encode(['user' => $userData]);
        $refreshToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

        $this->model->saveRefreshToken($user['id'], hash('sha256', $refreshToken), $expiresAt);

        return [
            'token'         => $token,
            'refresh_token' => $refreshToken,
            'usuario'       => $userData,
        ];
    }

    /**
     * Process guest user registration with Captcha validation
     */
    public function registro(string $nombre, string $email, string $password, ?string $telefono, ?string $captchaAnswer, ?string $captchaKey): array {
        // Validate captcha
        if ($captchaAnswer === null || $captchaKey === null) {
            throw new Exception('Captcha de seguridad es requerido.', 400);
        }

        if (!$this->verifyCaptcha($captchaAnswer, $captchaKey)) {
            throw new Exception('El Captcha ingresado es incorrecto.', 400);
        }

        if (!$nombre || !$email || strlen($password) < 6) {
            throw new Exception('Nombre, email y contraseña (mín. 6 caracteres) son requeridos.', 400);
        }

        if ($this->model->emailExists($email)) {
            throw new Exception('Ya existe una cuenta con este correo.', 409);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $userId = $this->model->create($nombre, $email, $hash, $telefono, 'huesped');

        // Trigger welcome email (non-blocking)
        require_once __DIR__ . '/../helpers/mailer.php';
        @Mailer::sendWelcomeEmail($email, $nombre);

        $userData = [
            'id'     => $userId,
            'nombre' => $nombre,
            'email'  => $email,
            'rol'    => 'huesped',
        ];

        $token = JWT::encode(['user' => $userData]);
        $refreshToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

        $this->model->saveRefreshToken($userId, hash('sha256', $refreshToken), $expiresAt);

        return [
            'token'         => $token,
            'refresh_token' => $refreshToken,
            'usuario'       => $userData,
        ];
    }
}
