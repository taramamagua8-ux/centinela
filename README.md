# Centinela

Aplicación Flask con frontend y API en el mismo dominio, preparada para Render.

## Despliegue

1. Subir el contenido de esta carpeta a un repositorio llamado `centinela`.
2. En Render crear un Blueprint desde ese repositorio; `render.yaml` define el servicio `centinela`.
3. Configurar las variables CENTINELA_DB_* con una base MySQL/MariaDB accesible desde Render. Render PostgreSQL no es compatible con este código.
4. En una base nueva, importar primero `database/centinela_digital.sql` y después `database/migracion_api.sql`. No ejecutar el dump sobre una base existente sin revisar sus tablas.
5. Verificar `/healthz` (proceso) y `/api/health` (conexión con base de datos). La portada funciona sin base, pero registro, reportes y directorio la requieren.

Inicio local: `pip install -r requirements.txt` y `python backend/main.py`.
Inicio de producción: el comando Gunicorn de `render.yaml`.

## Límites actuales

El código original usa identificadores enviados en cabeceras como autenticación y genera tokens que no valida. Antes de recibir reportes reales, se debe implementar autenticación y autorización persistentes para cuentas, administración y acceso a reportes. Estos ajustes de despliegue no resuelven ese diseño.
