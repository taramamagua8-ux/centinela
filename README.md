# Centinela

Flask, Gunicorn y PostgreSQL en Render. Frontend y API comparten dominio.

## Configuración

Configurar `DATABASE_URL` en las variables del servicio de Render con la Internal Database URL de PostgreSQL de la misma región. No guardar credenciales en GitHub.

Al recibir la primera petición API, el backend crea automáticamente las tablas del esquema `centinela` y los catálogos de estados y tipos de violencia. La inicialización es idempotente, está protegida contra concurrencia entre workers y no modifica tablas de otros esquemas. Los SQL originales de MySQL se conservan como referencia: no se utilizan para este despliegue.

- `/healthz`: disponibilidad del proceso.
- `/api/health`: disponibilidad de la conexión y esquema.
- Registro e inicio de sesión: tokens aleatorios de 12 horas, persistidos como hashes; se envían como `Authorization: Bearer TOKEN`. Las cabeceras de identificadores no autentican.
- Creación de reportes anónimos: devuelve folio aleatorio y `token_acceso`. Para ver detalles, personas o evidencias, enviar `X-Reporte-Token`. El usuario autenticado que creó el reporte también tiene acceso. El folio permite consultar estado, sin exponer descripción ni personas.
- Evidencias: hasta 10 MB por petición, almacenadas en PostgreSQL; sobreviven a reinicios. Descarga como adjunto con autorización.
- El directorio está vacío inicialmente: el ZIP original no contiene instituciones.
- No hay cuentas administrativas predeterminadas ni contraseñas de muestra.

Inicio: `pip install -r requirements.txt`, exportar `DATABASE_URL`, y ejecutar `gunicorn --bind 0.0.0.0:$PORT --workers 2 backend.main:app`.

## Plan gratuito

El servidor puede suspenderse por inactividad. Las bases gratuitas de Render caducan; revisar la fecha en el panel y exportar datos o migrar antes del vencimiento. La base existente `centinela-digital-db` vence el 26 de noviembre de 2026 a las 04:14 UTC (25 de noviembre a las 22:14 en Ciudad de México).
