-- ========================================================
-- Kiru Leathers Atelier — Production MySQL Database Dump
-- Compatible with MySQL 8.0+, MariaDB 10.4+, MySQL Workbench, phpMyAdmin
-- Generated on: 2026-11-06T21:28:50.696Z
-- ========================================================

CREATE DATABASE IF NOT EXISTS `kiru_atelier` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kiru_atelier`;

-- 1. Users Table
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `customer_messages`;
DROP TABLE IF EXISTS `ai_conversations`;

CREATE TABLE `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(32) NOT NULL DEFAULT "customer",
  `phone` VARCHAR(64),
  `city` VARCHAR(128) DEFAULT "Addis Ababa",
  `address` TEXT,
  `created_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Products Table
CREATE TABLE `products` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `category_label` VARCHAR(128),
  `price` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `stock` INT DEFAULT 10,
  `rating` DECIMAL(3, 1) DEFAULT 5.0,
  `reviews_count` INT DEFAULT 0,
  `is_new` TINYINT(1) DEFAULT 0,
  `featured` TINYINT(1) DEFAULT 0,
  `images_json` LONGTEXT,
  `colors_json` LONGTEXT,
  `sizes_json` LONGTEXT,
  `created_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Orders Table
CREATE TABLE `orders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64),
  `customer_name` VARCHAR(255),
  `customer_email` VARCHAR(255),
  `customer_phone` VARCHAR(64),
  `customer_address` TEXT,
  `customer_city` VARCHAR(128),
  `delivery_zone_id` VARCHAR(64),
  `delivery_zone_name` VARCHAR(128),
  `subtotal` DECIMAL(12, 2) NOT NULL,
  `discount` DECIMAL(12, 2) DEFAULT 0,
  `shipping` DECIMAL(12, 2) DEFAULT 0,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `currency` VARCHAR(16) NOT NULL DEFAULT "ETB",
  `payment_method` VARCHAR(64) NOT NULL,
  `payment_status` VARCHAR(64) NOT NULL DEFAULT "Pending Verification",
  `status` VARCHAR(64) NOT NULL DEFAULT "Processing",
  `tracking_number` VARCHAR(64),
  `transfer_bank` VARCHAR(64),
  `transfer_transaction_id` VARCHAR(128),
  `transfer_receipt_url` TEXT,
  `rejection_reason` TEXT,
  `notifications_json` LONGTEXT,
  `created_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Order Items Table
CREATE TABLE `order_items` (
  `id` VARCHAR(64) PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `color_name` VARCHAR(64),
  `color_hex` VARCHAR(32),
  `size` VARCHAR(32),
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(12, 2) NOT NULL,
  `customization_json` LONGTEXT,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Customer Messages Table
CREATE TABLE `customer_messages` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64),
  `subject` VARCHAR(255),
  `message` TEXT NOT NULL,
  `status` VARCHAR(32) DEFAULT "new",
  `created_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. AI Conversations Table
CREATE TABLE `ai_conversations` (
  `id` VARCHAR(64) PRIMARY KEY,
  `session_id` VARCHAR(64),
  `prompt` TEXT NOT NULL,
  `response` TEXT NOT NULL,
  `intent` VARCHAR(64),
  `lang` VARCHAR(8) DEFAULT "en",
  `created_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table `users`
INSERT INTO `users` VALUES ("usr_admin_001", "Kirubel Atelier Admin", "admin@kiruleathers.com", "$2b$10$cmXpwGzgE1dLSn8wQS3TfOqhQ5wpGaq7A44bTcGjyiVAuerSA8oYG", "admin", "+251911002233", "Addis Ababa", "Bole Subcity, House 402", "2026-01-01T00:00:00.000Z");
INSERT INTO `users` VALUES ("usr_cust_001", "Ermias Tadesse", "customer@kiruleathers.com", "$2b$10$la16KcA7adU89EpXAqPGmejzTCtyKO8S0TNOoiXR7IgQLejIHOX0q", "customer", "+251912345678", "Addis Ababa", "Kazanchis, Guinea Conakry St", "2026-01-01T00:00:00.000Z");
INSERT INTO `users` VALUES ("usr_1793993960679_cz4w6", "Kirubel Melaku", "kirubelmelaku454@gmail.com", "$2b$10$LwCgYTSLguNXAiuPefYptOcSzPxPnw2zyxxIt1OCb6xSZuAQlKxQi", "customer", "", "Addis Ababa", "", "2026-11-06T19:39:20.679Z");

