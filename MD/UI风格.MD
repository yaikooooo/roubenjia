# YOYO 黑猪 UI 风格设计规范

> **目标**：为《肉本家》系列 Web / 大屏应用建立统一且具有嘻哈涂鸦调性的设计语言，方便设计师、前端、动效及运营同一套规范协作。

---

## 1 色彩体系

| 类别                    | 名称             | Hex       | 用途示例              |
| --------------------- | -------------- | --------- | ----------------- |
| **Primary‑Dark**      | Espresso Black | `#140907` | 标题文字、主按钮填充、顶部导航栏  |
| **Primary‑Light**     | Vintage Cream  | `#F7F2E7` | 页面背景、卡片底、分割条      |
| **Accent**            | Piggy Red      | `#A12D23` | 关键 CTA、链接悬停、进度条高亮 |
| **Secondary‑1**       | Apricot        | `#D99C5B` | 次级按钮、标签、提示气泡      |
| **Secondary‑2**       | Sage Green     | `#60916C` | 成功状态、价格标签、图表正向值   |
| **Neutral‑Border**    | Sandstone      | `#E6DED0` | 卡片描边、输入框边框        |
| **Info**              | Lake Blue      | `#4A93C9` | 信息提示 Badge        |
| **Success**           | Leaf Green     | `#4C9D50` | 成功 Toast、进度完成     |
| **Warning**           | Sunset Orange  | `#E8A23D` | 风险提示、警告 Tag       |
| **Error**             | Brick          | `#D6453D` | 错误消息、校验失败         |
| **Graffiti Accent**   | Flash Magenta  | `#FF4DA8` | 喷漆晕影、闪光贴纸         |
| **Graffiti Accent 2** | Neon Cyan      | `#34BCE8` | 喷漆晕影、Flash 标签     |

---

## 2 排版

| 层级      | 字体                   | 字号 / 行高 | 说明      |
| ------- | -------------------- | ------- | ------- |
| H1      | Bebas Neue Bold      | 48 / 56 | 嘻哈粗体主标题 |
| H2      | Bebas Neue Bold      | 32 / 40 | 页面副标题   |
| H3      | PingFang SC Semibold | 24 / 32 | 模块标题    |
| Body‑L  | PingFang SC Regular  | 18 / 28 | 正文大字    |
| Body‑M  | PingFang SC Regular  | 16 / 24 | 正文常规    |
| Caption | PingFang SC Regular  | 14 / 20 | 辅助说明    |
| Numeral | Rubik Mono           | 同层级字号   | 数据专用等宽  |

---

## 3 按钮组件

### 3.1 基本样式

| 类型            | 默认背景          | 边框           | 文本             | Hover / Focus                             | Active              | Disabled            |
| ------------- | ------------- | ------------ | -------------- | ----------------------------------------- | ------------------- | ------------------- |
| **Primary**   | Piggy Red     | 无            | Vintage Cream  | 背景 #B73628, 外阴影 0 2 6 rgba(161,45,35,.25) | 背景 #8F241C          | 文字 & 图标透明度 40 %     |
| **Secondary** | 透明            | 1 px Apricot | Apricot        | 背景 Apricot, 文本 Espresso Black             | 背景 #B97E46          | 边框 & 文本 Sandstone   |
| **Ghost**     | 透明            | 无            | Espresso Black | 背景 Sandstone 10 % α                       | 背景 Sandstone 20 % α | 文本 Sandstone 60 % α |
| **Success**   | Leaf Green    | 无            | Vintage Cream  | #3E8543                                   | #336E37             | 同 Primary Disabled  |
| **Warning**   | Sunset Orange | 无            | Espresso Black | #D68F33                                   | #B37429             | 同 Ghost Disabled    |
| **Error**     | Brick         | 无            | Vintage Cream  | #B83834                                   | #962E2B             | 同 Primary Disabled  |

### 3.2 涂鸦贴纸化

* **圆角**：4 px，锐利切边。
* **白描边**：Primary/Success/Error 增加 2 px #FFFFFF 外描边 ➜ 贴纸感。
* **喷漆 Hover 阴影**：Hover → 外扩模糊 6 px，颜色取 Graffiti Accent（Magenta / Cyan）30 % α。
* **Wiggle 动效**：按钮 click → 80 ms 轻微旋转 ±3° 回弹，制造街头涂鸦贴纸被拍上的感觉。

---

## 4 标签 & Badge

| 类型       | 背景               | 文本             | 描边                   | 额外效果        |
| -------- | ---------------- | -------------- | -------------------- | ----------- |
| Default  | Sandstone 40 % α | Espresso Black | 无                    | 圆角 4 px     |
| Accent   | Piggy Red        | Vintage Cream  | 无                    | 可加 2 px 白描边 |
| Graffiti | 透明               | Espresso Black | 2 px Graffiti Accent | Hover 喷漆晕影  |

---

## 5 卡片 & 容器

* **背景**：Primary‑Light；深色区块用 Espresso Black。
* **描边**：1 px Sandstone。嘻哈主题卡片可加 2 px Graffiti Accent 外描边。
* **阴影**：常规 0 1 4 rgba(0,0,0,.06)；强调卡片 0 4 16 rgba(0,0,0,.12)。

---

## 6 图标 & 装饰

* 主图标：粗线剪影风，线宽 2.5 px，填充 Piggy Red / Espresso Black。
* 装饰涂鸦：不规则喷溅、箭头、星星，使用 Graffiti Accent。
* 动效：SVG Path Draw / Lottie Path Trim，呈现手绘涂鸦出现效果。

---

## 7 动效 & 交互

| 交互        | 动效                      | 时长     |
| --------- | ----------------------- | ------ |
| 按钮 Hover  | 喷漆阴影 Fade‑In            | 120 ms |
| 按钮 Active | Wiggle Rotate ±3°       | 80 ms  |
| Badge 出现  | Pop‑in Scale 0.8→1      | 160 ms |
| 卡片加载      | Fade‑in & Slide Up 8 px | 200 ms |

---

## 8 布局 & 间距

* 基础 4 px 系统。常见间距：4 / 8 / 12 / 16 / 24 / 32 / 48 / 64。
* 列栅格：桌面 12 栏（80 px 列宽 + 16 px Gutters）；电视大屏可扩至 24 栏，保证 1920 × 1080 完整展示。

---

## 9 资源下载

* Figma 变量 & 组件库
* SVG 图标集（24 × 24 & 48 × 48）
* Lottie 动效 JSON（喷漆 / Wiggle）

---

## TODO

* [ ] 出暗色模式对照色板
* [ ] 设计输入框 / 选择器 / Modal 规范
* [ ] 提供 TV 端聚焦状态动效

> 如需新增组件或对现有规范做调整，请在评论区说明需求。
