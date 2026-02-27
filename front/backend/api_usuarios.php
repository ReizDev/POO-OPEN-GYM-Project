<?php
header('Content-Type: application/json');
require 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET': // Leer empleados
        $sql = "SELECT id_usuario, nombre, rol FROM usuarios";
        $stmt = sqlsrv_query($conn, $sql);
        if ($stmt === false) die(json_encode(["error" => sqlsrv_errors()]));
        
        $usuarios = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            $usuarios[] = $row;
        }
        echo json_encode($usuarios);
        break;

    case 'POST': // Crear nuevo empleado
        $data = json_decode(file_get_contents('php://input'), true);
        $pass = "123456"; // Contraseña temporal por defecto
        $sql = "INSERT INTO usuarios (nombre, rol, contrasena) VALUES (?, ?, ?)";
        $params = array($data['nombre'], $data['rol'], $pass);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;

    case 'PUT': // Editar empleado
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "UPDATE usuarios SET nombre = ?, rol = ? WHERE id_usuario = ?";
        $params = array($data['nombre'], $data['rol'], $data['id_usuario']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;

    case 'DELETE': // Borrar empleado
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "DELETE FROM usuarios WHERE id_usuario = ?";
        $params = array($data['id_usuario']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;
}
sqlsrv_close($conn);
?>