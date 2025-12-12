import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PointsPage } from '../pages/PointsPage';

// PointsPageインスタンスを保持
let pointsPage: PointsPage;

// 各シナリオの前にPointsPageインスタンスをリセット
Before(function () {
  pointsPage = null as any;
});

// ページ要素の表示確認
Then('現在のポイント残高が表示される', async function () {
  pointsPage = new PointsPage(this.page);
  const isVisible = await pointsPage.現在のポイント残高表示確認();
  expect(isVisible).toBeTruthy();
});

Then('最終更新日時が表示される', async function () {
  pointsPage = new PointsPage(this.page);
  const isVisible = await pointsPage.最終更新日時表示確認();
  expect(isVisible).toBeTruthy();
});

Then('ポイント履歴ボタンが表示される', async function () {
  pointsPage = new PointsPage(this.page);
  const isVisible = await pointsPage.ポイント履歴ボタン表示確認();
  expect(isVisible).toBeTruthy();
});

Then('戻るボタンが表示される', async function () {
  pointsPage = new PointsPage(this.page);
  const isVisible = await pointsPage.戻るボタン表示確認();
  expect(isVisible).toBeTruthy();
});

// ポイント履歴ページへの遷移
When('ポイント履歴ボタンをクリックする', async function () {
  pointsPage = new PointsPage(this.page);
  await pointsPage.ポイント履歴ボタンクリック();
});

Then('ポイント履歴ページにリダイレクトされる', async function () {
  console.log('=== Checking redirect to point history page ===');
  console.log(`Current URL: ${this.page.url()}`);
  
  // ポイント履歴ページ特有の要素が表示されるまで待つ
  await this.page.locator('h1:has-text("ポイント履歴")').waitFor({ 
    state: 'visible', 
    timeout: 10000 
  });
  
  const currentUrl = this.page.url();
  // '/point-history' または '/points/history' のどちらかを許容
  const isPointHistoryPage = currentUrl.includes('/point-history') || currentUrl.includes('/points/history');
  expect(isPointHistoryPage).toBeTruthy();
  console.log('✓ Successfully redirected to point history page');
});

// 戻る機能（アカウントページへのリダイレクトは login.steps.ts で定義されているものを使用）
When('戻るボタンをクリックする', async function () {
  pointsPage = new PointsPage(this.page);
  await pointsPage.戻るボタンクリック();
});

When('アカウントボタンをクリックする', async function () {
  pointsPage = new PointsPage(this.page);
  await pointsPage.アカウントボタンクリック();
});

// localStorageの操作
When('ポイントページに直接アクセスする', async function () {
  pointsPage = new PointsPage(this.page);
  await pointsPage.ポイントページへ移動();
  console.log('✓ Navigated directly to /points');
});
