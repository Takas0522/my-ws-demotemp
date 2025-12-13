# Frontend Unit Test 実装計画

## 概要
全7ファイル（合計104シナリオ）のユニットテスト実装計画。各ファイルを3-4フェーズに分割し、段階的に実装します。

---

## 1. api.js 実装計画（18シナリオ）

### フェーズ構成
- **Phase 1: 基本認証機能** - TS-API-001～006
  - login正常系（UUID/username）
  - logout正常系・異常系
  - verifyToken基本動作
  
- **Phase 2: インターセプター** - TS-API-007～012
  - リクエストインターセプター（トークン付与）
  - レスポンスインターセプター（401ハンドリング）
  - リダイレクトロジック
  
- **Phase 3: ユーザーサービス** - TS-API-013～018
  - getAccount正常系・異常系
  - getUser正常系・バリデーション（UUID検証）
  - エラーハンドリング

### モック戦略
- **axios**: `jest.mock('axios')` でモジュール全体をモック
- **localStorage**: `jest.spyOn(Storage.prototype, 'getItem/setItem/removeItem')`
- **window.location**: `Object.defineProperty(window, 'location', { writable: true })`

### リスク
- **401リダイレクトの競合**: テスト間で`window.location.href`が汚染される → `beforeEach`で初期化
- **インターセプター副作用**: グローバルaxiosインスタンスを使用 → テストごとにモックリセット

---

## 2. LoginView.vue 実装計画（20シナリオ）

### フェーズ構成
- **Phase 1: 基本UI表示** - TS-LOGIN-001～005
  - コンポーネントマウント
  - フォーム要素の存在確認
  - 初期状態の検証
  
- **Phase 2: ログイン正常系** - TS-LOGIN-006～010
  - UUID入力でログイン成功
  - username入力でログイン成功
  - localStorage保存確認
  - /accountへルーティング
  
- **Phase 3: エラーハンドリング** - TS-LOGIN-011～015
  - API 401エラー表示
  - API 500エラー表示
  - ネットワークエラー
  - バリデーションエラー
  
- **Phase 4: ローディング・状態遷移** - TS-LOGIN-016～020
  - ローディング表示・非表示
  - ボタン無効化制御
  - エラーメッセージクリア
  - 連続クリック防止

### モック戦略
- **authService**: `jest.mock('../services/api')` でモジュールモック
- **Vue Router**: `createRouter`でモックルーター作成、`push`をスパイ
- **localStorage**: `jest.spyOn(Storage.prototype, 'setItem')`

### リスク
- **router.push非同期**: `await wrapper.vm.$nextTick()` + `setTimeout`で待機
- **DOM更新タイミング**: データ変更後に`flushPromises`使用

---

## 3. pointService.js (pointApi.js) 実装計画（9シナリオ）

### フェーズ構成
- **Phase 1: getPoints機能** - TS-POINT-SVC-001～003
  - getPoints正常系
  - エラーレスポンス処理
  - 空データ処理
  
- **Phase 2: getPointHistory機能** - TS-POINT-SVC-004～007
  - デフォルトパラメータ（page=1, limit=10）
  - カスタムパラメータ
  - ページネーション境界値
  
- **Phase 3: エラーハンドリング** - TS-POINT-SVC-008～009
  - 401認証エラー
  - ネットワークエラー

### モック戦略
- **apiClient**: `jest.mock('./api.js', () => ({ apiClient: { get: jest.fn() } }))`
- **axios応答**: `mockResolvedValue({ data: {...} })`でレスポンス制御

### リスク
- **相対インポート**: `apiClient`のモックがテスト間で汚染される → `jest.clearAllMocks()`

---

## 4. AccountView.vue 実装計画（11シナリオ）

### フェーズ構成
- **Phase 1: データ表示正常系** - TS-ACCOUNT-001～004
  - アカウント情報表示（user.id, fullName, email）
  - ポイント残高表示
  - data-testid要素の存在確認
  
- **Phase 2: エラー・ローディング** - TS-ACCOUNT-005～008
  - ローディング表示
  - APIエラー表示
  - 空データ処理
  
- **Phase 3: ナビゲーション・ログアウト** - TS-ACCOUNT-009～011
  - /pointsへのルーティング
  - ログアウト処理
  - formatDate関数の動作確認

### モック戦略
- **userService**: `jest.mock('../services/api')`
- **Vue Router**: `createRouter`でモック、`stubs: ['router-link']`

### リスク
- **日付フォーマット**: 無効な日付で`isNaN(date.getTime())`チェック必須
- **ローディング状態**: Promise pendingを維持するため`new Promise(() => {})`

---

## 5. PointBalanceView.vue (PointView.vue) 実装計画（12シナリオ）

### フェーズ構成
- **Phase 1: 基本表示** - TS-BALANCE-001～004
  - ポイント残高表示
  - toLocaleString()のフォーマット確認
  - lastUpdated表示
  
- **Phase 2: エラー・ローディング** - TS-BALANCE-005～008
  - ローディングスピナー
  - APIエラー表示
  - 残高0の表示
  
- **Phase 3: ナビゲーション** - TS-BALANCE-009～012
  - /points/historyへルーティング
  - /accountへ戻るボタン
  - ログアウト処理
  - formatLastUpdated関数

### モック戦略
- **pointApi**: `jest.mock('../services/pointApi')`
- **authService**: `jest.mock('../services/api')`

### リスク
- **複数APIコール**: `onMounted`で複数API呼び出しがある場合の待機順序

---

## 6. PointHistoryView.vue 実装計画（19シナリオ）

### フェーズ構成
- **Phase 1: 履歴リスト表示** - TS-HISTORY-001～006
  - 履歴データ表示（type, description, amount）
  - 獲得/使用の色分け（bg-green/bg-red）
  - 日付フォーマット
  
