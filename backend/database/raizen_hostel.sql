-- ============================================================
-- RAIZEN HOSTEL — Schema + Seed
-- MySQL 8+ / MariaDB 10.5+
-- ============================================================

CREATE DATABASE IF NOT EXISTS raizen_hostel
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE raizen_hostel;

-- ── Usuarios ─────────────────────────────────────────────────
CREATE TABLE usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telefono      VARCHAR(20)  DEFAULT NULL,
  documento     VARCHAR(30)  DEFAULT NULL,
  rol           ENUM('huesped','admin') NOT NULL DEFAULT 'huesped',
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Tipos de habitación ──────────────────────────────────────
CREATE TABLE tipos_habitacion (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(40) NOT NULL UNIQUE,
  nombre      VARCHAR(80) NOT NULL,
  descripcion TEXT,
  capacidad   INT NOT NULL DEFAULT 1,
  precio_base DECIMAL(12,2) NOT NULL,
  popular     TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ── Unidades (habitaciones individuales / camas) ─────────────
CREATE TABLE unidades (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  tipo_id        INT NOT NULL,
  numero         VARCHAR(10) NOT NULL UNIQUE,
  nombre_display VARCHAR(100) NOT NULL,
  descripcion    TEXT,
  precio         DECIMAL(12,2) NOT NULL,
  disponible     TINYINT(1) NOT NULL DEFAULT 1,
  orden          INT NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tipo_id) REFERENCES tipos_habitacion(id)
) ENGINE=InnoDB;

-- ── Imágenes por unidad ──────────────────────────────────────
CREATE TABLE unidad_imagenes (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  unidad_id INT NOT NULL,
  url       VARCHAR(500) NOT NULL,
  alt_text  VARCHAR(255) DEFAULT '',
  orden     INT NOT NULL DEFAULT 0,
  FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Reservas ─────────────────────────────────────────────────
CREATE TABLE reservas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  codigo        VARCHAR(20) NOT NULL UNIQUE,
  usuario_id    INT NOT NULL,
  unidad_id     INT NOT NULL,
  checkin       DATE NOT NULL,
  checkout      DATE NOT NULL,
  noches        INT GENERATED ALWAYS AS (DATEDIFF(checkout, checkin)) STORED,
  num_personas  INT NOT NULL DEFAULT 1,
  precio_noche  DECIMAL(12,2) NOT NULL,
  total         DECIMAL(12,2) NOT NULL,
  estado        ENUM('pendiente','pago_pendiente','confirmada','en_curso','completada','cancelada') NOT NULL DEFAULT 'pendiente',
  notas         TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (unidad_id)  REFERENCES unidades(id)
) ENGINE=InnoDB;

-- ── Pagos ────────────────────────────────────────────────────
CREATE TABLE pagos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id   INT NOT NULL,
  proveedor    ENUM('wompi') NOT NULL DEFAULT 'wompi',
  proveedor_id VARCHAR(100) DEFAULT NULL,
  metodo       ENUM('tarjeta','pse','nequi') DEFAULT NULL,
  monto        DECIMAL(12,2) NOT NULL,
  estado       ENUM('pendiente','aprobado','rechazado','error') NOT NULL DEFAULT 'pendiente',
  datos_raw    JSON DEFAULT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reserva_id) REFERENCES reservas(id)
) ENGINE=InnoDB;

