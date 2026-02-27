<?php
header('Content-Type: application/json');
require 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET': // Leer socios
        $sql = "SELECT * FROM socios";
        $stmt = sqlsrv_query($conn, $sql);
        if ($stmt === false) die(json_encode(["error" => sqlsrv_errors()]));
        
        $socios = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            $socios[] = $row;
        }
        echo json_encode($socios);
        break;

    case 'POST': // Crear nuevo socio
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO socios (nombre, telefono, correo, estatus) VALUES (?, ?, ?, 'activo')";
        $params = array($data['nombre'], $data['telefono'], $data['correo']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;

    case 'PUT': // Editar socio
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "UPDATE socios SET nombre = ?, telefono = ?, correo = ? WHERE id_socio = ?";
        $params = array($data['nombre'], $data['telefono'], $data['correo'], $data['id_socio']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;

    case 'DELETE': // Borrar socio
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "DELETE FROM socios WHERE id_socio = ?";
        $params = array($data['id_socio']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;
}
sqlsrv_close($conn);
?>