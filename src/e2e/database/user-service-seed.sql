-- E2Eテスト用 User Service Seedデータ

-- テスト用ユーザーデータの挿入
INSERT INTO users (id, username, email, full_name, created_at, updated_at) VALUES
    ('05c66ceb-6ddc-4ada-b736-08702615ff48', 'tanaka_taro', 'tanaka.taro@example.com', '田中太郎', NOW() - INTERVAL '180 days', NOW() - INTERVAL '180 days'),
    ('4f4777e4-dd9c-4d5b-a928-19a59b1d3ead', 'suzuki_hanako', 'suzuki.hanako@example.com', '鈴木花子', NOW() - INTERVAL '150 days', NOW() - INTERVAL '150 days'),
    ('7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9', 'yamada_jiro', 'yamada.jiro@example.com', '山田次郎', NOW() - INTERVAL '120 days', NOW() - INTERVAL '120 days'),
    ('233c99d5-41ba-42f3-89fa-eb34644fe3b5', 'sato_yuki', 'sato.yuki@example.com', '佐藤優希', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days'),
    ('8a17f2c2-c1c8-4fee-ae95-8a483127bf1f', 'takahashi_mai', 'takahashi.mai@example.com', '高橋舞', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days');

SELECT 'E2E Test: User Service Seed data inserted successfully' AS status;
SELECT COUNT(*) AS user_count FROM users;
