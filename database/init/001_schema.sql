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
    cedula VARCHAR(20) NULL,
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
    UNIQUE (grupo_datos, nombre_usuario),

    CONSTRAINT uq_colaborador_cedula_grupo
    UNIQUE (grupo_datos, cedula)
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
    precria BOOLEAN NOT NULL DEFAULT FALSE,
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
    identificador VARCHAR(5) NOT NULL,
    nombre_equipo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo_equipo ENUM(
        'Aireacion',
        'Bombeo',
        'Alimentacion',
        'Monitoreo',
        'Mantenimiento',
        'Otro'
    ) NOT NULL,
    fecha_instalacion DATE NOT NULL,
    funcion_equipo VARCHAR(255) NOT NULL,
    estanque_id INT NULL,
    horas_mantenimiento INT NULL,
    horas_actuales DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado_operativo ENUM('Activo', 'Inactivo', 'Mantenimiento') NOT NULL,
    estado ENUM('Encendido', 'Apagado') NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_equipos_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_equipos_estanques
    FOREIGN KEY (estanque_id) REFERENCES estanques(id),

    CONSTRAINT uq_equipo_identificador_grupo
    UNIQUE (grupo_datos, identificador)
);

CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    codigo_tarea VARCHAR(10) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(400) NULL,
    categoria ENUM('Preventivo', 'Correctivo', 'Predictivo', 'Emergencia') NULL,
    horas DECIMAL(5,2) NULL,
    estado ENUM('Pendiente', 'En proceso', 'Finalizada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_tareas_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT uq_tarea_codigo_grupo
    UNIQUE (grupo_datos, codigo_tarea)
);

CREATE TABLE IF NOT EXISTS mantenimiento_equipo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    codigo_ticket VARCHAR(10) NOT NULL,
    equipo_id INT NOT NULL,
    creado_por_usuario_id INT NULL,
    creado_por_colaborador_id INT NULL,
    fecha_mantenimiento DATETIME NOT NULL,
    titulo_ticket VARCHAR(100) NOT NULL,
    descripcion_ticket VARCHAR(400) NOT NULL,
    tipo_personal ENUM('TrabajadorInterno', 'TrabajadorExterno') NULL,
    costo_mano_obra DECIMAL(10,2) NOT NULL DEFAULT 0,
    costo_productos DECIMAL(12,2) NOT NULL DEFAULT 0,
    costo_total_estimado DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado_ticket ENUM('En espera', 'En mantenimiento', 'Terminado') NOT NULL DEFAULT 'En espera',
    estado_equipo ENUM('Activo', 'Inactivo', 'Mantenimiento') NOT NULL DEFAULT 'Mantenimiento',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_mantenimiento_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_mantenimiento_equipos
    FOREIGN KEY (equipo_id) REFERENCES equipos(id),

    CONSTRAINT fk_mantenimiento_usuarios
    FOREIGN KEY (creado_por_usuario_id) REFERENCES usuarios(id),

    CONSTRAINT fk_mantenimiento_colaboradores
    FOREIGN KEY (creado_por_colaborador_id) REFERENCES colaboradores(id),

    CONSTRAINT uq_mantenimiento_codigo_grupo
    UNIQUE (grupo_datos, codigo_ticket)
);

CREATE TABLE IF NOT EXISTS mantenimiento_equipo_tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    mantenimiento_equipo_id INT NOT NULL,
    tarea_id INT NOT NULL,
    estado_tarea ENUM('Pendiente', 'Realizado') NOT NULL DEFAULT 'Pendiente',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_mant_tareas_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_mant_tareas_mantenimiento
    FOREIGN KEY (mantenimiento_equipo_id) REFERENCES mantenimiento_equipo(id),

    CONSTRAINT fk_mant_tareas_tareas
    FOREIGN KEY (tarea_id) REFERENCES tareas(id),

    CONSTRAINT uq_mantenimiento_tarea
    UNIQUE (mantenimiento_equipo_id, tarea_id)
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
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    unidad VARCHAR(30) NULL,
    precio_unidad DECIMAL(10,2) NULL,
    proveedor_id INT NULL,
    fecha_ingreso DATE NULL,
    fecha_caducidad DATE NULL,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    grupo_datos INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_productos_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_productos_proveedores
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),

    CONSTRAINT uq_producto_codigo_grupo
    UNIQUE (grupo_datos, codigo)
);

CREATE TABLE IF NOT EXISTS mantenimiento_equipo_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    mantenimiento_equipo_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
    costo_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_mant_prod_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT fk_mant_prod_mantenimiento
    FOREIGN KEY (mantenimiento_equipo_id) REFERENCES mantenimiento_equipo(id),

    CONSTRAINT fk_mant_prod_productos
    FOREIGN KEY (producto_id) REFERENCES productos(id)
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

CREATE TABLE IF NOT EXISTS laboratorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(150) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_laboratorios_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT uq_laboratorio_nombre_grupo
    UNIQUE (grupo_datos, nombre)
);

CREATE TABLE IF NOT EXISTS procedencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(150) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_procedencias_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT uq_procedencia_nombre_grupo
    UNIQUE (grupo_datos, nombre)
);

CREATE TABLE IF NOT EXISTS proveedores_larva (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(150) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_proveedores_larva_grupos_datos
    FOREIGN KEY (grupo_datos) REFERENCES grupos_datos(codigo),

    CONSTRAINT uq_proveedor_larva_nombre_grupo
    UNIQUE (grupo_datos, nombre)
);

