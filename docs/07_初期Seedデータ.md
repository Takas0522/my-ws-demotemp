# 初期Seedデータ

本ドキュメントでは、開発環境およびE2Eテスト環境で使用される初期Seedデータについて説明します。

## Seedデータの目的

- **開発環境**: 開発時に即座に動作確認できるテストデータを提供
- **E2Eテスト環境**: 自動テストで使用される一貫したテストデータを提供
- **統合テスト環境**: 各サービスの統合テストで使用されるデータを提供

## 共通ユーザーデータ

以下の5名のユーザーがすべてのサービスで共通のUUIDを使用して登録されています。

| ユーザー名 | UUID | メールアドレス | 氏名 | パスワード |
|-----------|------|--------------|------|-----------|
| tanaka_taro | 05c66ceb-6ddc-4ada-b736-08702615ff48 | tanaka.taro@example.com | 田中太郎 | password123 |
| suzuki_hanako | 4f4777e4-dd9c-4d5b-a928-19a59b1d3ead | suzuki.hanako@example.com | 鈴木花子 | password123 |
| yamada_jiro | 7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9 | yamada.jiro@example.com | 山田次郎 | password123 |
| sato_yuki | 233c99d5-41ba-42f3-89fa-eb34644fe3b5 | sato.yuki@example.com | 佐藤優希 | password123 |
| takahashi_mai | 8a17f2c2-c1c8-4fee-ae95-8a483127bf1f | takahashi.mai@example.com | 高橋舞 | password123 |

**パスワード**: すべてのユーザーのパスワードは`password123`で、BCryptでハッシュ化されて保存されています。

**ハッシュ値**: `$2a$10$OSuuVFLoafV6AKzzptdQSeGXQIqx0rU53gtZvYwZ07Des/5txWC6q`

---

## 1. User Service Seedデータ

**ファイル**: `src/user-service/database/seed.sql`

### usersテーブル

| id | username | email | full_name |
|----|----------|-------|-----------|
| 05c66ceb-6ddc-4ada-b736-08702615ff48 | tanaka_taro | tanaka.taro@example.com | 田中太郎 |
| 4f4777e4-dd9c-4d5b-a928-19a59b1d3ead | suzuki_hanako | suzuki.hanako@example.com | 鈴木花子 |
| 7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9 | yamada_jiro | yamada.jiro@example.com | 山田次郎 |
| 233c99d5-41ba-42f3-89fa-eb34644fe3b5 | sato_yuki | sato.yuki@example.com | 佐藤優希 |
| 8a17f2c2-c1c8-4fee-ae95-8a483127bf1f | takahashi_mai | takahashi.mai@example.com | 高橋舞 |

**合計**: 5ユーザー

---

## 2. Auth Service Seedデータ

**ファイル**: `src/auth-service/database/seed.sql`

### user_credentialsテーブル

全5ユーザーの認証情報が登録されています。パスワードは`password123`のBCryptハッシュです。

**合計**: 5件

---

### session_tokensテーブル

開発用に2件のセッショントークンが登録されています。

| user_id | token | expires_at |
|---------|-------|------------|
| 05c66ceb-6ddc-4ada-b736-08702615ff48 | token_tanaka_123456 | 現在日時 + 7日 |
| 4f4777e4-dd9c-4d5b-a928-19a59b1d3ead | token_suzuki_234567 | 現在日時 + 7日 |

**合計**: 2件

**注意**: これらはレガシートークンであり、実際のアプリケーションではJWTトークンを使用します。

---

### login_historyテーブル

開発用のログイン履歴が6件登録されています。

| user_id | ip_address | user_agent | success |
|---------|-----------|------------|---------|
| 05c66ceb-6ddc-4ada-b736-08702615ff48 | 192.168.1.100 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) | TRUE |
| 05c66ceb-6ddc-4ada-b736-08702615ff48 | 192.168.1.100 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) | TRUE |
| 4f4777e4-dd9c-4d5b-a928-19a59b1d3ead | 192.168.1.101 | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) | TRUE |
| 7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9 | 192.168.1.102 | Mozilla/5.0 (X11; Linux x86_64) | TRUE |
| 233c99d5-41ba-42f3-89fa-eb34644fe3b5 | 192.168.1.103 | Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) | TRUE |
| 05c66ceb-6ddc-4ada-b736-08702615ff48 | 192.168.1.100 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) | FALSE |

**合計**: 6件（成功5件、失敗1件）

---

## 3. Point Service Seedデータ

**ファイル**: `src/point-service/database/seed.sql`

### pointsテーブル

全5ユーザーのポイント残高が登録されています。

