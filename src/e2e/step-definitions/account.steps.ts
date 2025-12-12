import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AccountPage } from '../pages/AccountPage';

// AccountPageインスタンスを保持
let accountPage: AccountPage;

// 各シナリオの前にAccountPageインスタンスをリセット
Before(function () {
  accountPage = null as any;
});

// 前提: アカウントページにリダイレクトされる（login.steps.tsですでに定義されているため、ここでは使用しない）
// 注: ページタイトルの表示確認も login.steps.ts で定義されているものを使用

// ページ要素の表示確認
Then('ユーザー名が表示される', async function () {
  accountPage = new AccountPage(this.page);
  
  const isVisible = await accountPage.ユーザー名表示確認();
  expect(isVisible).toBeTruthy();
});

Then('メールアドレスが表示される', async function () {
  accountPage = new AccountPage(this.page);
  const isVisible = await accountPage.メールアドレス表示確認();
  expect(isVisible).toBeTruthy();
});

Then('ポイント残高が表示される', async function () {
  accountPage = new AccountPage(this.page);
  const isVisible = await accountPage.ポイント残高表示確認();
  expect(isVisible).toBeTruthy();
});

Then('ポイント詳細ボタンが表示される', async function () {
  accountPage = new AccountPage(this.page);
  const isVisible = await accountPage.ポイント詳細ボタン表示確認();
  expect(isVisible).toBeTruthy();
});

Then('ログアウトボタンが表示される', async function () {
  accountPage = new AccountPage(this.page);
  const isVisible = await accountPage.ログアウトボタン表示確認();
  expect(isVisible).toBeTruthy();
});

// 正しい値の表示確認
Then('ユーザー名が {string} と表示される', async function (expectedName: string) {
  accountPage = new AccountPage(this.page);
  const actualName = await accountPage.ユーザー名取得();
  expect(actualName).toBe(expectedName);
});

Then('メールアドレスが {string} と表示される', async function (expectedEmail: string) {
  accountPage = new AccountPage(this.page);
  const actualEmail = await accountPage.メールアドレス取得();
  expect(actualEmail).toBe(expectedEmail);
});

Then('ユーザーIDが {string} と表示される', async function (expectedUserId: string) {
  accountPage = new AccountPage(this.page);
  const actualUserId = await accountPage.ユーザーID取得();
  expect(actualUserId).toBe(expectedUserId);
});

Then('ポイント残高が {string} と表示される', async function (expectedPoints: string) {
  accountPage = new AccountPage(this.page);
  const actualPoints = await accountPage.ポイント残高取得();
  expect(actualPoints).toBe(expectedPoints);
});

// ポイント詳細ページへの遷移
When('ポイント詳細ボタンをクリックする', async function () {
  accountPage = new AccountPage(this.page);
  await accountPage.ポイント詳細ボタンクリック();
});

Then('ポイントページにリダイレクトされる', async function () {
  console.log('=== Checking redirect to /points ===');
  console.log(`Current URL: ${this.page.url()}`);
  
  // ポイントページ特有の要素が表示されるまで待つ
  await this.page.locator('h1:has-text("ポイント")').waitFor({ 
    state: 'visible', 
    timeout: 10000 
  });
  
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/points');
  console.log('✓ Successfully redirected to /points');
});

// ログアウト機能
When('ログアウトボタンをクリックする', async function () {
  accountPage = new AccountPage(this.page);
  await accountPage.ログアウトボタンクリック();
});

Then('ログインページにリダイレクトされる', async function () {
  console.log('=== Checking redirect to login page ===');
  console.log(`Current URL: ${this.page.url()}`);
  
  // ログインページ特有の要素が表示されるまで待つ
  await this.page.locator('#userId').waitFor({ 
    state: 'visible', 
    timeout: 10000 
  });
  
  const currentUrl = this.page.url();
  // '/' または '/login' へのリダイレクトを許容
  const isLoginPage = currentUrl.endsWith('/') || currentUrl.includes('/login');
  expect(isLoginPage).toBeTruthy();
  console.log('✓ Successfully redirected to login page');
});

Then('localStorageにトークンが保存されていない', async function () {
  accountPage = new AccountPage(this.page);
  const hasToken = await accountPage.トークン存在確認();
  expect(hasToken).toBeFalsy();
});

// localStorageの操作
When('localStorageのトークンをクリアする', async function () {
  accountPage = new AccountPage(this.page);
  await accountPage.トークンクリア();
  console.log('✓ LocalStorage token cleared');
});

When('アカウントページに直接アクセスする', async function () {
  accountPage = new AccountPage(this.page);
  await accountPage.アカウントページへ移動();
  console.log('✓ Navigated directly to /account');
});
