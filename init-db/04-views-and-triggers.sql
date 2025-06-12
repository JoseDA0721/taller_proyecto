-- =====================================================================
-- 04-VIEWS-AND-TRIGGERS.SQL: CREACIÓN DE VISTAS Y TRIGGERS GLOBALES
-- =====================================================================
-- Este script se ejecuta en todos los nodos, pero solo tendrá
-- efecto real en el Nodo 1, donde residen las tablas
-- 'vehiculos' y 'detalles_orden'.
-- =====================================================================

-- Vista Global de Clientes
CREATE OR REPLACE VIEW clientes_global AS
SELECT cedula, nombre, ciudad_id FROM info_clientes_quito
UNION ALL
SELECT cedula, nombre, ciudad_id FROM info_clientes_guayaquil
UNION ALL
SELECT cedula, nombre, ciudad_id FROM info_clientes_cuenca;

-- Trigger para validar FK en 'vehiculos'
CREATE OR REPLACE FUNCTION check_cliente_exists() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clientes_global WHERE cedula = NEW.cliente_cedula) THEN
        RAISE EXCEPTION 'La cédula % no existe en la vista global de clientes', NEW.cliente_cedula;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_cliente_before_insert_update
BEFORE INSERT OR UPDATE ON vehiculos
FOR EACH ROW EXECUTE FUNCTION check_cliente_exists();

-- Vista Global de Órdenes de Trabajo
CREATE OR REPLACE VIEW ordenes_trabajo_global AS
SELECT orden_id, cliente_cedula, placa, ciudad_id FROM ordenes_trabajo_quito
UNION ALL
SELECT orden_id, cliente_cedula, placa, ciudad_id FROM ordenes_trabajo_guayaquil
UNION ALL
SELECT orden_id, cliente_cedula, placa, ciudad_id FROM ordenes_trabajo_cuenca;

-- Trigger para validar FK en 'detalles_orden'
CREATE OR REPLACE FUNCTION check_orden_exists() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM ordenes_trabajo_global WHERE orden_id = NEW.orden_id) THEN
        RAISE EXCEPTION 'La orden_id % no existe en la vista global de órdenes de trabajo', NEW.orden_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_orden_before_insert_update
BEFORE INSERT OR UPDATE ON detalles_orden
FOR EACH ROW EXECUTE FUNCTION check_orden_exists();
