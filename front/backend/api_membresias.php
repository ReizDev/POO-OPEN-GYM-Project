<?php
header('Content-Type: application/json');
require 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET': // Leer membresías
        $sql = "SELECT * FROM membresias";
        $stmt = sqlsrv_query($conn, $sql);
        if ($stmt === false) die(json_encode(["error" => sqlsrv_errors()]));
        
        $membresias = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            $membresias[] = $row;
        }
        echo json_encode($membresias);
        break;

    case 'POST': // Crear nueva membresía
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO membresias (nombre, costo, duracion_dias, estatus) VALUES (?, ?, ?, 'activo')";
        $params = array($data['nombre'], $data['costo'], $data['duracion_dias']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;

    case 'PUT': // Editar membresía
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "UPDATE membresias SET nombre = ?, costo = ?, duracion_dias = ?, estatus = ? WHERE id_membresia = ?";
        $params = array($data['nombre'], $data['costo'], $data['duracion_dias'], $data['estatus'], $data['id_membresia']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;

    case 'DELETE': // Borrar membresía
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "DELETE FROM membresias WHERE id_membresia = ?";
        $params = array($data['id_membresia']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;
}
sqlsrv_close($conn);
?>