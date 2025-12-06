-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-12-2025 a las 02:28:56
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
-- Base de datos: `pandillas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `authtoken_token`
--

CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `authtoken_token`
--

INSERT INTO `authtoken_token` (`key`, `created`, `user_id`) VALUES
('3a6e82f4f2562c0a03dd45fefb32ea0c657a65f2', '2025-12-04 15:50:27.062119', 7),
('e792f893dbf07e9626216af1a273ccb8c9814ed7', '2025-12-05 19:02:56.886750', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add content type', 4, 'add_contenttype'),
(14, 'Can change content type', 4, 'change_contenttype'),
(15, 'Can delete content type', 4, 'delete_contenttype'),
(16, 'Can view content type', 4, 'view_contenttype'),
(17, 'Can add session', 5, 'add_session'),
(18, 'Can change session', 5, 'change_session'),
(19, 'Can delete session', 5, 'delete_session'),
(20, 'Can view session', 5, 'view_session'),
(21, 'Can add Token', 6, 'add_token'),
(22, 'Can change Token', 6, 'change_token'),
(23, 'Can delete Token', 6, 'delete_token'),
(24, 'Can view Token', 6, 'view_token'),
(25, 'Can add token', 7, 'add_tokenproxy'),
(26, 'Can change token', 7, 'change_tokenproxy'),
(27, 'Can delete token', 7, 'delete_tokenproxy'),
(28, 'Can view token', 7, 'view_tokenproxy'),
(29, 'Can add Usuario', 8, 'add_usuario'),
(30, 'Can change Usuario', 8, 'change_usuario'),
(31, 'Can delete Usuario', 8, 'delete_usuario'),
(32, 'Can view Usuario', 8, 'view_usuario'),
(33, 'Can add Dirección', 9, 'add_direccion'),
(34, 'Can change Dirección', 9, 'change_direccion'),
(35, 'Can delete Dirección', 9, 'delete_direccion'),
(36, 'Can view Dirección', 9, 'view_direccion'),
(37, 'Can add Pandilla', 10, 'add_pandilla'),
(38, 'Can change Pandilla', 10, 'change_pandilla'),
(39, 'Can delete Pandilla', 10, 'delete_pandilla'),
(40, 'Can view Pandilla', 10, 'view_pandilla');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `delitos`
--

CREATE TABLE `delitos` (
  `id_delito` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `delitos`
--

INSERT INTO `delitos` (`id_delito`, `nombre`) VALUES
(2, 'Homicidio'),
(3, 'Robo'),
(4, 'Robo a casa habitación'),
(5, 'Robo a transeúnte'),
(6, 'Robo a vehículo'),
(7, 'Tráfico de drogas'),
(8, 'Narcotráfico'),
(9, 'Extorsión'),
(10, 'Secuestro'),
(11, 'Asalto'),
(12, 'Vandalismo'),
(13, 'Amenazas'),
(14, 'Lesiones'),
(15, 'Portación de arma de fuego'),
(16, 'Portación de arma blanca'),
(17, 'Violencia familiar'),
(18, 'Violación'),
(19, 'Abuso sexual'),
(20, 'Tráfico de personas'),
(21, 'Lavado de dinero'),
(22, 'Posesión de drogas'),
(23, 'Venta de drogas'),
(24, 'Intimidación'),
(25, 'Coacción'),
(26, 'Daño en propiedad ajena'),
(27, 'Allanamiento de morada'),
(28, 'Despojo'),
(29, 'Fraude'),
(30, 'Estafa'),
(31, 'Usurpación de identidad'),
(32, 'Pandillerismo'),
(33, 'Asociación delictuosa'),
(34, 'Portación de drogas'),
(35, 'Consumo de drogas en vía pública'),
(36, 'Alteración del orden público'),
(37, 'Resistencia a la autoridad'),
(38, 'Agresión a la autoridad'),
(39, 'Falsificación de documentos'),
(40, 'Uso de documentos falsos'),
(41, 'Tráfico de armas'),
(42, 'Portación de arma prohibida');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direcciones`
--

