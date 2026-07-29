-- ==============================================================================
-- SCRIPT DE DATOS DE PRUEBA (SEED DATA) PARA LA BASE DE DATOS `caprocam`
-- ==============================================================================

USE caprocam;

-- Desactivar temporalmente la verificacion de claves foraneas para la carga de datos
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 0. DATOS BASE DEL SISTEMA
-- ------------------------------------------------------------------------------

INSERT INTO grupos_datos (codigo, nombre, descripcion, acceso_global, activo) VALUES
(1, 'Caprocam', 'Grupo base inicial del sistema', TRUE, TRUE);

INSERT INTO roles (nombre, descripcion, acceso_global, activo) VALUES
('administrador', 'Rol administrativo inicial del sistema', TRUE, TRUE);

INSERT INTO usuarios (grupo_datos, rol_id, nombre, apellidos, email, nombre_usuario, password_hash, activo)
SELECT
    1,
    r.id,
    'Administrador',
    'Sistema',
    'admin@caprocam.local',
    'admin',
    '$2b$10$NuxtO925LglHJtx3CmDnROVHip/58kvWhpcKC4dF5XcQV3Mh9N1Di',
    TRUE
FROM roles r
WHERE r.nombre = 'administrador';

-- ------------------------------------------------------------------------------
-- 1. TABLA: grupos_datos
-- ------------------------------------------------------------------------------
INSERT INTO grupos_datos (id, uuid, codigo, nombre, descripcion, acceso_global, activo) VALUES
(2, UUID(), 1001, 'Grupo Acuicola del Pacifico', 'Grupo empresarial principal de produccion camaronera', TRUE, TRUE),
(3, UUID(), 1002, 'Corporacion Camaronera del Sur', 'Grupo asociado de pequenas y medianas fincas', FALSE, TRUE);

-- ------------------------------------------------------------------------------
-- 2. TABLA: roles
-- ------------------------------------------------------------------------------
INSERT INTO roles (id, uuid, nombre, descripcion, acceso_global, activo) VALUES
(2, UUID(), 'Administrador General', 'Acceso total a la plataforma y configuracion del sistema', TRUE, TRUE),
(3, UUID(), 'Gerente de Finca', 'Gestion operativa, inventarios y personal de finca', FALSE, TRUE),
(4, UUID(), 'Biologo / Tecnico Acuacultura', 'Supervision de parametros fisicos, quimicos y patologias', FALSE, TRUE),
(5, UUID(), 'Operario de Campo', 'Registro diario de alimentaciones, conteos y mantenimientos', FALSE, TRUE);

-- ------------------------------------------------------------------------------
-- 3. TABLA: usuarios
-- ------------------------------------------------------------------------------
INSERT INTO usuarios (id, uuid, grupo_datos, rol_id, nombre, apellidos, email, nombre_usuario, password_hash, activo) VALUES
(2, UUID(), 1001, 2, 'Carlos', 'Mendoza Solano', 'cmendoza@caprocam.com', 'admin_carlos', '$2a$12$lbJP0Yno2WF3mxI.deIeYO2PuC0KdvFf1Ku3kT4N5TLpuRxqSFxV2', TRUE),
(3, UUID(), 1001, 3, 'Maria', 'Jimenez Castro', 'mjimenez@caprocam.com', 'gerente_maria', '$2a$12$lbJP0Yno2WF3mxI.deIeYO2PuC0KdvFf1Ku3kT4N5TLpuRxqSFxV2', TRUE),
(4, UUID(), 1002, 4, 'Roberto', 'Vargas Quiros', 'rvargas@surcamaron.com', 'biologo_roberto', '$2a$12$lbJP0Yno2WF3mxI.deIeYO2PuC0KdvFf1Ku3kT4N5TLpuRxqSFxV2', TRUE);

