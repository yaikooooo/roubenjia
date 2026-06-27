const DEFAULT_DRAW_PRIZE_LAYOUT = {
  slotCount: 16,
  topRowCount: 6,
  rightColumnCount: 2,
  bottomRowCount: 6,
  leftColumnCount: 2,
  prizeIconSize: 250,
  bannerWidth: 1020,
  bannerHeight: 610,
  logoMaxWidth: 62,
  layoutHorizontalPadding: 190,
  layoutVerticalPadding: 150,
  sideColumnInset: 210,
  topRowY: 150,
  bottomRowY: 930,
  leftColumnX: 190,
  rightColumnX: 1730,
  sideColumnTopY: 360,
  sideColumnBottomY: 720,
  bannerCenterX: 0.5,
  bannerCenterY: 0.5,
  legacyOrderMap: [0, 1, 2, 3, 10, 8, 9, 6, 5, 1, 4, 9, 8, 7, 11, 6]
};

function getDrawLayoutNumber(value, fallback) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function resolveDrawLayoutConfig(uiConfig = {}) {
  const layoutConfig = uiConfig.layout || {};
  const uiSettings = uiConfig.ui_settings || {};
  const resolvedLayout = {
    ...DEFAULT_DRAW_PRIZE_LAYOUT
  };
  const layoutSource = {
    ...layoutConfig,
    prizeIconSize: uiSettings.iconSize ?? layoutConfig.prizeIconSize ?? layoutConfig.iconSize,
    bannerWidth: uiSettings.bannerWidth ?? layoutConfig.bannerWidth,
    bannerHeight: uiSettings.bannerHeight ?? layoutConfig.bannerHeight,
    logoMaxWidth: uiSettings.logoSize ?? layoutConfig.logoMaxWidth ?? layoutConfig.logoSize
  };

  resolvedLayout.prizeIconSize = getDrawLayoutNumber(
    layoutSource.prizeIconSize,
    DEFAULT_DRAW_PRIZE_LAYOUT.prizeIconSize
  );
  resolvedLayout.bannerWidth = getDrawLayoutNumber(
    layoutSource.bannerWidth,
    DEFAULT_DRAW_PRIZE_LAYOUT.bannerWidth
  );
  resolvedLayout.bannerHeight = getDrawLayoutNumber(
    layoutSource.bannerHeight,
    DEFAULT_DRAW_PRIZE_LAYOUT.bannerHeight
  );
  resolvedLayout.logoMaxWidth = getDrawLayoutNumber(
    layoutSource.logoMaxWidth,
    DEFAULT_DRAW_PRIZE_LAYOUT.logoMaxWidth
  );
  resolvedLayout.layoutHorizontalPadding = getDrawLayoutNumber(
    layoutConfig.layoutHorizontalPadding ?? layoutConfig.horizontalPadding,
    DEFAULT_DRAW_PRIZE_LAYOUT.layoutHorizontalPadding
  );
  resolvedLayout.layoutVerticalPadding = getDrawLayoutNumber(
    layoutConfig.layoutVerticalPadding ?? layoutConfig.verticalPadding,
    DEFAULT_DRAW_PRIZE_LAYOUT.layoutVerticalPadding
  );
  resolvedLayout.sideColumnInset = getDrawLayoutNumber(
    layoutConfig.sideColumnInset,
    DEFAULT_DRAW_PRIZE_LAYOUT.sideColumnInset
  );
  const defaultTopRowY = resolvedLayout.layoutVerticalPadding;
  const defaultBottomRowY = DEFAULT_DRAW_PRIZE_LAYOUT.bottomRowY + (DEFAULT_DRAW_PRIZE_LAYOUT.layoutVerticalPadding - resolvedLayout.layoutVerticalPadding);
  const defaultLeftColumnX = resolvedLayout.layoutHorizontalPadding;
  const defaultRightColumnX = DEFAULT_DRAW_PRIZE_LAYOUT.rightColumnX + (DEFAULT_DRAW_PRIZE_LAYOUT.layoutHorizontalPadding - resolvedLayout.layoutHorizontalPadding);
  const defaultSideColumnTopY = defaultTopRowY + resolvedLayout.sideColumnInset;
  const defaultSideColumnBottomY = defaultBottomRowY - resolvedLayout.sideColumnInset;

  resolvedLayout.topRowY = getDrawLayoutNumber(
    layoutConfig.topRowY,
    defaultTopRowY
  );
  resolvedLayout.bottomRowY = getDrawLayoutNumber(
    layoutConfig.bottomRowY,
    defaultBottomRowY
  );
  resolvedLayout.leftColumnX = getDrawLayoutNumber(
    layoutConfig.leftColumnX,
    defaultLeftColumnX
  );
  resolvedLayout.rightColumnX = getDrawLayoutNumber(
    layoutConfig.rightColumnX,
    defaultRightColumnX
  );
  resolvedLayout.sideColumnTopY = getDrawLayoutNumber(
    layoutConfig.sideColumnTopY,
    defaultSideColumnTopY
  );
  resolvedLayout.sideColumnBottomY = getDrawLayoutNumber(
    layoutConfig.sideColumnBottomY,
    defaultSideColumnBottomY
  );
  resolvedLayout.bannerCenterX = getDrawLayoutNumber(
    layoutConfig.bannerCenterX,
    DEFAULT_DRAW_PRIZE_LAYOUT.bannerCenterX
  );
  resolvedLayout.bannerCenterY = getDrawLayoutNumber(
    layoutConfig.bannerCenterY,
    DEFAULT_DRAW_PRIZE_LAYOUT.bannerCenterY
  );

  const slotCounts = {
    topRowCount: Math.max(0, Math.floor(getDrawLayoutNumber(layoutConfig.topRowCount, DEFAULT_DRAW_PRIZE_LAYOUT.topRowCount))),
    rightColumnCount: Math.max(0, Math.floor(getDrawLayoutNumber(layoutConfig.rightColumnCount, DEFAULT_DRAW_PRIZE_LAYOUT.rightColumnCount))),
    bottomRowCount: Math.max(0, Math.floor(getDrawLayoutNumber(layoutConfig.bottomRowCount, DEFAULT_DRAW_PRIZE_LAYOUT.bottomRowCount))),
    leftColumnCount: Math.max(0, Math.floor(getDrawLayoutNumber(layoutConfig.leftColumnCount, DEFAULT_DRAW_PRIZE_LAYOUT.leftColumnCount)))
  };
  const computedSlotCount = Object.values(slotCounts).reduce((sum, count) => sum + count, 0);
  const configuredSlotCount = Math.max(
    0,
    Math.floor(getDrawLayoutNumber(layoutConfig.slotCount, DEFAULT_DRAW_PRIZE_LAYOUT.slotCount))
  );

  if (computedSlotCount > 0 && computedSlotCount === configuredSlotCount) {
    resolvedLayout.slotCount = configuredSlotCount;
    resolvedLayout.topRowCount = slotCounts.topRowCount;
    resolvedLayout.rightColumnCount = slotCounts.rightColumnCount;
    resolvedLayout.bottomRowCount = slotCounts.bottomRowCount;
    resolvedLayout.leftColumnCount = slotCounts.leftColumnCount;
  }

  return resolvedLayout;
}

