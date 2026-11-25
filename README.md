# Centinela

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

Desde el inicio, abre **Acceso de administrador** en el menú. En **Canalización** puedes aprobar cuentas de autoridad, crear administradores, registrar instituciones, revisar evaluaciones y publicar respuestas. En **Expedientes** puedes asignar responsables, registrar atenciones y evidencias, gestionar actividades, cerrar casos y consultar informes.

Las solicitudes de autoridad se crean en **Registrarse como autoridad** desde la página principal. Un administrador verifica y aprueba la solicitud. El orientador recibe casos marcados como escolares. Los especialistas reciben casos del tipo de violencia asignado. Los reportes antiguos sin respuesta escolar quedan con el dato desconocido.

Registra los destinos con sus correos oficiales desde Canalización. Puedes seleccionarlos al aprobar cada solicitud. También puedes configurar destinos predeterminados por tipo en las tablas centinela.canalizacion_tipos y centinela.instituciones.

- CENTINELA_SMTP_HOST y CENTINELA_SMTP_PORT (587 por defecto, con STARTTLS).
- CENTINELA_SMTP_FROM como dirección de remitente y respuesta.
- CENTINELA_SMTP_USER y CENTINELA_SMTP_PASSWORD si el proveedor exige autenticación.

El correo a instituciones se intenta al aprobar o reasignar. Si falla, el panel conserva los estados de entrega y permite reintentar los destinos pendientes. La institución recibe únicamente el tipo de violencia y una referencia interna. Los avisos de estado, solicitud de datos y cierre para usuarios registrados se guardan en cola. Para entregarlos automáticamente, programa la ejecución periódica de este comando en un proceso con las mismas variables de entorno.

~~~powershell
.\.venv\Scripts\python.exe -m flask --app backend.main enviar-avisos
~~~

La [matriz funcional](docs/revision-funcional.md) cubre las 120 pruebas del plan técnico.

## Plan gratuito

El servidor puede suspenderse por inactividad. Las bases gratuitas de Render caducan; revisar la fecha en el panel y exportar datos o migrar antes del vencimiento. La base existente `centinela-digital-db` vence el 26 de noviembre de 2026 a las 04:14 UTC (25 de noviembre a las 22:14 en Ciudad de México).