-- ------------------------------------------------------------------------------
-- 4. TABLA: fincas
-- ------------------------------------------------------------------------------
INSERT INTO fincas (id, uuid, grupo_datos, propietario_usuario_id, codigo_cbo, nombre_finca, provincia, canton, distrito, otras_senas, propietario_responsable, telefono, area_total, espejos_agua, activo) VALUES
(1, UUID(), 1001, 2, 'CBO-CR-001', 'Finca El Maragal', 'Puntarenas', 'Central', 'Chacarita', '500m oeste de la desembocadura', 'Carlos Mendoza', '+506 8888-1111', 45.50, 32.00, TRUE),
(2, UUID(), 1001, 3, 'CBO-CR-002', 'Finca Costa Azul', 'Puntarenas', 'Esparza', 'Caldera', 'Frente a estero de Mata de Limon', 'Maria Jimenez', '+506 8888-2222', 28.00, 20.00, TRUE),
(3, UUID(), 1002, 4, 'CBO-CR-003', 'Finca Camaronera Golfo', 'Guanacaste', 'Nicoya', 'San Antonio', 'Camino a Puerto Humo', 'Roberto Vargas', '+506 8888-3333', 60.00, 42.50, TRUE);

-- ------------------------------------------------------------------------------
-- 5. TABLA: colaboradores
-- ------------------------------------------------------------------------------
INSERT INTO colaboradores (id, uuid, grupo_datos, finca_id, rol_id, nombre, apellidos, cedula, telefono, email, nombre_usuario, pin_hash, tipo_colaborador, activo) VALUES
(1, UUID(), 1001, 1, 5, 'Juan', 'Perez Morales', '601230456', '+506 7011-2233', 'jperez@gmail.com', 'jperez_maragal', '$2a$12$lbJP0Yno2WF3mxI.deIeYO2PuC0KdvFf1Ku3kT4N5TLpuRxqSFxV2', 'external_collab', TRUE),
(2, UUID(), 1001, 1, 4, 'Laura', 'Sanchez Mora', '109870654', '+506 7022-3344', 'lsanchez@caprocam.com', 'lsanchez_tec', '$2a$12$lbJP0Yno2WF3mxI.deIeYO2PuC0KdvFf1Ku3kT4N5TLpuRxqSFxV2', 'caprocam_collab', TRUE),
(3, UUID(), 1002, 3, 5, 'Esteban', 'Araya Cruz', '503210987', '+506 7033-4455', 'earaya@surcamaron.com', 'earaya_golfo', '$2a$12$lbJP0Yno2WF3mxI.deIeYO2PuC0KdvFf1Ku3kT4N5TLpuRxqSFxV2', 'external_owner', TRUE);

-- ------------------------------------------------------------------------------
-- 6. TABLA: estanques
-- ------------------------------------------------------------------------------
INSERT INTO estanques (id, uuid, grupo_datos, finca_id, codigo, tipo_estanque, estado, largo, ancho, profundidad, fuente_agua, especie, fecha_siembra, fecha_inicio_engorde, fecha_mantenimiento, densidad_siembra, precria, metodo_alimentacion, proveedor_alimento, numero_aireadores, tiene_alimentador_automatico, activo) VALUES
(1, UUID(), 1001, 1, 'EST-01', 'Engorde', 'Engorde', 100.00, 50.00, 1.40, 'Estero Chinchilla', 'Litopenaeus vannamei', '2026-05-10', '2026-05-25', NULL, 15.00, FALSE, 'Alimentadores Automaticos', 'Nicovita', 4, TRUE, TRUE),
(2, UUID(), 1001, 1, 'EST-02', 'Precria', 'Activo', 40.00, 25.00, 1.20, 'Estero Chinchilla', 'Litopenaeus vannamei', '2026-06-01', NULL, NULL, 120.00, TRUE, 'Bandejas y manual', 'Skretting', 2, FALSE, TRUE),
(3, UUID(), 1001, 2, 'EST-A1', 'Engorde', 'Activo', 120.00, 60.00, 1.50, 'Canal Principal', 'Litopenaeus vannamei', '2026-04-15', '2026-05-01', NULL, 18.00, FALSE, 'Alimentador Mecanico', 'Nicovita', 6, TRUE, TRUE),
(4, UUID(), 1002, 3, 'EST-G01', 'Engorde', 'Mantenimiento', 150.00, 80.00, 1.60, 'Rio Tempisque', 'Litopenaeus vannamei', NULL, NULL, '2026-07-01', 0.00, FALSE, 'Manual', 'Cargill', 8, FALSE, TRUE);

