CREATE DATABASE IF NOT EXISTS caprocam
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE caprocam;

CREATE TABLE IF NOT EXISTS grupos_datos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    codigo INT NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255) NULL,
    acceso_global BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    acceso_global BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    rol_id INT NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    nombre_usuario VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(25) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_usuarios_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_usuarios_roles
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS fincas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    propietario_usuario_id INT NULL,
    codigo_cbo VARCHAR(40) NULL,
    nombre_finca VARCHAR(80) NOT NULL,
    provincia VARCHAR(40) NULL,
    canton VARCHAR(60) NULL,
    distrito VARCHAR(60) NULL,
    otras_senas VARCHAR(255) NULL,
    propietario_responsable VARCHAR(100) NULL,
    telefono VARCHAR(25) NULL,
    area_total DECIMAL(10,2) NULL,
    espejos_agua DECIMAL(10,2) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_fincas_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_fincas_usuarios
    FOREIGN KEY (propietario_usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS colaboradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NULL,
    rol_id INT NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    telefono VARCHAR(25) NULL,
    email VARCHAR(120) NULL,
    nombre_usuario VARCHAR(80) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    tipo_colaborador ENUM('caprocam_collab', 'external_owner', 'external_collab') NOT NULL DEFAULT 'external_collab',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_colaboradores_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_colaboradores_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_colaboradores_roles
    FOREIGN KEY (rol_id) REFERENCES roles(id),

    CONSTRAINT uq_colaborador_usuario_grupo
    UNIQUE (grupo_datos, nombre_usuario)
);

CREATE TABLE IF NOT EXISTS estanques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    codigo VARCHAR(30) NOT NULL,
    tipo_estanque VARCHAR(50) NOT NULL,
    estado ENUM('Activo', 'En preparacion', 'Mantenimiento', 'Engorde', 'Cosechado') NOT NULL DEFAULT 'Activo',
    largo DECIMAL(10,2) NOT NULL,
    ancho DECIMAL(10,2) NOT NULL,
    profundidad DECIMAL(10,2) NOT NULL,
    fuente_agua VARCHAR(100) NULL,
    especie VARCHAR(150) NULL,
    fecha_siembra DATE NULL,
    fecha_inicio_engorde DATE NULL,
    fecha_mantenimiento DATE NULL,
    densidad_siembra DECIMAL(10,2) NULL,
    usa_precria BOOLEAN NOT NULL DEFAULT FALSE,
    metodo_alimentacion VARCHAR(100) NULL,
    proveedor_alimento VARCHAR(100) NULL,
    numero_aireadores INT NOT NULL DEFAULT 0,
    tiene_alimentador_automatico BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_estanques_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_estanques_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT uq_estanque_codigo_finca
    UNIQUE (finca_id, codigo)
);

CREATE TABLE IF NOT EXISTS equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    fecha_instalacion DATE NULL,
    tipo VARCHAR(80) NULL,
    estado VARCHAR(50) NULL,
    funcion VARCHAR(400) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_equipos_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo)
);

CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    colaborador_id INT NULL,
    equipo_id INT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(400) NULL,
    categoria ENUM('preventivo', 'correctivo', 'predictivo', 'emergencia') NULL,
    horas DECIMAL(5,2) NULL,
    estado ENUM('Pendiente', 'En proceso', 'Finalizada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_tareas_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_tareas_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id),

    CONSTRAINT fk_tareas_equipos
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

CREATE TABLE IF NOT EXISTS mantenimiento_equipo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    equipo_id INT NULL,
    creado_por_colaborador_id INT NULL,
    titulo_ticket VARCHAR(100) NOT NULL,
    descripcion_ticket VARCHAR(400) NULL,
    estado_ticket ENUM('Pendiente', 'Activo', 'Resuelto') NOT NULL DEFAULT 'Pendiente',
    estado_equipo VARCHAR(50) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_mantenimiento_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_mantenimiento_equipos
    FOREIGN KEY (equipo_id) REFERENCES equipos(id),

    CONSTRAINT fk_mantenimiento_colaboradores
    FOREIGN KEY (creado_por_colaborador_id) REFERENCES colaboradores(id)
);

CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    nombre_empresa VARCHAR(150) NOT NULL,
    tipo_producto ENUM('Alimento', 'Antibiotico', 'Fertilizante', 'Probioticos', 'Equipos', 'Larva', 'Otro') NOT NULL DEFAULT 'Otro',
    telefono VARCHAR(25) NULL,
    correo_electronico VARCHAR(120) NULL,
    direccion VARCHAR(255) NULL,
    notas VARCHAR(255) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_proveedores_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo)
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    proveedor_id INT NULL,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    unidad VARCHAR(30) NULL,
    precio_unidad DECIMAL(10,2) NULL,
    fecha_ingreso DATE NULL,
    fecha_caducidad DATE NULL,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_productos_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_productos_proveedores
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE IF NOT EXISTS inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    producto_id INT NOT NULL,
    proveedor_id INT NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_inventario_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_inventario_productos
    FOREIGN KEY (producto_id) REFERENCES productos(id),

    CONSTRAINT fk_inventario_proveedores
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),

    CONSTRAINT uq_inventario_producto_grupo
    UNIQUE (grupo_datos, producto_id)
);

CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    inventario_id INT NOT NULL,
    producto_id INT NOT NULL,
    colaborador_id INT NULL,
    tipo_movimiento ENUM('Entrada', 'Salida', 'Ajuste') NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    observacion TEXT NULL,
    fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_mov_inv_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_mov_inv_inventario
    FOREIGN KEY (inventario_id) REFERENCES inventario(id),

    CONSTRAINT fk_mov_inv_productos
    FOREIGN KEY (producto_id) REFERENCES productos(id),

    CONSTRAINT fk_mov_inv_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

CREATE TABLE IF NOT EXISTS lotes_larva (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    codigo_lote VARCHAR(50) NOT NULL,
    proveedor_id INT NULL,
    laboratorio VARCHAR(100) NULL,
    lugar_procedencia VARCHAR(100) NULL,
    certificado_larva VARCHAR(150) NULL,
    pl_inicial INT NULL,
    cantidad_inicial INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    estado_lote ENUM('Disponible', 'En PreCria', 'Sembrado', 'Agotado') NOT NULL DEFAULT 'Disponible',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_lotes_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_lotes_proveedores
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),

    CONSTRAINT uq_lote_codigo_grupo
    UNIQUE (grupo_datos, codigo_lote)
);

CREATE TABLE IF NOT EXISTS precrias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    lote_larva_id INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    duracion_dias INT NULL,
    cantidad_inicial INT NULL,
    cantidad_final INT NULL,
    pl_inicial INT NULL,
    pl_final INT NULL,
    estado ENUM('Activa', 'Finalizada') NOT NULL DEFAULT 'Activa',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_precrias_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_precrias_lotes
    FOREIGN KEY (lote_larva_id) REFERENCES lotes_larva(id),

    CONSTRAINT fk_precrias_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_precrias_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id)
);

CREATE TABLE IF NOT EXISTS siembras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    lote_larva_id INT NOT NULL,
    precria_id INT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    fecha_siembra DATE NOT NULL,
    tecnica_cultivo VARCHAR(100) NULL,
    densidad_poblacional DECIMAL(10,2) NULL,
    cantidad_sembrada INT NOT NULL,
    pl_siembra INT NULL,
    estado ENUM('Activa', 'Finalizada') NOT NULL DEFAULT 'Activa',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_siembras_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_siembras_lotes
    FOREIGN KEY (lote_larva_id) REFERENCES lotes_larva(id),

    CONSTRAINT fk_siembras_precrias
    FOREIGN KEY (precria_id) REFERENCES precrias(id),

    CONSTRAINT fk_siembras_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_siembras_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id)
);

CREATE TABLE IF NOT EXISTS crecimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    colaborador_id INT NULL,
    fecha_registro DATE NOT NULL,
    peso_actual DECIMAL(10,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_crecimientos_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_crecimientos_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_crecimientos_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id),

    CONSTRAINT fk_crecimientos_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

CREATE TABLE IF NOT EXISTS compradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    contacto VARCHAR(120) NULL,
    telefono VARCHAR(25) NULL,
    correo VARCHAR(150) NULL,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_compradores_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo)
);

CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    colaborador_id INT NULL,
    comprador_id INT NULL,
    peso_promedio DECIMAL(10,2) NULL,
    tamano_promedio DECIMAL(10,2) NULL,
    cantidad_vendida DECIMAL(10,2) NOT NULL,
    precio_kilo DECIMAL(10,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    fecha DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_ventas_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_ventas_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_ventas_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id),

    CONSTRAINT fk_ventas_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id),

    CONSTRAINT fk_ventas_compradores
    FOREIGN KEY (comprador_id) REFERENCES compradores(id)
);

CREATE TABLE IF NOT EXISTS parasitologias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    colaborador_id INT NULL,
    tipo_registro VARCHAR(50) NOT NULL,
    fecha_reporte DATE NOT NULL,
    responsable VARCHAR(100) NULL,
    parasito ENUM('gregarina', 'nematodo', 'epicomensal', 'protozoario', 'otro') NOT NULL,
    camarones_muestreados INT NOT NULL,
    camarones_infectados INT NOT NULL,
    porcentaje_infeccion DECIMAL(5,2) NULL,
    grado_infeccion ENUM('bajo', 'medio', 'alto') NULL,
    observaciones VARCHAR(400) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_parasitologias_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_parasitologias_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_parasitologias_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id),

    CONSTRAINT fk_parasitologias_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

