# W4AP: AI Agent Development & Deployment Guide

This document defines the standard workflow for AI Agents to create, build, and deploy decentralized UI components on the **Web4 Agent Protocol (W4AP)**.

## 🛠 0. 环境配置 (Prerequisites)

运行部署工具前，请先安装依赖：

```bash
npm install
```

并在根目录准备 `.env` 文件：
```env
PRIVATE_KEY=你的钱包私钥
```

---

## 🏗 1. Fully Decentralized Component Design

Components in W4AP are self-contained "widgets" that include their own structure (HTML), styling (CSS), and logic (JS).

### Format: CommonJS (.cjs)
Each component should be a `.cjs` file exporting a `widget` object.

```javascript
const myWidget = {
    metadata: {
        name: 'My Component',
        version: '1.0.0',
        description: 'Description of what this does.'
    },
    html: `<div>Content here</div>`,
    css: `.my-class { color: cyan; }`,
    js: `console.log('Widget loaded');`
};

module.exports = { widget: myWidget };
```

### Discovery Logic
Components are discovered by the [00_layout.cjs](file:///home/mimi/coding/attention/attention1.5.0/project/00_layout.cjs) through Irys GraphQL queries based on tags.

---

## 🛠 2. The Build-Upload-Verify Loop

### Step 1: Build (JSON Compilation)
Convert the `.cjs` module into a structured `.json` object layout that the W4AP frontend can ingest.

```bash
node build.cjs project/my_component.cjs
```
- **Input**: `project/my_component.cjs`
- **Output**: `project/my_component.json`

### Step 2: Upload (Deployment)
Deploy the JSON component to Irys with specific metadata tags.

```bash
# Example for a layout component
node upload.cjs project/my_component.json --type=my_logic --tag=W4AP --version=1.0.0
```
- `--type`: The unique identifier for the module (e.g., `global_scout`, `consensus_feed`).
- `--tag`: The protocol tag (usually `W4AP` for core components, `Web4SNS` for social posts).
- `--version`: Semantic versioning (must match the version expected by the Layout).

### Step 3: Verify (Discovery)
Ensure the component is live and searchable on the decentralized network.

```bash
node query.cjs --W4AP=my_logic --Version=1.0.0
```
- This confirms that your wallet has successfully indexed the component with the correct tags.

---

## 🔄 4. Update Strategy: Hot Reload vs. Versioning

W4AP utilizes Irys's ability to retrieve the *latest* transaction for a specific set of tags. This enables a **Hot Update** mechanism.

### 🟢 Hot Reload (Minor Fixes/UI Tweaks)
- **Action**: Upload with the **SAME version** number.
- **Effect**: The frontend's `loadWidget` query always uses `order: DESC` and `first: 1`, so it will automatically pick up the newest transaction for that version.
- **Benefit**: Instant update without changing the core Layout code.

### 🔴 Version Upgrade (Major Features/Breaking Changes)
- **Action**: Increment the **`--version`** during upload.
- **Effect**: The existing Layout will continue to use the old version until the `APP_VERSION` or `loadWidget` call in [00_layout.cjs](file:///home/mimi/coding/attention/attention1.5.0/project/00_layout.cjs) is explicitly updated.
- **Requirement**: Must redeploy the Layout component to point to the new version.

---

## 🤖 5. AI Agent "Auto-Pilot" Instructions

When you (an AI Agent) are tasked with updating the dashboard:

1. **Assess Change**: 
   - Small fix/style tweak? → **Keep Version**.
   - New feature/Logic change? → **Bump Version**.
2. **Modify**: Edit the `.cjs` file in the `project/` directory.
3. **Build**: `npm run build project/file.cjs`.
4. **Deploy**: `npm run upload project/file.json -- --type=... --version=[STAY_OR_BUMP]`.
5. **Layout Sync (If Bumped)**: Update `APP_VERSION` in `00_layout.cjs` and redeploy the layout.
6. **Verify**: `npm run query -- --W4AP=... --Version=...`

> [!IMPORTANT]
> The W4AP frontend is storage-agnostic. It doesn't care *where* the data is, only that it is *tagged* correctly by a trusted owner.
你更新大版本的时候记得重新检查所有组件的版本号并更新，然后重新转换并上传

---

## 🧐 6. AI 经验总结: 浏览器子代理与本地验证 (Experience Log)

在开发复杂空间交互（如 OpenCoral）时，AI 代理可能会遇到 Irys 网关（uploader.irys.xyz）的访问限制或延迟。以下是提升 UI 稳定性的关键经验：

1. **Localhost 优先原则**：
   - 虽然 Irys 是生产环境，但浏览器子代理对 **`localhost:3000`** 具有更高的访问权限和响应速度。
   - **技巧**：使用 `npx serve` 启动本地服务器，通过浏览器子代理进行实时 UI/交互验证（反馈循环仅需数秒），确认无误后再进行最终的 Irys 部署。

2. **交互监听器封锁 (Pointer Events)**：
   - 复杂层级 UI 常因父级容器的 `pointer-events: none` 导致地图无法拖动。
   - **经验**：在进行任何空间引擎更新后，必须通过子代理运行 `browser_drag_pixel_to_pixel`。如果坐标未发生位移，立即检查 CSS 层级的交互权限。

3. **SUMMON 协议观察**：
   - 动态加载组件（Ritual）可能因网络波动失败。
   - **经验**：在子代理验证中，务必检查 `capture_browser_console_logs`。只有看到 `🔱 Ecosystem Fully Materialized` 后才算验证通过。

> [!TIP]
> **如何做到 localhost 访问？**
> 浏览器子代理被允许访问本地受信任端口（如 3000）。当远端网关被安全侧策略拦截时，**本地镜像服务器** 是 AI 确保代码质量的最后一道（也是最快的一道）防线。

---

## 🔱 7. OpenCoral 深度开发与工程规范 (OpenCoral Standards)

在 OpenCoral 生态系统的修复与迭代中，总结出以下核心方案：

### 1. 代码规范: 原子同步与空间解耦 (Code Standards)
- **原子同步 (Atomic Sync)**: 必须确保 `index.html` 中的 `CONFIG.version` 与所有子组件（Layout, Wallet, Map, Bubble, PostBar）的 `metadata.version` **强一致**。版本不匹配将直接导致 `SUMMON_FAIL`。
- **层级隔离 (CSS Interaction)**: 空间地图应用中最常见的 Bug 是 UI 层拦截了底层的交互。
    - **规范**：父级 UI 容器使用 `pointer-events: none`，仅在具体的交互按钮/滑块上设置 `pointer-events: auto`。
    - **要点**：控制工具栏（如 Timeline Slider）必须拥有极高的 `z-index` (如 5000)，并配合 `!important` 强制保活。
- **空间缺省 (Spatial Default)**: 未携带位置标签的信号必须回退到 **(0, 0) 原点**，而不是散落在不可见区域，以确保用户初次加载时的“发现感”。

### 2. 测试规范: 多维验证清单 (Testing Standards)
- **空间联动验证 (HUD Sync)**: Panning 地图时，必须观察左上角 HUD 的 X/Y 输入框是否实时跳变。
- **信号发现测试 (Eager Discovery)**: 测试“NOW”模式时，应暂时绕过严格的时间戳过滤（Fetch Latest 100），以验证 Graphql 链路是否通畅，排除本地时间不准导致的“空图”假象。
- **总线信号扫描 (Bus Scanning)**: 必须通过控制台验证 `w4ap:timelineShift` 和 `w4ap:homeReset` 等全局事件的派生详情。

### 3. 工程要点总结 (Key Takeaways)
- **SUMMON 依赖管理**：`initializeEcosystem` 中组件的加载顺序至关重要，Layout 通常最后才尝试 Summon `bubble_controller` 以确保地图注入点已就绪。
- **反缓存策略**：在开发阶段，推荐在 `index.html` 的配置加载中使用版本号作为查询参数（例如 `?v=2.2.3`），强制 Irys 或本地浏览器刷新资源。
- **视觉反馈**：所有的异步操作（如 Broadcast）必须伴随 `btn.disabled` 状态管理，防止用户多次触发导致的签名冲突。

. 启动本地服务器 (Server Setup)
首先，我会使用 run_command 工具在你的系统中启动一个轻量级的 Web 服务器（通常使用 npx serve）。 例如，在之前的操作中，我运行了：

bash
npx -y serve -p 3000 /home/mimi/coding/attention/attention/opencoral
这让你的本地代码文件夹可以通过 http://localhost:3000 进行访问。

2. 调用“浏览器子代理” (Browser Subagent)
这是关键的一步。我拥有一个专门处理网页交互的子代理（Subagent）。我会给它下达具体任务，它会通过以下流程工作：

打开 URL：子代理会驱动一个受控的浏览器实例导航到 http://localhost:3000。
深度检查 (Inspect)：它可以使用 browser_get_dom 查看 HTML 结构，或者使用 