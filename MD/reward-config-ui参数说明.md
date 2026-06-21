# reward-config UI 参数说明

本文档只说明 `reward-config.json` 中和界面表现、布局、弹窗、资源、音效有关的配置字段，方便你直接调参数。

## 配置入口

主文件：`reward-config.json`

重点关注：`ui_config`

---

## 1. stage

位置：`ui_config.stage`

作用：控制舞台设计尺寸和桌面窗口尺寸。

### preset
- 含义：舞台预设名
- 常见值：`default`、`wall3240`
- 用途：给系统识别当前使用哪套舞台参数

### designWidth
- 含义：设计稿宽度
- 作用：整个抽奖页面内部坐标系的宽度基准
- 调整影响：改动后，所有定位都可能跟着变化
- 建议：没有必要不要改

### designHeight
- 含义：设计稿高度
- 作用：整个抽奖页面内部坐标系的高度基准
- 调整影响：改动后，所有定位都可能跟着变化
- 建议：没有必要不要改

### windowWidth
- 含义：桌面版窗口宽度
- 作用：只影响 Electron 开窗尺寸
- 建议：需要适配显示器时再调

### windowHeight
- 含义：桌面版窗口高度
- 作用：只影响 Electron 开窗尺寸
- 建议：需要适配显示器时再调

---

## 2. ui_settings

位置：`ui_config.ui_settings`

作用：控制奖品格、中间 Banner、LOGO 的尺寸。

### iconSize
- 含义：奖品格尺寸
- 数值变大：奖品框更大
- 数值变小：奖品框更小

### bannerWidth
- 含义：中间 Banner 宽度
- 数值变大：Banner 更宽
- 数值变小：Banner 更窄

### bannerHeight
- 含义：中间 Banner 高度
- 数值变大：Banner 更高
- 数值变小：Banner 更矮

### logoSize
- 含义：中间 LOGO 尺寸比例
- 数值变大：LOGO 更大
- 数值变小：LOGO 更小

---

## 3. layout

位置：`ui_config.layout`

作用：控制 16 个奖位的排布方式，以及中间 Banner 的中心位置。

### 3.1 奖位数量分布

#### slotCount
- 含义：奖位总数
- 当前：`16`
- 注意：要和四边奖位数量总和一致

#### topRowCount
- 含义：上边一排奖位数量

#### rightColumnCount
- 含义：右边一列奖位数量

#### bottomRowCount
- 含义：下边一排奖位数量

#### leftColumnCount
- 含义：左边一列奖位数量

说明：
- 你当前布局是上 6、右 2、下 6、左 2
- 如果改这几个值，总和必须等于 `slotCount`

### 3.2 整体边距参数

#### layoutHorizontalPadding
- 含义：整体布局左右留白
- 数值变大：奖位整体向中间收
- 数值变小：奖位整体更贴左右边缘

#### layoutVerticalPadding
- 含义：整体布局上下留白
- 数值变大：奖位整体向中间收
- 数值变小：奖位整体更贴上下边缘

#### sideColumnInset
- 含义：左右侧奖位向中间缩进的距离
- 数值变大：左右两列更靠中间
- 数值变小：左右两列更靠边缘

### 3.3 精确坐标参数

这组是最常用的精调参数。

#### topRowY
- 含义：上排奖位 Y 坐标
- 数值变小：上排更靠上
- 数值变大：上排更靠下

#### bottomRowY
- 含义：下排奖位 Y 坐标
- 数值变小：下排更靠上
- 数值变大：下排更靠下

#### leftColumnX
- 含义：左列奖位 X 坐标
- 数值变小：左列更靠左
- 数值变大：左列更靠右

#### rightColumnX
- 含义：右列奖位 X 坐标
- 数值变小：右列更靠左
- 数值变大：右列更靠右

#### sideColumnTopY
- 含义：左右侧上方奖位的 Y 坐标
- 数值变小：更靠上
- 数值变大：更靠下

#### sideColumnBottomY
- 含义：左右侧下方奖位的 Y 坐标
- 数值变小：更靠上
- 数值变大：更靠下

### 3.4 中间主视觉位置

#### bannerCenterX
- 含义：Banner 水平中心点比例
- `0.5`：正中间
- 小于 `0.5`：整体偏左
- 大于 `0.5`：整体偏右

#### bannerCenterY
- 含义：Banner 垂直中心点比例
- `0.5`：正中间
- 小于 `0.5`：整体偏上
- 大于 `0.5`：整体偏下

---

## 4. modal

位置：`ui_config.modal`

作用：控制中奖弹窗关闭时间和粒子数量。

### autoCloseCountdown
- 含义：中奖弹窗自动关闭倒计时
- 单位：秒

### particleCount

#### particleRain
- 含义：粒子雨数量
- 数值越大：画面更满，性能消耗更高

