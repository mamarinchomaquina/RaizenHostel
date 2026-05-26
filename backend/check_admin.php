<?php
require_once 'api/config/database.php';

try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("SELECT * FROM usuarios WHERE email = 'admin@raizenhostel.com'");
    $user = $stmt->fetch();
    
    if ($user) {
        echo "User found: " . $user['nombre'] . "\n";
        echo "Role: " . $user['rol'] . "\n";
        echo "Activo: " . $user['activo'] . "\n";
        echo "Hash: " . $user['password_hash'] . "\n";
        
        $pass = 'admin123';
        if (password_verify($pass, $user['password_hash'])) {
            echo "Password 'admin123' is CORRECT\n";
        } else {
            echo "Password 'admin123' is INCORRECT\n";
        }
    } else {
        echo "User admin@raizenhostel.com NOT FOUND\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
