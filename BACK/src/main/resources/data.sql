-- ==================================================================================
-- ARQUIVO: BACK/src/main/resources/data.sql
-- ==================================================================================

-- 1. LIMPEZA DA BASE (Ordem correta para respeitar as chaves estrangeiras)
DELETE FROM pedido_aviso;
DELETE FROM itens_pedido;
DELETE FROM pagamentos;
DELETE FROM pedidos;
DELETE FROM produtos;
DELETE FROM categorias;
DELETE FROM marcas;

-- 2. INSERÇÃO DE MARCAS (IDs fixos para referência)
INSERT INTO marcas (id, nome) VALUES 
(1, 'Nike'), 
(2, 'Air Jordan'), 
(3, 'Adidas'), 
(4, 'Bape'), 
(5, 'Asics'),
(6, 'New Balance'),
(7, 'Puma'),
(8, 'Timberland'),
(9, 'Crocs'),
(10, 'Louis Vuitton'),
(11, 'Dior'),
(12, 'Yeezy');

-- 3. INSERÇÃO DE CATEGORIAS
INSERT INTO categorias (id, nome) VALUES 
(1, 'Air Max 95'), 
(2, 'Air Max DN'), 
(3, 'Air Max TN'), 
(4, 'Dunk'), 
(5, 'Jordan'), 
(6, 'Outros'),
(7, 'Acessórios'),
(8, 'Casual'),
(9, 'Corrida'),
(10, 'Botas'),
(11, 'Chuteiras'),
(12, 'Sandálias');

-- 4. INSERÇÃO DE PRODUTOS (46 Modelos Base)
-- Obs: Preços e descrições são sugestões. Ajuste conforme necessário.

INSERT INTO produtos (nome, descricao, preco, preco_original, imagem_url, estoque, marca_id, categoria_id) VALUES

-- 1. Dunk
('Nike Dunk Low "Panda"', 'O clássico preto e branco, essencial para qualquer coleção.', 899.90, 1199.90, 'uploads/dunk-panda.jpg', 100, 1, 4),

-- 2. TN (Air Max Plus)
('Nike Air Max Plus TN "Triple Black"', 'Visual agressivo e totalmente preto para um estilo stealth.', 1199.90, 1399.90, 'uploads/tn-triple-black.jpg', 80, 1, 3),

-- 3. 95 Corteiz
('Air Max 95 x Corteiz "Gutta Green"', 'Colaboração exclusiva com a Corteiz, detalhes militares.', 1899.90, 2500.00, 'uploads/95-corteiz-green.jpg', 20, 1, 1),

-- 4. Dn
('Nike Air Max Dn "All Day"', 'A nova era do Air. Tecnologia Dynamic Air para conforto máximo.', 1299.90, 1599.90, 'uploads/dn-all-day.jpg', 50, 1, 2),

-- 5. Dn8 (Tratado como variação do Dn)
('Nike Air Max Dn "Volt"', 'Cor vibrante que destaca a tecnologia dos tubos de ar.', 1299.90, 1599.90, 'uploads/dn-volt.jpg', 40, 1, 2),

-- 6. Asics NYC
('Asics Gel-NYC "Cream/Oyster"', 'Estilo urbano inspirado em Nova York com conforto Gel.', 999.90, 1199.90, 'uploads/asics-nyc.jpg', 60, 5, 8),

-- 7. Asics Kayano 14
('Asics Gel-Kayano 14 "Metallic Silver"', 'Retrô running com estética futurista dos anos 2000.', 1099.90, 1399.90, 'uploads/asics-kayano14.jpg', 45, 5, 8),

-- 8. NB 1000
('New Balance 1000 "Silver"', 'Design robusto e metálico, trazendo de volta o estilo Y2K.', 1199.90, 1499.90, 'uploads/nb-1000.jpg', 30, 6, 8),

-- 9. Timberland
('Bota Timberland Yellow Boot 6"', 'A bota original à prova d''água. Ícone de durabilidade.', 1299.90, 1599.90, 'uploads/timberland-yellow.jpg', 50, 8, 10),

-- 10. Meia Adidas
('Kit 3 Pares Meia Adidas Crew', 'Conforto clássico com as três listras.', 89.90, 119.90, 'uploads/meia-adidas.jpg', 200, 3, 7),