-- Dumping data for table `products`
INSERT INTO `products` VALUES ("jkt-1", "Sovereign Leather Jacket Vol. 1", "jackets", "Jackets", 1250, "Handcrafted full-grain Italian leather jacket with antique brass trim.", 10, 4.9, 128, 0, 0, "[\"https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Obsidian Black\",\"hex\":\"#111111\"}]", "[\"S\",\"M\",\"L\",\"XL\"]", "2026-11-06T20:14:19.911Z");
INSERT INTO `products` VALUES ("jkt-2", "Vintage Oak Leather Jacket", "jackets", "Jackets", 1300, "Premium distressed leather jacket with custom hardware.", 10, 4.8, 94, 0, 0, "[\"https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Brown\",\"hex\":\"#3D2314\"}]", "[\"M\",\"L\",\"XL\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("jkt-3", "Heritage Rider Biker Jacket", "jackets", "Jackets", 1180, "Classic rider style with smooth interior silk lining.", 10, 5, 42, 0, 0, "[\"https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Black\",\"hex\":\"#111111\"}]", "[\"S\",\"M\",\"L\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("jkt-4", "Tuscan Urban Biker", "jackets", "Jackets", 1220, "Italian tanned calfskin with modern tailored silhouette.", 10, 4.7, 65, 0, 0, "[\"https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Cognac\",\"hex\":\"#9E4712\"}]", "[\"M\",\"L\",\"XL\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("jkt-5", "Aviator Shearling Leather Jacket", "jackets", "Jackets", 1400, "Heavy-duty cold weather aviator jacket with fur collar.", 10, 4.9, 110, 0, 0, "[\"https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Dark Brown\",\"hex\":\"#2B1B17\"}]", "[\"M\",\"L\",\"XL\",\"XXL\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("jkt-6", "Modern Tailored Leather Blazer", "jackets", "Jackets", 1150, "Formal tailored leather blazer for evening luxury wear.", 10, 4.6, 38, 0, 0, "[\"https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Black\",\"hex\":\"#111111\"}]", "[\"S\",\"M\",\"L\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("jkt-7", "Field Utility Leather Coat", "jackets", "Jackets", 1350, "Multiple pocket utility leather coat with durable zip closure.", 10, 4.8, 77, 0, 0, "[\"https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Tan\",\"hex\":\"#A0522D\"}]", "[\"M\",\"L\",\"XL\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("jkt-8", "Cafe Racer Leather Jacket", "jackets", "Jackets", 1280, "Minimalist cafe racer collar with snap button closure.", 10, 4.9, 89, 0, 0, "[\"https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Obsidian Black\",\"hex\":\"#111111\"}]", "[\"S\",\"M\",\"L\",\"XL\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("jkt-9", "Artisan Burnished Bomber", "jackets", "Jackets", 1190, "Ribbed hem and cuff bomber jacket in full-grain leather.", 10, 4.7, 54, 0, 0, "[\"https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Mahogany\",\"hex\":\"#3D2314\"}]", "[\"M\",\"L\",\"XL\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("jkt-10", "Sovereign Special Edition Jacket", "jackets", "Jackets", 1500, "Limited series hand-burnished luxury leather jacket.", 10, 5, 150, 0, 0, "[\"https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Gold Amber\",\"hex\":\"#8B4513\"}]", "[\"S\",\"M\",\"L\",\"XL\",\"XXL\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("wlt-1", "Slim Bifold Leather Folio", "wallets", "Wallets & Small Goods", 180, "Saddle-stitched slim wallet with RFID protection.", 10, 4.9, 210, 0, 0, "[\"https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Cognac\",\"hex\":\"#8B4513\"}]", "[\"Compact\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("wlt-2", "Minimalist Front Pocket Wallet", "wallets", "Wallets & Small Goods", 140, "Ultra-thin card sleeve for up to 8 cards and folded currency.", 10, 4.8, 115, 0, 0, "[\"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Black\",\"hex\":\"#111111\"}]", "[\"Compact\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("wlt-3", "Classic Trifold Wallet", "wallets", "Wallets & Small Goods", 210, "Full capacity trifold leather wallet with coin compartment.", 10, 4.7, 88, 0, 0, "[\"https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Brown\",\"hex\":\"#3D2314\"}]", "[\"Standard\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("wlt-4", "Executive Passport & Travel Folio", "wallets", "Wallets & Small Goods", 260, "Holds passport, travel documents, cards, and cash seamlessly.", 10, 5, 95, 0, 0, "[\"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Tan\",\"hex\":\"#A0522D\"}]", "[\"Travel Size\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("wlt-5", "Zippered Leather Wallet", "wallets", "Wallets & Small Goods", 195, "Full perimeter brass zipper for maximum security.", 10, 4.8, 62, 0, 0, "[\"https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Black\",\"hex\":\"#111111\"}]", "[\"Standard\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("wlt-6", "Money Clip Leather Sleeve", "wallets", "Wallets & Small Goods", 130, "Integrated magnetic brass clip with quick-access card slots.", 10, 4.6, 40, 0, 0, "[\"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Dark Brown\",\"hex\":\"#2B1B17\"}]", "[\"Compact\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("wlt-7", "Hand-Stitched Artisan Wallet", "wallets", "Wallets & Small Goods", 220, "Burnished natural wax edges with antique brass button clasp.", 10, 4.9, 73, 0, 0, "[\"https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Cognac\",\"hex\":\"#8B4513\"}]", "[\"Compact\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("wlt-8", "Long Continental Wallet", "wallets", "Wallets & Small Goods", 250, "Full-length executive wallet featuring multiple bill compartments.", 10, 4.7, 51, 0, 0, "[\"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Black\",\"hex\":\"#111111\"}]", "[\"Long\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("wlt-9", "Key Organizer & Card Holder", "wallets", "Wallets & Small Goods", 120, "Dual functionality pouch with built-in brass key ring.", 10, 4.5, 33, 0, 0, "[\"https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Tan\",\"hex\":\"#A0522D\"}]", "[\"Compact\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("wlt-10", "Heritage Gold Stamp Card Case", "wallets", "Wallets & Small Goods", 150, "Tuscan vegetable-tanned leather with gold foil Kiru crest.", 10, 4.9, 104, 0, 0, "[\"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Mahogany\",\"hex\":\"#3D2314\"}]", "[\"Compact\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("bag-1", "Monarch Executive Duffle", "bags", "Bags & Luggage", 890, "Spacious travel duffle bag constructed from English bridle hide.", 10, 5, 94, 0, 0, "[\"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Mahogany Gold\",\"hex\":\"#3D2314\"}]", "[\"45L\"]", "2026-11-06T20:14:19.912Z");
INSERT INTO `products` VALUES ("bag-2", "Atelier Heritage Tote Bag", "bags", "Bags & Luggage", 850, "Structured leather tote bag with reinforced handles.", 10, 4.9, 88, 0, 0, "[\"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Cognac\",\"hex\":\"#9E4712\"}]", "[\"One Size\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("bag-3", "Executive Leather Briefcase", "bags", "Bags & Luggage", 950, "Dual-section laptop briefcase with brass lock key fob.", 10, 4.8, 65, 0, 0, "[\"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Black\",\"hex\":\"#111111\"}]", "[\"Fits 16 inch Laptop\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("bag-4", "Vagabond Travel Backpack", "bags", "Bags & Luggage", 780, "Padded ergonomic leather straps with laptop slot.", 10, 4.9, 112, 0, 0, "[\"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Brown\",\"hex\":\"#3D2314\"}]", "[\"One Size\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("bag-5", "Crossbody Messenger Bag", "bags", "Bags & Luggage", 640, "Sleek messenger bag with adjustable shoulder webbing.", 10, 4.7, 49, 0, 0, "[\"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Tan\",\"hex\":\"#A0522D\"}]", "[\"Medium\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("bag-6", "Weekender Holdall Bag", "bags", "Bags & Luggage", 870, "Classic cylinder holdall engineered for short trips.", 10, 4.9, 78, 0, 0, "[\"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Dark Brown\",\"hex\":\"#2B1B17\"}]", "[\"40L\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("bag-7", "Structured Luxury Shoulder Bag", "bags", "Bags & Luggage", 690, "Minimalist structured shoulder bag in full-grain calfskin.", 10, 4.6, 35, 0, 0, "[\"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Black\",\"hex\":\"#111111\"}]", "[\"One Size\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("bag-8", "Leather Travel Toiletry Kit", "bags", "Bags & Luggage", 220, "Water-resistant interior Doppler bag for grooming essentials.", 10, 4.8, 90, 0, 0, "[\"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Cognac\",\"hex\":\"#8B4513\"}]", "[\"Small\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("bag-9", "Heritage Satchel Bag", "bags", "Bags & Luggage", 750, "Vintage style satchel with antique brass buckle fasteners.", 10, 4.7, 44, 0, 0, "[\"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Mahogany\",\"hex\":\"#3D2314\"}]", "[\"Medium\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("bag-10", "Commuter Slim Backpack", "bags", "Bags & Luggage", 710, "Modern urban backpack with padded tablet and laptop vault.", 10, 4.9, 81, 0, 0, "[\"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Black\",\"hex\":\"#111111\"}]", "[\"One Size\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("ftw-1", "Aurelius Heritage Chelsea Boot", "footwear", "Footwear", 680, "Goodyear welted Chelsea boots with double-thick leather sole.", 10, 4.8, 76, 0, 0, "[\"https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Burnished Tan\",\"hex\":\"#A0522D\"}]", "[\"40\",\"41\",\"42\",\"43\",\"44\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("ftw-2", "Florentine Leather Dress Loafer", "footwear", "Footwear", 590, "Hand-burnished crust calfskin dress loafers.", 10, 4.9, 52, 0, 0, "[\"https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Espresso\",\"hex\":\"#2B1B17\"}]", "[\"41\",\"42\",\"43\",\"44\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("ftw-3", "Handcrafted Leather Sneaker", "footwear", "Footwear", 450, "Minimalist low-top leather sneaker with stitched cupsole.", 10, 4.7, 88, 0, 0, "[\"https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80\"]", "[{\"name\":\"White & Brown\",\"hex\":\"#FFFFFF\"}]", "[\"40\",\"41\",\"42\",\"43\",\"44\",\"45\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("ftw-4", "Classic Oxford Dress Shoe", "footwear", "Footwear", 620, "Formal cap-toe oxford with traditional closed lacing.", 10, 5, 60, 0, 0, "[\"https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Raven Black\",\"hex\":\"#111111\"}]", "[\"40\",\"41\",\"42\",\"43\",\"44\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("ftw-5", "Rugged Lace-Up Heritage Boot", "footwear", "Footwear", 720, "Heavy-duty outdoor boot with resoleable rubber lug outsole.", 10, 4.9, 105, 0, 0, "[\"https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Cognac\",\"hex\":\"#8B4513\"}]", "[\"41\",\"42\",\"43\",\"44\",\"45\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("ftw-6", "Double Monk Strap Shoe", "footwear", "Footwear", 640, "Italian calfskin dress shoe with dual antique brass buckles.", 10, 4.8, 41, 0, 0, "[\"https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Mahogany\",\"hex\":\"#3D2314\"}]", "[\"40\",\"41\",\"42\",\"43\"]", "2026-11-06T20:14:19.913Z");
INSERT INTO `products` VALUES ("ftw-7", "Suede Chelsea Boot", "footwear", "Footwear", 650, "Tuscan water-resistant suede with double elastic gussets.", 10, 4.6, 37, 0, 0, "[\"https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Sand Suede\",\"hex\":\"#C2B280\"}]", "[\"40\",\"41\",\"42\",\"43\",\"44\"]", "2026-11-06T20:14:19.914Z");
INSERT INTO `products` VALUES ("ftw-8", "Penny Loafer Slip-On", "footwear", "Footwear", 570, "Hand-stitched penny loafer with cushioned leather insoles.", 10, 4.7, 48, 0, 0, "[\"https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Burgundy\",\"hex\":\"#800020\"}]", "[\"41\",\"42\",\"43\",\"44\"]", "2026-11-06T20:14:19.914Z");
INSERT INTO `products` VALUES ("ftw-9", "Brogue Wingtip Derby", "footwear", "Footwear", 630, "Hand-punched brogue decoration along classic wingtip lines.", 10, 4.9, 69, 0, 0, "[\"https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Tan\",\"hex\":\"#A0522D\"}]", "[\"40\",\"41\",\"42\",\"43\",\"44\"]", "2026-11-06T20:14:19.914Z");
INSERT INTO `products` VALUES ("ftw-10", "Heritage Desert Chukka Boot", "footwear", "Footwear", 590, "Ankle-high Chukka boots with natural crepe rubber sole.", 15, 4.8, 55, 0, 0, "[\"https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80\"]", "[{\"name\":\"Dark Brown\",\"hex\":\"#2B1B17\"}]", "[\"40\",\"41\",\"42\",\"43\",\"44\"]", "2026-11-06T20:14:19.914Z");

-- Dumping data for table `orders`
INSERT INTO `orders` VALUES ("KL-889665", null, "Kirubel Melaku", "kirubelmelaku454@gmail.com", "0931058886", "bole", "Addis Ababa", "aa-bole", "Bole, Atlas, Rwanda, Medhanialem (Same-Day Hand Delivery (2 - 4 Hours))", 180, 0, 2, 182, "USD", "chapa", "Approved", "Processing", "TRK-PNI76HD", null, null, null, null, "[{\"id\":\"notif_1793994037781_gkgabq\",\"type\":\"order_placed\",\"title\":\"Order Confirmation Received\",\"message\":\"Thank you for ordering with Kiru Leathers. Your order #KL-889665 for USD 182 has been registered and is being reviewed.\",\"timestamp\":\"2026-11-06T19:40:37.781Z\",\"channel\":\"sms\"}]", "2026-11-06T19:40:37.781Z");
INSERT INTO `orders` VALUES ("order-1791568470046", null, "Collector", "", "", "", "Addis Ababa", "aa-bole", "Bole & Central Addis", 0, 0, 0, 850, "ETB", "mobile_transfer", "Approved", "Processing", "TRK-order-1791568470046", null, null, null, null, "[]", "2026-10-09T17:54:30.046Z");
INSERT INTO `orders` VALUES ("order-1791568507456", null, "Collector", "", "", "", "Addis Ababa", "aa-bole", "Bole & Central Addis", 0, 0, 0, 1250, "ETB", "mobile_transfer", "Approved", "Processing", "TRK-order-1791568507456", null, null, null, null, "[]", "2026-10-09T17:55:07.456Z");
INSERT INTO `orders` VALUES ("order-1791568991727", null, "Collector", "", "", "", "Addis Ababa", "aa-bole", "Bole & Central Addis", 0, 0, 0, 850, "ETB", "mobile_transfer", "Approved", "Processing", "TRK-order-1791568991727", null, null, null, null, "[]", "2026-10-09T18:03:11.727Z");

-- Dumping data for table `order_items`
INSERT INTO `order_items` VALUES ("item_KL-889665_0", "KL-889665", "wlt-1", "Slim Bifold Leather Folio", "Cognac", "#8B4513", "Compact", 1, 180, "null");
INSERT INTO `order_items` VALUES ("item_order-1791568470046_0", "order-1791568470046", "2", "Atelier Heritage Tote", "Cognac", "#9E4712", "L", 1, 850, "null");
INSERT INTO `order_items` VALUES ("item_order-1791568507456_0", "order-1791568507456", "1", "The Sovereign Biker Jacket", "Obsidian Black", "#111111", "L", 1, 1250, "null");
INSERT INTO `order_items` VALUES ("item_order-1791568991727_0", "order-1791568991727", "2", "Atelier Heritage Tote", "Cognac", "#9E4712", "One Size", 1, 850, "null");