#### particleExplosion
- 含义：爆炸粒子数量
- 数值越大：爆点效果更强

#### twinklingStars
- 含义：闪烁星星数量

#### imageSparkles
- 含义：奖品图片周围闪光粒子数量

#### backgroundParticles
- 含义：背景漂浮粒子数量

建议：
- 设备性能一般时，优先减小这一组
- 想提升视觉冲击，可以优先增加 `particleRain` 和 `particleExplosion`

---

## 5. resources

位置：`ui_config.resources`

作用：控制界面资源图路径。

### logo.default
- 含义：默认 LOGO 图片路径
- 用途：替换中间 LOGO 图

### banner.default
- 含义：默认 Banner 图片路径
- 用途：替换中间主视觉图

---

## 6. effects

位置：`ui_config.effects`

作用：控制特效强度。

### particleIntensity
- 含义：粒子强度级别
- 常见值：`low`、`medium`、`high`
- 建议：
  - 保守一点用 `low`
  - 常规用 `medium`
  - 想更炸用 `high`

---

## 7. sounds

位置：`ui_config.sounds`

作用：控制声音表现，不是纯布局参数，但属于界面表现层。

### loop
- 作用：抽奖转动中的循环音效
- `default`：普通轮次使用
- `mystery`：神秘轮次使用

### reward
- 作用：中奖结果音效
- `default`：普通中奖
- `mystery`：神秘轮次中奖

### background
- 作用：背景音乐配置
- `mode`：播放模式，如 `random`、`single`
- `selected`：指定歌曲
- `default`：默认歌曲
- `playlist`：可播放列表

### mystery_round
- 作用：神秘轮次音效配置
- `start`：开始音效
- `loop`：持续循环音效
- `win`：中奖音效

### voiceover
- 作用：配音系统配置

#### enabled
- 含义：是否启用配音

#### volume
- 含义：配音音量
- 范围建议：`0 ~ 1`

#### idleDelayMs
- 含义：多久没操作后播空闲提示
- 单位：毫秒

#### nodes
- 含义：各个配音节点配置
- 当前包括：`welcome`、`start`、`countdown`、`regularWin`、`rareWin`、`jackpotWin`、`idle` 以及各奖品专属 `win*` 节点

当前业务规则：
- `start`：点击开始后立刻播放，当前使用最新版 `28` 条文案随机抽 `1` 条
- `countdown`：转盘即将停下前播放，当前使用最新版 `4` 条文案随机抽 `1` 条
- `regularWin` / `rareWin` / `jackpotWin`：奖项未绑定专属 `voiceoverNode` 时的回退节点
- `win*`：奖项专属中奖节点，优先级高于 `voiceoverTier`

常见节点附加参数：
- `strategy`：播放策略，常见为 `random` 或 `fixed`
- `pickCount`：一次抽取几条语音
- `clips`：语音文件列表
- `leadTimeMs`：提前播放倒计时语音的时间

---

## 8. 最常用调参表

### 奖品框太大或太小
改：`ui_config.ui_settings.iconSize`

### 上排太靠下
改：`ui_config.layout.topRowY`

### 下排太靠上
改：`ui_config.layout.bottomRowY`

### 左侧奖位太靠里
改：`ui_config.layout.leftColumnX`

### 右侧奖位太靠里
改：`ui_config.layout.rightColumnX`

### 左右两列内部距离太近
改：
- `ui_config.layout.sideColumnTopY`
- `ui_config.layout.sideColumnBottomY`

### 中间 Banner 太大或太小
改：
- `ui_config.ui_settings.bannerWidth`
- `ui_config.ui_settings.bannerHeight`

### 中间 LOGO 太大或太小
改：`ui_config.ui_settings.logoSize`

### 中间主视觉偏左或偏右
改：`ui_config.layout.bannerCenterX`

### 中间主视觉偏上或偏下
改：`ui_config.layout.bannerCenterY`

### 特效太卡
改：
- `ui_config.modal.particleCount` 下各项数值
- `ui_config.effects.particleIntensity`

---

## 9. 不属于 UI 排版的部分

以下字段不要和 UI 布局混在一起看：

### groups
- 奖品数据
- 控制奖品名称、权重、图片、大奖类型、语音层级
- 奖项可通过 `voiceoverNode` 绑定专属中奖配音节点；未配置时再按 `voiceoverTier` 回退
- 不负责界面坐标布局

### version
- 配置版本标识
- 不负责界面效果

---

## 10. 调参建议顺序

如果你要快速把页面调顺眼，建议按这个顺序来：

1. 先调 `iconSize`
2. 再调 `topRowY`、`bottomRowY`、`leftColumnX`、`rightColumnX`
3. 再调 `sideColumnTopY`、`sideColumnBottomY`
4. 再调 `bannerWidth`、`bannerHeight`、`logoSize`
5. 最后再调粒子和配音相关表现参数
