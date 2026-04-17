<?php
header('Content-Type: application/json');
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    die(json_encode(["error" => "Método no permitido"]));
}

$filtro = isset($_GET['filtro']) ? $_GET['filtro'] : 'todos';
$id_pago = isset($_GET['id_pago']) ? $_GET['id_pago'] : null;

// Construir la condición SQL dinámica según el filtro
$whereClause = "1=1"; // Por defecto, trae todo

if (!empty($id_pago)) {
    $whereClause = "p.id_pago = " . intval($id_pago);
} else {
    if ($filtro === 'semana') {
        // Últimos 7 días
        $whereClause = "p.fecha_pago >= DATEADD(day, -7, GETDATE())";
    } elseif ($filtro === 'mes') {
        // Mismo mes y año actual
        $whereClause = "MONTH(p.fecha_pago) = MONTH(GETDATE()) AND YEAR(p.fecha_pago) = YEAR(GETDATE())";
    } elseif ($filtro === 'ano') {
        // Mismo año actual
        $whereClause = "YEAR(p.fecha_pago) = YEAR(GETDATE())";
    }
}

$reporte = [
    "ingresos_totales" => 0,
    "cantidad_pagos" => 0,
    "metodos_pago" => [],
    "pagos_detalle" => []
];

// 1. Ingresos totales (Suma de los pagos filtrados)
$sql1 = "SELECT SUM(monto) as total FROM pagos p WHERE $whereClause";
$stmt1 = sqlsrv_query($conn, $sql1);
if ($stmt1 && $row = sqlsrv_fetch_array($stmt1, SQLSRV_FETCH_ASSOC)) {
    $reporte["ingresos_totales"] = $row['total'] ? (float)$row['total'] : 0;
}

// 2. Cantidad de pagos en ese periodo
$sql2 = "SELECT COUNT(*) as total FROM pagos p WHERE $whereClause";
$stmt2 = sqlsrv_query($conn, $sql2);
if ($stmt2 && $row = sqlsrv_fetch_array($stmt2, SQLSRV_FETCH_ASSOC)) {
    $reporte["cantidad_pagos"] = $row['total'];
}

// 3. Ingresos agrupados por Método de Pago (Filtrados)
$sql3 = "SELECT p.metodo_pago, SUM(p.monto) as total FROM pagos p WHERE $whereClause GROUP BY p.metodo_pago";
$stmt3 = sqlsrv_query($conn, $sql3);
if ($stmt3) {
    while($row = sqlsrv_fetch_array($stmt3, SQLSRV_FETCH_ASSOC)) {
        $reporte["metodos_pago"][] = [
            "metodo" => $row['metodo_pago'],
            "total" => (float)$row['total']
        ];
    }
}

// 4. Detalle de los pagos (Todos los que coincidan con el filtro)
$sql4 = "SELECT p.id_pago, p.monto, p.fecha_pago, p.metodo_pago, s.nombre AS socio 
         FROM pagos p 
         INNER JOIN inscripciones i ON p.id_inscripcion = i.id_inscripcion 
         INNER JOIN socios s ON i.id_socio = s.id_socio 
         WHERE $whereClause
         ORDER BY p.fecha_pago DESC";
$stmt4 = sqlsrv_query($conn, $sql4);
if ($stmt4) {
    while($row = sqlsrv_fetch_array($stmt4, SQLSRV_FETCH_ASSOC)) {
        if ($row['fecha_pago']) {
            $row['fecha_pago'] = $row['fecha_pago']->format('Y-m-d H:i');
        }
        $reporte["pagos_detalle"][] = $row;
    }
}

// 5. Tendencia de ingresos (Agrupado por fecha para la gráfica)
$reporte["tendencia"] = ["fechas" => [], "totales" => []];
$sql5 = "SELECT CAST(p.fecha_pago AS DATE) as fecha, SUM(p.monto) as total 
         FROM pagos p 
         WHERE $whereClause 
         GROUP BY CAST(p.fecha_pago AS DATE) 
         ORDER BY fecha ASC";
$stmt5 = sqlsrv_query($conn, $sql5);
if ($stmt5) {
    while($row = sqlsrv_fetch_array($stmt5, SQLSRV_FETCH_ASSOC)) {
        $fecha_str = $row['fecha'] ? $row['fecha']->format('Y-m-d') : 'Desconocida';
        $reporte["tendencia"]["fechas"][] = $fecha_str;
        $reporte["tendencia"]["totales"][] = (float)$row['total'];
    }
}

echo json_encode($reporte);
sqlsrv_close($conn);
?>