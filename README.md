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

Con `DATABASE_URL` configurada, crea el usuario interno sin escribir su contraseña en la línea de comandos:

```powershell
.\.venv\Scripts\python.exe -m backend.crear_admin "Nombre del personal" "correo@institucion.example"
```

El panel se abre en [Gestión de reportes](http://127.0.0.1:5000/static/templates/administracion_reportes.html). Permite publicar una respuesta para el seguimiento y asignar estatus y nivel de riesgo. El riesgo inicial es **Por evaluar**.

Para el correo automático, registra una institución activa con su correo oficial en `centinela.instituciones` y vincúlala al tipo de violencia en `centinela.canalizacion_tipos`. El catálogo de tipos está en `centinela.tipos_violencia`. Configura en el entorno del servidor:

- `CENTINELA_SMTP_HOST` y `CENTINELA_SMTP_PORT` (587 por defecto, con STARTTLS).
- `CENTINELA_SMTP_FROM` como remitente y dirección de respuesta.
- `CENTINELA_SMTP_USER` y `CENTINELA_SMTP_PASSWORD` cuando el proveedor exija autenticación.

El aviso contiene el tipo de violencia y una referencia interna. Si el SMTP falla, el reporte queda guardado y el servidor registra el error. Las respuestas se incorporan al seguimiento desde el panel. Mientras tanto, se muestra orientación según el tipo de violencia y un enlace al directorio.

## Plan gratuito

El servidor puede suspenderse por inactividad. Las bases gratuitas de Render caducan; revisar la fecha en el panel y exportar datos o migrar antes del vencimiento. La base existente `centinela-digital-db` vence el 26 de noviembre de 2026 a las 04:14 UTC (25 de noviembre a las 22:14 en Ciudad de México).