-- ------------------------------------------------------------------------------
-- 7. TABLA: equipos
-- ------------------------------------------------------------------------------
INSERT INTO equipos (id, uuid, grupo_datos, identificador, nombre_equipo, descripcion, tipo_equipo, fecha_instalacion, funcion_equipo, estanque_id, horas_mantenimiento, horas_actuales, estado_operativo, estado, activo) VALUES
(1, UUID(), 1001, 'EQ001', 'Aireador de Paletas 2HP #1', 'Aireador de paleta trifasico de 2 HP marca Splash', 'Aireacion', '2025-01-15', 'Inyeccion de oxigeno superficial en zona profunda', 1, 500, 320.50, 'Activo', 'Encendido', TRUE),
(2, UUID(), 1001, 'EQ002', 'Bomba Diesel 10 pulgadas', 'Bomba de agua de alto caudal para llenado de raceways', 'Bombeo', '2024-11-20', 'Llenado y recambio hidrico de estanques', 2, 250, 210.00, 'Activo', 'Apagado', TRUE),
(3, UUID(), 1001, 'EQ003', 'Alimentador Solar Automatico', 'Alimentador temporizado con panel solar de 50kg', 'Alimentacion', '2025-03-10', 'Dispersion programada de alimento extruido', 1, 1000, 145.00, 'Activo', 'Encendido', TRUE),
(4, UUID(), 1002, 'EQ004', 'Sonda Multiparametro YSI Pro', 'Medidor de oxigeno disuelto, pH y salinidad digital', 'Monitoreo', '2025-02-01', 'Medicion diaria de parametros fisico-quimicos', 4, 300, 290.00, 'Mantenimiento', 'Apagado', TRUE);

-- ------------------------------------------------------------------------------
-- 8. TABLA: tareas
-- ------------------------------------------------------------------------------
INSERT INTO tareas (id, uuid, grupo_datos, codigo_tarea, nombre, descripcion, categoria, horas, estado, activo) VALUES
(1, UUID(), 1001, 'TAR-01', 'Cambio de Aceite y Filtros', 'Sustitucion de aceite de motor diesel y filtros de aire/combustible', 'Preventivo', 2.50, 'Pendiente', TRUE),
(2, UUID(), 1001, 'TAR-02', 'Revision de Transmision Aireador', 'Verificacion de pinones, grasa y sello mecanico de reductor', 'Preventivo', 1.50, 'En proceso', TRUE),
(3, UUID(), 1001, 'TAR-03', 'Reparacion Impulsor de Bomba', 'Cambio de rodamiento danado por corrosion marina', 'Correctivo', 4.00, 'Finalizada', TRUE),
(4, UUID(), 1002, 'TAR-04', 'Calibracion de Sensores de Oxigeno', 'Calibracion de membrana y solucion estandar de sonda YSI', 'Predictivo', 1.00, 'Pendiente', TRUE);

-- ------------------------------------------------------------------------------
-- 9. TABLA: mantenimiento_equipo
-- ------------------------------------------------------------------------------
INSERT INTO mantenimiento_equipo (id, uuid, grupo_datos, codigo_ticket, equipo_id, creado_por_usuario_id, creado_por_colaborador_id, fecha_mantenimiento, titulo_ticket, descripcion_ticket, tipo_personal, costo_mano_obra, costo_productos, costo_total_estimado, estado_ticket, estado_equipo, activo) VALUES
(1, UUID(), 1001, 'TCK-001', 1, 3, 1, '2026-07-10 08:30:00', 'Mantenimiento preventivo 300h Aireador 1', 'Cambio de retenedores y engrase general de chumaceras.', 'TrabajadorInterno', 25000.00, 16500.00, 41500.00, 'Terminado', 'Activo', TRUE),
(2, UUID(), 1001, 'TCK-002', 2, 2, 2, '2026-07-20 14:00:00', 'Revision sistema electrico bomba', 'Fallo en termico de arranque por sulfatacion.', 'TrabajadorExterno', 45000.00, 32000.00, 77000.00, 'En mantenimiento', 'Mantenimiento', TRUE);

-- ------------------------------------------------------------------------------
-- 10. TABLA: mantenimiento_equipo_tareas
-- ------------------------------------------------------------------------------
INSERT INTO mantenimiento_equipo_tareas (id, uuid, grupo_datos, mantenimiento_equipo_id, tarea_id, estado_tarea, activo) VALUES
(1, UUID(), 1001, 1, 2, 'Realizado', TRUE),
(2, UUID(), 1001, 2, 1, 'Pendiente', TRUE);

