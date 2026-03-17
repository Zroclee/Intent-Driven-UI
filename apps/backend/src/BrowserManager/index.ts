import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from 'playwright';

export class PlaywrightManager {
  private static instance: PlaywrightManager;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  private constructor() {}

  public static getInstance(): PlaywrightManager {
    if (!PlaywrightManager.instance) {
      PlaywrightManager.instance = new PlaywrightManager();
    }
    return PlaywrightManager.instance;
  }

  public async getPage(): Promise<Page> {
    if (!this.page || this.page.isClosed()) {
      await this.init();
    }
    if (!this.page) {
      throw new Error('Failed to initialize Playwright page.');
    }
    return this.page;
  }

  public async start() {
    await this.init();
  }

  private async init() {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({
        channel: 'chrome',
        headless: false,
      });

      this.browser.on('disconnected', () => {
        this.browser = null;
        this.context = null;
        this.page = null;
      });
    }

    if (!this.context) {
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      this.context.on('close', () => {
        this.context = null;
        this.page = null;
      });
    }

    if (!this.page || this.page.isClosed()) {
      this.page = await this.context.newPage();

      this.page.on('close', () => {
        this.page = null;
      });
    }
  }

  public async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}

export const playwrightManager = PlaywrightManager.getInstance();
