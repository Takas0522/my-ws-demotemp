import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PointHistoryPage } from '../pages/PointHistoryPage';

// PointHistoryPageインスタンスを保持
let pointHistoryPage: PointHistoryPage;

// 各シナリオの前にPointHistoryPageインスタンスをリセット
Before(function () {
  pointHistoryPage = null as any;
});

// ページ要素の表示確認
Then('ポイント履歴一覧が表示される', async function () {
  
    pointHistoryPage = new PointHistoryPage(this.page);
  
  const isVisible = await pointHistoryPage.ポイント履歴一覧表示確認();
  expect(isVisible).toBeTruthy();
});

// ポイント履歴の内容確認
Then('ポイント履歴に {string} が含まれている', async function (text: string) {
  
    pointHistoryPage = new PointHistoryPage(this.page);
  
  const hasText = await pointHistoryPage.ポイント履歴にテキスト含む確認(text);
  expect(hasText).toBeTruthy();
});

// ポイント履歴の取引タイプ表示
Then('ポイント履歴に {string} タイプの取引が表示される', async function (transactionType: 'EARN' | 'USE') {
  
    pointHistoryPage = new PointHistoryPage(this.page);
  
  const isVisible = await pointHistoryPage.取引タイプ表示確認(transactionType);
  expect(isVisible).toBeTruthy();
});

// ポイント残高の表示確認
Then('現在のポイント残高が {string} と表示される', async function (expectedPoints: string) {
  
    pointHistoryPage = new PointHistoryPage(this.page);
  
  const actualPoints = await pointHistoryPage.現在のポイント残高取得();
  expect(actualPoints).toBe(expectedPoints);
});

Then('各履歴に金額が表示される', async function () {
  
    pointHistoryPage = new PointHistoryPage(this.page);
  
  const isVisible = await pointHistoryPage.金額表示確認();
  expect(isVisible).toBeTruthy();
});

Then('各履歴に取引日時が表示される', async function () {
  
    pointHistoryPage = new PointHistoryPage(this.page);
  
  const isVisible = await pointHistoryPage.取引日時表示確認();
  expect(isVisible).toBeTruthy();
});

Then('各履歴に有効期限が表示される', async function () {
  
    pointHistoryPage = new PointHistoryPage(this.page);
  
  const isVisible = await pointHistoryPage.有効期限表示確認();
  expect(isVisible).toBeTruthy();
});

// ページネーション機能の確認
Then('ページ情報が表示される', async function () {
  
    pointHistoryPage = new PointHistoryPage(this.page);
  
  const isVisible = await pointHistoryPage.ページ情報表示確認();
  expect(isVisible).toBeTruthy();
});

Then('現在のページが {string} と表示される', async function (expectedPage: string) {
  
    pointHistoryPage = new PointHistoryPage(this.page);
  
  const actualPage = await pointHistoryPage.現在のページ番号取得();
  expect(actualPage).toBe(expectedPage);
});

// localStorageの操作
When('ポイント履歴ページに直接アクセスする', async function () {
  
    pointHistoryPage = new PointHistoryPage(this.page);
  
  await pointHistoryPage.ポイント履歴ページへ移動();
  console.log('✓ Navigated directly to /point-history');
});
