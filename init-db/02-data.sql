-- =====================================================================
-- 02-DATA.SQL: INSERCIÓN DE DATOS EN CADA NODO
-- =====================================================================
-- Este script inserta los datos de catálogo en las tablas
-- centralizadas y los datos transaccionales en los fragmentos
-- correspondientes de cada nodo.
-- =====================================================================

--- DATOS PARA TABLAS CENTRALIZADAS (CATÁLOGOS)
INSERT INTO ciudades (id_ciudad, nombre) VALUES (1, 'Quito'), (2, 'Guayaquil'), (3, 'Cuenca');
INSERT INTO formas_pago (forma_pago_id, metodo) VALUES (1, 'Efectivo'), (2, 'Tarjeta de Crédito'), (3, 'Transferencia Bancaria');
INSERT INTO tipos_vehiculos (tipo_id, nombre) VALUES (1, 'Sedán'), (2, 'SUV'), (3, 'Camioneta');
INSERT INTO productos (producto_id, nombre, precio) VALUES
(1, 'Aceite de Motor 10W-30', 25), (2, 'Filtro de Aceite', 8), (3, 'Filtro de Aire', 15), (4, 'Bujía de Iridio', 12), (5, 'Pastillas de Freno Delanteras', 45), (6, 'Pastillas de Freno Traseras', 40), (7, 'Disco de Freno', 60), (8, 'Batería 12V', 110), (9, 'Líquido de Frenos DOT4', 9), (10, 'Refrigerante 50/50', 20), (11, 'Amortiguador Delantero', 80), (12, 'Amortiguador Trasero', 75), (13, 'Neumático 205/55 R16', 95), (14, 'Kit de Embrague', 250), (15, 'Correa de Distribución', 55), (16, 'Bomba de Agua', 70), (17, 'Termostato', 22), (18, 'Radiador', 180), (19, 'Alternador', 220), (20, 'Motor de Arranque', 190), (21, 'Faro Delantero Halógeno', 65), (22, 'Luz Trasera LED', 50), (23, 'Plumillas Limpiaparabrisas (par)', 18), (24, 'Sensor de Oxígeno', 48), (25, 'Válvula EGR', 90), (26, 'Inyector de Combustible', 130), (27, 'Bomba de Combustible', 150), (28, 'Rodamiento de Rueda', 42), (29, 'Junta Homocinética', 85), (30, 'Soporte de Motor', 60);
INSERT INTO servicios (servicio_id, nombre, precio) VALUES
(1, 'Cambio de Aceite y Filtro', 35.00), (2, 'Alineación y Balanceo', 40.00), (3, 'Revisión de Frenos', 25.00), (4, 'Cambio de Pastillas de Freno', 50.00), (5, 'Rectificación de Discos de Freno', 60.00), (6, 'Sincronización de Motor', 80.00), (7, 'Limpieza de Inyectores', 70.00), (8, 'Cambio de Batería', 20.00), (9, 'Revisión Sistema Eléctrico', 45.00), (10, 'Cambio de Amortiguadores (par)', 90.00), (11, 'Cambio de Llantas (por llanta)', 15.00), (12, 'Reparación de Fuga de Refrigerante', 100.00), (13, 'Cambio de Kit de Embrague', 300.00), (14, 'Cambio de Correa de Distribución', 250.00), (15, 'Diagnóstico con Escáner', 30.00), (16, 'Mantenimiento Preventivo 10.000km', 120.00), (17, 'Mantenimiento Preventivo 50.000km', 280.00), (18, 'Reparación de Aire Acondicionado', 150.00), (19, 'Carga de Gas de Aire Acondicionado', 65.00), (20, 'Cambio de Radiador', 130.00), (21, 'Reparación de Alternador', 110.00), (22, 'Cambio de Motor de Arranque', 100.00), (23, 'Lavado de Chasis y Motor', 25.00), (24, 'Revisión Pre-Viaje', 35.00), (25, 'Cambio de Bomba de Combustible', 180.00), (26, 'Reparación de Dirección', 220.00), (27, 'Cambio de Soportes de Motor', 95.00), (28, 'Reparación de Caja de Cambios', 500.00), (29, 'Pulida de Faros', 30.00), (30, 'Revisión de Gases', 20.00);

