-- ==================================================================================
-- ARQUIVO: BACK/src/main/resources/data.sql
-- ==================================================================================

-- 1. LIMPEZA DA BASE
DELETE FROM pedido_aviso;
DELETE FROM itens_pedido;
DELETE FROM pagamentos;
DELETE FROM pedidos;
DELETE FROM produtos;
DELETE FROM categorias;
DELETE FROM marcas;

-- 2. INSERÇÃO DE MARCAS
INSERT INTO marcas (id, nome) VALUES 
(1, 'Nike'), (2, 'Air Jordan'), (3, 'Adidas'), (4, 'Bape'), (5, 'Asics'),
(6, 'New Balance'), (7, 'Puma'), (8, 'Timberland'), (9, 'Crocs'),
(10, 'Louis Vuitton'), (11, 'Dior'), (12, 'Yeezy');

-- 3. INSERÇÃO DE CATEGORIAS
INSERT INTO categorias (id, nome) VALUES 
(1, 'Air Max 95'), (2, 'Air Max DN'), (3, 'Air Max TN'), (4, 'Dunk'), 
(5, 'Jordan'), (6, 'Outros'), (7, 'Acessórios'), (8, 'Casual'), 
(9, 'Corrida'), (10, 'Botas'), (11, 'Chuteiras'), (12, 'Sandálias');

-- 4. INSERÇÃO DE PRODUTOS
-- Sintaxe: (nome, descricao, preco, preco_original, imagem_url, imagem_url_2, imagem_url_3, imagem_url_4, estoque, marca_id, categoria_id, codigo_modelo)

INSERT INTO produtos (nome, descricao, preco, preco_original, imagem_url, imagem_url_2, imagem_url_3, imagem_url_4, estoque, marca_id, categoria_id, codigo_modelo) VALUES

-- 1. Dunk Panda (Produto Simples)
('Nike Dunk Low "Panda"', 'O clássico preto e branco.', 899.90, 1199.90, 'uploads/dunk-panda.jpg', NULL, NULL, NULL, 100, 1, 4, 'NIKE_DUNK'),

-- 2. TN Tiger (Exemplo Completo: 4 Fotos + Variação)
('Nike Air Max Plus TN "Tiger"', 'Degradê laranja clássico. O preferido das ruas.', 1199.90, 1499.90, 
 'uploads/tn-tiger-1.jpg',   -- Foto 1
 'uploads/tn-tiger-2.jpg',   -- Foto 2 (Certifique-se que esses arquivos existem na pasta uploads)
 'uploads/tn-tiger-3.jpg',   -- Foto 3
 'uploads/tn-tiger-4.jpg',   -- Foto 4
 100, 1, 3, 'NIKE_TN'),

-- 3. TN Triple Black (Variação do Tiger - Mesmo codigo_modelo 'NIKE_TN')
('Nike Air Max Plus TN "Triple Black"', 'Visual agressivo e totalmente preto.', 1199.90, 1399.90, 
 'uploads/tn-triple-black.jpg', NULL, NULL, NULL, 
 80, 1, 3, 'NIKE_TN'),

-- 4. 95 Corteiz
('Air Max 95 x Corteiz "Gutta Green"', 'Colaboração exclusiva.', 1899.90, 2500.00, 'uploads/95-corteiz-green.jpg', NULL, NULL, NULL, 20, 1, 1, 'AM95_CORTEIZ'),

-- 5. Dn All Day
('Nike Air Max Dn "All Day"', 'Tecnologia Dynamic Air.', 1299.90, 1599.90, 'uploads/dn-all-day.jpg', NULL, NULL, NULL, 50, 1, 2, 'NIKE_DN'),

-- 6. Dn Volt (Variação do Dn)
('Nike Air Max Dn "Volt"', 'Cor vibrante neon.', 1299.90, 1599.90, 'uploads/dn-volt.jpg', NULL, NULL, NULL, 40, 1, 2, 'NIKE_DN'),

-- 7. Asics NYC
('Asics Gel-NYC "Cream/Oyster"', 'Estilo urbano NY.', 999.90, 1199.90, 'uploads/asics-nyc.jpg', NULL, NULL, NULL, 60, 5, 8, 'ASICS_NYC'),

-- 8. Asics Kayano 14
('Asics Gel-Kayano 14 "Metallic Silver"', 'Retrô running Y2K.', 1099.90, 1399.90, 'uploads/asics-kayano14.jpg', NULL, NULL, NULL, 45, 5, 9, 'ASICS_KAYANO14'),

-- 9. NB 1000
('New Balance 1000 "Silver"', 'Design robusto.', 1199.90, 1499.90, 'uploads/nb-1000.jpg', NULL, NULL, NULL, 30, 6, 8, 'NB_1000'),

-- 10. Timberland
('Bota Timberland Yellow Boot 6"', 'A bota original.', 1299.90, 1599.90, 'uploads/timberland-yellow.jpg', NULL, NULL, NULL, 50, 8, 10, 'TIMBERLAND'),