const Draw = {
  name: 'Draw',
  template: `
    <div class="lottery-container" :class="{'is-drawing': isSpinning}" :style="getContainerStyle()">
      <!-- 全屏背景 -->
      <div class="bg-image"></div>
      
      <!-- 透明遮罩层 -->
      <div class="overlay-mask">
        <div class="corner-shadow corner-top-left"></div>
        <div class="corner-shadow corner-bottom-right"></div>
        <!-- 星星粒子效果容器 -->
        <div class="background-particles" ref="backgroundParticles"></div>
      </div>
      
      <!-- 返回按钮已移除 -->
      
      <!-- 抽奖区域 -->
      <div class="prize-area" :style="getPrizeAreaStyle()">
        <!-- 奖品椭圆布局 -->
        <ul class="prize-list" ref="prizeList">
          <li v-for="(prize, index) in prizes" 
              :key="index" 
              ref="prizeItems"
              class="prize-item"
              :class="[
                getPrizeSideClass(index),
                {
                'highlight': highlightedIndex === index,
                'winner': winnerIndex === index,
                'mystery-prize': prize.type === 'mystery',
                'multi-highlight': multiHighlightIndices.includes(index)
                }
              ]"
              :style="getPrizeItemStyle(index)">
            <div class="prize-content">
              <!-- 支持多种媒体格式 -->
              <video v-if="prizes[index] && isModalVideoFile(prizes[index])" 
                     :src="getPrizeImageUrl(prizes[index])" 
                     class="prize-media" 
                     autoplay 
                     loop 
                     muted 
                     playsinline
                     alt="奖品视频">
              </video>
              <img v-else-if="prizes[index]" 
                   :src="getPrizeImageUrl(prizes[index])" 
                   class="prize-media" 
                   alt="奖品图片"
                   @error="handleImageError">
              <div v-else class="prize-placeholder">
                加载中...
              </div>
              <div class="prize-name">{{ prize.name }}</div>
            </div>
          </li>
        </ul>
        
        <!-- 中心区域 -->
        <div class="center-area" :style="getBannerStyle()">
          <!-- 中心Banner图片 - 支持PNG和GIF -->
          <img :src="getBannerImageUrl()" alt="中心横幅" class="center-banner">
          <div class="logo-sparkles" ref="logoSparkles"></div>
          
          <!-- LOGO作为新的抽奖按钮 - 支持PNG和GIF -->
          <img 
            :src="getLogoImageUrl()" 
            alt="LOGO - 点击抽奖" 
            class="center-logo"
            :style="getLogoStyle()"
            @mousedown="startPowerUp"
            @mouseup="endPowerUp"
            @mouseleave="endPowerUp"
            @touchstart.prevent="startPowerUp"
            @touchend.prevent="endPowerUp"
            @touchcancel.prevent="endPowerUp"
            :class="{'powering-up-logo': isPoweringUp}"
          >
        </div>
        
        <!-- 开始按钮已移除，现在只能通过点击LOGO或按K键抽奖 -->
      </div>
      <div class="banner-meteors banner-meteors-mid" ref="bannerMeteorsMid"></div>
      <div class="banner-meteors banner-meteors-high" ref="bannerMeteorsHigh"></div>
      
      <!-- 电弧路径 -->
      <svg class="lightning-path">
        <path ref="lightningPath" d="M0,0" stroke="#4F8FF" stroke-width="4" fill="none" />
      </svg>
      
      <!-- 调试信息，仅在开发环境显示 -->
      <div v-if="false" class="debug-info">
        <div>当前高亮索引: {{ highlightedIndex }}</div>
        <div>最后停留索引: {{ lastStoppedIndex }}</div>
        <div>中奖索引: {{ winnerIndex }}</div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="$router.push('/home')">
          返回首页
        </button>
      </div>
      
      <!-- 中奖弹窗 - 绚丽特效版本 -->
      <transition name="prize-modal">
        <div v-if="showModal" class="winner-modal-backdrop">
          <div class="winner-modal-shell" :style="getWinnerModalShellStyle()">
          <div class="winner-modal spectacular-modal" ref="winnerModal">
            <!-- 绚丽特效容器 -->
            <div class="spectacular-effects">
              <!-- 星星网格背景 -->
              <div class="star-grid-background"></div>
              
              <!-- 增强粒子掉落 -->
              <div class="enhanced-particle-rain" ref="particleRain"></div>
              
              <!-- 粒子爆炸系统 -->
              <div class="particle-explosion" ref="particleExplosion"></div>
              
              <!-- 闪烁星星 -->
              <div class="twinkling-stars" ref="twinklingStars"></div>
              
              <!-- 光束扫描 -->
              <div class="light-beams">
                <div class="light-beam beam-1"></div>
                <div class="light-beam beam-2"></div>
                <div class="light-beam beam-3"></div>
                <div class="light-beam beam-4"></div>
              </div>
              
              <!-- 烟花特效 -->
              <div class="fireworks-container" ref="fireworksContainer"></div>
              
              <!-- 能量波纹 -->
              <div class="energy-ripples">
                <div class="energy-ripple ripple-1"></div>
                <div class="energy-ripple ripple-2"></div>
                <div class="energy-ripple ripple-3"></div>
              </div>
            </div>
            
            <!-- 彩带动画容器 -->
            <div class="confetti-container" ref="confetti"></div>
            
            <!-- 标题 -->
            <h2 class="winner-title spectacular-title">
              <span class="title-text">恭喜你，中奖啦!</span>
              <!-- 特效框已移除 - title-glow -->
              <!-- <div class="title-glow"></div> -->
            </h2>
            
            <!-- 奖品图片 -->
            <div class="winner-image-container spectacular-image-container">
              <!-- 特效框已移除 - image-glow-effect -->
              <!-- <div class="image-glow-effect"></div> -->
              <img :src="getModalMediaUrlSync()" 
                   class="winner-image spectacular-image"
                   :alt="selectedPrize?.name"
                   @error="handleImageError">
              <div class="image-sparkles" ref="imageSparkles"></div>
            </div>
            
            <!-- 奖品信息区域 - 已注释，包括整个信息底部容器 -->
            <!-- 如需显示奖品名称和描述，请取消下面的注释 -->
            <!--
            <div class="winner-info spectacular-info">
              <h3 class="winner-name spectacular-name">{{ selectedPrize?.name }}</h3>
              <p class="winner-desc spectacular-desc">{{ selectedPrize?.desc }}</p>
            </div>
            -->
            
            <!-- 关闭按钮已移除，仅通过倒计时自动关闭 -->
            
            <!-- 倒计时显示 - 恢复3秒自动关闭 -->
            <div v-if="autoCloseCountdown > 0" class="countdown-display">
              {{ autoCloseCountdown }}s后自动关闭
            </div>
          </div>
          </div>
        </div>
      </transition>
    </div>
  `,
  inject: ['store', 'utils'],
  data() {
    return {
      prizes: [],
      loading: true,
      error: null,
      isSpinning: false,
      isDrawingLocked: false, // 抽奖锁定状态
      highlightedIndex: -1,
      winnerIndex: -1,
      showModal: false,
      selectedPrize: null,
      animationTimer: null,
      animationComplete: false,
      animationFrame: 0,
      ellipseRatio: 3.5,
      positions: [],
      // 蓄力相关数据
      powerUpTimer: null,
      powerUpStartTime: 0,
      powerUpProgress: 0,
      isPoweringUp: false,
      maxPowerUpTime: 3000, // 最大蓄力时间 3 秒
      
      // 自适应相关数据
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      prizeSlotCount: DEFAULT_DRAW_PRIZE_LAYOUT.slotCount,
      topRowCount: DEFAULT_DRAW_PRIZE_LAYOUT.topRowCount,
      rightColumnCount: DEFAULT_DRAW_PRIZE_LAYOUT.rightColumnCount,
      bottomRowCount: DEFAULT_DRAW_PRIZE_LAYOUT.bottomRowCount,
      leftColumnCount: DEFAULT_DRAW_PRIZE_LAYOUT.leftColumnCount,
      
      // ======================================================
      // 固定比例布局配置项 - 基于标准设计尺寸等比例缩放
      // ======================================================

      // 标准设计尺寸 (基于背景图比例)
      designWidth: 1920,      // 背景图宽度
      designHeight: 1080,     // 背景图高度
      
      // 当前缩放比例
      scaleRatio: 1,
      layoutReady: false,
      
      // 1. 尺寸配置 (使用像素单位，基于设计稿)
      prizeIconSize: DEFAULT_DRAW_PRIZE_LAYOUT.prizeIconSize, // 单个奖励ICON的尺寸 (像素)
      bannerWidth: DEFAULT_DRAW_PRIZE_LAYOUT.bannerWidth,     // 中心横幅的宽度 (像素)
      bannerHeight: DEFAULT_DRAW_PRIZE_LAYOUT.bannerHeight,   // 中心横幅的高度 (像素)
      logoMaxWidth: DEFAULT_DRAW_PRIZE_LAYOUT.logoMaxWidth,   // LOGO最大宽度相对于Banner的百分比

      // 2. 布局间距配置 (使用像素单位，基于设计稿)
      layoutHorizontalPadding: DEFAULT_DRAW_PRIZE_LAYOUT.layoutHorizontalPadding, // 左右两列与屏幕边缘的距离 (像素)
      layoutVerticalPadding: DEFAULT_DRAW_PRIZE_LAYOUT.layoutVerticalPadding,     // 上下两排与屏幕边缘的距离 (像素)
      sideColumnInset: DEFAULT_DRAW_PRIZE_LAYOUT.sideColumnInset,                 // 左右两列相对上下排向内收的距离 (像素)
      topRowY: DEFAULT_DRAW_PRIZE_LAYOUT.topRowY,
      bottomRowY: DEFAULT_DRAW_PRIZE_LAYOUT.bottomRowY,
      leftColumnX: DEFAULT_DRAW_PRIZE_LAYOUT.leftColumnX,
      rightColumnX: DEFAULT_DRAW_PRIZE_LAYOUT.rightColumnX,
      sideColumnTopY: DEFAULT_DRAW_PRIZE_LAYOUT.sideColumnTopY,
      sideColumnBottomY: DEFAULT_DRAW_PRIZE_LAYOUT.sideColumnBottomY,
      
      // 3. Banner中心位置配置 (使用0到1的比例值，保持居中)
      bannerCenterX: DEFAULT_DRAW_PRIZE_LAYOUT.bannerCenterX, // -> Banner水平中心点 (0.5 = 页面正中)
      bannerCenterY: DEFAULT_DRAW_PRIZE_LAYOUT.bannerCenterY, // -> Banner垂直中心点 (0.5 = 页面正中)
      
      // 4. 跑火车动画高亮颜色配置 (从设置中加载)
      // 这些颜色将在created()中从localStorage加载
      highlightColors: [
        '#ffd74d', // 金黄色 (默认)
        '#ec9351', // 橙色 (默认)
        '#eb7250', // 橙红色 (默认)
        '#ffcac0'  // 粉橙色 (默认)
      ],
      
      // ======================================================
      
      // 动画模式 - 默认为跑火车
      animationMode: 'train',
      // 蓄力音效
      powerUpSound: null,
      // 背景音乐
      backgroundMusic: null,
      backgroundMusicConfig: null,
      backgroundMusicInteractionHandler: null,
      currentBackgroundTrack: '',
      // 配音
      voiceoverConfig: null,
      activeVoiceoverAudio: null,
      activeVoiceoverNode: '',
      voiceoverQueueToken: 0,
      voiceoverTimeouts: [],
      idleVoiceoverTimer: null,
      voiceoverActivityHandler: null,
      lastVoiceoverPathMap: {},
      queuedVoiceoverSequences: [],
      isVoiceoverSequencePlaying: false,
      // 保存上次停留的位置
      lastStoppedIndex: 0,
      // 用于处理神秘奖励
      isMysteryRound: false,
      isMysteryPrizeShown: false,
      realPrize: null,
      // 多重高亮索引数组
      multiHighlightIndices: [],
      // 神秘奖品的第二轮动画配置
      mysteryRoundDelay: 800, // 第二轮开始前的延迟(毫秒)
      mysteryMinRounds: 3, // 神秘奖励抽取的最小闪烁轮数
      mysteryMaxRounds: 5, // 神秘奖励抽取的最大闪烁轮数
      // 每轮多重高亮的数量范围
      minHighlightsPerRound: 2,
      maxHighlightsPerRound: 5,
      minimumHighlightVisibleMs: 140,
      
      // 弹窗自动关闭和掉落动画相关
      autoCloseTimer: null,
      confettiInterval: null,
      autoCloseCountdown: 5, // 倒计时秒数改为3秒
      countdownTimer: null,
      // UI设置
      modalSettings: {
        autoCloseCountdown: 5,
        particleCount: {
          particleRain: 300,
          particleExplosion: 100,
          twinklingStars: 50,
          imageSparkles: 30,
          backgroundParticles: 20
        }
      },
      
      // UI 资源固定使用 PNG，不再探测 GIF
      logoHasGif: false,
      bannerHasGif: false,
      hitParticleTimers: [],
      activeWinnerTween: null,
      activeJackpotTween: null,
      highlightCleanupTimers: Object.create(null),
      
      // 弹窗尺寸配置 - 统一在这里管理所有尺寸
      modalConfig: {
        maxWidth: 800,      // 弹窗最大宽度 (像素)
        maxHeight: 800,     // 弹窗最大高度 (像素)
        imageSize: 700,     // 弹窗内图片尺寸 (像素) - 统一控制
        imageOffsetY: 0    // 图片向下偏移量 (像素) - 可手动调整
        // 移除缩放限制，使用与抽奖界面相同的无限制等比例缩放
      },
      
      // 背景粒子效果相关
      backgroundParticleTimer: null,
      backgroundParticleInterval: null,
      logoSparkleTimer: null,
      logoSparkleCleanupTimers: [],
      bannerMeteorTimer: null,
      bannerMeteorCleanupTimers: [],
      
      // 奖励框泛光效果相关
      prizeGlowInterval: null,
      
      // 奖励显示类型（从配置中加载）
      currentDisplayType: 'gif' // 默认优先使用GIF
    };
  },
  computed: {
    // 获取今日中奖记录
    todayWinners() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return this.store.lotteryLog
        .filter(log => new Date(log.timestamp) >= today)
        .sort((a, b) => b.timestamp - a.timestamp);
    }
  },
  async created() {
    try {
      // 检查是否选择了奖池
      if (!this.store.lastGroupId) {
        this.error = '请先选择奖池';
        this.loading = false;
        return;
      }
      
      // 获取奖池配置
      const config = await this.utils.getRewardConfig();
      this.backgroundMusicConfig = this.buildBackgroundMusicConfig(config?.ui_config?.sounds?.background);
      this.voiceoverConfig = this.buildVoiceoverConfig(config?.ui_config?.sounds?.voiceover);
      
      // 检查奖池是否存在
      if (!config.groups || !config.groups[this.store.lastGroupId]) {
        this.error = '奖池不存在，请重新选择';
        this.loading = false;
        return;
      }
      
      this.applyStageConfig(config);
      this.applyLayoutConfig(config.ui_config);
      this.layoutReady = true;
      this.refreshLayout();

      // 获取奖池奖品
      this.prizes = this.normalizePrizeList(config.groups[this.store.lastGroupId]);
      
      // 加载显示设置
      if (config.displaySettings && config.displaySettings[this.store.lastGroupId]) {
        this.currentDisplayType = config.displaySettings[this.store.lastGroupId].rewardDisplayType || 'gif';
      } else {
        this.currentDisplayType = 'gif'; // 默认值
      }
      console.log('当前奖池显示类型:', this.currentDisplayType);
      
      // 检查奖品数量是否正确（确保是16个）
      if (!this.prizes || this.prizes.length !== this.prizeSlotCount) {
        console.error('奖池配置有误，奖品数量:', this.prizes ? this.prizes.length : 0, '应为', this.prizeSlotCount, '个');
        this.error = `奖池配置错误，奖品数量应为${this.prizeSlotCount}`;
        this.loading = false;
        return;
      }
      
      this.loading = false;
      
      // 加载动画配置
      this.loadAnimationSettings();
      
      // 加载颜色配置
      this.loadColorSettings();
      
      // 加载UI设置
      await this.loadUISettings();
      
      // 初始化UI资源状态
      await this.initUIResources();
      
      // 检测图片格式
      this.detectImageFormats();
      
      // 添加键盘监听
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
      
      // 🎵 启动背景音乐
      this.startBackgroundMusic(this.backgroundMusicConfig);
      this.startIdleVoiceoverWatch();
      this.playVoiceoverSequence('welcome', { interrupt: true });
    } catch (error) {
      console.error('加载奖池失败', error);
      this.error = '加载奖池失败';
      this.loading = false;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.updateWindowSize();
      this.refreshLayout();
      
      // 窗口大小改变时重新计算位置和自适应
      window.addEventListener('resize', this.handleResize);
      
      // 🔥 延迟执行GIF优化，确保DOM完全渲染
      setTimeout(() => {
        this.optimizeGifRendering();
      }, 1000);
      
      // 启动背景星星粒子效果
      this.startBackgroundParticles();
      this.startLogoSparkles();
      this.startBannerMeteors();
      
      // 启动奖励框泛光效果
      this.startPrizeGlowEffect();
    });
  },
  beforeUnmount() {
    // 移除事件监听
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);
    
    // 清除所有定时器
    if (this.animationTimer) {
      if (this.animationMode === 'random') {
        cancelAnimationFrame(this.animationTimer);
      } else {
        clearTimeout(this.animationTimer);
      }
    }
    
    // 清除自动关闭定时器
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
    
    // 清除掉落动画
    this.clearFullScreenConfetti();
    
    // 清除背景粒子效果
    this.clearBackgroundParticles();
    this.clearLogoSparkles();
    this.clearBannerMeteors();
    
    // 清除奖励框泛光效果
    this.clearPrizeGlowEffect();
    
    // 停止蓄力音效
    if (this.powerUpSound) {
      this.powerUpSound.pause();
      this.powerUpSound = null;
    }
    
    // 停止背景音乐
    this.stopBackgroundMusic();
    this.stopIdleVoiceoverWatch();
    this.clearVoiceoverTimeouts();
    this.stopVoiceoverPlayback();
  },
  methods: {
    refreshLayout() {
      this.updateWindowSize();
      if (!this.layoutReady) {
        return;
      }
      this.calculatePositions();
    },

    applyStageConfig(config) {
      const stageConfig = this.utils?.getStageConfig ? this.utils.getStageConfig(config) : {
        designWidth: 1920,
        designHeight: 1080
      };

      this.designWidth = stageConfig.designWidth;
      this.designHeight = stageConfig.designHeight;
    },

    applyLayoutConfig(uiConfig) {
      const layoutConfig = resolveDrawLayoutConfig(uiConfig);

      this.prizeSlotCount = layoutConfig.slotCount;
      this.topRowCount = layoutConfig.topRowCount;
      this.rightColumnCount = layoutConfig.rightColumnCount;
      this.bottomRowCount = layoutConfig.bottomRowCount;
      this.leftColumnCount = layoutConfig.leftColumnCount;
      this.prizeIconSize = layoutConfig.prizeIconSize;
      this.bannerWidth = layoutConfig.bannerWidth;
      this.bannerHeight = layoutConfig.bannerHeight;
      this.logoMaxWidth = layoutConfig.logoMaxWidth;
      this.layoutHorizontalPadding = layoutConfig.layoutHorizontalPadding;
      this.layoutVerticalPadding = layoutConfig.layoutVerticalPadding;
      this.sideColumnInset = layoutConfig.sideColumnInset;
      this.topRowY = layoutConfig.topRowY;
      this.bottomRowY = layoutConfig.bottomRowY;
      this.leftColumnX = layoutConfig.leftColumnX;
      this.rightColumnX = layoutConfig.rightColumnX;
      this.sideColumnTopY = layoutConfig.sideColumnTopY;
      this.sideColumnBottomY = layoutConfig.sideColumnBottomY;
      this.bannerCenterX = layoutConfig.bannerCenterX;
      this.bannerCenterY = layoutConfig.bannerCenterY;

      if (this.layoutReady) {
        this.refreshLayout();
      }
    },

    normalizePrizeList(rawPrizes) {
      const prizes = Array.isArray(rawPrizes) ? rawPrizes : [];

      if (prizes.length === this.prizeSlotCount) {
        return prizes;
      }

      if (prizes.length === 12) {
        return DEFAULT_DRAW_PRIZE_LAYOUT.legacyOrderMap.map((sourceIndex, targetIndex) => {
          const sourcePrize = prizes[sourceIndex];
          if (!sourcePrize) {
            return this.createFallbackPrize(targetIndex);
          }

          return {
            ...sourcePrize,
            prize_id: `P${String(targetIndex + 1).padStart(2, '0')}`
          };
        });
      }

      const normalized = prizes.slice(0, this.prizeSlotCount).map((prize, index) => ({
        ...prize,
        prize_id: `P${String(index + 1).padStart(2, '0')}`
      }));

      while (normalized.length < this.prizeSlotCount) {
        normalized.push(this.createFallbackPrize(normalized.length));
      }

      return normalized;
    },

    createFallbackPrize(index) {
      return {
        prize_id: `P${String(index + 1).padStart(2, '0')}`,
        name: `奖励${index + 1}`,
        desc: '请配置奖励内容',
        weight: 1,
        img_url: ''
      };
    },

    getPrizeSide(index) {
      if (index < this.topRowCount) {
        return 'top';
      }

      if (index < this.topRowCount + this.rightColumnCount) {
        return 'right';
      }

      if (index < this.topRowCount + this.rightColumnCount + this.bottomRowCount) {
        return 'bottom';
      }

      return 'left';
    },

    getPrizeSideClass(index) {
      return `prize-${this.getPrizeSide(index)}`;
    },

    getDistributedPositions(start, end, count) {
      if (count <= 1) {
        return [(start + end) / 2];
      }

      const step = (end - start) / (count - 1);
      return Array.from({ length: count }, (_, index) => start + step * index);
    },

    // 添加返回方法
    goBack() {
      // 停止背景音乐
      this.stopBackgroundMusic();
      // 使用 Vue Router 跳转到首页
      this.$router.push('/home');
    },
    
    extractFileNameFromPath(filePath) {
      if (!filePath || typeof filePath !== 'string') {
        return '';
      }
      const normalizedPath = filePath.replace(/\\/g, '/');
      const segments = normalizedPath.split('/');
      return segments[segments.length - 1] || '';
    },

    normalizeBgMusicMode(mode) {
      return ['random', 'single', 'none'].includes(mode) ? mode : 'random';
    },

    dedupeAudioPaths(audioPaths) {
      return Array.from(new Set((Array.isArray(audioPaths) ? audioPaths : []).filter(Boolean)))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }));
    },

    extractBackgroundAudioPaths(source) {
      const audioPaths = [];
      const walkValue = (value) => {
        if (!value) {
          return;
        }
        if (typeof value === 'string') {
          const fileName = this.extractFileNameFromPath(value);
          if (fileName) {
            audioPaths.push(`assets/sounds/BJ/${fileName}`);
          }
          return;
        }
        if (Array.isArray(value)) {
          value.forEach(walkValue);
          return;
        }
        if (typeof value === 'object') {
          Object.values(value).forEach(walkValue);
        }
      };

      walkValue(source);
      return this.dedupeAudioPaths(audioPaths);
    },

    readBgMusicPlaylistFromStorage() {
      try {
        const storedPlaylist = JSON.parse(localStorage.getItem('bgMusicPlaylist') || '[]');
        return this.extractBackgroundAudioPaths(storedPlaylist);
      } catch (error) {
        console.warn('🎵 背景音乐本地清单解析失败，回退到配置清单:', error);
        return [];
      }
    },

    buildBackgroundMusicConfig(backgroundConfig = {}) {
      const storagePlaylist = this.readBgMusicPlaylistFromStorage();
      const configuredPlaylist = this.extractBackgroundAudioPaths(backgroundConfig.playlist || []);
      const playlist = this.dedupeAudioPaths(storagePlaylist.length > 0 ? storagePlaylist : configuredPlaylist);
      const selectedFromStorage = this.extractFileNameFromPath(localStorage.getItem('selectedBgMusic') || '');
      const selectedFromConfig = this.extractFileNameFromPath(backgroundConfig.selected || backgroundConfig.default || '');
      const selectedTrack = this.extractBackgroundAudioPaths([selectedFromStorage || selectedFromConfig])[0] || '';
      const defaultTrack = this.extractBackgroundAudioPaths([backgroundConfig.default])[0] || playlist[0] || selectedTrack;

      return {
        mode: this.normalizeBgMusicMode(localStorage.getItem('bgMusicMode') || backgroundConfig.mode),
        selected: selectedTrack,
        default: defaultTrack,
        playlist
      };
    },

    resolveBackgroundMusicVolume() {
      const storedVolume = Number.parseFloat(localStorage.getItem('bgVolume'));
      if (Number.isFinite(storedVolume)) {
        return Math.min(Math.max(storedVolume, 0), 1);
      }
      return 0.3;
    },

    clearBackgroundMusicInteractionListener() {
      if (!this.backgroundMusicInteractionHandler) {
        return;
      }
      document.removeEventListener('click', this.backgroundMusicInteractionHandler);
      document.removeEventListener('keydown', this.backgroundMusicInteractionHandler);
      document.removeEventListener('touchstart', this.backgroundMusicInteractionHandler);
      this.backgroundMusicInteractionHandler = null;
    },

    stopBackgroundMusic() {
      this.clearBackgroundMusicInteractionListener();
      if (!this.backgroundMusic) {
        this.currentBackgroundTrack = '';
        return;
      }
      this.backgroundMusic.pause();
      this.backgroundMusic.onended = null;
      this.backgroundMusic.src = '';
      this.backgroundMusic = null;
      this.currentBackgroundTrack = '';
    },

    queueBackgroundMusicResumeOnInteraction() {
      if (this.backgroundMusicInteractionHandler) {
        return;
      }

      this.backgroundMusicInteractionHandler = () => {
        if (!this.backgroundMusic) {
          this.clearBackgroundMusicInteractionListener();
          return;
        }

        this.backgroundMusic.play().then(() => {
          console.log('🎵 用户交互后背景音乐开始播放');
        }).catch((error) => {
          console.error('🎵 背景音乐恢复播放失败:', error);
        }).finally(() => {
          this.clearBackgroundMusicInteractionListener();
        });
      };

      document.addEventListener('click', this.backgroundMusicInteractionHandler);
      document.addEventListener('keydown', this.backgroundMusicInteractionHandler);
      document.addEventListener('touchstart', this.backgroundMusicInteractionHandler);
    },

    attemptPlayBackgroundMusic(trackPath) {
      if (!this.backgroundMusic) {
        return;
      }

      const playPromise = this.backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('🎵 背景音乐开始播放:', trackPath);
        }).catch((error) => {
          console.log('🎵 自动播放被阻止，需要用户交互后播放:', error);
          this.queueBackgroundMusicResumeOnInteraction();
        });
      }
    },

    playBackgroundTrack(trackPath, { loop = false, onEnded = null } = {}) {
      if (!trackPath) {
        return;
      }

      this.stopBackgroundMusic();

      const audio = new Audio(trackPath);
      audio.volume = this.resolveBackgroundMusicVolume();
      audio.loop = loop;
      if (typeof onEnded === 'function') {
        audio.onended = onEnded;
      }

      this.backgroundMusic = audio;
      this.currentBackgroundTrack = trackPath;
      this.attemptPlayBackgroundMusic(trackPath);
    },

    pickRandomBackgroundTrack(excludedTrack = '') {
      const playlist = Array.isArray(this.backgroundMusicConfig?.playlist) ? this.backgroundMusicConfig.playlist : [];
      if (playlist.length === 0) {
        return '';
      }
      if (playlist.length === 1) {
        return playlist[0];
      }

      const candidates = playlist.filter((track) => track !== excludedTrack);
      const source = candidates.length > 0 ? candidates : playlist;
      return source[Math.floor(Math.random() * source.length)];
    },

    playNextRandomBackgroundTrack(previousTrack = '') {
      const nextTrack = this.pickRandomBackgroundTrack(previousTrack || this.currentBackgroundTrack);
      if (!nextTrack) {
        console.log('🎵 随机背景音乐清单为空，跳过播放');
        return;
      }

      this.playBackgroundTrack(nextTrack, {
        loop: false,
        onEnded: () => {
          this.playNextRandomBackgroundTrack(nextTrack);
        }
      });
    },

    // 🎵 启动背景音乐
    startBackgroundMusic(backgroundConfig = null) {
      try {
        this.backgroundMusicConfig = this.buildBackgroundMusicConfig(backgroundConfig || this.backgroundMusicConfig || {});
        const { mode, selected, default: defaultTrack, playlist } = this.backgroundMusicConfig;

        if (mode === 'none') {
          console.log('🎵 背景音乐已关闭，跳过播放');
          this.stopBackgroundMusic();
          return;
        }

        if (mode === 'single') {
          const singleTrack = selected || defaultTrack || playlist[0] || '';
          if (!singleTrack) {
            console.log('🎵 单曲循环未找到可用背景音乐，跳过播放');
            this.stopBackgroundMusic();
            return;
          }

          console.log('🎵 单曲循环背景音乐:', singleTrack);
          this.playBackgroundTrack(singleTrack, { loop: true });
          return;
        }

        this.backgroundMusicConfig.playlist = this.dedupeAudioPaths(playlist.length > 0 ? playlist : [defaultTrack].filter(Boolean));
        if (this.backgroundMusicConfig.playlist.length === 0) {
          console.log('🎵 随机播放未找到可用背景音乐，跳过播放');
          this.stopBackgroundMusic();
          return;
        }

        console.log('🎵 随机背景音乐清单:', this.backgroundMusicConfig.playlist);
        this.playNextRandomBackgroundTrack();
      } catch (error) {
        console.error('🎵 背景音乐加载失败:', error);
      }
    },

    normalizeVoiceoverStrategy(strategy) {
      return strategy === 'fixed' ? 'fixed' : 'random';
    },

    normalizePositiveInteger(value, fallback) {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    },

    clampAudioVolume(value, fallback = 1) {
      const parsed = Number.parseFloat(value);
      if (!Number.isFinite(parsed)) {
        return fallback;
      }
      return Math.min(Math.max(parsed, 0), 1);
    },

    buildVoiceoverConfig(voiceoverConfig = {}) {
      return {
        enabled: voiceoverConfig?.enabled !== false,
        volume: this.clampAudioVolume(voiceoverConfig?.volume, 1),
        idleDelayMs: this.normalizePositiveInteger(voiceoverConfig?.idleDelayMs, 30000),
        nodes: voiceoverConfig && typeof voiceoverConfig.nodes === 'object' ? voiceoverConfig.nodes : {}
      };
    },

    getVoiceoverNode(nodeName) {
      return this.voiceoverConfig?.nodes?.[nodeName] || null;
    },

    getVoiceoverNodeClips(nodeName) {
      const clips = this.getVoiceoverNode(nodeName)?.clips;
      if (!Array.isArray(clips)) {
        return [];
      }
      return Array.from(new Set(clips.filter((clipPath) => typeof clipPath === 'string' && clipPath.trim())));
    },

    pickVoiceoverClips(nodeName) {
      const nodeConfig = this.getVoiceoverNode(nodeName);
      const clips = this.getVoiceoverNodeClips(nodeName);
      if (!nodeConfig || clips.length === 0) {
        return [];
      }

      if (this.normalizeVoiceoverStrategy(nodeConfig.strategy) === 'fixed') {
        return [clips[0]];
      }

      const minCount = Math.max(1, this.normalizePositiveInteger(nodeConfig.pickCount?.min, 1));
      const maxCount = Math.max(minCount, this.normalizePositiveInteger(nodeConfig.pickCount?.max, minCount));
      const targetCount = Math.min(clips.length, minCount + Math.floor(Math.random() * (maxCount - minCount + 1)));
      const pool = [...clips];
      const selected = [];
      const lastPlayed = this.lastVoiceoverPathMap[nodeName];

      if (lastPlayed && pool.length > 1) {
        const lastIndex = pool.indexOf(lastPlayed);
        if (lastIndex >= 0) {
          pool.splice(lastIndex, 1);
        }
      }

      while (selected.length < targetCount && pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        selected.push(pool[randomIndex]);
        pool.splice(randomIndex, 1);
      }

      return selected;
    },

    resolveVoiceoverVolume() {
      return this.clampAudioVolume(this.voiceoverConfig?.volume, 1);
    },

    stopVoiceoverPlayback({ clearPending = true } = {}) {
      this.voiceoverQueueToken += 1;
      if (clearPending) {
        this.queuedVoiceoverSequences = [];
      }
      this.isVoiceoverSequencePlaying = false;
      if (!this.activeVoiceoverAudio) {
        this.activeVoiceoverNode = '';
        return;
      }

      this.activeVoiceoverAudio.pause();
      this.activeVoiceoverAudio.onended = null;
      this.activeVoiceoverAudio.onerror = null;
      this.activeVoiceoverAudio.src = '';
      this.activeVoiceoverAudio = null;
      this.activeVoiceoverNode = '';
    },

    flushQueuedVoiceoverSequences() {
      this.queuedVoiceoverSequences = [];
    },

    playQueuedVoiceoverSequence() {
      if (this.isVoiceoverSequencePlaying || this.activeVoiceoverAudio) {
        return;
      }

      const nextSequence = this.queuedVoiceoverSequences.shift();
      if (!nextSequence) {
        this.activeVoiceoverNode = '';
        return;
      }

      const { nodeName, clipQueue } = nextSequence;
      this.isVoiceoverSequencePlaying = true;
      const queueToken = this.voiceoverQueueToken;

      const playNext = (index) => {
        if (queueToken !== this.voiceoverQueueToken) {
          this.isVoiceoverSequencePlaying = false;
          return;
        }

        if (index >= clipQueue.length) {
          this.activeVoiceoverAudio = null;
          this.activeVoiceoverNode = '';
          this.isVoiceoverSequencePlaying = false;
          this.playQueuedVoiceoverSequence();
          return;
        }

        const clipPath = clipQueue[index];
        const audio = new Audio(clipPath);
        audio.volume = this.resolveVoiceoverVolume();

        this.activeVoiceoverAudio = audio;
        this.activeVoiceoverNode = nodeName;
        this.lastVoiceoverPathMap = {
          ...this.lastVoiceoverPathMap,
          [nodeName]: clipPath
        };

        audio.onended = () => {
          playNext(index + 1);
        };
        audio.onerror = () => {
          console.warn('配音资源播放失败:', clipPath);
          playNext(index + 1);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('配音播放被阻止或失败:', clipPath, error);
            playNext(index + 1);
          });
        }
      };

      playNext(0);
    },

    playVoiceoverSequence(nodeName, { interrupt = false, clips = null, clearPending = false, replaceQueued = false } = {}) {
      if (this.voiceoverConfig?.enabled === false) {
        return;
      }

      const clipQueue = Array.isArray(clips) && clips.length > 0 ? clips : this.pickVoiceoverClips(nodeName);
      if (clipQueue.length === 0) {
        return;
      }

      if (interrupt) {
        this.stopVoiceoverPlayback({ clearPending: true });
      } else if (clearPending) {
        this.flushQueuedVoiceoverSequences();
      }

      if (replaceQueued) {
        this.queuedVoiceoverSequences = this.queuedVoiceoverSequences.filter((item) => item.nodeName !== nodeName);
      }

      this.queuedVoiceoverSequences.push({ nodeName, clipQueue });
      this.playQueuedVoiceoverSequence();
    },

    clearVoiceoverTimeouts() {
      this.voiceoverTimeouts.forEach((timer) => clearTimeout(timer));
      this.voiceoverTimeouts = [];
    },

    queueVoiceoverTimeout(callback, delayMs) {
      const normalizedDelay = Math.max(0, this.normalizePositiveInteger(delayMs, 0));
      const timer = setTimeout(() => {
        this.voiceoverTimeouts = this.voiceoverTimeouts.filter((item) => item !== timer);
        callback();
      }, normalizedDelay);
      this.voiceoverTimeouts.push(timer);
    },

    scheduleLotteryVoiceovers(totalDurationMs) {
      if (this.voiceoverConfig?.enabled === false) {
        return;
      }

      this.clearVoiceoverTimeouts();
      const countdownNode = this.getVoiceoverNode('countdown');
      const countdownLeadTime = this.normalizePositiveInteger(countdownNode?.leadTimeMs, 1800);
      const countdownAt = Math.max(0, totalDurationMs - countdownLeadTime);

      if (countdownAt >= 0 && this.getVoiceoverNodeClips('countdown').length > 0) {
        this.queueVoiceoverTimeout(() => {
          if (this.isSpinning) {
            this.playVoiceoverSequence('countdown', {
              interrupt: false,
              clearPending: true,
              replaceQueued: true
            });
          }
        }, countdownAt);
      }
    },

    getPrizeVoiceoverTier(prize) {
      if (!prize || typeof prize !== 'object') {
        return 'regular';
      }

      const voiceoverTier = typeof prize.voiceoverTier === 'string' ? prize.voiceoverTier.toLowerCase() : '';
      if (voiceoverTier) {
        return voiceoverTier;
      }

      if (this.isJackpotPrize(prize)) {
        return 'jackpot';
      }

      const effectTier = typeof prize.effectTier === 'string' ? prize.effectTier.toLowerCase() : '';
      const rarity = typeof prize.rarity === 'string' ? prize.rarity.toLowerCase() : '';
      if (effectTier === 'rare' || rarity === 'rare' || prize.isRare === true) {
        return 'rare';
      }

      return 'regular';
    },

    resolveWinVoiceoverNode(prize) {
      const customNode = typeof prize?.voiceoverNode === 'string' ? prize.voiceoverNode.trim() : '';
      if (customNode && this.getVoiceoverNodeClips(customNode).length > 0) {
        return customNode;
      }

      const tier = this.getPrizeVoiceoverTier(prize);
      if (tier === 'jackpot') {
        return 'jackpotWin';
      }
      if (tier === 'rare') {
        return 'rareWin';
      }
      return 'regularWin';
    },

    resetIdleVoiceoverTimer() {
      if (this.idleVoiceoverTimer) {
        clearTimeout(this.idleVoiceoverTimer);
        this.idleVoiceoverTimer = null;
      }

      if (this.voiceoverConfig?.enabled === false) {
        return;
      }

      const idleDelayMs = this.normalizePositiveInteger(this.voiceoverConfig?.idleDelayMs, 30000);
      if (idleDelayMs <= 0) {
        return;
      }

      this.idleVoiceoverTimer = setTimeout(() => {
        if (!this.isSpinning && !this.showModal && !this.loading) {
          this.playVoiceoverSequence('idle', { interrupt: false });
        }
        this.resetIdleVoiceoverTimer();
      }, idleDelayMs);
    },

    startIdleVoiceoverWatch() {
      if (this.voiceoverActivityHandler) {
        return;
      }

      this.voiceoverActivityHandler = () => {
        this.resetIdleVoiceoverTimer();
      };

      ['click', 'keydown', 'touchstart', 'mousemove'].forEach((eventName) => {
        window.addEventListener(eventName, this.voiceoverActivityHandler, { passive: true });
      });

      this.resetIdleVoiceoverTimer();
    },

    stopIdleVoiceoverWatch() {
      if (this.idleVoiceoverTimer) {
        clearTimeout(this.idleVoiceoverTimer);
        this.idleVoiceoverTimer = null;
      }

      if (!this.voiceoverActivityHandler) {
        return;
      }

      ['click', 'keydown', 'touchstart', 'mousemove'].forEach((eventName) => {
        window.removeEventListener(eventName, this.voiceoverActivityHandler);
      });

      this.voiceoverActivityHandler = null;
    },
    
    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    
    getLayoutFrame() {
      return {
        leftX: this.leftColumnX,
        rightX: this.rightColumnX,
        topY: this.topRowY,
        bottomY: this.bottomRowY,
        sideTopY: this.sideColumnTopY,
        sideBottomY: this.sideColumnBottomY
      };
    },

    buildPrizePositions(frame) {
      const positions = [];
      const topRowPositions = this.getDistributedPositions(frame.leftX, frame.rightX, this.topRowCount);
      const bottomRowPositions = this.getDistributedPositions(frame.leftX, frame.rightX, this.bottomRowCount);
      const rightColumnPositions = this.getDistributedPositions(frame.sideTopY, frame.sideBottomY, this.rightColumnCount);
      const leftColumnPositions = this.getDistributedPositions(frame.sideTopY, frame.sideBottomY, this.leftColumnCount);

      topRowPositions.forEach((x) => {
        positions.push({ x, y: frame.topY, side: 'top' });
      });

      rightColumnPositions.forEach((y) => {
        positions.push({ x: frame.rightX, y, side: 'right' });
      });

      [...bottomRowPositions].reverse().forEach((x) => {
        positions.push({ x, y: frame.bottomY, side: 'bottom' });
      });

      [...leftColumnPositions].reverse().forEach((y) => {
        positions.push({ x: frame.leftX, y, side: 'left' });
      });

      return positions;
    },

    // 计算矩形边界上各点的位置
    calculatePositions() {
      this.calculateScaleRatio();
      const frame = this.getLayoutFrame();
      this.positions = this.buildPrizePositions(frame);

      console.log('固定比例奖品位置计算完成:', {
        frame,
        positions: this.positions,
        scaleRatio: this.scaleRatio
      });
    },

    // 计算缩放比例 - 基于背景图比例
    calculateScaleRatio() {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // 背景图的标准比例 (16:9)
      const backgroundRatio = this.designWidth / this.designHeight; // 1920/1080 = 16:9
      const windowRatio = windowWidth / windowHeight;
      
      // 根据窗口比例和背景图比例计算缩放
      if (windowRatio > backgroundRatio) {
        // 窗口比背景图更宽，以高度为准
        this.scaleRatio = windowHeight / this.designHeight;
      } else {
        // 窗口比背景图更窄，以宽度为准
        this.scaleRatio = windowWidth / this.designWidth;
      }
      
      console.log('基于背景图比例的缩放计算:', {
        windowSize: `${windowWidth}x${windowHeight}`,
        windowRatio: windowRatio.toFixed(3),
        backgroundSize: `${this.designWidth}x${this.designHeight}`,
        backgroundRatio: backgroundRatio.toFixed(3),
        finalScale: this.scaleRatio.toFixed(3)
      });
    },
    
    // 固定比例相关方法
    updateWindowSize() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    },
    
    handleResize() {
      this.refreshLayout();
      
      // 如果弹窗正在显示，更新其缩放
      if (this.showModal) {
        this.$nextTick(() => {
          this.applyModalScaling();
        });
      }
    },
    
    // 获取容器样式（固定比例）
    getContainerStyle() {
      return {
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden'
      };
    },
    
    // 获取奖品区域样式（固定比例）
    getPrizeAreaStyle() {
      return {
        width: `${this.designWidth}px`,
        height: `${this.designHeight}px`,
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(${this.scaleRatio})`,
        transformOrigin: 'center center'
      };
    },

    getWinnerModalShellStyle() {
      const { maxWidth, maxHeight } = this.modalConfig;
      return {
        width: `${maxWidth}px`,
        height: `${maxHeight}px`,
        transform: `scale(${this.scaleRatio || 1})`,
        transformOrigin: 'center center'
      };
    },

    // 获取奖品ICON的样式（固定比例）
    getPrizeItemStyle(index) {
        if (!this.positions[index]) return {};
        const pos = this.positions[index];
        return {
            width: `${this.prizeIconSize}px`,
            height: `${this.prizeIconSize}px`,
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: 'translate(-50%, -50%)',
            position: 'absolute'
        };
    },

    // 获取中心Banner的样式（固定比例）
    getBannerStyle() {
      return {
        width: `${this.bannerWidth}px`,
        height: `${this.bannerHeight}px`,
        left: `${this.bannerCenterX * this.designWidth}px`,
        top: `${this.bannerCenterY * this.designHeight}px`,
        transform: 'translate(-50%, -50%)',
        position: 'absolute'
      };
    },
    
    // 获取LOGO的样式（响应式）
    getLogoStyle() {
      return {
        'width': `${this.logoMaxWidth}%`,
        'max-width': 'none',
        'transform': 'translate(-50%, -50%) translateY(5px)' // 保持居中并向下移动5px
      };
    },
    
    // 新增：获取LOGO图片URL
    getLogoImageUrl() {
      if (this.store?.UI_RESOURCES?.currentLogo) {
        return this.store.UI_RESOURCES.currentLogo;
      }
      
      return 'assets/logo1.gif';
    },
    
    // 新增：获取Banner图片URL
    getBannerImageUrl() {
      if (this.store?.UI_RESOURCES?.currentBanner) {
        return this.store.UI_RESOURCES.currentBanner;
      }
      
      return 'assets/BABNNER.png';
    },
    
    // 获取奖品图片URL
    getPrizeImageUrl(prize) {
      if (!prize || !prize.img_url) return '';
      
      // 如果是远程图片，直接返回完整URL
      if (prize.img_url.startsWith('http')) {
        return prize.img_url;
      }
      
      // 如果是本地图片，返回相对路径
      return prize.img_url;
    },
    
    // 修改：获取奖品媒体URL（使用配置文件中的图片）
    getPrizeMediaUrl(index) {
      if (!this.prizes || !this.prizes[index]) return '';
      return this.getPrizeImageUrl(this.prizes[index]);
    },
    
    // 新增：检测是否为视频文件
    isVideoFile(index) {
      const url = this.getPrizeMediaUrl(index);
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
      return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    },
    
    // 键盘按下事件
    handleKeyDown(event) {
      if ((event.key === 'k' || event.key === 'K') && !this.isSpinning && !this.loading && !this.isPoweringUp) {
        this.startPowerUp(event);
      }
    },
    
    // 键盘释放事件
    handleKeyUp(event) {
      if (event.key === 'k' || event.key === 'K') {
        if (this.isPoweringUp) {
          this.endPowerUp();
        }
      }
    },
    
    // 开始蓄力
    startPowerUp(event) {
      if (this.isSpinning || this.loading) return;
      
      this.isPoweringUp = true;
      this.powerUpProgress = 0;
      this.powerUpStartTime = Date.now();
      
      // 播放蓄力音效
      if (!this.powerUpSound) {
        this.powerUpSound = new Audio('assets/sounds/xuli.mp3');
        // 从localStorage读取旋转音效音量设置，默认50%（蓄力音效使用旋转音效的音量）
        const loopVolume = localStorage.getItem('loopVolume') ? parseFloat(localStorage.getItem('loopVolume')) : 0.5;
        this.powerUpSound.volume = loopVolume;
        this.powerUpSound.loop = true;
      }
      this.powerUpSound.currentTime = 0;
      this.powerUpSound.play();
      
      // 使用 requestAnimationFrame 更新进度条
      const updateProgress = () => {
        const elapsed = Date.now() - this.powerUpStartTime;
        this.powerUpProgress = Math.min(elapsed / this.maxPowerUpTime * 100, 100);
        
        if (this.isPoweringUp) {
          if (this.powerUpProgress < 100) {
            requestAnimationFrame(updateProgress);
          } else {
            // 达到最大蓄力，自动释放
            this.endPowerUp();
          }
        }
      };
      
      requestAnimationFrame(updateProgress);
      
      // 防止触摸事件的默认行为（如滚动）
      if (event.type && event.type.startsWith('touch')) {
        event.preventDefault();
      }
    },
    
    // 结束蓄力并开始抽奖
    endPowerUp() {
      if (!this.isPoweringUp) return;
      
      // 停止蓄力音效
      if (this.powerUpSound) {
        this.powerUpSound.pause();
      }
      
      const powerUpSeconds = (Date.now() - this.powerUpStartTime) / 1000;
      this.isPoweringUp = false;
      
      // 开始抽奖，传入蓄力时间
      this.startLottery(powerUpSeconds);
    },
    
    // 开始抽奖
    startLottery(powerUpSeconds = 0.1) {
      if (this.isSpinning || this.loading || this.isDrawingLocked) {
        console.log('抽奖被锁定：', {
          isSpinning: this.isSpinning,
          loading: this.loading,
          isDrawingLocked: this.isDrawingLocked
        });
        return;
      }
      
      this.isSpinning = true;
      this.animationComplete = false;
      this.highlightedIndex = -1;
      this.winnerIndex = -1;
      this.isPoweringUp = false;
      this.isMysteryRound = false;
      this.isMysteryPrizeShown = false;
      this.realPrize = null;
      this.multiHighlightIndices = [];
      this.resetIdleVoiceoverTimer();
      this.clearVoiceoverTimeouts();
      this.playVoiceoverSequence('start', { interrupt: true });
      
      // 获取上一次抽奖的奖品名称
      const lastPrizeName = this.getLastPrizeName();
      console.log('上一次抽到的奖品：', lastPrizeName || '无');
      
      // 过滤掉上一次抽到的奖品
      const availablePrizes = this.prizes.filter((prize, index) => {
        if (lastPrizeName && prize.name === lastPrizeName) {
          console.log(`排除上一次的奖品：${prize.name} (索引: ${index})`);
          return false;
        }
        return true;
      });
      
      if (availablePrizes.length === 0) {
        console.log('所有奖品都被排除，重置排除规则');
        // 如果所有奖品都被排除，则重置排除规则
        this.resetLastPrizeExclusion();
        return this.startLottery(powerUpSeconds);
      }
      
      console.log(`本轮可用奖品数量：${availablePrizes.length}/${this.prizes.length}`);
      
      // 生成随机数并立即打印
      const random = Math.random();
      console.log('\n🎲 抽奖随机数：', random.toFixed(6));
      
      // 计算可用奖品的权重总和
      const totalWeight = availablePrizes.reduce((sum, prize) => sum + (parseFloat(prize.weight) || 1), 0);
      console.log('可用奖品总权重：', totalWeight);
      
      // 显示每个可用奖品的概率区间
      console.log('\n📊 可用奖品概率区间：');
      let currentSum = 0;
      availablePrizes.forEach((prize, index) => {
        const weight = parseFloat(prize.weight) || 1;
        const start = currentSum / totalWeight;
        currentSum += weight;
        const end = currentSum / totalWeight;
        console.log(`${prize.name}：${start.toFixed(6)} - ${end.toFixed(6)}`);
      });
      
      // 根据权重随机选择奖品
      let weightSum = 0;
      let selectedPrizeIndex = 0;
      
      for (let i = 0; i < availablePrizes.length; i++) {
        const currentWeight = parseFloat(availablePrizes[i].weight) || 1;
        weightSum += currentWeight;
        
        if (random <= weightSum / totalWeight && selectedPrizeIndex === 0) {
          selectedPrizeIndex = i;
          console.log(`\n🎯 命中奖品：${availablePrizes[i].name}`);
          break;
        }
      }
      
      // 找到选中奖品在原始奖品数组中的索引
      const selectedPrize = availablePrizes[selectedPrizeIndex];
      const originalIndex = this.prizes.findIndex(prize => prize.name === selectedPrize.name);
      
      // 保存所选奖品
      this.selectedPrize = selectedPrize;
      this.winnerIndex = originalIndex;
      
      console.log('========================\n');
      
      // 检查是否是神秘奖励 - 支持多种属性名
      if (this.selectedPrize.type === 'mystery' || this.selectedPrize.isMystery === true) {
        console.log('这是神秘奖励！');
        this.isMysteryRound = true;
        this.isMysteryPrizeShown = true;
      }
      
      // 使用默认的跑火车动画
      this.runClassicAnimation(originalIndex, powerUpSeconds);
    },
    
    // 获取上一次抽奖的奖品名称
    getLastPrizeName() {
      const storeName = localStorage.getItem('storeName') || '未知店铺';
      const groupId = this.store.lastGroupId;
      
      // 从本地日志中查找该店铺该奖池的最后一次抽奖记录
      const localLogs = this.store.lotteryLog || [];
      const lastLog = localLogs
        .filter(log => log.storeName === storeName && log.groupId === groupId)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      if (lastLog && lastLog.prize) {
        return lastLog.prize.name;
      }
      
      return null;
    },
    
    // 重置上一次奖品排除规则
    resetLastPrizeExclusion() {
      console.log('重置上一次奖品排除规则');
      // 这里可以添加重置逻辑，比如清除相关的缓存或标记
    },
    
    // 随机动画 - 直接跳到获奖位置
    runRandomAnimation(winIndex, powerUpSeconds = 0.1) {
      const powerRatio = Math.min(powerUpSeconds / (this.maxPowerUpTime / 1000), 1);
      const baseDuration = 1000;
      const additionalDuration = Math.floor(powerRatio * 1000);
      const totalDuration = baseDuration + additionalDuration;
      const minimumHighlightVisibleMs = Math.max(90, this.minimumHighlightVisibleMs || 0);
      this.scheduleLotteryVoiceovers(totalDuration);
      
      const flashRounds = this.isMysteryRound && this.realPrize 
        ? Math.floor(Math.random() * (this.mysteryMaxRounds - this.mysteryMinRounds + 1)) + this.mysteryMinRounds
        : 0;
      
      const phasePlan = [
        { percent: 0.12, speed: 220 },
        { percent: 0.18, speed: 140 },
        { percent: 0.35, speed: 70 },
        { percent: 0.20, speed: 120 },
        { percent: 0.15, speed: 220 },
      ];
      
      if (this.isMysteryRound && this.realPrize) {
        phasePlan.forEach(phase => {
          phase.speed = Math.max(minimumHighlightVisibleMs, Math.round(phase.speed * 1.15));
        });
      }
      
      let currentIndex = this.lastStoppedIndex >= 0 ? this.lastStoppedIndex : -1;
      const startTime = Date.now();
      let lastSwitchTime = startTime;
      let currentRound = 0;
      
      const tickSoundPath = this.isMysteryRound && this.realPrize 
        ? '4.mp3'
        : localStorage.getItem('selectedLoopSound') || '1.mp3';
      
      const tickSound = new Audio('assets/sounds/loop/' + tickSoundPath);
      const loopVolume = localStorage.getItem('loopVolume') ? parseFloat(localStorage.getItem('loopVolume')) : 0.5;
      tickSound.volume = loopVolume;
      
      const animateRandom = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        
        let totalPercent = 0;
        let speed = phasePlan[0].speed;
        for (let i = 0; i < phasePlan.length; i++) {
          totalPercent += phasePlan[i].percent;
          if (elapsed / totalDuration <= totalPercent) {
            speed = phasePlan[i].speed;
            break;
          }
        }
        speed = Math.max(speed, minimumHighlightVisibleMs);
        const shouldKeepHighlightVisible = speed <= minimumHighlightVisibleMs + 20;
        
        if (now - lastSwitchTime >= speed) {
          if (!shouldKeepHighlightVisible) {
            this.resetAllStyles();
            this.highlightedIndex = -1;
            this.multiHighlightIndices = [];
          } else if (currentIndex >= 0) {
            this.queueHighlightRemoval(currentIndex, Math.max(90, Math.round((minimumHighlightVisibleMs + 80) * 0.75)));
          }
          
          if (elapsed >= totalDuration) {
            if (this.isMysteryRound && this.realPrize && currentRound < flashRounds) {
              currentRound++;
              lastSwitchTime = now;
              this.generateMultiHighlights(winIndex);
              tickSound.currentTime = 0;
              tickSound.play();
              this.animationTimer = requestAnimationFrame(animateRandom);
              return;
            }
            
            this.highlightedIndex = winIndex;
            this.applyHighlight(winIndex);
            this.animationComplete = true;
            this.logResult();
            
            this.animationTimer = setTimeout(() => {
              this.showWinnerModal();
              this.isSpinning = false;
            }, 1000);
            return;
          }
          
          if (this.isMysteryRound && this.realPrize) {
            this.generateMultiHighlights(winIndex);
            tickSound.currentTime = 0;
            tickSound.play();
          } else {
            let newIndex;
            do {
              newIndex = Math.floor(Math.random() * this.prizes.length);
            } while (newIndex === winIndex || newIndex === currentIndex);
            
            currentIndex = newIndex;
            this.highlightedIndex = newIndex;
            this.applyHighlight(newIndex);
            tickSound.currentTime = 0;
            tickSound.play();
          }
          
          lastSwitchTime = now;
        }
        
        this.animationTimer = requestAnimationFrame(animateRandom);
      };
      
      this.animationTimer = requestAnimationFrame(animateRandom);
    },
    // 生成多重高亮索引（不包括最终中奖项）
    generateMultiHighlights(excludeIndex) {
      // 清除现有高亮
      this.multiHighlightIndices = [];
      
      // 确定本轮高亮数量
      const count = Math.floor(Math.random() * (this.maxHighlightsPerRound - this.minHighlightsPerRound + 1)) + this.minHighlightsPerRound;
      
      // 可选的索引（排除中奖项）
      const availableIndices = Array.from({ length: this.prizes.length }, (_, i) => i).filter(i => i !== excludeIndex);
      
      // 随机选择指定数量的索引
      for (let i = 0; i < Math.min(count, availableIndices.length); i++) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        this.multiHighlightIndices.push(availableIndices[randomIndex]);
        availableIndices.splice(randomIndex, 1);
      }
      
      // 立即应用多重高亮样式
      this.multiHighlightIndices.forEach(index => {
        this.applyMultiHighlight(index);
      });
    },
    
    // 辅助方法：应用多重高亮
    applyMultiHighlight(index) {
      if (!this.$refs.prizeItems || !this.$refs.prizeItems[index]) return;
      
      const prizeItem = this.$refs.prizeItems[index];
      if (prizeItem) {
        // 随机选择一种高亮颜色
        const randomColor = this.highlightColors[Math.floor(Math.random() * this.highlightColors.length)];
        
        prizeItem.classList.add('multi-highlight');
        
        // 动态设置高亮颜色和效果（与applyHighlight类似但稍微不同）
        const prizeContent = prizeItem.querySelector('.prize-content');
        if (prizeContent) {
          // 设置背景色（更透明一些）
          prizeContent.style.backgroundColor = randomColor + '30';
          
          // 设置描边框（稍微细一些）
          prizeContent.style.border = `4px solid ${randomColor}`;
          
          // 设置发光效果（稍微弱一些）
          prizeContent.style.boxShadow = `
            0 0 15px 3px ${randomColor}70,
            0 0 30px 6px ${randomColor}50
          `;
        }
        
        // 整体滤镜效果（稍微弱一些）
        prizeItem.style.filter = `brightness(1.2) drop-shadow(0 0 15px ${randomColor})`;
        prizeItem.style.transform = 'translate(-50%, -50%) scale(1.05)';
        
        console.log(`应用多重高亮颜色: ${randomColor} 到索引 ${index}`);
      }
    },
    
    // 辅助方法：重置所有样式
    resetAllStyles() {
      this.clearHighlightCleanupTimers();
      if (!this.$refs.prizeItems) return;
      
      this.$refs.prizeItems.forEach(item => {
        // 移除CSS类
        item.classList.remove('highlight');
        item.classList.remove('multi-highlight');
        item.classList.remove('passed');
        item.classList.remove('winner');
        item.classList.remove('winner-regular');
        item.classList.remove('winner-jackpot');
        
        // 清除动态设置的样式
        const prizeContent = item.querySelector('.prize-content');
        if (prizeContent) {
          prizeContent.style.backgroundColor = '';
          prizeContent.style.border = '';
          prizeContent.style.boxShadow = '';
        }
        
        // 重置整体样式
        item.style.filter = '';
        item.style.transform = 'translate(-50%, -50%)';
      });
    },
    
    ensureHighlightCleanupTimers() {
      if (!this.highlightCleanupTimers || typeof this.highlightCleanupTimers !== 'object') {
        this.highlightCleanupTimers = Object.create(null);
      }
      return this.highlightCleanupTimers;
    },

    ensureHighlightStateMap() {
      if (!this.highlightStateMap || typeof this.highlightStateMap !== 'object') {
        this.highlightStateMap = Object.create(null);
      }
      return this.highlightStateMap;
    },

    captureHighlightState(index) {
      if (!this.$refs.prizeItems || !this.$refs.prizeItems[index]) return null;
      const prizeItem = this.$refs.prizeItems[index];
      const prizeContent = prizeItem.querySelector('.prize-content');
      return {
        filter: prizeItem.style.filter || '',
        transform: prizeItem.style.transform || 'translate(-50%, -50%)',
        backgroundColor: prizeContent ? prizeContent.style.backgroundColor || '' : '',
        border: prizeContent ? prizeContent.style.border || '' : '',
        boxShadow: prizeContent ? prizeContent.style.boxShadow || '' : ''
      };
    },

    restoreHighlightState(index, state) {
      if (!state || !this.$refs.prizeItems || !this.$refs.prizeItems[index]) return;
      const prizeItem = this.$refs.prizeItems[index];
      const prizeContent = prizeItem.querySelector('.prize-content');
      prizeItem.classList.add('highlight');
      prizeItem.style.filter = state.filter;
      prizeItem.style.transform = state.transform;
      if (prizeContent) {
        prizeContent.style.backgroundColor = state.backgroundColor;
        prizeContent.style.border = state.border;
        prizeContent.style.boxShadow = state.boxShadow;
      }
    },

    queueHighlightRemoval(index, delayMs = 0) {
      if (typeof index !== 'number' || index < 0) return;
      const normalizedDelay = Math.max(0, delayMs);
      const cleanupTimers = this.ensureHighlightCleanupTimers();
      const highlightStateMap = this.ensureHighlightStateMap();
      const highlightState = this.captureHighlightState(index);

      if (cleanupTimers[index]) {
        clearTimeout(cleanupTimers[index]);
      }

      if (highlightState) {
        highlightStateMap[index] = highlightState;
      }

      cleanupTimers[index] = setTimeout(() => {
        delete cleanupTimers[index];
        if (this.highlightedIndex !== index) {
          const latestState = highlightStateMap[index];
          this.removeHighlight(index, latestState);
        }
      }, normalizedDelay);
    },

    clearHighlightCleanupTimers() {
      const cleanupTimers = this.ensureHighlightCleanupTimers();
      Object.values(cleanupTimers).forEach(timer => clearTimeout(timer));
      this.highlightCleanupTimers = Object.create(null);
      this.highlightStateMap = Object.create(null);
    },

    // 应用高亮样式
    applyHighlight(index) {
      if (!this.$refs.prizeItems || !this.$refs.prizeItems[index]) return;
      
      const cleanupTimers = this.ensureHighlightCleanupTimers();
      const highlightStateMap = this.ensureHighlightStateMap();
      if (cleanupTimers[index]) {
        clearTimeout(cleanupTimers[index]);
        delete cleanupTimers[index];
      }
      if (highlightStateMap[index]) {
        delete highlightStateMap[index];
      }

      const prizeItem = this.$refs.prizeItems[index];
      if (prizeItem) {
        const randomColor = this.highlightColors[Math.floor(Math.random() * this.highlightColors.length)];
        
        prizeItem.classList.add('highlight');
        
        const prizeContent = prizeItem.querySelector('.prize-content');
        if (prizeContent) {
          prizeContent.style.backgroundColor = randomColor + '40';
          prizeContent.style.border = `6px solid ${randomColor}`;
          prizeContent.style.boxShadow = `
            0 0 20px 5px ${randomColor}90,
            0 0 35px 10px ${randomColor}70
          `;
        }
        
        prizeItem.style.filter = `brightness(1.3) drop-shadow(0 0 20px ${randomColor})`;
        prizeItem.style.transform = 'translate(-50%, -50%) scale(1.1)';
        this.runHighlightImpact(index, randomColor);
      }
    },
    
    // 移除高亮样式
    removeHighlight(index, preservedState = null) {
      const cleanupTimers = this.ensureHighlightCleanupTimers();
      const highlightStateMap = this.ensureHighlightStateMap();
      const finalState = preservedState || highlightStateMap[index] || null;
      if (cleanupTimers[index]) {
        clearTimeout(cleanupTimers[index]);
        delete cleanupTimers[index];
      }
      if (!this.$refs.prizeItems || !this.$refs.prizeItems[index]) {
        delete highlightStateMap[index];
        return;
      }
      
      const prizeItem = this.$refs.prizeItems[index];
      if (prizeItem) {
        if (finalState) {
          this.restoreHighlightState(index, finalState);
        }
        prizeItem.classList.remove('highlight');
        delete highlightStateMap[index];
        
        const prizeContent = prizeItem.querySelector('.prize-content');
        if (prizeContent) {
          prizeContent.style.backgroundColor = '';
          prizeContent.style.border = '';
          prizeContent.style.boxShadow = '';
        }
        
        prizeItem.style.filter = '';
        prizeItem.style.transform = 'translate(-50%, -50%)';
      }
    },
    
    // 随机闪烁+聚焦缩放动画 - 保留但不使用
    runFlashAnimation(winIndex) {
      // 保留代码但不再使用
    },
    
    // 记录中奖日志
    async logResult() {
      // 只在最终奖励确定后记录日志
      if (this.isMysteryRound && !this.realPrize) {
        // 如果是神秘奖励的第一轮，不记录日志
        return;
      }
      
      const storeName = localStorage.getItem('storeName') || '未知店铺'; // 获取店名
      const logEntry = {
        timestamp: Date.now(),
        storeName: storeName, // 添加店名
        groupId: this.store.lastGroupId,
        prize: this.selectedPrize,
        isMystery: this.isMysteryRound || (this.realPrize !== null)
      };
      
      // 更新本地日志
      this.store.lotteryLog.push(logEntry);
      
      // 限制本地存储的日志数量，只保留最近100条
      if (this.store.lotteryLog.length > 100) {
        this.store.lotteryLog = this.store.lotteryLog.slice(-100);
      }
      
      // 尝试存储到本地，添加错误处理
      try {
        localStorage.setItem('lotteryLog', JSON.stringify(this.store.lotteryLog));
      } catch (error) {
        console.warn('本地存储lotteryLog失败，可能是存储配额不足:', error);
        // 进一步减少日志数量
        if (this.store.lotteryLog.length > 50) {
          this.store.lotteryLog = this.store.lotteryLog.slice(-50);
          try {
            localStorage.setItem('lotteryLog', JSON.stringify(this.store.lotteryLog));
          } catch (e) {
            console.warn('即使减少到50条记录，存储仍然失败:', e);
            // 清空本地存储
            try {
              localStorage.removeItem('lotteryLog');
            } catch (err) {
              console.error('清除本地存储失败:', err);
            }
          }
        }
      }
      
    },
    
    // 创建粒子效果
    createConfetti() {
      const container = this.$refs.confetti;
      if (!container) return;
      
      // 清除现有的粒子
      container.innerHTML = '';
      
      // 创建更多的粒子
      for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        // 随机大小
        const size = Math.random() * 20 + 10;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size * 3}px`;
        
        // 随机位置和延迟
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDelay = `${Math.random() * 3}s`;
        confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
        
        // 随机旋转
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        container.appendChild(confetti);
      }
    },

    getGsap() {
      if (typeof window !== 'undefined' && window.gsap) {
        return window.gsap;
      }
      return null;
    },

    isJackpotPrize(prize) {
      if (!prize || typeof prize !== 'object') {
        return false;
      }

      if (prize.isJackpot === true) {
        return true;
      }

      const effectTier = typeof prize.effectTier === 'string' ? prize.effectTier.toLowerCase() : '';
      const rarity = typeof prize.rarity === 'string' ? prize.rarity.toLowerCase() : '';
      const voiceoverTier = typeof prize.voiceoverTier === 'string' ? prize.voiceoverTier.toLowerCase() : '';
      if (effectTier === 'jackpot' || effectTier === 'grand' || rarity === 'legendary' || rarity === 'jackpot' || voiceoverTier === 'jackpot') {
        return true;
      }
      return false;
    },

    clearHitParticles() {
      this.hitParticleTimers.forEach((timer) => clearTimeout(timer));
      this.hitParticleTimers = [];

      const particles = document.querySelectorAll('.hit-burst-particle');
      particles.forEach((particle) => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    },

    createHitBurst(index, color) {
      if (!this.$refs.prizeItems || !this.$refs.prizeItems[index]) return;

      const prizeItem = this.$refs.prizeItems[index];
      const burstCount = 16;
      const burstColor = color || this.highlightColors[Math.floor(Math.random() * this.highlightColors.length)];
      const itemWidth = prizeItem.offsetWidth || this.prizeIconSize || 220;
      const itemHeight = prizeItem.offsetHeight || this.prizeIconSize || 220;
      const edgeInset = 8;
      const halfWidth = Math.max(20, itemWidth / 2 - edgeInset);
      const halfHeight = Math.max(20, itemHeight / 2 - edgeInset);

      for (let i = 0; i < burstCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'hit-burst-particle';
        particle.style.background = burstColor;

        const angleJitter = (Math.random() - 0.5) * 0.32;
        const angle = (Math.PI * 2 * i) / burstCount + angleJitter;
        const travelDistance = 68 + Math.random() * 54;
        const edgeAngle = Math.atan2(Math.sin(angle) * halfHeight, Math.cos(angle) * halfWidth);
        const startX = Math.cos(edgeAngle) * halfWidth;
        const startY = Math.sin(edgeAngle) * halfHeight;
        const burstX = startX + Math.cos(angle) * travelDistance;
        const burstY = startY + Math.sin(angle) * travelDistance;
        const particleSize = 6 + Math.random() * 7;
        const particleOpacity = 0.45 + Math.random() * 0.45;
        const particleDuration = 1.4 + Math.random() * 1.4;
        const particleDelay = Math.random() * 0.12;
        const particleRotation = -40 + Math.random() * 80;

        particle.style.setProperty('--burst-x', `${burstX}px`);
        particle.style.setProperty('--burst-y', `${burstY}px`);
        particle.style.setProperty('--burst-rotate', `${particleRotation}deg`);
        particle.style.setProperty('--burst-opacity', `${particleOpacity}`);
        particle.style.left = `calc(50% + ${startX}px)`;
        particle.style.top = `calc(50% + ${startY}px)`;
        particle.style.width = `${particleSize}px`;
        particle.style.height = `${particleSize}px`;
        particle.style.animationDuration = `${particleDuration}s`;
        particle.style.animationDelay = `${particleDelay}s`;

        prizeItem.appendChild(particle);

        const removeTimer = setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, Math.ceil((particleDuration + particleDelay + 0.12) * 1000));
        this.hitParticleTimers.push(removeTimer);
      }
    },

    runHighlightImpact(index, color) {
      if (!this.$refs.prizeItems || !this.$refs.prizeItems[index]) return;

      const prizeItem = this.$refs.prizeItems[index];
      const gsap = this.getGsap();

      this.createHitBurst(index, color);

      if (gsap) {
        gsap.killTweensOf(prizeItem);
        gsap.fromTo(
          prizeItem,
          { scale: 1, rotation: 0 },
          {
            scale: 1.12,
            rotation: 1.2,
            duration: 0.12,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            onUpdate: () => {
              const scale = Number(prizeItem._gsap?.scale ?? 1);
              const rotation = Number(prizeItem._gsap?.rotation ?? 0);
              prizeItem.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
            },
            onComplete: () => {
              if (!prizeItem.classList.contains('winner')) {
                prizeItem.style.transform = 'translate(-50%, -50%)';
              }
            }
          }
        );
      }
    },

    playRegularWinEffect(index) {
      if (!this.$refs.prizeItems || !this.$refs.prizeItems[index]) return;

      const prizeItem = this.$refs.prizeItems[index];
      const gsap = this.getGsap();

      prizeItem.classList.add('winner', 'winner-regular');
      prizeItem.classList.remove('winner-jackpot');

      if (!gsap) {
        prizeItem.style.transform = 'translate(-50%, -50%) scale(1.08)';
        return;
      }

      if (this.activeWinnerTween) {
        this.activeWinnerTween.kill();
      }

      this.activeWinnerTween = gsap.timeline();
      this.activeWinnerTween
        .set(prizeItem, { rotation: 0 })
        .to(prizeItem, {
          scale: 1.08,
          rotation: -1.5,
          duration: 0.18,
          ease: 'back.out(2.2)',
          onUpdate: () => {
            const scale = Number(prizeItem._gsap?.scale ?? 1.08);
            const rotation = Number(prizeItem._gsap?.rotation ?? 0);
            prizeItem.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
          }
        })
        .to(prizeItem, {
          scale: 1.03,
          rotation: 1,
          duration: 0.22,
          ease: 'sine.inOut',
          repeat: 2,
          yoyo: true,
          onUpdate: () => {
            const scale = Number(prizeItem._gsap?.scale ?? 1.03);
            const rotation = Number(prizeItem._gsap?.rotation ?? 0);
            prizeItem.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
          }
        });
    },

    playJackpotScreenEffect() {
      const container = document.querySelector('.lottery-container');
      const gsap = this.getGsap();
      if (!container) return;

      container.classList.add('jackpot-screen-active');

      if (!gsap) {
        return;
      }

      if (this.activeJackpotTween) {
        this.activeJackpotTween.kill();
      }

      this.activeJackpotTween = gsap.timeline();
      this.activeJackpotTween
        .fromTo(
          container,
          { filter: 'brightness(1) saturate(1)' },
          {
            filter: 'brightness(1.18) saturate(1.28)',
            duration: 0.18,
            ease: 'power2.out'
          }
        )
        .to(container, {
          filter: 'brightness(1.05) saturate(1.1)',
          duration: 0.45,
          ease: 'sine.out'
        });
    },

    playWinEntranceEffects(prize) {
      const isJackpot = this.isJackpotPrize(prize);

      if (typeof this.winnerIndex === 'number' && this.winnerIndex >= 0) {
        this.playRegularWinEffect(this.winnerIndex);
        if (isJackpot && this.$refs.prizeItems && this.$refs.prizeItems[this.winnerIndex]) {
          const winnerItem = this.$refs.prizeItems[this.winnerIndex];
          winnerItem.classList.remove('winner-regular');
          winnerItem.classList.add('winner-jackpot');
        }
      }

      if (isJackpot) {
        this.playJackpotScreenEffect();
      }

      return isJackpot;
    },

    animateWinnerModalEntrance(isJackpot = false) {
      const gsap = this.getGsap();
      const modal = this.$refs.winnerModal;
      if (!gsap || !modal) {
        return;
      }

      const image = modal.querySelector('.winner-image');
      const title = modal.querySelector('.winner-title');
      const startScale = isJackpot ? 0.82 : 0.9;

      gsap.killTweensOf([modal, image, title]);
      gsap.fromTo(
        modal,
        { scale: startScale, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: isJackpot ? 0.5 : 0.32, ease: 'back.out(1.8)' }
      );

      if (image) {
        gsap.fromTo(
          image,
          { scale: isJackpot ? 0.86 : 0.92, rotate: isJackpot ? -4 : -2 },
          {
            scale: 1,
            rotate: 0,
            duration: isJackpot ? 0.55 : 0.35,
            ease: 'power2.out'
          }
        );
      }

      if (title) {
        gsap.fromTo(
          title,
          { opacity: 0, y: -18 },
          { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', delay: 0.05 }
        );
      }
    },

    getPrintablePrizeImageUrls(prize) {
      const targetPrize = prize || this.selectedPrize;
      if (!targetPrize) return [];
      const prizeId = typeof targetPrize.prize_id === 'string' ? targetPrize.prize_id.trim().toUpperCase() : '';

      return [
        prizeId ? `assets/print/${prizeId}.png` : ''
      ].filter(Boolean);
    },

    escapeTicketHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    loadPrintableImageCandidate(imageUrl) {
      return new Promise((resolve, reject) => {
        if (!imageUrl) {
          reject(new Error('Empty image URL'));
          return;
        }

        const image = new Image();
        const cleanup = () => {
          image.onload = null;
          image.onerror = null;
        };
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error(`Ticket image load timeout: ${imageUrl}`));
        }, 5000);

        image.onload = () => {
          clearTimeout(timer);
          cleanup();
          resolve(imageUrl);
        };
        image.onerror = () => {
          clearTimeout(timer);
          cleanup();
          reject(new Error(`Ticket image load failed: ${imageUrl}`));
        };
        image.src = imageUrl;
      });
    },

    async resolveWebPrintableImageUrl(imageUrls) {
      for (const imageUrl of imageUrls) {
        try {
          return await this.loadPrintableImageCandidate(imageUrl);
        } catch (error) {}
      }
      return '';
    },

    buildWebTicketHtml(imageUrl, prizeName) {
      const safeImageUrl = this.escapeTicketHtml(imageUrl);
      const safePrizeName = this.escapeTicketHtml(prizeName || 'PRIZE');
      const imageMarkup = safeImageUrl
        ? `<img class="ticket-full-image" src="${safeImageUrl}" alt="${safePrizeName}">`
        : `<div class="ticket-image-placeholder">${safePrizeName}</div>`;

      return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: 55mm 260mm;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 55mm;
      height: 260mm;
      margin: 0;
      padding: 0;
      background: #fff;
    }

    .ticket {
      width: 55mm;
      height: 260mm;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .ticket-full-image {
      display: block;
      width: 55mm;
      height: 260mm;
      object-fit: contain;
      transform: translateX(9.17mm);
    }

    .ticket-image-placeholder {
      width: 45mm;
      min-height: 38mm;
      border: 0.4mm dashed #252018;
      border-radius: 2mm;
      color: #191611;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3mm;
      font-family: Arial, "Microsoft YaHei", "PingFang SC", sans-serif;
      font-size: 4.2mm;
      font-weight: 800;
      line-height: 1.25;
      text-align: center;
    }
  </style>
</head>
<body>
  <main class="ticket">${imageMarkup}</main>
</body>
</html>`;
    },

    async printPrizeTicketInWeb(prize) {
      const imageUrls = this.getPrintablePrizeImageUrls(prize);
      const imageUrl = await this.resolveWebPrintableImageUrl(imageUrls);
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '1px';
      printFrame.style.height = '1px';
      printFrame.style.border = '0';
      printFrame.style.opacity = '0';
      printFrame.setAttribute('aria-hidden', 'true');
      printFrame.srcdoc = this.buildWebTicketHtml(imageUrl, prize?.name || '');

      document.body.appendChild(printFrame);

      const cleanup = () => {
        if (printFrame.parentNode) {
          printFrame.parentNode.removeChild(printFrame);
        }
      };

      printFrame.onload = () => {
        setTimeout(() => {
          const printWindow = printFrame.contentWindow;
          if (!printWindow) {
            cleanup();
            return;
          }

          printWindow.addEventListener('afterprint', cleanup, { once: true });
          printWindow.focus();
          printWindow.print();
          setTimeout(cleanup, 30000);
        }, 120);
      };
    },

    printPrizeTicket(prize) {
      const printer = typeof window !== 'undefined' ? window.lotteryPrinter : null;
      if (!prize) {
        return;
      }

      if (!printer || typeof printer.printPrizeTicket !== 'function') {
        this.printPrizeTicketInWeb(prize).catch((error) => {
          console.warn('Web prize ticket print failed:', error);
        });
        return;
      }

      printer.printPrizeTicket({
        topText: 'YOYO BULGOGI',
        prizeId: prize.prize_id || '',
        prizeName: prize.name || '',
        imageUrls: this.getPrintablePrizeImageUrls(prize)
      }).catch((error) => {
        console.warn('Prize ticket print failed:', error);
      });
    },
    
    // 修改显示弹窗的方法
    showWinnerModal() {
      // 检查是否需要进行神秘奖励的第二轮抽奖
      if (this.isMysteryRound && !this.realPrize) {
        console.log('神秘奖励第一轮结束，不显示弹窗，准备二次抽奖');
        // 已经抽到神秘奖励，直接开始第二轮抽奖，不显示神秘奖励弹窗
        this.startMysterySecondRound();
        return;
      }
      
      // 确定最终要显示的奖品
      let finalPrize = this.selectedPrize;
      
      // 如果是神秘奖励的第二轮，使用真实奖品
      if (this.isMysteryRound && this.realPrize) {
        console.log('神秘奖励第二轮结束，显示真实奖品:', this.realPrize);
        finalPrize = this.realPrize;
      }
      this.clearVoiceoverTimeouts();
      this.resetIdleVoiceoverTimer();
      
      // 先播放中奖音效 - 确保在显示弹窗前就开始播放
      const rewardSoundPath = this.isMysteryRound && this.realPrize 
        ? '1.mp3'  // 神秘奖励的第二轮使用1.mp3
        : localStorage.getItem('selectedRewardSound') || '1.mp3'; // 默认音效
      
      console.log('播放奖励音效:', rewardSoundPath);
      
      const rewardSound = new Audio(`assets/sounds/reward/${rewardSoundPath}`);
      // 从localStorage读取中奖音效音量设置，默认70%
      const rewardVolume = localStorage.getItem('rewardVolume') ? parseFloat(localStorage.getItem('rewardVolume')) : 0.7;
      rewardSound.volume = rewardVolume;
      rewardSound.play().catch(error => {
        console.error('播放奖励音效失败:', error);
      });
      this.playVoiceoverSequence(this.resolveWinVoiceoverNode(finalPrize), {
        interrupt: false,
        clearPending: true,
        replaceQueued: true
      });
      
      // 显示弹窗并锁定抽奖
      this.showModal = true;
      this.isDrawingLocked = true; // 锁定抽奖
      this.printPrizeTicket(finalPrize);
      const isJackpotWin = this.playWinEntranceEffects(finalPrize);
      this.$nextTick(() => {
        // 延迟应用缩放，等待CSS动画完成
        setTimeout(() => {
        this.applyModalScaling();
        }, 50); // 等待CSS动画开始后再应用JS缩放
        this.animateWinnerModalEntrance(isJackpotWin);
        
        // 启动所有绚丽特效
        this.startSpectacularEffects();
        
        // 创建全屏掉落动画
        if (isJackpotWin) {
          this.createFullScreenConfetti();
        } else {
          this.createConfetti();
        }
        
        // 显示奖品信息
        const modalMedia = document.querySelector('.prize-modal-media');
        const modalPrizeName = document.querySelector('.prize-modal h3');
        const modalPrizeDesc = document.querySelector('.prize-modal p');
        
        if (modalMedia) {
          if (this.isModalVideoFile()) {
            modalMedia.src = this.getModalMediaUrlSync();
          } else {
            modalMedia.src = this.getModalMediaUrlSync();
          }
        }
        
        if (modalPrizeName) {
          modalPrizeName.textContent = finalPrize.name || '未知奖品';
        }
        
        if (modalPrizeDesc) {
          modalPrizeDesc.textContent = finalPrize.desc || '恭喜获奖！';
        }
        
        // 记录到今日中奖列表
        const winnerItem = {
          time: Date.now(),
          prize: finalPrize
        };
        
        // 获取现有记录
        let todayWinners = JSON.parse(localStorage.getItem('todayWinners') || '[]');
        
        // 过滤出今天的记录
        const today = new Date().toDateString();
        todayWinners = todayWinners.filter(item => {
          if (!item.time) return false;
          const itemDate = new Date(item.time).toDateString();
          return itemDate === today;
        });
        
        // 添加新记录
        todayWinners.push(winnerItem);
        
        // 限制本地存储的记录数量，只保留最近50条
        if (todayWinners.length > 50) {
          todayWinners = todayWinners.slice(-50);
        }
        
        // 尝试存储到本地，添加错误处理
        try {
          localStorage.setItem('todayWinners', JSON.stringify(todayWinners));
        } catch (error) {
          console.warn('本地存储todayWinners失败，可能是存储配额不足:', error);
          // 进一步减少记录数量
          if (todayWinners.length > 20) {
            todayWinners = todayWinners.slice(-20);
            try {
              localStorage.setItem('todayWinners', JSON.stringify(todayWinners));
            } catch (e) {
              console.warn('即使减少到20条记录，存储仍然失败:', e);
              // 清空本地存储
              try {
                localStorage.removeItem('todayWinners');
              } catch (err) {
                console.error('清除本地存储失败:', err);
              }
            }
          }
        }
        
        // 开始倒计时自动关闭 - 恢复3秒自动关闭
        this.startAutoCloseCountdown();
      });
    },
    
    // 开始倒计时自动关闭 - 恢复3秒自动关闭
    startAutoCloseCountdown() {
      this.autoCloseCountdown = this.modalSettings.autoCloseCountdown; // 使用配置的倒计时时间
      
      this.countdownTimer = setInterval(() => {
        this.autoCloseCountdown--;
        
        if (this.autoCloseCountdown <= 0) {
          this.closeModal();
        }
      }, 1000);
    },
    
    // 关闭弹窗
    closeModal() {
      // 清除倒计时定时器
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
      
      // 清除自动关闭定时器
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = null;
      }
      
      // 播放按钮音效
      const buttonSound = new Audio('assets/sounds/button.mp3');
      // 从localStorage读取旋转音效音量设置，默认50%（按钮音效使用旋转音效的音量）
      const loopVolume = localStorage.getItem('loopVolume') ? parseFloat(localStorage.getItem('loopVolume')) : 0.5;
      buttonSound.volume = loopVolume;
      buttonSound.play().catch(() => {}); // 忽略音效播放错误
      
      // 清理所有绚丽特效
      this.clearSpectacularEffects();
      
      this.showModal = false;
      this.isDrawingLocked = false; // 解除抽奖锁定
      this.autoCloseCountdown = this.modalSettings.autoCloseCountdown; // 重置倒计时为配置的时间
      this.resetIdleVoiceoverTimer();
      
      // 保存当前中奖位置为下次起点
      this.lastStoppedIndex = this.winnerIndex;
      
      // 清除掉落动画
      this.clearFullScreenConfetti();
      this.clearHitParticles();

      if (this.activeWinnerTween) {
        this.activeWinnerTween.kill();
        this.activeWinnerTween = null;
      }

      if (this.activeJackpotTween) {
        this.activeJackpotTween.kill();
        this.activeJackpotTween = null;
      }

      const container = document.querySelector('.lottery-container');
      if (container) {
        container.classList.remove('jackpot-screen-active');
        container.style.filter = '';
      }
    },
    
    // 创建全屏掉落动画
    createFullScreenConfetti() {
      // 清除之前的动画
      this.clearFullScreenConfetti();
      
      // 创建全屏容器
      const container = document.createElement('div');
      container.className = 'confetti-container';
      container.id = 'fullscreen-confetti';
      document.body.appendChild(container);
      
      // 创建100个掉落物品
      for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        // 随机位置
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-20px';
        
        // 随机延迟开始
        confetti.style.animationDelay = Math.random() * 3 + 's';
        
        // 随机动画持续时间
        confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
        
        container.appendChild(confetti);
      }
      
      // 持续创建新的掉落物品
      this.confettiInterval = setInterval(() => {
        if (this.showModal) {
          for (let i = 0; i < 10; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-20px';
            confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
            container.appendChild(confetti);
            
            // 3秒后移除这个元素
            setTimeout(() => {
              if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
              }
            }, 5000);
          }
        }
      }, 500);
    },

    // 清除全屏掉落动画
    clearFullScreenConfetti() {
      const container = document.getElementById('fullscreen-confetti');
      if (container) {
        document.body.removeChild(container);
      }
      
      if (this.confettiInterval) {
        clearInterval(this.confettiInterval);
        this.confettiInterval = null;
      }
    },

    // 应用弹窗缩放 - 真正的等比例缩放
    applyModalScaling() {
      const modal = this.$refs.winnerModal;
      if (!modal) return;

      // 使用弹窗配置
      const { imageSize } = this.modalConfig;
      
      // 设置图片尺寸
      const image = modal.querySelector('.winner-image');
      if (image) {
        image.style.width = `${imageSize}px`;
        image.style.height = `${imageSize}px`;
      }

      console.log(`弹窗等比例缩放: ${(this.scaleRatio || 1).toFixed(3)} (与主舞台统一缩放)`);
    },
    
    // 生成闪电路径
    generatePath(currentIdx, prevIdx) {
      if (!this.$refs.prizeItems || !this.$refs.prizeItems[currentIdx]) {
        return 'M0,0';
      }

      const currentItem = this.$refs.prizeItems[currentIdx];
      const currentRect = currentItem.getBoundingClientRect();
      const containerRect = this.$refs.prizeList.getBoundingClientRect();

      // 获取当前项的中心点
      const currentX = currentRect.left + currentRect.width / 2 - containerRect.left;
      const currentY = currentRect.top + currentRect.height / 2 - containerRect.top;

      // 如果是第一个点，直接从中心开始
      if (prevIdx === null) {
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        return this.generateLightningPath(centerX, centerY, currentX, currentY);
      }

      // 获取前一个点的位置
      const prevItem = this.$refs.prizeItems[prevIdx];
      const prevRect = prevItem.getBoundingClientRect();
      const prevX = prevRect.left + prevRect.width / 2 - containerRect.left;
      const prevY = prevRect.top + prevRect.height / 2 - containerRect.top;

      return this.generateLightningPath(prevX, prevY, currentX, currentY);
    },

    // 生成带有随机偏移的闪电路径
    generateLightningPath(startX, startY, endX, endY) {
      const points = [];
      points.push(`M${startX},${startY}`);

      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const segments = Math.floor(distance / 50); // 每50像素一个分段

      for (let i = 1; i < segments; i++) {
        const ratio = i / segments;
        const baseX = startX + dx * ratio;
        const baseY = startY + dy * ratio;
        
        // 添加随机偏移
        const offset = Math.random() * 20 - 10;
        const perpX = -dy / distance * offset;
        const perpY = dx / distance * offset;
        
        points.push(`L${baseX + perpX},${baseY + perpY}`);
      }

      points.push(`L${endX},${endY}`);
      return points.join(' ');
    },
    
    // 开始神秘奖励的第二轮抽奖
    async startMysterySecondRound() {
      console.log('开始神秘奖励二次抽奖流程...');
      
      try {
        // 获取配置
        const config = await this.utils.getRewardConfig();
        const soundConfig = config.ui_config.sounds;
        
        // 播放神秘大奖开始音效
        if (soundConfig?.mystery_round?.start) {
          const startSound = new Audio(soundConfig.mystery_round.start);
          startSound.play();
          
          // 等待开始音效播放完毕
          await new Promise(resolve => {
            startSound.onended = resolve;
          });
        }
      } catch (error) {
        console.warn('加载神秘大奖音效配置失败:', error);
      }
      
      // 过滤掉神秘奖励，确保第二轮不会再抽到神秘奖励
      const filteredPrizes = this.prizes.filter(prize => 
        !(prize.isMystery === true || prize.type === 'mystery')
      );
      
      console.log('可选非神秘奖励数量:', filteredPrizes.length);
      
      if (filteredPrizes.length === 0) {
        // 如果没有其他奖品，直接结束
        console.log('没有非神秘奖励可选，结束抽奖');
        this.isSpinning = false;
        this.isMysteryRound = false;
        return;
      }
      
      // 计算非神秘奖励的总权重
      const totalWeight = filteredPrizes.reduce((sum, prize) => sum + (parseInt(prize.weight) || 1), 0);
      
      // 根据权重随机选择真正的奖品
      let random = Math.random() * totalWeight;
      let weightSum = 0;
      let realPrize = null;
      let realIndex = -1;
      
      for (let i = 0; i < filteredPrizes.length; i++) {
        weightSum += (parseInt(filteredPrizes[i].weight) || 1);
        if (random <= weightSum) {
          realPrize = filteredPrizes[i];
          // 找到真实奖品在原始列表中的索引
          realIndex = this.prizes.findIndex(p => 
            p.name === realPrize.name && 
            p.desc === realPrize.desc
          );
          break;
        }
      }
      
      console.log('选中的真实奖励:', realPrize);
      console.log('真实奖励索引:', realIndex);
      
      // 设置真实奖品
      this.selectedPrize = realPrize;
      this.winnerIndex = realIndex;
      this.realPrize = realPrize;
      
      // 开始第二轮抽奖（使用随机动画模式，从当前索引开始）
      this.lastStoppedIndex = this.highlightedIndex;  // 从当前高亮位置开始
      this.isSpinning = true;
      this.animationComplete = false;
      this.highlightedIndex = -1;
      
      // 第二轮使用随机动画模式
      this.runRandomAnimation(realIndex, 1); // 第二轮默认给1秒的动画时间
    },
    
    // 加载动画配置
    // 加载UI设置
    async loadUISettings() {
      try {
        // 从localStorage加载粒子强度设置
        const savedParticleIntensity = localStorage.getItem('particleIntensity');
        
        // 根据粒子强度更新粒子数量配置
        if (savedParticleIntensity) {
          this.updateParticleCountByIntensity(savedParticleIntensity);
          console.log('已加载粒子强度设置:', savedParticleIntensity, '粒子配置:', this.modalSettings.particleCount);
        }
        
        // 从localStorage加载奖励显示类型设置，覆盖奖池配置中的设置
        const savedRewardDisplayType = localStorage.getItem('rewardDisplayType');
        if (savedRewardDisplayType) {
          this.currentDisplayType = savedRewardDisplayType;
          console.log('已从全局设置加载奖励显示类型:', savedRewardDisplayType);
        }
        
        const uiConfig = await this.utils.getUIConfig();
        if (uiConfig.modalSettings) {
          // 只更新autoCloseCountdown，不覆盖已经根据强度设置的粒子数量
          if (uiConfig.modalSettings.autoCloseCountdown) {
            this.modalSettings.autoCloseCountdown = uiConfig.modalSettings.autoCloseCountdown;
            this.autoCloseCountdown = this.modalSettings.autoCloseCountdown;
          }
        }
      } catch (error) {
        console.warn('加载UI设置失败，使用默认设置', error);
      }
    },

    // 根据粒子强度更新粒子数量配置
    updateParticleCountByIntensity(intensity) {
      const intensityMap = {
        'none': {
          particleRain: 0,
          particleExplosion: 0,
          twinklingStars: 0,
          imageSparkles: 0,
          backgroundParticles: 0
        },
        'minimal': {
          particleRain: 50,
          particleExplosion: 20,
          twinklingStars: 10,
          imageSparkles: 5,
          backgroundParticles: 5
        },
        'very-low': {
          particleRain: 100,
          particleExplosion: 40,
          twinklingStars: 20,
          imageSparkles: 10,
          backgroundParticles: 10
        },
        'low': {
          particleRain: 200,
          particleExplosion: 60,
          twinklingStars: 30,
          imageSparkles: 15,
          backgroundParticles: 15
        },
        'medium': {
          particleRain: 300,
          particleExplosion: 100,
          twinklingStars: 50,
          imageSparkles: 30,
          backgroundParticles: 20
        },
        'high': {
          particleRain: 500,
          particleExplosion: 150,
          twinklingStars: 80,
          imageSparkles: 50,
          backgroundParticles: 30
        },
        'ultra': {
          particleRain: 800,
          particleExplosion: 200,
          twinklingStars: 120,
          imageSparkles: 80,
          backgroundParticles: 50
        }
      };
      
      if (intensityMap[intensity]) {
        this.modalSettings.particleCount = { ...intensityMap[intensity] };
      }
    },

    // 初始化UI资源状态
    async initUIResources() {
      if (!this.store.UI_RESOURCES) {
        this.store.UI_RESOURCES = { currentLogo: '', currentBanner: '' };
      }
    },

    loadAnimationSettings() {
      const savedMysterySpeed = localStorage.getItem('mysterySpeed');
      if (savedMysterySpeed) {
        this.mysterySpeed = parseInt(savedMysterySpeed);
      }
      
      // 获取动画模式
      const savedAnimationMode = localStorage.getItem('selectedAnimationMode');
      if (savedAnimationMode && ['train', 'random'].includes(savedAnimationMode)) {
        this.animationMode = savedAnimationMode;
      }
    },

    // 加载颜色设置
    loadColorSettings() {
      try {
        // 从localStorage加载颜色配置
        const savedColorScheme = localStorage.getItem('colorScheme');
        const savedPrimaryColors = localStorage.getItem('primaryColors');
        const savedSecondaryColors = localStorage.getItem('secondaryColors');
        
        let primaryColors = [
          '#ffd74d', // 金黄色 (默认)
          '#ec9351', // 橙色 (默认)
          '#eb7250', // 橙红色 (默认)
          '#ffcac0'  // 粉橙色 (默认)
        ];
        
        let secondaryColors = [
          '#FF6B35', // 暖橙色-活力橙 (默认)
          '#F7931E', // 金橙色-阳光橙 (默认)
          '#FFD23F', // 明黄色-柠檬黄 (默认)
          '#FF4757'  // 暖红色-珊瑚红 (默认)
        ];
        
        // 解析保存的颜色
        if (savedPrimaryColors) {
          primaryColors = JSON.parse(savedPrimaryColors);
        }
        if (savedSecondaryColors) {
          secondaryColors = JSON.parse(savedSecondaryColors);
        }
        
        // 根据颜色方案设置高亮颜色
        if (savedColorScheme === '8colors') {
          this.highlightColors = [...primaryColors, ...secondaryColors];
        } else {
          this.highlightColors = primaryColors;
        }
        
        console.log('颜色设置已加载:', {
          scheme: savedColorScheme || '4colors',
          colors: this.highlightColors
        });
      } catch (error) {
        console.error('加载颜色设置失败:', error);
        // 如果加载失败，使用默认颜色
        this.highlightColors = [
          '#ffd74d', // 金黄色
          '#ec9351', // 橙色
          '#eb7250', // 橙红色
          '#ffcac0'  // 粉橙色
        ];
      }
    },
    
    // 经典转盘加速-减速动画 (围绕矩形跑火车)
    runClassicAnimation(winIndex, powerUpSeconds = 0.1) {
      // 手动控制普通转盘圈数：想多转/少转，直接改这里
      const manualRounds = 3;
      // 手动控制经过格子的基础速度：数值越大越慢，越小越快
      const baseStepMs = 140;

      // 1. 以上次停留位置为起点
      let currentIndex = this.lastStoppedIndex >= 0 ? this.lastStoppedIndex : 0;
      let stepCount = 0;

      // 2. 总步数 = 手动圈数 * 每圈格子数 + 对齐中奖格子的偏移步数
      const offsetSteps = (winIndex - currentIndex + this.prizeSlotCount) % this.prizeSlotCount;
      const totalSteps = manualRounds * this.prizeSlotCount + offsetSteps;

      console.log('开始经典动画，总步数:', totalSteps, '目标位置:', winIndex, '手动圈数:', manualRounds);

      // 3. 阶段比例
      const phasePlan = [
        { percent: 0.10, speed: 0 },
        { percent: 0.20, speed: 0 },
        { percent: 0.50, speed: 0 },
        { percent: 0.10, speed: 0 },
        { percent: 0.11, speed: 0 }
      ];
      // 4. 计算每阶段步数
      const phaseSteps = [];
      let remain = totalSteps;
      for (let i = 0; i < phasePlan.length; i++) {
        const steps = i === phasePlan.length - 1
          ? remain
          : Math.round(totalSteps * phasePlan[i].percent);
        phaseSteps.push(steps);
        remain -= steps;
      }

      // 5. 阶段速度权重：数值越大越慢，越小越快
      const phaseSpeedWeights = [1.7, 0.95, 0.65, 1.3, 2.4];
      phasePlan.forEach((phase, index) => {
        phase.speed = Math.max(60, Math.round(baseStepMs * phaseSpeedWeights[index]));
      });

      const estimatedDurationMs = phaseSteps.reduce((sum, steps, index) => sum + steps * phasePlan[index].speed, 0);
      this.scheduleLotteryVoiceovers(estimatedDurationMs);

      let phase = 0;
      let phaseStep = 0;

      // 创建音频对象
      const tickSoundPath = localStorage.getItem('selectedLoopSound') || '1.mp3';
      const tickSound = new Audio('assets/sounds/loop/' + tickSoundPath);
      const loopVolume = localStorage.getItem('loopVolume') ? parseFloat(localStorage.getItem('loopVolume')) : 0.5;
      tickSound.volume = loopVolume;

      this.resetAllStyles();
      this.highlightedIndex = currentIndex;
      this.applyHighlight(currentIndex);

      const finishAnimation = () => {
        this.animationComplete = true;
        this.logResult();
        this.lastStoppedIndex = currentIndex;

        if (this.isMysteryRound && this.isMysteryPrizeShown) {
          this.handleMysteryWin();
        } else {
          this.showWinnerModal();
          this.isSpinning = false;
        }
      };

      const rotateWheel = () => {
        this.queueHighlightRemoval(currentIndex, Math.max(105, Math.round((this.minimumHighlightVisibleMs + 120) * 0.75)));
        currentIndex = (currentIndex + 1) % this.prizeSlotCount;
        this.highlightedIndex = currentIndex;
        this.applyHighlight(currentIndex);

        tickSound.currentTime = 0;
        tickSound.play();

        stepCount++;
        phaseStep++;

        if (phase < phasePlan.length - 1 && phaseStep >= phaseSteps[phase]) {
          phase++;
          phaseStep = 0;
        }

        if (stepCount >= totalSteps) {
          finishAnimation();
          return;
        }

        const nextDelayMs = phasePlan[phase].speed;

        this.animationTimer = setTimeout(rotateWheel, nextDelayMs);
      };

      this.animationTimer = setTimeout(rotateWheel, 0);
    },
    
    // 处理神秘奖励中奖后的逻辑
    handleMysteryWin() {
      // 记录神秘奖励结果到控制台
      console.log('神秘奖励中奖: ', this.selectedPrize);
      console.log('开始神秘奖励二次抽奖...');
      
      // 直接调用已有的二次抽奖逻辑
      this.startMysterySecondRound();
    },
    
    // 多重奖励模式下的匀速动画
    async runMysteryAnimation(winIndex) {
      // 从上次停留的位置开始
      let currentIndex = this.lastStoppedIndex >= 0 ? this.lastStoppedIndex : 0;
      let stepCount = 0;
      
      // 固定3圈加上到达目标位置的步数
      const rounds = 3;
      const totalSteps = rounds * this.prizeSlotCount + ((winIndex - currentIndex + this.prizeSlotCount) % this.prizeSlotCount);
      
      console.log('开始神秘奖励动画，总步数:', totalSteps, '目标位置:', winIndex);
      
      // 匀速动画 - 使用固定的时间间隔
      const speed = localStorage.getItem('mysterySpeed') ? parseInt(localStorage.getItem('mysterySpeed')) : 150; // 使用设置的速度
      
      // 获取音效配置
      let loopSound = null;
      let loopVolume = localStorage.getItem('loopVolume') ? parseFloat(localStorage.getItem('loopVolume')) : 0.5;
      
      try {
        const config = await this.utils.getRewardConfig();
        const soundConfig = config.ui_config.sounds;
        
        // 使用配置的神秘大奖循环音效
        if (soundConfig?.mystery_round?.loop) {
          loopSound = new Audio(soundConfig.mystery_round.loop);
        } else {
          // 使用默认音效
          loopSound = new Audio('assets/sounds/loop/4.mp3');
        }
        
        loopSound.loop = true;
        loopSound.volume = loopVolume;
        loopSound.play();
      } catch (error) {
        console.warn('加载神秘大奖音效配置失败，使用默认音效:', error);
        // 使用默认音效
        loopSound = new Audio('assets/sounds/loop/4.mp3');
        loopSound.loop = true;
        loopSound.volume = loopVolume;
        loopSound.play();
      }
      
      this.resetAllStyles();
      this.applyMultiHighlight(currentIndex);
      
      const rotateWheel = () => {
        this.removeHighlight(currentIndex);
        // 环形播放，按顺时针方向
        currentIndex = (currentIndex + 1) % this.prizeSlotCount;
        this.highlightedIndex = currentIndex;
        this.applyMultiHighlight(currentIndex);
        
        // 播放音效
        if (loopSound) {
          loopSound.currentTime = 0;
        }
        
        stepCount++;
        
        if (stepCount >= totalSteps) {
          this.animationComplete = true;
          this.logResult();
          this.animationTimer = setTimeout(() => {
            // 设置中奖索引
            this.winnerIndex = winIndex;
            
            // 停止循环音效
            if (loopSound) {
              loopSound.pause();
              loopSound.currentTime = 0;
            }
            
            // 播放奖励音效
            this.utils.getRewardConfig().then(config => {
              const soundConfig = config.ui_config.sounds;
            const rewardVolume = localStorage.getItem('rewardVolume') ? parseFloat(localStorage.getItem('rewardVolume')) : 0.7;
              
              let rewardSound;
              if (soundConfig?.mystery_round?.win) {
                rewardSound = new Audio(soundConfig.mystery_round.win);
              } else {
                rewardSound = new Audio('assets/sounds/reward/1.mp3');
              }
              
            rewardSound.volume = rewardVolume;
            rewardSound.play();
            }).catch(error => {
              console.warn('加载神秘大奖中奖音效配置失败，使用默认音效:', error);
              const rewardVolume = localStorage.getItem('rewardVolume') ? parseFloat(localStorage.getItem('rewardVolume')) : 0.7;
              const rewardSound = new Audio('assets/sounds/reward/1.mp3');
              rewardSound.volume = rewardVolume;
              rewardSound.play();
            });
            
            // 显示奖励
            this.showWinnerModal();
            this.isSpinning = false;
          }, 1000);
          return;
        }
        
        this.animationTimer = setTimeout(rotateWheel, speed);
      };
      
      this.animationTimer = setTimeout(rotateWheel, 300);
    },
    
    // 新增：获取弹窗中的媒体URL（根据配置决定优先级）
    async getModalMediaUrl() {
      if (!this.selectedPrize) return '';
      
      // 如果是神秘奖励的第二轮，使用真实奖品
      const targetPrize = (this.isMysteryRound && this.realPrize) ? this.realPrize : this.selectedPrize;
      
      // 获取当前奖池的显示设置
      const displayType = this.currentDisplayType || 'gif';
      
      // 根据显示设置决定使用哪种资源
      if (displayType === 'gif_only') {
        // 仅使用GIF
      if (targetPrize.gif_url) {
        return targetPrize.gif_url;
      }
        return ''; // 无GIF时不显示
      } else if (displayType === 'png_only') {
        // 仅使用PNG
        if (targetPrize.png_url) {
          return targetPrize.png_url;
        }
        return ''; // 无PNG时不显示
      } else if (displayType === 'png') {
        // 优先PNG，备用GIF
        if (targetPrize.png_url) {
          return targetPrize.png_url;
        }
        if (targetPrize.gif_url) {
          return targetPrize.gif_url;
        }
      } else {
        // 默认：优先GIF，备用PNG
        if (targetPrize.gif_url) {
          return targetPrize.gif_url;
        }
        if (targetPrize.png_url) {
          return targetPrize.png_url;
        }
      }
      
      // 如果都没有配置URL，使用本地文件
      const prizeIndex = this.prizes.findIndex(p => p === targetPrize);
      if (prizeIndex !== -1) {
        const baseFileName = 'P' + (prizeIndex + 1).toString().padStart(2, '0');
        
        if (displayType === 'gif_only') {
        const gifUrl = `assets/showward/${baseFileName}.gif`;
        const gifExists = await this.checkImageExists(gifUrl);
          return gifExists ? gifUrl : '';
        } else if (displayType === 'png_only') {
          return `assets/showward/${baseFileName}.png`;
        } else if (displayType === 'png') {
          // 优先PNG
          const pngUrl = `assets/showward/${baseFileName}.png`;
          const pngExists = await this.checkImageExists(pngUrl);
          if (pngExists) {
            console.log('弹窗使用PNG格式:', pngUrl);
            return pngUrl;
          }
          // 备用GIF
          const gifUrl = `assets/showward/${baseFileName}.gif`;
          const gifExists = await this.checkImageExists(gifUrl);
        if (gifExists) {
          console.log('弹窗使用GIF格式:', gifUrl);
          return gifUrl;
        }
        } else {
          // 默认：优先GIF
          const gifUrl = `assets/showward/${baseFileName}.gif`;
          const gifExists = await this.checkImageExists(gifUrl);
          if (gifExists) {
            console.log('弹窗使用GIF格式:', gifUrl);
            return gifUrl;
          }
          // 备用PNG
        const pngUrl = `assets/showward/${baseFileName}.png`;
        console.log('弹窗使用PNG格式:', pngUrl);
        return pngUrl;
        }
      }
      
      // 如果找不到索引，使用传统方法
      return this.getPrizeImageUrl(targetPrize);
    },

    // 同步版本的getModalMediaUrl，用于模板中的直接调用
    getModalMediaUrlSync() {
      if (!this.selectedPrize) return '';
      
      // 如果是神秘奖励的第二轮，使用真实奖品
      const targetPrize = (this.isMysteryRound && this.realPrize) ? this.realPrize : this.selectedPrize;
      
      // 获取当前奖池的显示设置
      const displayType = this.currentDisplayType || 'gif';
      
      // 优先使用配置中的URL，带降级保护
      if (displayType === 'png_only') {
        // 仅使用PNG：只尝试PNG，不降级
        if (targetPrize.png_url) return targetPrize.png_url;
      } else if (displayType === 'png') {
        // 优先PNG：先尝试PNG，失败时降级到GIF
        if (targetPrize.png_url) return targetPrize.png_url;
        if (targetPrize.gif_url) return targetPrize.gif_url;
      } else {
        // 默认或优先GIF：先尝试GIF，失败时降级到PNG
        if (targetPrize.gif_url) return targetPrize.gif_url;
        if (targetPrize.png_url) return targetPrize.png_url;
      }
      
      // 如果没有配置URL，使用本地文件（带降级保护）
      const prizeIndex = this.prizes.findIndex(p => p === targetPrize);
      if (prizeIndex !== -1) {
        const baseFileName = 'P' + (prizeIndex + 1).toString().padStart(2, '0');
        
        if (displayType === 'png_only') {
          // 仅PNG：只返回PNG路径
          return `assets/showward/${baseFileName}.png`;
        } else if (displayType === 'png') {
          // 优先PNG：先尝试PNG路径，但在实际加载失败时会通过@error事件降级
          return `assets/showward/${baseFileName}.png`;
        } else {
          // 默认或优先GIF：先尝试GIF路径，但在实际加载失败时会通过@error事件降级
          return `assets/showward/${baseFileName}.gif`;
        }
      }
      
      // 如果找不到索引，使用传统方法
      return this.getPrizeImageUrl(targetPrize);
    },
    
    // 新增：检测弹窗中是否为视频文件
    isModalVideoFile(prize = null) {
      const targetPrize = prize || this.selectedPrize;
      if (!targetPrize || !targetPrize.img_url) return false;
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
      return videoExtensions.some(ext => targetPrize.img_url.toLowerCase().endsWith(ext));
    },
    
    // UI 资源固定使用 PNG，不再检测 LOGO/BANNER 的 GIF 文件
    async detectImageFormats() {
      this.logoHasGif = false;
      this.bannerHasGif = false;
    },
    
    // 🔥 增强版：彻底优化GIF渲染，消除透明区域残影
    optimizeGifRendering() {
      const logoElement = document.querySelector('.center-logo');
      if (logoElement && logoElement.src && logoElement.src.includes('.gif')) {
        console.log('开始彻底优化GIF渲染，消除透明区域残影...');
        
        // 🔥 方案1：强制重新加载GIF
        const originalSrc = logoElement.src;
        logoElement.src = '';
        logoElement.style.display = 'none';
        
        // 🔥 方案2：清除所有可能的缓存
        logoElement.style.opacity = '0';
        logoElement.style.visibility = 'hidden';
        
        // 🔥 方案3：强制重绘父容器
        const parentElement = logoElement.parentElement;
        if (parentElement) {
          parentElement.style.transform = 'translateZ(0.1px)';
          setTimeout(() => {
            parentElement.style.transform = '';
          }, 50);
        }
        
        // 🔥 方案4：使用多重requestAnimationFrame确保完全重绘
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // 恢复GIF显示
              logoElement.src = originalSrc + '?t=' + Date.now(); // 添加时间戳防止缓存
              logoElement.style.display = 'block';
              logoElement.style.opacity = '1';
              logoElement.style.visibility = 'visible';
              
              // 🔥 方案5：强制浏览器重新计算所有样式
              logoElement.offsetHeight;
              logoElement.offsetWidth;
              
              // 🔥 方案6：触发重排和重绘
              logoElement.style.transform = logoElement.style.transform;
              
              console.log('🔥 GIF渲染彻底优化完成，透明区域残影已消除');
            });
          });
        });
      }
    },
    
    // 新增：异步检查图片是否存在
    checkImageExists(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        
        // 设置超时，避免长时间等待
        setTimeout(() => resolve(false), 3000);
      });
    },
    
    // 处理弹窗图片加载错误（自动降级保护）
    handleImageError(event) {
      const failedUrl = event.target.src;
      const displayType = this.currentDisplayType || 'gif';
      console.warn('弹窗图片加载失败:', failedUrl, '显示类型:', displayType);
      
      // 如果是png_only模式，不进行降级，直接使用默认图片
      if (displayType === 'png_only') {
        console.log('PNG仅用模式，不降级，使用默认图片');
        event.target.src = 'assets/default-prize.png';
        return;
      }
      
      // 自动降级逻辑：GIF失败时尝试PNG，PNG失败时尝试GIF
      if (failedUrl.includes('.gif')) {
        const pngUrl = failedUrl.replace('.gif', '.png');
        console.log('GIF加载失败，自动降级到PNG:', pngUrl);
        event.target.src = pngUrl;
        return;
      }
      
      if (failedUrl.includes('.png')) {
        const gifUrl = failedUrl.replace('.png', '.gif');
        console.log('PNG加载失败，自动降级到GIF:', gifUrl);
        event.target.src = gifUrl;
        return;
      }
      
      // 如果既不是GIF也不是PNG，尝试使用奖品的原始图片
      if (this.selectedPrize) {
        const fallbackUrl = this.getPrizeImageUrl(this.selectedPrize);
        if (event.target.src !== fallbackUrl) {
          console.log('特殊格式加载失败，尝试原始图片:', fallbackUrl);
          event.target.src = fallbackUrl;
          return;
        }
      }
      
      // 所有尝试都失败，使用默认图片
      console.warn('所有图片格式都加载失败，使用默认图片');
      event.target.src = 'assets/default-prize.png';
    },

    // ======================================================
    // 绚丽特效系统
    // ======================================================

    // 启动所有绚丽特效
    startSpectacularEffects() {
      const finalPrize = (this.isMysteryRound && this.realPrize) ? this.realPrize : this.selectedPrize;
      const isJackpot = this.isJackpotPrize(finalPrize);
      const savedParticleIntensity = localStorage.getItem('particleIntensity');
      console.log('启动绚丽特效系统，粒子强度:', savedParticleIntensity);
      
      // 如果粒子强度设置为none，跳过所有粒子特效
      if (savedParticleIntensity === 'none') {
        console.log('粒子强度设置为无，跳过所有粒子特效');
        return;
      }
      
      // 启动增强粒子掉落
      this.createEnhancedParticleRain();
      
      // 启动粒子爆炸
      this.createParticleExplosion();
      
      // 启动闪烁星星
      this.createTwinklingStars();
      
      // 启动烟花特效
      if (isJackpot) {
        this.createFireworks();
      }
      
      // 启动图片闪烁特效
      this.createImageSparkles();
      
      // 延迟启动一些特效，创造层次感
      setTimeout(() => {
        this.createSecondaryEffects(isJackpot);
      }, 500);
    },

    // 创建增强粒子掉落效果
    createEnhancedParticleRain() {
      const container = this.$refs.particleRain;
      if (!container) return;

      // 清空容器
      container.innerHTML = '';

      // 使用配置的粒子数量
      const particleCount = this.modalSettings.particleCount.particleRain;
      
      // 如果粒子数量为0，直接返回
      if (particleCount === 0) return;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'rain-particle';
        
        // 随机水平位置
        particle.style.left = Math.random() * 100 + '%';
        
        // 随机动画延迟
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        // 随机动画持续时间
        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        container.appendChild(particle);
      }

      // 持续创建新的掉落粒子
      this.particleRainInterval = setInterval(() => {
        if (this.showModal && container) {
          for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'rain-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(particle);
            
            // 5秒后移除这个元素
            setTimeout(() => {
              if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
              }
            }, 5000);
          }
        }
      }, 300);
    },

    // 创建粒子爆炸效果
    createParticleExplosion() {
      const container = this.$refs.particleExplosion;
      if (!container) return;

      // 清空容器
      container.innerHTML = '';

      // 使用配置的粒子数量
      const particleCount = this.modalSettings.particleCount.particleExplosion;
      
      // 如果粒子数量为0，直接返回
      if (particleCount === 0) return;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'explosion-particle';
        
        // 随机颜色
        const colors = ['#ff6b35', '#f7931e', '#ffd700', '#ff1493', '#00bfff', '#32cd32', '#ff69b4', '#9370db'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机大小
        const size = Math.random() * 8 + 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // 随机位置（从中心开始）
        particle.style.left = '50%';
        particle.style.top = '50%';
        
        // 随机方向和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 300 + 100;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        particle.style.setProperty('--end-x', endX + 'px');
        particle.style.setProperty('--end-y', endY + 'px');
        
        // 随机动画延迟
        particle.style.animationDelay = Math.random() * 0.5 + 's';
        
        container.appendChild(particle);
      }
    },

    // 创建闪烁星星
    createTwinklingStars() {
      const container = this.$refs.twinklingStars;
      if (!container) return;

      container.innerHTML = '';

      // 使用配置的星星数量
      const starCount = this.modalSettings.particleCount.twinklingStars;
      
      // 如果星星数量为0，直接返回
      if (starCount === 0) return;
      
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'twinkling-star';
        
        // 随机位置
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // 随机大小
        const size = Math.random() * 6 + 2;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        // 随机动画延迟
        star.style.animationDelay = Math.random() * 3 + 's';
        
        // 随机动画持续时间
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        
        container.appendChild(star);
      }
    },

    // 创建烟花特效
    createFireworks() {
      const container = this.$refs.fireworksContainer;
      if (!container) return;

      container.innerHTML = '';

      // 创建5个烟花爆炸点
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.createSingleFirework(container);
        }, i * 800);
      }

      // 持续创建烟花
      this.fireworksInterval = setInterval(() => {
        if (this.showModal) {
          this.createSingleFirework(container);
        }
      }, 2000);
    },

    // 创建单个烟花
    createSingleFirework(container) {
      const firework = document.createElement('div');
      firework.className = 'firework';
      
      // 随机位置
      firework.style.left = (Math.random() * 80 + 10) + '%';
      firework.style.top = (Math.random() * 60 + 20) + '%';
      
      // 创建烟花粒子
      for (let i = 0; i < 20; i++) {
        const spark = document.createElement('div');
        spark.className = 'firework-spark';
        
        const angle = (i / 20) * Math.PI * 2;
        const distance = Math.random() * 80 + 40;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        spark.style.setProperty('--end-x', endX + 'px');
        spark.style.setProperty('--end-y', endY + 'px');
        
        // 随机颜色
        const colors = ['#ff6b35', '#f7931e', '#ffd700', '#ff1493', '#00bfff', '#32cd32'];
        spark.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        firework.appendChild(spark);
      }
      
      container.appendChild(firework);
      
      // 3秒后移除
      setTimeout(() => {
        if (firework.parentNode) {
          firework.parentNode.removeChild(firework);
        }
      }, 3000);
    },

    // 创建图片闪烁特效
    createImageSparkles() {
      const container = this.$refs.imageSparkles;
      if (!container) return;

      container.innerHTML = '';

      // 使用配置的闪烁点数量
      const sparkleCount = this.modalSettings.particleCount.imageSparkles;
      
      // 如果闪烁点数量为0，直接返回
      if (sparkleCount === 0) return;
      
      for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'image-sparkle';
        
        // 随机位置
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        
        // 随机动画延迟
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        
        container.appendChild(sparkle);
      }
    },

    // 创建次级特效
    createSecondaryEffects(isJackpot = false) {
      // 添加额外的动态效果
      this.addFloatingElements(isJackpot);
      this.addEnergyPulses();
    },

    // 添加漂浮元素
    addFloatingElements(isJackpot = false) {
      const modal = this.$refs.winnerModal;
      if (!modal) return;

      // 使用ASCII字符，避免引入额外图标资源和编码问题
      const floatingElements = isJackpot
        ? ['J', 'P', 'G', '+', '*', '!']
        : ['+', '*', '.', 'o'];
      
      for (let i = 0; i < 10; i++) {
        const element = document.createElement('div');
        element.className = 'floating-element';
        element.textContent = floatingElements[Math.floor(Math.random() * floatingElements.length)];
        
        // 随机位置
        element.style.left = Math.random() * 100 + '%';
        element.style.top = Math.random() * 100 + '%';
        
        // 随机动画延迟
        element.style.animationDelay = Math.random() * 3 + 's';
        
        modal.appendChild(element);
        
        // 5秒后移除
        setTimeout(() => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        }, 5000);
      }
    },

    // 添加能量脉冲
    addEnergyPulses() {
      // 为弹窗添加脉冲效果类
      const modal = this.$refs.winnerModal;
      if (modal) {
        modal.classList.add('energy-pulsing');
      }
    },

    // 清理所有特效
    clearSpectacularEffects() {
      // 清理烟花定时器
      if (this.fireworksInterval) {
        clearInterval(this.fireworksInterval);
        this.fireworksInterval = null;
      }
      
      // 清理粒子掉落定时器
      if (this.particleRainInterval) {
        clearInterval(this.particleRainInterval);
        this.particleRainInterval = null;
      }
      
      // 移除能量脉冲类
      const modal = this.$refs.winnerModal;
      if (modal) {
        modal.classList.remove('energy-pulsing');
      }
      
      // 清理漂浮元素
      const floatingElements = document.querySelectorAll('.floating-element');
      floatingElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    },

    // 启动背景星星粒子效果
    startBackgroundParticles() {
      const container = this.$refs.backgroundParticles;
      if (!container) return;

      // 清理现有粒子
      container.innerHTML = '';

      // 创建初始粒子
      this.createBackgroundParticles();

      // 设置定时器持续添加新粒子
      this.backgroundParticleInterval = setInterval(() => {
        this.createBackgroundParticles(5); // 每次添加5个新粒子
      }, 2000); // 每2秒添加一次
    },

    startLogoSparkles() {
      this.clearLogoSparkles();
      this.scheduleNextLogoSparkle();
    },

    scheduleNextLogoSparkle() {
      const delay = 260 + Math.random() * 780;
      this.logoSparkleTimer = setTimeout(() => {
        if (!this.$refs.logoSparkles || !this.$el) {
          return;
        }

        const sparkleCount = Math.random() > 0.76 ? 2 : 1;
        for (let i = 0; i < sparkleCount; i++) {
          this.createLogoSparkle();
        }

        this.scheduleNextLogoSparkle();
      }, delay);
    },

    getLogoSparkleBounds(logoElement) {
      if (!logoElement) {
        return null;
      }

      const naturalWidth = Number(logoElement.naturalWidth) || 1;
      const naturalHeight = Number(logoElement.naturalHeight) || 1;
      const logoWidth = this.bannerWidth * (this.logoMaxWidth / 100);
      const logoHeight = logoWidth * (naturalHeight / naturalWidth);
      const logoCenterX = this.bannerWidth / 2;
      const logoCenterY = this.bannerHeight / 2 + 5;
      const paddingX = logoWidth * 0.12;
      const paddingY = logoHeight * 0.14;

      return {
        minX: logoCenterX - logoWidth / 2 + paddingX,
        maxX: logoCenterX + logoWidth / 2 - paddingX,
        minY: logoCenterY - logoHeight / 2 + paddingY,
        maxY: logoCenterY + logoHeight / 2 - paddingY
      };
    },

    createLogoSparkle() {
      const sparkleLayer = this.$refs.logoSparkles;
      const logo = this.$el.querySelector('.center-logo');
      if (!sparkleLayer || !logo) return;

      const bounds = this.getLogoSparkleBounds(logo);
      if (!bounds) {
        return;
      }

      const sparkle = document.createElement('span');
      sparkle.className = 'logo-sparkle';

      const size = 16 + Math.random() * 20;
      const opacity = 0.36 + Math.random() * 0.48;
      const duration = 2.55 + Math.random() * 2.55;
      const rotation = -18 + Math.random() * 36;
      const brightness = 1.05 + Math.random() * 1.2;
      const colorPalette = ['rgba(255,245,190,1)', 'rgba(255,216,120,1)', 'rgba(255,255,255,1)', 'rgba(255,236,170,1)'];
      const sparkleColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

      sparkle.style.left = `${bounds.minX + Math.random() * Math.max(12, bounds.maxX - bounds.minX)}px`;
      sparkle.style.top = `${bounds.minY + Math.random() * Math.max(12, bounds.maxY - bounds.minY)}px`;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.setProperty('--logo-sparkle-opacity', `${opacity}`);
      sparkle.style.setProperty('--logo-sparkle-rotation', `${rotation}deg`);
      sparkle.style.setProperty('--logo-sparkle-brightness', `${brightness}`);
      sparkle.style.background = sparkleColor;
      sparkle.style.animationDuration = `${duration}s`;

      sparkleLayer.appendChild(sparkle);

      const cleanupTimer = setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      }, Math.ceil((duration + 0.15) * 1000));

      this.logoSparkleCleanupTimers.push(cleanupTimer);
    },

    startBannerMeteors() {
      this.clearBannerMeteors();
      const initialMeteorCount = 1;
      for (let index = 0; index < initialMeteorCount; index += 1) {
        this.createBannerMeteor();
      }
      this.scheduleNextBannerMeteor();
    },

    scheduleNextBannerMeteor() {
      const delay = 720 + Math.random() * 1280;
      this.bannerMeteorTimer = setTimeout(() => {
        if (this.getBannerMeteorLayers().length === 0 || !this.$el) {
          return;
        }

        const meteorCount = Math.random() > 0.86 ? 2 : 1;
        for (let index = 0; index < meteorCount; index += 1) {
          this.createBannerMeteor();
        }

        this.scheduleNextBannerMeteor();
      }, delay);
    },

    createBannerMeteor() {
      const meteorLayers = this.getBannerMeteorLayers();
      const meteorLayer = meteorLayers[Math.floor(Math.random() * meteorLayers.length)];
      const stage = this.$el;
      if (!meteorLayer || !stage) return;

      const stageRect = stage.getBoundingClientRect();
      const meteor = document.createElement('span');
      meteor.className = 'banner-meteor';
      meteor.innerHTML = '<span class="banner-meteor-tail"></span><span class="banner-meteor-head"></span>';

      const headSize = 12 + Math.random() * 10;
      const tailLength = 160 + Math.random() * 230;
      const tailThickness = 2 + Math.random() * 2.1;
      const stageDiagonal = Math.sqrt(stageRect.width * stageRect.width + stageRect.height * stageRect.height);
      const directionAngle = ((22 + Math.random() * 36) * Math.PI) / 180;
      const directionX = Math.cos(directionAngle);
      const directionY = Math.sin(directionAngle);
      const anchorX = stageRect.width * (0.06 + Math.random() * 0.88);
      const anchorY = stageRect.height * (0.08 + Math.random() * 0.84);
      const backwardDistance = stageDiagonal * (0.55 + Math.random() * 0.4);
      const forwardDistance = stageDiagonal * (0.65 + Math.random() * 0.45);
      const startX = anchorX - directionX * backwardDistance;
      const startY = anchorY - directionY * backwardDistance;
      const endX = anchorX + directionX * forwardDistance;
      const endY = anchorY + directionY * forwardDistance;
      const travelX = endX - startX;
      const travelY = endY - startY;
      const angle = Math.atan2(travelY, travelX) * (180 / Math.PI);
      const duration = 1.8 + Math.random() * 8.6;
      const opacity = 0.46 + Math.random() * 0.28;
      const brightness = 1.35 + Math.random() * 1.05;
      const tailFlickerDuration = 0.26 + Math.random() * 0.84;
      const headTwinkleDuration = 0.28 + Math.random() * 1.2;

      meteor.style.left = `${startX}px`;
      meteor.style.top = `${startY}px`;
      meteor.style.width = `${tailLength + headSize}px`;
      meteor.style.height = `${Math.max(headSize * 1.4, 28)}px`;
      meteor.style.setProperty('--meteor-travel-x', `${travelX}px`);
      meteor.style.setProperty('--meteor-travel-y', `${travelY}px`);
      meteor.style.setProperty('--meteor-opacity', `${opacity}`);
      meteor.style.setProperty('--meteor-brightness', `${brightness}`);
      meteor.style.setProperty('--meteor-tail-length', `${tailLength}px`);
      meteor.style.setProperty('--meteor-tail-thickness', `${tailThickness}px`);
      meteor.style.setProperty('--meteor-head-size', `${headSize}px`);
      meteor.style.setProperty('--meteor-tail-flicker-duration', `${tailFlickerDuration}s`);
      meteor.style.setProperty('--meteor-head-twinkle-duration', `${headTwinkleDuration}s`);
      meteor.style.setProperty('--meteor-angle', `${angle}deg`);
      meteor.style.animationDuration = `${duration}s`;

      meteorLayer.appendChild(meteor);

      const cleanupTimer = setTimeout(() => {
        if (meteor.parentNode) {
          meteor.parentNode.removeChild(meteor);
        }
      }, Math.ceil((duration + 0.2) * 1000));

      this.bannerMeteorCleanupTimers.push(cleanupTimer);
    },

    getBannerMeteorLayers() {
      return [this.$refs.bannerMeteorsMid, this.$refs.bannerMeteorsHigh].filter(Boolean);
    },

    clearLogoSparkles() {
      if (this.logoSparkleTimer) {
        clearTimeout(this.logoSparkleTimer);
        this.logoSparkleTimer = null;
      }

      this.logoSparkleCleanupTimers.forEach((timer) => clearTimeout(timer));
      this.logoSparkleCleanupTimers = [];

      const sparkleLayer = this.$refs.logoSparkles;
      if (sparkleLayer) {
        sparkleLayer.innerHTML = '';
      }
    },

    clearBannerMeteors() {
      if (this.bannerMeteorTimer) {
        clearTimeout(this.bannerMeteorTimer);
        this.bannerMeteorTimer = null;
      }

      this.bannerMeteorCleanupTimers.forEach((timer) => clearTimeout(timer));
      this.bannerMeteorCleanupTimers = [];

      this.getBannerMeteorLayers().forEach((meteorLayer) => {
        meteorLayer.innerHTML = '';
      });
    },

    // 创建背景星星粒子
    createBackgroundParticles(count = null) {
      // 如果没有传入count，使用配置的数量
      if (count === null) {
        count = this.modalSettings.particleCount.backgroundParticles;
      }
      
      // 如果粒子数量为0，直接返回
      if (count === 0) return;
      
      const container = this.$refs.backgroundParticles;
      if (!container) return;

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'background-star-particle';
        
        // 随机起始位置（从屏幕顶部开始）
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '-20px';
        
        // 随机大小
        const size = Math.random() * 4 + 2; // 2-6px
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // 随机形状
        const shapes = ['circle', 'star', 'diamond', 'cross'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        particle.classList.add(`shape-${shape}`);
        
        // 随机颜色
        const colors = [
          '#ffd700', // 金色
          '#ffeb3b', // 黄色
          '#fff176', // 浅黄色
          '#ffffff', // 白色
          '#e3f2fd', // 浅蓝色
          '#f8bbd9', // 粉色
          '#e1bee7', // 浅紫色
          '#c8e6c9'  // 浅绿色
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
        
        // 随机动画持续时间（飘落速度）
        const duration = Math.random() * 8 + 6; // 6-14秒
        particle.style.animationDuration = duration + 's';
        
        // 随机动画延迟
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        // 随机水平漂移
        const drift = (Math.random() - 0.5) * 200; // -100px到100px的漂移
        particle.style.setProperty('--drift', drift + 'px');
        
        container.appendChild(particle);
        
        // 动画结束后移除粒子
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, (duration + 2) * 1000);
      }
    },

    // 清理背景粒子效果
    clearBackgroundParticles() {
      // 清理定时器
      if (this.backgroundParticleInterval) {
        clearInterval(this.backgroundParticleInterval);
        this.backgroundParticleInterval = null;
      }
      
      // 清理粒子容器
      const container = this.$refs.backgroundParticles;
      if (container) {
        container.innerHTML = '';
      }
    },

    // 启动奖励框泛光效果
    startPrizeGlowEffect() {
      // 错落播放的泛光效果
      const startStaggeredGlow = () => {
        // 随机选择2-4个奖励框
        const glowCount = Math.floor(Math.random() * 3) + 2; // 2-4个
        const selectedIndices = [];
        
        // 随机选择不重复的索引
        while (selectedIndices.length < glowCount) {
          const randomIndex = Math.floor(Math.random() * this.prizeSlotCount);
          if (!selectedIndices.includes(randomIndex)) {
            selectedIndices.push(randomIndex);
          }
        }
        
        // 错落启动泛光效果
        selectedIndices.forEach((index, i) => {
          // 每个泛光效果延迟0-2秒启动
          const startDelay = Math.random() * 2000;
          setTimeout(() => {
            this.applyPrizeGlow(index);
          }, startDelay);
        });
        
        // 设置下一轮泛光的时间（2-4秒后，可能在当前泛光还在播放时开始）
        const nextGlowDelay = Math.random() * 2000 + 2000; // 2000-4000ms
        this.prizeGlowInterval = setTimeout(startStaggeredGlow, nextGlowDelay);
      };
      
      // 延迟1秒后开始第一次泛光
      setTimeout(startStaggeredGlow, 1000);
    },

    // 应用奖励框泛光效果
    applyPrizeGlow(index) {
      const prizeItems = this.$refs.prizeItems;
      if (!prizeItems || !prizeItems[index]) return;
      
      const prizeElement = prizeItems[index];
      
      // 从设置中随机选择一个颜色
      const randomColor = this.highlightColors[Math.floor(Math.random() * this.highlightColors.length)];
      
      // 将颜色转换为RGB值用于CSS变量
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };
      
      const rgb = hexToRgb(randomColor);
      if (rgb) {
        // 设置CSS变量用于动画颜色
        prizeElement.style.setProperty('--glow-color-r', rgb.r);
        prizeElement.style.setProperty('--glow-color-g', rgb.g);
        prizeElement.style.setProperty('--glow-color-b', rgb.b);
      }
      
      // 添加泛光类
      prizeElement.classList.add('prize-glow-effect');
      
      // 监听动画结束事件，让动画自然完成
      const handleAnimationEnd = (event) => {
        // 确保是我们关心的动画结束
        if (event.animationName === 'prizeGlowPulse') {
          prizeElement.classList.remove('prize-glow-effect');
          prizeElement.removeEventListener('animationend', handleAnimationEnd);
          // 清理CSS变量
          prizeElement.style.removeProperty('--glow-color-r');
          prizeElement.style.removeProperty('--glow-color-g');
          prizeElement.style.removeProperty('--glow-color-b');
        }
      };
      
      prizeElement.addEventListener('animationend', handleAnimationEnd);
      
      // 设置一个最大时间限制（6秒），防止动画卡住
      setTimeout(() => {
        if (prizeElement.classList.contains('prize-glow-effect')) {
          prizeElement.classList.remove('prize-glow-effect');
          prizeElement.removeEventListener('animationend', handleAnimationEnd);
          // 清理CSS变量
          prizeElement.style.removeProperty('--glow-color-r');
          prizeElement.style.removeProperty('--glow-color-g');
          prizeElement.style.removeProperty('--glow-color-b');
        }
      }, 6000);
    },

    // 清理奖励框泛光效果
    clearPrizeGlowEffect() {
      // 清理定时器
      if (this.prizeGlowInterval) {
        clearTimeout(this.prizeGlowInterval);
        this.prizeGlowInterval = null;
      }
      
      // 清除所有泛光效果
      const prizeItems = this.$refs.prizeItems;
      if (prizeItems) {
        prizeItems.forEach(item => {
          if (item) {
            item.classList.remove('prize-glow-effect');
            // 清理CSS变量
            item.style.removeProperty('--glow-color-r');
            item.style.removeProperty('--glow-color-g');
            item.style.removeProperty('--glow-color-b');
          }
        });
      }
    },
  }
};

// 全局注册组件
window.Draw = Draw; 
