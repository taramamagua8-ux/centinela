# Revisión funcional de Centinela Digital

Comparación del commit 284a99a con los cambios locales. Se revisaron 120 identificadores, PF-1 a PF-120. PF-4, PF-5 y PF-6 aparecen en la página 60. Las pruebas duplicadas conservan su identificador.

«Parcial» indica que existía una API, un catálogo o un flujo básico. La matriz describe la cobertura del código. La verificación se realizó con pruebas de flujos integrados.

- 19 ya estaban disponibles.
- 30 existían parcialmente y se ampliaron.
- 71 estaban ausentes y se incorporaron.

Los avisos por correo a reportantes requieren SMTP y ejecución periódica del comando Flask enviar-avisos. XAMPP, MySQL, publicación y riesgos corresponden al contexto técnico del plan. El proyecto actual usa PostgreSQL.

## Registro y reporte

| Prueba | Página | Requisito del plan | Antes | Resultado en el código |
|---|---:|---|---|---|
| PF-1 | 19 | Registro de una situación de violencia o acoso | Integrado | Se conservó. |
| PF-2 | 19 | Selección de la modalidad de reporte anónimo | Integrado | Se conservó. |
| PF-3 | 19 | Captura de datos de identificación obligatorios | Integrado | Se conservó. |
| PF-4 | 60 | Selección del tipo de violencia ocurrida | Integrado | Se conservó. |
| PF-5 | 60 | Captura detallada de la narrativa de los hechos | Integrado | Se conservó. |
| PF-6 | 60 | Registro de fecha y hora del incidente | Parcial | Se añadió la hora aproximada. |
| PF-7 | 20 | Captura textual del lugar del incidente | Integrado | Se conservó. |
| PF-8 | 20 | Clasificación del entorno escolar | Ausente | Pregunta obligatoria y filtro de orientador. |
| PF-9 | 20 | Adjuntar archivos multimedia como evidencia | Integrado | Se conservó. |
| PF-10 | 21 | Registro de la presencia de testigos | Ausente | Datos identificables de testigos solo en reportes registrados. |
| PF-11 | 21 | Despliegue de resumen de datos capturados | Integrado | Se conservó. |
| PF-12 | 21 | Modificación de información previa al envío | Integrado | Se conservó. |
| PF-13 | 22 | Validación de campos obligatorios vacíos | Integrado | Se conservó. |
| PF-14 | 22 | Envío final del reporte validado | Integrado | Se conservó. |
| PF-15 | 22 | Generación automática de folio único del caso | Integrado | Se conservó. |
| PF-16 | 23 | Pantalla de confirmación de envío exitoso | Integrado | Se conservó. |
| PF-17 | 23 | Consulta de estado usando el folio asignado | Integrado | Se conservó. |
| PF-18 | 23 | Modificación interna del estado del caso | Integrado | Se conservó. |

## Avisos, bandeja y evaluación