-- 11. Meia Nike
('Kit 3 Pares Meia Nike Everyday', 'Tecnologia Dri-FIT para o dia a dia.', 99.90, 129.90, 'uploads/meia-nike.jpg', 200, 1, 7),

-- 12. Dunk SB
('Nike SB Dunk Low "Pro"', 'Design skate com acolchoamento extra e estilo único.', 999.90, 1299.90, 'uploads/dunk-sb.jpg', 70, 1, 4),

-- 13. TN 3
('Nike Air Max Plus 3 "Black/Red"', 'A evolução do TN com design aerodinâmico no calcanhar.', 1299.90, 1599.90, 'uploads/tn3-black-red.jpg', 40, 1, 3),

-- 14. P6000
('Nike P-6000 "Metallic Silver"', 'Mistura de Pegasus 25 e 2006. Corrida retrô.', 799.90, 999.90, 'uploads/p6000.jpg', 60, 1, 8),

-- 15. Dunk Travis
('Nike Dunk Low x Travis Scott', 'Estampa Paisley e design exclusivo Cactus Jack.', 1899.90, 2999.90, 'uploads/dunk-travis.jpg', 15, 1, 4),

-- 16. Bapesta
('A Bathing Ape Bapesta "Green Camo"', 'O ícone do streetwear japonês com o clássico camo.', 2199.90, 2899.90, 'uploads/bapesta-camo.jpg', 10, 4, 8),

-- 17. Air Force
('Nike Air Force 1 "Triple White"', 'O tênis mais vendido da história. Essencial.', 799.90, 999.90, 'uploads/af1-white.jpg', 150, 1, 8),

-- 18. Air Force com AIR (More Uptempo style ou branding)
('Nike Air Force 1 "Overbranding"', 'Logos AIR em destaque para um visual ousado.', 849.90, 1099.90, 'uploads/af1-air.jpg', 80, 1, 8),

-- 19. Air Max 90
('Nike Air Max 90 "Infrared"', 'O clássico que definiu a década de 90.', 899.90, 1199.90, 'uploads/am90-infrared.jpg', 60, 1, 8),

-- 20. NB 740
('New Balance 740 "White/Green"', 'Estilo dad shoe autêntico e confortável.', 899.90, 1099.90, 'uploads/nb-740.jpg', 40, 6, 8),

-- 21. Dior 30 (B30)
('Dior B30 Sneaker "Black"', 'Luxo e esportividade. O sneaker definitivo da Dior.', 5999.90, 7500.00, 'uploads/dior-b30.jpg', 5, 11, 8),

-- 22. Crocs Bape
('Crocs x Bape Classic Clog', 'Conforto Crocs com a camuflagem exclusiva Bape.', 599.90, 899.90, 'uploads/crocs-bape.jpg', 30, 9, 12),

-- 23. Crocs Macqueen (Lightning McQueen)
('Crocs Classic Clog "Lightning McQueen"', 'Kachow! Edição especial com luzes de LED.', 499.90, 799.90, 'uploads/crocs-mcqueen.jpg', 50, 9, 12),

-- 24. Vapor Max
('Nike Air VaporMax Plus "Black"', 'Solado Air completo para sensação de andar nas nuvens.', 1399.90, 1699.90, 'uploads/vapormax.jpg', 40, 1, 8),

-- 25. Puma 180
('Puma-180 "White/Black"', 'Estética skate dos anos 90 com volume extra.', 699.90, 899.90, 'uploads/puma-180.jpg', 50, 7, 8),

-- 26. Nike Shox
('Nike Shox TL "Black"', 'O retorno das molas. Design agressivo e mecânico.', 1299.90, 1599.90, 'uploads/shox-tl.jpg', 45, 1, 8),

-- 27. Nike Hot Step 2 (Nocta)
('Nike Nocta Hot Step 2 "White"', 'Parceria com Drake. Design robusto e futurista.', 1499.90, 1899.90, 'uploads/nocta-hotstep2.jpg', 25, 1, 8),

-- 28. LV Trainer
('Louis Vuitton Trainer "Green"', 'Virgil Abloh design. O ápice do sneaker de luxo.', 6999.90, 8500.00, 'uploads/lv-trainer.jpg', 5, 10, 8),

