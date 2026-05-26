<?php

function json_response(mixed $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $mensaje, mixed $status = 400): void {
    $statusCode = (is_numeric($status) && (int)$status >= 100 && (int)$status < 600) ? (int)$status : 400;
    json_response(['error' => true, 'mensaje' => $mensaje], $statusCode);
}


function get_json_body(): array {
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);
    return is_array($data) ? $data : [];
}
