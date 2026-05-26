<?php

class Database {
    private static ?PDO $instance = null;

    private string $host = 'localhost';
    private string $db   = 'raizen_hostel';
    private string $user = 'root';
    private string $pass = '';

    public function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host={$this->host};dbname={$this->db};charset=utf8mb4";
            self::$instance = new PDO($dsn, $this->user, $this->pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        }
        return self::$instance;
    }
}
