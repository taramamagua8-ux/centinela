-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-10-2026 a las 23:17:02
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `centinela_digital`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id_administrador` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_reporte`
--

CREATE TABLE `estados_reporte` (
  `id_estado` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instituciones`
--

CREATE TABLE `instituciones` (
  `id_institucion` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `sitio_web` varchar(255) DEFAULT NULL,
  `horario` varchar(150) DEFAULT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personas_involucradas`
--

CREATE TABLE `personas_involucradas` (
  `id_persona` int(11) NOT NULL,
  `id_reporte` int(11) NOT NULL,
  `tipo_participacion` varchar(30) NOT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id_reporte` int(11) NOT NULL,
  `folio` varchar(20) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_hecho` datetime DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `es_anonimo` tinyint(1) DEFAULT 1,
  `id_estado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte_tipo_violencia`
--

CREATE TABLE `reporte_tipo_violencia` (
  `id_reporte` int(11) NOT NULL,
  `id_tipo_violencia` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento_reportes`
--

CREATE TABLE `seguimiento_reportes` (
  `id_seguimiento` int(11) NOT NULL,
  `id_reporte` int(11) NOT NULL,
  `id_estado` int(11) NOT NULL,
  `id_administrador` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_actualizacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_violencia`
--

CREATE TABLE `tipos_violencia` (
  `id_tipo_violencia` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id_administrador`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `estados_reporte`
--
ALTER TABLE `estados_reporte`
  ADD PRIMARY KEY (`id_estado`);

--
-- Indices de la tabla `instituciones`
--
ALTER TABLE `instituciones`
  ADD PRIMARY KEY (`id_institucion`);

--
-- Indices de la tabla `personas_involucradas`
--
ALTER TABLE `personas_involucradas`
  ADD PRIMARY KEY (`id_persona`),
  ADD KEY `id_reporte` (`id_reporte`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id_reporte`),
  ADD UNIQUE KEY `folio` (`folio`),
  ADD KEY `id_estado` (`id_estado`);

--
-- Indices de la tabla `reporte_tipo_violencia`
--
ALTER TABLE `reporte_tipo_violencia`
  ADD PRIMARY KEY (`id_reporte`,`id_tipo_violencia`),
  ADD KEY `id_tipo_violencia` (`id_tipo_violencia`);

--
-- Indices de la tabla `seguimiento_reportes`
--
ALTER TABLE `seguimiento_reportes`
  ADD PRIMARY KEY (`id_seguimiento`),
  ADD KEY `id_reporte` (`id_reporte`),
  ADD KEY `id_estado` (`id_estado`),
  ADD KEY `id_administrador` (`id_administrador`);

--
-- Indices de la tabla `tipos_violencia`
--
ALTER TABLE `tipos_violencia`
  ADD PRIMARY KEY (`id_tipo_violencia`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id_administrador` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estados_reporte`
--
ALTER TABLE `estados_reporte`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `instituciones`
--
ALTER TABLE `instituciones`
  MODIFY `id_institucion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personas_involucradas`
--
ALTER TABLE `personas_involucradas`
  MODIFY `id_persona` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `seguimiento_reportes`
--
ALTER TABLE `seguimiento_reportes`
  MODIFY `id_seguimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipos_violencia`
--
ALTER TABLE `tipos_violencia`
  MODIFY `id_tipo_violencia` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `personas_involucradas`
--
ALTER TABLE `personas_involucradas`
  ADD CONSTRAINT `personas_involucradas_ibfk_1` FOREIGN KEY (`id_reporte`) REFERENCES `reportes` (`id_reporte`);

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`id_estado`) REFERENCES `estados_reporte` (`id_estado`);

--
-- Filtros para la tabla `reporte_tipo_violencia`
--
ALTER TABLE `reporte_tipo_violencia`
  ADD CONSTRAINT `reporte_tipo_violencia_ibfk_1` FOREIGN KEY (`id_reporte`) REFERENCES `reportes` (`id_reporte`),
  ADD CONSTRAINT `reporte_tipo_violencia_ibfk_2` FOREIGN KEY (`id_tipo_violencia`) REFERENCES `tipos_violencia` (`id_tipo_violencia`);

--
-- Filtros para la tabla `seguimiento_reportes`
--
ALTER TABLE `seguimiento_reportes`
  ADD CONSTRAINT `seguimiento_reportes_ibfk_1` FOREIGN KEY (`id_reporte`) REFERENCES `reportes` (`id_reporte`),
  ADD CONSTRAINT `seguimiento_reportes_ibfk_2` FOREIGN KEY (`id_estado`) REFERENCES `estados_reporte` (`id_estado`),
  ADD CONSTRAINT `seguimiento_reportes_ibfk_3` FOREIGN KEY (`id_administrador`) REFERENCES `administradores` (`id_administrador`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
