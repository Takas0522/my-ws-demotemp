# Frontend Unit Test ドキュメント

## 概要

本ドキュメントでは、Frontendアプリケーションのユニットテストに関する情報、実行方法、既知の問題、ベストプラクティスについて記載します。

## テストフレームワーク

- **テストランナー**: Jest v28+
- **Vueコンポーネントテスト**: @vue/test-utils v2（Vue 3対応）
- **カバレッジツール**: Jest内蔵のカバレッジ機能
- **テスト環境**: jsdom（`jest-environment-jsdom`）

> **注意**: Jest v28以降では `jest-environment-jsdom` が同梱されていないため、明示的にインストールする必要があります。

## テスト構造

```
src/frontend/
├── src/
│   ├── views/              # Vueコンポーネント
│   │   ├── AccountView.vue
│   │   ├── AccountView.spec.js
│   │   ├── PointView.vue
│   │   ├── PointView.spec.js
│   │   ├── PointHistoryView.vue
│   │   └── PointHistoryView.spec.js
│   └── services/           # サービス層
│       ├── api.js
│       ├── api.spec.js
│       ├── pointApi.js
│       └── pointApi.spec.js
└── jest.config.js          # Jest設定ファイル
```

## テスト実行方法

### 全てのテストを実行

```bash
cd src/frontend
npm run test
```

### 特定のテストファイルのみ実行

```bash
npm test -- AccountView.spec.js
```

### テストカバレッジを確認

```bash
npm run test:coverage
```

カバレッジレポートは `coverage/` ディレクトリに生成されます。

### watchモードで実行

```bash
npm test -- --watch
```

## テストのベストプラクティス

### 1. コンポーネントのマウント

Vueコンポーネントをテストする際は、以下のパターンを使用します：

```javascript
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';

const wrapper = mount(ComponentName, {
  global: {
    plugins: [createRouter({ history: createWebHistory(), routes: [] })],
    mocks: {
      $router: mockRouter
    },
    stubs: ['router-link']
  }
});
```

### 2. 非同期処理の待機

APIコールなどの非同期処理が完了するまで適切に待機します：

```javascript
// データロード後のDOM更新を待機
await wrapper.vm.$nextTick();
await new Promise(resolve => setTimeout(resolve, 10));

// アサーション
expect(wrapper.find('[data-testid="user-id"]').text()).toBe('123');
```

### 3. ローディング状態のテスト

ローディング状態をテストする場合は、APIモックを永続的にペンディング状態にします：

```javascript
it('renders loading state initially', async () => {
  // APIコールが完了しないようにモック
  mockApi.getData.mockImplementation(() => new Promise(() => {}));
  
  // コンポーネントを再マウント
  wrapper.unmount();
  wrapper = mount(Component, { /* ... */ });
  
  await wrapper.vm.$nextTick();
  
  expect(wrapper.find('.animate-spin').exists()).toBe(true);
});
```

### 4. data-testid属性の使用

テストで要素を特定する際は、`data-testid`属性を使用することを推奨します：

```vue
<!-- コンポーネント内 -->
<p data-testid="user-id">{{ accountData.user.id }}</p>
```

```javascript
// テスト内
expect(wrapper.find('[data-testid="user-id"]').text()).toBe('123');
```

### 5. LocalStorage を扱うテスト

LocalStorageを使用するテストでは、適切なモック戦略を採用する必要があります。詳細は後述の「LocalStorage テストリファレンス」セクションを参照してください。

基本的な3つのアプローチ：

**A. ライブラリで丸ごとモック（推奨）**
```javascript
// jest-localstorage-mock を使用
beforeEach(() => localStorage.clear());

it('値の保存・取得ができること', () => {
  localStorage.setItem('key', 'value');
  expect(localStorage.getItem('key')).toBe('value');
});
```

**B. 必要メソッドだけ部分モック**
```javascript
const spyGet = jest.spyOn(Storage.prototype, 'getItem')
                   .mockReturnValue(JSON.stringify({ foo: 'bar' }));
expect(spyGet).toHaveBeenCalledWith('my-key');
```