| Prueba | Página | Requisito del plan | Antes | Resultado en el código |
|---|---:|---|---|---|
| PF-19 | 24 | Disparo de alertas ante nuevos registros | Ausente | Aviso en el panel del personal. |
| PF-20 | 24 | Consulta general del historial de reportes | Integrado | Se conservó. |
| PF-21 | 25 | Visualización de casos pendientes de evaluación | Parcial | Filtro de pendientes para cada autoridad. |
| PF-22 | 25 | Consulta de la información completa del reporte | Parcial | Detalle y evidencia descargable con permiso. |
| PF-23 | 25 | Identificación del tipo de violencia o situación | Integrado | Se conservó. |
| PF-24 | 26 | Clasificación formal del caso por tipo de violencia | Parcial | Se amplió. |
| PF-25 | 26 | Evaluación del nivel de gravedad del incidente | Parcial | Se amplió. |
| PF-26 | 26 | Asignación de prioridad según la gravedad | Ausente | Se incorporó. |
| PF-27 | 27 | Identificación de riesgo inmediato para el afectado | Parcial | Bandera visual de riesgo inmediato. |
| PF-28 | 27 | Registro de factores de riesgo identificados | Ausente | Se incorporó. |
| PF-29 | 27 | Identificación de personas involucradas o testigos | Parcial | Se amplió. |
| PF-30 | 28 | Determinación de suficiencia de la información | Ausente | Se incorporó. |
| PF-31 | 28 | Solicitud de información adicional al reportante | Ausente | Solicitud por folio y correo a cuentas registradas con SMTP. |
| PF-32 | 28 | Registro de observaciones de la evaluación | Ausente | Se incorporó. |
| PF-33 | 29 | Determinación de suficiencia de la información | Ausente | Mismo flujo que PF-30. |
| PF-34 | 29 | Solicitud de información adicional al reportante | Ausente | Mismo flujo que PF-31. |
| PF-35 | 29 | Registro de observaciones de la evaluación | Ausente | Mismo flujo que PF-32. |
| PF-36 | 30 | Evaluación técnica del caso en proceso | Ausente | Se incorporó. |
| PF-37 | 30 | Determinación del área o personal responsable | Ausente | Se incorporó. |
| PF-38 | 30 | Canalización del caso al personal correspondiente | Parcial | Se amplió. |
| PF-39 | 31 | Cambio automático de estado tras la evaluación | Ausente | Paso automático a En canalización cuando la evaluación es suficiente. |
| PF-40 | 31 | Registro de fecha y hora de la evaluación | Ausente | Se incorporó. |

## Canalización

| Prueba | Página | Requisito del plan | Antes | Resultado en el código |
|---|---:|---|---|---|
| PF-41 | 32 | registrro de solicitudes de canalizacion interna | Ausente | Se incorporó. |
| PF-42 | 32 | captura de datos generales del reporte | Parcial | Identidad de la cuenta registrada o captura en apertura de expedientes internos. Se preserva el anonimato. |
| PF-43 | 32 | seleccion del tipo de situacion a canalizar | Parcial | Se hereda la clasificación confirmada en el expediente. |
| PF-44 | 33 | asignacion de prioridad para en nivel de atencion | Ausente | 7, 3 o 1 día según prioridad. |
| PF-45 | 33 | asignacion de la institucion responsable | Parcial | Destinos seleccionados o configurados por tipo. |
| PF-46 | 33 | generacion automatica de folio de canalizacion | Ausente | Folio de canalización propio. |
| PF-47 | 34 | consulta de sulicitudes por medio del folio | Ausente | Se incorporó. |
| PF-48 | 34 | vilualizacion del estado actual del proceso | Parcial | Se amplió. |
| PF-49 | 34 | modificacion del estado de la canalizacion | Parcial | Se amplió. |
| PF-50 | 35 | registro fecha y hora del cambio de estado | Parcial | Se amplió. |
| PF-51 | 35 | envio de notificaciones de estado automaticas | Ausente | Seguimiento por folio y cola SMTP para usuarios registrados. |
| PF-52 | 35 | captura de observaciones y notas adicionales | Ausente | Se incorporó. |
| PF-53 | 36 | adjuntar evidencias a la solicitud registrada | Parcial | Adjunto con destino Canalización. |
| PF-54 | 36 | adjuntar archivos de evidencia | Parcial | Mismo destino que PF-53. |
| PF-55 | 36 | consulta de historial de acciones del proceso | Parcial | Se amplió. |
| PF-56 | 37 | consulta de instituciones dadas de alta | Integrado | Directorio público previo y nuevo catálogo administrativo. |
| PF-57 | 37 | despligue de datos de contactos institucionales | Integrado | Contactos existentes y consulta adicional desde Canalización. |
| PF-58 | 37 | reasignacion de solicituyd a otra institucion | Ausente | Motivo, historial de destinos y nuevo envío. |
| PF-59 | 38 | cierre definitivo de la solicitud | Parcial | Se amplió. |
| PF-60 | 38 | generalizacion de reportes de resultados estadisticos | Ausente | Se incorporó. |

