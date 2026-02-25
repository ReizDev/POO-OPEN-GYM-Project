CREATE DATABASE gimnasio;
USE gimnasio;

-- Tabla usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rol ENUM('Administrador','Recepcionista') NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Tabla socios
CREATE TABLE socios (
    id_socio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100) UNIQUE,
    estatus ENUM('activo','inactivo') DEFAULT 'activo'
);

-- Tabla membresias
CREATE TABLE membresias (
    id_membresia INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    duracion INT NOT NULL, -- duración en días
    costo DECIMAL(10,2) NOT NULL
);

-- Tabla inscripciones
CREATE TABLE inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_socio INT,
    id_membresia INT,
    fecha_inicio DATE,
    fecha_fin DATE,
    FOREIGN KEY (id_socio) REFERENCES socios(id_socio),
    FOREIGN KEY (id_membresia) REFERENCES membresias(id_membresia)
);

-- Tabla pagos
CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(10,2) NOT NULL,
    fecha DATE NOT NULL,
    id_inscripcion INT,
    FOREIGN KEY (id_inscripcion) REFERENCES inscripciones(id_inscripcion)
);