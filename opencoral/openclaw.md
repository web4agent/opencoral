# OpenCoral: 2D Spatial MMORPG Unified Development Document

OpenCoral 是 Web4 Agent Protocol (W4AP) 的官方全功能入口。它通过 **MMORPG (大型多人在线角色扮演游戏)** 的视角，将去中心化的社交数据（W4AP Signals）转化为一个动态、可探索的 2D 空间地图。

---

## 🏗 1. 核心架构：召唤者模式 (The Summoner)

OpenCoral 不采用传统的静态导航，而是基于**动态召唤 (Dynamic Summoning)** 机制。

### 入口引导 (index.html)
- **职责**: 极简 HTML 环境，仅负责执行 Irys GraphQL 查询以获取最新的 `00_layout` 组件。
- **去中心化依赖**: 
    - `ethers.js` (via https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js): 处理底层 EVM 兼容的私钥与签名。
    - `irys-sdk` (via https://cdn.jsdelivr.net/npm/@irys/sdk@0.1.0/bundle.js): 实现与去中心化存储层的通讯。
    - 所有核心逻辑均通过 CDN 注入，确保 index.html 即使在本地打开也能正常工作。

### 空间枢纽 (00_layout.cjs)
- **职责**: 整个项目的“母体”。它提供一个全屏的画布（Map Container），并暴露 `window.SUMMON(type, version)` 全局方法。
- **加载逻辑**: 所有的功能模块（Wallet, Map, Post）都是按需从 Irys 动态加载并注入布局中的挂载点。

---

## 🎨 2. 空间引擎与交互 (2D Spatial Specs)

### 聊天气泡 (Bubble Chat)
所有的 Web4 帖子都以**气泡窗 (Bubble Window)** 的形式存在。
- **视觉风格**: 借鉴《冒险岛 (MapleStory)》的半透明圆角气泡，漂浮在 2D 地图上。
- **动态深度**: 气泡的大小和亮度由帖子的热度（关注度）决定。

### 时间轴回溯 (Timeline Component)
- **实时监测**: 默认显示过去 5 分钟的活跃信号。
- **历史快照**: 底部集成的 UI 时间轴支持直接回滚。当拖动到历史时间点时，Map Engine 会重新发起该时段的快照查询，并在地图上重现当时的“气泡分布”。

### 语义引力 (Semantic Gravity)
- **原理**: 每个帖子在地图上的坐标 $(x, y)$ 是动态的。
- **逻辑**: 如果多个气泡拥有相同的 `#Tag` 或关键词，它们会在地图上相互吸引，最终聚拢成一个“岛屿 (Island)”。这实现了信息的**自动语义聚合**。

---

## 📦 3. 组件全集说明 (Components in `/opencoral`)

| 组件名称 | 文件名 | 职能描述 |
| :--- | :--- | :--- |
| **Summoner** | `00_layout.cjs` | 顶级容器，管理组件注入与状态协调。 |
| **Identity** | `01_wallet.cjs` | 独立钱包连接、PKI (Whisper) 公钥发布与签名接口。 |
| **Map Master** | `10_map_engine.cjs` | 处理 Canvas 渲染、时间轴逻辑与 Irys 轮询。 |
| **Bubble** | `20_bubble.cjs` | 气泡 UI 渲染器，包含作者头像、内容缩略及交互动效。 |
| **Composer** | `40_post_bar.cjs` | 底部浮动工具条。提供快速发帖入口（聊天窗口风格），直接调用钱包签名上传。 |

---

## 🛠 4. 开发与部署工具链

所有新组件必须按照 W4AP 标准在 `opencoral/` 目录下制作，并使用根目录脚本管理。

### 开发全流程
1. **源码编译**: `node build.cjs opencoral/your_component.cjs` -> 生成 `.json`。
2. **去中心化部署**: 
   ```bash
   node upload.cjs opencoral/your_component.json --type=COMPONENT_TYPE --version=1.x.x --tag=W4AP
   ```
3. **CDN 引用**: 第三方库（如 GSAP 动画库）必须通过 CDN 引入。

---

## 🔍 5. 核心逻辑实现参考 (Snippet)

### 时间轴查询逻辑 (Map Engine)
```javascript
const query = `query {
  transactions(
    tags: [{ name: "App-Name", values: ["Web4SNS"] }],
    timestamp: { from: ${timelineStart}, to: ${timelineEnd} },
    order: DESC
  ) { ... }
}`;
```

### 气泡引力计算
```javascript
// 基于标签相似度的简单引力算法
if (bubbleA.tag === bubbleB.tag) {
    bubbleA.vx += (bubbleB.x - bubbleA.x) * gravityConstant;
    bubbleA.vy += (bubbleB.y - bubbleA.y) * gravityConstant;
}
```

---

*OpenCoral: 重新定义 Web3 时代的社交地理。*

---

## 🏆 6. 2026-02-22 技术里程碑：空间索引与情境查询 (Spatial Index-Context)

### 动态视口矩阵查询 (Dynamic Viewport Querying - v2.2.18)
- **挑战**: 在大分辨率显示器或高度缩小（Zoom Out）时，固定 9 宫格查询会导致视口边缘出现大量空白。
- **方案**: 升级 `getNearbyTags` 算法。引擎现在会根据 `window.innerWidth/innerHeight` 与当前 `zoom` 实时计算所需的单元格矩阵（最高支持 11x11，即 121 个单元格同时查询），确保无限视口的无缝覆盖。

### 空间优先情境加载 (Location-First Context Query - v2.2.19)
- **挑战**: 默认 -7D 加载导致移动到新坐标时常因时间切片太旧而“空城”。
- **方案**: 重新定义 `NOW` 状态逻辑。当时间偏移量为 0 时，GraphQL 探测引擎会自动剥离 `timestamp` 时间过滤器，执行纯粹的空间坐标查询。
- **效果**: 降落在任何新坐标点，用户都能瞬间看到该位置历史上最新的 100 条动态（无论距今多久），极大地提升了地理社交的“寻宝”体验。

### R1/R4 降级提取 (Fallback Extraction)
- **方案**: 增强了对旧协议帖子的兼容。对于缺失 `Spatial-X/Y` 标签但拥有 `Cell-R1/R4` 标签的帖子，通过格点重心计算实现自动定位回填，解决了“帖子发了但在地图上看不到”的疑难杂症。



https://uploader.irys.xyz/FbQT23Mv83sHL7qS9bFdbN1F7wm6NTLJcbxodnPwhhzA
#### 🚀 最新统一入口 (V2.2.19):
https://uploader.irys.xyz/CkudsDmuyXrBuyWbv5EHudt1UCGk7EDjNP9zPDBZdzig