## Gestión de expedientes

| Prueba | Página | Requisito del plan | Antes | Resultado en el código |
|---|---:|---|---|---|
| PF-61 | 39 | Registro de un nuevo caso de persona atendida | Ausente | Se incorporó. |
| PF-62 | 39 | Captura de datos generales del afectado y del hecho | Parcial | Se amplió. |
| PF-63 | 39 | Generación del folio único del caso atendido | Ausente | Folio de expediente independiente. |
| PF-64 | 40 | Modificación de datos en expedientes abiertos | Parcial | Narrativa, clasificación y responsable, según fase. |
| PF-65 | 40 | Asignación inicial del responsable del caso | Ausente | Se incorporó. |
| PF-66 | 40 | Reasignación del personal encargado | Ausente | Se incorporó. |
| PF-67 | 41 | Disparo de alertas al personal asignado | Ausente | Se incorporó. |
| PF-68 | 41 | Consulta de carga de trabajo por personal | Ausente | Se incorporó. |
| PF-69 | 41 | Registro de bitácora de atención individual | Ausente | Se incorporó. |
| PF-70 | 42 | Descripcion de acciones en el seguimiento | Ausente | Se incorporó. |
| PF-71 | 42 | Programación de la próxima fecha de atención | Ausente | Se incorporó. |
| PF-72 | 42 | Consulta del historial cronológico de atenciones | Ausente | Se incorporó. |
| PF-73 | 43 | Carga documentos de soporte al expediente | Parcial | Se amplió. |
| PF-74 | 43 | Asosiacion de evidencias a atenciones específicas | Ausente | Se incorporó. |
| PF-75 | 43 | Descarga de documentos con base en permisos | Parcial | Se aplica descarga por permisos, según el título y PF-85. |
| PF-76 | 44 | Cambio manual de estatus operativo del caso | Parcial | Se amplió. |
| PF-77 | 44 | Registro del motivo de cambio de estatus | Ausente | Se incorporó. |
| PF-78 | 44 | Busqueda avanzada de casos mediante filtros | Ausente | Se incorporó. |
| PF-79 | 45 | Cierre de caso por cumplimiento de atenciones | Parcial | Se amplió. |
| PF-80 | 45 | Ceneracion de informes de casos por periodo | Ausente | Se incorporó. |
| PF-81 | 46 | Programación de la próxima atención (Tabla pág. 5) | Ausente | Mismo flujo que PF-71. |
| PF-82 | 46 | Consulta del historial cronológico (Tabla pág. 5) | Ausente | Mismo flujo que PF-72. |
| PF-83 | 46 | Carga de documentos de soporte (Tabla pág. 5) | Parcial | Mismo flujo que PF-73. |
| PF-84 | 47 | Asociación de evidencias a atenciones (Tabla pág. 5) | Ausente | Mismo flujo que PF-74. |
| PF-85 | 47 | Descarga de documentos por permisos (Tabla pág. 5) | Parcial | Mismo flujo que PF-75. |
| PF-86 | 47 | Cambio manual de estatus operativo (Tabla pág. 5) | Parcial | Mismo flujo que PF-76. |
| PF-87 | 48 | Registro de motivo del cambio de estatus (Tabla pág. 5) | Ausente | Mismo flujo que PF-77. |
| PF-88 | 48 | Cierre de caso por cumplimiento (Tabla pág. 5) | Parcial | Mismo flujo que PF-79. |
| PF-89 | 48 | Búsqueda avanzada de casos mediante filtros (Tabla pág. 5) | Ausente | Mismo flujo que PF-78. |
| PF-90 | 49 | Generación de informes de casos por periodo (Tabla pág. 5) | Ausente | Mismo flujo que PF-80. |

## Actividades y seguimiento

