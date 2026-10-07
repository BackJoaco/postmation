import fs from "fs";
import path from "path";

function printUsage() {
  console.log(`
Uso: node src/index.js <ruta-backend> [opciones]

Opciones:
  -u, --url <url>        URL base o host personalizado (por defecto: localhost)
  -p, --port <puerto>    Puerto del servidor (por defecto: 8086)
  -n, --name <nombre>    Nombre personalizado para la colección (por defecto: nombre del backend)
  -o, --output <archivo> Ruta del archivo de salida (por defecto: output/<nombre-backend>.json)
  -h, --help             Muestra la ayuda de uso

Ejemplos:
  node src/index.js ../mi-backend
  node src/index.js ../mi-backend -p 8087
  node src/index.js ../mi-backend --url https://api.midominio.com
  node src/index.js ../mi-backend -u http://192.168.1.50 -p 8087
  node src/index.js ../mi-backend -n "Mi API"
`);
}

function parseArguments(argv) {
  const args = argv.slice(2);
  let backendPath = null;
  let customUrl = null;
  let customPort = null;
  let customName = null;
  let customOutput = null;
  let showHelp = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      showHelp = true;
    } else if (arg === "-p" || arg === "--port") {
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        customPort = args[++i];
      } else {
        console.error(`Error: Se requiere un valor para el puerto después de ${arg}`);
        process.exit(1);
      }
    } else if (arg.startsWith("-p=")) {
      customPort = arg.slice(3);
    } else if (arg.startsWith("--port=")) {
      customPort = arg.slice(7);
    } else if (arg === "-u" || arg === "--url" || arg === "--host") {
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        customUrl = args[++i];
      } else {
        console.error(`Error: Se requiere un valor para la URL después de ${arg}`);
        process.exit(1);
      }
    } else if (arg.startsWith("-u=")) {
      customUrl = arg.slice(3);
    } else if (arg.startsWith("--url=")) {
      customUrl = arg.slice(6);
    } else if (arg.startsWith("--host=")) {
      customUrl = arg.slice(7);
    } else if (arg === "-n" || arg === "--name") {
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        customName = args[++i];
      } else {
        console.error(`Error: Se requiere un valor para el nombre después de ${arg}`);
        process.exit(1);
      }
    } else if (arg.startsWith("-n=")) {
      customName = arg.slice(3);
    } else if (arg.startsWith("--name=")) {
      customName = arg.slice(7);
    } else if (arg === "-o" || arg === "--output") {
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        customOutput = args[++i];
      } else {
        console.error(`Error: Se requiere un valor para la ruta de salida después de ${arg}`);
        process.exit(1);
      }
    } else if (arg.startsWith("-o=")) {
      customOutput = arg.slice(3);
    } else if (arg.startsWith("--output=")) {
      customOutput = arg.slice(9);
    } else if (!arg.startsWith("-")) {
      if (!backendPath) {
        backendPath = arg;
      }
    } else {
      console.error(`Error: Opción desconocida '${arg}'`);
      printUsage();
      process.exit(1);
    }
  }

  return { backendPath, customUrl, customPort, customName, customOutput, showHelp };
}

function getBackendName(backendPath) {
  let resolvedPath = path.resolve(backendPath);

  if (path.basename(resolvedPath) === "routes") {
    resolvedPath = path.dirname(resolvedPath);
  }
  if (path.basename(resolvedPath) === "src") {
    resolvedPath = path.dirname(resolvedPath);
  }

  const pkgPath = path.join(resolvedPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (pkg.name && typeof pkg.name === "string" && pkg.name.trim()) {
        return pkg.name.trim();
      }
    } catch {
      // Fallback al nombre del directorio
    }
  }

  return path.basename(resolvedPath) || "Backend API";
}

