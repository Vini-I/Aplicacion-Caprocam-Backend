USE caprocam;

INSERT INTO grupos_datos (
    codigo,
    nombre,
    descripcion,
    acceso_global
)
VALUES
(
    1,
    'Grupo Demo Finca',
    'Grupo de datos demo para pruebas de finca',
    FALSE
),
(
    99,
    'Caprocam Demo',
    'Grupo demo con acceso global para pruebas internas',
    TRUE
);

INSERT INTO roles (
    nombre,
    descripcion,
    acceso_global
)
VALUES
(
    'admin_caprocam',
    'Administrador interno de Caprocam con acceso global',
    TRUE
),
(
    'dueno_finca',
    'Usuario web propietario o administrador de finca',
    FALSE
),
(
    'colaborador_movil',
    'Colaborador que ingresa desde la app movil con PIN',
    FALSE
);

INSERT INTO usuarios (
    grupo_datos,
    rol_id,
    nombre,
    apellidos,
    email,
    nombre_usuario,
    password_hash,
    telefono
)
SELECT
    1,
    r.id,
    'Usuario',
    'Demo',
    'usuario.demo@caprocam.test',
    'usuario_demo',
    '$2a$12$oCh/xs1bgT70Xq9O0ftcyuyUHbir74i0Hai0xiT8403EC3Ua0Y4ZS',
    '88888888'
FROM roles r
WHERE r.nombre = 'dueno_finca';

INSERT INTO fincas (
    grupo_datos,
    propietario_usuario_id,
    codigo_cbo,
    nombre_finca,
    provincia,
    canton,
    distrito,
    otras_senas,
    propietario_responsable,
    telefono,
    area_total,
    espejos_agua
)
SELECT
    1,
    u.id,
    'CBO-DEMO',
    'Finca Demo',
    'Guanacaste',
    'Cañas',
    'Cañas',
    'Ubicacion demo',
    'Usuario Demo',
    '88888888',
    100.00,
    25.00
FROM usuarios u
WHERE u.email = 'usuario.demo@caprocam.test';

INSERT INTO estanques (
    grupo_datos,
    finca_id,
    codigo,
    tipo_estanque,
    estado,
    largo,
    ancho,
    profundidad,
    fuente_agua,
    especie,
    fecha_siembra,
    densidad_siembra
)
SELECT
    1,
    f.id,
    'EST-001',
    'Engorde',
    'Activo',
    100.00,
    80.00,
    1.20,
    'Pozo',
    'Litopenaeus vannamei - Camaron blanco',
    '2026-07-02',
    12.00
FROM fincas f
WHERE f.nombre_finca = 'Finca Demo';