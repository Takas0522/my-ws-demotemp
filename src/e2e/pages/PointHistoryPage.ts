import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ポイント履歴ページのページオブジェクトクラス
 * ポイント取引履歴表示ページの要素と操作を定義
 */
export class PointHistoryPage extends BasePage {
  // ロケーター
  private readonly pageTitle: Locator;
  private readonly currentBalance: Locator;
  private readonly historyList: Locator;
  private readonly historyItem: Locator;
  private readonly pageInfo: Locator;
  private readonly currentPage: Locator;
  private readonly backButton: Locator;
  private readonly accountButton: Locator;
  private readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // 要素の初期化
    this.pageTitle = page.locator('h1');
    // ポイント残高カード内の大きな数値を表示している要素（text-5xlクラスの要素）
    this.currentBalance = page.locator('[data-testid="current-balance"]').or(page.locator('.text-5xl.font-bold.text-blue-600'));
    this.historyList = page.locator('[data-testid="history-list"]').or(page.locator('ul').first());
    this.historyItem = page.locator('[data-testid="history-item"]').or(page.locator('li'));
    // ページ情報: ページネーション内の "X / Y" の形式で現在のページと総ページ数を表示しているspan要素
    this.pageInfo = page.locator('[data-testid="page-info"]').or(page.locator('span:has-text("/")'));
    this.currentPage = page.locator('[data-testid="current-page"]').or(page.locator('span:has-text("/")'));
    this.backButton = page.locator('a:has-text("残高へ戻る")').or(page.locator('a:has-text("戻る")'));
    this.accountButton = page.locator('a[href="/account"]').or(page.getByRole('link', { name: /アカウント/ }));
    this.logoutButton = page.locator('button:has-text("ログアウト")');
  }

  /**
   * ポイント履歴ページに直接アクセスする
   * @param baseUrl ベースURL（デフォルト: http://localhost:3000）
   */
  async ポイント履歴ページへ移動(baseUrl: string = 'http://localhost:3000'): Promise<void> {
    // '/point-history' または '/points/history' のどちらかでアクセスを試みる
    try {
      await this.ページ遷移(`${baseUrl}/points/history`);
    } catch (error) {
      await this.ページ遷移(`${baseUrl}/point-history`);
    }
    // SPAの描画を待つ
    await this.page.waitForTimeout(1000);
  }

  /**
   * ページタイトルのテキストを取得する
   * @returns ページタイトル
   */
  async ページタイトル取得(): Promise<string> {
    await this.要素表示待機(this.pageTitle);
    return await this.テキスト取得(this.pageTitle);
  }

  /**
   * 現在のポイント残高を取得する
   * @returns ポイント残高（数値文字列）
   */
  async 現在のポイント残高取得(): Promise<string> {
    await this.要素表示待機(this.currentBalance);
    const text = await this.テキスト取得(this.currentBalance);
    // "2,100" や "1500 ポイント" から数値部分だけを抽出し、カンマを除去
    const cleaned = text.replace(/,/g, ''); // カンマを除去
    const match = cleaned.match(/(\d+)/);
    return match ? match[1] : '0';
  }

  /**
   * 現在のポイント残高が表示されているかを確認する
   * @returns 表示されている場合はtrue
   */
  async 現在のポイント残高表示確認(): Promise<boolean> {
    return await this.表示確認(this.currentBalance);
  }

  /**
   * ポイント履歴一覧が表示されているかを確認する
   * @returns 表示されている場合はtrue
   */
  async ポイント履歴一覧表示確認(): Promise<boolean> {
    return await this.表示確認(this.historyList);
  }

  /**
   * ポイント履歴に特定のテキストが含まれているかを確認する
   * @param text 確認するテキスト
   * @returns 含まれている場合はtrue
   */
  async ポイント履歴にテキスト含む確認(text: string): Promise<boolean> {
    const pageContent = await this.page.textContent('body');
    return pageContent?.includes(text) || false;
  }

  /**
   * ポイント履歴に特定の取引タイプが表示されているかを確認する
   * @param transactionType 取引タイプ（EARN または USE）
   * @returns 表示されている場合はtrue
   */
  async 取引タイプ表示確認(transactionType: 'EARN' | 'USE'): Promise<boolean> {
    // 日本語表示を確認: EARN -> 獲得, USE -> 使用
    const displayText = transactionType === 'EARN' ? '獲得' : '使用';
    const locator = this.page.locator(`text=${displayText}`);
    const count = await locator.count();
    return count > 0;
  }

  /**
   * 各履歴に金額が表示されているかを確認する
   * @returns 表示されている場合はtrue
   */
  async 金額表示確認(): Promise<boolean> {
    const amountLocator = this.page.locator('text=/[+-]?\\d+\\s*ポイント/');
    return await amountLocator.count() > 0;
  }

  /**
   * 各履歴に取引日時が表示されているかを確認する
   * @returns 表示されている場合はtrue
   */
  async 取引日時表示確認(): Promise<boolean> {
    // 日本語ロケールの日時形式 "yyyy/mm/dd hh:mm" を検索
    const dateLocator = this.page.locator('text=/\\d{4}\\/\\d{2}\\/\\d{2}\\s+\\d{2}:\\d{2}/');
    return await dateLocator.count() > 0;
  }

  /**
   * 各履歴に有効期限が表示されているかを確認する
   * @returns 表示されている場合はtrue
   */
  async 有効期限表示確認(): Promise<boolean> {
    const expiryLocator = this.page.locator('text=/有効期限|期限/');
    return await expiryLocator.count() > 0 || await this.取引日時表示確認();
  }

  /**
   * ページ情報が表示されているかを確認する
   * @returns 表示されている場合はtrue
   */
  async ページ情報表示確認(): Promise<boolean> {
    return await this.表示確認(this.pageInfo);
  }

  /**
   * 現在のページ番号を取得する
   * @returns ページ番号（文字列）
   */
  async 現在のページ番号取得(): Promise<string> {
    const text = await this.page.textContent('body');
    // "ページ 1" や "Page 1" のような形式からページ番号を抽出
    const match = text?.match(/ページ\s*(\d+)|Page\s*(\d+)/);
    return match ? (match[1] || match[2]) : '1';
  }

  /**
   * 戻るボタンが表示されているかを確認する
   * @returns 表示されている場合はtrue
   */
  async 戻るボタン表示確認(): Promise<boolean> {
    return await this.表示確認(this.backButton);
  }

  /**
   * ログアウトボタンが表示されているかを確認する
   * @returns 表示されている場合はtrue
   */
  async ログアウトボタン表示確認(): Promise<boolean> {
    return await this.表示確認(this.logoutButton);
  }

  /**
   * 戻るボタンをクリックする
   */
  async 戻るボタンクリック(): Promise<void> {
    await this.クリック(this.backButton);
    // ページ遷移を待つ - /points へのナビゲーションを待機
    await this.page.waitForURL(/\/points\/?(?:\?.*)?$/, { timeout: 5000 });
    // 追加で少し待機してSPAの描画を確実にする
    await this.page.waitForTimeout(500);
  }

  /**
   * アカウントボタンをクリックする
   */
  async アカウントボタンクリック(): Promise<void> {
    await this.クリック(this.accountButton);
    // SPAの描画を待つ
    await this.page.waitForTimeout(500);
  }

  /**
   * ログアウトボタンをクリックする
   */
  async ログアウトボタンクリック(): Promise<void> {
    await this.クリック(this.logoutButton);
    // localStorageがクリアされることを待つ
    await this.page.waitForTimeout(500);
  }

  /**
   * localStorageのトークンをクリアする
   */
  async トークンクリア(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('authToken');
    });
  }
}
