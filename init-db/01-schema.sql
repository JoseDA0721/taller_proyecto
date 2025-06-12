-- =====================================================================
-- 01-SCHEMA.SQL: CREACIÓN DE TODAS LAS TABLAS EN CADA NODO
-- =====================================================================
-- Este script se ejecuta en los 3 nodos para asegurar que la
-- estructura completa de la base de datos exista en todas partes
-- antes de la inserción de datos y la configuración de FDW.
-- =====================================================================

-- Habilitar la extensión necesaria en cada nodo
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

--- TABLAS CENTRALIZADAS (Solo se usarán en Nodo 1, pero se crean en todos)
CREATE TABLE ciudades (id_ciudad INT PRIMARY KEY, nombre VARCHAR);
CREATE TABLE formas_pago (forma_pago_id INT PRIMARY KEY, metodo VARCHAR);
CREATE TABLE tipos_vehiculos (tipo_id INT PRIMARY KEY, nombre VARCHAR);
CREATE TABLE productos (producto_id INT PRIMARY KEY, nombre VARCHAR, precio INT);
CREATE TABLE servicios (servicio_id INT PRIMARY KEY, nombre VARCHAR, precio NUMERIC);
CREATE TABLE servicio_productos (id SERIAL PRIMARY KEY, servicio_id INT, producto_id INT, cantidad INT);
CREATE TABLE vehiculos (placa VARCHAR PRIMARY KEY, tipo_id INT, marca VARCHAR, modelo VARCHAR, cliente_cedula VARCHAR);
CREATE TABLE detalles_orden (detalle_id SERIAL PRIMARY KEY, orden_id INT, servicio_id INT, producto_id INT, cantidad INT, precio NUMERIC);

--- FRAGMENTOS NODO 1 (QUITO)
CREATE TABLE info_clientes_quito (cedula VARCHAR PRIMARY KEY, nombre VARCHAR, ciudad_id INT);
CREATE TABLE telefono_clientes_quito (cedula VARCHAR PRIMARY KEY, telefono VARCHAR);
CREATE TABLE correo_clientes_quito (cedula VARCHAR PRIMARY KEY, correo VARCHAR);
CREATE TABLE info_empleados_quito (empleado_id INT PRIMARY KEY, nombre VARCHAR, ciudad_id INT);
CREATE TABLE rol_empleados_quito (empleado_id INT PRIMARY KEY, rol VARCHAR);
CREATE TABLE ordenes_trabajo_quito (orden_id SERIAL PRIMARY KEY, cliente_cedula VARCHAR, placa VARCHAR, fecha DATE, estado VARCHAR, ciudad_id INT, empleado_id INT, form_pago_id INT);
CREATE TABLE inventario_quito (inventario_id INT PRIMARY KEY, producto_id INT, ciudad_id INT, stock INT);

--- FRAGMENTOS NODO 2 (GUAYAQUIL)
CREATE TABLE info_clientes_guayaquil (cedula VARCHAR PRIMARY KEY, nombre VARCHAR, ciudad_id INT);
CREATE TABLE telefono_clientes_guayaquil (cedula VARCHAR PRIMARY KEY, telefono VARCHAR);
CREATE TABLE correo_clientes_guayaquil (cedula VARCHAR PRIMARY KEY, correo VARCHAR);
CREATE TABLE info_empleados_guayaquil (empleado_id INT PRIMARY KEY, nombre VARCHAR, ciudad_id INT);
CREATE TABLE rol_empleados_guayaquil (empleado_id INT PRIMARY KEY, rol VARCHAR);
CREATE TABLE ordenes_trabajo_guayaquil (orden_id SERIAL PRIMARY KEY, cliente_cedula VARCHAR, placa VARCHAR, fecha DATE, estado VARCHAR, ciudad_id INT, empleado_id INT, form_pago_id INT);
CREATE TABLE inventario_guayaquil (inventario_id INT PRIMARY KEY, producto_id INT, ciudad_id INT, stock INT);

--- FRAGMENTOS NODO 3 (CUENCA)
CREATE TABLE info_clientes_cuenca (cedula VARCHAR PRIMARY KEY, nombre VARCHAR, ciudad_id INT);
CREATE TABLE telefono_clientes_cuenca (cedula VARCHAR PRIMARY KEY, telefono VARCHAR);
CREATE TABLE correo_clientes_cuenca (cedula VARCHAR PRIMARY KEY, correo VARCHAR);
CREATE TABLE info_empleados_cuenca (empleado_id INT PRIMARY KEY, nombre VARCHAR, ciudad_id INT);
CREATE TABLE rol_empleados_cuenca (empleado_id INT PRIMARY KEY, rol VARCHAR);
CREATE TABLE ordenes_trabajo_cuenca (orden_id SERIAL PRIMARY KEY, cliente_cedula VARCHAR, placa VARCHAR, fecha DATE, estado VARCHAR, ciudad_id INT, empleado_id INT, form_pago_id INT);
CREATE TABLE inventario_cuenca (inventario_id INT PRIMARY KEY, producto_id INT, ciudad_id INT, stock INT);

