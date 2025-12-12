-- E2Eテスト用 Point Service Seedデータ

-- E2Eテスト用ポイント残高データ
-- 各ユーザーに一定のポイントを付与
INSERT INTO points (user_id, balance, last_updated) VALUES
    ('05c66ceb-6ddc-4ada-b736-08702615ff48', 1500, NOW()),
    ('4f4777e4-dd9c-4d5b-a928-19a59b1d3ead', 3200, NOW()),
    ('7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9', 500, NOW()),
    ('233c99d5-41ba-42f3-89fa-eb34644fe3b5', 2100, NOW()),
    ('8a17f2c2-c1c8-4fee-ae95-8a483127bf1f', 750, NOW());

-- E2Eテスト用ポイント履歴データ
-- 各ユーザーの取引履歴を作成

-- tanaka_taro (1500ポイント)
INSERT INTO point_history (user_id, amount, transaction_type, description, created_at, expires_at) VALUES
    ('05c66ceb-6ddc-4ada-b736-08702615ff48', 1000, 'EARN', '新規登録ボーナス', NOW() - INTERVAL '30 days', NOW() + INTERVAL '150 days'),
    ('05c66ceb-6ddc-4ada-b736-08702615ff48', 500, 'EARN', '購入特典', NOW() - INTERVAL '10 days', NOW() + INTERVAL '170 days');

-- suzuki_hanako (3200ポイント) - 使用履歴あり
INSERT INTO point_history (user_id, amount, transaction_type, description, created_at, expires_at) VALUES
    ('4f4777e4-dd9c-4d5b-a928-19a59b1d3ead', 2000, 'EARN', '新規登録ボーナス', NOW() - INTERVAL '60 days', NOW() + INTERVAL '120 days'),
    ('4f4777e4-dd9c-4d5b-a928-19a59b1d3ead', 1500, 'EARN', 'キャンペーン特典', NOW() - INTERVAL '20 days', NOW() + INTERVAL '160 days'),
    ('4f4777e4-dd9c-4d5b-a928-19a59b1d3ead', 300, 'USE', '商品購入', NOW() - INTERVAL '5 days', NULL);

-- yamada_jiro (500ポイント)
INSERT INTO point_history (user_id, amount, transaction_type, description, created_at, expires_at) VALUES
    ('7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9', 500, 'EARN', '新規登録ボーナス', NOW() - INTERVAL '90 days', NOW() + INTERVAL '90 days');

-- sato_yuki (2100ポイント)
INSERT INTO point_history (user_id, amount, transaction_type, description, created_at, expires_at) VALUES
    ('233c99d5-41ba-42f3-89fa-eb34644fe3b5', 2000, 'EARN', '新規登録ボーナス', NOW() - INTERVAL '45 days', NOW() + INTERVAL '135 days'),
    ('233c99d5-41ba-42f3-89fa-eb34644fe3b5', 100, 'EARN', 'レビュー投稿', NOW() - INTERVAL '15 days', NOW() + INTERVAL '165 days');

-- takahashi_mai (750ポイント) - 使用履歴あり
INSERT INTO point_history (user_id, amount, transaction_type, description, created_at, expires_at) VALUES
    ('8a17f2c2-c1c8-4fee-ae95-8a483127bf1f', 1000, 'EARN', '新規登録ボーナス', NOW() - INTERVAL '120 days', NOW() + INTERVAL '60 days'),
    ('8a17f2c2-c1c8-4fee-ae95-8a483127bf1f', 250, 'USE', '商品購入', NOW() - INTERVAL '10 days', NULL);

SELECT 'E2E Test: Point Service Seed data inserted successfully' AS status;
SELECT COUNT(*) AS points_count FROM points;
SELECT COUNT(*) AS history_count FROM point_history;