-- ------------------------------------------------------------------------------
-- 11. TABLA: proveedores
-- ------------------------------------------------------------------------------
INSERT INTO proveedores (id, uuid, grupo_datos, nombre_empresa, tipo_producto, telefono, correo_electronico, direccion, notas, activo) VALUES
(1, UUID(), 1001, 'Nutricion Acuicola Nicovita S.A.', 'Alimento', '+506 2200-1111', 'ventas@nicovita.com', 'Zona Industrial El Roble, Puntarenas', 'Proveedor principal de balanceado 35% proteina', TRUE),
(2, UUID(), 1001, 'Aquatech Equipos e Insumos', 'Equipos', '+506 2200-2222', 'contacto@aquatech.cr', 'San Jose, La Uruca', 'Distribuidor oficial de aireadores Splash y bombas', TRUE),
(3, UUID(), 1001, 'Laboratorio Genetica Marina del Pacifico', 'Larva', '+506 2660-3333', 'larvas@genemar.com', 'Las Juntas, Abangares', 'Suministro de postlarva PL-10 resistente a WSSV', TRUE),
(4, UUID(), 1002, 'BioProbioticos Acuaticos America', 'Probioticos', '+506 2660-4444', 'info@biopro.com', 'Liberia, Guanacaste', 'Bacterias nitrificantes y Bacillus para suelo', TRUE);

-- ------------------------------------------------------------------------------
-- 12. TABLA: productos
-- ------------------------------------------------------------------------------
INSERT INTO productos (id, uuid, codigo, nombre, categoria, unidad, precio_unidad, proveedor_id, fecha_ingreso, fecha_caducidad, estado, grupo_datos, activo) VALUES
(1, UUID(), 'PROD-ALM-35', 'Alimento Balanceado 35% Proteina 2.0mm', 'Alimento', 'Saco 25kg', 18500.00, 1, '2026-06-01', '2026-12-01', 'ACTIVO', 1001, TRUE),
(2, UUID(), 'PROD-ALM-40', 'Iniciador Microextruido 40% Proteina', 'Alimento', 'Saco 20kg', 24000.00, 1, '2026-06-15', '2026-12-15', 'ACTIVO', 1001, TRUE),
(3, UUID(), 'PROD-PRO-BIO', 'Bacillus Subtilis en Polvo Concentrado', 'Probioticos', 'Cubeta 5kg', 45000.00, 4, '2026-05-10', '2027-05-10', 'ACTIVO', 1002, TRUE),
(4, UUID(), 'PROD-ACE-SAE30', 'Aceite para Motor Marino SAE 30', 'Mantenimiento', 'Galon', 16500.00, 2, '2026-04-01', '2028-04-01', 'ACTIVO', 1001, TRUE);

-- ------------------------------------------------------------------------------
-- 13. TABLA: mantenimiento_equipo_productos
-- ------------------------------------------------------------------------------
INSERT INTO mantenimiento_equipo_productos (id, uuid, grupo_datos, mantenimiento_equipo_id, producto_id, cantidad, costo_unitario, subtotal, activo) VALUES
(1, UUID(), 1001, 1, 4, 1.00, 16500.00, 16500.00, TRUE);

-- ------------------------------------------------------------------------------
-- 14. TABLA: inventario
-- ------------------------------------------------------------------------------
INSERT INTO inventario (id, uuid, grupo_datos, producto_id, proveedor_id, cantidad, stock_minimo, activo) VALUES
(1, UUID(), 1001, 1, 1, 150.00, 30.00, TRUE),
(2, UUID(), 1001, 2, 1, 40.00, 10.00, TRUE),
(3, UUID(), 1001, 4, 2, 12.00, 4.00, TRUE),
(4, UUID(), 1002, 3, 4, 8.00, 2.00, TRUE);

-- ------------------------------------------------------------------------------
-- 15. TABLA: movimientos_inventario
-- ------------------------------------------------------------------------------
INSERT INTO movimientos_inventario (id, uuid, grupo_datos, inventario_id, producto_id, colaborador_id, tipo_movimiento, cantidad, observacion, fecha_movimiento, activo) VALUES
(1, UUID(), 1001, 1, 1, 1, 'Entrada', 200.00, 'Factura #F-4589 Nicovita recoleccion en bodegas', '2026-06-01 10:00:00', TRUE),
(2, UUID(), 1001, 1, 1, 1, 'Salida', 50.00, 'Alimentacion semanal Estanque EST-01', '2026-06-10 16:30:00', TRUE);

