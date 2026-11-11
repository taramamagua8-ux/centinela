USE centinela_digital;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS evidencias (
  id_evidencia INT NOT NULL AUTO_INCREMENT,
  id_reporte INT NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  ruta_archivo VARCHAR(255) NOT NULL,
  tipo_mime VARCHAR(100) DEFAULT NULL,
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_evidencia),
  KEY id_reporte (id_reporte),
  CONSTRAINT evidencias_ibfk_1 FOREIGN KEY (id_reporte) REFERENCES reportes (id_reporte) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO estados_reporte (id_estado, nombre, descripcion) VALUES
(1, 'Recibido', 'Reporte recibido por Centinela Digital'),
(2, 'En revisión', 'Reporte en proceso de revisión'),
(3, 'Canalizado', 'Reporte canalizado a una institución'),
(4, 'Cerrado', 'Seguimiento concluido');

INSERT IGNORE INTO tipos_violencia (id_tipo_violencia, nombre, descripcion) VALUES
(1, 'Violencia psicológica o emocional', 'Acciones que afectan la autoestima o la salud mental'),
(2, 'Violencia física', 'Uso de la fuerza para causar daño'),
(3, 'Violencia sexual', 'Conductas sexuales sin consentimiento'),
(4, 'Violencia económica', 'Control o limitación injusta de recursos'),
(5, 'Violencia patrimonial', 'Daño, destrucción o retención de bienes');

