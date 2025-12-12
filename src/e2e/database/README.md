# E2Eテスト用データベースSeedデータ

このディレクトリには、E2Eテスト専用のSeedデータが格納されています。

## 概要

E2Eテストでは、TestContainersによって自動的に起動されるPostgreSQLコンテナに対して、このディレクトリ内のSeedデータが投入されます。これにより、開発環境のデータベースを汚染することなく、一貫したテストデータでE2Eテストを実行できます。

## ファイル構成

```
database/
├── README.md                      # このファイル
├── user-service-seed.sql         # User Service用テストデータ
├── auth-service-seed.sql         # Auth Service用テストデータ
└── point-service-seed.sql        # Point Service用テストデータ
```

## Seedデータの使用方法

### 自動投入

`src/e2e/setup/database.ts` の `TestDatabase` クラスが、テスト実行時に自動的にこれらのSeedデータを投入します。

現在の実装では、各サービスのディレクトリ（`src/{service-name}/database/seed.sql`）にあるSeedデータを使用していますが、このディレクトリのSeedデータを使用するようにカスタマイズすることができます。

### カスタマイズ方法

`src/e2e/setup/database.ts` の `initializeDatabase` メソッドを以下のように変更することで、E2E専用のSeedデータを使用できます：

```typescript
private async initializeDatabase(serviceName: string, client: Client): Promise<void> {
  // スキーマは各サービスのディレクトリから読み込み
  const schemaPath = path.join(__dirname, '../../', serviceName, 'database/schema.sql');
  
  // SeedデータはE2E専用のものを使用
  const seedPath = path.join(__dirname, '../database', `${serviceName}-seed.sql`);

  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const cleanedSchema = schemaSql.replace(/\\c\s+\w+;/g, '');
    await client.query(cleanedSchema);
    console.log(`  ✓ Schema loaded for ${serviceName}`);
  }

  if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    const cleanedSeed = seedSql.replace(/\\c\s+\w+;/g, '');
    await client.query(cleanedSeed);
    console.log(`  ✓ E2E Seed data loaded for ${serviceName}`);
  }
}
```

## テストデータ概要

### 共通テストユーザー（5名）

すべてのサービスで同じUUIDを使用して5名のテストユーザーが登録されています。

| ユーザー名 | UUID | メール | 氏名 | パスワード | ポイント |
|-----------|------|--------|------|-----------|---------|
| tanaka_taro | 05c66ceb-6ddc-4ada-b736-08702615ff48 | tanaka.taro@example.com | 田中太郎 | password123 | 1500 |
| suzuki_hanako | 4f4777e4-dd9c-4d5b-a928-19a59b1d3ead | suzuki.hanako@example.com | 鈴木花子 | password123 | 3200 |
| yamada_jiro | 7bd6e35b-9c8e-4635-a47d-f7adce5c8ed9 | yamada.jiro@example.com | 山田次郎 | password123 | 500 |
| sato_yuki | 233c99d5-41ba-42f3-89fa-eb34644fe3b5 | sato.yuki@example.com | 佐藤優希 | password123 | 2100 |
| takahashi_mai | 8a17f2c2-c1c8-4fee-ae95-8a483127bf1f | takahashi.mai@example.com | 高橋舞 | password123 | 750 |

**パスワード**: すべてのユーザーのパスワードは `password123` で、BCryptでハッシュ化されています。

**ハッシュ値**: `$2a$10$OSuuVFLoafV6AKzzptdQSeGXQIqx0rU53gtZvYwZ07Des/5txWC6q`

### User Service Seedデータ

- **ユーザー数**: 5名
- **作成日**: 現在日時から60～180日前（ユーザーごとに異なる）

### Auth Service Seedデータ

- **認証情報**: 5件（全ユーザー分）
- **ログイン履歴**: 5件（各ユーザー1件ずつの成功履歴）
- **セッショントークン**: なし（E2Eテストでは実際のJWTトークンを使用）

### Point Service Seedデータ

- **ポイント残高**: 5件（全ユーザー分）
- **ポイント履歴**: 11件（各ユーザー2～3件）

#### ポイント履歴の詳細

**tanaka_taro (1500ポイント)**
- 新規登録ボーナス: 1000ポイント
- 購入特典: 500ポイント

**suzuki_hanako (3200ポイント)** - 使用履歴あり
- 新規登録ボーナス: 2000ポイント
- キャンペーン特典: 1500ポイント
- 商品購入（使用）: -300ポイント

**yamada_jiro (500ポイント)**
- 新規登録ボーナス: 500ポイント

**sato_yuki (2100ポイント)**
- 新規登録ボーナス: 2000ポイント
- レビュー投稿: 100ポイント

**takahashi_mai (750ポイント)** - 使用履歴あり
- 新規登録ボーナス: 1000ポイント
- 商品購入（使用）: -250ポイント

## テストデータの特徴

1. **一貫性**: 各サービス間でUUIDが一致し、データの整合性が保証されています
2. **多様性**: EARNとUSEの両タイプのポイント取引を含んでいます
3. **有効期限**: ポイントには有効期限が設定されており、実際の運用に近いデータです
4. **シンプル**: テストに必要最低限のデータのみを含み、テストの可読性を向上させます

## 注意事項

- このSeedデータは**E2Eテスト専用**です
- 開発環境やproduction環境では使用しないでください
- テストシナリオを追加する場合は、必要に応じてこのSeedデータも更新してください
- データベースは各テストシナリオの前にリセットされるため、テスト間でのデータ汚染は発生しません
