<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../helpers/response.php';

class AuthController {
    private AuthService $service;

    public function __construct() {
        $db = (new Database())->getConnection();
        $this->service = new AuthService($db);
    }

    /**
     * Endpoint: GET /auth/captcha
     */
    public function captcha(): void {
        try {
            $data = $this->service->generateCaptcha();
            json_response($data);
        } catch (Throwable $e) {
            json_error('Error al generar Captcha.', 500);
        }
    }

    /**
     * Endpoint: POST /auth/login
     */
    public function login(): void {
        try {
            $data = get_json_body();
            $email = trim($data['email'] ?? '');
            $password = $data['password'] ?? '';
            $captchaAnswer = isset($data['captcha_answer']) ? trim($data['captcha_answer']) : null;
            $captchaKey = isset($data['captcha_key']) ? trim($data['captcha_key']) : null;

            if (!$email || !$password) {
                json_error('Email y contraseña son requeridos.', 400);
            }

            $res = $this->service->login($email, $password, $captchaAnswer, $captchaKey);
            json_response($res);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error interno de login.', 500);
        }
    }

    /**
     * Endpoint: POST /auth/registro
     */
    public function registro(): void {
        try {
            $data = get_json_body();
            $nombre = trim($data['nombre'] ?? '');
            $email = trim($data['email'] ?? '');
            $password = $data['password'] ?? '';
            $telefono = trim($data['telefono'] ?? '');
            $captchaAnswer = isset($data['captcha_answer']) ? trim($data['captcha_answer']) : null;
            $captchaKey = isset($data['captcha_key']) ? trim($data['captcha_key']) : null;

            $res = $this->service->registro($nombre, $email, $password, $telefono, $captchaAnswer, $captchaKey);
            json_response($res, 201);
        } catch (Exception $e) {
            json_error($e->getMessage(), $e->getCode() ?: 400);
        } catch (Throwable $e) {
            json_error('Error interno de registro.', 500);
        }
    }
}