CREATE TABLE IF NOT EXISTS enfermedades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    colaborador_id INT NULL,
    tipo_registro VARCHAR(50) NOT NULL,
    fecha_reporte DATE NOT NULL,
    responsable VARCHAR(100) NULL,
    enfermedad ENUM('WSSV - Mancha Blanca', 'AHPND - Necrosis hepatopancreatica aguda', 'Vibriosis', 'IHHNV', 'NHP - Hepatobacter penaei', 'otro') NOT NULL,
    severidad ENUM('bajo', 'medio', 'alto', 'critica') NOT NULL,
    mortalidad_registrada INT NULL,
    reporte VARCHAR(400) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_enfermedades_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_enfermedades_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_enfermedades_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id),

    CONSTRAINT fk_enfermedades_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

CREATE TABLE IF NOT EXISTS alimentaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    proveedor_id INT NULL,
    producto_id INT NULL,
    fecha DATE NOT NULL,
    hora VARCHAR(10) NULL,
    metodo VARCHAR(30) NULL,
    cantidad_kg DECIMAL(10,2) NOT NULL,
    presentacion VARCHAR(30) NULL,
    proveedor VARCHAR(100) NULL,
    tipo_alimento VARCHAR(80) NULL,
    observaciones TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_alimentaciones_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_alimentaciones_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_alimentaciones_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id),

    CONSTRAINT fk_alimentaciones_proveedores
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),

    CONSTRAINT fk_alimentaciones_productos
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS densidad_poblacional (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    fecha DATE NOT NULL,
    cantidad_siembra INT NULL,
    area_estanque DECIMAL(10,2) NULL,
    numero_camarones INT NULL,
    tiros_atarraya INT NULL,
    area_atarraya DECIMAL(10,2) NULL,
    promedio_por_tiro DECIMAL(10,2) NULL,
    sobrevivencia DECIMAL(10,2) NULL,
    densidad DECIMAL(10,2) NULL,
    notas_conteo TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_densidad_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_densidad_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_densidad_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id)
);

CREATE TABLE IF NOT EXISTS raleos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    colaborador_id INT NULL,
    fecha DATE NOT NULL,
    responsable VARCHAR(100) NULL,
    porcentaje VARCHAR(10) NULL,
    peso_estimado DECIMAL(10,2) NULL,
    biomasa_estimada DECIMAL(10,2) NULL,
    objetivo VARCHAR(80) NULL,
    metodos VARCHAR(50) NULL,
    observaciones TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_raleos_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_raleos_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_raleos_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id),

    CONSTRAINT fk_raleos_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

CREATE TABLE IF NOT EXISTS fisico_quimico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    fecha_registro DATE NOT NULL,
    ph DECIMAL(5,2) NULL,
    salinidad DECIMAL(5,2) NULL,
    temperatura DECIMAL(5,2) NULL,
    oxigeno DECIMAL(5,2) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_fq_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_fq_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_fq_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id)
);

CREATE TABLE IF NOT EXISTS trazabilidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_origen_id INT NULL,
    estanque_destino_id INT NULL,
    colaborador_id INT NULL,
    fecha DATE NOT NULL,
    tamano DECIMAL(5,2) NULL,
    dias INT NULL,
    pl DECIMAL(10,0) NULL,
    tipo_movimiento VARCHAR(80) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_trazabilidad_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_trazabilidad_fincas
    FOREIGN KEY (finca_id) REFERENCES fincas(id),

    CONSTRAINT fk_trazabilidad_estanque_origen
    FOREIGN KEY (estanque_origen_id) REFERENCES estanques(id),

    CONSTRAINT fk_trazabilidad_estanque_destino
    FOREIGN KEY (estanque_destino_id) REFERENCES estanques(id),

    CONSTRAINT fk_trazabilidad_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    usuario_id INT NULL,
    colaborador_id INT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expira_en DATETIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_refresh_tokens_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),

    CONSTRAINT fk_refresh_tokens_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

CREATE INDEX idx_usuarios_grupo ON usuarios(grupo_datos);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_colaboradores_grupo ON colaboradores(grupo_datos);
CREATE INDEX idx_fincas_grupo ON fincas(grupo_datos);
CREATE INDEX idx_estanques_grupo ON estanques(grupo_datos);
CREATE INDEX idx_productos_grupo ON productos(grupo_datos);
CREATE INDEX idx_inventario_grupo ON inventario(grupo_datos);
CREATE INDEX idx_parasitologias_grupo ON parasitologias(grupo_datos);
CREATE INDEX idx_enfermedades_grupo ON enfermedades(grupo_datos);
CREATE INDEX idx_alimentaciones_grupo ON alimentaciones(grupo_datos);
CREATE INDEX idx_fisico_quimico_grupo ON fisico_quimico(grupo_datos);