-- 11. Meia Adidas
('Kit 3 Pares Meia Adidas Crew', 'Conforto clássico.', 89.90, 119.90, 'uploads/meia-adidas.jpg', NULL, NULL, NULL, 200, 3, 7, 'MEIA_ADIDAS'),

-- 12. Meia Nike
('Kit 3 Pares Meia Nike Everyday', 'Tecnologia Dri-FIT.', 99.90, 129.90, 'uploads/meia-nike.jpg', NULL, NULL, NULL, 200, 1, 7, 'MEIA_NIKE'),

-- 13. Dunk SB
('Nike SB Dunk Low "Pro"', 'Design skate.', 999.90, 1299.90, 'uploads/dunk-sb.jpg', NULL, NULL, NULL, 70, 1, 4, 'NIKE_DUNK_SB'),

-- 14. TN 3
('Nike Air Max Plus 3 "Black/Red"', 'TN3 Aerodinâmico.', 1299.90, 1599.90, 'uploads/tn3-black-red.jpg', NULL, NULL, NULL, 40, 1, 3, 'NIKE_TN3'),

-- 15. P6000
('Nike P-6000 "Metallic Silver"', 'Corrida retrô.', 799.90, 999.90, 'uploads/p6000.jpg', NULL, NULL, NULL, 60, 1, 8, 'NIKE_P6000'),

-- 16. Dunk Travis
('Nike Dunk Low x Travis Scott', 'Cactus Jack.', 1899.90, 2999.90, 'uploads/dunk-travis.jpg', NULL, NULL, NULL, 15, 1, 4, 'DUNK_TRAVIS'),

-- 17. Bapesta
('A Bathing Ape Bapesta "Green Camo"', 'Streetwear japonês.', 2199.90, 2899.90, 'uploads/bapesta-camo.jpg', NULL, NULL, NULL, 10, 4, 8, 'BAPESTA'),

-- 18. Air Force
('Nike Air Force 1 "Triple White"', 'Essencial.', 799.90, 999.90, 'uploads/af1-white.jpg', NULL, NULL, NULL, 150, 1, 8, 'AF1'),

-- 19. Air Force com AIR
('Nike Air Force 1 "Overbranding"', 'Logos AIR.', 849.90, 1099.90, 'uploads/af1-air.jpg', NULL, NULL, NULL, 80, 1, 8, 'AF1_AIR'),

-- 20. Air Max 90
('Nike Air Max 90 "Infrared"', 'Clássico 90.', 899.90, 1199.90, 'uploads/am90-infrared.jpg', NULL, NULL, NULL, 60, 1, 8, 'AM90'),

-- 21. NB 740
('New Balance 740 "White/Green"', 'Dad shoe.', 899.90, 1099.90, 'uploads/nb-740.jpg', NULL, NULL, NULL, 40, 6, 8, 'NB_740'),

-- 22. Dior 30
('Dior B30 Sneaker "Black"', 'Luxo Dior.', 5999.90, 7500.00, 'uploads/dior-b30.jpg', NULL, NULL, NULL, 5, 11, 8, 'DIOR_B30'),

-- 23. Crocs Bape
('Crocs x Bape Classic Clog', 'Camo Bape.', 599.90, 899.90, 'uploads/crocs-bape.jpg', NULL, NULL, NULL, 30, 9, 12, 'CROCS_BAPE'),

-- 24. Crocs Macqueen
('Crocs Classic Clog "Lightning McQueen"', 'Kachow!', 499.90, 799.90, 'uploads/crocs-mcqueen.jpg', NULL, NULL, NULL, 50, 9, 12, 'CROCS_MCQUEEN'),

-- 25. Vapor Max
('Nike Air VaporMax Plus "Black"', 'Solado Air.', 1399.90, 1699.90, 'uploads/vapormax.jpg', NULL, NULL, NULL, 40, 1, 8, 'VAPORMAX'),

-- 26. Puma 180
('Puma-180 "White/Black"', 'Skate anos 90.', 699.90, 899.90, 'uploads/puma-180.jpg', NULL, NULL, NULL, 50, 7, 8, 'PUMA_180'),

-- 27. Nike Shox
('Nike Shox TL "Black"', 'Molas.', 1299.90, 1599.90, 'uploads/shox-tl.jpg', NULL, NULL, NULL, 45, 1, 8, 'NIKE_SHOX'),

-- 28. Nike Hot Step 2
('Nike Nocta Hot Step 2 "White"', 'Nocta Drake.', 1499.90, 1899.90, 'uploads/nocta-hotstep2.jpg', NULL, NULL, NULL, 25, 1, 8, 'NOCTA_HOTSTEP2'),

-- 29. LV Trainer
('Louis Vuitton Trainer "Green"', 'Virgil Abloh.', 6999.90, 8500.00, 'uploads/lv-trainer.jpg', NULL, NULL, NULL, 5, 10, 8, 'LV_TRAINER'),

