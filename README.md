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
node src/index.js <ruta-al-backend>
```

Postmation buscará las rutas en:

```text
../<ruta-al-backend>/src/routes/
```

y generará:

```text
output/collection.json
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
├── GET /
├── GET /:id
├── POST /nuevo
└── DELETE /:id
```

Las rutas completas serán:

```text
GET    {{baseUrl}}/api/usuario/
GET    {{baseUrl}}/api/usuario/:id
POST   {{baseUrl}}/api/usuario/nuevo
DELETE {{baseUrl}}/api/usuario/:id
```

## Configuración de las requests

Postmation se encarga únicamente de generar la estructura básica de cada request.

La configuración específica queda a cargo del usuario:

* Headers
* Autenticación
* JWT
* Body
* Query parameters
* Variables adicionales

Esto permite utilizar Postmation con diferentes APIs sin asumir cómo está configurada su autenticación o qué datos requiere cada endpoint.

## Estructura del proyecto

```text
postmation/
├── src/
│   └── index.js
├── output/
│   └── collection.json
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
* [ ] Permitir configurar la URL base desde la línea de comandos
* [ ] Agregar opciones de configuración mediante archivo
* [ ] Agregar tests automatizados
* [ ] Mejorar mensajes y manejo de errores
* [ ] Publicar como paquete CLI de npm

## Licencia

Este proyecto se distribuye bajo la licencia MIT.
