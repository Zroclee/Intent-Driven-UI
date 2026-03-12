// 测试入口文件
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from 'playwright';

/**
 * 启动浏览器并访问指定页面
 * @param url 目标URL
 */
export async function launchBrowserAndVisit(
  url: string,
): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  // 1. 启动浏览器
  const browser = await chromium.launch({
    channel: 'chrome', // 使用Microsoft Edge浏览器
    headless: false, // 默认为有头模式，方便调试
  });

  // 2. 创建上下文
  const context = await browser.newContext();

  // 3. 创建新页面
  const page = await context.newPage();

  // 4. 访问指定URL
  await page.goto(url);

  return { browser, context, page };
}

/**
 * 访问用户页面并点击新增按钮填入表单并新增
 */
export async function addUser() {
  // 1. 启动浏览器
  const browser = await chromium.launch({
    channel: 'chrome', // 使用Microsoft Edge浏览器
    headless: false, // 默认为有头模式，方便调试
  });

  // 2. 创建上下文
  const context = await browser.newContext();

  // 3. 创建新页面
  const page = await context.newPage();

  // 4. 访问指定URL
  await page.goto('http://localhost:5173/product/users', {
    waitUntil: 'domcontentloaded',
  });

  await page.waitForTimeout(500);
  // 点击新增按钮
  await page.getByRole('button', { name: '新增' }).click();

  // 等待弹窗出现
  await page.waitForTimeout(1000);
  //   await page.waitForSelector('form');

  // 填写用户名
  //   await page.getByLabel("用户名").fill("testuser");
  await page.locator("input[name='form-username']").fill('李照鹏');
  await page.waitForTimeout(500);

  // 填写组织机构
  await page.locator("select[name='form-organization']").selectOption('市场部');
  await page.waitForTimeout(500);

  // 填写角色
  await page.locator("select[name='form-role']").selectOption('普通用户');
  await page.waitForTimeout(500);

  // 点击提交按钮
  await page.getByRole('button', { name: '确认' }).click();

  await page.waitForTimeout(10000);
  await page.close();
}
