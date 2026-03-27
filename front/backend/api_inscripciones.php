<?php
header('Content-Type: application/json');
require 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET': // Leer inscripciones con nombres de socio y membresía
        $sql = "SELECT i.id_inscripcion, i.id_socio, i.id_membresia, 
                       s.nombre AS socio, m.nombre AS membresia, 
                       i.fecha_inicio, i.fecha_fin, i.estatus 
                FROM inscripciones i 
                INNER JOIN socios s ON i.id_socio = s.id_socio 
                INNER JOIN membresias m ON i.id_membresia = m.id_membresia";
        $stmt = sqlsrv_query($conn, $sql);
        if ($stmt === false) die(json_encode(["error" => sqlsrv_errors()]));
        
        $inscripciones = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            // Convertimos las fechas de SQL a texto para enviarlas a JavaScript
            $row['fecha_inicio'] = $row['fecha_inicio']->format('Y-m-d');
            $row['fecha_fin'] = $row['fecha_fin']->format('Y-m-d');
            $inscripciones[] = $row;
        }
        echo json_encode($inscripciones);
        break;

    case 'POST': // Inscribir a un socio
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO inscripciones (id_socio, id_membresia, fecha_inicio, fecha_fin, estatus) VALUES (?, ?, ?, ?, 'activa')";
        $params = array($data['id_socio'], $data['id_membresia'], $data['fecha_inicio'], $data['fecha_fin']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;

    case 'PUT': // Cambiar estatus de la inscripción (Ej. cancelarla)
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "UPDATE inscripciones SET estatus = ? WHERE id_inscripcion = ?";
        $params = array($data['estatus'], $data['id_inscripcion']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;

    case 'DELETE': // Eliminar inscripción (solo caso de error)
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "DELETE FROM inscripciones WHERE id_inscripcion = ?";
        $params = array($data['id_inscripcion']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { http_response_code(400); echo json_encode(["error" => sqlsrv_errors()]); }
        break;
}
sqlsrv_close($conn);
?>