const UIConfig = {
  name: 'UIConfig',
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <header class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">界面设置</h1>
        <p class="text-gray-600">自定义界面样式和特效参数</p>
      </header>
      
      <div v-if="!store.isAdmin" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
        <p>需要管理员权限</p>
        <button @click="$router.push('/login')" class="mt-2 bg-red-500 text-white py-2 px-4 rounded">
          去登录
        </button>
      </div>
      
      <div v-else>
        <!-- 弹窗特效设置 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-bold mb-4">🎪 弹窗特效设置</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 弹窗自动关闭时间 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                弹窗自动关闭时间 (秒)
                <span class="ml-1 relative group cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><text x="12" y="16" text-anchor="middle" font-size="14" fill="currentColor">!</text></svg>
                  <div class="absolute left-1/2 z-10 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg px-4 py-2 text-xs text-gray-700 w-64 -translate-x-1/2 mt-2">
                    设置中奖弹窗自动关闭的倒计时时间，建议3-10秒之间
                  </div>
                </span>
              </label>
              <input
                type="range"
                v-model="modalSettings.autoCloseCountdown"
                min="3"
                max="10"
                step="1"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2"
              />
              <div class="flex justify-between text-sm text-gray-500">
                <span>3秒</span>
                <span class="font-medium">{{ modalSettings.autoCloseCountdown }}秒</span>
                <span>10秒</span>
              </div>
            </div>

            <!-- 粒子效果强度 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                粒子效果强度
                <span class="ml-1 relative group cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><text x="12" y="16" text-anchor="middle" font-size="14" fill="currentColor">!</text></svg>
                  <div class="absolute left-1/2 z-10 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg px-4 py-2 text-xs text-gray-700 w-64 -translate-x-1/2 mt-2">
                    调整弹窗粒子特效的密度，低配置设备建议使用较低的强度
                  </div>
                </span>
              </label>
              <select v-model="particleIntensity" @change="handleParticleIntensityChange" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2">
                <option value="none">无 (关闭粒子)</option>
                <option value="minimal">极低 (老旧设备)</option>
                <option value="very-low">很低 (低配设备)</option>
                <option value="low">低 (性能优先)</option>
                <option value="medium">中 (平衡)</option>
                <option value="high">高 (效果优先)</option>
                <option value="ultra">超高 (顶级设备)</option>
              </select>
              <div class="text-xs text-gray-500">
                <div v-if="particleIntensity === 'none'" class="text-red-500 font-medium">
                  所有粒子效果已关闭
                </div>
                <div v-else>
                  <div>粒子雨: {{ modalSettings.particleCount.particleRain }}个</div>
                  <div>爆炸粒子: {{ modalSettings.particleCount.particleExplosion }}个</div>
                  <div>闪烁星星: {{ modalSettings.particleCount.twinklingStars }}个</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- 奖励展示设置 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-bold mb-4">🎁 奖励展示设置</h2>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择奖励弹窗展示的资源类型：</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="inline-flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50" :class="{'border-blue-500 bg-blue-50': rewardDisplayType === 'gif'}">
                <input type="radio" v-model="rewardDisplayType" value="gif" class="text-blue-600 sr-only">
                <div class="flex items-center w-full">
                  <div class="w-4 h-4 border-2 border-blue-600 rounded-full mr-3 flex items-center justify-center">
                    <div v-if="rewardDisplayType === 'gif'" class="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-700">🎬 优先使用GIF动图</div>
                    <div class="text-xs text-gray-500">有GIF时使用GIF，无GIF时自动降级使用PNG</div>
                  </div>
                </div>
              </label>
              <label class="inline-flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50" :class="{'border-blue-500 bg-blue-50': rewardDisplayType === 'png'}">
                <input type="radio" v-model="rewardDisplayType" value="png" class="text-blue-600 sr-only">
                <div class="flex items-center w-full">
                  <div class="w-4 h-4 border-2 border-blue-600 rounded-full mr-3 flex items-center justify-center">
                    <div v-if="rewardDisplayType === 'png'" class="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-700">🖼️ 优先使用PNG静图</div>
                    <div class="text-xs text-gray-500">有PNG时使用PNG，无PNG时自动降级使用GIF</div>
                  </div>
                </div>
              </label>
              <label class="inline-flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50" :class="{'border-blue-500 bg-blue-50': rewardDisplayType === 'png_only'}">
                <input type="radio" v-model="rewardDisplayType" value="png_only" class="text-blue-600 sr-only">
                <div class="flex items-center w-full">
                  <div class="w-4 h-4 border-2 border-blue-600 rounded-full mr-3 flex items-center justify-center">
                    <div v-if="rewardDisplayType === 'png_only'" class="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-700">🖼️ 仅使用PNG静图</div>
                    <div class="text-xs text-gray-500">强制仅使用PNG，不使用GIF动图</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div class="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            💡 提示：此设置会应用到所有奖池。系统会根据设置优先使用指定格式，但会自动降级保护：如果GIF不存在会自动使用PNG，确保始终有图片显示。仅"仅使用PNG"模式不会降级。
          </div>
        </div>

        <!-- 界面尺寸设置 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-bold mb-4">📐 界面尺寸设置</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 奖品图标大小 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                奖品图标大小 (px)
              </label>
              <input
                type="range"
                v-model="uiSettings.iconSize"
                min="200"
                max="500"
                step="10"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2"
              />
              <div class="text-center text-sm text-gray-500">{{ uiSettings.iconSize }}px</div>
            </div>

            <!-- 横幅宽度 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                横幅宽度 (px)
              </label>
              <input
                type="range"
                v-model="uiSettings.bannerWidth"
                min="1800"
                max="3000"
                step="100"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2"
              />
              <div class="text-center text-sm text-gray-500">{{ uiSettings.bannerWidth }}px</div>
            </div>

            <!-- LOGO大小 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                LOGO大小 (%)
              </label>
              <input
                type="range"
                v-model="uiSettings.logoSize"
                min="30"
                max="80"
                step="5"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2"
              />
              <div class="text-center text-sm text-gray-500">{{ uiSettings.logoSize }}%</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-bold mb-4">🖥️ 拼接屏尺寸设置</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              v-for="preset in stagePresetOptions"
              :key="preset.preset"
              class="inline-flex items-start cursor-pointer p-4 border rounded-lg hover:bg-gray-50"
              :class="{'border-blue-500 bg-blue-50': stagePreset === preset.preset}"
            >
              <input type="radio" v-model="stagePreset" :value="preset.preset" class="text-blue-600 sr-only">
              <div class="flex items-start w-full">
                <div class="w-4 h-4 border-2 border-blue-600 rounded-full mr-3 mt-1 flex items-center justify-center">
                  <div v-if="stagePreset === preset.preset" class="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-700">{{ preset.label }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    设计稿固定：{{ preset.designWidth }} x {{ preset.designHeight }}
                  </div>
                  <div class="text-xs text-gray-500">
                    输出窗口：{{ preset.windowWidth }} x {{ preset.windowHeight }}
                  </div>
                </div>
              </div>
            </label>
          </div>
          <div class="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded">
            当前模式：{{ currentStagePreset.label }}；
            设计稿固定：{{ currentStagePreset.designWidth }} x {{ currentStagePreset.designHeight }}；
            输出窗口：{{ currentStagePreset.windowWidth }} x {{ currentStagePreset.windowHeight }}
          </div>
        </div>

        <!-- 保存和重置按钮 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-500">
              修改后需要保存才能生效
            </div>
            <div class="space-x-3">
              <button 
                type="button" 
                @click="resetToDefaults" 
                class="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none"
                :disabled="saving"
              >
                恢复默认
              </button>
              <button 
                type="button" 
                @click="saveAllSettings" 
                class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
                :disabled="saving"
              >
                {{ saving ? '保存中...' : '保存所有设置' }}
              </button>
              <button 
                type="button" 
                @click="$router.push('/home')" 
                class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  inject: ['store', 'utils'],
  data() {
    return {
      saving: false,
      stagePreset: 'default',
      stagePresetOptions: [],
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
      uiSettings: {
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
        }
      },
      particleIntensity: 'medium',
      rewardDisplayType: 'gif',
      error: null
    };
  },
  async created() {
    await this.loadAllSettings();
  },
  computed: {
    currentStagePreset() {
      return this.stagePresetOptions.find((preset) => preset.preset === this.stagePreset) || {
        label: '默认',
        designWidth: 1920,
        designHeight: 1080,
        windowWidth: 1280,
        windowHeight: 720
      };
    }
  },
  methods: {
    async loadAllSettings() {
      try {
        this.stagePresetOptions = this.utils.getStagePresetOptions();
        // 优先从localStorage加载配置（与音效配置加载方式一致）
        const savedParticleIntensity = localStorage.getItem('particleIntensity');
        if (savedParticleIntensity) {
          this.particleIntensity = savedParticleIntensity;
        }
        
        const savedRewardDisplayType = localStorage.getItem('rewardDisplayType');
        if (savedRewardDisplayType) {
          // 如果是已废弃的gif_only，重置为gif
          if (savedRewardDisplayType === 'gif_only') {
            this.rewardDisplayType = 'gif';
            localStorage.setItem('rewardDisplayType', 'gif');
            console.log('检测到废弃的gif_only设置，已重置为gif');
          } else {
            this.rewardDisplayType = savedRewardDisplayType;
          }
        }
        
        const savedModalCountdown = localStorage.getItem('modalAutoCloseCountdown');
        if (savedModalCountdown) {
          this.modalSettings.autoCloseCountdown = parseInt(savedModalCountdown);
        }
        
        const savedUISettings = localStorage.getItem('uiSettings');
        if (savedUISettings) {
          this.uiSettings = JSON.parse(savedUISettings);
        }

        const savedStageSettings = localStorage.getItem('stageSettings');
        if (savedStageSettings) {
          this.stagePreset = this.utils.resolveStageConfig(JSON.parse(savedStageSettings)).preset;
        }
        
        const savedParticleCount = localStorage.getItem('modalParticleCount');
        if (savedParticleCount) {
          this.modalSettings.particleCount = JSON.parse(savedParticleCount);
        }
        
        // 从reward-config.json加载配置作为备用
        const config = await this.utils.getRewardConfig();
        const uiConfig = config.ui_config;
        
        // 如果localStorage中没有配置，则从配置文件加载
        if (!savedParticleIntensity && uiConfig.effects?.particleIntensity) {
          this.particleIntensity = uiConfig.effects.particleIntensity;
        }
        
        if (!savedRewardDisplayType && uiConfig.display?.rewardDisplayType) {
          this.rewardDisplayType = uiConfig.display.rewardDisplayType;
        }
        
        if (!savedModalCountdown && uiConfig.modal?.autoCloseCountdown) {
          this.modalSettings.autoCloseCountdown = uiConfig.modal.autoCloseCountdown;
        }
        
        if (!savedUISettings && uiConfig.ui_settings) {
          this.uiSettings = uiConfig.ui_settings;
        }

        if (!savedStageSettings) {
          this.stagePreset = this.utils.getStageConfig(config).preset;
        }
        
        if (!savedParticleCount && uiConfig.modal?.particleCount) {
          this.modalSettings.particleCount = uiConfig.modal.particleCount;
        }
        
        // 根据粒子强度设置更新粒子数量
        this.updateParticleSettings();
        
        console.log('✅ UI配置已加载:', {
          particleIntensity: this.particleIntensity,
          rewardDisplayType: this.rewardDisplayType,
          modalSettings: this.modalSettings,
          uiSettings: this.uiSettings,
          stagePreset: this.stagePreset
        });
        
      } catch (error) {
        console.error('加载设置失败:', error);
        this.error = '加载设置失败';
      }
    },
    
    async saveAllSettings() {
      try {
        // 获取当前配置
        const config = await this.utils.getRewardConfig();
        const normalizedStageSettings = this.utils.resolveStageConfig({ preset: this.stagePreset });
        
        // 更新UI配置
        config.ui_config = {
          ...config.ui_config,
          stage: normalizedStageSettings,
          modal: this.modalSettings,
          effects: {
            particleIntensity: this.particleIntensity
          },
          ui_settings: this.uiSettings,
          display: {
            rewardDisplayType: this.rewardDisplayType
          }
        };
        
        // 保存到reward-config.json
        await this.utils.saveRewardConfig(config);
        
        // 同步保存到localStorage（与音效配置保存方式一致）
        localStorage.setItem('particleIntensity', this.particleIntensity);
        localStorage.setItem('rewardDisplayType', this.rewardDisplayType);
        localStorage.setItem('modalAutoCloseCountdown', this.modalSettings.autoCloseCountdown.toString());
        localStorage.setItem('uiSettings', JSON.stringify(this.uiSettings));
        localStorage.setItem('stageSettings', JSON.stringify({ preset: normalizedStageSettings.preset }));
        localStorage.setItem('modalParticleCount', JSON.stringify(this.modalSettings.particleCount));
        this.utils.applyStageWindowSettings(normalizedStageSettings);
        
        console.log('✅ UI配置已保存:', {
          particleIntensity: this.particleIntensity,
          rewardDisplayType: this.rewardDisplayType,
          modalSettings: this.modalSettings,
          uiSettings: this.uiSettings,
          stagePreset: normalizedStageSettings.preset
        });
        
        this.utils.showToast('设置已保存');
      } catch (error) {
        console.error('保存设置失败:', error);
        this.error = '保存设置失败';
      }
    },

    // 粒子强度变化处理
    handleParticleIntensityChange() {
      this.updateParticleSettings();
      this.saveAllSettings();
    },
    
    // 显示类型变化处理
    handleDisplayTypeChange() {
      this.saveAllSettings();
    },
    
    // 资源来源变化处理
    handleResourceSourceChange() {
      this.saveAllSettings();
    },
    
    // 更新粒子设置
    updateParticleSettings() {
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
      
      if (intensityMap[this.particleIntensity]) {
        this.modalSettings.particleCount = { ...intensityMap[this.particleIntensity] };
      }
    },

    // 重置为默认设置
    async resetToDefaults() {
      this.particleIntensity = 'medium';
      this.rewardDisplayType = 'gif';
      this.stagePreset = 'default';
      this.modalSettings = {
        autoCloseCountdown: 5,
        particleCount: {
          particleRain: 300,
          particleExplosion: 100,
          twinklingStars: 50,
          imageSparkles: 30,
          backgroundParticles: 20
        }
      };
      this.uiSettings = {
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
        }
      };

      await this.saveAllSettings();
      this.utils.showToast('已恢复默认设置');
    },
  },
  
  // 添加watchers来监听UI设置变化并自动保存
  watch: {
    // 监听弹窗自动关闭时间变化
    'modalSettings.autoCloseCountdown': {
      handler() {
        this.saveAllSettings();
      },
      deep: true
    },
    
    // 监听UI尺寸设置变化
    'uiSettings': {
      handler() {
        this.saveAllSettings();
      },
      deep: true
    },

    'stagePreset': {
      handler() {
        this.saveAllSettings();
      },
      deep: false
    }
  }
};