| Prueba | Página | Requisito del plan | Antes | Resultado en el código |
|---|---:|---|---|---|
| PF-91 | 49 | Asignación de responsable directo a actividad | Ausente | Se incorporó. |
| PF-92 | 49 | Registro de actividades completadas | Ausente | Se incorporó. |
| PF-93 | 50 | Modificación de datos de una actividad | Ausente | Se incorporó. |
| PF-94 | 50 | Eliminar una actividad registrada | Ausente | Se incorporó. |
| PF-95 | 50 | Establecer fecha límite de atención técnica | Ausente | Se incorporó. |
| PF-96 | 51 | Generación automática de alertas de vencimiento | Ausente | Indicador de atraso al cargar el panel, calculado con fecha del servidor. |
| PF-97 | 51 | Registro del resultado final de intervención | Ausente | Se incorporó. |
| PF-98 | 51 | Programación de mantenimiento preventivo | Ausente | Seguimiento preventivo recurrente. Se genera la siguiente tarea al completar la actual. |
| PF-99 | 52 | Reapertura de un caso cerrado | Ausente | Se incorporó. |
| PF-100 | 52 | Visualización de actividades pendientes globales | Ausente | Se incorporó. |

## Cierre y satisfacción

| Prueba | Página | Requisito del plan | Antes | Resultado en el código |
|---|---:|---|---|---|
| PF-101 | 53 | Solicitud de confirmación del cierre del caso | Ausente | Se incorporó. |
| PF-102 | 53 | Registro de la confirmación de cierre definitivo | Ausente | Se incorporó. |
| PF-103 | 53 | Modificación del estado definido a "Cerrado" | Parcial | Cerrado en Expedientes o Atendido en Canalización. Ambos bloquean la edición. |
| PF-104 | 54 | Registro del motivo específico del cierre del caso | Ausente | Se incorporó. |
| PF-105 | 54 | Registro del resultado final o obtenido de la atención | Ausente | Se incorporó. |
| PF-106 | 54 | Consulta de información histórica de casos cerrados | Parcial | Se amplió. |
| PF-107 | 55 | Generación de comprobante de conclusión de caso | Ausente | Comprobante descargable y verificable por código. |
| PF-108 | 55 | Envío de notificación de cierre definitivo al usuario | Ausente | Correo en cola para cuentas registradas, sujeto a configuración de envío. |
| PF-109 | 55 | Solicitud de evaluación del servicio al usuario | Ausente | Se incorporó. |
| PF-110 | 56 | Registro de la calificación del nivel de satisfacción | Ausente | Se incorporó. |
| PF-111 | 56 | Registro de comentarios del usuario sobre el servicio | Ausente | Se incorporó. |
| PF-112 | 56 | Registro de opiniones (Duplicado en documento) | Ausente | Mismo flujo que PF-111. |
| PF-113 | 57 | Consulta de evaluaciones de satisfacción de usuarios | Ausente | Se incorporó. |
| PF-114 | 57 | Consulta de comentarios e inconformidades | Ausente | Se incorporó. |
| PF-115 | 57 | Generación de estadísticas globales de satisfacción | Ausente | Promedio y gráfico de distribución. |
| PF-116 | 58 | Generación de reportes de casos cerrados por periodo | Ausente | Se incorporó. |
| PF-117 | 58 | Registro de propuestas de mejora o recomendaciones | Ausente | Se incorporó. |
| PF-118 | 58 | Clasificación de comentarios para organización de datos | Ausente | Clasificación por tema seleccionado. |
| PF-119 | 59 | Consulta del historial global de cierres y evaluaciones | Ausente | Se incorporó. |
| PF-120 | 59 | Generación de reportes enfocados en hallar mejoras | Ausente | Informe por temas ordenados por cantidad de calificaciones de 1 a 3. |

## Verificación

- Pruebas de API y migración en PostgreSQL local. Incluyen permisos, devolución, seguimiento, reintento de SMTP simulado, evidencias, tareas, cierre, satisfacción y reapertura.
- Pruebas en Edge con ancho móvil. Se verificaron la navegación, el registro anónimo desde el inicio, la confirmación, la consulta por folio, el acceso del orientador y la apertura de expedientes en administración.
- La entrega de correo real y el despliegue requieren verificación en producción.