-- ------------------------------------------------------------------------------
-- 16. TABLA: laboratorios
-- ------------------------------------------------------------------------------
INSERT INTO laboratorios (id, uuid, grupo_datos, nombre, descripcion, activo) VALUES
(1, UUID(), 1001, 'LabGen Pacifico', 'Laboratorio certificado de produccion de larvas SPF', TRUE),
(2, UUID(), 1001, 'BioLarvas del Golfo', 'Laboratorio especializado en maduracion y nauplios', TRUE),
(3, UUID(), 1002, 'Acuacultura Nicoya Lab', 'Centro de investigacion y desarrollo genetico', TRUE);

-- ------------------------------------------------------------------------------
-- 17. TABLA: procedencias
-- ------------------------------------------------------------------------------
INSERT INTO procedencias (id, uuid, grupo_datos, nombre, descripcion, activo) VALUES
(1, UUID(), 1001, 'Ecuador - Guayaquil (Nauplios)', 'Nauplios importados con certificacion sanitaria', TRUE),
(2, UUID(), 1001, 'Costa Rica - Isla Chira', 'Lote de reproductores locales aclimatados', TRUE),
(3, UUID(), 1002, 'Panama - Pedasi', 'Cepas resistentes a bajas salinidades', TRUE);

-- ------------------------------------------------------------------------------
-- 18. TABLA: proveedores_larva
-- ------------------------------------------------------------------------------
INSERT INTO proveedores_larva (id, uuid, grupo_datos, nombre, descripcion, activo) VALUES
(1, UUID(), 1001, 'Comercializadora de Larvas Nicoya S.A.', 'Suministro directo de PL-12 con PCR negativo', TRUE),
(2, UUID(), 1002, 'Larvas Marinas Peninsulares', 'Proveedor regional Guanacaste', TRUE);

-- ------------------------------------------------------------------------------
-- 19. TABLA: lotes_larva
-- ------------------------------------------------------------------------------
INSERT INTO lotes_larva (id, uuid, grupo_datos, codigo_lote, proveedor_larva_id, laboratorio_id, procedencia_id, certificado_larva, pl_inicial, cantidad_inicial, fecha_ingreso, estado_lote, activo) VALUES
(1, UUID(), 1001, 'LOT-2026-05A', 1, 1, 1, 'CERT-PCR-2026-889', 10, 1500000, '2026-05-01', 'Sembrado', TRUE),
(2, UUID(), 1001, 'LOT-2026-06B', 1, 2, 2, 'CERT-PCR-2026-902', 12, 800000, '2026-06-01', 'En PreCria', TRUE),
(3, UUID(), 1002, 'LOT-SUR-01', 2, 3, 3, 'CERT-PAN-4412', 11, 2000000, '2026-04-10', 'Agotado', TRUE);

-- ------------------------------------------------------------------------------
-- 20. TABLA: precrias
-- ------------------------------------------------------------------------------
INSERT INTO precrias (id, uuid, grupo_datos, lote_larva_id, finca_id, estanque_id, fecha_inicio, fecha_fin, duracion_dias, cantidad_inicial, cantidad_final, pl_inicial, pl_final, estado, activo) VALUES
(1, UUID(), 1001, 2, 1, 2, '2026-06-01', '2026-06-21', 20, 800000, 740000, 12, 25, 'Finalizada', TRUE);

-- ------------------------------------------------------------------------------
-- 21. TABLA: siembras
-- ------------------------------------------------------------------------------
INSERT INTO siembras (id, uuid, grupo_datos, lote_larva_id, precria_id, finca_id, estanque_id, fecha_siembra, tecnica_cultivo, densidad_poblacional, cantidad_sembrada, pl_siembra, duracion_ciclo, estado, activo) VALUES
(1, UUID(), 1001, 1, NULL, 1, 1, '2026-05-10', 'Semi-intensivo monofasico', 15.00, 1500000, 10, 100, 'Activa', TRUE),
(2, UUID(), 1001, 2, 1, 1, 1, '2026-06-22', 'Bifasico trasplante precria', 14.80, 740000, 25, 80, 'Activa', TRUE);