CREATE TABLE IF NOT EXISTS lotes_larva (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    codigo_lote VARCHAR(50) NOT NULL,
    proveedor_larva_id INT NULL,
    laboratorio_id INT NULL,
    procedencia_id INT NULL,
    certificado_larva VARCHAR(100) NULL,
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

    CONSTRAINT fk_lotes_proveedores_larva
    FOREIGN KEY (proveedor_larva_id) REFERENCES proveedores_larva(id),

    CONSTRAINT fk_lotes_laboratorios
    FOREIGN KEY (laboratorio_id) REFERENCES laboratorios(id),

    CONSTRAINT fk_lotes_procedencias
    FOREIGN KEY (procedencia_id) REFERENCES procedencias(id),

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
    colaborador_id INT NULL,
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

    CONSTRAINT fk_alimentaciones_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id),

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
    colaborador_id INT NULL,
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
    FOREIGN KEY (estanque_id) REFERENCES estanques(id),

    CONSTRAINT fk_densidad_colaboradores
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

CREATE TABLE IF NOT EXISTS raleos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    grupo_datos INT NOT NULL,
    finca_id INT NOT NULL,
    estanque_id INT NOT NULL,
    colaborador_id INT NULL,
    fecha DATE NOT NULL,
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
    FOREIGN KEY (estanque_id) REFERENCES estanques(id),

    CONSTRAINT uq_fq_estanque_fecha
    UNIQUE (grupo_datos, estanque_id, fecha_registro)
);

CREATE TABLE IF NOT EXISTS fisico_quimico_detalle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    lectura_id INT NOT NULL,
    tipo_medicion ENUM('ph', 'salinidad', 'temperatura', 'oxigeno') NOT NULL,
    etiqueta VARCHAR(20) NOT NULL,
    valor DECIMAL(6,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_fq_detalle_lectura
    FOREIGN KEY (lectura_id) REFERENCES fisico_quimico(id),

    CONSTRAINT uq_fq_detalle_lectura_tipo_etiqueta
    UNIQUE (lectura_id, tipo_medicion, etiqueta)
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

INSERT INTO grupos_datos (
    codigo,
    nombre,
    descripcion,
    acceso_global,
    activo
)
SELECT
    1,
    'Caprocam',
    'Grupo base inicial del sistema',
    TRUE,
    TRUE
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM grupos_datos
    WHERE codigo = 1
);

INSERT INTO roles (
    nombre,
    descripcion,
    acceso_global,
    activo
)
SELECT
    'administrador',
    'Rol administrativo inicial del sistema',
    TRUE,
    TRUE
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM roles
    WHERE nombre = 'administrador'
);

INSERT INTO usuarios (
    grupo_datos,
    rol_id,
    nombre,
    apellidos,
    email,
    nombre_usuario,
    password_hash,
    activo
)
SELECT
    (SELECT codigo FROM grupos_datos WHERE codigo = 1 LIMIT 1),
    (SELECT id FROM roles WHERE nombre = 'administrador' LIMIT 1),
    'Administrador',
    'Sistema',
    'admin@caprocam.local',
    'admin',
    '$2b$10$NuxtO925LglHJtx3CmDnROVHip/58kvWhpcKC4dF5XcQV3Mh9N1Di',
    TRUE
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM usuarios
    WHERE nombre_usuario = 'admin'
       OR email = 'admin@caprocam.local'
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

CREATE INDEX idx_equipos_grupo ON equipos(grupo_datos);
CREATE INDEX idx_equipos_estanque ON equipos(estanque_id);
CREATE INDEX idx_tareas_grupo ON tareas(grupo_datos);
CREATE INDEX idx_laboratorios_grupo ON laboratorios(grupo_datos);
CREATE INDEX idx_procedencias_grupo ON procedencias(grupo_datos);
CREATE INDEX idx_proveedores_larva_grupo ON proveedores_larva(grupo_datos);
CREATE INDEX idx_lotes_larva_grupo ON lotes_larva(grupo_datos);
CREATE INDEX idx_precrias_grupo ON precrias(grupo_datos);
CREATE INDEX idx_siembras_grupo ON siembras(grupo_datos);
CREATE INDEX idx_raleos_grupo ON raleos(grupo_datos);

CREATE INDEX idx_fq_estanque_fecha ON fisico_quimico(estanque_id, fecha_registro);
CREATE INDEX idx_fq_detalle_lectura ON fisico_quimico_detalle(lectura_id);
CREATE INDEX idx_fq_detalle_tipo ON fisico_quimico_detalle(tipo_medicion);

CREATE INDEX idx_mantenimiento_equipo_grupo ON mantenimiento_equipo(grupo_datos);
CREATE INDEX idx_mantenimiento_equipo_equipo ON mantenimiento_equipo(equipo_id);
CREATE INDEX idx_mant_prod_grupo ON mantenimiento_equipo_productos(grupo_datos);
CREATE INDEX idx_mant_prod_ticket ON mantenimiento_equipo_productos(mantenimiento_equipo_id);
CREATE INDEX idx_mant_tareas_grupo ON mantenimiento_equipo_tareas(grupo_datos);
CREATE INDEX idx_mant_tareas_ticket ON mantenimiento_equipo_tareas(mantenimiento_equipo_id);

CREATE INDEX idx_densidad_colaborador ON densidad_poblacional(colaborador_id);

CREATE INDEX idx_mantenimiento_estado_equipo ON mantenimiento_equipo(estado_equipo);
CREATE INDEX idx_alimentaciones_colaborador ON alimentaciones(colaborador_id);