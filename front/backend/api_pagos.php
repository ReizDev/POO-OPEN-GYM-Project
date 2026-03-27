<?php
header('Content-Type: application/json');
require 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET': // Leer el historial de pagos
        $sql = "SELECT p.id_pago, p.monto, p.fecha_pago, p.metodo_pago, 
                       s.nombre AS socio, m.nombre AS membresia 
                FROM pagos p 
                INNER JOIN inscripciones i ON p.id_inscripcion = i.id_inscripcion 
                INNER JOIN socios s ON i.id_socio = s.id_socio 
                INNER JOIN membresias m ON i.id_membresia = m.id_membresia
                ORDER BY p.fecha_pago DESC";
        $stmt = sqlsrv_query($conn, $sql);
        
        if ($stmt === false) die(json_encode(["error" => sqlsrv_errors()]));
        
        $pagos = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            // Formatear la fecha para que JavaScript la lea fácil
            if ($row['fecha_pago']) {
                $row['fecha_pago'] = $row['fecha_pago']->format('Y-m-d H:i');
            }
            $pagos[] = $row;
        }
        echo json_encode($pagos);
        break;

    case 'POST': // Registrar un nuevo pago
        $data = json_decode(file_get_contents('php://input'), true);
        
        // fecha_pago se genera automáticamente en SQL Server con GETDATE()
        $sql = "INSERT INTO pagos (id_inscripcion, monto, metodo_pago) VALUES (?, ?, ?)";
        $params = array($data['id_inscripcion'], $data['monto'], $data['metodo_pago']);
        $stmt = sqlsrv_query($conn, $sql, $params);
        
        if($stmt) echo json_encode(["status" => "ok"]);
        else { 
            http_response_code(400); 
            echo json_encode(["error" => sqlsrv_errors()]); 
        }
        break;
}
sqlsrv_close($conn);
?>