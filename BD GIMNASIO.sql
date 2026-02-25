
USE gimnasio;
GO

-- Tabla usuarios
CREATE TABLE usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('Administrador','Recepcionista')),
    contrasena VARCHAR(255) NOT NULL
);

-- Tabla socios
CREATE TABLE socios (
    id_socio INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100) UNIQUE,
    estatus VARCHAR(10) DEFAULT 'activo' CHECK (estatus IN ('activo','inactivo'))
);

-- Tabla membresias
CREATE TABLE membresias (
    id_membresia INT IDENTITY(1,1) PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    duracion INT NOT NULL, -- duración en días
    costo DECIMAL(10,2) NOT NULL
);

-- Tabla inscripciones
CREATE TABLE inscripciones (
    id_inscripcion INT IDENTITY(1,1) PRIMARY KEY,
    id_socio INT NOT NULL,
    id_membresia INT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    FOREIGN KEY (id_socio) REFERENCES socios(id_socio),
    FOREIGN KEY (id_membresia) REFERENCES membresias(id_membresia)
);

-- Tabla pagos
CREATE TABLE pagos (
    id_pago INT IDENTITY(1,1) PRIMARY KEY,
    monto DECIMAL(10,2) NOT NULL,
    fecha DATE NOT NULL,
    id_inscripcion INT NOT NULL,
    FOREIGN KEY (id_inscripcion) REFERENCES inscripciones(id_inscripcion)
);