-- ------------------------------------------------------------------------------
-- 22. TABLA: crecimientos
-- ------------------------------------------------------------------------------
INSERT INTO crecimientos (id, uuid, grupo_datos, finca_id, estanque_id, colaborador_id, fecha_registro, peso_actual, activo) VALUES
(1, UUID(), 1001, 1, 1, 2, '2026-06-01', 4.50, TRUE),
(2, UUID(), 1001, 1, 1, 2, '2026-06-15', 7.80, TRUE),
(3, UUID(), 1001, 1, 1, 2, '2026-07-01', 11.20, TRUE),
(4, UUID(), 1001, 1, 1, 2, '2026-07-15', 14.60, TRUE);

-- ------------------------------------------------------------------------------
-- 23. TABLA: compradores
-- ------------------------------------------------------------------------------
INSERT INTO compradores (id, uuid, grupo_datos, nombre, contacto, telefono, correo, direccion, notas, estado, activo) VALUES
(1, UUID(), 1001, 'Empacadora Mariscos del Pacifico S.A.', 'Jorge Arguedas', '+506 2663-9900', 'compras@mariscospacifico.com', 'Puerto Caldera, Puntarenas', 'Comprador habitual para exportacion a EE.UU.', 'ACTIVO', TRUE),
(2, UUID(), 1001, 'Distribuidora Gastronomica del Valle', 'Carmen Solis', '+506 2222-7777', 'csolis@disgastro.cr', 'Mercado Cenada, Heredia', 'Compra tallos medianos para mercado local', 'ACTIVO', TRUE);

-- ------------------------------------------------------------------------------
-- 24. TABLA: ventas
-- ------------------------------------------------------------------------------
INSERT INTO ventas (id, uuid, grupo_datos, finca_id, estanque_id, colaborador_id, comprador_id, peso_promedio, tamano_promedio, cantidad_vendida, precio_kilo, total, fecha, activo) VALUES
(1, UUID(), 1001, 1, 1, 1, 1, 15.20, 60.00, 3500.00, 3200.00, 11200000.00, '2026-07-25', TRUE);

-- ------------------------------------------------------------------------------
-- 25. TABLA: parasitologias
-- ------------------------------------------------------------------------------
INSERT INTO parasitologias (id, uuid, grupo_datos, finca_id, estanque_id, colaborador_id, tipo_registro, fecha_reporte, responsable, parasito, camarones_muestreados, camarones_infectados, porcentaje_infeccion, grado_infeccion, observaciones, activo) VALUES
(1, UUID(), 1001, 1, 1, 2, 'Rutina Semanal', '2026-07-12', 'Dra. Laura Sanchez', 'gregarina', 50, 4, 8.00, 'bajo', 'Presencia leve de gregarinas en intestino medio. Sin impacto en consumo de alimento.', TRUE);

-- ------------------------------------------------------------------------------
-- 26. TABLA: enfermedades
-- ------------------------------------------------------------------------------
INSERT INTO enfermedades (id, uuid, grupo_datos, finca_id, estanque_id, colaborador_id, tipo_registro, fecha_reporte, responsable, enfermedad, severidad, mortalidad_registrada, reporte, activo) VALUES
(1, UUID(), 1001, 1, 1, 2, 'Muestreo Preventivo PCR', '2026-07-15', 'Dra. Laura Sanchez', 'Vibriosis', 'medio', 120, 'Se detecta leve incremento de colonias amarillas en agar TCBS. Se aplica probiotico bacteriano en agua.', TRUE);

-- ------------------------------------------------------------------------------
-- 27. TABLA: alimentaciones
-- ------------------------------------------------------------------------------
INSERT INTO alimentaciones (id, uuid, grupo_datos, finca_id, estanque_id, colaborador_id, proveedor_id, producto_id, fecha, hora, metodo, cantidad_kg, presentacion, proveedor, tipo_alimento, observaciones, activo) VALUES
(1, UUID(), 1001, 1, 1, 1, 1, 1, '2026-07-28', '07:00', 'Automatico', 45.00, 'Saco 25kg', 'Nicovita', '35% Proteina 2.0mm', 'Primera racion de la manana. Respuesta fuerte en comederos.', TRUE),
(2, UUID(), 1001, 1, 1, 1, 1, 1, '2026-07-28', '13:00', 'Automatico', 45.00, 'Saco 25kg', 'Nicovita', '35% Proteina 2.0mm', 'Segunda racion. Ajuste de pulso por temperatura alta.', TRUE);

