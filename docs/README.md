# Centinela Digital

## 1. Descripción

**Centinela Digital** es una plataforma web diseñada para el registro, la gestión y el reporte seguro de situaciones de violencia, acoso y acoso digital. Su objetivo es ofrecer un espacio accesible y confidencial donde las personas puedan reportar incidentes mediante flujos especializados para víctimas y testigos, con la posibilidad de elegir entre realizar un reporte anónimo o proporcionar sus datos de identificación.

La plataforma también contempla páginas informativas y un espacio para consultar el estado de un reporte mediante su folio de seguimiento.

## 2. Características principales

- **Registro y reporte de casos (RF-01):** permite documentar situaciones de violencia, acoso o acoso digital.
- **Modalidad anónima o identificada (RF-02 y RF-03):** la persona que reporta puede elegir si desea mantener su identidad anónima o proporcionar sus datos.
- **Selección del tipo de situación (RF-04):** permite indicar la tipología de violencia o agresión que se desea reportar.
- **Descripción de los hechos (RF-05):** incluye campos para explicar lo ocurrido de manera clara y ordenada.
- **Flujos diferenciados:** contempla formularios y recorridos para víctimas y testigos.
- **Confirmación del reporte:** contempla una pantalla para confirmar el envío y orientar a la persona sobre el seguimiento.
- **Consulta de seguimiento:** permite acceder a la sección para consultar el estado de un reporte con su folio.
- **Contenido informativo:** incluye secciones de descubrimiento, videos, directorio y presentación del proyecto.

> La modalidad anónima debe evitar solicitar datos que identifiquen directamente a la persona que reporta. La información que se solicite en el formulario debe corresponder a la modalidad elegida.

## 3. Tecnologías utilizadas

- **Frontend:** HTML5 y CSS3.
- **Backend:** Python y Flask, de acuerdo con la tecnología prevista para `main.py`.
- **Base de datos:** archivo de esquema SQL (`esquema.sql`). El motor de base de datos debe especificarse según la configuración real del proyecto.
- **Scripts PHP existentes:** `guardar.php` y `eliminar_sesion.php`, visibles en la estructura actual del repositorio.
- **Diseño y prototipado:** Figma.
- **Despliegue previsto:** Render.

**Nota técnica:** la estructura actual contiene un archivo principal de Python y también dos scripts PHP. Si ambos se utilizarán, documenten qué responsabilidad tendrá cada uno y cómo se comunicarán con el resto del sistema. Si PHP ya no forma parte de la implementación, conviene retirarlo o actualizar esta sección para que coincida con el código definitivo.

## 4. Estructura de la aplicación

La siguiente estructura conserva las carpetas y archivos que aparecen en la captura del proyecto y propone nombres para las páginas adicionales. Los nombres nuevos son una organización sugerida; deben crearse los archivos que todavía no existan.

```text
CentinelaDigital/
├── backend/
│   ├── eliminar_sesion.php
│   ├── guardar.php
│   └── main.py
├── database/
│   └── esquema.sql
├── docs/
│   └── leeme.txt
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   │   └── estilos.css
│   │   ├── img/
│   │   │   └── centinela_digital...  # Conservar el nombre real del archivo de imagen
│   │   └── js/
│   └── templates/
│       ├── index.html
│       ├── principal.html
│       ├── formulario.html
│       ├── bienvenida.html
│       ├── menu_principal.html
│       ├── seleccion_formulario.html
│       ├── comenzar_reporte.html
│       ├── terminos_condiciones.html
│       ├── formulario_victima_anonima.html
│       ├── formulario_victima_registrada.html
│       ├── formulario_testigo_anonimo.html
│       ├── formulario_testigo_registrado.html
│       ├── formulario_reporte_segunda_parte.html
│       ├── confirmacion_reporte.html
│       ├── cuenta_folio.html
│       ├── consulta_estado_reporte.html
│       ├── descubre_mas.html
│       ├── videos.html
│       ├── directorio.html
│       └── sobre_nosotros.html
└── .gitignore
```

### Páginas y responsables

| Página o módulo | Archivo HTML sugerido | Responsable |
|---|---|---|
| Página de bienvenida | `bienvenida.html` | Dominic |
| Formularios: selección de víctima/testigo y modalidad anónima/registrada | `seleccion_formulario.html` | Dylan |
| Menú principal | `menu_principal.html` | Dominic |
| Acceso al botón de reporte | Integrado en `menu_principal.html` o la pantalla correspondiente | Por definir |
| Comencemos tu reporte | `comenzar_reporte.html` | Fernanda |
| Términos y condiciones | `terminos_condiciones.html` | Fernanda |
| Formulario de víctima anónima | `formulario_victima_anonima.html` | Fernanda |
| Segunda parte del formulario | `formulario_reporte_segunda_parte.html` | Dylan |
| Confirmación del reporte | `confirmacion_reporte.html` | Dominic |
| Cuenta: ingreso del folio de seguimiento | `cuenta_folio.html` | Dominic |
| Consulta del estado del reporte | `consulta_estado_reporte.html` | Dominic (2) |
| Descubre más | `descubre_mas.html` | Por definir |
| Videos | `videos.html` | Por definir |
| Directorio | `directorio.html` | Por definir |
| Sobre nosotros | `sobre_nosotros.html` | Por definir |
| Base de datos | `../database/esquema.sql` | Mar |

