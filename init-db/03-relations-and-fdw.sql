-- =====================================================================
-- 03-RELATIONS-AND-FDW.SQL: CONFIGURACIÓN DE RELACIONES Y FDW
-- =====================================================================
-- Este script se ejecuta en todos los nodos.
-- 1. Crea las llaves foráneas para las tablas locales.
-- 2. Configura los servidores remotos para la comunicación entre nodos.
-- =====================================================================

--- RELACIONES EN NODO 1 (QUITO) ---
ALTER TABLE vehiculos ADD FOREIGN KEY (tipo_id) REFERENCES tipos_vehiculos(tipo_id);
ALTER TABLE detalles_orden ADD FOREIGN KEY (servicio_id) REFERENCES servicios(servicio_id);
ALTER TABLE detalles_orden ADD FOREIGN KEY (producto_id) REFERENCES productos(producto_id);
ALTER TABLE servicio_productos ADD FOREIGN KEY (servicio_id) REFERENCES servicios(servicio_id);
ALTER TABLE servicio_productos ADD FOREIGN KEY (producto_id) REFERENCES productos(producto_id);
ALTER TABLE ordenes_trabajo_quito ADD FOREIGN KEY (cliente_cedula) REFERENCES info_clientes_quito(cedula);
ALTER TABLE ordenes_trabajo_quito ADD FOREIGN KEY (placa) REFERENCES vehiculos(placa);
ALTER TABLE ordenes_trabajo_quito ADD FOREIGN KEY (empleado_id) REFERENCES info_empleados_quito(empleado_id);

--- RELACIONES EN NODO 2 (GUAYAQUIL) ---
-- Este nodo necesita "ver" las tablas de Quito para crear las FK
-- Primero se crean los servidores remotos
CREATE SERVER nodo1_uio_fdw FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'nodo-quito', port '5432', dbname 'taller_db');
CREATE SERVER nodo3_cue_fdw FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'nodo-cuenca', port '5432', dbname 'taller_db');

CREATE USER MAPPING FOR taller_user SERVER nodo1_uio_fdw OPTIONS (user 'taller_user', password 'taller_password_local');
CREATE USER MAPPING FOR taller_user SERVER nodo3_cue_fdw OPTIONS (user 'taller_user', password 'taller_password_local');

-- Importar solo las tablas necesarias para las relaciones
IMPORT FOREIGN SCHEMA public LIMIT TO (vehiculos, productos, formas_pago) FROM SERVER nodo1_uio_fdw INTO public;

-- Ahora sí, crear las relaciones en Guayaquil
ALTER TABLE ordenes_trabajo_guayaquil ADD FOREIGN KEY (cliente_cedula) REFERENCES info_clientes_guayaquil(cedula);
--ALTER TABLE ordenes_trabajo_guayaquil ADD FOREIGN KEY (placa) REFERENCES vehiculos(placa);
ALTER TABLE ordenes_trabajo_guayaquil ADD FOREIGN KEY (empleado_id) REFERENCES info_empleados_guayaquil(empleado_id);
--ALTER TABLE inventario_guayaquil ADD FOREIGN KEY (producto_id) REFERENCES productos(producto_id);

--- RELACIONES EN NODO 3 (CUENCA) ---
-- Similar a Guayaquil, se conecta a Quito
CREATE SERVER nodo1_uio_fdw_cue FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'nodo-quito', port '5432', dbname 'taller_db');
CREATE SERVER nodo2_guay_fdw_cue FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'nodo-guayaquil', port '5432', dbname 'taller_db');

CREATE USER MAPPING FOR taller_user SERVER nodo1_uio_fdw_cue OPTIONS (user 'taller_user', password 'taller_password_local');
CREATE USER MAPPING FOR taller_user SERVER nodo2_guay_fdw_cue OPTIONS (user 'taller_user', password 'taller_password_local');

IMPORT FOREIGN SCHEMA public LIMIT TO (vehiculos, productos, formas_pago) FROM SERVER nodo1_uio_fdw_cue INTO public;

ALTER TABLE ordenes_trabajo_cuenca ADD FOREIGN KEY (cliente_cedula) REFERENCES info_clientes_cuenca(cedula);
--ALTER TABLE ordenes_trabajo_cuenca ADD FOREIGN KEY (placa) REFERENCES vehiculos(placa);
ALTER TABLE ordenes_trabajo_cuenca ADD FOREIGN KEY (empleado_id) REFERENCES info_empleados_cuenca(empleado_id);
--ALTER TABLE inventario_cuenca ADD FOREIGN KEY (producto_id) REFERENCES productos(producto_id);


--- CONFIGURACIÓN FDW FINAL EN NODO 1 ---
-- El nodo 1 necesita ver los fragmentos de los otros nodos para las vistas globales
CREATE SERVER nodo2_guay_fdw_uio FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'nodo-guayaquil', port '5432', dbname 'taller_db');
CREATE SERVER nodo3_cue_fdw_uio FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'nodo-cuenca', port '5432', dbname 'taller_db');

CREATE USER MAPPING FOR taller_user SERVER nodo2_guay_fdw_uio OPTIONS (user 'taller_user', password 'taller_password_local');
CREATE USER MAPPING FOR taller_user SERVER nodo3_cue_fdw_uio OPTIONS (user 'taller_user', password 'taller_password_local');

-- Importar todos los fragmentos remotos
IMPORT FOREIGN SCHEMA public FROM SERVER nodo2_guay_fdw_uio INTO public;
IMPORT FOREIGN SCHEMA public FROM SERVER nodo3_cue_fdw_uio INTO public;