- **Phase 2: ページネーション** - TS-HISTORY-007～012
  - 次ページボタン動作
  - 前ページボタン動作
  - ページ境界値（最初/最後のページ）
  - totalPages計算
  
- **Phase 3: 空データ・エラー** - TS-HISTORY-013～017
  - 履歴0件表示
  - APIエラー表示
  - ローディング表示
  
- **Phase 4: ナビゲーション** - TS-HISTORY-018～019
  - /pointsへ戻る
  - ログアウト処理

### モック戦略
- **pointApi**: `getPointHistory`のモックで`page`パラメータを検証
- **ページネーション状態**: `currentPage`をテストごとにリセット

### リスク
- **ページネーション境界値**: `currentPage > totalPages`や`currentPage < 1`の制御
- **動的クラス**: `:class`バインディングのテストで`classes()`メソッド使用

---

## 7. router.js 実装計画（15シナリオ）

### フェーズ構成
- **Phase 1: ルート定義** - TS-ROUTER-001～005
  - 各ルート（/login, /account, /points, /points/history）の存在確認
  - リダイレクト（/ → /login）
  - meta.requiresAuth設定
  
- **Phase 2: ナビゲーションガード（認証あり）** - TS-ROUTER-006～010
  - トークン存在時の保護ルートアクセス許可
  - /loginへのアクセス（トークンあり）
  - next()呼び出し確認
  
- **Phase 3: ナビゲーションガード（認証なし）** - TS-ROUTER-011～015
  - トークン不在時の/loginリダイレクト
  - 保護ルートへのアクセス拒否
  - localStorage未設定のエッジケース

### モック戦略
- **localStorage**: `jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null/token)`
- **router.beforeEach**: テスト用ルーターインスタンスで`beforeEach`動作を検証
- **next関数**: `const next = jest.fn()` でコールバック検証

### リスク
- **beforeEach実行順序**: グローバルガードがテスト間で干渉 → テストごとにルーター再生成
- **createWebHistory**: テスト環境では`createMemoryHistory()`使用を検討

---

## 共通モック戦略サマリ

| 対象 | 手法 | 適用ファイル |
|------|------|-------------|
| axios | `jest.mock('axios')` | api.js |
| authService | `jest.mock('../services/api')` | LoginView, AccountView, PointView, PointHistoryView |
| pointApi | `jest.mock('../services/pointApi')` | PointView, PointHistoryView |
| localStorage | `jest.spyOn(Storage.prototype, 'getItem/setItem/removeItem')` | 全ファイル |
| Vue Router | `createRouter`モック + `stubs: ['router-link']` | 全Vueコンポーネント |
| window.location | `Object.defineProperty(window, 'location', { writable: true })` | api.js |

---

## 全体実装スケジュール

### Week 1
- api.js Phase 1-3 完了
- LoginView.vue Phase 1-2 完了

### Week 2
- LoginView.vue Phase 3-4 完了
- pointService.js Phase 1-3 完了
- AccountView.vue Phase 1 完了

### Week 3
- AccountView.vue Phase 2-3 完了
- PointBalanceView.vue Phase 1-2 完了
- PointHistoryView.vue Phase 1 完了

### Week 4
- PointHistoryView.vue Phase 2-4 完了
- router.js Phase 1-3 完了
- カバレッジ確認・リファクタリング

---

## カバレッジ目標

| ファイル | ステートメント | 分岐 | 関数 |
|---------|--------------|------|------|
| api.js | 85% | 80% | 90% |
| LoginView.vue | 80% | 75% | 85% |
| pointService.js | 90% | 85% | 95% |
| AccountView.vue | 80% | 70% | 85% |
| PointView.vue | 80% | 70% | 85% |
| PointHistoryView.vue | 75% | 65% | 80% |
| router.js | 90% | 85% | 100% |

---

## リスク総括と対策

### 高リスク項目
1. **非同期処理の競合**
   - 対策: `jest.useFakeTimers()` + `jest.runAllTimers()`
   - 対策: `flushPromises` ユーティリティの使用

2. **ローディング状態のテスト**
   - 対策: Promise pending維持パターン `new Promise(() => {})`
   - 対策: 短い待機時間（10-50ms）の調整

3. **Vue Router モックの副作用**
   - 対策: 各テストで新しいルーターインスタンス生成
   - 対策: `router.isReady()`で初期化完了を待機

4. **localStorage の汚染**
   - 対策: `beforeEach(() => localStorage.clear())`を徹底
   - 対策: `jest-localstorage-mock`の導入検討

### 中リスク項目
5. **日付フォーマットの不整合**
   - 対策: 固定日付でのテスト（`jest.setSystemTime()`）
   - 対策: 無効な日付の明示的なハンドリング

6. **data-testid の不足**
   - 対策: 実装フェーズでdata-testid追加のPR作成
   - 対策: セレクター優先順位（testid > role > text）

---

## 前提条件

- Jest v28+ + jest-environment-jsdom
- @vue/test-utils v2 (Vue 3対応)
- `testEnvironmentOptions.url: 'http://localhost'` 設定済み
- `develop-standard/develop-standard/frontend-testing.md` ベストプラクティス準拠

---

## 成果物

各フェーズ完了時：
1. テストファイル（*.spec.js）
2. カバレッジレポート（coverage/lcov-report/index.html）
3. 実装メモ（問題点・解決策）
4. 次フェーズへの引き継ぎ事項

---

## 参考資料

- [Frontend_UnitTest.md](../`develop-standard/develop-standard/frontend-testing.md`)
- [Vue Test Utils v2 Docs](https://test-utils.vuejs.org/)
- [Jest Docs](https://jestjs.io/)

---

**作成日**: 2025-12-13  
**最終更新**: 2025-12-13