**C. 自前モック**
```javascript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

### 6. 日付のフォーマット

日付のフォーマット関数は、無効な日付に対して適切に処理する必要があります：

```javascript
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return ''  // または適切なデフォルト値
  }
  return date.toLocaleString('ja-JP', { /* ... */ })
}
```

## テストカバレッジ目標

- **全体カバレッジ**: 80%以上
- **重要なビジネスロジック**: 95%以上
- **UIコンポーネント**: 70%以上

## トラブルシューティング

### テストが間欠的に失敗する

非同期処理の待機時間を調整してください：

```javascript
// 短い待機時間（10ms）で失敗する場合
await new Promise(resolve => setTimeout(resolve, 50));
```

### "Cannot call text on an empty DOMWrapper"エラー

要素が存在しない、またはDOM更新が完了していません：

```javascript
// データロード後に十分な待機時間を確保
await wrapper.vm.$nextTick();
await new Promise(resolve => setTimeout(resolve, 10));

// 要素の存在を確認
expect(wrapper.find('[data-testid="user-id"]').exists()).toBe(true);
```

### "No match found for location with path"警告

Vue Routerの警告は無視しても問題ありません。テストでは空のルート設定を使用しているためです。

---

## LocalStorage テストリファレンス

### 概要

**対象**: Vue 3（`@vue/test-utils v2`）+ Jest v28 以降  
**ポイント**: Jest v28+ では **`jest-environment-jsdom` が同梱されていない**ため、明示的に導入して `testEnvironment: 'jsdom'` を設定します。また **opaque origin** を避けるため `testEnvironmentOptions.url` を指定するのが安全です（例: `http://localhost`）。

