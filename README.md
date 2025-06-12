# API para Sistema de Gestión de Taller Mecánico

Este repositorio contiene el backend para un sistema de gestión de taller, construido con Node.js, Express y una arquitectura de base de datos distribuida sobre PostgreSQL. El objetivo principal es simular un entorno empresarial real donde los datos se fragmentan geográficamente para mejorar el rendimiento y la disponibilidad local.

---

## Arquitectura de la Base de Datos

El núcleo de este proyecto es su **base de datos distribuida**, fragmentada en tres nodos que representan diferentes sucursales:

1.  **Nodo 1 (Quito):** Es el nodo principal. Aloja:
    * Tablas de catálogo y centralizadas (ej. `vehiculos`, `servicios`, `productos`).
    * Fragmentos de datos que pertenecen únicamente a la sucursal de Quito.
    * **Vistas globales** (`clientes_global`, `ordenes_trabajo_global`) que unifican los datos de todos los nodos.
    * **Triggers y funciones** para mantener la integridad referencial a través de los nodos.

2.  **Nodo 2 (Guayaquil):** Nodo secundario que aloja únicamente los fragmentos de datos de la sucursal de Guayaquil.

3.  **Nodo 3 (Cuenca):** Nodo secundario que aloja únicamente los fragmentos de datos de la sucursal de Cuenca.

Se utiliza una estrategia de **fragmentación mixta**:

* **Horizontal:** Para tablas como `ordenes_trabajo` e `inventario`, divididas por `ciudad_id`.
* **Vertical y Horizontal:** Para `clientes` y `empleados`, que se dividen primero por tipo de información y luego por ciudad.

---

## Tecnologías Utilizadas

* **Backend:** Node.js
* **Framework:** Express.js
* **Base de Datos:** PostgreSQL
* **Driver de PostgreSQL:** `node-postgres` (pg)
* **Gestión de Peticiones:** `cors`
* **Variables de Entorno:** `dotenv`
* **Desarrollo:** `nodemon`

---

## Instalación y Puesta en Marcha

Sigue estos pasos para levantar el entorno de desarrollo local.

### Prerrequisitos

* Node.js (v16 o superior)
* NPM (generalmente se instala con Node.js)
* Tener 3 instancias de PostgreSQL accesibles en la red, representando cada nodo.

### 1. Preparar la Base de Datos
Antes de iniciar el backend, es **imprescindible** que las bases de datos estén correctamente configuradas y pobladas. Sigue la guía de ejecución de los scripts SQL del proyecto:
1.  Carga el script de datos centralizados en cada nodo.
2.  Ejecuta los scripts de fragmentación en el orden correcto (Nodo 2, Nodo 3, y finalmente Nodo 1).
3.  Ejecuta los scripts de limpieza para eliminar las tablas temporales.

### 2. Configurar el Backend
1.  Clona este repositorio.
2.  Navega a la carpeta `/backend`.
3.  Crea un archivo llamado `.env` en la raíz de `/backend`. Copia el contenido del archivo de configuración y rellena las credenciales y direcciones IP/puertos de tus 3 instancias de PostgreSQL.
4.  Instala las dependencias del proyecto ejecutando:
    ```bash
    npm install
    ```

### 3. Iniciar el Servidor
Para iniciar el servidor en modo de desarrollo (con reinicio automático al detectar cambios), ejecuta:
```bash
npm run dev
```
Si todo está correcto, verás un mensaje en la consola:Servidor corriendo en http://localhost:5000

### Estructura del Proyecto/backend/
```bash
├── /config/
│   └── db.js         # Configuración de los pools de conexión a cada nodo
├── /controllers/
│   └── *.js          # Lógica de negocio y consultas SQL
├── /routes/
│   └── *.js          # Definición de los endpoints de la API
├── .env              # Variables de entorno (¡No subir a Git!)
├── package.json
└── server.js         # Punto de entrada de la aplicación Express
```
### Endpoints Principales de la API
MétodoEndpointDescripción
* GET/api/clientes: Obtiene una lista de todos los clientes de todos los nodos.
* POST/api/clientes: Crea un nuevo cliente en el nodo correspondiente a su ciudad_id.
* GET/api/clientes/{cedula}: Busca un cliente por su cédula en todos los nodos.
* GET/api/vehiculos: Obtiene todos los vehículos (tabla centralizada en Nodo 1).
* POST/api/vehiculos: Crea un nuevo vehículo. El trigger en la BD valida que el cliente exista.
* GET/api/ordenes: Obtiene una lista de todas las órdenes de todos los nodos.
* POST/api/ordenes: Crea una nueva orden de trabajo (transacción distribuida).
* GET/api/catalogos/servicios: Obtiene la lista de todos los servicios disponibles.
* GET/api/catalogos/ciudades: Obtiene la lista de ciudades (sucursales).
* GET/api/catalogos/tipos-vehiculo: Obtiene la lista de tipos de vehiculos.