function resolveBaseUrl(customUrl, customPort) {
  const DEFAULT_HOST = "localhost";
  const DEFAULT_PORT = "8086";

  if (customPort !== null && customPort !== undefined) {
    const portNum = Number(customPort);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      console.error(
        `Error: El puerto debe ser un número entero entre 1 y 65535 (recibido: '${customPort}')`
      );
      process.exit(1);
    }
  }

  if (!customUrl) {
    const port = customPort || DEFAULT_PORT;
    return `http://${DEFAULT_HOST}:${port}`;
  }

  let rawUrl = customUrl.trim().replace(/\/+$/, "");

  const hasProtocol = /^https?:\/\//i.test(rawUrl);
  if (!hasProtocol) {
    rawUrl = `http://${rawUrl}`;
  }

  try {
    const parsed = new URL(rawUrl);

    if (customPort) {
      parsed.port = customPort;
    } else if (!parsed.port) {
      if (!hasProtocol || parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        parsed.port = DEFAULT_PORT;
      }
    }

    let result = `${parsed.protocol}//${parsed.hostname}`;
    if (parsed.port) {
      result += `:${parsed.port}`;
    }
    if (parsed.pathname && parsed.pathname !== "/") {
      result += parsed.pathname.replace(/\/+$/, "");
    }
    return result;
  } catch {
    if (customPort && !rawUrl.includes(`:${customPort}`)) {
      return `${rawUrl}:${customPort}`;
    }
    return rawUrl;
  }
}

const { backendPath, customUrl, customPort, customName, customOutput, showHelp } =
  parseArguments(process.argv);

if (showHelp) {
  printUsage();
  process.exit(0);
}

if (!backendPath) {
  console.error("Error: Debe especificar la ruta del backend.");
  printUsage();
  process.exit(1);
}

const backendName = customName || getBackendName(backendPath);

let routesPath = path.resolve(backendPath, "src/routes");

if (!fs.existsSync(routesPath)) {
  if (fs.existsSync(path.resolve(backendPath, "routes"))) {
    routesPath = path.resolve(backendPath, "routes");
  } else if (
    fs.existsSync(path.resolve(backendPath)) &&
    fs.statSync(path.resolve(backendPath)).isDirectory()
  ) {
    routesPath = path.resolve(backendPath);
  }
}

const sanitizedFileName = backendName.replace(/[<>:"/\\|?*]+/g, "_");
const outputPath = customOutput
  ? path.resolve(customOutput)
  : path.resolve("output", `${sanitizedFileName}.json`);

if (!fs.existsSync(routesPath)) {
  console.error(`No existe la carpeta de rutas: ${routesPath}`);
  process.exit(1);
}

const files = fs
  .readdirSync(routesPath)
  .filter((file) => file.endsWith(".route.js"));

const folders = [];

for (const file of files) {
  const content = fs.readFileSync(
    path.join(routesPath, file),
    "utf-8"
  );

  const resource = file.replace(".route.js", "");
  const basePath = `/api/${resource}`;

  const regex = /this\.(get|post|put|patch|delete)\(\s*"([^"]*)"/g;

  const requests = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const route = match[2];

    const fullPath =
      route === "/" ? `${basePath}/` : `${basePath}${route}`;

    const request = {
      method,
      header: [],
      url: `{{baseUrl}}${fullPath}`,
    };

    if (method !== "GET") {
      request.body = {
        mode: "raw",
        raw: "{\n  \n}",
        options: {
          raw: {
            language: "json",
          },
        },
      };
    }

    requests.push({
      name: route,
      request,
    });
  }

  folders.push({
    name: resource,
    item: requests,
  });
}

const baseUrl = resolveBaseUrl(customUrl, customPort);

const collection = {
  info: {
    name: backendName,
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    {
      key: "baseUrl",
      value: baseUrl,
    },
  ],
  item: folders,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(
  outputPath,
  JSON.stringify(collection, null, 2)
);

console.log(`Colección generada: ${outputPath}`);
console.log(`Nombre de la colección: ${backendName}`);
console.log(`Base URL configurada: ${baseUrl}`);
console.log(`Endpoints encontrados: ${folders.length}`);