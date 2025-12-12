-- E2Eテスト用 Auth Service Seedデータ

-- 認証情報データの挿入 (パスワードは "password123" のハッシュ値)
-- BCryptでハッシュ化されたパスワード: $2a$10$OSuuVFLoafV6AKzzptdQSeGXQIqx0rU53gtZvYwZ07Des/5txWC6q
INSERT INTO user_credentials (user_id, password_hash, created_at, updated_at) VALUES
    ('05c66ceb-6ddc-4ada-b736-08702615ff48', '$2a$10$OSuuVFLoafV6AKzzptdQSeGXQIqx0rU53gtZvYwZ07Des/5txWC6q', NOW() - INTERVAL '180 days', NOW() - INTERVAL '180 days'),
    ('4f4777e4-dd9c-4d5b-a928-19a59b1d3ead', '$2a$10$OSuuVFLoafV6AKzzptdQSeGXQIqx0rU53gtZvYwZ07Des/5txWC6q', NOW() - INTERVAL '150 days', NOW() - INTERVAL '150 days'),
    ('7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9', '$2a$10$OSuuVFLoafV6AKzzptdQSeGXQIqx0rU53gtZvYwZ07Des/5txWC6q', NOW() - INTERVAL '120 days', NOW() - INTERVAL '120 days'),
    ('233c99d5-41ba-42f3-89fa-eb34644fe3b5', '$2a$10$OSuuVFLoafV6AKzzptdQSeGXQIqx0rU53gtZvYwZ07Des/5txWC6q', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days'),
    ('8a17f2c2-c1c8-4fee-ae95-8a483127bf1f', '$2a$10$OSuuVFLoafV6AKzzptdQSeGXQIqx0rU53gtZvYwZ07Des/5txWC6q', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days');

-- E2Eテスト用のログイン履歴（各ユーザーに1件ずつ成功履歴）
INSERT INTO login_history (user_id, ip_address, user_agent, success, login_at) VALUES
    ('05c66ceb-6ddc-4ada-b736-08702615ff48', '127.0.0.1', 'Playwright/E2E-Test', TRUE, NOW() - INTERVAL '1 day'),
    ('4f4777e4-dd9c-4d5b-a928-19a59b1d3ead', '127.0.0.1', 'Playwright/E2E-Test', TRUE, NOW() - INTERVAL '2 days'),
    ('7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9', '127.0.0.1', 'Playwright/E2E-Test', TRUE, NOW() - INTERVAL '3 days'),
    ('233c99d5-41ba-42f3-89fa-eb34644fe3b5', '127.0.0.1', 'Playwright/E2E-Test', TRUE, NOW() - INTERVAL '4 days'),
    ('8a17f2c2-c1c8-4fee-ae95-8a483127bf1f', '127.0.0.1', 'Playwright/E2E-Test', TRUE, NOW() - INTERVAL '5 days');

SELECT 'E2E Test: Auth Service Seed data inserted successfully' AS status;
SELECT COUNT(*) AS credentials_count FROM user_credentials;
SELECT COUNT(*) AS history_count FROM login_history;
