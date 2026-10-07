# Postmation

Postmation es una herramienta simple para **generar automáticamente una colección de Postman a partir de las rutas de un backend Node.js**.

La idea es evitar tener que crear manualmente cada request en Postman cuando se trabaja con un backend existente.

Postmation funciona de manera independiente: **no modifica el backend, no requiere instalar dependencias en él y no necesita ningún cambio en su `package.json`**.

## Objetivo

Dado un backend con una estructura de rutas como:

```text
backend/
└── src/
    └── routes/
        ├── usuario.route.js
        ├── rol.route.js
        └── permiso.route.js
```

Postmation analiza los archivos y genera una colección compatible con Postman.

Por ejemplo:

```js
// usuario.route.js

this.get("/:id", ...)
this.post("/nuevo", ...)
this.delete("/:id", ...)
```

genera:

```text
GET    /api/usuario/:id
POST   /api/usuario/nuevo
DELETE /api/usuario/:id
```

## Características

* No modifica el backend.
* No requiere dependencias en el backend.
* No requiere modificar su `package.json`.
* Detecta métodos `GET`, `POST`, `PUT`, `PATCH` y `DELETE`.
* Detecta automáticamente las rutas a partir de los archivos `.route.js`.
* Agrupa las requests por recurso.
* Genera una colección compatible con Postman.
* Utiliza `{{baseUrl}}` como URL base configurable.

## Instalación

Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd postmation
```

Instalar las dependencias:

```bash
npm install
```

Actualmente el proyecto busca mantener la mayor cantidad posible de funcionalidades utilizando las APIs nativas de Node.js.

## Uso

Ejecutar Postmation indicando la ubicación del backend:

```bash
node src/index.js <ruta-al-backend> [opciones]
```

Por defecto:
* La URL base generada es `http://localhost:8086`.
* El nombre de la colección y del archivo generado toman automáticamente el **nombre del backend** (a partir de su `package.json` o del nombre de la carpeta).

### Opciones

| Parámetro | Alias | Descripción | Por defecto |
|---|---|---|---|
| `--url <url>` | `-u`, `--host` | URL o host base personalizado | `localhost` |
| `--port <puerto>` | `-p` | Puerto del servidor | `8086` |
| `--name <nombre>` | `-n` | Nombre de la colección | Nombre del backend |
| `--output <archivo>` | `-o` | Ruta del archivo de salida | `output/<nombre-backend>.json` |
| `--help` | `-h` | Muestra la ayuda de uso | |

### Ejemplos

Uso por defecto (`http://localhost:8086` y nombre del backend):

```bash
node src/index.js ../mi-backend
```

Especificar un puerto diferente:

```bash
node src/index.js ../mi-backend -p 8087
```

Especificar una URL específica:

```bash
node src/index.js ../mi-backend --url https://api.midominio.com
```

Especificar una URL y un puerto específicos:

```bash
node src/index.js ../mi-backend -u http://192.168.1.50 -p 8087
```

Especificar un nombre personalizado:

```bash
node src/index.js ../mi-backend -n "Mi API Backend"
```

Postmation buscará las rutas en:

```text
../<ruta-al-backend>/src/routes/
```

y generará:

```text
output/<nombre-del-backend>.json
```

## Ejemplo

Dado el siguiente archivo:

```text
src/routes/usuario.route.js
```

con:

```js
this.get("/", ...)
this.get("/:id", ...)
this.post("/nuevo", ...)
this.delete("/:id", ...)
```

Postmation generará una colección con:

```text
usuario
├── /
├── /:id
├── /nuevo
└── /:id
```

Las rutas completas serán:

```text
GET    {{baseUrl}}/api/usuario/
GET    {{baseUrl}}/api/usuario/:id
POST   {{baseUrl}}/api/usuario/nuevo
DELETE {{baseUrl}}/api/usuario/:id
```

## Configuración de las requests

Postmation genera la estructura básica para cada request:

* **Nombre de la request:** Corresponde a la ruta (ej. `/`, `/:id`, `/nuevo`), sin prefijo de método HTTP.
* **Body:** En todas las requests excepto `GET` (`POST`, `PUT`, `PATCH`, `DELETE`), se configura automáticamente el body en formato `raw` tipo `JSON`.
* **Headers y Autenticación:** Quedan a cargo del usuario para configuraciones específicas (JWT, headers personalizados, query params, etc.).

## Estructura del proyecto

```text
postmation/
├── src/
│   └── index.js
├── output/
│   └── <nombre-backend>.json
├── package.json
└── README.md
```

## Roadmap

* [x] Detectar archivos `.route.js`
* [x] Detectar métodos HTTP
* [x] Generar rutas automáticamente
* [x] Generar colección Postman
* [x] Agrupar requests por recurso
* [ ] Agregar soporte para más estructuras de routers
* [ ] Mejorar el análisis de rutas complejas
* [x] Permitir configurar la URL base desde la línea de comandos
* [ ] Agregar opciones de configuración mediante archivo
* [ ] Agregar tests automatizados
* [ ] Mejorar mensajes y manejo de errores
* [ ] Publicar como paquete CLI de npm

## Licencia

Este proyecto se distribuye bajo la licencia MIT.
