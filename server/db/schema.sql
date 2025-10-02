-- Create database and tables for TEXplods
CREATE DATABASE IF NOT EXISTS `texplods` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `texplods`;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(160) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `category` VARCHAR(40) NOT NULL,
  `badge` VARCHAR(60) NULL,
  `image` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `newsletter` (
  `email` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `isAdmin` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create default admin user (password: admin123)
INSERT INTO `users` (`email`, `password`, `name`, `isAdmin`) VALUES
('admin@texplod.com', '$2b$10$Gdl5m8BvGtKT.QJKUf1dXenV/GLTAX8sg/Apx3rNCRT4.zM61ypXK', 'Admin User', TRUE);

INSERT INTO `products` (`name`, `price`, `category`, `badge`, `image`) VALUES
('Aria Linen Throw', 49, 'textiles', 'Cozy', 'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1600&auto=format&fit=crop'),
('Nordic Floor Lamp', 129, 'lighting', 'New', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1600&auto=format&fit=crop'),
('Terra Cotta Vase', 39, 'decor', 'Bestseller', 'https://images.unsplash.com/photo-1582582429416-c3d06d1b9d8a?q=80&w=1600&auto=format&fit=crop'),
('Framed Abstract Art', 89, 'wall-art', 'Curated', 'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?q=80&w=1600&auto=format&fit=crop'),
('Monstera Plant', 35, 'plants', 'Fresh', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1600&auto=format&fit=crop'),
('Woven Jute Rug', 149, 'textiles', 'Natural', 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop'),
('Minimal Wall Clock', 45, 'decor', 'Minimal', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1600&auto=format&fit=crop#clock'),
('Oak Floating Shelf', 59, 'storage', 'Solid Wood', 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=1600&auto=format&fit=crop'),
('Rattan Storage Basket', 29, 'storage', 'Tidy', 'https://images.unsplash.com/photo-1578894380025-ffe3f57a0618?q=80&w=1600&auto=format&fit=crop'),
('Eucalyptus Stems', 19, 'decor', 'Evergreen', 'https://images.unsplash.com/photo-1543335200-65c9401d1509?q=80&w=1600&auto=format&fit=crop'),
('Brass Table Lamp', 99, 'lighting', 'Warm', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1600&auto=format&fit=crop'),
('Fringe Cushion Cover', 25, 'textiles', 'Soft', 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1600&auto=format&fit=crop');


