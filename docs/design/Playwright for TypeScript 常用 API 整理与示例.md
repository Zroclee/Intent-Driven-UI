# Playwright for TypeScript 常用 API 整理与示例

## 📋 环境安装

```bash
npm install @playwright/test  # 推荐使用@playwright/test框架
# 或安装测试库
npm install -D playwright
npx playwright install
```

---

## 一、浏览器启动与上下文管理

### 1. `chromium.launch()` / `firefox.launch()` / `webkit.launch()`

```typescript
import { chromium, firefox, webkit } from 'playwright';

const browser = await chromium.launch({
  headless: false,       // 是否隐藏浏览器窗口
  args: ['--no-sandbox'] // 可选启动参数
});

// Chrome/Chromium专用选项
await browser.launch({
  executablePath: './chromium-browser',
  channel: 'chrome'      // 使用系统Chrome版本
});
```

### 2. `browserContext.newPage()` / `browser.newPage()`

```typescript
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0',
  extraHTTPHeaders: {
    'Accept-Language': 'zh-CN,zh;q=0.9'
  }
});

// 带认证的上下文
const authenticated = await context.newPage({
  storageState: './storage.json' // 登录态持久化
});

await authenticated.goto('https://example.com');
```

### 3. `context.tracing.start()` - 轨迹追踪

```typescript
await browser.context().tracing.start({
  screenshots: true,       // 记录截图
  snapshots: true,         // 记录元素快照
  sources: ['**/*.js']     // 记录资源
});

// 停止并保存
await browser.context().tracing.stop({ path: 'trace.zip' });
```

---

## 二、页面导航与加载控制

### 4. `page.goto()` - 导航到URL

```typescript
// 基础用法
await page.goto('https://example.com', {
  timeout: 30000,         // 30秒超时
  waitUntil: 'domcontentloaded' // 加载状态：domcontentloaded / load / networkidle
});

// 带重试的导航（自定义）
const response = await page.goto('https://example.com', {
  retry: 2                // 失败重试次数
});
```

### 5. `page.reload()` - 刷新页面

```typescript
await page.reload({
  waitUntil: 'domcontentloaded'
});

// 带清除缓存的刷新
await page.goto('https://example.com', { waitUntil: 'networkidle' });
```

### 6. `page.goBack()` / `goForward()` - 历史记录

```typescript
await page.goBack();
await page.forward();
```

---

## 三、元素定位与操作（核心API）

### 7. `locator` - 定位器创建

```typescript
// CSS选择器
const element = page.locator('div.container');

// XPath选择器
const product = page.locator('//span[text()="Product"]');

// 文本内容
const btn = page.getByText('登录');
const roleBtn = page.getByRole('button', { name: '提交' });

// 标签匹配
const input = page.getByLabel('邮箱地址');

// DOM属性选择器
const checkbox = page.getByTestId('agree-checkbox');

// 获取所有定位的集合
const allInputs = page.locator('input').all();
```

### 8. `locator.click()` - 点击元素

```typescript
await page.locator('.btn-primary').click();

// 等待可点击状态
await page.locator('#submit-btn').click({ timeout: 10000 });

// 多次点击（如确认弹窗）
await element.click().click();
```

### 9. `locator.fill()` / `.type()` - 文本输入

```typescript
// 直接填充
await page.locator('input[name="email"]').fill('test@example.com');

// 逐字输入（模拟打字）
await page.type('input[name="password"]', 'mypassword123', {
  delay: 50              // 每字符延迟ms
});

// 清除+填充
await page.locator('textarea').click();
await page.evaluate('() => document.activeElement?.value = ""');
await page.type('textarea', 'Hello World');

// 键盘快捷键
await page.keyboard.press('Ctrl+A');      // Ctrl+A
await page.keyboard.press('Delete');
await page.type('input', '新文本');
```

### 10. `locator.check()` / `uncheck()` - 复选框/单选框

```typescript
// 勾选复选框
await page.locator('input[type="checkbox"]').check();

// 取消勾选
await page.locator('input[type="checkbox"]').uncheck();

// 获取选中状态
const isChecked = await page.locator('input[type="checkbox"]').isChecked();
console.log(isChecked); // true|false
```

### 11. `locator.select_option()` - 下拉框选择