--- DATOS PARA LA TABLA DE RELACIÓN SERVICIO-PRODUCTO ---
INSERT INTO servicio_productos (servicio_id, producto_id, cantidad) VALUES (1, 1, 1), (1, 2, 1), (4, 5, 1), (4, 9, 1), (5, 7, 2), (5, 9, 1), (6, 4, 4), (6, 3, 1), (8, 8, 1), (10, 11, 2), (11, 13, 1), (12, 10, 1), (13, 14, 1), (14, 15, 1), (14, 16, 1), (20, 18, 1), (20, 10, 1), (22, 20, 1), (25, 27, 1), (27, 30, 1);

--- DATOS PARA FRAGMENTOS DE QUITO (ciudad_id = 1) ---
INSERT INTO info_clientes_quito (cedula, nombre, ciudad_id) VALUES ('1712345678', 'Ana Paredes', 1);
INSERT INTO telefono_clientes_quito (cedula, telefono) VALUES ('1712345678', '0991234567');
INSERT INTO correo_clientes_quito (cedula, correo) VALUES ('1712345678', 'ana.p@mail.com');
INSERT INTO info_empleados_quito (empleado_id, nombre, ciudad_id) VALUES (1, 'Carlos Andrade', 1);
INSERT INTO rol_empleados_quito (empleado_id, rol) VALUES (1, 'Gerente de Taller');
INSERT INTO inventario_quito (inventario_id, producto_id, ciudad_id, stock) VALUES (1, 1, 1, 50);

--- DATOS PARA FRAGMENTOS DE GUAYAQUIL (ciudad_id = 2) ---
INSERT INTO info_clientes_guayaquil (cedula, nombre, ciudad_id) VALUES ('0912345678', 'Carlos Mendoza', 2);
INSERT INTO telefono_clientes_guayaquil (cedula, telefono) VALUES ('0912345678', '0987654321');
INSERT INTO correo_clientes_guayaquil (cedula, correo) VALUES ('0912345678', 'carlos.m@mail.com');
INSERT INTO info_empleados_guayaquil (empleado_id, nombre, ciudad_id) VALUES (31, 'Juan Alvear', 2);
INSERT INTO rol_empleados_guayaquil (empleado_id, rol) VALUES (31, 'Gerente de Sucursal');
INSERT INTO inventario_guayaquil (inventario_id, producto_id, ciudad_id, stock) VALUES (31, 1, 2, 60);

--- DATOS PARA FRAGMENTOS DE CUENCA (ciudad_id = 3) ---
INSERT INTO info_clientes_cuenca (cedula, nombre, ciudad_id) VALUES ('0101234567', 'Adriana Cordero', 3);
INSERT INTO telefono_clientes_cuenca (cedula, telefono) VALUES ('0101234567', '0992345678');
INSERT INTO correo_clientes_cuenca (cedula, correo) VALUES ('0101234567', 'adriana.c@mail.com');
INSERT INTO info_empleados_cuenca (empleado_id, nombre, ciudad_id) VALUES (61, 'Alberto Mora', 3);
INSERT INTO rol_empleados_cuenca (empleado_id, rol) VALUES (61, 'Mecánico A');
INSERT INTO inventario_cuenca (inventario_id, producto_id, ciudad_id, stock) VALUES (61, 1, 3, 45);

--- DATOS PARA LA TABLA CENTRALIZADA 'vehiculos' (Se insertan todos) ---
INSERT INTO vehiculos (placa, tipo_id, marca, modelo, cliente_cedula) VALUES
('PBA-0101', 1, 'Chevrolet', 'Sail', '1712345678'),
('GBA-0201', 2, 'Kia', 'Seltos', '0912345678'),
('ABA-0301', 1, 'Chevrolet', 'Beat', '0101234567');
