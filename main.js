const REWARD_CONFIG_LOCAL_KEY = 'rewardConfigLocal';
const REWARD_CONFIG_SNAPSHOT_KEY = 'rewardConfigSnapshot';
const STAGE_SETTINGS_LOCAL_KEY = 'stageSettings';
const DEFAULT_STAGE_PRESET = 'default';
const STAGE_PRESET_MAP = {
  default: {
    preset: 'default',
    label: '默认',
    designWidth: 1920,
    designHeight: 1080,
    windowWidth: 1280,
    windowHeight: 720
  },
  wall3240: {
    preset: 'wall3240',
    label: '3240拼接屏',
    designWidth: 1920,
    designHeight: 1080,
    windowWidth: 3240,
    windowHeight: 1920
  }
};

// 创建共享状态
const store = {
  isAdmin: localStorage.getItem('isAdmin') === 'true',
  lastGroupId: localStorage.getItem('lastGroupId') || '',
  lotteryLog: JSON.parse(localStorage.getItem('lotteryLog') || '[]')
};

// 工具函数
const utils = {
  // 显示提示信息
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  },
  
  parseRewardConfig(raw) {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('奖池配置格式无效');
    }
    return parsed;
  },

  stringifyRewardConfig(config) {
    return JSON.stringify(config);
  },

  normalizeStageDimension(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 320 ? parsed : fallback;
  },

  getDefaultStageConfig() {
    return { ...STAGE_PRESET_MAP[DEFAULT_STAGE_PRESET] };
  },

  getStagePresetOptions() {
    return Object.values(STAGE_PRESET_MAP).map((preset) => ({ ...preset }));
  },

  inferStagePreset(stageConfig = {}) {
    const requestedPreset = typeof stageConfig?.preset === 'string' ? stageConfig.preset : '';
    if (requestedPreset && STAGE_PRESET_MAP[requestedPreset]) {
      return requestedPreset;
    }
    const windowWidth = this.normalizeStageDimension(stageConfig.windowWidth, STAGE_PRESET_MAP.default.windowWidth);
    const windowHeight = this.normalizeStageDimension(stageConfig.windowHeight, STAGE_PRESET_MAP.default.windowHeight);

    const matchedPreset = Object.values(STAGE_PRESET_MAP).find((preset) => (
      preset.windowWidth === windowWidth &&
      preset.windowHeight === windowHeight
    ));

    return matchedPreset ? matchedPreset.preset : DEFAULT_STAGE_PRESET;
  },

  resolveStageConfig(stageConfig = {}) {
    const presetKey = this.inferStagePreset(stageConfig);
    return { ...STAGE_PRESET_MAP[presetKey] };
  },

  readStoredStageConfig() {
    try {
      const rawStageConfig = localStorage.getItem(STAGE_SETTINGS_LOCAL_KEY);
      if (!rawStageConfig) {
        return null;
      }

      const storedStageConfig = JSON.parse(rawStageConfig);
      if (storedStageConfig && (typeof storedStageConfig === 'object' || typeof storedStageConfig === 'string')) {
        return this.resolveStageConfig(
          typeof storedStageConfig === 'string'
            ? { preset: storedStageConfig }
            : storedStageConfig
        );
      }
    } catch (error) {}
    return null;
  },

  getStageConfig(configOrUiConfig = null) {
    const storedStageConfig = this.readStoredStageConfig();
    if (storedStageConfig) {
      return storedStageConfig;
    }

    const uiConfig = configOrUiConfig?.ui_config ? configOrUiConfig.ui_config : configOrUiConfig;
    return this.resolveStageConfig(uiConfig?.stage || {});
  },

  applyStageWindowSettings(stageConfigInput = null) {
    const stageConfig = this.resolveStageConfig(stageConfigInput || this.getDefaultStageConfig());
    const isElectronRuntime = typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent || '');

    if (!isElectronRuntime || typeof window === 'undefined' || typeof window.resizeTo !== 'function') {
      return stageConfig;
    }

    const targetWidth = stageConfig.windowWidth;
    const targetHeight = stageConfig.windowHeight;
    const needsResize = Math.abs(window.outerWidth - targetWidth) > 2 || Math.abs(window.outerHeight - targetHeight) > 2;

    if (needsResize) {
      try {
        window.resizeTo(targetWidth, targetHeight);
        if (typeof window.moveTo === 'function') {
          window.moveTo(0, 0);
        }
      } catch (error) {
        console.warn('桌面窗口尺寸调整失败:', error);
      }
    }

    return stageConfig;
  },

  configsAreEqual(leftConfig, rightConfig) {
    try {
      return this.stringifyRewardConfig(leftConfig) === this.stringifyRewardConfig(rightConfig);
    } catch (error) {
      return false;
    }
  },

  async readBundledRewardConfig() {
    const candidates = ['reward-config.json', './reward-config.json'];
    if (typeof window !== 'undefined' && window.location && /^https?:/i.test(window.location.origin || '')) {
      candidates.push(`${window.location.origin}/reward-config.json`);
    }

    let lastError = null;
    for (const url of candidates) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`状态码 ${response.status}`);
        }
        const text = await response.text();
        return this.parseRewardConfig(text);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('内置配置读取失败');
  },

  // 获取配置文件（内置文件 + 本地快照兜底）
  async getRewardConfig() {
    let overrideConfig = null;
    let snapshotConfig = null;
    try {
      const raw = localStorage.getItem(REWARD_CONFIG_LOCAL_KEY);
      if (raw) {
        overrideConfig = this.parseRewardConfig(raw);
      }
    } catch (e) {}

    try {
      const snapshotRaw = localStorage.getItem(REWARD_CONFIG_SNAPSHOT_KEY);
      if (snapshotRaw) {
        snapshotConfig = this.parseRewardConfig(snapshotRaw);
      }
    } catch (e) {}

    try {
      const bundledConfig = await this.readBundledRewardConfig();

      try {
        localStorage.setItem(REWARD_CONFIG_SNAPSHOT_KEY, this.stringifyRewardConfig(bundledConfig));
        if (localStorage.getItem(REWARD_CONFIG_LOCAL_KEY)) {
          localStorage.removeItem(REWARD_CONFIG_LOCAL_KEY);
        }
      } catch (e) {}

      return bundledConfig;
    } catch (error) {
      if (overrideConfig) {
        return overrideConfig;
      }

      if (snapshotConfig) {
        return snapshotConfig;
      }

      console.error('❌ 获取奖池配置失败', error);
      throw new Error('无法获取奖池配置');
    }
  },
  
  // 保存配置到本地（localStorage）
  async saveRewardConfig(config) {
    try {
      config.updatedAt = new Date().toISOString();
      localStorage.setItem(REWARD_CONFIG_LOCAL_KEY, JSON.stringify(config));
      return true;
    } catch (e) {}
    return false;
  },

  // 获取最大奖池ID
  getMaxGroupId(groups) {
    if (!groups || Object.keys(groups).length === 0) {
      return -1; // 没有奖池，返回-1
    }
    
    return Math.max(...Object.keys(groups)
      .filter(id => id.startsWith('G'))
      .map(id => parseInt(id.substring(1), 10) || 0));
  },
  
  // 生成下一个奖池ID
  getNextGroupId(groups) {
    const maxId = this.getMaxGroupId(groups);
    return `G${String(maxId + 1).padStart(2, '0')}`;
  },

  // 获取UI配置
  async getUIConfig() {
    try {
      const config = await this.getRewardConfig();
      const uiConfig = (config && config.ui_config) ? config.ui_config : null;
      const modal = (uiConfig && (uiConfig.modalSettings || uiConfig.modal)) ? (uiConfig.modalSettings || uiConfig.modal) : {};

      return {
        stageSettings: this.getStageConfig(config),
        modalSettings: {
          autoCloseCountdown: typeof modal.autoCloseCountdown === 'number' ? modal.autoCloseCountdown : 5
        }
      };
    } catch (error) {
      return {
        stageSettings: this.getDefaultStageConfig(),
        modalSettings: {
          autoCloseCountdown: 5
        }
      };
    }
  },

  // 获取默认UI配置
  getDefaultUIConfig() {
    return {
      stageSettings: this.getDefaultStageConfig(),
      iconSize: 250,
      bannerWidth: 1020,
      bannerHeight: 610,
      logoSize: 62,
      itemSpacing: {
        topRow: 22,
        rightCol: 50,
        bottomRow: 78,
        leftCol: 50,
        horizontalGap: 16,
        verticalGap: 28
      },
      modalSettings: {
        autoCloseCountdown: 5,
        particleCount: {
          particleRain: 300,
          particleExplosion: 100,
          twinklingStars: 50,
          imageSparkles: 30,
          backgroundParticles: 20
        }
      }
    };
  },

  // 保存UI配置
  async saveUIConfig(uiConfig) {
    try {
      // 获取当前的reward-config
      const config = await this.getRewardConfig();
      
      // 更新UI配置部分
      config.ui_config = {
        ...config.ui_config,
        ...uiConfig,
        updatedAt: new Date().toISOString()
      };
      
      // 保存更新后的配置
      const success = await this.saveRewardConfig(config);
      if (success) {
        console.log('UI配置保存成功');
        this.showToast('UI配置保存成功');
        return true;
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      console.error('保存UI配置失败', error);
      this.showToast('保存UI配置失败');
      return false;
    }
  }
};

