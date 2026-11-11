# Endpoints de Centinela Digital

La API se encuentra en `backend/main.py` y utiliza el puerto 5000. La tabla contiene 30 endpoints. Los marcados como **Visible** ya tienen una pantalla o botón conectado; los demás están implementados en backend y quedan disponibles para futuras pantallas.

| # | Método y endpoint | Archivo y líneas | Función breve | Dónde se ve en pantalla |
|---:|---|---|---|---|
| 1 | GET `/api/health` | `backend/main.py:95-99` | Verifica API y base de datos. | No visible; diagnóstico del servidor. |
| 2 | POST `/api/auth/registro` | `backend/main.py:100-113` | Registra una cuenta. | **Visible:** `registro.html`, botón Crear cuenta. |
| 3 | POST `/api/auth/login` | `backend/main.py:114-124` | Inicia sesión. | **Visible:** `login.html`, botón Iniciar sesión. |
| 4 | POST `/api/auth/logout` | `backend/main.py:125-128` | Cierra la sesión. | **Visible:** `cuenta.html`, botón Cerrar sesión. |
| 5 | GET `/api/auth/sesion` | `backend/main.py:129-138` | Consulta la sesión actual. | **Visible:** `cuenta.html`, datos del usuario. |
| 6 | PATCH `/api/usuarios/me` | `backend/main.py:139-158` | Actualiza datos de cuenta. | **Visible:** `cuenta.html`, Editar mis datos. |
| 7 | DELETE `/api/usuarios/me` | `backend/main.py:159-167` | Desactiva la cuenta. | **Visible:** `cuenta.html`, botón Desactivar cuenta. |
| 8 | POST `/api/reportes` | `backend/main.py:168-186` | Crea reporte y genera folio. | **Visible:** `ReporteTesAno.html` y `ReporteVicAno.html`. |
| 9 | GET `/api/reportes` | `backend/main.py:187-192` | Lista reportes para administración. | No visible; pendiente de panel administrativo. |
| 10 | GET `/api/reportes/{id}` | `backend/main.py:193-199` | Consulta un reporte específico. | No visible; pendiente de detalle administrativo. |
| 11 | PATCH `/api/reportes/{id}` | `backend/main.py:200-214` | Edita información del reporte. | No visible; pendiente de panel administrativo. |
| 12 | DELETE `/api/reportes/{id}` | `backend/main.py:215-221` | Elimina un reporte. | No visible; pendiente de panel administrativo. |
| 13 | GET `/api/reportes/{id}/estado` | `backend/main.py:222-231` | Consulta el estado actual. | No visible directamente; preparado para seguimiento. |
| 14 | GET `/api/reportes/{id}/seguimiento` | `backend/main.py:232-241` | Devuelve el historial del reporte. | No visible; pendiente de historial de seguimiento. |
| 15 | POST `/api/reportes/{id}/seguimiento` | `backend/main.py:242-257` | Agrega una actualización de estado. | No visible; exclusivo para administración. |
| 16 | GET `/api/reportes/folio/{folio}` | `backend/main.py:258-267` | Busca un reporte por folio. | **Visible:** `formulario.html`, consulta de seguimiento. |
| 17 | POST `/api/reportes/{id}/evidencias` | `backend/main.py:268-285` | Guarda un archivo de evidencia. | **Visible:** `AdjuEvidencia.html` y `AdjuEvidenciaVicAno.html`. |
| 18 | GET `/api/reportes/{id}/evidencias` | `backend/main.py:286-289` | Lista evidencias del reporte. | No visible; pendiente de detalle administrativo. |
| 19 | DELETE `/api/reportes/{id}/evidencias/{id}` | `backend/main.py:290-296` | Elimina una evidencia. | No visible; pendiente de administración. |
| 20 | POST `/api/reportes/{id}/personas` | `backend/main.py:297-308` | Agrega una persona involucrada. | No visible; pendiente de sección en formulario. |
| 21 | GET `/api/reportes/{id}/personas` | `backend/main.py:309-312` | Lista personas involucradas. | No visible; pendiente de detalle de reporte. |
| 22 | PATCH `/api/reportes/{id}/personas/{id}` | `backend/main.py:313-322` | Actualiza una persona involucrada. | No visible; pendiente de administración. |
| 23 | GET `/api/instituciones` | `backend/main.py:323-326` | Lista instituciones activas. | No visible mediante API; `directorio.html` aún usa contenido local. |
| 24 | GET `/api/instituciones/{id}` | `backend/main.py:327-333` | Consulta una institución. | No visible mediante API; preparado para `detalle_institucion.html`. |
| 25 | GET `/api/instituciones/buscar?q=` | `backend/main.py:334-343` | Busca instituciones. | No visible mediante API; preparado para buscador del directorio. |
| 26 | GET `/api/instituciones/{id}/servicios` | `backend/main.py:344-353` | Consulta servicios de una institución. | No visible; preparado para detalle de institución. |
| 27 | GET `/api/videos` | `backend/main.py:354-360` | Devuelve videos informativos. | No visible mediante API; `videos.html` usa contenido local. |
| 28 | GET `/api/contenido/descubre-mas` | `backend/main.py:361-370` | Devuelve temas informativos. | No visible mediante API; `descubre_mas.html` usa contenido local. |
| 29 | GET `/api/tipos-violencia` | `backend/main.py:371-374` | Lista tipos de violencia activos. | No visible; preparado para selects del formulario. |
| 30 | GET `/api/estados-reporte` | `backend/main.py:375-376` | Lista estados disponibles. | No visible; preparado para filtros administrativos. |

## Referencias del frontend

- `frontend/static/js/auth.js`: autenticación y cuenta.
- `frontend/static/js/reporte_api.js`: creación de reportes y carga de evidencias.
- `frontend/static/js/seguimiento.js`: consulta por folio.

El endpoint auxiliar de salud es el número 1; los otros 29 corresponden a funciones del sistema.
