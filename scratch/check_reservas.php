<?php
require_once 'c:/xampp/htdocs/RaizenHostel/backend/api/config/database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT id, codigo, estado FROM reservas");
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($res, JSON_PRETTY_PRINT);
