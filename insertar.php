<?php
// Datos de conexión a SQL Server
$serverName = "LAPTOP-CHGAB7QC\SQLEXPRESS"; // o el nombre de tu servidor
$connectionOptions = array(
    "Database" => "gimnasio",
    "Uid" => "<LAPTOP-CHGAB7QC>ruben",   // reemplaza con tu usuario
    "PWD" => "tuPasswordSQL"   // reemplaza con tu contraseña
);

// Conectar
$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    die(print_r(sqlsrv_errors(), true));
}

// Recibir datos del formulario
$nombre = $_POST['nombre'];
$telefono = $_POST['telefono'];
$correo = $_POST['correo'];
$estatus = "activo";

// Query de inserción
$sql = "INSERT INTO socios (nombre, telefono, correo, estatus) VALUES (?, ?, ?, ?)";
$params = array($nombre, $telefono, $correo, $estatus);

$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    die(print_r(sqlsrv_errors(), true));
} else {
    echo "Socio registrado correctamente.";
}

// Cerrar conexión
sqlsrv_close($conn);
?>
