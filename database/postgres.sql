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
