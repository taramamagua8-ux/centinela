CREATE SCHEMA IF NOT EXISTS centinela;
SET LOCAL search_path = centinela, public;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario BIGSERIAL PRIMARY KEY, nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE, contrasena_hash VARCHAR(255) NOT NULL,
    activo SMALLINT DEFAULT 1, fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS administradores (
    id_administrador BIGSERIAL PRIMARY KEY, nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE, contrasena_hash VARCHAR(255) NOT NULL,
    activo SMALLINT DEFAULT 1, fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sesiones (
    token_hash CHAR(64) PRIMARY KEY,
    id_usuario BIGINT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_administrador BIGINT REFERENCES administradores(id_administrador) ON DELETE CASCADE,
    expira TIMESTAMP NOT NULL,
    CHECK ((id_usuario IS NOT NULL) <> (id_administrador IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS estados_reporte (
    id_estado INTEGER PRIMARY KEY, nombre VARCHAR(50) NOT NULL, descripcion TEXT
);
CREATE TABLE IF NOT EXISTS tipos_violencia (
    id_tipo_violencia INTEGER PRIMARY KEY, nombre VARCHAR(100) NOT NULL,
    descripcion TEXT, activo SMALLINT DEFAULT 1
);
CREATE TABLE IF NOT EXISTS instituciones (
    id_institucion BIGSERIAL PRIMARY KEY, nombre VARCHAR(150) NOT NULL,
    descripcion TEXT, direccion VARCHAR(255), telefono VARCHAR(20),
    correo VARCHAR(150), sitio_web VARCHAR(255), horario VARCHAR(150),
    municipio VARCHAR(100), activa SMALLINT DEFAULT 1
);
CREATE TABLE IF NOT EXISTS reportes (
    id_reporte BIGSERIAL PRIMARY KEY, folio VARCHAR(40) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL, fecha_hecho TIMESTAMP,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, es_anonimo SMALLINT DEFAULT 1,
    id_estado INTEGER REFERENCES estados_reporte(id_estado),
    acceso_hash CHAR(64) NOT NULL,
    id_usuario BIGINT REFERENCES usuarios(id_usuario)
);
CREATE TABLE IF NOT EXISTS reporte_tipo_violencia (
    id_reporte BIGINT REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    id_tipo_violencia INTEGER REFERENCES tipos_violencia(id_tipo_violencia),
    PRIMARY KEY (id_reporte, id_tipo_violencia)
);
CREATE TABLE IF NOT EXISTS personas_involucradas (
    id_persona BIGSERIAL PRIMARY KEY,
    id_reporte BIGINT NOT NULL REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    tipo_participacion VARCHAR(30) NOT NULL, nombre VARCHAR(150), descripcion TEXT
);
CREATE TABLE IF NOT EXISTS seguimiento_reportes (
    id_seguimiento BIGSERIAL PRIMARY KEY,
    id_reporte BIGINT NOT NULL REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    id_estado INTEGER NOT NULL REFERENCES estados_reporte(id_estado),
    id_administrador BIGINT REFERENCES administradores(id_administrador),
    observaciones TEXT, fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS evidencias (
    id_evidencia BIGSERIAL PRIMARY KEY,
    id_reporte BIGINT NOT NULL REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL, tipo_mime VARCHAR(100),
    contenido BYTEA NOT NULL, fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO estados_reporte VALUES
    (1, 'Recibido', 'Reporte recibido por Centinela Digital'),
    (2, 'En revisión', 'Reporte en proceso de revisión'),
    (3, 'Canalizado', 'Reporte canalizado a una institución'),
    (4, 'Cerrado', 'Seguimiento concluido')
ON CONFLICT (id_estado) DO NOTHING;
INSERT INTO tipos_violencia (id_tipo_violencia, nombre, descripcion) VALUES
    (1, 'Violencia psicológica o emocional', 'Acciones que afectan la autoestima o la salud mental'),
    (2, 'Violencia física', 'Uso de la fuerza para causar daño'),
    (3, 'Violencia sexual', 'Conductas sexuales sin consentimiento'),
    (4, 'Violencia económica', 'Control o limitación injusta de recursos'),
    (5, 'Violencia patrimonial', 'Daño, destrucción o retención de bienes')
ON CONFLICT (id_tipo_violencia) DO NOTHING;

ALTER TABLE reportes ADD COLUMN IF NOT EXISTS rol_reportante VARCHAR(10);
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS nivel_riesgo VARCHAR(20) NOT NULL DEFAULT 'Por evaluar';
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS respuesta_institucion TEXT;
CREATE INDEX IF NOT EXISTS reportes_usuario_idx ON reportes (id_usuario);

CREATE TABLE IF NOT EXISTS canalizacion_tipos (
    id_tipo_violencia INTEGER PRIMARY KEY REFERENCES tipos_violencia(id_tipo_violencia),
    id_institucion BIGINT NOT NULL REFERENCES instituciones(id_institucion)
);

ALTER TABLE reportes ADD COLUMN IF NOT EXISTS clave_envio UUID;
CREATE UNIQUE INDEX IF NOT EXISTS reportes_clave_envio_idx ON reportes (clave_envio);

ALTER TABLE reportes ADD COLUMN IF NOT EXISTS ocurrio_en_escuela BOOLEAN;
ALTER TABLE administradores ADD COLUMN IF NOT EXISTS folio_hash CHAR(64) UNIQUE;

CREATE TABLE IF NOT EXISTS autoridades (
    id_autoridad BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    institucion VARCHAR(150) NOT NULL,
    cargo VARCHAR(150) NOT NULL,
    tipo_autoridad VARCHAR(20) NOT NULL,
    id_tipo_violencia INTEGER REFERENCES tipos_violencia(id_tipo_violencia),
    activo SMALLINT NOT NULL DEFAULT 0 CHECK (activo IN (-1, 0, 1)),
    CHECK ((tipo_autoridad = 'orientador' AND id_tipo_violencia IS NULL)
        OR (tipo_autoridad = 'especialista' AND id_tipo_violencia IS NOT NULL))
);
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS id_autoridad BIGINT
    REFERENCES autoridades(id_autoridad) ON DELETE CASCADE;
ALTER TABLE sesiones DROP CONSTRAINT IF EXISTS sesiones_check;
ALTER TABLE sesiones DROP CONSTRAINT IF EXISTS sesiones_un_titular;
ALTER TABLE sesiones ADD CONSTRAINT sesiones_un_titular
    CHECK (num_nonnulls(id_usuario, id_administrador, id_autoridad) = 1);

INSERT INTO estados_reporte VALUES
    (5, 'En canalización', 'La autoridad envió el caso a revisión administrativa'),
    (6, 'Devuelto con observaciones', 'La autoridad debe corregir la solicitud'),
    (7, 'Respuesta recibida', 'Una institución respondió a la canalización'),
    (8, 'Atendido', 'El seguimiento institucional concluyó')
ON CONFLICT (id_estado) DO NOTHING;

CREATE TABLE IF NOT EXISTS canalizaciones (
    id_reporte BIGINT PRIMARY KEY REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    id_autoridad BIGINT NOT NULL REFERENCES autoridades(id_autoridad),
    id_administrador BIGINT REFERENCES administradores(id_administrador),
    valoracion TEXT,
    propuesta TEXT,
    nivel_riesgo VARCHAR(20),
    observaciones TEXT,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS envios_correo (
    id_reporte BIGINT REFERENCES canalizaciones(id_reporte) ON DELETE CASCADE,
    id_institucion BIGINT REFERENCES instituciones(id_institucion),
    correo VARCHAR(150) NOT NULL,
    estado VARCHAR(12) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'enviado', 'fallido')),
    fecha TIMESTAMPTZ,
    PRIMARY KEY (id_reporte, id_institucion)
);
CREATE TABLE IF NOT EXISTS respuestas_instituciones (
    id_respuesta BIGSERIAL PRIMARY KEY,
    id_reporte BIGINT NOT NULL,
    id_institucion BIGINT NOT NULL,
    id_administrador BIGINT NOT NULL REFERENCES administradores(id_administrador),
    mensaje TEXT NOT NULL,
    resumen_publico TEXT NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reporte, id_institucion) REFERENCES envios_correo ON DELETE CASCADE
);
ALTER TABLE seguimiento_reportes ADD COLUMN IF NOT EXISTS id_autoridad BIGINT
    REFERENCES autoridades(id_autoridad);
CREATE INDEX IF NOT EXISTS reporte_tipo_violencia_tipo_idx
    ON reporte_tipo_violencia (id_tipo_violencia, id_reporte);

ALTER TABLE seguimiento_reportes ADD COLUMN IF NOT EXISTS publica BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE canalizaciones ADD COLUMN IF NOT EXISTS folio VARCHAR(40) UNIQUE;
UPDATE canalizaciones SET folio='CAN-' || id_reporte WHERE folio IS NULL;
ALTER TABLE canalizaciones ADD COLUMN IF NOT EXISTS prioridad VARCHAR(12);
ALTER TABLE canalizaciones ADD COLUMN IF NOT EXISTS vence DATE;
ALTER TABLE canalizaciones ADD COLUMN IF NOT EXISTS evaluacion JSONB NOT NULL DEFAULT '{}';
ALTER TABLE canalizaciones ADD COLUMN IF NOT EXISTS fecha_evaluacion TIMESTAMPTZ;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS responsable_id BIGINT REFERENCES autoridades(id_autoridad);
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS folio_expediente VARCHAR(40) UNIQUE;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS cierre TIMESTAMPTZ;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS resultado_cierre TEXT;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS motivo_cierre TEXT;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS estado_previo_cierre INTEGER REFERENCES estados_reporte(id_estado);
ALTER TABLE envios_correo ADD COLUMN IF NOT EXISTS vigente BOOLEAN NOT NULL DEFAULT TRUE;

INSERT INTO estados_reporte VALUES (9, 'Abierto en seguimiento', 'El expediente fue reabierto')
ON CONFLICT (id_estado) DO NOTHING;

CREATE TABLE IF NOT EXISTS bitacora_casos (
    id_evento BIGSERIAL PRIMARY KEY,
    id_reporte BIGINT NOT NULL REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    id_administrador BIGINT REFERENCES administradores(id_administrador),
    id_autoridad BIGINT REFERENCES autoridades(id_autoridad),
    clase VARCHAR(25) NOT NULL,
    detalle TEXT NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS actividades_caso (
    id_actividad BIGSERIAL PRIMARY KEY,
    id_reporte BIGINT NOT NULL REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    responsable_id BIGINT NOT NULL REFERENCES autoridades(id_autoridad),
    descripcion TEXT NOT NULL,
    vence DATE NOT NULL,
    recurrencia_dias INTEGER CHECK (recurrencia_dias BETWEEN 1 AND 365),
    estado VARCHAR(15) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','completada','eliminada')),
    resultado TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE evidencias ADD COLUMN IF NOT EXISTS id_evento BIGINT REFERENCES bitacora_casos(id_evento) ON DELETE SET NULL;
ALTER TABLE evidencias ADD COLUMN IF NOT EXISTS uso VARCHAR(20) NOT NULL DEFAULT 'reporte';

CREATE TABLE IF NOT EXISTS evaluaciones_servicio (
    id_reporte BIGINT PRIMARY KEY REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    sugerencia TEXT,
    categoria VARCHAR(30) NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS avisos (
    id_aviso BIGSERIAL PRIMARY KEY,
    id_reporte BIGINT NOT NULL REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    id_usuario BIGINT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_autoridad BIGINT REFERENCES autoridades(id_autoridad) ON DELETE CASCADE,
    personal BOOLEAN NOT NULL DEFAULT FALSE,
    mensaje TEXT NOT NULL,
    correo_estado VARCHAR(12),
    intentos INTEGER NOT NULL DEFAULT 0,
    proximo_envio TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (num_nonnulls(id_usuario,id_autoridad) + personal::int = 1)
);
CREATE INDEX IF NOT EXISTS avisos_correo_idx ON avisos (proximo_envio) WHERE correo_estado IN ('pendiente','fallido');
CREATE INDEX IF NOT EXISTS bitacora_casos_reporte_idx ON bitacora_casos (id_reporte,id_evento);
CREATE INDEX IF NOT EXISTS actividades_responsable_idx ON actividades_caso (responsable_id,vence) WHERE estado='pendiente';

ALTER TABLE personas_involucradas ADD COLUMN IF NOT EXISTS interna BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE IF NOT EXISTS comprobantes_cierre (
    codigo CHAR(48) PRIMARY KEY,
    id_reporte BIGINT NOT NULL REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    id_estado INTEGER NOT NULL REFERENCES estados_reporte(id_estado),
    fecha TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS comprobantes_cierre_reporte_idx ON comprobantes_cierre (id_reporte, fecha DESC);

CREATE TABLE IF NOT EXISTS comprobantes_autoridad (
    id_autoridad BIGINT PRIMARY KEY REFERENCES autoridades ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    contenido BYTEA NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revisado_por BIGINT REFERENCES administradores,
    fecha_revision TIMESTAMPTZ,
    observaciones TEXT
);