const SelectPool = {
  name: 'SelectPool',
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <header class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">设置</h1>
        <p class="text-gray-600" v-if="store.lastGroupId">当前奖池: {{ store.lastGroupId }}</p>
      </header>
      
      <!-- 店名输入 -->
      <div class="mb-8 bg-white rounded-lg shadow-md p-4">
        <label for="storeName" class="block text-sm font-medium text-gray-700 mb-2">店名设置</label>
        <input type="text" id="storeName" v-model="storeName" @change="saveStoreName" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="请输入店铺名称">
        <p class="text-xs text-blue-600 mt-2">
          💡 提示：店名用于区分不同店铺的抽奖数据，每个店铺的中奖记录会单独存储和统计。
        </p>
      </div>
      
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{{ error }}</p>
        <button @click="$router.push('/home')" class="mt-2 bg-red-500 text-white py-2 px-4 rounded">
          返回首页
        </button>
      </div>
      
      <div v-else-if="Object.keys(groups).length === 0" class="text-center">
        <p class="text-gray-700 mb-4">暂无可用奖池，请先配置奖池</p>
        <button 
          @click="$router.push('/config')" 
          class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
          :disabled="!store.isAdmin"
          :class="{'opacity-50 cursor-not-allowed': !store.isAdmin}"
        >
          去配置
        </button>
        <button 
          @click="$router.push('/home')" 
          class="ml-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none"
        >
          返回首页
        </button>
      </div>
      
      <div v-else>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8">
          <div 
            v-for="(_, groupId) in groups" 
            :key="groupId"
            class="border rounded-lg p-4 transition-all duration-200"
            :class="{
              'bg-blue-100 border-blue-500': selectedGroupId === groupId,
              'cursor-pointer hover:shadow-md': true
            }"
            @click="selectGroup(groupId)"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-lg flex items-center">
                {{ groupId }}
              </h3>
              <div 
                v-if="selectedGroupId === groupId"
                class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ✓
              </div>
            </div>
            <p class="text-gray-600 text-sm">{{ groups[groupId].length }} 个奖品</p>
          </div>
        </div>
        
        <div v-if="selectedGroupId" class="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 class="text-xl font-bold mb-4">奖池 {{ selectedGroupId }} 预览</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div 
              v-for="(prize, index) in groups[selectedGroupId]" 
              :key="index"
              class="border rounded p-2 flex flex-col items-center"
            >
              <img :src="getPrizeImageUrl(prize)" class="w-16 h-16 object-contain mb-2">
              <p class="text-sm text-center font-medium">{{ prize.name }}</p>
              <p class="text-xs text-gray-500">权重: {{ prize.weight }}</p>
            </div>
          </div>
        </div>
        
        <!-- 音效配置 -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 class="text-xl font-bold mb-4">音效配置</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="loopSound" class="block text-sm font-medium text-gray-700 mb-1">旋转音效 (Loop)</label>
              <div class="flex items-center space-x-2 mb-2">
                <select id="loopSound" v-model="selectedLoopSound" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option v-if="loopSounds.length === 0" value="">无可用音效</option>
                  <option v-for="sound in loopSounds" :key="sound" :value="sound">{{ sound }}</option>
                </select>
                <button @click="previewSound('loop', selectedLoopSound)" :disabled="!selectedLoopSound" class="mt-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">试听</button>
              </div>
              <div class="mb-2">
                <label for="loopVolume" class="block text-xs font-medium text-gray-600 mb-1">音量: {{ Math.round(loopVolume * 100) }}%</label>
                <input 
                  type="range" 
                  id="loopVolume" 
                  v-model="loopVolume" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                >
              </div>
              <p class="text-xs text-gray-500">找到 {{ loopSounds.length }} 个音效文件</p>
            </div>
            <div>
              <label for="rewardSound" class="block text-sm font-medium text-gray-700 mb-1">中奖音效 (Reward)</label>
              <div class="flex items-center space-x-2 mb-2">
                <select id="rewardSound" v-model="selectedRewardSound" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option v-if="rewardSounds.length === 0" value="">无可用音效</option>
                  <option v-for="sound in rewardSounds" :key="sound" :value="sound">{{ sound }}</option>
                </select>
                <button @click="previewSound('reward', selectedRewardSound)" :disabled="!selectedRewardSound" class="mt-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">试听</button>
              </div>
              <div class="mb-2">
                <label for="rewardVolume" class="block text-xs font-medium text-gray-600 mb-1">音量: {{ Math.round(rewardVolume * 100) }}%</label>
                <input 
                  type="range" 
                  id="rewardVolume" 
                  v-model="rewardVolume" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                >
              </div>
              <p class="text-xs text-gray-500">找到 {{ rewardSounds.length }} 个音效文件</p>
            </div>
            <div>
              <label for="bgMusic" class="block text-sm font-medium text-gray-700 mb-1">背景音乐 (Background)</label>
              <div class="mb-3">
                <label for="bgMusicMode" class="block text-xs font-medium text-gray-600 mb-1">播放模式</label>
                <select id="bgMusicMode" v-model="bgMusicMode" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="random">随机播放 BJ 目录</option>
                  <option value="single">指定单曲循环</option>
                  <option value="none">关闭背景音乐</option>
                </select>
              </div>
              <div class="flex items-center space-x-2 mb-2">
                <select
                  id="bgMusic"
                  v-model="selectedBgMusic"
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :disabled="bgMusicMode !== 'single'"
                >
                  <option value="">请选择单曲</option>
                  <option v-for="sound in bjSounds" :key="sound" :value="sound">{{ sound }}</option>
                </select>
                <button @click="previewSound('bg', getBgPreviewSound())" :disabled="!canPreviewBgMusic()" class="mt-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">试听</button>
              </div>
              <p v-if="bgMusicMode === 'random'" class="text-xs text-blue-600 mb-2">当前为随机播放，进入抽奖页后会在 <code>BJ</code> 目录里连续随机切歌。</p>
              <p v-else-if="bgMusicMode === 'single'" class="text-xs text-gray-500 mb-2">当前为单曲循环，只会循环播放你选中的这一首。</p>
              <p v-else class="text-xs text-gray-500 mb-2">当前已关闭背景音乐。</p>
              <div class="mb-2">
                <label for="bgVolume" class="block text-xs font-medium text-gray-600 mb-1">音量: {{ Math.round(bgVolume * 100) }}%</label>
                <input 
                  type="range" 
                  id="bgVolume" 
                  v-model="bgVolume" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                >
              </div>
              <p class="text-xs text-gray-500">找到 {{ bjSounds.length }} 个背景音乐文件</p>
            </div>
          </div>

          <!-- 神秘大奖音效配置 -->
          <div class="mt-6 border-t pt-6">
            <h3 class="text-lg font-semibold mb-4">神秘大奖音效配置</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label for="mysteryLoopSound" class="block text-sm font-medium text-gray-700 mb-1">神秘大奖旋转音效</label>
                <div class="flex items-center space-x-2 mb-2">
                  <select id="mysteryLoopSound" v-model="selectedMysteryLoopSound" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option v-if="loopSounds.length === 0" value="">无可用音效</option>
                    <option v-for="sound in loopSounds" :key="sound" :value="sound">{{ sound }}</option>
                  </select>
                  <button @click="previewSound('loop', selectedMysteryLoopSound)" :disabled="!selectedMysteryLoopSound" class="mt-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">试听</button>
                </div>
              </div>
              <div>
                <label for="mysteryRewardSound" class="block text-sm font-medium text-gray-700 mb-1">神秘大奖中奖音效</label>
                <div class="flex items-center space-x-2 mb-2">
                  <select id="mysteryRewardSound" v-model="selectedMysteryRewardSound" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option v-if="rewardSounds.length === 0" value="">无可用音效</option>
                    <option v-for="sound in rewardSounds" :key="sound" :value="sound">{{ sound }}</option>
                  </select>
                  <button @click="previewSound('reward', selectedMysteryRewardSound)" :disabled="!selectedMysteryRewardSound" class="mt-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">试听</button>
                </div>
              </div>
              <div>
                <label for="mysteryStartSound" class="block text-sm font-medium text-gray-700 mb-1">神秘大奖开始音效</label>
                <div class="flex items-center space-x-2 mb-2">
                  <select id="mysteryStartSound" v-model="selectedMysteryStartSound" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option v-if="rewardSounds.length === 0" value="">无可用音效</option>
                    <option v-for="sound in rewardSounds" :key="sound" :value="sound">{{ sound }}</option>
                  </select>
                  <button @click="previewSound('reward', selectedMysteryStartSound)" :disabled="!selectedMysteryStartSound" class="mt-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">试听</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 动画时长配置 -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 class="text-xl font-bold mb-4">动画配置</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="mysterySpeed" class="block text-sm font-medium text-gray-700 mb-1">神秘奖励速度</label>
              <input 
                type="number" 
                id="mysterySpeed" 
                v-model="mysterySpeed" 
                min="50" 
                max="500" 
                step="10" 
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
              <p class="text-xs text-gray-500 mt-1">神秘奖励模式下的动画速度(毫秒)</p>
            </div>
          </div>
        </div>

        <!-- 高亮颜色配置 -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 class="text-xl font-bold mb-4">高亮颜色配置</h2>
          
          <!-- 颜色方案选择 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">颜色方案</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input 
                  type="radio" 
                  v-model="colorScheme" 
                  value="4colors" 
                  class="mr-2"
                >
                <span>4色方案</span>
              </label>
              <label class="flex items-center">
                <input 
                  type="radio" 
                  v-model="colorScheme" 
                  value="8colors" 
                  class="mr-2"
                >
                <span>8色方案</span>
              </label>
            </div>
          </div>

          <!-- 4色配置 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">主要颜色 (4色)</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="(color, index) in primaryColors" :key="'primary-' + index" class="flex flex-col items-center">
                <label :for="'primary-color-' + index" class="text-sm font-medium text-gray-700 mb-1">颜色 {{ index + 1 }}</label>
                <div class="flex items-center space-x-2">
                  <input 
                    :id="'primary-color-' + index"
                    type="color" 
                    v-model="primaryColors[index]" 
                    class="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  >
                  <input 
                    type="text" 
                    v-model="primaryColors[index]" 
                    class="w-20 py-1 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="#ffffff"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 8色配置 (仅在8色方案时显示) -->
          <div v-if="colorScheme === '8colors'" class="mb-6">
            <h3 class="text-lg font-semibold mb-3">扩展颜色 (额外4色)</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="(color, index) in secondaryColors" :key="'secondary-' + index" class="flex flex-col items-center">
                <label :for="'secondary-color-' + index" class="text-sm font-medium text-gray-700 mb-1">颜色 {{ index + 5 }}</label>
                <div class="flex items-center space-x-2">
                  <input 
                    :id="'secondary-color-' + index"
                    type="color" 
                    v-model="secondaryColors[index]" 
                    class="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  >
                  <input 
                    type="text" 
                    v-model="secondaryColors[index]" 
                    class="w-20 py-1 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="#ffffff"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 颜色预览 -->
          <div class="mb-4">
            <h3 class="text-lg font-semibold mb-3">当前配色预览</h3>
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="(color, index) in currentColorPalette" 
                :key="'preview-' + index"
                class="w-16 h-16 rounded-lg border-2 border-gray-300 flex items-center justify-center text-white text-xs font-bold shadow-md"
                :style="{ backgroundColor: color }"
              >
                {{ index + 1 }}
              </div>
            </div>
          </div>

          <!-- 重置按钮 -->
          <div class="flex space-x-2">
            <button 
              @click="resetToDefaultColors" 
              class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              重置为默认颜色
            </button>
            <button 
              @click="saveColorConfig" 
              class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              保存颜色配置
            </button>
          </div>
        </div>
        
        <div class="flex justify-center space-x-4">
          <button 
            @click="confirmSelection" 
            class="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 focus:outline-none"
            :disabled="!selectedGroupId"
            :class="{'opacity-50 cursor-not-allowed': !selectedGroupId}"
          >
            确认选择
          </button>
          <button 
            @click="$router.push('/home')" 
            class="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  `,
  inject: ['store', 'utils'],
  data() {
    return {
      groups: {},
      loading: true,
      error: null,
      selectedGroupId: null,
      loopSounds: [], // 动态加载，不再硬编码
      rewardSounds: [], // 动态加载，不再硬编码
      bjSounds: [], // 背景音乐列表，动态加载
      selectedLoopSound: '1.mp3', // 默认选择
      selectedRewardSound: '1.mp3', // 默认选择
      bgMusicMode: 'random', // 背景音乐模式：random/single/none
      selectedBgMusic: '', // 选择的背景音乐
      currentPreviewAudio: null, // 用于跟踪当前播放的试听音频
      storeName: '1号店', // 新增店名，默认为1号店
      mysterySpeed: 150, // 神秘奖励模式下的速度(毫秒)
      // 颜色配置
      colorScheme: '4colors', // 默认4色方案
      primaryColors: [
        '#ffd74d', // 金黄色
        '#ec9351', // 橙色
        '#eb7250', // 橙红色
        '#ffcac0'  // 粉橙色
      ],
      secondaryColors: [
        '#FF6B35', // 暖橙色-活力橙
        '#F7931E', // 金橙色-阳光橙
        '#FFD23F', // 明黄色-柠檬黄
        '#FF4757'  // 暖红色-珊瑚红
      ],
      // 音量设置
      loopVolume: 0.5,    // 旋转音效音量 (默认50%)
      rewardVolume: 0.7,  // 中奖音效音量 (默认70%)
      bgVolume: 0.3,       // 背景音乐音量 (默认30%)
      selectedMysteryLoopSound: '',
      selectedMysteryRewardSound: '',
      selectedMysteryStartSound: ''
    };
  },
  computed: {
    // 当前使用的颜色调色板
    currentColorPalette() {
      if (this.colorScheme === '8colors') {
        return [...this.primaryColors, ...this.secondaryColors];
      }
      return this.primaryColors;
    }
  },
  async created() {
    try {
      // 获取奖池配置
      const config = await this.utils.getRewardConfig();
      const soundConfig = config?.ui_config?.sounds || {};
      const backgroundSoundConfig = this.normalizeBackgroundSoundConfig(soundConfig.background);
      
      // 动态加载音效文件列表
      await this.loadSoundFiles(soundConfig);
      
      // 检查配置是否存在
      if (!config || !config.groups) {
        this.error = '未找到奖池配置';
        this.loading = false;
        return;
      }
      
      this.groups = config.groups;
      
      // 默认选中G00奖池，除非有明确的其他选择
      if (this.store.lastGroupId && this.groups[this.store.lastGroupId]) {
        this.selectedGroupId = this.store.lastGroupId;
      } else {
        // 如果没有选择，默认选择G00奖池
        this.selectedGroupId = 'G00';
      }
      
      this.loading = false;
      
      // 加载已保存的音效设置
      const savedLoopSound = localStorage.getItem('selectedLoopSound');
      if (savedLoopSound && this.loopSounds.includes(savedLoopSound)) {
        this.selectedLoopSound = savedLoopSound;
      } else {
        const configLoopSound = this.extractFileNameFromPath(soundConfig?.loop?.default || '');
        if (configLoopSound && this.loopSounds.includes(configLoopSound)) {
          this.selectedLoopSound = configLoopSound;
        }
      }
      const savedRewardSound = localStorage.getItem('selectedRewardSound');
      if (savedRewardSound && this.rewardSounds.includes(savedRewardSound)) {
        this.selectedRewardSound = savedRewardSound;
      } else {
        const configRewardSound = this.extractFileNameFromPath(soundConfig?.reward?.default || '');
        if (configRewardSound && this.rewardSounds.includes(configRewardSound)) {
          this.selectedRewardSound = configRewardSound;
        }
      }
      const savedBgMusicMode = localStorage.getItem('bgMusicMode');
      this.bgMusicMode = this.normalizeBgMusicMode(savedBgMusicMode || backgroundSoundConfig.mode);
      const savedBgMusic = localStorage.getItem('selectedBgMusic');
      const preferredBgMusic = savedBgMusic
        || backgroundSoundConfig.selected
        || backgroundSoundConfig.default
        || backgroundSoundConfig.playlist[0]
        || '';
      if (preferredBgMusic && this.bjSounds.includes(preferredBgMusic)) {
        this.selectedBgMusic = preferredBgMusic;
      } else if (this.bjSounds.length > 0) {
        this.selectedBgMusic = this.bjSounds[0];
      }
      if (this.bgMusicMode === 'single' && !this.selectedBgMusic && this.bjSounds.length > 0) {
        this.selectedBgMusic = this.bjSounds[0];
      }
      
      // 加载神秘大奖音效设置
      const savedMysteryLoopSound = localStorage.getItem('selectedMysteryLoopSound');
      if (savedMysteryLoopSound && this.loopSounds.includes(savedMysteryLoopSound)) {
        this.selectedMysteryLoopSound = savedMysteryLoopSound;
      } else {
        this.selectedMysteryLoopSound = '2.mp3';
      }
      
      const savedMysteryRewardSound = localStorage.getItem('selectedMysteryRewardSound');
      if (savedMysteryRewardSound && this.rewardSounds.includes(savedMysteryRewardSound)) {
        this.selectedMysteryRewardSound = savedMysteryRewardSound;
      } else {
        this.selectedMysteryRewardSound = '2.mp3';
      }
      
      const savedMysteryStartSound = localStorage.getItem('selectedMysteryStartSound');
      if (savedMysteryStartSound && this.rewardSounds.includes(savedMysteryStartSound)) {
        this.selectedMysteryStartSound = savedMysteryStartSound;
      } else {
        this.selectedMysteryStartSound = '3.mp3';
      }
      
      // 加载已保存的音量设置
      const savedLoopVolume = localStorage.getItem('loopVolume');
      if (savedLoopVolume) {
        this.loopVolume = parseFloat(savedLoopVolume);
      }
      const savedRewardVolume = localStorage.getItem('rewardVolume');
      if (savedRewardVolume) {
        this.rewardVolume = parseFloat(savedRewardVolume);
      }
      const savedBgVolume = localStorage.getItem('bgVolume');
      if (savedBgVolume) {
        this.bgVolume = parseFloat(savedBgVolume);
      }
      
      // 加载已保存的动画设置
      const savedMysterySpeed = localStorage.getItem('mysterySpeed');
      if (savedMysterySpeed) {
        this.mysterySpeed = parseInt(savedMysterySpeed);
      }

      // 加载店名
      const savedStoreName = localStorage.getItem('storeName');
      if (savedStoreName) {
        this.storeName = savedStoreName;
      }

      // 加载颜色配置
      this.loadColorConfig();
    } catch (error) {
      console.error('加载奖池失败', error);
      this.error = '加载奖池失败';
      this.loading = false;
    }
  },
  methods: {
    // 动态加载音效文件列表
    async loadSoundFiles(soundConfig = {}) {
      try {
        console.log('🔍 开始扫描音效文件...');
        const soundManifest = await this.loadSoundManifest();
        this.loopSounds = this.resolveSoundFiles(soundManifest?.loop, this.extractConfiguredSoundFiles(soundConfig.loop));
        this.rewardSounds = this.resolveSoundFiles(soundManifest?.reward, this.extractConfiguredSoundFiles(soundConfig.reward));
        this.bjSounds = this.resolveSoundFiles(soundManifest?.background, this.extractConfiguredSoundFiles(soundConfig.background));
        
        console.log('✅ 动态扫描结果:');
        console.log('  Loop音效:', this.loopSounds);
        console.log('  Reward音效:', this.rewardSounds);
        console.log('  背景音乐:', this.bjSounds);
        
        // 设置默认选择
        if (this.loopSounds.length > 0 && !this.loopSounds.includes(this.selectedLoopSound)) {
          this.selectedLoopSound = this.loopSounds[0];
        }
        if (this.rewardSounds.length > 0 && !this.rewardSounds.includes(this.selectedRewardSound)) {
          this.selectedRewardSound = this.rewardSounds[0];
        }
        if (this.bjSounds.length > 0 && !this.selectedBgMusic) {
          this.selectedBgMusic = this.bjSounds[0];
        }
        
      } catch (error) {
        console.error('❌ 加载音效文件失败:', error);
        // 如果动态加载失败，使用空列表
        this.loopSounds = [];
        this.rewardSounds = [];
        this.bjSounds = [];
      }
    },

    getSoundManifestCandidates() {
      const candidates = ['assets/sounds/manifest.json', './assets/sounds/manifest.json'];
      if (typeof window !== 'undefined' && window.location && /^https?:/i.test(window.location.origin || '')) {
        candidates.push(`${window.location.origin}/assets/sounds/manifest.json`);
      }
      return candidates;
    },

    async loadSoundManifest() {
      const candidates = this.getSoundManifestCandidates();
      let lastError = null;

      for (const url of candidates) {
        try {
          const response = await fetch(url, { cache: 'no-store' });
          if (!response.ok) {
            throw new Error(`状态码 ${response.status}`);
          }
          const manifest = await response.json();
          console.log('✅ 音频清单加载成功:', url, manifest);
          return manifest;
        } catch (error) {
          lastError = error;
        }
      }

      console.warn('⚠️ 音频清单读取失败，回退到配置内清单:', lastError);
      return null;
    },

    resolveSoundFiles(manifestFiles, configuredFiles = []) {
      const normalizedManifestFiles = this.dedupeSortedSoundFiles(manifestFiles);
      if (normalizedManifestFiles.length > 0) {
        return normalizedManifestFiles;
      }
      return this.dedupeSortedSoundFiles(configuredFiles);
    },

    dedupeSortedSoundFiles(soundFiles) {
      return Array.from(new Set((Array.isArray(soundFiles) ? soundFiles : []).filter(Boolean)))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }));
    },

    extractConfiguredSoundFiles(soundSection) {
      const fileNames = [];
      const walkValue = (value) => {
        if (!value) {
          return;
        }
        if (typeof value === 'string') {
          const fileName = this.extractFileNameFromPath(value);
          if (fileName) {
            fileNames.push(fileName);
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

      walkValue(soundSection);
      return this.dedupeSortedSoundFiles(fileNames);
    },

    normalizeBgMusicMode(mode) {
      return ['random', 'single', 'none'].includes(mode) ? mode : 'random';
    },

    normalizeBackgroundSoundConfig(backgroundSoundConfig = {}) {
      const playlist = this.extractConfiguredSoundFiles(backgroundSoundConfig.playlist || []);
      return {
        mode: this.normalizeBgMusicMode(backgroundSoundConfig.mode),
        selected: this.extractFileNameFromPath(backgroundSoundConfig.selected || ''),
        default: this.extractFileNameFromPath(backgroundSoundConfig.default || ''),
        playlist
      };
    },

    extractFileNameFromPath(filePath) {
      if (!filePath || typeof filePath !== 'string') {
        return '';
      }
      const segments = filePath.split('/');
      return segments[segments.length - 1] || '';
    },

    canPreviewBgMusic() {
      if (this.bgMusicMode === 'none') {
        return false;
      }
      if (this.bgMusicMode === 'random') {
        return this.bjSounds.length > 0;
      }
      return !!this.selectedBgMusic;
    },

    getBgPreviewSound() {
      if (this.bgMusicMode === 'none') {
        return '';
      }
      if (this.bgMusicMode === 'random') {
        if (this.bjSounds.length === 0) {
          return '';
        }
        return this.bjSounds[Math.floor(Math.random() * this.bjSounds.length)];
      }
      return this.selectedBgMusic;
    },
    // 获取奖品图片URL（处理本地与远程图片）
    getPrizeImageUrl(prize) {
      if (!prize || !prize.img_url) return '';
      
      // 如果是远程图片，直接返回完整URL
      if (prize.img_url.startsWith('http')) {
        return prize.img_url;
      }
      
      // 如果是本地图片，返回相对路径
      return prize.img_url;
    },
    
    // 选择奖池
    selectGroup(groupId) {
      this.selectedGroupId = groupId;
    },
    
    // 试听音效
    previewSound(type, soundFile) {
      if (!soundFile) {
        return;
      }
      if (this.currentPreviewAudio) {
        this.currentPreviewAudio.pause();
        this.currentPreviewAudio.currentTime = 0;
      }
      
      let basePath;
      let volume;
      switch(type) {
        case 'loop':
          basePath = 'assets/sounds/loop/';
          volume = this.loopVolume;
          break;
        case 'reward':
          basePath = 'assets/sounds/reward/';
          volume = this.rewardVolume;
          break;
        case 'bg':
          basePath = 'assets/sounds/BJ/';
          volume = this.bgVolume;
          break;
        default:
          basePath = 'assets/sounds/loop/';
          volume = this.loopVolume;
      }
      
      this.currentPreviewAudio = new Audio(`${basePath}${soundFile}`);
      this.currentPreviewAudio.volume = volume;
      this.currentPreviewAudio.play();
    },

    // 确认选择奖池
    async confirmSelection() {
      if (!this.selectedGroupId) return;
      
      // 保存奖池选择
      this.store.lastGroupId = this.selectedGroupId;
      localStorage.setItem('lastGroupId', this.selectedGroupId);
      
      // 保存音效设置
      localStorage.setItem('selectedLoopSound', this.selectedLoopSound);
      localStorage.setItem('selectedRewardSound', this.selectedRewardSound);
      localStorage.setItem('selectedBgMusic', this.selectedBgMusic);
      localStorage.setItem('bgMusicMode', this.bgMusicMode);
      localStorage.setItem('bgMusicPlaylist', JSON.stringify(this.bjSounds));
      
      // 保存神秘大奖音效设置
      localStorage.setItem('selectedMysteryLoopSound', this.selectedMysteryLoopSound || '2.mp3');
      localStorage.setItem('selectedMysteryRewardSound', this.selectedMysteryRewardSound || '2.mp3');
      localStorage.setItem('selectedMysteryStartSound', this.selectedMysteryStartSound || '3.mp3');
      
      // 保存音量设置
      this.saveVolumeSettings();
      
      // 保存动画设置
      localStorage.setItem('minRounds', this.minRounds.toString());
      localStorage.setItem('maxRounds', this.maxRounds.toString());
      localStorage.setItem('mysterySpeed', this.mysterySpeed.toString());
      
      // 更新配置
      const config = await this.utils.getRewardConfig();
      if (config && config.ui_config && config.ui_config.sounds) {
        const backgroundPlaylist = this.bjSounds.map((sound) => `assets/sounds/BJ/${sound}`);
        const selectedBgMusicPath = this.selectedBgMusic ? `assets/sounds/BJ/${this.selectedBgMusic}` : '';
        config.ui_config.sounds.loop.default = `assets/sounds/loop/${this.selectedLoopSound}`;
        config.ui_config.sounds.loop.mystery = `assets/sounds/loop/${this.selectedMysteryLoopSound || '2.mp3'}`;
        config.ui_config.sounds.reward.default = `assets/sounds/reward/${this.selectedRewardSound}`;
        config.ui_config.sounds.reward.mystery = `assets/sounds/reward/${this.selectedMysteryRewardSound || '2.mp3'}`;
        config.ui_config.sounds.background = {
          mode: this.bgMusicMode,
          selected: selectedBgMusicPath,
          default: backgroundPlaylist[0] || selectedBgMusicPath,
          playlist: backgroundPlaylist
        };
        config.ui_config.sounds.mystery_round = {
          start: `assets/sounds/reward/${this.selectedMysteryStartSound || '3.mp3'}`,
          loop: `assets/sounds/loop/${this.selectedMysteryLoopSound || '2.mp3'}`,
          win: `assets/sounds/reward/${this.selectedMysteryRewardSound || '2.mp3'}`
        };
        
        await this.utils.saveRewardConfig(config);
      }
      
      // 跳转到首页
      this.$router.push('/home');
    },

    // 保存店名到localStorage
    saveStoreName() {
      localStorage.setItem('storeName', this.storeName);
    },

    // 加载颜色配置
    loadColorConfig() {
      try {
        const savedColorScheme = localStorage.getItem('colorScheme');
        if (savedColorScheme) {
          this.colorScheme = savedColorScheme;
        }

        const savedPrimaryColors = localStorage.getItem('primaryColors');
        if (savedPrimaryColors) {
          this.primaryColors = JSON.parse(savedPrimaryColors);
        }

        const savedSecondaryColors = localStorage.getItem('secondaryColors');
        if (savedSecondaryColors) {
          this.secondaryColors = JSON.parse(savedSecondaryColors);
        }

        console.log('颜色配置已加载:', {
          scheme: this.colorScheme,
          primary: this.primaryColors,
          secondary: this.secondaryColors
        });
      } catch (error) {
        console.error('加载颜色配置失败:', error);
        // 如果加载失败，使用默认配置
        this.resetToDefaultColors();
      }
    },

    // 保存颜色配置
    saveColorConfig() {
      try {
        localStorage.setItem('colorScheme', this.colorScheme);
        localStorage.setItem('primaryColors', JSON.stringify(this.primaryColors));
        localStorage.setItem('secondaryColors', JSON.stringify(this.secondaryColors));
        
        console.log('颜色配置已保存:', {
          scheme: this.colorScheme,
          primary: this.primaryColors,
          secondary: this.secondaryColors
        });

        // 显示保存成功提示
        alert('颜色配置保存成功！');
      } catch (error) {
        console.error('保存颜色配置失败:', error);
        alert('保存颜色配置失败，请重试！');
      }
    },

    // 重置为默认颜色
    resetToDefaultColors() {
      this.colorScheme = '4colors';
      this.primaryColors = [
        '#ffd74d', // 金黄色
        '#ec9351', // 橙色
        '#eb7250', // 橙红色
        '#ffcac0'  // 粉橙色
      ];
      this.secondaryColors = [
        '#FF6B35', // 暖橙色-活力橙
        '#F7931E', // 金橙色-阳光橙
        '#FFD23F', // 明黄色-柠檬黄
        '#FF4757'  // 暖红色-珊瑚红
      ];
      
      console.log('颜色配置已重置为默认值');
    },

    // 实时保存音量设置
    saveVolumeSettings() {
      localStorage.setItem('loopVolume', this.loopVolume);
      localStorage.setItem('rewardVolume', this.rewardVolume);
      localStorage.setItem('bgVolume', this.bgVolume);
      
      // 如果当前有试听音频在播放，更新其音量
      if (this.currentPreviewAudio) {
        // 根据当前播放的音频类型更新音量
        const audioSrc = this.currentPreviewAudio.src;
        if (audioSrc.includes('/loop/')) {
          this.currentPreviewAudio.volume = this.loopVolume;
        } else if (audioSrc.includes('/reward/')) {
          this.currentPreviewAudio.volume = this.rewardVolume;
        } else if (audioSrc.includes('/BJ/')) {
          this.currentPreviewAudio.volume = this.bgVolume;
        }
      }
      
      // 更新滑块的视觉效果
      this.$nextTick(() => {
        this.updateSliderBackground();
      });
    },

    // 更新滑块背景颜色以显示当前音量
    updateSliderBackground() {
      const updateSlider = (sliderId, value) => {
        const slider = document.getElementById(sliderId);
        if (slider) {
          const percentage = value * 100;
          slider.style.background = `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
        }
      };
      
      updateSlider('loopVolume', this.loopVolume);
      updateSlider('rewardVolume', this.rewardVolume);
      updateSlider('bgVolume', this.bgVolume);
    }
  },
  
  // 组件挂载后初始化滑块背景
  mounted() {
    this.$nextTick(() => {
      this.updateSliderBackground();
    });
  },
  
  // 添加监听器，实时保存音量变化
  watch: {
    loopVolume() {
      this.saveVolumeSettings();
    },
    rewardVolume() {
      this.saveVolumeSettings();
    },
    bgVolume() {
      this.saveVolumeSettings();
    }
  }
}; 
