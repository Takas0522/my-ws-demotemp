# Auth Service

認証とセッション管理を行うマイクロサービス

## 概要

認証サービスは、ユーザーのログイン認証、セッショントークンの発行・管理、ログイン履歴の記録を行います。

## API エンドポイント

ベースURL: `http://localhost:8081/api`

### 認証

#### ログイン
```
POST /auth/login
Content-Type: application/json

{
  "userId": 1,
  "password": "password123"
}
```

レスポンス例（成功）:
```json
{
  "token": "aBc123XyZ...",
  "userId": 1,
  "expiresAt": "2024-01-08T00:00:00"
}
```

レスポンス例（失敗）:
```json
{
  "error": "Invalid credentials"
}
```

#### トークン検証
```
POST /auth/verify
Authorization: Bearer {token}
```

レスポンス例:
```json
{
  "valid": true,
  "userId": 1,
  "expiresAt": "2024-01-08T00:00:00"
}
```

#### ログアウト
```
POST /auth/logout
Authorization: Bearer {token}
```

レスポンス例:
```json
{
  "message": "Logged out successfully"
}
```

#### 期限切れセッションのクリーンアップ
```
POST /auth/cleanup
```

レスポンス例:
```json
{
  "message": "Expired sessions cleaned up successfully"
}
```

## セキュリティ

### パスワードハッシュ

パスワードは BCrypt アルゴリズムでハッシュ化されます:
- ラウンド数: 10
- ライブラリ: jBCrypt

### トークン生成

セッショントークンは以下の仕様で生成されます:
- 長さ: 32バイト
- エンコーディング: Base64 URL-safe
- 有効期限: 7日間

## データベーススキーマ

### user_credentials テーブル
| カラム | 型 | 説明 |
|-------|-----|------|
| id | SERIAL | 主キー |
| user_id | INTEGER | ユーザーID（一意） |
| password_hash | VARCHAR(255) | パスワードハッシュ |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### session_tokens テーブル
| カラム | 型 | 説明 |
|-------|-----|------|
| id | SERIAL | 主キー |
| user_id | INTEGER | ユーザーID（外部キー） |
| token | VARCHAR(255) | セッショントークン（一意） |
| expires_at | TIMESTAMP | 有効期限 |
| created_at | TIMESTAMP | 作成日時 |

### login_history テーブル
| カラム | 型 | 説明 |
|-------|-----|------|
| id | SERIAL | 主キー |
| user_id | INTEGER | ユーザーID |
| login_time | TIMESTAMP | ログイン日時 |
| ip_address | VARCHAR(45) | IPアドレス |
| user_agent | TEXT | ユーザーエージェント |
| success | BOOLEAN | 成功/失敗 |

## ビルドと起動

### ビルド
```bash
cd /workspaces/my-ws-demo/src/auth-service
mvn clean package
```

### 起動
```bash
cd /workspaces/my-ws-demo/src/auth-service
java -jar /opt/payara-micro.jar --deploy target/auth-service.war --port 8081
```

## 環境変数

データベース接続は `glassfish-resources.xml` で設定されています:

- Database: `auth_service_db`
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`

## テスト

```bash
mvn test
```

## セキュリティに関する注意事項

### 本番環境での推奨事項

1. **HTTPS の使用**: すべての通信を暗号化
2. **トークンの安全な保管**: クライアント側では HttpOnly Cookie を使用
3. **レート制限**: ログイン試行回数の制限
4. **パスワードポリシー**: 強力なパスワード要件の設定
5. **定期的なトークンクリーンアップ**: 期限切れセッションの削除
6. **監査ログ**: login_history の定期的なレビュー