-- 30. Adidas Campus
('Adidas Campus 00s "Grey"', 'Retrô skate.', 799.90, 999.90, 'uploads/adidas-campus.jpg', NULL, NULL, NULL, 80, 3, 8, 'ADIDAS_CAMPUS'),

-- 31. NB 9060
('New Balance 9060 "Rain Cloud"', 'Futurista.', 1199.90, 1499.90, 'uploads/nb-9060.jpg', NULL, NULL, NULL, 40, 6, 8, 'NB_9060'),

-- 32. Nike Vomero 5
('Nike Zoom Vomero 5 "Supersonic"', 'Corrida técnica.', 1099.90, 1399.90, 'uploads/vomero-5.jpg', NULL, NULL, NULL, 50, 1, 9, 'NIKE_VOMERO5'),

-- 33. Jordan AJ3
('Air Jordan 3 Retro "White Cement"', 'Elephant Print.', 1399.90, 1799.90, 'uploads/jordan-3.jpg', NULL, NULL, NULL, 30, 2, 5, 'JORDAN_3'),

-- 34. Chuteiras
('Nike Mercurial Superfly 9 Elite', 'Futebol.', 1599.90, 1999.90, 'uploads/mercurial.jpg', NULL, NULL, NULL, 30, 1, 11, 'NIKE_MERCURIAL'),

-- 35. Jordan 4
('Air Jordan 4 Retro "Military Black"', 'Suporte clássico.', 1499.90, 1899.90, 'uploads/jordan-4.jpg', NULL, NULL, NULL, 40, 2, 5, 'JORDAN_4'),

-- 36. Jordan 11
('Air Jordan 11 Retro "Concord"', 'Verniz.', 1599.90, 1999.90, 'uploads/jordan-11.jpg', NULL, NULL, NULL, 25, 2, 5, 'JORDAN_11'),

-- 37. NB 530
('New Balance 530 "White/Silver"', 'Running leve.', 699.90, 899.90, 'uploads/nb-530.jpg', NULL, NULL, NULL, 70, 6, 8, 'NB_530'),

-- 38. Slide Yeezy
('Yeezy Slide "Onyx"', 'Conforto EVA.', 499.90, 799.90, 'uploads/yeezy-slide.jpg', NULL, NULL, NULL, 100, 12, 12, 'YEEZY_SLIDE'),

-- 39. ADI 2000
('Adidas ADI2000 "White/Black"', 'Skate 2000.', 749.90, 949.90, 'uploads/adi-2000.jpg', NULL, NULL, NULL, 50, 3, 8, 'ADI_2000'),

-- 40. Court Vision
('Nike Court Vision Low', 'Basquete casual.', 499.90, 699.90, 'uploads/court-vision.jpg', NULL, NULL, NULL, 100, 1, 8, 'COURT_VISION'),

-- 41. Puma Suede
('Puma Suede Classic XXI', 'Camurça.', 449.90, 599.90, 'uploads/puma-suede.jpg', NULL, NULL, NULL, 80, 7, 8, 'PUMA_SUEDE'),

-- 42. Dn3 Black
('Nike Air Max Dn3 "Black/White"', 'Variação Dn.', 1299.90, 1599.90, 'uploads/dn3-bw.jpg', NULL, NULL, NULL, 40, 1, 2, 'NIKE_DN'),

-- 43. Air Max 97
('Nike Air Max 97 "Silver Bullet"', 'Trem bala.', 1099.90, 1399.90, 'uploads/am97.jpg', NULL, NULL, NULL, 50, 1, 8, 'AM97'),

-- 44. Yeezy 700 v3
('Yeezy 700 V3 "Azael"', 'Alienígena.', 1699.90, 2199.90, 'uploads/yeezy-700v3.jpg', NULL, NULL, NULL, 20, 12, 8, 'YEEZY_700V3'),

-- 45. Drift
('Nike Air Max Plus Drift "Phantom"', 'TN Drift.', 1299.90, 1599.90, 'uploads/tn-drift.jpg', NULL, NULL, NULL, 30, 1, 3, 'NIKE_TN_DRIFT'),

-- 46. Glide
('Nike Nocta Glide "Black/White"', 'Nocta.', 1199.90, 1499.90, 'uploads/nocta-glide.jpg', NULL, NULL, NULL, 25, 1, 8, 'NOCTA_GLIDE'),

-- 47. TN Terrascape
('Nike Air Max Terrascape Plus', 'Sustentável.', 1099.90, 1399.90, 'uploads/tn-terrascape.jpg', NULL, NULL, NULL, 40, 1, 3, 'TN_TERRASCAPE'),

-- 48. Ultraboost
('Adidas Ultraboost Light', 'Energia.', 999.90, 1299.90, 'uploads/adidas-ultraboost.jpg', NULL, NULL, NULL, 60, 3, 9, 'ADIDAS_RUN');