```typescript
await page.locator('select').selectOption({ value: 'option2' });
await page.locator('select').selectOption('选项三');
await page.locator('select').selectOption({ label: '选项3' });

// 获取所有选项
const options = await page.locator('select.select-box').optionAll();
console.log(options.map(o => o.textContent));

// 多选下拉框
await page.locator('select[multiple]').selectOptions(['选项1', '选项2']);
```

### 12. `locator.press()` - 按键按下/释放

```typescript
// 直接按键
await page.keyboard.press('Enter');

// 组合键
await page.keyboard.down('Shift');
await page.keyboard.press('Tab');
await page.keyboard.up('Shift');

// 发送多个快捷键
await page.keyboard.type('Hello', { delay: 50 });
await page.keyboard.press('Backspace', { count: 3 });
```

### 13. `locator.hover()` - 悬停元素

```typescript
// 悬停并等待下拉菜单
await page.locator('.dropdown').hover();
await page.waitForTimeout(200); // 或 wait_for_selector()
await page.getByText('Options').click();

// 悬停多个元素
for (const item of items) {
  await item.hover();
}
```

---

## 四、页面内容操作

### 14. `page.screenshot()` - 截图

```typescript
// 基本截图
await page.locator('.container').screenshot({ path: 'element.png' });

// 完整页面截图
await page.screenshot({
  fullPage: true,        // 包含滚动内容
  type: 'png',
  encoding: 'base64'     // 返回Base64编码图片
});

// 带裁剪的截图
await page.screenshot({
  clip: { x: 0, y: 0, width: 800, height: 600 },
  type: 'jpeg',
  quality: 85            // JPEG质量 (0-1)
});

// 返回图片数据
const buffer = await page.screenshot(); // Buffer类型
```

### 15. `page.evaluate()` - JS执行

```typescript
// 全局范围
const windowWidth = await page.evaluate('window.innerWidth');
console.log(windowWidth);

// 特定元素范围（作用域）
const elementWidth = await page.locator('.item').evaluate(
  (el: HTMLElement) => el.getBoundingClientRect().width
);

// 数组映射操作
const items = await page.locator('.item').all();
const widths = await page.evaluateAll((els) => els.map(el => el.offsetWidth), items);

// DOM查询示例
await page.evaluate(() => {
  document.body.innerHTML = '<div class="result">Hello</div>';
});

// 返回元素属性
const styles = await page.locator('.btn').evaluate(
  (el: HTMLElement) => getComputedStyle(el).getPropertyValue('color')
);
```

### 16. `page.textContent()` / `.innerText()` - 文本提取

```typescript
// 所有文本内容
const allText = await page.locator('.content').textContent();
console.log(allText);

// HTML字符串
const html = await page.locator('.card').innerHTML();
console.log(html);

// 只读取可见文本
await page.click('.read-more');
await page.waitForTimeout(1000);
const visibleText = await page.textContent('.result');
```

---

## 五、断言与等待

### 17. `expect()` - 断言API

```typescript
import { expect } from '@playwright/test';

// 元素存在性
await expect(page.locator('button')).toBeVisible();

// 状态检查
await expect(page).toHaveURL('https://example.com/dashboard');

// 文本包含
await expect(page.getByText('Hello', { exact: false }))
  .toContainText('Welcome to Playwright');

// 不存在的元素
await expect(page.locator('.error')).not.toBeVisible();

// 等待特定条件
await expect(page.locator('#loader')).toBeHidden({ timeout: 5000 });

// 异步断言（自动重试）
await expect(() => page.click('.result')).resolves;

// 组合断言
await expect(page).toHaveTitle('示例网站', { timeout: 2000 });
```

### 18. `locator.waitFor()` / `.waitForElementState()`

```typescript
// 等待元素可见
await page.locator('.content').isVisible();

// 等待元素不可见
await page.locator('.spinner').isHidden();

// 等待DOM变更
await page.waitForSelector('div.new');

// 等待网络请求完成
await page.goto('/api/data', { waitUntil: 'networkidle' });
```

### 19. `page.waitForTimeout()` / `sleep()` - 延迟

```typescript
// 标准延迟（不推荐用于测试）
await page.waitForTimeout(1000); // 1秒

// 或使用async/await的延迟函数
await new Promise(r => setTimeout(r, 1000));

// 滚动到元素并等待
await page.locator('.main').scrollIntoViewIfNeeded();
```

---

## 六、文件上传下载

### 20. `page.setInputFiles()` / `.set_input_files()`

