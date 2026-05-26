USE raizen_hostel;
SET FOREIGN_KEY_CHECKS = 0;

-- Vaciar tablas afectadas
DELETE FROM pagos;
DELETE FROM unidad_imagenes;
DELETE FROM reservas;
DELETE FROM unidades;
DELETE FROM tipos_habitacion;

ALTER TABLE tipos_habitacion AUTO_INCREMENT = 1;
ALTER TABLE unidades AUTO_INCREMENT = 1;

-- Insertar los 6 tipos correspondientes a la imagen
INSERT INTO tipos_habitacion (slug, nombre, descripcion, capacidad, precio_base, popular) VALUES
('cama-camarote', 'Cama en Camarote', 'Habitación compartida', 1, 59000, 0),
('cama-sencilla', 'Cama Sencilla', 'Habitación compartida', 1, 89000, 0),
('privada-sencilla', 'Hab. Sencilla', 'Privada', 1, 100000, 0),
('privada-doble', 'Hab. Doble', 'Privada', 2, 164000, 1),
('privada-triple', 'Hab. Triple', 'Privada', 3, 192000, 0),
('privada-cuadruple', 'Hab. Cuádruple', 'Privada', 4, 261000, 0);

-- Insertar las camas compartidas (2 en camarote, 8 sencillas = 10 total)
-- Camas en Camarote (id 1)
INSERT INTO unidades (tipo_id, numero, nombre_display, descripcion, precio, disponible, orden) VALUES
(1, 'C1A', 'Cama en Camarote Inferior', 'Cama en camarote dentro del dormitorio compartido.', 59000, 1, 1),
(1, 'C1B', 'Cama en Camarote Superior', 'Cama en camarote dentro del dormitorio compartido.', 59000, 1, 2);

-- Camas Sencillas Compartidas (id 2) -> 8 unidades
INSERT INTO unidades (tipo_id, numero, nombre_display, descripcion, precio, disponible, orden) VALUES
(2, 'C2', 'Cama Sencilla 1', 'Cama individual clásica en el dormitorio compartido.', 89000, 1, 3),
(2, 'C3', 'Cama Sencilla 2', 'Cama individual clásica en el dormitorio compartido.', 89000, 1, 4),
(2, 'C4', 'Cama Sencilla 3', 'Cama individual clásica en el dormitorio compartido.', 89000, 1, 5),
(2, 'C5', 'Cama Sencilla 4', 'Cama individual clásica en el dormitorio compartido.', 89000, 1, 6),
(2, 'C6', 'Cama Sencilla 5', 'Cama individual clásica en el dormitorio compartido.', 89000, 1, 7),
(2, 'C7', 'Cama Sencilla 6', 'Cama individual clásica en el dormitorio compartido.', 89000, 1, 8),
(2, 'C8', 'Cama Sencilla 7', 'Cama individual clásica en el dormitorio compartido.', 89000, 1, 9),
(2, 'C9', 'Cama Sencilla 8', 'Cama individual clásica en el dormitorio compartido.', 89000, 1, 10);

-- Insertar las habitaciones privadas (1 de cada una)
INSERT INTO unidades (tipo_id, numero, nombre_display, descripcion, precio, disponible, orden) VALUES
(3, 'P1', 'Habitación Privada Sencilla', 'Habitación para 1 persona, total privacidad.', 100000, 1, 11),
(4, 'P2', 'Habitación Privada Doble', 'Habitación amplia para 2 personas, ideal parejas.', 164000, 1, 12),
(5, 'P3', 'Habitación Privada Triple', 'Habitación para 3 personas, 1 doble y 1 sencilla.', 192000, 1, 13),
(6, 'P4', 'Habitación Privada Cuádruple', 'Espacio familiar o de grupo para 4 personas.', 261000, 1, 14);