-- 29. Adidas Campus
('Adidas Campus 00s "Grey"', 'Estilo retrô skate com silhueta robusta.', 799.90, 999.90, 'uploads/adidas-campus.jpg', 80, 3, 8),

-- 30. NB 9060
('New Balance 9060 "Rain Cloud"', 'Design futurista e conforto premium da série 99X.', 1199.90, 1499.90, 'uploads/nb-9060.jpg', 40, 6, 8),

-- 31. Nike Vomero 5
('Nike Zoom Vomero 5 "Supersonic"', 'Complexidade técnica e visual de corrida retrô.', 1099.90, 1399.90, 'uploads/vomero-5.jpg', 50, 1, 8),

-- 32. Jordan AJ3
('Air Jordan 3 Retro "White Cement"', 'A silhueta que introduziu o Jumpman e o Elephant Print.', 1399.90, 1799.90, 'uploads/jordan-3.jpg', 30, 2, 5),

-- 33. Chuteiras
('Nike Mercurial Superfly 9 Elite', 'Velocidade explosiva para o campo.', 1599.90, 1999.90, 'uploads/mercurial.jpg', 30, 1, 11),

-- 34. Jordan 4
('Air Jordan 4 Retro "Military Black"', 'Design industrial e suporte clássico.', 1499.90, 1899.90, 'uploads/jordan-4.jpg', 40, 2, 5),

-- 35. Jordan 11
('Air Jordan 11 Retro "Concord"', 'Verniz brilhante e elegância para as quadras.', 1599.90, 1999.90, 'uploads/jordan-11.jpg', 25, 2, 5),

-- 36. NB 530
('New Balance 530 "White/Silver"', 'Estilo retrô running leve e respirável.', 699.90, 899.90, 'uploads/nb-530.jpg', 70, 6, 8),

-- 37. Slide (Yeezy)
('Yeezy Slide "Onyx"', 'Minimalismo e conforto supremo em EVA.', 499.90, 799.90, 'uploads/yeezy-slide.jpg', 100, 12, 12),

-- 38. ADI 2000
('Adidas ADI2000 "White/Black"', 'Inspirado nos tênis de skate robustos dos anos 2000.', 749.90, 949.90, 'uploads/adi-2000.jpg', 50, 3, 8),

-- 39. Court Vision
('Nike Court Vision Low', 'Estilo basquete anos 80 para o dia a dia.', 499.90, 699.90, 'uploads/court-vision.jpg', 100, 1, 8),

-- 40. Suede
('Puma Suede Classic XXI', 'O ícone de camurça que atravessa gerações.', 449.90, 599.90, 'uploads/puma-suede.jpg', 80, 7, 8),

-- 41. Nike Dn3 (Provavelmente outro Dn ou erro, adicionando variação)
('Nike Air Max Dn "Black/White"', 'Variação clássica da nova silhueta Dn.', 1299.90, 1599.90, 'uploads/dn-bw.jpg', 40, 1, 2),

-- 42. Air Max 97
('Nike Air Max 97 "Silver Bullet"', 'Inspirado nos trens bala japoneses. Design fluido.', 1099.90, 1399.90, 'uploads/am97.jpg', 50, 1, 8),

-- 43. Yeezy 700 v3
('Yeezy 700 V3 "Azael"', 'Design alienígena com estrutura brilha no escuro.', 1699.90, 2199.90, 'uploads/yeezy-700v3.jpg', 20, 12, 8),

-- 44. Drift (Air Max Plus Drift)
('Nike Air Max Plus Drift "Phantom"', 'Uma nova abordagem mais robusta do clássico TN.', 1299.90, 1599.90, 'uploads/tn-drift.jpg', 30, 1, 3),

-- 45. Glide (Nocta Glide)
('Nike Nocta Glide "Black/White"', 'Inspirado no Zoom Flight 95, parceria com Drake.', 1199.90, 1499.90, 'uploads/nocta-glide.jpg', 25, 1, 8),

-- 46. TN Terrascape
('Nike Air Max Terrascape Plus', 'TN reinventado com materiais sustentáveis.', 1099.90, 1399.90, 'uploads/tn-terrascape.jpg', 40, 1, 3),

-- 47. Adidas de Corrida (Ultraboost)
('Adidas Ultraboost Light', 'Energia épica. O tênis de corrida mais leve.', 999.90, 1299.90, 'uploads/ultraboost.jpg', 60, 3, 9);
