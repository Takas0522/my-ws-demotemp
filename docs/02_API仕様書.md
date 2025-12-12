# API仕様書

## BFF（Backend For Frontend）API

**ベースURL**: `http://localhost:8090/api`

### 認証エンドポイント

#### POST /api/login
ユーザーログイン

**リクエストボディ**:
```json
{
  "userId": "05c66ceb-6ddc-4ada-b736-08702615ff48",  // またはusername
  "username": "tanaka_taro",                        // またはuserId
  "password": "password123"
}
```

**レスポンス** (成功):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "05c66ceb-6ddc-4ada-b736-08702615ff48",
  "username": "tanaka_taro",
  "expiresAt": "2024-01-08T00:00:00"
}
```

#### POST /api/logout
ログアウト

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "message": "Logged out successfully"
}
```

#### GET /api/verify
トークンの検証

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "valid": true,
  "userId": "05c66ceb-6ddc-4ada-b736-08702615ff48",
  "username": "tanaka_taro"
}
```

---

### ユーザー情報エンドポイント

#### GET /api/account
ログイン中のユーザーアカウント情報取得（ユーザー情報 + ポイント）

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "user": {
    "id": "05c66ceb-6ddc-4ada-b736-08702615ff48",
    "username": "tanaka_taro",
    "email": "tanaka.taro@example.com",
    "fullName": "田中太郎",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  },
  "points": {
    "userId": "05c66ceb-6ddc-4ada-b736-08702615ff48",
    "balance": 1500,
    "lastUpdated": "2024-01-01T00:00:00"
  }
}
```

#### GET /api/users
全ユーザー取得

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

**レスポンス**:
```json
[
  {
    "id": "05c66ceb-6ddc-4ada-b736-08702615ff48",
    "username": "tanaka_taro",
    "email": "tanaka.taro@example.com",
    "fullName": "田中太郎",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
]
```

#### GET /api/users/{id}
特定ユーザー情報取得

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "id": "05c66ceb-6ddc-4ada-b736-08702615ff48",
  "username": "tanaka_taro",
  "email": "tanaka.taro@example.com",
  "fullName": "田中太郎",
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00"
}
```

---

### ポイントエンドポイント

#### GET /api/points
ログイン中のユーザーのポイント残高取得

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "userId": "05c66ceb-6ddc-4ada-b736-08702615ff48",
  "balance": 1500,
  "lastUpdated": "2024-01-01T00:00:00"
}
```

#### GET /api/points/history
ログイン中のユーザーのポイント履歴取得（ページネーション対応）

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

**クエリパラメータ**:
- `page` (デフォルト: 1): ページ番号
- `limit` (デフォルト: 10, 最大: 100): 1ページあたりの件数

**レスポンス**:
```json
{
  "histories": [
    {
      "id": 1,
      "userId": "05c66ceb-6ddc-4ada-b736-08702615ff48",
      "amount": 500,
      "transactionType": "EARN",
      "description": "購入特典",
      "createdAt": "2024-01-01T00:00:00",
      "expiresAt": "2024-07-01T00:00:00",
      "balanceAfterTransaction": 1500
    },
    {
      "id": 2,
      "userId": "05c66ceb-6ddc-4ada-b736-08702615ff48",
      "amount": 1000,
      "transactionType": "EARN",
      "description": "新規登録ボーナス",
      "createdAt": "2023-12-01T00:00:00",
      "expiresAt": "2024-06-01T00:00:00",
      "balanceAfterTransaction": 1000
    }
  ],
  "currentBalance": 1500,
  "page": 1,
  "limit": 10,
  "total": 2
}
```

---

## User Service API（内部API）

**ベースURL**: `http://localhost:8080/api`

### GET /users
全ユーザー取得

### GET /users/{id}
ユーザー情報取得

### GET /users/username/{username}
ユーザー名でユーザー情報取得

### GET /users/{id}/account
ユーザーアカウント情報取得（ユーザー + ポイント）

### POST /users
ユーザー作成

**リクエストボディ**:
```json
{
  "username": "test_user",
  "email": "test@example.com",
  "fullName": "テストユーザー"
}
```

### PUT /users/{id}
ユーザー更新

### DELETE /users/{id}
ユーザー削除

---

## Auth Service API（内部API）

**ベースURL**: `http://localhost:8081/auth`

### POST /auth/login
ログイン

### POST /auth/verify
トークン検証

### POST /auth/logout
ログアウト

---

## Point Service API（内部API）

**ベースURL**: `http://localhost:8082/point-service/api`

### GET /points
ポイント残高取得（JWTトークンからuserIdを取得）

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

### GET /points/history
ポイント履歴取得（ページネーション対応）

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

**クエリパラメータ**:
- `page`: ページ番号
- `limit`: 1ページあたりの件数

---

## エラーレスポンス

すべてのAPIで共通のエラーレスポンス形式を使用します。

```json
{
  "error": "エラーメッセージ"
}
```

### ステータスコード

- `200 OK`: 成功
- `201 Created`: 作成成功
- `400 Bad Request`: リクエストが不正
- `401 Unauthorized`: 認証エラー
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーエラー
- `503 Service Unavailable`: サービス利用不可（バックエンドサービス停止時など）