```typescript
// 基础上传
await page.locator('input[type="file"]').setInputFiles(['./test.pdf']);

// 带等待的上传
await page.locator('input[type="file"]').setInputFiles([
  './report.xlsx',
  './data.csv'
], { timeout: 60000 });

// 上传多文件
await page.locator('input[type="file"]').setInputFiles(
  ['./file1.pdf', './file2.pdf']
);
```

---

## 七、网络请求拦截与监控

### 21. `page.route()` - 路由拦截

```typescript
// 单个路由拦截
await page.route('**/api/login', async route => {
  await route.fulfill({ status: 200, json: { success: true } });
});

// 基于请求条件的拦截
await page.route('**/*', route => {
  if (route.request().method() === 'POST') {
    console.log(`POST request to ${route.request().url()}`);
  }
});

// 阻止特定资源
await page.route('**/ads/**', async route => {
  await route.abort(); // 阻塞请求
});

// 修改响应内容
await page.route('**/api/data', async route => {
  const response = await route.fetch();
  return response.clone().redirect({ url: 'https://redirect.com' });
});
```

### 22. `page.on()` - 事件监听

```typescript
// 监听响应事件
page.on('response', response => {
  console.log(response.url(), response.status());
});

// 监听请求错误
page.on('requestfailed', request => {
  console.error(`Failed: ${request.url()}`);
});

// 导航完成事件
page.on('load', page => {
  console.log('页面加载完成');
});
```

### 23. `page.expect_response()` - 响应等待

```typescript
await page.goto('/api/data');

await page.waitForResponse(
  (response: Response) => response.status() === 200,
  { timeout: 10000 }
);

// 带条件的响应等待
const data = await page.waitForResponse(
  async (response) => {
    const json = await response.json();
    return json.success === true;
  },
  { timeout: 5000 }
);
```

---

## 八、键盘与鼠标操作

### 24. `page.keyboard.type()` - 类型操作

```typescript
// 基础类型
await page.keyboard.type('Hello World');

// 延迟+特殊字符
await page.keyboard.type('Shift+A', { delay: 50 });
await page.keyboard.type('"', { normalizeTab: false });

// 组合键模拟
await page.keyboard.down('Control').type('a', { delay: 10 });
await page.keyboard.up('Control');
```

### 25. `page.mouse.move()` / `.click()` - 鼠标操作

```typescript
// 移动鼠标到位置
await page.mouse.move(100, 50);

// 点击任意位置
await page.mouse.click(100, 50);

// 拖拽操作（需先移动再释放）
await page.locator('.drag-handle').dblclick();
```

### 26. `page.touchscreen.tap()` - 触摸操作（移动端）

```typescript
await page.locator('.touch-element').tap();
await page.mouse.down().move(10, 10).up(); // 手势模拟
```

---

## 九、异步编程模式（@playwright/test）

### 27. `test()` 测试框架使用

```typescript
import { test, expect } from '@playwright/test';

// 基础测试文件结构
test.describe('登录流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('可以成功登录', async ({ page }) => {
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'secret123');
    await page.click('.login-button');
    
    await expect(page.getByText('欢迎')).toBeVisible();
  });

  test('登录失败时显示错误信息', async ({ page }) => {
    await page.fill('#email', '');
    await page.fill('#password', 'wrong');
    await page.click('.login-button');
    
    await expect(page.getByText('密码错误')).toBeVisible();
  });
});

// 测试配置文件（playwright.config.ts）
```

### 28. 测试配置（playwright.config.ts）

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,     // 默认超时30秒
  expect: {
    timeout: 5000         // 断言超时
  },
  use: {
    baseURL: 'https://example.com',
    actionTimeout: 10000, // 操作超时
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
  ],
});
```

---

## 十、常用组合示例（完整测试脚本）

### 29. 完整E2E测试案例模板

```typescript
import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('用户注册流程', () => {
  let page: Page;
  
  test.beforeEach(async ({ context }) => {
    const localStorage = await context.storageState();
    const data = { ...localStorage };
  });

  test('完成新用户注册', async ({ page }) => {
    // 1. 导航到注册页面
    await page.goto('/signup');
    await expect(page.getByText('欢迎')).not.toBeVisible();

    // 2. 填写表单信息
    await page.fill('[name="fullname"]', '张三');
    await page.fill('[name="email"]', 'zhangsan@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirm"]', 'SecurePass123!');

    // 3. 同意条款并点击提交
    await page.locator('.agreement-checkbox').check();
    await page.click('button[type="submit"]');

    // 4. 等待加载完成
    await page.waitForSelector('.success-message', { timeout: 10000 });

    // 5. 验证成功消息
    await expect(page.getByText('注册成功')).toBeVisible();
    await expect(page.locator('[data-redirect]').href).toBe('/dashboard');

    // 6. 截图保存
    await page.screenshot({ 
      path: 'test-result.png',
      fullPage: true 
    });

    // 7. 停止测试并清理
    await context.unrouteAll();
  });

  test('邮箱格式验证失败', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[name="email"]', 'invalid-email@@@com');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('无效邮箱')).toBeVisible();
  });

  test('密码强度校验', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[name="password"]', 'weak123');
    await expect(page.getByText('密码至少需要8位')).toContainText('密码');
    
    await page.fill('[name="confirm"]', 'SecurePass123!');
    await expect(page.locator('.error-messages')).toContainText('密码强度不足');
  });
});