CREATE TABLE `direcciones` (
  `id_direccion` int(11) NOT NULL,
  `calle` varchar(255) NOT NULL,
  `numero` varchar(50) NOT NULL,
  `colonia` varchar(255) NOT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `direcciones`
--

INSERT INTO `direcciones` (`id_direccion`, `calle`, `numero`, `colonia`, `codigo_postal`, `latitud`, `longitud`) VALUES
(1, 'Campo Santo', '214', 'Tercera Grande 2', '78143', 22.1806100, -100.9683800),
(2, 'San Fernando', '228', 'Sauzalito 4ta Sección', '78116', 22.1940270, -101.0017620),
(3, 'Río Paisanos', '', 'Martires de la Revolución 1', '78116', 22.1995120, -100.9979850),
(4, '2da Privada Sol', '105', 'Valle Verde', '78144', 22.1803100, -101.0054600),
(5, 'Anáhuac', '70-100', 'Martires de la Revolución 1', '78110', 22.2008150, -100.9880120),
(6, 'Primera de Garita de Saltillo', '100', 'Martires de la Revolución 1', '78110', 22.2004000, -100.9892200),
(7, 'Prolongación Moctezuma', '173', 'Barrio de Tlaxcala', '78038', 22.1621770, -100.9771810),
(8, '16 de Septiembre', '505', 'Barrio de Santiago', '78049', 22.1632800, -100.9782400),
(9, 'Calle Tangamanga', '126', 'Barrio de Taxcala', '78038', 22.1597700, -100.9726000),
(10, '1ª Privada de Calle Sol', '-', 'Rural Atlas 3ra Sección', '78144', 22.1803743, -101.0055801),
(11, 'Urbano Villalón', '500', 'Himno Nacional 2da Secc', '78369', 22.1238500, -100.9834700),
(12, 'Av. Universidad', '1250', 'Zona Universitaria', NULL, 22.1980806, -101.0191069),
(13, 'Blvd. Salvador Nava', '2845', 'Tierra Blanca', NULL, 22.2044778, -101.0160550),
(14, 'Calle Industrias', '567', 'Industrial Aviación', NULL, 22.2185265, -100.9724515),
(15, 'Av. Himno Nacional', '1890', 'Tierra Blanca', NULL, 22.2131050, -100.9327801),
(16, 'Calle Reforma', '342', 'Tierra Blanca', NULL, 22.2054055, -100.9222381),
(17, 'Av. Carranza', '2345', 'Centro Sur', NULL, 22.1359707, -100.9563152),
(18, 'Blvd. Fray Diego de la Magdalena', '1567', 'Tlaxcala', NULL, 22.1281250, -100.9758834),
(19, 'Calle Zaragoza', '890', 'Tlaxcala', NULL, 22.1390283, -101.0016146),
(20, 'Av. Venustiano Carranza', '3456', 'Tlaxcala', NULL, 22.1259710, -101.0171827),
(21, 'Calle Hidalgo', '567', 'Centro Sur', NULL, 22.1155634, -100.9999287),
(22, 'Av. Industrias', '1234', 'Industrial Aviación', NULL, 22.1691838, -100.9570286),
(23, 'Blvd. Antonio Rocha Cordero', '2789', 'Industrial Aviación', NULL, 22.1359707, -100.9563152),
(24, 'Calle 5 de Mayo', '456', 'Centro Oriente', NULL, 22.1009685, -100.9524824),
(25, 'Av. Fray Diego de la Magdalena', '1890', 'Industrial Aviación', NULL, 22.1152030, -100.9263403),
(26, 'Calle Morelos', '234', 'Centro Oriente', NULL, 22.1258643, -100.9192584),
(27, 'Blvd. Salvador Nava', '3456', 'Tierra Blanca', NULL, 22.1980806, -101.0191069),
(28, 'Av. Universidad', '2789', 'Zona Universitaria', NULL, 22.1700000, -101.0016670),
(29, 'Calle Allende', '678', 'Tierra Blanca', NULL, 22.1390283, -101.0016146),
(30, 'Blvd. Fray Diego de la Magdalena', '2345', 'Tierra Blanca', NULL, 22.1259710, -101.0171827),
(31, 'Av. Carranza', '123', 'Tierra Blanca', NULL, 22.1322477, -101.0338589),
(32, 'Plaza de Armas', '1', 'Centro Histórico', NULL, 22.1700000, -101.0016670),
(33, 'Calle Hidalgo', '456', 'Centro Histórico', NULL, 22.1732495, -100.9708684),
(34, 'Av. Venustiano Carranza', '789', 'Centro Histórico', NULL, 22.1712311, -100.9672749),
(35, 'Plaza de los Fundadores', '2', 'Centro Histórico', NULL, 22.1691838, -100.9570286),
(36, 'Calle Zaragoza', '234', 'Centro Histórico', NULL, 22.1359707, -100.9563152),
(37, 'Reforma', '180', 'Centro', '78000', 22.1596300, -100.9731500);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(9, 'api', 'direccion'),
(10, 'api', 'pandilla'),
(8, 'api', 'usuario'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(6, 'authtoken', 'token'),
(7, 'authtoken', 'tokenproxy'),
(4, 'contenttypes', 'contenttype'),
(5, 'sessions', 'session');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-11-27 01:13:49.864621'),
(2, 'api', '0001_initial', '2025-11-27 01:14:00.556060'),
(3, 'admin', '0001_initial', '2025-11-27 01:14:00.633270'),
(4, 'admin', '0002_logentry_remove_auto_add', '2025-11-27 01:14:00.636920'),
(5, 'admin', '0003_logentry_add_action_flag_choices', '2025-11-27 01:14:00.640194'),
(6, 'contenttypes', '0002_remove_content_type_name', '2025-11-27 01:14:00.679191'),
(7, 'auth', '0001_initial', '2025-11-27 01:14:00.832375'),
(8, 'auth', '0002_alter_permission_name_max_length', '2025-11-27 01:14:00.861060'),
(9, 'auth', '0003_alter_user_email_max_length', '2025-11-27 01:14:00.865138'),
(10, 'auth', '0004_alter_user_username_opts', '2025-11-27 01:14:00.872912'),
(11, 'auth', '0005_alter_user_last_login_null', '2025-11-27 01:14:00.876608'),
(12, 'auth', '0006_require_contenttypes_0002', '2025-11-27 01:14:00.878181'),
(13, 'auth', '0007_alter_validators_add_error_messages', '2025-11-27 01:14:00.881652'),
(14, 'auth', '0008_alter_user_username_max_length', '2025-11-27 01:14:00.892158'),
(15, 'auth', '0009_alter_user_last_name_max_length', '2025-11-27 01:14:00.895870'),
(16, 'auth', '0010_alter_group_name_max_length', '2025-11-27 01:14:00.903619'),
(17, 'auth', '0011_update_proxy_permissions', '2025-11-27 01:14:00.909119'),
(18, 'auth', '0012_alter_user_first_name_max_length', '2025-11-27 01:14:00.912736'),
(19, 'authtoken', '0001_initial', '2025-11-27 01:14:00.974290'),
(20, 'authtoken', '0002_auto_20160226_1747', '2025-11-27 01:14:00.984696'),
(21, 'authtoken', '0003_tokenproxy', '2025-11-27 01:14:00.987038'),
(22, 'sessions', '0001_initial', '2025-11-27 01:14:01.011271'),
(23, 'api', '0002_add_django_fields', '2025-11-27 01:14:26.036776'),
(24, 'api', '0003_add_genero_field', '2025-11-29 22:35:40.504571'),
(25, 'api', '0004_add_direccion_model', '2025-11-29 23:56:31.522883'),
(26, 'api', '0005_add_pandilla_model', '2025-11-29 23:58:32.918388'),
(27, 'api', '0006_add_integrante_and_imagenes', '2025-12-02 23:36:55.842583'),
(28, 'api', '0007_add_evento_model', '2025-12-03 00:21:15.444245'),
(29, 'api', '0009_add_rivalidad_redsocial_models', '2025-12-03 00:42:35.146660'),
(30, 'api', '0010_add_cargo_to_usuario', '2025-12-04 03:33:14.296003');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('0m1k6rn0ambt21odjndubwt4sebhnich', '.eJxVjEEOgjAUBe_y16ZpKdKWpXvOQN7_LRY1JaGwMt7dkLDQ7cxk3jRi3_K417SOc6SeDF1-GUOeqRwiPlDui5KlbOvM6kjUaasalphet7P9G2TUTD2Ji9ZbtCysDSbdORf5GpKRTgubFBpox6mJWnvw1ImfAmwL4xHAFvT5Av_NONM:1vOQcK:rg4WgEgLO2DfmoXT5422C1fCEZXruHWO-Bdw-HyfZe8', '2025-11-27 01:46:16.722602'),
('1er6i8c7xssehwdrwtagg46q6si33mnf', '.eJxVjLsOwjAMAP_FM4riJnHTjuz9hshxDC2gVOpjQvw7qtQB1rvTvSHxvo1pX3VJU4EeHFx-WWZ5aj1EeXC9z0bmui1TNkdiTruaYS76up7t32DkdYQeQneLanNkVkFLHrPHJmdB9EKeFMlFZ33bdG2w6ihiCBaFHYVCggSfL8uTNp0:1vPU6Z:lhVydGi_9ZUpoOLajUXpJ0Q-q3y9TT9wdK0kucilG-8', '2025-11-29 23:41:51.688314'),
('25sexudm025n0ckv8ss6j8cfohlos7r8', '.eJxVjEEOwiAQRe_C2hCmwJS6dN8zNMMwStVAUtqV8e7apAvd_vfef6mJtjVPW5NlmpM6K6tOv1skfkjZQbpTuVXNtazLHPWu6IM2PdYkz8vh_h1kavlb--EaxMRAJAwGHUQHXYwM4BgdCqAN1ri-G3pvxGIA7w0wWfQJGVC9P8uTNp0:1vRXjp:DlfbS7_q1SBage79aebm3RqXaaaaNi41dBIQQ8yWM0U', '2025-12-05 15:58:53.749229'),
('371rbb8uhq3lmo69xgxmsvqeapudi074', '.eJxVjEsKwjAUAO_y1hKSNCWxS_eeoby8j6lKAv2sineXQhe6nRlmhxG3tYzbIvM4MQzg4fLLMtJL6iH4ifXRDLW6zlM2R2JOu5h7Y3nfzvZvUHApMECfJSbviaxalMicxAW03TUnjk4wMDuWThMSi5K4Xr0qWc2ROuEAny8cqToK:1vORcZ:Bsgg8YQgeEbZLvmE03b2dm9uiNwY_jE3FAmBos1WmXU', '2025-11-27 02:50:35.601110'),
('3salsc6h76vis3g1mqyey5fh5lqrpjwc', '.eJxVjLsOwjAMAP_FM4riJnHTjuz9hshxDC2gVOpjQvw7qtQB1rvTvSHxvo1pX3VJU4EeHFx-WWZ5aj1EeXC9z0bmui1TNkdiTruaYS76up7t32DkdYQeQneLanNkVkFLHrPHJmdB9EKeFMlFZ33bdG2w6ihiCBaFHYVCggSfL8uTNp0:1vQtvC:ekJXs4EVVydCDBr6ENbfZhmNzHkZajAPn4HP0XYNGJg', '2025-12-03 21:27:58.898731'),
('5ptbtlpbtljsgp13trjhjksr8t2bsdai', '.eJxVjLsOwjAMAP_FM4riJnHTjuz9hshxDC2gVOpjQvw7qtQB1rvTvSHxvo1pX3VJU4EeHFx-WWZ5aj1EeXC9z0bmui1TNkdiTruaYS76up7t32DkdYQeQneLanNkVkFLHrPHJmdB9EKeFMlFZ33bdG2w6ihiCBaFHYVCggSfL8uTNp0:1vPVF1:3JlDr0OZIDviPtQutYiiby7yqdGqO-qGm6eRhqPMEoU', '2025-11-30 00:54:39.918069'),
('6rdrqzqgts1umnhhst2h7kav852bec44', '.eJxVjEEOwiAQRe_C2hCmwJS6dN8zNMMwStVAUtqV8e7apAvd_vfef6mJtjVPW5NlmpM6K6tOv1skfkjZQbpTuVXNtazLHPWu6IM2PdYkz8vh_h1kavlb--EaxMRAJAwGHUQHXYwM4BgdCqAN1ri-G3pvxGIA7w0wWfQJGVC9P8uTNp0:1vRZIT:dIlQ8akNWt04gwiss6qNJdK_38NbTpzsWMKaPsB-8jg', '2025-12-05 17:38:45.053872'),
('6svkxfhhpofia2azr44y6bsngp9lzneu', '.eJxVjDkOwjAQAP-yNbJ8O05JzxusXR84gGwpTirE31GkFNDOjOYNAfethn3kNSwJZlBw-WWE8ZnbIdID272z2Nu2LsSOhJ12sFtP-XU9279BxVFhBsGtciJr60jYVHyUORdvVEHDk_RFOYOWeJEataJYiIvJCZEUOm_l5ODzBdjfN3Q:1vPB8G:MaBP5LLJTukO8i4IUH0ZtYpwQU_5oPp5N0GKZpL3-Xo', '2025-11-29 03:26:20.216300'),
('77l245w4n2x9yhbxtd4a43vhnan3xtoc', '.eJxVjEsKwjAUAO_y1hKSNCWxS_eeoby8j6lKAv2sineXQhe6nRlmhxG3tYzbIvM4MQzg4fLLMtJL6iH4ifXRDLW6zlM2R2JOu5h7Y3nfzvZvUHApMECfJSbviaxalMicxAW03TUnjk4wMDuWThMSi5K4Xr0qWc2ROuEAny8cqToK:1vOkU2:0SJOukt_avRXMA1pkdA0ycsHfygSC35nnMXApRkJUDU', '2025-11-27 22:59:02.268173'),
('7a2huwvdsnegsz3ocnhqm87t9x37i86z', '.eJxVjEEOgjAUBe_y16ZpKdKWpXvOQN7_LRY1JaGwMt7dkLDQ7cxk3jRi3_K417SOc6SeDF1-GUOeqRwiPlDui5KlbOvM6kjUaasalphet7P9G2TUTD2Ji9ZbtCysDSbdORf5GpKRTgubFBpox6mJWnvw1ImfAmwL4xHAFvT5Av_NONM:1vOQq7:pLppowkZ9lEgeQSwUvYILjwLfiJ9gnbdmhgCdETk_Pk', '2025-11-27 02:00:31.514885'),
('7dy4jto6r9z89orbqtkb6etwvhop5gnc', '.eJxVjEEOwiAQRe_C2hCmwJS6dN8zNMMwStVAUtqV8e7apAvd_vfef6mJtjVPW5NlmpM6K6tOv1skfkjZQbpTuVXNtazLHPWu6IM2PdYkz8vh_h1kavlb--EaxMRAJAwGHUQHXYwM4BgdCqAN1ri-G3pvxGIA7w0wWfQJGVC9P8uTNp0:1vRVZQ:qFjRUt9CH7mDcjtBegRKjXPeRz5n1K4nT5leJn5KVss', '2025-12-05 13:40:00.315589'),
('81uoxgfexxf78h8mzckw3krkft8tiisj', '.eJxVjMEOgjAQRP-lZ9OwLtDWo3e_odnubi1qIKFwMv67kHDQ0yTz3szbRFqXEteqcxzEXAw05vRbJuKnjjuRB433yfI0LvOQ7K7Yg1Z7m0Rf18P9OyhUy7ZOru3Rs4Y2iwB0nlgIEjcIAtRC6IJiRmxUXTjTFhQysHfYp9w5NJ8vFVQ4YA:1vRZKc:Pt6kBRQKLirAjYBQsypw0wl7O8kgm1EM-6Ni2W6q108', '2025-12-05 17:40:58.429129'),
('9b4k026fchitgraj9sxx6xft5bw1fa7t', '.eJxVjLsOwjAMAP_FM4riJnHTjuz9hshxDC2gVOpjQvw7qtQB1rvTvSHxvo1pX3VJU4EeHFx-WWZ5aj1EeXC9z0bmui1TNkdiTruaYS76up7t32DkdYQeQneLanNkVkFLHrPHJmdB9EKeFMlFZ33bdG2w6ihiCBaFHYVCggSfL8uTNp0:1vRLxe:S9u36nu17g6YytPpJSV4n1KUdxT2Q4_5WPgsaKxgGIU', '2025-12-05 03:24:22.406792'),
('9im39g5vrp7xaglljfgso6f5cow3ucs2', '.eJxVjEEOgjAUBe_y16ZpKdKWpXvOQN7_LRY1JaGwMt7dkLDQ7cxk3jRi3_K417SOc6SeDF1-GUOeqRwiPlDui5KlbOvM6kjUaasalphet7P9G2TUTD2Ji9ZbtCysDSbdORf5GpKRTgubFBpox6mJWnvw1ImfAmwL4xHAFvT5Av_NONM:1vOS96:mQRHGrxh6t3DmmJDWEudwFkxCEd9idLHKXESlWNJsL8', '2025-11-27 03:24:12.700075'),
('a9gs9y7jv1s6e1ao63io1pb9f7jwykv9', '.eJxVjEEOgjAUBe_y16ZpKdKWpXvOQN7_LRY1JaGwMt7dkLDQ7cxk3jRi3_K417SOc6SeDF1-GUOeqRwiPlDui5KlbOvM6kjUaasalphet7P9G2TUTD2Ji9ZbtCysDSbdORf5GpKRTgubFBpox6mJWnvw1ImfAmwL4xHAFvT5Av_NONM:1vOS44:UCRqVtKckl25kIsphCJ_9EQQ0UBDb1egnWMXBib07yE', '2025-11-27 03:19:00.421002'),
('at7whjk2r4zp6fp37qubx0s6tk7ect4t', '.eJxVjEEOwiAQAP-yZ0NQFgg9evcNZGEXqRpISnsy_t006UGvM5N5Q6RtrXEbssSZYQIHp1-WKD-l7YIf1O5d5d7WZU5qT9Rhh7p1ltf1aP8GlUaFCYQ1JgxE1gYvNnMplLmgubDREpCtM55RWw6G0OVkUjFU0CMXffYIny8MSTiX:1vPO3g:Tig_vdGQaODHsENcMgXqPK0dzklmQVrNzVQcS75PQ2Q', '2025-11-29 17:14:28.440120'),
('axx76gicaxmx7hiocecda1su1gwc08i0', '.eJxVjEsKwjAUAO_y1hKSNCWxS_eeoby8j6lKAv2sineXQhe6nRlmhxG3tYzbIvM4MQzg4fLLMtJL6iH4ifXRDLW6zlM2R2JOu5h7Y3nfzvZvUHApMECfJSbviaxalMicxAW03TUnjk4wMDuWThMSi5K4Xr0qWc2ROuEAny8cqToK:1vOS7v:pUDXToAjYiscQ2yMPHzp8NclWSl82xjNDNghN4M7yT8', '2025-11-27 03:22:59.910391'),
('chemrahph441bzws5qffqbqurip00by2', '.eJxVjLsOwjAMAP_FM4riJnHTjuz9hshxDC2gVOpjQvw7qtQB1rvTvSHxvo1pX3VJU4EeHFx-WWZ5aj1EeXC9z0bmui1TNkdiTruaYS76up7t32DkdYQeQneLanNkVkFLHrPHJmdB9EKeFMlFZ33bdG2w6ihiCBaFHYVCggSfL8uTNp0:1vR0Ot:dpRuKybJdb8GziP-TeMaYk44uvnDbx9vhOiLzT6GRSs', '2025-12-04 04:23:03.587685'),
('dlp6zblomqfzw75457gmzftcagwel0qp', '.eJxVjEEOgjAUBe_y16ZpKdKWpXvOQN7_LRY1JaGwMt7dkLDQ7cxk3jRi3_K417SOc6SeDF1-GUOeqRwiPlDui5KlbOvM6kjUaasalphet7P9G2TUTD2Ji9ZbtCysDSbdORf5GpKRTgubFBpox6mJWnvw1ImfAmwL4xHAFvT5Av_NONM:1vOS7j:ktRdn_LxFGdTuWoph8JFb_DWRTGyNLkrT1K5pTMurD8', '2025-11-27 03:22:47.519978'),
('dlzp5o92d86cpk4n0bxh6omnkn5fgqen', '.eJxVjM0OgjAQBt9lz6bhb2nL0bvP0HxsuxY1kFA4Gd_dkHDQ68xk3hSwbznsJa1hijRQT5dfNkKeaT5EfGC-L0aWeVun0RyJOW0xtyWm1_Vs_wYZJdNAzkaws-xqbnov7Ku2qVzXKgB0yfmaWdkyFCIQZThNKuAqeu3F0ucL1Jw4fA:1vQtv0:OsxW9fGp2UUp5taYXbI030a6oiKSHDCDfsIpBUsitsI', '2025-12-03 21:27:46.091566'),
('e9aorggjkavm4mx3u55jmz31elrixsln', '.eJxVjDkOwjAQAP-yNbJ8O05JzxusXR84gGwpTirE31GkFNDOjOYNAfethn3kNSwJZlBw-WWE8ZnbIdID272z2Nu2LsSOhJ12sFtP-XU9279BxVFhBsGtciJr60jYVHyUORdvVEHDk_RFOYOWeJEataJYiIvJCZEUOm_l5ODzBdjfN3Q:1vPO4O:CVlXkpiTSE03VRwewWJe9fgRkuEjQLlS06JiGglwOW0', '2025-11-29 17:15:12.718722'),
('eae9w0m8tgd7qam4zgp84w8z2t9y8nck', '.eJxVjDkOwjAQAP-yNbJ8O05JzxusXR84gGwpTirE31GkFNDOjOYNAfethn3kNSwJZlBw-WWE8ZnbIdID272z2Nu2LsSOhJ12sFtP-XU9279BxVFhBsGtciJr60jYVHyUORdvVEHDk_RFOYOWeJEataJYiIvJCZEUOm_l5ODzBdjfN3Q:1vPTfD:G-YPsUdqEbgHGatkDLdJAu9LhgKicamn7Oq17rXizZs', '2025-11-29 23:13:35.854245'),
('g6nxxtwpbrvbqin76ix13fbjkeekrtjr', '.eJxVjEEOwiAQRe_C2hCmwJS6dN8zNMMwStVAUtqV8e7apAvd_vfef6mJtjVPW5NlmpM6K6tOv1skfkjZQbpTuVXNtazLHPWu6IM2PdYkz8vh_h1kavlb--EaxMRAJAwGHUQHXYwM4BgdCqAN1ri-G3pvxGIA7w0wWfQJGVC9P8uTNp0:1vRb4y:aprrwgpNpri9ANYai9HkaiUq9n2JDLeSOniELK2RlY8', '2025-12-05 19:32:56.916640'),
('gmsbg4qkd2v379yl3vmd8055s65e6ukp', '.eJxVjEEOgjAUBe_y16ZpKdKWpXvOQN7_LRY1JaGwMt7dkLDQ7cxk3jRi3_K417SOc6SeDF1-GUOeqRwiPlDui5KlbOvM6kjUaasalphet7P9G2TUTD2Ji9ZbtCysDSbdORf5GpKRTgubFBpox6mJWnvw1ImfAmwL4xHAFvT5Av_NONM:1vOQcA:b56PuROSHBa0OrdwK7GFt2Hty-WKcPltauYISu7vSak', '2025-11-27 01:46:06.302029'),
('ip0bj58g6zuwmdzq95ac71b1g7sacs8o', '.eJxVjEsKwjAUAO_y1hKSNCWxS_eeoby8j6lKAv2sineXQhe6nRlmhxG3tYzbIvM4MQzg4fLLMtJL6iH4ifXRDLW6zlM2R2JOu5h7Y3nfzvZvUHApMECfJSbviaxalMicxAW03TUnjk4wMDuWThMSi5K4Xr0qWc2ROuEAny8cqToK:1vORyU:8iMdebfaT6UUJ0xrHe8tt3B5J6cKgCD1KoAO-y0yEeA', '2025-11-27 03:13:14.778820'),
('jywewh1g82c05rftwjwyprwefx057hst', '.eJxVjEsKwjAUAO_y1hKSNCWxS_eeoby8j6lKAv2sineXQhe6nRlmhxG3tYzbIvM4MQzg4fLLMtJL6iH4ifXRDLW6zlM2R2JOu5h7Y3nfzvZvUHApMECfJSbviaxalMicxAW03TUnjk4wMDuWThMSi5K4Xr0qWc2ROuEAny8cqToK:1vOjcL:opEbrw0k5ed0IJp6g9ZJ5GzbtvF1Kcf2Z4jYDz7abxU', '2025-11-27 22:03:33.522842'),
('k1i2scfsi43buvn1cuggwsjalj1hq6oh', '.eJxVjLsOwjAMAP_FM4riJnHTjuz9hshxDC2gVOpjQvw7qtQB1rvTvSHxvo1pX3VJU4EeHFx-WWZ5aj1EeXC9z0bmui1TNkdiTruaYS76up7t32DkdYQeQneLanNkVkFLHrPHJmdB9EKeFMlFZ33bdG2w6ihiCBaFHYVCggSfL8uTNp0:1vRLcg:s9jPdmeUA3jIwMpe7bCH9xGC5HBacHdYCn-r2tmk42c', '2025-12-05 03:02:42.984660'),
('k3o03oamdpzchyaob7wt30rc28p69xd4', '.eJxVjEEOwiAQAP-yZ0NQFgg9evcNZGEXqRpISnsy_t006UGvM5N5Q6RtrXEbssSZYQIHp1-WKD-l7YIf1O5d5d7WZU5qT9Rhh7p1ltf1aP8GlUaFCYQ1JgxE1gYvNnMplLmgubDREpCtM55RWw6G0OVkUjFU0CMXffYIny8MSTiX:1vPB7t:zLLu0SbXzP-PLv-7IT67NnF9grItbC-VMbF1WO6paT4', '2025-11-29 03:25:57.344199'),
('kkklh2rlkqo87h01deoiduawsfsaly7d', '.eJxVjEEOgjAUBe_y16ZpKdKWpXvOQN7_LRY1JaGwMt7dkLDQ7cxk3jRi3_K417SOc6SeDF1-GUOeqRwiPlDui5KlbOvM6kjUaasalphet7P9G2TUTD2Ji9ZbtCysDSbdORf5GpKRTgubFBpox6mJWnvw1ImfAmwL4xHAFvT5Av_NONM:1vORdW:TC3r0xXMiAarEKmWV56JEpmqwVrlgwwbR5qql16WZ9Y', '2025-11-27 02:51:34.917299'),
('nb4xyquias3x1px6qauybd5enfurpznt', '.eJxVjMsOwiAQAP9lz4bwKtAevfsNhGUXqRqalPZk_HfTpAe9zkzmDTHtW4175zXOBBMEuPwyTPnJ7RD0SO2-iLy0bZ1RHIk4bRe3hfh1Pdu_QU29wgRcirFKmQGNtMpxoKxYG9Io7Yg2lxw8sQ3aFIXOS0ZKg8QURi9d0RY-X-oKN_k:1vRLhw:Bt7FUntL0vBbymaFmLMoChPMzbJoVoYLXv4FiJVQAsg', '2025-12-05 03:08:08.501436'),
('ocf5zu6fe76bh0im1nuzqi3m5pcvycd6', '.eJxVjLsOwjAMAP_FM4riJnHTjuz9hshxDC2gVOpjQvw7qtQB1rvTvSHxvo1pX3VJU4EeHFx-WWZ5aj1EeXC9z0bmui1TNkdiTruaYS76up7t32DkdYQeQneLanNkVkFLHrPHJmdB9EKeFMlFZ33bdG2w6ihiCBaFHYVCggSfL8uTNp0:1vPV1d:uEA_o2bX-DNTP3so0lDEbqk6MIGDBwu33YbyloZ4y8w', '2025-11-30 00:40:49.175743'),
('pj3t05c17bg4dj2qxldlcj8r9yywkm6m', '.eJxVjEsKwjAUAO_y1hKSNCWxS_eeoby8j6lKAv2sineXQhe6nRlmhxG3tYzbIvM4MQzg4fLLMtJL6iH4ifXRDLW6zlM2R2JOu5h7Y3nfzvZvUHApMECfJSbviaxalMicxAW03TUnjk4wMDuWThMSi5K4Xr0qWc2ROuEAny8cqToK:1vOQrA:we8glCDKDU8255QHeYJHRFcnglIUyCsXjvjoKPSNFN8', '2025-11-27 02:01:36.961776'),
('pp82ba5zz4fw5zgnlndxk22l87o6qx61', '.eJxVjEEOwiAQAP-yZ0NQFgg9evcNZGEXqRpISnsy_t006UGvM5N5Q6RtrXEbssSZYQIHp1-WKD-l7YIf1O5d5d7WZU5qT9Rhh7p1ltf1aP8GlUaFCYQ1JgxE1gYvNnMplLmgubDREpCtM55RWw6G0OVkUjFU0CMXffYIny8MSTiX:1vPU22:9giQmLtTTBYs8vnV4eVYOCEFrb1Wo5iijrrOQAXAZy4', '2025-11-29 23:37:10.713522'),
('qm1m7mizd53j4v53j1w06qb3hqxgen0a', '.eJxVjLsOwjAMAP_FM4riJnHTjuz9hshxDC2gVOpjQvw7qtQB1rvTvSHxvo1pX3VJU4EeHFx-WWZ5aj1EeXC9z0bmui1TNkdiTruaYS76up7t32DkdYQeQneLanNkVkFLHrPHJmdB9EKeFMlFZ33bdG2w6ihiCBaFHYVCggSfL8uTNp0:1vRKWj:eYnWWd8x09ksdaUl680-jX-mfy-31pZFKSf7PcZT4-s', '2025-12-05 01:52:29.677995'),
('sh9a4mazdueg9iiawv8uwr6nim7r1e9s', '.eJxVjEEOgjAUBe_y16ZpKdKWpXvOQN7_LRY1JaGwMt7dkLDQ7cxk3jRi3_K417SOc6SeDF1-GUOeqRwiPlDui5KlbOvM6kjUaasalphet7P9G2TUTD2Ji9ZbtCysDSbdORf5GpKRTgubFBpox6mJWnvw1ImfAmwL4xHAFvT5Av_NONM:1vOluf:UcVtB9eUgvCsjdIENqQILqj02UczeqV2k6NtrJJX_RA', '2025-11-28 00:30:37.356345'),
('tif165gxvir729v2basiu54b0s0ntmtr', '.eJxVjEEOwiAQAP-yZ0NQFgg9evcNZGEXqRpISnsy_t006UGvM5N5Q6RtrXEbssSZYQIHp1-WKD-l7YIf1O5d5d7WZU5qT9Rhh7p1ltf1aP8GlUaFCYQ1JgxE1gYvNnMplLmgubDREpCtM55RWw6G0OVkUjFU0CMXffYIny8MSTiX:1vPTeY:05FuRaqa0983UP9S2F7xXQiBw8k7mr7NqTJuHhX89GY', '2025-11-29 23:12:54.887245'),
('timqp6txwnwzo5yl8z6pgwqz4c3kpy2k', '.eJxVjEsKwjAUAO_y1hKSNCWxS_eeoby8j6lKAv2sineXQhe6nRlmhxG3tYzbIvM4MQzg4fLLMtJL6iH4ifXRDLW6zlM2R2JOu5h7Y3nfzvZvUHApMECfJSbviaxalMicxAW03TUnjk4wMDuWThMSi5K4Xr0qWc2ROuEAny8cqToK:1vRLtG:6mwZ8gUQe6Qa2EhNkwyeY2mQHFA6IOERP1rypKPUq2M', '2025-12-05 03:19:50.892389'),
('tqx51h3zvzcb4su74sjnt3eyhe33xwt4', '.eJxVjMsOwiAQAP9lz4bIs9Cj934DWVhWqoYmpT0Z_9006UGvM5N5Q8R9q3HvZY0zwQgeLr8sYX6Wdgh6YLsvIi9tW-ckjkSctotpofK6ne3foGKvMEJhrwo6b7K2KKU1yWWjNOM1JzkEbVwKPlgmrwujJceBGCUp5fwQkobPF-5gOB0:1vRLid:pOhdIY-6ngPoYI4Fq_rDwlltHYTjFPE6GSYzafus2wY', '2025-12-05 03:08:51.045801'),
('u42ckhu1sn63ednwezai22fg6lq7m99i', '.eJxVjDkOwjAQAP-yNbJ8O05JzxusXR84gGwpTirE31GkFNDOjOYNAfethn3kNSwJZlBw-WWE8ZnbIdID272z2Nu2LsSOhJ12sFtP-XU9279BxVFhBsGtciJr60jYVHyUORdvVEHDk_RFOYOWeJEataJYiIvJCZEUOm_l5ODzBdjfN3Q:1vPAg5:Tc8rL8Gb9zEamnv-GdWbT2MCB6OetUMd7FK8_m6krpw', '2025-11-29 02:57:13.372872'),
('w5by4n56b7cpajikgtj4nk6jpaq5y1ed', '.eJxVjEEOgjAUBe_y16ZpKdKWpXvOQN7_LRY1JaGwMt7dkLDQ7cxk3jRi3_K417SOc6SeDF1-GUOeqRwiPlDui5KlbOvM6kjUaasalphet7P9G2TUTD2Ji9ZbtCysDSbdORf5GpKRTgubFBpox6mJWnvw1ImfAmwL4xHAFvT5Av_NONM:1vRLt4:FxkHljQ7ZjHN1E5JhF9YpUkRLumwY76SxBabEVkeRnU', '2025-12-05 03:19:38.940097'),
('w8gkiihdkw05qc88t351aocd7foh1zeu', '.eJxVjEEOwiAQRe_C2hCmwJS6dN8zNMMwStVAUtqV8e7apAvd_vfef6mJtjVPW5NlmpM6K6tOv1skfkjZQbpTuVXNtazLHPWu6IM2PdYkz8vh_h1kavlb--EaxMRAJAwGHUQHXYwM4BgdCqAN1ri-G3pvxGIA7w0wWfQJGVC9P8uTNp0:1vRBcF:-H-hEGFPW5gZDwloNYbJiXf9cwxIrQd6vez4SS-J0Xw', '2025-12-04 16:21:35.878169'),
('x6ft60miv6qk6lksyhrfuog80tet4w55', '.eJxVjLsOwjAMAP_FM4riJnHTjuz9hshxDC2gVOpjQvw7qtQB1rvTvSHxvo1pX3VJU4EeHFx-WWZ5aj1EeXC9z0bmui1TNkdiTruaYS76up7t32DkdYQeQneLanNkVkFLHrPHJmdB9EKeFMlFZ33bdG2w6ihiCBaFHYVCggSfL8uTNp0:1vRJKf:s0yUvwoYuFIFcUl5S2PNTJ-VKbRnUU9TXCDNt69N0o4', '2025-12-05 00:35:57.143805'),
('x6ths5bwkiyj6hhvy84uai7bbzjhz3lo', '.eJxVjDsOwjAQBe_iGln-rIxDSc8ZrF3vGgeQI8VJFXF3iJQC2jczb1MJ16WmtcucRlYXdVan340wP6XtgB_Y7pPOU1vmkfSu6IN2fZtYXtfD_Tuo2Ou3HpBBBF00DMZ5RzF4GIK3sVgm72KwkL0rniBawGIDFg4ukgGBYkS9P89xN2c:1vRBb9:F3xDKd2OgIyK0X1qEBEnSBrQejQnUhCm3QXaaTJEazE', '2025-12-04 16:20:27.107707'),
('xuq8zgtusygny51wrrkupammmf01oep7', '.eJxVjEEOwiAQRe_C2hCmwJS6dN8zNMMwStVAUtqV8e7apAvd_vfef6mJtjVPW5NlmpM6K6tOv1skfkjZQbpTuVXNtazLHPWu6IM2PdYkz8vh_h1kavlb--EaxMRAJAwGHUQHXYwM4BgdCqAN1ri-G3pvxGIA7w0wWfQJGVC9P8uTNp0:1vRZn6:belI3ccY6WKECo2Ic9P-Ievp3qkgDO6ZK_iiO2yUHU4', '2025-12-05 18:10:24.608294');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos`
--

CREATE TABLE `eventos` (
  `id_evento` int(11) NOT NULL,
  `id_delito` int(11) DEFAULT NULL,
  `id_falta` int(11) DEFAULT NULL,
  `id_integrante` int(11) DEFAULT NULL,
  `id_pandilla` int(11) DEFAULT NULL,
  `id_zona` int(11) NOT NULL,
  `id_direccion` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `eventos`
--

INSERT INTO `eventos` (`id_evento`, `id_delito`, `id_falta`, `id_integrante`, `id_pandilla`, `id_zona`, `id_direccion`, `fecha`, `hora`, `descripcion`) VALUES
(1, 24, NULL, 1, 4, 1, 4, '2025-12-02', '18:26:00', 'El joven lider de la pandilla intimida a un adulto masculino de edad avanzada de provocar daño con un arma de fuego.'),
(2, NULL, NULL, NULL, 13, 1, 13, '2025-10-05', '20:30:00', 'Riña entre miembros de Los Halcones Norteños y Los Diablos Rojos Norte en la zona norte. Conflicto por territorio. Varios heridos leves.'),
(4, NULL, NULL, NULL, 13, 1, 13, '2025-10-05', '20:30:00', 'Riña entre miembros de Los Halcones Norteños y Los Diablos Rojos Norte en la zona norte. Conflicto por territorio. Varios heridos leves.'),
(5, NULL, NULL, NULL, 20, 2, 20, '2025-10-12', '22:15:00', 'Robo a mano armada en zona sur. Miembros de Los Leones del Sur involucrados. Se reportó pérdida de efectivo y objetos de valor.'),
(6, NULL, NULL, NULL, 32, 5, 32, '2025-10-18', '19:45:00', 'Alteración del orden público en el centro histórico. Miembros de Los Reyes del Centro causaron disturbios durante evento público.'),
(7, NULL, NULL, NULL, 18, 2, 18, '2025-10-25', '21:00:00', 'Riña entre Los Serpientes del Sur y Los Águilas Sureñas. Conflicto iniciado en evento deportivo local. Intervención policial.'),
(8, NULL, NULL, NULL, NULL, 3, 25, '2025-11-01', '23:30:00', 'Vandalismo y daño a propiedad privada en zona oriente. Miembros de Los Cóndores del Oriente involucrados. Daños estimados en $50,000.'),
(9, NULL, NULL, NULL, 21, 2, 21, '2025-11-08', '18:20:00', 'Consumo de alcohol en vía pública y conducta escandalosa. Miembros de Los Fantasmas del Sur en zona sur.'),
(10, NULL, NULL, NULL, 30, 4, 30, '2025-11-15', '20:45:00', 'Riña múltiple entre Los Demonios del Oeste y Los Zorros del Poniente. Conflicto por control de área comercial. Varios detenidos.'),
(11, NULL, NULL, NULL, 35, 5, 35, '2025-11-20', '19:15:00', 'Extorsión a comerciantes en zona centro. Miembros de Los Emperadores del Centro involucrados. Varias denuncias recibidas.'),
(12, NULL, NULL, NULL, 14, 1, 14, '2025-11-25', '17:30:00', 'Perturbación de la paz y ruido excesivo. Miembros de Los Guardianes del Norte realizando reunión no autorizada en área residencial.'),
(13, NULL, NULL, NULL, 23, 3, 23, '2025-11-28', '22:00:00', 'Riña entre Los Dragones del Oriente y Los Guerreros del Este. Conflicto territorial en zona oriente. Intervención de autoridades.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `faltas`
--

CREATE TABLE `faltas` (
  `id_falta` int(11) NOT NULL,
  `falta` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `faltas`
--

INSERT INTO `faltas` (`id_falta`, `falta`) VALUES
(14, 'Extorsión policial'),
(15, 'Porte ilegal de arma'),
(16, 'Vandalismo'),
(17, 'Perturbación de la paz'),
(18, 'Robo menor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes_integrantes`
--

CREATE TABLE `imagenes_integrantes` (
  `id_imagen` int(11) NOT NULL,
  `id_integrante` int(11) NOT NULL,
  `url_imagen` varchar(500) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_subida` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `imagenes_integrantes`
--

INSERT INTO `imagenes_integrantes` (`id_imagen`, `id_integrante`, `url_imagen`, `descripcion`, `fecha_subida`) VALUES
(1, 1, 'media/integrantes/8d81054f-3dd2-45a6-8418-8a17d652729e.png', NULL, '2025-12-04 00:40:27'),
(2, 2, 'media/integrantes/b1550ae7-2edf-4174-8bb6-9cd64b472e61.jpg', NULL, '2025-12-04 10:07:06'),
(3, 1, 'media/integrantes/cdfeda5a-9d5c-4a3e-bc75-f83c7ba4b014.jpg', NULL, '2025-12-04 10:07:51'),
(4, 3, 'media/integrantes/c394ee97-e1d3-4e89-8de6-8242dd8eb40c.jpg', NULL, '2025-12-04 10:10:11'),
(5, 2, 'media/integrantes/01b0a50d-63da-43c0-ae03-7a111cf42aa5.jpg', NULL, '2025-12-05 09:59:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `integrantes`
--

CREATE TABLE `integrantes` (
  `id_integrante` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido_paterno` varchar(255) NOT NULL,
  `apellido_materno` varchar(255) DEFAULT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `informacion_adicional` text DEFAULT NULL,
  `id_pandilla` int(11) NOT NULL,
  `id_direccion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `integrantes`
--

INSERT INTO `integrantes` (`id_integrante`, `nombre`, `apellido_paterno`, `apellido_materno`, `alias`, `fecha_nacimiento`, `informacion_adicional`, `id_pandilla`, `id_direccion`) VALUES
(1, 'Kevin', 'Cerda', 'Esparza', 'Güerejo', '2006-09-22', NULL, 4, 4),
(2, 'Eric', 'Hernández', 'Hernández', 'Minimi', '2006-01-25', NULL, 9, 9),
(3, 'Santiago', 'De la Cruz', 'Hernández', 'Donatello', '2005-12-25', NULL, 7, 9),
(4, 'Carlos', 'Mendoza', 'García', 'El Tigre', '2001-06-15', NULL, 12, 12),
(5, 'Roberto', 'Sánchez', 'López', 'El Rayo', '2002-03-22', NULL, 12, 12),
(6, 'Miguel', 'Torres', 'Martínez', 'El Sombra', '2000-11-08', NULL, 12, 12),
(7, 'Javier', 'Ramírez', 'Hernández', 'El Loco', '2001-09-30', NULL, 12, 12),
(8, 'Fernando', 'González', 'Morales', 'El Feroz', '2002-01-14', NULL, 12, 12),
(11, 'Roberto', 'Silva', 'Pérez', 'El Halcón', '1999-08-20', NULL, 13, 13),
(12, 'Alejandro', 'Castro', 'Ruiz', 'El Águila', '2000-04-12', NULL, 13, 13),
(13, 'Luis', 'Vargas', 'Díaz', 'El Cazador', '2001-07-05', NULL, 13, 13),
(14, 'Óscar', 'Mendoza', 'Jiménez', 'El Depredador', '1999-12-18', NULL, 13, 13),
(15, 'Ricardo', 'Herrera', 'Soto', 'El Veloz', '2000-02-28', NULL, 13, 13),
(18, 'Miguel Ángel', 'Torres', 'García', NULL, '2003-05-10', NULL, 14, 14),
(19, 'Daniel', 'López', 'Martínez', 'El Joven', '2003-09-25', NULL, 14, 14),
(20, 'Eduardo', 'Sánchez', 'Hernández', 'El Nuevo', '2004-01-15', NULL, 14, 14),
(21, 'Gabriel', 'Ramírez', 'Morales', 'El Chico', '2003-08-03', NULL, 14, 14),
(22, 'Sergio', 'González', 'Pérez', 'El Pequeño', '2004-03-20', NULL, 14, 14),
(26, 'Mario', 'Castro', 'Díaz', 'El Alfa', '2001-06-28', NULL, 15, 15),
(27, 'Raúl', 'Vargas', 'Soto', 'El Beta', '2000-12-05', NULL, 15, 15),
(28, 'Andrés', 'Mendoza', 'Jiménez', 'El Omega', '2001-04-18', NULL, 15, 15),
(29, 'Jorge', 'Herrera', 'García', 'El Manada', '2000-08-22', NULL, 15, 15),
(32, 'Jorge', 'Ramírez', 'Martínez', 'El Diablo', '1998-11-30', NULL, 16, 16),
(33, 'Diego', 'Sánchez', 'Hernández', 'El Demonio', '1999-05-14', NULL, 16, 16),
(34, 'Carlos', 'Torres', 'Morales', 'El Infierno', '1998-09-08', NULL, 16, 16),
(35, 'Roberto', 'López', 'Pérez', 'El Maligno', '1999-02-25', NULL, 16, 16),
(36, 'Miguel', 'Castro', 'Ruiz', 'El Oscuro', '1998-07-12', NULL, 16, 16),
(39, 'Luis', 'Martínez', 'García', 'El Sureño', '2002-04-18', NULL, 17, 17),
(40, 'Pedro', 'Sánchez', 'López', 'El Sur', '2002-08-25', NULL, 17, 17),
(41, 'Juan', 'Torres', 'Martínez', 'El Meridional', '2003-01-10', NULL, 17, 17),
(42, 'Francisco', 'Ramírez', 'Hernández', 'El Austral', '2002-06-22', NULL, 17, 17),
(43, 'Mario', 'González', 'Morales', 'El Bajo', '2002-11-05', NULL, 17, 17),
(46, 'Alejandro', 'Herrera', 'Pérez', 'La Serpiente', '2000-07-15', NULL, 18, 18),
(47, 'Ricardo', 'Castro', 'Ruiz', 'El Veneno', '2001-03-28', NULL, 18, 18),
(48, 'Óscar', 'Vargas', 'Díaz', 'El Cascabel', '2000-10-12', NULL, 18, 18),
(49, 'Luis', 'Mendoza', 'Jiménez', 'El Cobra', '2001-05-20', NULL, 18, 18),
(50, 'Roberto', 'Herrera', 'Soto', 'El Pitón', '2000-12-08', NULL, 18, 18),
(53, 'Ricardo', 'González', 'García', 'El Águila', '2001-02-14', NULL, 19, 19),
(54, 'Mario', 'Sánchez', 'López', 'El Volador', '2001-08-30', NULL, 19, 19),
(55, 'Eduardo', 'Torres', 'Martínez', 'El Planeador', '2000-11-18', NULL, 19, 19),
(56, 'Gabriel', 'Ramírez', 'Hernández', 'El Cazador', '2001-04-05', NULL, 19, 19),
(57, 'Sergio', 'González', 'Morales', 'El Depredador', '2001-09-22', NULL, 19, 19),
(60, 'Óscar', 'Mendoza', 'Pérez', 'El León', '1999-06-25', NULL, 20, 20),
(61, 'Diego', 'Castro', 'Ruiz', 'El Rey', '1999-12-10', NULL, 20, 20),
(62, 'Carlos', 'Vargas', 'Díaz', 'El Rugido', '2000-03-18', NULL, 20, 20),
(63, 'Roberto', 'Mendoza', 'Jiménez', 'El Feroz', '1999-08-28', NULL, 20, 20),
(64, 'Miguel', 'Herrera', 'Soto', 'El Dominante', '2000-01-15', NULL, 20, 20),
(67, 'Daniel', 'Sánchez', 'García', 'El Fantasma', '2003-04-20', NULL, 21, 21),
(68, 'Javier', 'López', 'Martínez', 'El Invisible', '2003-10-08', NULL, 21, 21),
(69, 'Fernando', 'Torres', 'Hernández', 'El Espectro', '2003-01-25', NULL, 21, 21),
(70, 'Andrés', 'Ramírez', 'Morales', 'El Etéreo', '2003-07-12', NULL, 21, 21),
(71, 'Jorge', 'González', 'Pérez', 'El Intangible', '2003-12-30', NULL, 21, 21),
(74, 'Pedro', 'Castillo', 'Ruiz', 'El Guerrero', '2001-09-12', NULL, 22, 22),
(75, 'Luis', 'Sánchez', 'Díaz', 'El Soldado', '2002-05-28', NULL, 22, 22),
(76, 'Juan', 'Torres', 'Soto', 'El Combatiente', '2001-11-15', NULL, 22, 22),
(77, 'Francisco', 'Ramírez', 'Jiménez', 'El Luchador', '2002-02-20', NULL, 22, 22),
(78, 'Mario', 'González', 'García', 'El Batallador', '2001-08-05', NULL, 22, 22),
(81, 'Juan Carlos', 'Ruiz', 'López', 'El Dragón', '2000-03-18', NULL, 23, 23),
(82, 'Alejandro', 'Castro', 'Martínez', 'El Fuego', '2000-09-25', NULL, 23, 23),
(83, 'Ricardo', 'Vargas', 'Hernández', 'El Escama', '2001-01-10', NULL, 23, 23),
(84, 'Óscar', 'Mendoza', 'Morales', 'El Alado', '2000-06-22', NULL, 23, 23),
(85, 'Luis', 'Herrera', 'Pérez', 'El Legendario', '2001-04-08', NULL, 23, 23),
(88, 'Francisco', 'Morales', 'García', 'El Tigre', '2002-07-30', NULL, 24, 24),
(89, 'Mario', 'Sánchez', 'López', 'El Rayado', '2002-12-15', NULL, 24, 24),
(90, 'Eduardo', 'Torres', 'Martínez', 'El Felino', '2003-03-28', NULL, 24, 24),
(91, 'Gabriel', 'Ramírez', 'Hernández', 'El Cazador', '2002-09-10', NULL, 24, 24),
(92, 'Sergio', 'González', 'Morales', 'El Depredador', '2003-01-25', NULL, 24, 24),
(102, 'Eduardo', 'Vargas', 'García', 'El Jaguar', '2003-10-28', NULL, 26, 26),
(103, 'Javier', 'López', 'Martínez', 'El Mancha', '2004-04-15', NULL, 26, 26),
(104, 'Fernando', 'Torres', 'Hernández', 'El Selvático', '2003-12-08', NULL, 26, 26),
(105, 'Andrés', 'Ramírez', 'Morales', 'El Ágil', '2004-06-22', NULL, 26, 26),
(106, 'Jorge', 'González', 'Pérez', 'El Sigiloso', '2003-11-18', NULL, 26, 26),
(109, 'Sergio', 'Ramírez', 'López', 'El Lobo', '2002-05-20', NULL, 27, 27),
(110, 'Luis', 'Sánchez', 'Martínez', 'El Alfa', '2002-11-08', NULL, 27, 27),
(111, 'Juan', 'Torres', 'Hernández', 'El Beta', '2003-02-25', NULL, 27, 27),
(112, 'Francisco', 'Ramírez', 'Morales', 'El Omega', '2002-08-12', NULL, 27, 27),
(113, 'Mario', 'González', 'Pérez', 'El Manada', '2002-12-30', NULL, 27, 27),
(116, 'Andrés', 'López', 'Ruiz', 'El Cuervo', '2000-09-15', NULL, 28, 28),
(117, 'Alejandro', 'Castro', 'Díaz', 'El Negro', '2001-03-28', NULL, 28, 28),
(118, 'Ricardo', 'Vargas', 'Soto', 'El Graznido', '2000-10-22', NULL, 28, 28),
(119, 'Óscar', 'Mendoza', 'Jiménez', 'El Inteligente', '2001-06-08', NULL, 28, 28),
(120, 'Luis', 'Herrera', 'García', 'El Observador', '2000-12-18', NULL, 28, 28),
(123, 'Javier', 'Torres', 'López', 'El Zorro', '1999-07-25', NULL, 29, 29),
(124, 'Mario', 'Sánchez', 'Martínez', 'El Astuto', '2000-01-12', NULL, 29, 29),
(125, 'Eduardo', 'Torres', 'Hernández', 'El Listo', '1999-11-28', NULL, 29, 29),
(126, 'Gabriel', 'Ramírez', 'Morales', 'El Ingenioso', '2000-04-15', NULL, 29, 29),
(127, 'Sergio', 'González', 'Pérez', 'El Hábil', '1999-09-22', NULL, 29, 29),
(130, 'Raúl', 'Méndez', 'García', 'El Demonio', '1998-04-10', NULL, 30, 30),
(131, 'Diego', 'Castro', 'Ruiz', 'El Maligno', '1998-10-25', NULL, 30, 30),
(132, 'Carlos', 'Vargas', 'Díaz', 'El Infernal', '1999-02-18', NULL, 30, 30),
(133, 'Roberto', 'Mendoza', 'Jiménez', 'El Diabólico', '1998-07-05', NULL, 30, 30),
(134, 'Miguel', 'Herrera', 'Soto', 'El Tenebroso', '1998-12-22', NULL, 30, 30),
(137, 'Gabriel', 'Sánchez', 'López', 'La Sombra', '2004-06-18', NULL, 31, 31),
(138, 'Javier', 'López', 'Martínez', 'El Oscuro', '2004-12-05', NULL, 31, 31),
(139, 'Fernando', 'Torres', 'Hernández', 'El Invisible', '2004-03-22', NULL, 31, 31),
(140, 'Andrés', 'Ramírez', 'Morales', 'El Silencioso', '2004-09-10', NULL, 31, 31),
(141, 'Jorge', 'González', 'Pérez', 'El Escondido', '2004-11-28', NULL, 31, 31),
(144, 'Diego', 'Hernández', 'García', 'El Rey', '2001-01-15', NULL, 32, 32),
(145, 'Luis', 'Sánchez', 'López', 'El Príncipe', '2001-07-30', NULL, 32, 32),
(146, 'Juan', 'Torres', 'Martínez', 'El Noble', '2000-10-12', NULL, 32, 32),
(147, 'Francisco', 'Ramírez', 'Hernández', 'El Majestuoso', '2001-04-25', NULL, 32, 32),
(148, 'Mario', 'González', 'Morales', 'El Soberano', '2001-09-08', NULL, 32, 32),
(151, 'Roberto', 'Martínez', 'Pérez', 'El Príncipe', '2000-02-28', NULL, 33, 33),
(152, 'Alejandro', 'Castro', 'Ruiz', 'El Heredero', '2000-08-15', NULL, 33, 33),
(153, 'Ricardo', 'Vargas', 'Díaz', 'El Real', '2001-01-22', NULL, 33, 33),
(154, 'Óscar', 'Mendoza', 'Jiménez', 'El Noble', '2000-05-10', NULL, 33, 33),
(155, 'Luis', 'Herrera', 'Soto', 'El Elegante', '2001-03-18', NULL, 33, 33),
(158, 'Carlos', 'Rodríguez', 'García', 'El Guardián', '2002-08-22', NULL, 34, 34),
(159, 'Mario', 'Sánchez', 'López', 'El Protector', '2002-12-08', NULL, 34, 34),
(160, 'Eduardo', 'Torres', 'Martínez', 'El Defensor', '2003-04-25', NULL, 34, 34),
(161, 'Gabriel', 'Ramírez', 'Hernández', 'El Vigilante', '2002-10-12', NULL, 34, 34),
(162, 'Sergio', 'González', 'Morales', 'El Custodio', '2003-02-18', NULL, 34, 34),
(165, 'Fernando', 'García', 'Pérez', 'El Emperador', '1999-05-18', NULL, 35, 35),
(166, 'Diego', 'Castro', 'Ruiz', 'El César', '1999-11-05', NULL, 35, 35),
(167, 'Carlos', 'Vargas', 'Díaz', 'El Supremo', '2000-02-22', NULL, 35, 35),
(168, 'Roberto', 'Mendoza', 'Jiménez', 'El Máximo', '1999-08-10', NULL, 35, 35),
(169, 'Miguel', 'Herrera', 'Soto', 'El Absoluto', '2000-01-28', NULL, 35, 35),
(172, 'Miguel Ángel', 'Pérez', 'García', 'El Caballero', '2003-07-12', NULL, 36, 36),
(173, 'Javier', 'López', 'Martínez', 'El Noble', '2003-12-28', NULL, 36, 36),
(174, 'Fernando', 'Torres', 'Hernández', 'El Valiente', '2004-04-15', NULL, 36, 36),
(175, 'Andrés', 'Ramírez', 'Morales', 'El Honorable', '2003-10-22', NULL, 36, 36),
(176, 'Jorge', 'González', 'Pérez', 'El Leal', '2004-01-08', NULL, 36, 36);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `integrantes_delitos`
--

CREATE TABLE `integrantes_delitos` (
  `id_integrante_delito` int(11) NOT NULL,
  `id_integrante` int(11) NOT NULL,
  `id_delito` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `integrantes_delitos`
--

INSERT INTO `integrantes_delitos` (`id_integrante_delito`, `id_integrante`, `id_delito`) VALUES
(1, 60, 3),
(2, 61, 3),
(3, 63, 3),
(7, 165, 9),
(8, 166, 9),
(10, 11, 14),
(11, 12, 14),
(12, 32, 14),
(13, 33, 14),
(17, 46, 14),
(18, 47, 14),
(19, 53, 14),
(20, 54, 14),
(24, 123, 14),
(25, 124, 14),
(26, 130, 14),
(27, 131, 14),
(31, 74, 14),
(32, 75, 14),
(33, 81, 14),
(34, 82, 14),
(38, 1, 2),
(39, 11, 2),
(40, 32, 2),
(41, 60, 2),
(43, 130, 2),
(44, 165, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `integrantes_faltas`
--

CREATE TABLE `integrantes_faltas` (
  `id_integrante_falta` int(11) NOT NULL,
  `id_integrante` int(11) NOT NULL,
  `id_falta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `integrantes_faltas`
--

INSERT INTO `integrantes_faltas` (`id_integrante_falta`, `id_integrante`, `id_falta`) VALUES
(1, 18, 17),
(2, 19, 17);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pandillas`
--

CREATE TABLE `pandillas` (
  `id_pandilla` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `lider` varchar(255) DEFAULT NULL,
  `numero_integrantes` int(11) DEFAULT NULL,
  `edades_promedio` decimal(5,2) DEFAULT NULL,
  `horario_reunion` varchar(255) DEFAULT NULL,
  `peligrosidad` varchar(50) DEFAULT NULL,
  `id_zona` int(11) NOT NULL,
  `id_direccion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pandillas`
--

INSERT INTO `pandillas` (`id_pandilla`, `nombre`, `descripcion`, `lider`, `numero_integrantes`, `edades_promedio`, `horario_reunion`, `peligrosidad`, `id_zona`, `id_direccion`) VALUES
(1, 'Los Reboceros', 'Grupo juvenil que opera principalmente en la zona norte de la ciudad, con actividades de vandalismo menor y riñas vecinales.', 'El Güero', 12, 19.00, 'Diario 18:00–23:00 hrs', 'Medio', 1, 1),
(2, 'Jarochillos', 'Grupo pequeño y muy local, identificado por reunirse en la zona del Sauzalito. Suelen juntarse en la calle San Fernando para convivencias nocturnas y grafiti menor.', 'El Vera', 9, 19.50, 'Viernes 18:30-0:00', 'Medio', 1, 2),
(4, 'Panteoneros', 'Grupo activo en la zona norte que suele reunirse cerca de áreas abandonadas y lotes baldíos. Son conocidos por sus conflictos nocturnos y actos de intimidación. Se mueven principalmente en calles cercanas a Valle Verde y zonas aledañas.', '\"Güerejo\"', 12, 19.50, 'Viernes y sábado 21:00–01:30', 'Alto', 1, 4),
(5, 'Los Torres', 'Sin descripción', 'Juan Torres', 6, 23.00, 'Viernes 18:30-0:00', 'Bajo', 1, 5),
(6, 'Martinillos', 'Sin descripción', 'Carlos Mendoza', 8, 22.50, 'Viernes y sábado 21:00–01:30', 'Bajo', 1, 6),
(7, 'Aztecas', 'Sin descripción', 'El Riri', 16, 19.50, 'Jueves 13:00-19:30', 'Bajo', 5, 7),
(8, 'Maniacos', 'Grupo pandillero nuevo, con poca peligrosidad y pocos integrantes, no se tiene mucha información al respecto.', 'El Yosh', 9, 17.50, 'Miercoles 13:00-19:30', 'Bajo', 5, 8),
(9, 'Pitufos', 'Sin descripción', 'El Tangana', 16, 20.00, 'Viernes 18:30-0:00', 'Medio', 5, 9),
(10, 'Centinelaz', 'Pandilla sumamente peligrosa con antecedentes de violencia y acoso.', 'El patron', 10, 20.00, 'Diario 19:00–24:00 hrs', 'Alto', 2, 11),
(12, 'Los Aztecas del Norte', 'Grupo organizado en la zona norte, conocido por su presencia en eventos deportivos y actividades comunitarias. Mantienen un perfil bajo pero constante presencia.', 'Carlos Mendoza \"El Tigre\"', 15, 22.50, 'Viernes 20:00-23:00', 'Medio', 1, 12),
(13, 'Los Halcones Norteños', 'Pandilla con fuerte presencia en la zona norte, especialmente activa en fines de semana. Conocidos por su organización y estructura jerárquica.', 'Roberto Silva \"El Halcón\"', 22, 24.00, 'Sábados 19:00-22:00', 'Alto', 1, 13),
(14, 'Los Guardianes del Norte', 'Grupo relativamente nuevo en la zona, mantienen actividades principalmente en áreas residenciales. Perfil bajo pero en crecimiento.', 'Miguel Ángel Torres', 8, 20.00, 'Domingos 18:00-21:00', 'Bajo', 1, 14),
(15, 'Los Lobos del Norte', 'Pandilla establecida con varios años de antigüedad en la zona. Conocidos por su territorialidad y presencia constante en eventos locales.', 'Fernando López \"El Lobo\"', 18, 23.50, 'Jueves 20:00-23:00', 'Medio', 1, 15),
(16, 'Los Diablos Rojos Norte', 'Grupo con presencia significativa en la zona norte. Activos principalmente en horarios nocturnos y fines de semana.', 'Jorge Ramírez \"El Diablo\"', 25, 25.00, 'Viernes y Sábados 21:00-01:00', 'Alto', 1, 16),
(17, 'Los Sureños Unidos', 'Pandilla con fuerte presencia en la zona sur de la ciudad. Conocidos por su organización y actividades comunitarias.', 'Luis Martínez \"El Sureño\"', 12, 21.00, 'Miércoles 19:00-22:00', 'Bajo', 2, 17),
(18, 'Los Serpientes del Sur', 'Grupo activo en la zona sur, con presencia constante en eventos y actividades locales. Mantienen estructura organizada.', 'Alejandro Herrera \"La Serpiente\"', 20, 23.00, 'Sábados 20:00-23:00', 'Medio', 2, 18),
(19, 'Los Águilas Sureñas', 'Pandilla establecida con varios años en la zona sur. Conocidos por su territorialidad y presencia en áreas comerciales.', 'Ricardo González \"El Águila\"', 16, 22.50, 'Domingos 19:00-22:00', 'Medio', 2, 19),
(20, 'Los Leones del Sur', 'Grupo con presencia significativa en la zona sur. Activos principalmente en horarios nocturnos y eventos especiales.', 'Óscar Mendoza \"El León\"', 28, 24.50, 'Viernes y Sábados 21:00-02:00', 'Alto', 2, 20),
(21, 'Los Fantasmas del Sur', 'Pandilla relativamente nueva en la zona sur. Mantienen perfil bajo pero presencia constante en áreas residenciales.', 'Daniel Sánchez \"El Fantasma\"', 10, 20.50, 'Martes 18:00-21:00', 'Bajo', 2, 21),
(22, 'Los Guerreros del Este', 'Pandilla con fuerte presencia en la zona oriente. Conocidos por su organización y actividades en áreas industriales.', 'Pedro Castillo \"El Guerrero\"', 14, 22.00, 'Jueves 19:00-22:00', 'Medio', 3, 22),
(23, 'Los Dragones del Oriente', 'Grupo activo en la zona oriente, con presencia constante en eventos y actividades locales. Estructura bien organizada.', 'Juan Carlos Ruiz \"El Dragón\"', 19, 23.50, 'Sábados 20:00-23:00', 'Medio', 3, 23),
(24, 'Los Tigres del Este', 'Pandilla establecida con varios años en la zona oriente. Conocidos por su territorialidad y presencia en áreas comerciales.', 'Francisco Morales \"El Tigre\"', 11, 21.50, 'Domingos 18:00-21:00', 'Bajo', 3, 24),
(26, 'Los Jaguares del Este', 'Pandilla relativamente nueva en la zona oriente. Mantienen perfil bajo pero presencia constante en áreas residenciales.', 'Eduardo Vargas \"El Jaguar\"', 9, 20.00, 'Lunes 19:00-22:00', 'Bajo', 3, 26),
(27, 'Los Lobos del Poniente', 'Pandilla con fuerte presencia en la zona poniente. Conocidos por su organización y actividades en áreas residenciales.', 'Sergio Ramírez \"El Lobo\"', 13, 21.50, 'Miércoles 20:00-23:00', 'Medio', 4, 27),
(28, 'Los Cuervos del Oeste', 'Grupo activo en la zona poniente, con presencia constante en eventos y actividades locales. Estructura bien organizada.', 'Andrés López \"El Cuervo\"', 17, 23.00, 'Sábados 19:00-22:00', 'Medio', 4, 28),
(29, 'Los Zorros del Poniente', 'Pandilla establecida con varios años en la zona poniente. Conocidos por su territorialidad y presencia en áreas comerciales.', 'Javier Torres \"El Zorro\"', 21, 24.00, 'Domingos 20:00-23:00', 'Medio', 4, 29),
(30, 'Los Demonios del Oeste', 'Grupo con presencia significativa en la zona poniente. Activos principalmente en horarios nocturnos y eventos especiales.', 'Raúl Méndez \"El Demonio\"', 29, 25.50, 'Viernes y Sábados 22:00-02:00', 'Alto', 4, 30),
(31, 'Los Sombras del Poniente', 'Pandilla relativamente nueva en la zona poniente. Mantienen perfil bajo pero presencia constante en áreas residenciales.', 'Gabriel Sánchez \"La Sombra\"', 7, 19.50, 'Martes 18:00-21:00', 'Bajo', 4, 31),
(32, 'Los Reyes del Centro', 'Pandilla con fuerte presencia en el centro histórico. Conocidos por su organización y actividades en áreas comerciales y turísticas.', 'Diego Hernández \"El Rey\"', 15, 22.50, 'Jueves 20:00-23:00', 'Medio', 5, 32),
(33, 'Los Príncipes del Centro', 'Grupo activo en el centro histórico, con presencia constante en eventos y actividades locales. Estructura bien organizada.', 'Roberto Martínez \"El Príncipe\"', 18, 23.50, 'Sábados 20:00-23:00', 'Medio', 5, 33),
(34, 'Los Guardianes del Centro', 'Pandilla establecida con varios años en el centro histórico. Conocidos por su territorialidad y presencia en áreas comerciales.', 'Carlos Rodríguez \"El Guardián\"', 12, 21.00, 'Domingos 19:00-22:00', 'Bajo', 5, 34),
(35, 'Los Emperadores del Centro', 'Grupo con presencia significativa en el centro histórico. Activos principalmente en horarios nocturnos y fines de semana.', 'Fernando García \"El Emperador\"', 27, 24.50, 'Viernes y Sábados 21:00-01:00', 'Alto', 5, 35),
(36, 'Los Caballeros del Centro', 'Pandilla relativamente nueva en el centro histórico. Mantienen perfil bajo pero presencia constante en áreas residenciales y comerciales.', 'Miguel Ángel Pérez \"El Caballero\"', 10, 20.50, 'Lunes 19:00-22:00', 'Bajo', 5, 36),
(38, 'Los leones', 'Pandilla muy conflictiva', 'Ramon', 15, 18.00, '20:00', 'Bajo', 5, 37);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pandillas_delitos`
--

CREATE TABLE `pandillas_delitos` (
  `id_pandilla_delito` int(11) NOT NULL,
  `id_pandilla` int(11) NOT NULL,
  `id_delito` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pandillas_delitos`
--

INSERT INTO `pandillas_delitos` (`id_pandilla_delito`, `id_pandilla`, `id_delito`) VALUES
(1, 1, 27),
(2, 1, 36),
(3, 1, 35),
(4, 1, 32),
(5, 1, 16),
(6, 1, 12),
(7, 2, 35),
(8, 2, 26),
(9, 2, 32),
(10, 2, 16),
(11, 2, 15),
(12, 2, 34),
(13, 2, 5),
(25, 4, 36),
(26, 4, 13),
(27, 4, 35),
(28, 4, 26),
(29, 4, 32),
(30, 4, 15),
(31, 4, 37),
(32, 4, 12),
(33, 5, 36),
(34, 5, 29),
(35, 5, 14),
(36, 6, 16),
(37, 6, 5),
(38, 6, 12),
(39, 7, 11),
(40, 7, 35),
(41, 7, 28),
(42, 7, 14),
(43, 7, 32),
(44, 8, 32),
(45, 9, 39),
(46, 9, 29),
(47, 9, 24),
(48, 9, 16),
(49, 9, 34),
(50, 9, 37),
(51, 9, 7),
(52, 9, 23),
(53, 10, 19),
(54, 10, 27),
(55, 10, 35),
(59, 20, 3),
(61, 35, 9),
(62, 13, 14),
(63, 16, 14),
(65, 18, 14),
(66, 19, 14),
(68, 29, 14),
(69, 30, 14),
(71, 22, 14),
(72, 23, 14),
(75, 4, 2),
(76, 10, 2),
(77, 13, 2),
(78, 16, 2),
(79, 20, 2),
(81, 30, 2),
(82, 35, 2),
(91, 38, 19),
(92, 38, 38);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pandillas_faltas`
--

CREATE TABLE `pandillas_faltas` (
  `id_pandilla_falta` int(11) NOT NULL,
  `id_pandilla` int(11) NOT NULL,
  `id_falta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pandillas_faltas`
--

INSERT INTO `pandillas_faltas` (`id_pandilla_falta`, `id_pandilla`, `id_falta`) VALUES
(1, 14, 17),
(4, 38, 14),
(5, 38, 17);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `redes_integrantes`
--

CREATE TABLE `redes_integrantes` (
  `id_red_integrante` int(11) NOT NULL,
  `id_integrante` int(11) NOT NULL,
  `id_red_social` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `redes_integrantes`
--

INSERT INTO `redes_integrantes` (`id_red_integrante`, `id_integrante`, `id_red_social`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `redes_pandillas`
--

CREATE TABLE `redes_pandillas` (
  `id_red_pandilla` int(11) NOT NULL,
  `id_pandilla` int(11) NOT NULL,
  `id_red_social` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `redes_sociales`
--

CREATE TABLE `redes_sociales` (
  `id_red_social` int(11) NOT NULL,
  `plataforma` varchar(100) NOT NULL,
  `handle` varchar(100) DEFAULT NULL,
  `url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `redes_sociales`
--

INSERT INTO `redes_sociales` (`id_red_social`, `plataforma`, `handle`, `url`) VALUES
(1, 'TikTok', '@kevcerda', 'https://www.tiktok.com/@kevcerda'),
(2, 'TikTok', '@owls', ''),
(3, 'TikTok', '@user', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rivalidades`
--

CREATE TABLE `rivalidades` (
  `id_rivalidad` int(11) NOT NULL,
  `id_pandilla` int(11) NOT NULL,
  `id_pandilla_rival` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rivalidades`
--

INSERT INTO `rivalidades` (`id_rivalidad`, `id_pandilla`, `id_pandilla_rival`) VALUES
(1, 2, 1),
(2, 4, 1),
(3, 6, 5),
(4, 8, 7),
(7, 38, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `rol` varchar(50) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `date_joined` datetime(6) DEFAULT NULL,
  `genero` varchar(1) DEFAULT NULL,
  `cargo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `user_name`, `correo`, `password`, `nombre`, `apellido`, `rol`, `last_login`, `is_active`, `is_staff`, `is_superuser`, `date_joined`, `genero`, `cargo`) VALUES
(1, 'admin', 'admin@example.com', 'pbkdf2_sha256$720000$5XvIjBIao5IfR7JNsrTS2N$6TwBMMtDcXklx10M7UYaAGWuIsr6d1GqNc0Of/hHElc=', 'Admin', 'Usuario', 'admin', '2025-12-05 02:49:38.936732', 1, 0, 0, '2025-11-27 01:14:34.380874', 'X', NULL),
(2, 'consultor', 'consultor@example.com', 'pbkdf2_sha256$720000$wws2YDePkbO1YQ7895NCxz$wxNn44NFxtvdNcWmhn4dGD7J+UZJLu4/RPDoE6phukM=', 'Consultor', 'Usuario', 'consultor', '2025-12-05 02:49:50.888201', 1, 0, 0, '2025-11-27 01:17:41.860004', 'X', NULL),
(3, 'kevin', 'kevin@sigp.com', 'pbkdf2_sha256$720000$mCp3uL28bWhFVMVPrIpUuq$5Il06qsR+LgcjnhQtCBXTSsokpi2HsAn0fiUMldeXMI=', 'Kevin', 'Cerda', 'admin', '2025-12-05 19:02:56.910350', 1, 0, 0, '2025-11-28 00:03:07.818366', 'M', 'Desarrollador'),
(4, 'eric', 'eric@tvazteca.com', 'pbkdf2_sha256$720000$TRhZ0EsaZAZImpWgM8iCQw$a7Vx8F7FAFi1+oiBtdl+rJq7xOhhtMkfpZPWTBkH6vc=', 'Eric', 'Hernández', 'consultor', NULL, 1, 0, 0, '2025-11-29 02:28:18.415925', 'X', NULL),
(5, 'fernando', 'fernando@sigp.com', 'pbkdf2_sha256$720000$YnmON37k6flFN8JYwhQr6J$Vcg25uxLD9ufBBRYu2OMlna4K8LGORIqxdqYWpJJYV0=', 'Fernando', 'Sanchez', 'admin', NULL, 1, 0, 0, '2025-11-29 02:32:25.422697', 'X', NULL),
(6, 'kelly', 'kelly@prensa.com', 'pbkdf2_sha256$720000$YqrGXKF8oI1mOVmIIsnYBU$nIBsxB6FTqrwJaqzJeg24DFBqpV6VKhySHs85UQh7cM=', 'Kelly', 'Morales', 'consultor', '2025-12-03 20:57:46.086122', 1, 0, 0, '2025-11-29 02:33:48.332575', 'F', NULL),
(7, '', 'test_auth_user@example.com', 'pbkdf2_sha256$720000$orH2Ec3W2bxJmmDrvh3FxS$Mk97sSiYJs2YwjvQoTu2f6V7vD0DaC8Tk29mIsq9lHw=', 'Test', 'User', 'admin', '2025-12-04 15:50:27.070381', 1, 0, 0, '2025-12-04 15:50:25.985474', 'X', NULL),
(8, 'consultor', 'consultor@sigp.com', 'pbkdf2_sha256$720000$ovDFqYwocTgNb8EF3IIqad$NctECGk1ey7os8Dk/4/kv+ZOHjBp5AFE0d3QfrDPvCs=', 'Usuario', 'Consultor', 'consultor', '2025-12-05 02:38:51.042428', 1, 0, 0, '2025-12-05 02:34:04.591645', 'X', 'Sujeto de prueba'),
(9, 'kelly', 'kelly@sigp.com', 'pbkdf2_sha256$720000$qKpixnjfrdeH6ay6bFrFly$q5do+0rGmNzEKV60pQGkw+17Za+Afvt2sUGfEsebr0s=', 'Kelly', 'Morales', 'consultor', NULL, 1, 0, 0, '2025-12-05 02:55:02.197817', 'F', 'Reportera'),
(10, 'rllamas', 'rllamas@correo.com', 'pbkdf2_sha256$720000$VL4ThyC0IdOXgfKFDR9iC4$luwvbkHLXl3UaPHCVF0CD3JKycJ89r78CE91kXXE0ck=', 'Rafael', 'Llamas', 'admin', '2025-12-05 17:10:58.424488', 1, 0, 0, '2025-12-05 17:10:29.151827', 'M', 'Profesor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `zonas`
--

CREATE TABLE `zonas` (
  `id_zona` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `zonas`
--

INSERT INTO `zonas` (`id_zona`, `nombre`) VALUES
(1, 'Norte'),
(2, 'Sur'),
(3, 'Oriente'),
(4, 'Poniente'),
(5, 'Centro');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD PRIMARY KEY (`key`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indices de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indices de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indices de la tabla `delitos`
--
ALTER TABLE `delitos`
  ADD PRIMARY KEY (`id_delito`);

--
-- Indices de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD PRIMARY KEY (`id_direccion`);

--
-- Indices de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_usuarios_id_usuario` (`user_id`);

--
-- Indices de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indices de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id_evento`),
  ADD KEY `id_delito` (`id_delito`),
  ADD KEY `id_falta` (`id_falta`),
  ADD KEY `id_integrante` (`id_integrante`),
  ADD KEY `id_pandilla` (`id_pandilla`),
  ADD KEY `id_zona` (`id_zona`),
  ADD KEY `id_direccion` (`id_direccion`);

--
-- Indices de la tabla `faltas`
--
ALTER TABLE `faltas`
  ADD PRIMARY KEY (`id_falta`);

--
-- Indices de la tabla `imagenes_integrantes`
--
ALTER TABLE `imagenes_integrantes`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `idx_integrante` (`id_integrante`);

--
-- Indices de la tabla `integrantes`
--
ALTER TABLE `integrantes`
  ADD PRIMARY KEY (`id_integrante`),
  ADD KEY `id_pandilla` (`id_pandilla`),
  ADD KEY `id_direccion` (`id_direccion`);

--
-- Indices de la tabla `integrantes_delitos`
--
ALTER TABLE `integrantes_delitos`
  ADD PRIMARY KEY (`id_integrante_delito`),
  ADD KEY `id_integrante` (`id_integrante`),
  ADD KEY `id_delito` (`id_delito`);

--
-- Indices de la tabla `integrantes_faltas`
--
ALTER TABLE `integrantes_faltas`
  ADD PRIMARY KEY (`id_integrante_falta`),
  ADD KEY `id_integrante` (`id_integrante`),
  ADD KEY `id_falta` (`id_falta`);

--
-- Indices de la tabla `pandillas`
--
ALTER TABLE `pandillas`
  ADD PRIMARY KEY (`id_pandilla`),
  ADD KEY `id_zona` (`id_zona`),
  ADD KEY `id_direccion` (`id_direccion`);

--
-- Indices de la tabla `pandillas_delitos`
--
ALTER TABLE `pandillas_delitos`
  ADD PRIMARY KEY (`id_pandilla_delito`),
  ADD KEY `id_pandilla` (`id_pandilla`),
  ADD KEY `id_delito` (`id_delito`);

--
-- Indices de la tabla `pandillas_faltas`
--
ALTER TABLE `pandillas_faltas`
  ADD PRIMARY KEY (`id_pandilla_falta`),
  ADD KEY `id_pandilla` (`id_pandilla`),
  ADD KEY `id_falta` (`id_falta`);

--
-- Indices de la tabla `redes_integrantes`
--
ALTER TABLE `redes_integrantes`
  ADD PRIMARY KEY (`id_red_integrante`),
  ADD KEY `id_integrante` (`id_integrante`),
  ADD KEY `id_red_social` (`id_red_social`);

--
-- Indices de la tabla `redes_pandillas`
--
ALTER TABLE `redes_pandillas`
  ADD PRIMARY KEY (`id_red_pandilla`),
  ADD KEY `id_pandilla` (`id_pandilla`),
  ADD KEY `id_red_social` (`id_red_social`);

--
-- Indices de la tabla `redes_sociales`
--
ALTER TABLE `redes_sociales`
  ADD PRIMARY KEY (`id_red_social`);

--
-- Indices de la tabla `rivalidades`
--
ALTER TABLE `rivalidades`
  ADD PRIMARY KEY (`id_rivalidad`),
  ADD KEY `id_pandilla` (`id_pandilla`),
  ADD KEY `id_pandilla_rival` (`id_pandilla_rival`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `zonas`
--
ALTER TABLE `zonas`
  ADD PRIMARY KEY (`id_zona`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `delitos`
--
ALTER TABLE `delitos`
  MODIFY `id_delito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  MODIFY `id_direccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id_evento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `faltas`
--
ALTER TABLE `faltas`
  MODIFY `id_falta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `imagenes_integrantes`
--
ALTER TABLE `imagenes_integrantes`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `integrantes`
--
ALTER TABLE `integrantes`
  MODIFY `id_integrante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=180;

--
-- AUTO_INCREMENT de la tabla `integrantes_delitos`
--
ALTER TABLE `integrantes_delitos`
  MODIFY `id_integrante_delito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de la tabla `integrantes_faltas`
--
ALTER TABLE `integrantes_faltas`
  MODIFY `id_integrante_falta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `pandillas`
--
ALTER TABLE `pandillas`
  MODIFY `id_pandilla` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `pandillas_delitos`
--
ALTER TABLE `pandillas_delitos`
  MODIFY `id_pandilla_delito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT de la tabla `pandillas_faltas`
--
ALTER TABLE `pandillas_faltas`
  MODIFY `id_pandilla_falta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `redes_integrantes`
--
ALTER TABLE `redes_integrantes`
  MODIFY `id_red_integrante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `redes_pandillas`
--
ALTER TABLE `redes_pandillas`
  MODIFY `id_red_pandilla` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `redes_sociales`
--
ALTER TABLE `redes_sociales`
  MODIFY `id_red_social` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `rivalidades`
--
ALTER TABLE `rivalidades`
  MODIFY `id_rivalidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `zonas`
--
ALTER TABLE `zonas`
  MODIFY `id_zona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD CONSTRAINT `authtoken_token_user_id_35299eff_fk_usuarios_id_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Filtros para la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Filtros para la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_usuarios_id_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`id_delito`) REFERENCES `delitos` (`id_delito`) ON DELETE SET NULL,
  ADD CONSTRAINT `eventos_ibfk_2` FOREIGN KEY (`id_falta`) REFERENCES `faltas` (`id_falta`) ON DELETE SET NULL,
  ADD CONSTRAINT `eventos_ibfk_3` FOREIGN KEY (`id_integrante`) REFERENCES `integrantes` (`id_integrante`) ON DELETE SET NULL,
  ADD CONSTRAINT `eventos_ibfk_4` FOREIGN KEY (`id_pandilla`) REFERENCES `pandillas` (`id_pandilla`) ON DELETE SET NULL,
  ADD CONSTRAINT `eventos_ibfk_5` FOREIGN KEY (`id_zona`) REFERENCES `zonas` (`id_zona`) ON DELETE CASCADE,
  ADD CONSTRAINT `eventos_ibfk_6` FOREIGN KEY (`id_direccion`) REFERENCES `direcciones` (`id_direccion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `imagenes_integrantes`
--
ALTER TABLE `imagenes_integrantes`
  ADD CONSTRAINT `imagenes_integrantes_ibfk_1` FOREIGN KEY (`id_integrante`) REFERENCES `integrantes` (`id_integrante`) ON DELETE CASCADE;

--
-- Filtros para la tabla `integrantes`
--
ALTER TABLE `integrantes`
  ADD CONSTRAINT `integrantes_ibfk_1` FOREIGN KEY (`id_pandilla`) REFERENCES `pandillas` (`id_pandilla`) ON DELETE CASCADE,
  ADD CONSTRAINT `integrantes_ibfk_2` FOREIGN KEY (`id_direccion`) REFERENCES `direcciones` (`id_direccion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `integrantes_delitos`
--
ALTER TABLE `integrantes_delitos`
  ADD CONSTRAINT `integrantes_delitos_ibfk_1` FOREIGN KEY (`id_integrante`) REFERENCES `integrantes` (`id_integrante`) ON DELETE CASCADE,
  ADD CONSTRAINT `integrantes_delitos_ibfk_2` FOREIGN KEY (`id_delito`) REFERENCES `delitos` (`id_delito`) ON DELETE CASCADE;

--
-- Filtros para la tabla `integrantes_faltas`
--
ALTER TABLE `integrantes_faltas`
  ADD CONSTRAINT `integrantes_faltas_ibfk_1` FOREIGN KEY (`id_integrante`) REFERENCES `integrantes` (`id_integrante`) ON DELETE CASCADE,
  ADD CONSTRAINT `integrantes_faltas_ibfk_2` FOREIGN KEY (`id_falta`) REFERENCES `faltas` (`id_falta`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pandillas`
--
ALTER TABLE `pandillas`
  ADD CONSTRAINT `pandillas_ibfk_1` FOREIGN KEY (`id_zona`) REFERENCES `zonas` (`id_zona`) ON DELETE CASCADE,
  ADD CONSTRAINT `pandillas_ibfk_2` FOREIGN KEY (`id_direccion`) REFERENCES `direcciones` (`id_direccion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pandillas_delitos`
--
ALTER TABLE `pandillas_delitos`
  ADD CONSTRAINT `pandillas_delitos_ibfk_1` FOREIGN KEY (`id_pandilla`) REFERENCES `pandillas` (`id_pandilla`) ON DELETE CASCADE,
  ADD CONSTRAINT `pandillas_delitos_ibfk_2` FOREIGN KEY (`id_delito`) REFERENCES `delitos` (`id_delito`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pandillas_faltas`
--
ALTER TABLE `pandillas_faltas`
  ADD CONSTRAINT `pandillas_faltas_ibfk_1` FOREIGN KEY (`id_pandilla`) REFERENCES `pandillas` (`id_pandilla`) ON DELETE CASCADE,
  ADD CONSTRAINT `pandillas_faltas_ibfk_2` FOREIGN KEY (`id_falta`) REFERENCES `faltas` (`id_falta`) ON DELETE CASCADE;

--
-- Filtros para la tabla `redes_integrantes`
--
ALTER TABLE `redes_integrantes`
  ADD CONSTRAINT `redes_integrantes_ibfk_1` FOREIGN KEY (`id_integrante`) REFERENCES `integrantes` (`id_integrante`) ON DELETE CASCADE,
  ADD CONSTRAINT `redes_integrantes_ibfk_2` FOREIGN KEY (`id_red_social`) REFERENCES `redes_sociales` (`id_red_social`) ON DELETE CASCADE;

--
-- Filtros para la tabla `redes_pandillas`
--
ALTER TABLE `redes_pandillas`
  ADD CONSTRAINT `redes_pandillas_ibfk_1` FOREIGN KEY (`id_pandilla`) REFERENCES `pandillas` (`id_pandilla`) ON DELETE CASCADE,
  ADD CONSTRAINT `redes_pandillas_ibfk_2` FOREIGN KEY (`id_red_social`) REFERENCES `redes_sociales` (`id_red_social`) ON DELETE CASCADE;

--
-- Filtros para la tabla `rivalidades`
--
ALTER TABLE `rivalidades`
  ADD CONSTRAINT `rivalidades_ibfk_1` FOREIGN KEY (`id_pandilla`) REFERENCES `pandillas` (`id_pandilla`) ON DELETE CASCADE,
  ADD CONSTRAINT `rivalidades_ibfk_2` FOREIGN KEY (`id_pandilla_rival`) REFERENCES `pandillas` (`id_pandilla`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