Los formularios anónimos y registrados se separan en cuatro archivos propuestos para que el flujo de víctima/testigo y la elección de modalidad queden identificados en la estructura. Si el equipo decide usar un solo formulario dinámico, pueden conservar `formulario.html` y adaptar esta lista a la implementación real.

### Archivos que ya aparecen en la captura

- `index.html`: punto de entrada o página inicial, según las rutas configuradas en Flask.
- `principal.html`: página principal existente; puede conservarse como menú si coincide con el diseño del equipo.
- `formulario.html`: formulario existente; puede conservarse como base o pantalla común para los reportes.
- `estilos.css`: hoja de estilos del frontend.
- `main.py`: archivo principal de la aplicación Python.
- `esquema.sql`: definición de la estructura de la base de datos.
- `guardar.php` y `eliminar_sesion.php`: scripts PHP presentes en el repositorio.

No es necesario duplicar páginas que ya estén implementadas: antes de crear un archivo nuevo, comprueben si alguno de los HTML existentes ya cumple esa función y actualicen la tabla y las rutas según corresponda.

## 5. Base de datos

El archivo `database/esquema.sql` contiene o deberá contener las instrucciones SQL para definir la estructura de la base de datos. Su diseño debe corresponder con los datos que realmente utiliza la aplicación, por ejemplo los necesarios para registrar y dar seguimiento a los reportes.

El esquema definitivo debe documentar las tablas, sus claves primarias y foráneas, las relaciones y las reglas de integridad que se implementen. No se especifica aquí un motor concreto porque la captura solo muestra el archivo SQL, no la configuración del servidor de base de datos.

## 6. Instalación y ejecución local

### Requisitos

- Git.
- Python instalado.
- Flask y las demás dependencias que utilice `main.py`.
- El motor de base de datos configurado para el proyecto, si la aplicación lo requiere.

### Pasos

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/sentinela-digital.git
   cd CentinelaDigital
   ```

   Sustituye la URL de ejemplo por la dirección real del repositorio. Si el nombre de la carpeta clonada es distinto, entra en esa carpeta.

2. Crea y activa un entorno virtual (recomendado):

   **Windows (PowerShell):**

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   **Linux o macOS:**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Instala las dependencias. Si el proyecto cuenta con `requirements.txt`, ejecuta:

   ```bash
   pip install -r requirements.txt
   ```

   Si todavía no existe ese archivo, instala las dependencias que realmente importe `main.py` y genera después un `requirements.txt` para documentarlas.

4. Configura las variables de entorno y la conexión a la base de datos, si son necesarias. No subas contraseñas, claves secretas ni credenciales al repositorio.

5. Inicia la aplicación según la configuración de Flask. Si `main.py` define la aplicación Flask y permite ejecutarla directamente, puedes probar:

   ```bash
   python main.py
   ```

6. Abre en el navegador la dirección local que indique la consola. La dirección y el puerto dependen de la configuración de `main.py`.

## 7. CSS y diseño de interfaz (UI)

Los estilos visuales se organizan en `frontend/static/css/estilos.css`, mientras que los recursos gráficos se encuentran en `frontend/static/img/`. La carpeta `frontend/static/js/` queda disponible para los archivos JavaScript que necesite la interfaz.

Las pantallas deben mantener una navegación coherente, formularios legibles y mensajes claros. En los reportes, la elección entre modalidad anónima e identificada debe ser visible y comprensible, y no debe confundirse con la elección entre víctima y testigo.

## 8. Despliegue

El equipo tiene previsto desplegar la plataforma en **Render**. Antes de publicarla, deberán configurar el comando de inicio, las dependencias, las variables de entorno y la conexión a la base de datos de acuerdo con la implementación final. También deberán comprobar que las rutas a las plantillas y a los archivos estáticos coincidan con la estructura del proyecto.

## 9. Estado del proyecto

Este README describe la estructura visible en la captura y las páginas planificadas por el equipo. Los nombres propuestos, las rutas, la configuración de la base de datos y los comandos de ejecución deben verificarse contra el código definitivo antes del despliegue.



Flask, Gunicorn y PostgreSQL en Render. Frontend y API comparten dominio.

## Configuración

Configurar `DATABASE_URL` en las variables del servicio de Render con la Internal Database URL de PostgreSQL de la misma región. No guardar credenciales en GitHub.

Al recibir la primera petición API, el backend crea automáticamente las tablas del esquema `centinela` y los catálogos de estados y tipos de violencia. La inicialización es idempotente, está protegida contra concurrencia entre workers y no modifica tablas de otros esquemas. Los SQL originales de MySQL se conservan como referencia: no se utilizan para este despliegue.

- `/healthz`: disponibilidad del proceso.
- `/api/health`: disponibilidad de la conexión y esquema.
- Registro e inicio de sesión: tokens aleatorios de 12 horas, persistidos como hashes; se envían como `Authorization: Bearer TOKEN`. Las cabeceras de identificadores no autentican.
- Los reportes registrados aparecen en **Mis reportes**. Para un reporte anónimo creado en el formulario actual, el folio permite consultar el resumen. En los reportes registrados, se requiere la cuenta propietaria para ver los detalles. Los folios antiguos siguen mostrando el estado.
- Las evidencias se guardan en PostgreSQL. El formulario acepta un archivo de hasta 10 MB.
- El directorio está vacío inicialmente: el ZIP original no contiene instituciones.
- No hay cuentas administrativas predeterminadas ni contraseñas de muestra.

Inicio: `pip install -r requirements.txt`, exportar `DATABASE_URL`, y ejecutar `gunicorn --bind 0.0.0.0:$PORT --workers 2 backend.main:app`.

## Ejecutar en Windows

Con PostgreSQL activo y una base local disponible, ejecuta desde la raíz del repositorio en PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:DATABASE_URL = 'postgresql://USUARIO:CONTRASEÑA@127.0.0.1:5432/BASE'
.\.venv\Scripts\python.exe -m backend.main
```

