<?php
header('Content-Type: application/json');
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    die(json_encode(["error" => "Método no permitido"]));
}

$dashboard = [
    "totales" => ["socios" => 0, "empleados" => 0],
    "grafica" => ["etiquetas" => [], "valores" => []],
    "vencimientos" => []
];

// 1. Total de Socios Activos
$sql1 = "SELECT COUNT(*) as total FROM socios WHERE estatus = 'activo'";
$stmt1 = sqlsrv_query($conn, $sql1);
if ($stmt1 && $row = sqlsrv_fetch_array($stmt1, SQLSRV_FETCH_ASSOC)) {
    $dashboard["totales"]["socios"] = $row['total'];
}

// 2. Total de Empleados (Usuarios)
$sql2 = "SELECT COUNT(*) as total FROM usuarios";
$stmt2 = sqlsrv_query($conn, $sql2);
if ($stmt2 && $row = sqlsrv_fetch_array($stmt2, SQLSRV_FETCH_ASSOC)) {
    $dashboard["totales"]["empleados"] = $row['total'];
}

// 3. Datos para la Gráfica (Inscripciones activas por tipo de Membresía)
$sql3 = "SELECT m.nombre, COUNT(i.id_inscripcion) as cantidad 
         FROM inscripciones i 
         INNER JOIN membresias m ON i.id_membresia = m.id_membresia 
         WHERE i.estatus = 'activa' 
         GROUP BY m.nombre";
$stmt3 = sqlsrv_query($conn, $sql3);
if ($stmt3) {
    while($row = sqlsrv_fetch_array($stmt3, SQLSRV_FETCH_ASSOC)) {
        $dashboard["grafica"]["etiquetas"][] = $row['nombre'];
        $dashboard["grafica"]["valores"][] = $row['cantidad'];
    }
}

// 4. Tabla de Próximos Vencimientos (Los 5 socios que están a punto de caducar)
$sql4 = "SELECT TOP 5 s.nombre AS socio, m.nombre AS membresia, i.fecha_fin 
         FROM inscripciones i 
         INNER JOIN socios s ON i.id_socio = s.id_socio 
         INNER JOIN membresias m ON i.id_membresia = m.id_membresia 
         WHERE i.estatus = 'activa' AND i.fecha_fin >= GETDATE() 
         ORDER BY i.fecha_fin ASC";
$stmt4 = sqlsrv_query($conn, $sql4);
if ($stmt4) {
    while($row = sqlsrv_fetch_array($stmt4, SQLSRV_FETCH_ASSOC)) {
        if ($row['fecha_fin']) {
            $row['fecha_fin'] = $row['fecha_fin']->format('Y-m-d');
        }
        $dashboard["vencimientos"][] = $row;
    }
}

echo json_encode($dashboard);
sqlsrv_close($conn);
?>