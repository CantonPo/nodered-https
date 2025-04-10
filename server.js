//Declaramos funciones para el servidor HTTP y HTTPS mediante express y la configuración de Node-RED
const fs = require("fs");
const path = require("path");
const express = require("express");
const RED = require("node-red");
const http = require("http");
const https = require("https");

const app = express();

// Ruta de flows.json
let flowsPath; //Almacena la ruta del archivo flows.json
if (process.resourcesPath) {  // Con la condicional if indicamos, en caso de que la aplicación este empaquetada
  flowsPath = path.join(process.resourcesPath, 'flows.json'); // Si la aplicación está empaquetada, usamos la ruta de recursos
} else {
  flowsPath = path.join(__dirname, 'flows.json'); // Si no, usamos la ruta del directorio actual, este codigo nos ayuda 
  // a que si tenemos la aplicación empaquetada, no se rompa el código y actualize el ejcutable al empaquetar
}

if (!fs.existsSync(flowsPath)) { // Verificamos si el archivo flows.json existe
  // Si no existe, mandamos un mensaje de error y salimos del proceso
  console.log('El archivo flows.json no se ha encontrado:', flowsPath);
  process.exit(1);
} else {
  console.log('Archivo flows.json encontrado:', flowsPath); // Si existe, lo mostramos por consola
}

// Carpeta de usuario de Node-RED
const userDir = path.join(process.env.APPDATA, 'CapturadorIntraza'); //Cambiamos la ruta de la carpeta de usuario 
// a la carpeta de la aplicación, para que no se rompa el código al empaquetar
if (!fs.existsSync(userDir)) { // Verificamos si la carpeta de usuario existe
  fs.mkdirSync(userDir, { recursive: true }); // Si no existe, la creamos
}

// Bloquear GET a "/"
app.use((req, res, next) => { // Middleware de express para bloquear el acceso a la raíz
  // Si la solicitud es GET a la raíz, respondemos con un error 403
  if (req.method === 'GET' && req.url === '/') { // Verificamos si la solicitud es GET a la raíz
    res.status(403).send("Acceso no autorizado"); // Si es así, respondemos con un error 403
  } else {
    next(); // Si no, continuamos con la siguiente función middleware
  }
});

// Configuración de Node-RED
const settings = { 
  httpAdminRoot: false, // Deshabilitamos la interfaz de administración de Node-RED
  httpNodeRoot: "/api", // Establecemos la raíz de la API de Node-RED, llamamos a los endpoints desde esta ruta
  userDir: userDir, // Establecemos la carpeta de usuario de Node-RED
  flowFile: flowsPath, // Establecemos la ruta del archivo de flujos de Node-RED
  uiPort: 1880, // solo para referencia, ya que usaremos nuestro propio server
};

// Inicializar Node-RED
RED.init(null, settings); // Inicializamos Node-RED con la configuración establecida
app.use(settings.httpNodeRoot, RED.httpNode); // Usamos la raíz de la API de Node-RED para servir los nodos HTTP

// Crear servidor HTTP en puerto 1880
const httpServer = http.createServer(app); // Creamos el servidor HTTP con express
httpServer.listen(1880, () => { // Escuchamos en el puerto 1880
  console.log("🌐 HTTP escuchando en http://localhost:1880"); 
});

// Crear servidor HTTPS en puerto 8443, si hacemos los dos en 1880 no funcionara, nos petaría todo. El https requiere los 
// certificados y clave los cuales debemos de instalar, el puerto 8443 es el puerto por defecto para HTTPS
const key = fs.readFileSync(path.join(__dirname, 'key.pem'), 'utf8'); // Leemos la clave privada del archivo key.pem
const cert = fs.readFileSync(path.join(__dirname, 'cert.pem'), 'utf8'); // Leemos el certificado del archivo cert.pem

const httpsServer = https.createServer({ key, cert }, app); // Creamos el servidor HTTPS con express y los certificados
httpsServer.listen(8443, () => { // Escuchamos en el puerto 8443
  console.log("🔐 HTTPS escuchando en https://localhost:8443"); 
});

// Iniciar flujos de Node-RED
RED.start(); 