-- ------------------------------------------------------------------------------
-- 28. TABLA: densidad_poblacional
-- ------------------------------------------------------------------------------
INSERT INTO densidad_poblacional (id, uuid, grupo_datos, finca_id, estanque_id, colaborador_id, fecha, cantidad_siembra, area_estanque, numero_camarones, tiros_atarraya, area_atarraya, promedio_por_tiro, sobrevivencia, densidad, notas_conteo, activo) VALUES
(1, UUID(), 1001, 1, 1, 1, '2026-07-20', 1500000, 5000.00, 1125000, 10, 3.14, 22.50, 75.00, 11.25, 'Conteo mediante atarrayado circular de 2m de diametro. Buena distribucion uniforme.', TRUE);

-- ------------------------------------------------------------------------------
-- 29. TABLA: raleos
-- ------------------------------------------------------------------------------
INSERT INTO raleos (id, uuid, grupo_datos, finca_id, estanque_id, colaborador_id, fecha, porcentaje, peso_estimado, biomasa_estimada, objetivo, metodos, observaciones, activo) VALUES
(1, UUID(), 1001, 1, 1, 1, '2026-07-24', '15%', 14.50, 16300.00, 'Bajar carga biologica para alcanzar talla de exportacion (18g)', 'Atarraya comederos y copos', 'Raleo parcial nocturno sin inconvenientes de temperatura.', TRUE);

-- ------------------------------------------------------------------------------
-- 30. TABLA: fisico_quimico
-- ------------------------------------------------------------------------------
INSERT INTO fisico_quimico (id, uuid, grupo_datos, finca_id, estanque_id, fecha_registro, activo) VALUES
(1, UUID(), 1001, 1, 1, '2026-07-28', TRUE),
(2, UUID(), 1001, 1, 2, '2026-07-28', TRUE);

-- ------------------------------------------------------------------------------
-- 31. TABLA: fisico_quimico_detalle
-- ------------------------------------------------------------------------------
INSERT INTO fisico_quimico_detalle (id, uuid, lectura_id, tipo_medicion, etiqueta, valor, activo) VALUES
(1, UUID(), 1, 'oxigeno', 'Manana (05:00)', 4.80, TRUE),
(2, UUID(), 1, 'oxigeno', 'Tarde (16:00)', 7.20, TRUE),
(3, UUID(), 1, 'ph', 'Manana (05:00)', 7.60, TRUE),
(4, UUID(), 1, 'ph', 'Tarde (16:00)', 8.10, TRUE),
(5, UUID(), 1, 'temperatura', 'Manana (05:00)', 27.50, TRUE),
(6, UUID(), 1, 'temperatura', 'Tarde (16:00)', 30.20, TRUE),
(7, UUID(), 1, 'salinidad', 'Manana (05:00)', 25.00, TRUE),
(8, UUID(), 2, 'oxigeno', 'Manana (05:00)', 5.20, TRUE),
(9, UUID(), 2, 'ph', 'Manana (05:00)', 7.80, TRUE);

-- ------------------------------------------------------------------------------
-- 32. TABLA: trazabilidad
-- ------------------------------------------------------------------------------
INSERT INTO trazabilidad (id, uuid, grupo_datos, finca_id, estanque_origen_id, estanque_destino_id, colaborador_id, fecha, tamano, dias, pl, tipo_movimiento, activo) VALUES
(1, UUID(), 1001, 1, 2, 1, 1, '2026-06-22', 1.20, 20, 25, 'Trasplante de Precria a Engorde', TRUE);

-- ------------------------------------------------------------------------------
-- 33. TABLA: refresh_tokens
-- ------------------------------------------------------------------------------
INSERT INTO refresh_tokens (id, uuid, usuario_id, colaborador_id, token, expira_en, activo) VALUES
(1, UUID(), 1, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzIwMDAwMDAwfQ.mock_token_admin_123456789', '2026-08-28 13:43:00', TRUE),
(2, UUID(), NULL, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzIwMDAwMDAwfQ.mock_token_collab_987654321', '2026-08-15 10:00:00', TRUE);

-- Reactivar verificacion de claves foraneas
SET FOREIGN_KEY_CHECKS = 1;