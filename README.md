Tenemos el server.js que es el archivo que maneja la logica
El package.json con todas las dependencias etc..
Y algunos otros archivos como el package-lock.json etc...
Nos falta introducirle un flows.json (flujo de nodered) al proyecto, y la carpeta node_modules
Una vez descargado el repo realizamos npm install para que nos cree la carpeta node_modules junto con todas las dependencias que tenemos indicadas en el package.json
Y despues procedemos a empaquetar nuestro ejecutable con nexe:

        - npx nexe server.js --build --resource "flows.json" --resource "node_modules/**/" --resource ".json" --resource "*.js" -o aqui-va-el-nombre-del-ejecutable.exe 

Listo, tenemos un ejecutable que nos iniciara la aplicacion, van incrustados el server.js y el flows.json, para añadir los demas archivos, carpeta node_modules, el lock.json etc...
usaremos la herramienta INNO SETUP COMPILER, para meter en un instalador los demas archivos necesarios. Al abrir el instalador nos crea un nuevo ejecutable completamente funcional e independiente (el flows.json va introducido dentro por lo que no es visible) y los demas archivos nos lo instala en una carpeta que aparece en la carpeta archivos de programa, para que el ejecutable los lea (node_modules, lock.json etc...)
Aquí dejo el script de inno setup para hacer esto: 

[Setup]
AppName=Capturador Intraza 
AppVersion=1.0
DefaultDirName={autopf}\Capturador Intraza 
OutputDir=C:\Users\X\Desktop\Installer
OutputBaseFilename=CapturadorIntrazaInstaller
Compression=lzma
SolidCompression=yes

[Files]
; Copia el ejecutable server.exe
Source: "C:\Users\X\Desktop\nombredelacrpetadelproyecto\capturador_intraza.exe"; DestDir: "{app}"; Flags: ignoreversion

; Copia node_modules y sus subcarpetas
Source: "C:\Users\X\Desktop\nombredelacrpetadelproyecto\node_modules\*"; DestDir: "{app}\node_modules"; Flags: recursesubdirs

; Copia server.js (en caso de que sea necesario)
Source: "C:\Users\X\Desktop\nombredelacrpetadelproyecto\server.js"; DestDir: "{app}"; Flags: ignoreversion

; Copia package.json
Source: "C:\Users\X\Desktop\nombredelacrpetadelproyecto\package.json"; DestDir: "{app}"; Flags: ignoreversion

; Copia package-lock.json a una subcarpeta (other_files) dentro de la instalación
Source: "C:\Users\X\Desktop\nombredelacrpetadelproyecto\package-lock.json"; DestDir: "{app}\other_files"; Flags: ignoreversion

; Copia otros archivos que necesites en tu instalación (si tienes más)
; Source: "C:\Ruta\A\Tu\Proyecto\otros_archivos\*"; DestDir: "{app}\otros_archivos"; Flags: recursesubdirs createallsubdirs

[Icons]
; Crea el acceso directo en el menú de inicio
Name: "{autoprograms}\Capturador Intraza Serry"; Filename: "{app}\capturador_intraza.exe"

[Run]
; Ejecuta el archivo server.exe después de la instalación
Filename: "{app}\capturador_intraza.exe"; Description: "Ejecutar Node-RED Privado"; Flags: nowait postinstall skipifsilent





- Lo de arriba es el script iss de INNO SETUP, despues pulsamos la pestaña build y compile, LISTO!
