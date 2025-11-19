CREATE TABLE IF NOT EXISTS sample (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed データの挿入
INSERT INTO sample (name, description) VALUES
    ('サンプル1', 'これは最初のサンプルデータです'),
    ('サンプル2', 'これは2番目のサンプルデータです'),
    ('サンプル3', 'これは3番目のサンプルデータです'),
    ('Sample 4', 'This is the fourth sample data'),
    ('Sample 5', 'This is the fifth sample data');

-- データが正しく挿入されたことを確認
SELECT * FROM sample;
