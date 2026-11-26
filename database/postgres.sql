-- This schema is isolated from any existing application's public tables.
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

ALTER TABLE instituciones
ADD COLUMN IF NOT EXISTS tipo_institucion VARCHAR(100);

ALTER TABLE instituciones
ADD COLUMN IF NOT EXISTS responsable VARCHAR(150);

ALTER TABLE instituciones
ADD COLUMN IF NOT EXISTS cobertura VARCHAR(100);

ALTER TABLE instituciones
ADD COLUMN IF NOT EXISTS servicios TEXT;

ALTER TABLE instituciones
ADD COLUMN IF NOT EXISTS codigo_institucional VARCHAR(50);

ALTER TABLE instituciones
ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE instituciones
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMPTZ;

ALTER TABLE instituciones
ADD COLUMN IF NOT EXISTS recibe_casos BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE instituciones
ADD COLUMN IF NOT EXISTS prioridad INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS instituciones_nombre_idx
ON instituciones(nombre);

CREATE INDEX IF NOT EXISTS instituciones_tipo_idx
ON instituciones(tipo_institucion);

CREATE INDEX IF NOT EXISTS instituciones_municipio_idx
ON instituciones(municipio);

ALTER TABLE reportes
ADD COLUMN IF NOT EXISTS nivel_urgencia VARCHAR(20);

ALTER TABLE reportes
ADD COLUMN IF NOT EXISTS fuente_reporte VARCHAR(50);

ALTER TABLE reportes
ADD COLUMN IF NOT EXISTS canal_reporte VARCHAR(50);

ALTER TABLE reportes
ADD COLUMN IF NOT EXISTS municipio_hecho VARCHAR(100);

ALTER TABLE reportes
ADD COLUMN IF NOT EXISTS requiere_atencion_inmediata BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE reportes
ADD COLUMN IF NOT EXISTS fecha_ultima_actualizacion TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS reportes_fecha_registro_idx
ON reportes(fecha_registro);

CREATE INDEX IF NOT EXISTS reportes_estado_idx
ON reportes(id_estado);

CREATE INDEX IF NOT EXISTS reportes_riesgo_idx
ON reportes(nivel_riesgo);

CREATE TABLE IF NOT EXISTS stakeholders (
    id_stakeholder BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reporte_stakeholders (
    id_reporte BIGINT NOT NULL REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    id_stakeholder BIGINT NOT NULL REFERENCES stakeholders(id_stakeholder) ON DELETE CASCADE,
    observaciones TEXT,
    PRIMARY KEY(id_reporte,id_stakeholder)
);

CREATE INDEX IF NOT EXISTS reporte_stakeholders_reporte_idx
ON reporte_stakeholders(id_reporte);

CREATE INDEX IF NOT EXISTS reporte_stakeholders_stakeholder_idx
ON reporte_stakeholders(id_stakeholder);

CREATE TABLE IF NOT EXISTS categorias_institucion (
    id_categoria BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS institucion_categoria (
    id_institucion BIGINT NOT NULL REFERENCES instituciones(id_institucion) ON DELETE CASCADE,
    id_categoria BIGINT NOT NULL REFERENCES categorias_institucion(id_categoria) ON DELETE CASCADE,
    PRIMARY KEY(id_institucion,id_categoria)
);

CREATE TABLE IF NOT EXISTS auditoria_cambios (
    id_auditoria BIGSERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(100) NOT NULL,
    id_registro BIGINT,
    accion VARCHAR(50) NOT NULL,
    usuario_tipo VARCHAR(50),
    usuario_id BIGINT,
    descripcion TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS auditoria_fecha_idx
ON auditoria_cambios(fecha);

CREATE INDEX IF NOT EXISTS auditoria_tabla_idx
ON auditoria_cambios(tabla_afectada);

CREATE TABLE IF NOT EXISTS contactos_institucion (
    id_contacto BIGSERIAL PRIMARY KEY,
    id_institucion BIGINT NOT NULL REFERENCES instituciones(id_institucion) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    cargo VARCHAR(150),
    telefono VARCHAR(30),
    correo VARCHAR(150),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS contactos_institucion_idx
ON contactos_institucion(id_institucion);

CREATE TABLE IF NOT EXISTS historial_institucion (
    id_historial BIGSERIAL PRIMARY KEY,
    id_institucion BIGINT NOT NULL REFERENCES instituciones(id_institucion) ON DELETE CASCADE,
    evento VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS historial_institucion_idx
ON historial_institucion(id_institucion);

ALTER TABLE personas_involucradas
ADD COLUMN IF NOT EXISTS edad INTEGER;

ALTER TABLE personas_involucradas
ADD COLUMN IF NOT EXISTS relacion_reporte VARCHAR(100);

ALTER TABLE personas_involucradas
ADD COLUMN IF NOT EXISTS observaciones TEXT;

CREATE INDEX IF NOT EXISTS personas_tipo_idx
ON personas_involucradas(tipo_participacion);

CREATE INDEX IF NOT EXISTS seguimiento_fecha_idx
ON seguimiento_reportes(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS evidencias_fecha_idx
ON evidencias(fecha_subida);