Abre [Centinela Digital](http://127.0.0.1:5000/).

## Seguimiento institucional

Crea el primer administrador con DATABASE_URL configurada. El comando solicita la contraseña y muestra el folio administrativo que se necesita para iniciar sesión junto con el correo y la contraseña.

~~~powershell
.\.venv\Scripts\python.exe -m backend.crear_admin "Nombre del personal" "correo@institucion.example"
~~~

Para generar un folio para una cuenta previa, ejecuta el mismo comando con la opción --renovar-folio. La renovación cierra las sesiones previas.

Desde el inicio, abre **Acceso de administrador** en el menú. En **Canalización** puedes aprobar cuentas de autoridad, crear administradores, revocar el acceso de otra cuenta administrativa, renovar su folio, registrar instituciones, revisar evaluaciones y publicar respuestas. En **Expedientes** puedes asignar responsables, registrar atenciones y evidencias, gestionar actividades, cerrar casos y consultar informes.

Las solicitudes de autoridad se crean en **Registrarse como autoridad** desde la página principal. Se requiere un nombramiento o carta oficial en PDF de hasta 5 MB. Solo los administradores acceden al archivo. La solicitud queda en revisión hasta que un administrador confirme el comprobante. Las solicitudes pendientes anteriores pueden adjuntar el PDF desde el mismo formulario con su correo y contraseña. Las cuentas que ya estaban activas conservan su acceso. El orientador recibe casos marcados como escolares. Los especialistas reciben casos del tipo de violencia asignado. Los reportes antiguos sin respuesta escolar quedan con el dato desconocido.

Registra los destinos con sus correos oficiales desde Canalización. Puedes seleccionarlos al aprobar cada solicitud. También puedes configurar destinos predeterminados por tipo en las tablas centinela.canalizacion_tipos y centinela.instituciones.

- CENTINELA_RESEND_API_KEY habilita el envío por HTTPS. Usa un remitente verificado y configura CENTINELA_SMTP_FROM también en el servicio web.
- Como alternativa, CENTINELA_SMTP_HOST y CENTINELA_SMTP_PORT (587 por defecto, con STARTTLS).
- CENTINELA_SMTP_FROM como dirección de remitente y respuesta.
- CENTINELA_SMTP_USER y CENTINELA_SMTP_PASSWORD si el proveedor exige autenticación.

El correo a instituciones se intenta al aprobar o reasignar. Si falla, el panel conserva los estados de entrega y permite reintentar los destinos pendientes. La institución recibe únicamente el tipo de violencia y una referencia interna. Los avisos de estado, solicitud de datos y cierre para usuarios registrados se guardan en cola. Para entregarlos automáticamente, programa la ejecución periódica de este comando en un proceso con las mismas variables de entorno.

~~~powershell
.\.venv\Scripts\python.exe -m flask --app backend.main enviar-avisos
~~~

Para Render, el Blueprint opcional [render.avisos.yaml](render.avisos.yaml) programa la entrega cada diez minutos, separado del servicio web. Requiere la misma base de datos y el proveedor de correo por HTTPS. Activar este Blueprint crea un servicio cron facturable. Render bloquea los puertos SMTP habituales en el plan web gratuito.

La [matriz funcional](docs/revision-funcional.md) cubre las 120 pruebas del plan técnico.

## Plan gratuito

El servidor puede suspenderse por inactividad. Las bases gratuitas de Render caducan; revisar la fecha en el panel y exportar datos o migrar antes del vencimiento. La base existente `centinela-digital-db` vence el 26 de noviembre de 2026 a las 04:14 UTC (25 de noviembre a las 22:14 en Ciudad de México).
