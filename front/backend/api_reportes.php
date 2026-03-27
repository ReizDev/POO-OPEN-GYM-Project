<?php
header('Content-Type: application/json');
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    die(json_encode(["error" => "Método no permitido"]));
}

$reporte = [
    "ingresos_totales" => 0,
    "inscripciones_activas" => 0,
    "metodos_pago" => [],
    "pagos_recientes" => []
];

// 1. Ingresos totales (Suma de todos los pagos)
$sql1 = "SELECT SUM(monto) as total FROM pagos";
$stmt1 = sqlsrv_query($conn, $sql1);
if ($stmt1 && $row = sqlsrv_fetch_array($stmt1, SQLSRV_FETCH_ASSOC)) {
    $reporte["ingresos_totales"] = $row['total'] ? (float)$row['total'] : 0;
}

// 2. Inscripciones activas
$sql2 = "SELECT COUNT(*) as total FROM inscripciones WHERE estatus = 'activa'";
$stmt2 = sqlsrv_query($conn, $sql2);
if ($stmt2 && $row = sqlsrv_fetch_array($stmt2, SQLSRV_FETCH_ASSOC)) {
    $reporte["inscripciones_activas"] = $row['total'];
}

// 3. Ingresos agrupados por Método de Pago
$sql3 = "SELECT metodo_pago, SUM(monto) as total FROM pagos GROUP BY metodo_pago";
$stmt3 = sqlsrv_query($conn, $sql3);
if ($stmt3) {
    while($row = sqlsrv_fetch_array($stmt3, SQLSRV_FETCH_ASSOC)) {
        $reporte["metodos_pago"][] = [
            "metodo" => $row['metodo_pago'],
            "total" => (float)$row['total']
        ];
    }
}

// 4. Últimos 10 pagos registrados
$sql4 = "SELECT TOP 10 p.id_pago, p.monto, p.fecha_pago, p.metodo_pago, s.nombre AS socio 
         FROM pagos p 
         INNER JOIN inscripciones i ON p.id_inscripcion = i.id_inscripcion 
         INNER JOIN socios s ON i.id_socio = s.id_socio 
         ORDER BY p.fecha_pago DESC";
$stmt4 = sqlsrv_query($conn, $sql4);
if ($stmt4) {
    while($row = sqlsrv_fetch_array($stmt4, SQLSRV_FETCH_ASSOC)) {
        if ($row['fecha_pago']) {
            $row['fecha_pago'] = $row['fecha_pago']->format('Y-m-d H:i');
        }
        $reporte["pagos_recientes"][] = $row;
    }
}

echo json_encode($reporte);
sqlsrv_close($conn);
?>