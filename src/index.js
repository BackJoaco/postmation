import fs from "fs";
import path from "path";

const backendPath = process.argv[2];

if (!backendPath) {
  console.error("Uso: node src/index.js <ruta-backend>");
  process.exit(1);
}

const routesPath = path.resolve(backendPath, "src/routes");
const outputPath = path.resolve("output/collection.json");

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

    requests.push({
      name: `${method} ${route}`,
      request: {
        method,
        header: [],
        url: `{{baseUrl}}${fullPath}`,
      },
    });
  }

  folders.push({
    name: resource,
    item: requests,
  });
}

const collection = {
  info: {
    name: "Backend API",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    {
      key: "baseUrl",
      value: "http://localhost:3000",
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
console.log(`Endpoints encontrados: ${folders.length}`);