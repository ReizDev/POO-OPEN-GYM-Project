<?php
// conexion.php

// 1. Detector: Si PHP no tiene la extensión de SQL Server instalada, avisa de inmediato.
if (!function_exists('sqlsrv_connect')) {
    http_response_code(500);
    die(json_encode(["error" => "La extensión 'sqlsrv' no está instalada o activada en tu PHP (php.ini)."]));
}

// 2. Nombre del servidor con DOBLE barra invertida para que PHP lo lea bien
$serverName = ".\\SQLEXPRESS"; 
$connectionOptions = array(
    "Database" => "gimnasio",
    "CharacterSet" => "UTF-8"
);

// 3. Conectar
$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    http_response_code(500);
    die(json_encode(array("error" => "FALLO_CONEXION", "detalles" => sqlsrv_errors())));
}
?>