// 测试前清理文件（如配置文件生成）
test.afterAll(async () => {
  // 清理操作
  fs.unlinkSync('./temp-data.json');
});
```

---

## 十一、调试与排错技巧

### 30. `page.pause()` / `.screenshot()` - 暂停调试

```typescript
// 断点（自动等待事件）
await page.goto('https://example.com');
await page.waitForSelector('.login-form');
await page.pause(); // 按ESC键继续
```

### 31. `browser.trace().start()` - 追踪记录

```typescript
const trace = await browser.tracing.start({
  screenshots: true,
  snapshots: true
});

// 页面加载后停止追踪
await page.waitForLoadState('networkidle');
await browser.tracing.stop({ path: 'trace.zip' });

// 播放追踪
await browser.tracing.play(); // trace目录下的zip文件
```

### 32. 错误处理示例

```typescript
import { retry } from '@playwright/test';

test.describe.configure({ retries: 2 });

test('带重试的请求', async ({ page }) => {
  await expect.poll(async () => {
    const status = await page.goto('/api/health').status();
    return status === 200 ? 'OK' : 'FAIL';
  }, { timeout: 15000 });
});

try {
  await page.click('.broken-btn');
} catch (error) {
  console.error(`点击失败: ${error.message}`);
  throw error; // 重新抛出（触发重试）
}
```

---

## 十二、TypeScript类型支持表

| API | 类型定义 | 示例返回类型 |
|------|----------|--------------|
| `page.goto()` | `goto(url: string, options?: GotoOptions)` | Promise<Response> |
| `page.locator()` | `locator(selector: string)` | Locator<T> |
| `locator.click()` | `click(options?: ClickOptions)` | Promise<void> |
| `page.screenshot()` | `screenshot(options?: ScreenshotOptions)` | Promise<string \| Buffer> |
| `page.fill()` / `.fill()` | `fill(value: string, options?)` | Promise<void> |
| `expect()` | `expect(locator).toBeVisible()` | Promise<void> |
| `locator.evaluate()` | `evaluate<R>(fn, data)` | Promise<R> |

---

## 十三、常用工具函数

```typescript
// 获取页面标题
const title = await page.title();

// 获取URL
const currentURL = page.url();

// 获取视口尺寸
const size = page.viewportSize();

// 等待任意网络活动停止
await page.waitForLoadState('networkidle');

// 滚动到页面底部
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
});
```

---

## 十四、运行测试命令

```bash
# 单文件测试
npx playwright test tests/user.spec.ts

# 所有测试
npx playwright test

# 指定项目（浏览器）
npx playwright test --project=chromium

# 并行执行
npx playwright test --workers=2

# 调试模式
npx playwright test --debug

# 生成报告
npx playwright show-report

# 更新依赖
npx playwright install-deps
```

---

## 十五、最佳实践总结

### ✅ 推荐做法：
1. **使用定位器而非直接查询元素** - `locator`更简洁且支持断言
2. **设置合理的超时时间** - `timeout: 30000`（默认值可调整）
3. **使用测试框架** - `@playwright/test`提供类型支持和重试机制
4. **避免硬编码的延迟** - 用等待条件替代`waitForTimeout()`
5. **启用追踪** - `trace()`帮助调试复杂流程

### ❌ 不推荐：
- 直接操作DOM（如使用`document.querySelector`）
- 在测试中使用固定的`setTimeout()`或`await new Promise(r => setTimeout(...))`
- 硬编码的断言值（使用数据选择器更灵活）

---

如需特定场景的详细示例（如API测试、跨页面导航、文件操作等），欢迎继续提问！ 🚀