| user_id | balance | 説明 |
|---------|---------|------|
| 05c66ceb-6ddc-4ada-b736-08702615ff48 | 1500 | 田中太郎のポイント |
| 4f4777e4-dd9c-4d5b-a928-19a59b1d3ead | 3200 | 鈴木花子のポイント |
| 7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9 | 500 | 山田次郎のポイント |
| 233c99d5-41ba-42f3-89fa-eb34644fe3b5 | 2100 | 佐藤優希のポイント |
| 8a17f2c2-c1c8-4fee-ae95-8a483127bf1f | 750 | 高橋舞のポイント |

**合計**: 5件

---

### point_historyテーブル

ポイントの取引履歴が10件登録されています。

#### 田中太郎（05c66ceb-6ddc-4ada-b736-08702615ff48）

| amount | transaction_type | description | created_at | expires_at |
|--------|------------------|-------------|------------|------------|
| 1000 | EARN | 新規登録ボーナス | 現在 - 30日 | 現在 + 150日 |
| 500 | EARN | 購入特典 | 現在 - 10日 | 現在 + 170日 |

**現在の残高**: 1500pt

---

#### 鈴木花子（4f4777e4-dd9c-4d5b-a928-19a59b1d3ead）

| amount | transaction_type | description | created_at | expires_at |
|--------|------------------|-------------|------------|------------|
| 2000 | EARN | 新規登録ボーナス | 現在 - 60日 | 現在 + 120日 |
| 1500 | EARN | キャンペーン特典 | 現在 - 20日 | 現在 + 160日 |
| 300 | USE | 商品購入 | 現在 - 5日 | NULL |

**現在の残高**: 3200pt（2000 + 1500 - 300）

---

#### 山田次郎（7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9）

| amount | transaction_type | description | created_at | expires_at |
|--------|------------------|-------------|------------|------------|
| 500 | EARN | 新規登録ボーナス | 現在 - 90日 | 現在 + 90日 |

**現在の残高**: 500pt

---

#### 佐藤優希（233c99d5-41ba-42f3-89fa-eb34644fe3b5）

| amount | transaction_type | description | created_at | expires_at |
|--------|------------------|-------------|------------|------------|
| 2000 | EARN | 新規登録ボーナス | 現在 - 45日 | 現在 + 135日 |
| 100 | EARN | レビュー投稿 | 現在 - 15日 | 現在 + 165日 |

**現在の残高**: 2100pt

---

#### 高橋舞（8a17f2c2-c1c8-4fee-ae95-8a483127bf1f）

| amount | transaction_type | description | created_at | expires_at |
|--------|------------------|-------------|------------|------------|
| 1000 | EARN | 新規登録ボーナス | 現在 - 120日 | 現在 + 60日 |
| 250 | USE | 商品購入 | 現在 - 10日 | NULL |

**現在の残高**: 750pt（1000 - 250）

---

**合計**: 10件（EARN: 8件、USE: 2件）

---

## E2Eテスト用Seedデータ

E2Eテスト実行時は、上記と同じSeedデータがTestContainersで起動されたPostgreSQLコンテナに投入されます。

**特徴**:
- 各テストシナリオの前にDBがクリーンな状態にリセットされる
- 上記のSeedデータが再投入される
- テスト終了後にコンテナとデータが自動的に削除される

### E2Eテストで使用される主なテストユーザー

**ログインテスト用**:
- ユーザーID: `tanaka_taro` または UUID: `05c66ceb-6ddc-4ada-b736-08702615ff48`
- パスワード: `password123`

---

## Integrationテスト用Seedデータ

**ファイル**: `src/user-service/src/integration-test/resources/*.sql`

Integrationテストでは、E2Eテストと同様にTestContainersを使用して独立したテスト環境でSeedデータを投入します。

詳細は各サービスの`src/integration-test/resources/`ディレクトリ内のSQLファイルを参照してください。

---

## Seedデータの管理

### 開発環境

開発環境では、DevContainer起動時に以下のSQLが自動実行されます：

1. `database/schema.sql` - スキーマ作成
2. `database/seed.sql` - Seedデータ投入

### 手動でのSeedデータ再投入

開発中にデータをリセットしたい場合は、各サービスのデータベースに接続して手動でSQLを実行できます。

```bash
# User Service DB
psql -h localhost -U postgres -d user_service_db -f src/user-service/database/seed.sql

# Auth Service DB
psql -h localhost -U postgres -d auth_service_db -f src/auth-service/database/seed.sql

# Point Service DB
psql -h localhost -U postgres -d point_service_db -f src/point-service/database/seed.sql
```

---

## データ一貫性の確保

各サービスのSeedデータは、同一のUUIDを使用してユーザーを識別しています。これにより、サービス間でのデータ整合性が論理的に保たれます。

**重要**: 新しいテストユーザーを追加する場合は、すべてのサービスのSeedデータを同時に更新する必要があります。