// 定义路由
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/home', component: Home },
  { path: '/login', component: Login },
  { path: '/draw', component: Draw },
  { path: '/select-pool', component: SelectPool },
  { path: '/config', component: Config },
  { path: '/ui-config', component: UIConfig },
  { path: '/winner-stats', component: WinnerStats }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});

// 路由守卫，管理员页面权限检查
router.beforeEach((to, from, next) => {
  // 只有管理员才能访问配置页
  if ((to.path === '/config' || to.path === '/ui-config') && !store.isAdmin) {
    utils.showToast('需要管理员权限');
    next('/home');
    return;
  }
  next();
});

// 创建Vue应用实例
const app = Vue.createApp({
  template: `
    <div class="app-shell" :class="{ 'frameless-shell': isFramelessWindow }">
      <div v-if="isFramelessWindow" class="window-drag-region" aria-hidden="true">
        <div class="window-drag-region__handle"></div>
      </div>
      <router-view></router-view>
    </div>
  `,
  data() {
    return {
      isFramelessWindow: false
    };
  },
  async created() {
    try {
      this.isFramelessWindow = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('frameless') === '1';
      const config = await utils.getRewardConfig();
      const stageConfig = utils.getStageConfig(config);
      utils.applyStageWindowSettings(stageConfig);
      if (!store.lastGroupId) {
        const groupIds = Object.keys((config && config.groups) || {}).sort();
        if (groupIds.length > 0) {
          store.lastGroupId = groupIds[0];
          localStorage.setItem('lastGroupId', store.lastGroupId);
        }
      }

      if (!store.UI_RESOURCES) {
        store.UI_RESOURCES = { currentLogo: '', currentBanner: '' };
      }
      const resources = config && config.ui_config && config.ui_config.resources ? config.ui_config.resources : null;
      if (resources && resources.logo && resources.logo.default) {
        store.UI_RESOURCES.currentLogo = resources.logo.default;
      }
      if (resources && resources.banner && resources.banner.default) {
        store.UI_RESOURCES.currentBanner = resources.banner.default;
      }
    } catch (e) {}
  },
  provide() {
    return {
      store,
      utils
    };
  }
});

// 注册路由
app.use(router);

// 挂载应用
app.mount('#app'); 
