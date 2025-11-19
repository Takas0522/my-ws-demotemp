-- ユーザー管理サービスのSeedデータ
\c user_service_db;

-- ユーザーデータの挿入
INSERT INTO users (username, email, full_name) VALUES
    ('tanaka_taro', 'tanaka.taro@example.com', '田中太郎'),
    ('suzuki_hanako', 'suzuki.hanako@example.com', '鈴木花子'),
    ('yamada_jiro', 'yamada.jiro@example.com', '山田次郎'),
    ('sato_yuki', 'sato.yuki@example.com', '佐藤優希'),
    ('takahashi_mai', 'takahashi.mai@example.com', '高橋舞');

SELECT 'User Service Seed data inserted successfully' AS status;
SELECT COUNT(*) AS user_count FROM users;