-- ── Galería ──────────────────────────────────────────────────
CREATE TABLE galeria (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  url        VARCHAR(500) NOT NULL,
  alt_text   VARCHAR(255) DEFAULT '',
  categoria  VARCHAR(60)  DEFAULT 'general',
  span_wide  TINYINT(1) NOT NULL DEFAULT 0,
  span_tall  TINYINT(1) NOT NULL DEFAULT 0,
  orden      INT NOT NULL DEFAULT 0,
  activo     TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Contenido CMS ────────────────────────────────────────────
CREATE TABLE contenido (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  seccion    VARCHAR(60) NOT NULL UNIQUE,
  datos      JSON NOT NULL,
  updated_by INT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Servicios ────────────────────────────────────────────────
CREATE TABLE servicios (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  descripcion  TEXT,
  icono_lucide VARCHAR(60) NOT NULL DEFAULT 'star',
  orden        INT NOT NULL DEFAULT 0,
  activo       TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- ── Refresh tokens ───────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked    TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Mensajes de contacto ─────────────────────────────────────
CREATE TABLE mensajes_contacto (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(120) NOT NULL,
  email          VARCHAR(180) NOT NULL,
  asunto         VARCHAR(200) DEFAULT '',
  mensaje        TEXT NOT NULL,
  respondido     TINYINT(1) NOT NULL DEFAULT 0,
  respuesta      TEXT DEFAULT NULL,
  respondido_por INT DEFAULT NULL,
  respondido_at  DATETIME DEFAULT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (respondido_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin por defecto (password: admin123)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Admin Raizen', 'admin@raizenhostel.com', '$2y$10$8sC/y2gt3/5gGRI7MtUyLueke1aEISc.3ev0Bn3L2XgFM62.Tk1Mu', 'admin');

-- ── Tipos de habitación — Tarifas 2026 ──────────────────────
-- 2 compartidos + 4 privados = 6 tipos
INSERT INTO tipos_habitacion (slug, nombre, descripcion, capacidad, precio_base, popular) VALUES
('cama-camarote',
 'Cama en Camarote',
 'Camarote con dosel en dormitorio compartido. Incluye locker individual, luz de lectura y ambiente acogedor.',
 1, 59000, 0),

('cama-sencilla',
 'Cama Sencilla',
 'Cama individual en habitación compartida. Espacio personal, tranquilo y seguro para el viajero independiente.',
 1, 89000, 0),

('privada-sencilla',
 'Hab. Sencilla',
 'Habitación privada para una persona. Llave propia, ambiente tranquilo y atención personalizada.',
 1, 100000, 0),

('privada-doble',
 'Hab. Doble',
 'La opción más elegida. Habitación privada para dos personas con cama doble, ropa de cama premium y máxima privacidad.',
 2, 164000, 1),

('privada-triple',
 'Hab. Triple',
 'Habitación privada para tres personas. Ideal para grupos pequeños o familias. Tres camas y espacio amplio.',
 3, 192000, 0),

('privada-cuadruple',
 'Hab. Cuádruple',
 'Habitación privada para cuatro personas. La más espaciosa del hostel, perfecta para grupos o familias.',
 4, 261000, 0);

-- ── Unidades ────────────────────────────────────────────────
-- tipo 1 = cama-camarote  → 2 unidades (D01–D02)
-- tipo 2 = cama-sencilla  → 8 unidades (D03–D10)
-- tipo 3 = privada-sencilla  → 1 unidad (P1)
-- tipo 4 = privada-doble     → 2 unidades (P2–P3)
-- tipo 5 = privada-triple    → 1 unidad (P4)
-- tipo 6 = privada-cuadruple → 1 unidad (P5)

INSERT INTO unidades (tipo_id, numero, nombre_display, descripcion, precio, orden) VALUES
(1, 'D01', 'Camarote A', 'Camarote inferior con cortina de privacidad y locker.',       59000,  1),
(1, 'D02', 'Camarote B', 'Camarote superior con luz de lectura y enchufe USB.',         59000,  2),
(2, 'D03', 'Cama 03', 'Cama baja junto a la ventana con luz natural.',                  89000,  3),
(2, 'D04', 'Cama 04', 'Cama alta con cortina de privacidad y luz de lectura.',          89000,  4),
(2, 'D05', 'Cama 05', 'Cama baja con locker individual de madera.',                     89000,  5),
(2, 'D06', 'Cama 06', 'Cama alta con enchufe USB y repisa personal.',                  89000,  6),
(2, 'D07', 'Cama 07', 'Cama baja esquinera, muy tranquila.',                            89000,  7),
(2, 'D08', 'Cama 08', 'Cama alta cerca del baño compartido.',                          89000,  8),
(2, 'D09', 'Cama 09', 'Cama baja con vista al jardín.',                                89000,  9),
(2, 'D10', 'Cama 10', 'Cama alta junto a la ventana, excelente ventilación.',          89000, 10),
(3, 'P1',  'Habitación 1', 'Privada sencilla con decoración artesanal y vista al jardín.',   100000, 11),
(4, 'P2',  'Habitación 2', 'Privada doble con cama matrimonial y escritorio.',              164000, 12),
(4, 'P3',  'Habitación 3', 'Privada doble con balcón y vista a la montaña.',               164000, 13),
(5, 'P4',  'Habitación 4', 'Privada triple amplia con tres camas y zona de trabajo.',       192000, 14),
(6, 'P5',  'Habitación 5', 'La más grande del hostel. Cuatro camas y baño completo.',       261000, 15);

-- ── Servicios ────────────────────────────────────────────────
INSERT INTO servicios (nombre, descripcion, icono_lucide, orden) VALUES
('WiFi de alta velocidad', 'Conexión estable en todas las áreas del hostel.',       'wifi',     1),
('Desayuno incluido',      'Desayuno casero cada mañana con café de la región.',    'coffee',   2),
('Estacionamiento',        'Parqueadero gratuito para huéspedes.',                   'car',      3),
('Tours y excursiones',    'Ayuda para planear recorridos por la región cafetera.',  'map',      4),
('Lavandería',             'Servicio de lavado y secado disponible.',                 'shirt',    5),
('Zona social y bar',      'Espacio compartido con bebidas y snacks.',               'cup-soda', 6);

-- ── Contenido CMS ────────────────────────────────────────────
INSERT INTO contenido (seccion, datos) VALUES
('hero', '{"titulo":"Tu hogar lejos de casa","subtitulo":"Hostal familiar y consciente en el corazón de Dosquebradas, Risaralda","cta_texto":"Reservar ahora","cta_link":"/reservas","slides":[]}'),
('nosotros', '{"titulo":"Un rincón auténtico en Risaralda","parrafo1":"Raizen Hostel nació de la idea de crear un espacio donde los viajeros se sientan como en casa.","parrafo2":"Nuestro hostal combina la hospitalidad colombiana con la comodidad que necesitas."}'),
('valores', '{"items":[{"titulo":"Raíz","descripcion":"Conexión con lo esencial y auténtico.","icono":"leaf"},{"titulo":"Hogar","descripcion":"Un espacio donde sentirse en casa.","icono":"home"},{"titulo":"Calma","descripcion":"Ritmo pausado para recargar energías.","icono":"moon"},{"titulo":"Naturaleza","descripcion":"Rodeados del paisaje cafetero.","icono":"mountain"}]}');