**参考リンク**:
- [Stack Overflow: Jest 28+のjsdom同梱廃止・`testEnvironmentOptions.url` 設定](https://stackoverflow.com/questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests)
- [Qiita: `Storage.prototype` のスパイ、`jsdom` での opaque origin 対策](https://qiita.com/sho_fcafe/items/4ca3dfafa0d11d80cab9)

### 依存パッケージのインストール

```bash
# Vue 3 + Jest + VTU（TypeScript併用例）
npm i -D jest @vue/test-utils @vue/vue3-jest jest-environment-jsdom \
       ts-jest typescript

# LocalStorage を簡単にモックしたい場合（任意）
npm i -D jest-localstorage-mock
```

**パッケージ説明**:
- Vue 3 の `.vue` 変換には **`@vue/vue3-jest`** を使用  
  [参考: Vue 3 + Jest セットアップ（Qiita）](https://qiita.com/mkthrkw/items/d129ed334d77f99b28d2)  
  [参考: Vue Test Utils v2 Docs](https://test-utils.vuejs.org/guide/)
- **`jest-localstorage-mock`** は LocalStorage/SessionStorage を "まるごと" モックする代表的ライブラリ  
  [参考: npm](https://www.npmjs.com/package/jest-localstorage-mock) / [GitHub](https://github.com/clarkbw/jest-localstorage-mock)

### Jest設定例（`jest.config.js`）

```javascript
// jest.config.js
module.exports = {
  // ✅ Jest v28+ は jsdom を明示
  testEnvironment: 'jsdom',
  // ✅ opaque origin を避けるため URL 指定（LocalStorage 利用時の SecurityError 対策）
  testEnvironmentOptions: { url: 'http://localhost' },

  // Vue / TS 変換
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(js|ts)$': ['ts-jest', { isolatedModules: true }],
  },

  moduleFileExtensions: ['vue', 'js', 'ts', 'json'],

  // （任意）カバレッジなど
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{js,ts,vue}', '!src/main.ts', '!src/router/**'],
};
```

**重要ポイント**:
- `testEnvironmentOptions.url` の指定は **LocalStorage の SecurityError（opaque origin）** を回避するのに有効  
  [参考: Stack Overflow](https://stackoverflow.com/questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests)  
  [参考: Qiita](https://qiita.com/sho_fcafe/items/4ca3dfafa0d11d80cab9)

### LocalStorage の扱い方 — 3つのアプローチ

#### A. ライブラリで丸ごとモック（`jest-localstorage-mock`）

**設定（例：`package.json`）**
```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "testEnvironmentOptions": { "url": "http://localhost" },
    "setupFilesAfterEnv": ["jest-localstorage-mock"]
  }
}
```

**テスト例（毎テストでクリーンアップ）**
```javascript
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('LocalStorage (jest-localstorage-mock)', () => {
  beforeEach(() => localStorage.clear());

  it('値の保存・取得ができること', () => {
    localStorage.setItem('key', 'value');
    expect(localStorage.getItem('key')).toBe('value');
    expect(Object.keys(localStorage.__STORE__).length).toBe(1); // ライブラリの補助プロパティ
  });
});
```

**メリット**: 手軽・テストごとにクリーンなストレージ／メソッドごとの呼び出し検証が容易。  
[参考: npm](https://www.npmjs.com/package/jest-localstorage-mock) / [GitHub](https://github.com/clarkbw/jest-localstorage-mock)

#### B. 必要メソッドだけ部分モック（`Storage.prototype` に対して `jest.spyOn`）

```javascript
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent - LocalStorage を部分モック', () => {
  beforeEach(() => localStorage.clear());

  it('初期化時に getItem を呼び出す', () => {
    const spyGet = jest.spyOn(Storage.prototype, 'getItem')
                       .mockReturnValue(JSON.stringify({ foo: 'bar' }));

    mount(MyComponent);
    expect(spyGet).toHaveBeenCalledWith('my-key');
  });

  it('保存操作で setItem が期待引数で呼ばれる', async () => {
    const spySet = jest.spyOn(Storage.prototype, 'setItem');
    const wrapper = mount(MyComponent);

    await wrapper.find('button.save').trigger('click');
    expect(spySet).toHaveBeenCalledWith('my-key', expect.any(String));
  });
});
```

**コツ**: `window.localStorage.getItem` を直接スパイするのではなく、**`Storage.prototype` を対象**にする。  
[参考: Mock化パターン（Qiita）](https://qiita.com/masuyama_rex/items/2048d26a575c577d7ab1)  
[参考: トラブルシュート（Qiita）](https://qiita.com/sho_fcafe/items/4ca3dfafa0d11d80cab9)

#### C. 自前モック（`Object.defineProperty(window, 'localStorage', ...)`）

```javascript
// tests/setup/localstorage-mock.ts
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

```json
{
  "jest": {
    "setupFiles": ["<rootDir>/tests/setup/localstorage-mock.ts"],
    "testEnvironment": "jsdom",
    "testEnvironmentOptions": { "url": "http://localhost" }
  }
}
```

**メリット**: 実装を完全にコントロール可能。**デメリット**: メンテナンス負荷が高い。  
[参考: Rob Marshall Blog](https://robertmarshall.dev/blog/how-to-mock-local-storage-in-jest-tests/)  
[参考: Zenn（自前モック例）](https://zenn.dev/keigo_hirohara/articles/de70c904ef0fb5)

### Vue コンポーネント例 + テスト（LocalStorage 読み書き）

#### コンポーネント例（Composition API）

```vue
<!-- src/components/MyComponent.vue -->
<template>
  <div>
    <input v-model="text" data-testid="text" />
    <button class="save" @click="save">保存</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const KEY = 'my-key';
const text = ref('');

onMounted(() => {
  const v = localStorage.getItem(KEY);
  if (v) {
    try { text.value = JSON.parse(v); } catch { text.value = v; }
  }
});

function save() {
  localStorage.setItem(KEY, JSON.stringify(text.value));
}
</script>
```

#### テスト（`Storage.prototype` を部分モック）

```javascript
// tests/unit/MyComponent.spec.js
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent.vue', () => {
  beforeEach(() => localStorage.clear());

  it('初期表示で LocalStorage から値を読み込む', () => {
    jest.spyOn(Storage.prototype, 'getItem')
        .mockReturnValue(JSON.stringify('初期値'));

    const wrapper = mount(MyComponent);
    expect(wrapper.get('[data-testid="text"]').element.value).toBe('初期値');
  });

  it('保存ボタンで setItem が正しく呼ばれる', async () => {
    const spySet = jest.spyOn(Storage.prototype, 'setItem');

    const wrapper = mount(MyComponent);
    await wrapper.get('[data-testid="text"]').setValue('保存する値');
    await wrapper.find('button.save').trigger('click');

    expect(spySet).toHaveBeenCalledWith('my-key', JSON.stringify('保存する値'));
  });
});
```

**注意点**:
- Vue 3 のテストは **`@vue/test-utils v2`** を使用  
  [参考: VTU v2 Docs](https://test-utils.vuejs.org/guide/)
- `.vue` の変換は **`@vue/vue3-jest`**、TS は **`ts-jest`**  
  [参考: Vue 3 + Jest 構築（Qiita）](https://qiita.com/mkthrkw/items/d129ed334d77f99b28d2)

### よくあるエラー & ベストプラクティス

#### ❌ localStorage is not defined
→ `testEnvironment` を `'jsdom'` に、かつ `jest-environment-jsdom` を dev 依存に追加

#### ❌ SecurityError: localStorage is not available for opaque origins
→ `testEnvironmentOptions.url` を `'http://localhost'` 等に設定

#### ❌ TypeError: jest.spyOn(...).mockImplementation is not a function
→ `window.localStorage` ではなく `Storage.prototype` をスパイ対象にする

#### ベストプラクティス

- **テスト間の汚染防止**: `beforeEach(() => localStorage.clear())` を徹底  
  [参考: Rob Marshall Blog](https://robertmarshall.dev/blog/how-to-mock-local-storage-in-jest-tests/)
- **部分モックの基本**: `jest.spyOn(Storage.prototype, 'getItem' | 'setItem')` を使い、引数・回数を検証  
  [参考: Mock化パターン（Qiita）](https://qiita.com/masuyama_rex/items/2048d26a575c577d7ab1)  
  [参考: React例だが Jest 流儀（Qiita）](https://qiita.com/w-tdon/items/d8fa7b983746e8a8b3d3)
- **Jest v28+ 前提設定**: `jest-environment-jsdom` の明示導入と `testEnvironmentOptions.url` が安定動作の鍵  
  [参考: Stack Overflow](https://stackoverflow.com/questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests)  
  [参考: Qiita](https://qiita.com/sho_fcafe/items/4ca3dfafa0d11d80cab9)

### 補足：Vuex/Pinia と LocalStorage の併用

Vuex/Pinia と LocalStorage を併用する場合も、基本は同じです。アクションやコンポーザブルが LocalStorage を呼ぶ箇所を `Storage.prototype` スパイで検証し、非同期は `flushPromises`（`@vue/test-utils`）で待機してからアサート。

[参考: VTU v2 Docs](https://test-utils.vuejs.org/guide/)

---

## 今後の改善予定

- [ ] ログアウトテストのモック問題を解決
- [ ] E2Eテストとの統合
- [ ] スナップショットテストの導入検討
- [ ] テストカバレッジの向上
- [ ] CI/CDパイプラインへの統合

## 更新履歴

| 日付 | 内容 | 担当者 |
|------|------|--------|
| 2025-12-13 | LocalStorage テストリファレンスセクションを追加、Jest v28+対応を明記 | - |
| 2025-12-13 | 初版作成、Vue Routerモック問題を文書化 | - |

## 参考資料

### 公式ドキュメント
- [Jest公式ドキュメント](https://jestjs.io/)
- [Vue Test Utils v2公式ドキュメント](https://test-utils.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)
- [Testing Vue Router](https://test-utils.vuejs.org/guide/advanced/vue-router.html)

### LocalStorage テスト関連
- [Vue 3 + Jest セットアップ（Qiita）](https://qiita.com/mkthrkw/items/d129ed334d77f99b28d2)
- [Jest v28+ と LocalStorage（Stack Overflow）](https://stackoverflow.com/questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests)
- [LocalStorage のトラブルシュート（Qiita）](https://qiita.com/sho_fcafe/items/4ca3dfafa0d11d80cab9)
- [jest-localstorage-mock（npm）](https://www.npmjs.com/package/jest-localstorage-mock)
- [jest-localstorage-mock（GitHub）](https://github.com/clarkbw/jest-localstorage-mock)
- [部分モック（Storage.prototype のスパイ例：Qiita）](https://qiita.com/masuyama_rex/items/2048d26a575c577d7ab1)
- [Jest でのLocalStorageモック（Qiita）](https://qiita.com/w-tdon/items/d8fa7b983746e8a8b3d3)
- [自前モック（Object.defineProperty 例：Blog）](https://robertmarshall.dev/blog/how-to-mock-local-storage-in-jest-tests/)
- [自前モック（Zenn）](https://zenn.dev/keigo_hirohara/articles/de70c904ef0fb5)
