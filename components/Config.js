const CONFIG_PRIZE_SLOT_COUNT = 16;
const CONFIG_LEGACY_PRIZE_ORDER_MAP = [0, 1, 2, 3, 10, 8, 9, 6, 5, 1, 4, 9, 8, 7, 11, 6];

const Config = {
  name: 'Config',
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <header class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">配置奖池</h1>
        <p class="text-gray-600">{{ isEditing ? '修改现有奖池' : '创建新奖池' }}</p>
      </header>
      
      <div v-if="!store.isAdmin" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
        <p>需要管理员权限</p>
        <button @click="$router.push('/login')" class="mt-2 bg-red-500 text-white py-2 px-4 rounded">
          去登录
        </button>
      </div>
      
      <div v-else>
        <!-- 操作模式选择 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-bold mb-4">操作选择</h2>
          <div class="flex space-x-4">
            <button 
              @click="switchToCreateMode" 
              class="py-2 px-4 rounded-md" 
              :class="!isEditing ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            >
              创建新奖池
            </button>
            <button 
              @click="showPoolSelector = true" 
              class="py-2 px-4 rounded-md" 
              :class="isEditing ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
            >
              修改现有奖池
            </button>
          </div>
          
          <!-- 奖池信息显示 -->
          <div v-if="groupId" class="mt-4 p-3 bg-gray-50 rounded-md">
            <p class="text-gray-700">
              当前操作奖池ID: <span class="font-bold">{{ groupId }}</span>
              <span v-if="isEditing" class="ml-2 text-sm text-gray-500">(修改模式)</span>
              <span v-else class="ml-2 text-sm text-gray-500">(新建模式)</span>
            </p>
            <p class="text-gray-500 mt-2">备注：{{ remark }}</p>
          </div>
        </div>
        
        <!-- 奖池选择器 -->
        <div v-if="showPoolSelector" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 class="text-xl font-bold mb-4">选择要修改的奖池</h2>
            
            <div v-if="loadingPools" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p class="ml-3 text-gray-600">正在加载奖池列表...</p>
            </div>
            
            <div v-else-if="Object.keys(existingGroups).length === 0" class="text-center py-8">
              <p class="text-gray-500">暂无可用奖池</p>
            </div>
            
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div 
                v-for="(prizes, id) in existingGroups" 
                :key="id"
                class="border rounded-lg p-3 relative"
                :class="id === 'G00' ? 'bg-yellow-50 border-yellow-300' : 'hover:bg-blue-50'"
              >
                <div 
                @click="selectPoolToEdit(id)"
                  class="cursor-pointer"
                  :class="id === 'G00' ? 'cursor-not-allowed' : 'cursor-pointer'"
              >
                <h3 class="font-bold flex items-center">
                  {{ id }}
                  <span v-if="id === 'G00'" class="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">默认奖池</span>
                </h3>
                <p class="text-sm text-gray-500">{{ prizes.length }} 个奖品</p>
                <p class="text-xs text-gray-400">{{ getRemark(id) }}</p>
                <p v-if="id === 'G00'" class="text-xs text-yellow-600 mt-1">⚠️ 受保护，仅可通过配置文件修改</p>
                </div>
                <!-- 删除按钮，G00不可删除，需要管理员权限 -->
                <button 
                  v-if="id !== 'G00' && store.isAdmin"
                  @click="confirmDeletePool(id)"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  title="删除奖池（管理员）"
                >
                  ✕
                </button>
                <span 
                  v-else
                  class="absolute top-2 right-2 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  title="默认奖池不可删除"
                >
                  🔒
                </span>
              </div>
            </div>
            
            <div class="flex justify-end mt-4">
              <button 
                @click="showPoolSelector = false" 
                class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
              >
                取消
              </button>
            </div>
          </div>
        </div>
        
        <!-- 删除奖池确认弹窗 -->
        <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 class="text-xl font-bold mb-4 text-red-600">⚠️ 确认删除奖池</h2>
            <div class="mb-6">
              <p class="text-gray-700 mb-2">您即将删除奖池 <span class="font-bold text-red-600">{{ poolToDelete }}</span></p>
              <p class="text-sm text-gray-600 mb-2">此操作将会：</p>
              <ul class="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>删除该奖池的所有配置信息</li>
                <li>删除该奖池的所有中奖记录</li>
              </ul>
              <p class="text-red-600 font-semibold mt-3">⚠️ 此操作不可恢复！</p>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                请输入奖池ID "<span class="font-bold">{{ poolToDelete }}</span>" 确认删除：
              </label>
              <input
                type="text"
                v-model="deleteConfirmText"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
                :class="{'border-red-500': deleteConfirmText && deleteConfirmText !== poolToDelete}"
                placeholder="输入奖池ID确认"
              />
            </div>
            
            <div v-if="deletingPool" class="mb-4 text-center">
              <div class="inline-flex items-center">
                <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500 mr-2"></div>
                <span class="text-gray-600">正在删除奖池数据...</span>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button 
                @click="cancelDeletePool" 
                class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                :disabled="deletingPool"
              >
                取消
              </button>
              <button 
                @click="executeDeletePool" 
                :disabled="deleteConfirmText !== poolToDelete || deletingPool"
                class="py-2 px-4 rounded-md"
                :class="deleteConfirmText === poolToDelete && !deletingPool 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
        

        

        
        <!-- 奖品表单 -->
        <form v-if="!showPoolSelector" @submit.prevent="validateAndSubmit" class="bg-white rounded-lg shadow-md p-6">
          <div class="mb-4 grid grid-cols-10 gap-y-4 gap-x-2 items-center font-semibold text-sm text-gray-700 border-b pb-2">
            <div class="col-span-2">奖品名称</div>
            <div class="col-span-3">奖品描述</div>
            <div class="col-span-1 flex items-center">权重
              <span class="ml-1 relative group cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><text x="12" y="16" text-anchor="middle" font-size="14" fill="currentColor">!</text></svg>
                <div class="absolute left-1/2 z-10 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg px-4 py-2 text-xs text-gray-700 w-64 -translate-x-1/2 mt-2">
                  权重决定中奖概率。每个奖品的概率 = 该奖品权重 ÷ 所有奖品权重之和。权重越大，被抽中的概率越高。
                </div>
              </span>
            </div>
            <div class="col-span-2">奖品ICON</div>
            <div class="col-span-2">弹窗图片</div>
          </div>
          
          <div v-for="(prize, index) in prizes" :key="index" class="grid grid-cols-10 gap-y-4 gap-x-2 items-center mb-4 pb-4 border-b border-gray-200">
            <!-- 奖品名称 -->
            <div class="col-span-2">
                <input
                  type="text"
                  v-model="prize.name"
                  :name="'prize-name-' + index"
                class="w-full px-3 py-2 border rounded-md" 
                placeholder="输入奖品名称（可选）"
              >
              </div>

            <!-- 奖品描述 -->
            <div class="col-span-3">
                <input
                  type="text"
                  v-model="prize.desc"
                  :name="'prize-desc-' + index"
                class="w-full px-3 py-2 border rounded-md" 
                placeholder="输入奖品描述（可选）"
              >
              </div>

            <!-- 权重 -->
            <div class="col-span-1">
              <input
                type="number"
                v-model="prize.weight"
                :name="'prize-weight-' + index"
                class="w-full px-3 py-2 border rounded-md" 
                :class="{'border-red-500': errors[index]?.weight}"
                min="0.1" 
                step="0.1"
              >
              <span v-if="errors[index]?.weight" class="text-xs text-red-500">{{ errors[index].weight }}</span>
            </div>

            <!-- ICON图片上传 -->
            <div class="col-span-2">
              <div class="flex items-center space-x-2">
                  <div class="relative">
                <input
                  type="file"
                  :name="'prize-img-' + index"
                    @change="handleFileChange($event, index, 'icon')" 
                    class="hidden" 
                    accept="image/*"
                    :id="'prize-img-' + index"
                  >
                  <label 
                    :for="'prize-img-' + index"
                    class="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
                  >
                    选择图片
                  </label>
                </div>
                <div v-if="prize.file || prize.originalImage" class="flex-1">
                  <img 
                    :src="prize.file ? URL.createObjectURL(prize.file) : prize.originalImage" 
                    class="w-12 h-12 object-contain"
                  >
                </div>
              </div>
              <span v-if="errors[index]?.img" class="text-xs text-red-500 block mt-1">{{ errors[index].img }}</span>
              </div>
              
            <!-- 弹窗图片上传 -->
            <div class="col-span-2">
              <div class="flex flex-col space-y-2">
                <!-- PNG上传 -->
                <div class="flex items-center space-x-2">
                  <div class="relative">
                    <input 
                      type="file" 
                      :name="'prize-png-' + index"
                      @change="handleFileChange($event, index, 'png')" 
                      class="hidden" 
                      accept="image/png"
                      :id="'prize-png-' + index"
                    >
                    <label 
                      :for="'prize-png-' + index"
                      class="cursor-pointer bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm"
                    >
                      选择PNG
                    </label>
                  </div>
                  <div v-if="prize.pngFile || prize.originalPng" class="flex-1">
                    <img 
                      :src="prize.pngFile ? URL.createObjectURL(prize.pngFile) : prize.originalPng" 
                      class="w-12 h-12 object-contain"
                    >
                </div>
                </div>
                <span v-if="errors[index]?.png" class="text-xs text-red-500">{{ errors[index].png }}</span>

                <!-- GIF上传（可选） -->
                <div class="flex items-center space-x-2">
                  <div class="relative">
                <input
                  type="file"
                  :name="'prize-gif-' + index"
                      @change="handleFileChange($event, index, 'gif')" 
                      class="hidden" 
                  accept="image/gif"
                      :id="'prize-gif-' + index"
                    >
                    <label 
                      :for="'prize-gif-' + index"
                      class="cursor-pointer bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 text-sm flex items-center"
                    >
                      选择GIF
                      <span class="ml-1 text-xs bg-purple-700 px-1 rounded">可选</span>
                    </label>
              </div>
                  <div v-if="prize.gifFile || prize.originalGif" class="flex-1">
                    <img 
                      :src="prize.gifFile ? URL.createObjectURL(prize.gifFile) : prize.originalGif" 
                      class="w-12 h-12 object-contain"
                    >
            </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between mt-6">
            <button 
              type="button" 
              @click="addPrize" 
              class="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none"
              :disabled="prizes.length >= prizeSlotCount"
              :class="{'opacity-50 cursor-not-allowed': prizes.length >= prizeSlotCount}"
            >
              添加奖品 ({{prizes.length}}/{{ prizeSlotCount }})
            </button>
            
            <div>
              <button 
                type="button" 
                @click="openRemarkDialog" 
                class="bg-yellow-400 text-white py-2 px-4 rounded-md hover:bg-yellow-500 focus:outline-none"
              >
                备注名称
              </button>
              
              <button 
                type="submit" 
                class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
                :disabled="submitting"
              >
                {{ submitting ? '提交中...' : (isEditing ? '保存修改' : '保存新奖池') }}
              </button>
              
              <button 
                type="button" 
                @click="$router.push('/home')" 
                class="ml-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                取消
              </button>
            </div>
          </div>
        </form>
        <!-- 备注弹窗 -->
        <div v-if="showRemarkDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 class="font-bold text-lg mb-3">设置奖池备注</h3>
            <input type="text" v-model="remark" class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4" placeholder="请输入备注名称">
            <div class="flex justify-end space-x-2">
              <button @click="showRemarkDialog = false" class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md">取消</button>
              <button @click="saveRemark" class="bg-blue-500 text-white py-2 px-4 rounded-md">保存</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  inject: ['store', 'utils'],
  data: function() {
    return {
      prizeSlotCount: CONFIG_PRIZE_SLOT_COUNT,
      groupId: '',
      prizes: [],
      errors: {},
      submitting: false,
      isEditing: false,
      showPoolSelector: false,
      existingGroups: {},
      loadingPools: false,
      remark: '',
      showRemarkDialog: false,
      remarksMap: {}, // groupId: remark
      displaySettingsMap: {}, // groupId: displaySettings
      firstError: null,
      // 删除奖池相关
      showDeleteConfirm: false,
      poolToDelete: '',
      deleteConfirmText: '',
      deletingPool: false,

    };
  },
  created: async function() {
    try {
      await this.switchToCreateMode();
    } catch (error) {
      console.error('初始化失败', error);
      this.utils.showToast('初始化失败');
    }
  },
  methods: {
    normalizePrizeSlots(prizes) {
      const prizeList = Array.isArray(prizes) ? prizes : [];

      if (prizeList.length === this.prizeSlotCount) {
        return prizeList.map(prize => this.toEditablePrize(prize));
      }

      if (prizeList.length === 12) {
        return CONFIG_LEGACY_PRIZE_ORDER_MAP.map((sourceIndex) => this.toEditablePrize(prizeList[sourceIndex]));
      }

      const normalized = prizeList.slice(0, this.prizeSlotCount).map(prize => this.toEditablePrize(prize));
      while (normalized.length < this.prizeSlotCount) {
        normalized.push(this.createEmptyPrize());
      }
      return normalized;
    },

    toEditablePrize(prize) {
      return {
        name: prize?.name || '',
        desc: prize?.desc || '',
        weight: prize?.weight || 1,
        img_url: prize?.img_url || null,
        originalImage: prize?.img_url || null,
        file: null,
        gif_url: prize?.gif_url || null,
        originalGif: prize?.gif_url || null,
        gifFile: null,
        gifLoadError: false,
        png_url: prize?.png_url || null,
        originalPng: prize?.png_url || null,
        pngFile: null,
        pngLoadError: false,
        isMystery: prize?.isMystery || false,
        type: prize?.type || null,
        errors: {}
      };
    },

    readFileAsDataUrl: function(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    getRemark: function(id) {
      return this.remarksMap[id] || id;
    },

    openRemarkDialog: function() {
      this.showRemarkDialog = true;
    },
    saveRemark: function() {
      this.showRemarkDialog = false;
      // 备注内容已绑定remark变量
    },
    switchToCreateMode: function() {
      this.isEditing = false;
      this.showPoolSelector = false;
      
      // 加载现有奖池配置以计算下一个ID
      return this.loadExistingPools().then(() => {
        // 自动生成下一个奖池ID
        this.groupId = this.utils.getNextGroupId(this.existingGroups);
        this.remark = this.groupId;
        
        // 初始化固定数量的空奖品
        this.prizes = [];
        for (let i = 0; i < this.prizeSlotCount; i++) {
          this.prizes.push(this.createEmptyPrize());
        }
      });
    },
    loadExistingPools: async function() {
      this.loadingPools = true;
      try {
        const config = await this.utils.getRewardConfig();
        this.existingGroups = config.groups || {};
        this.remarksMap = config.remarks || {};
        // 加载显示设置映射
        this.displaySettingsMap = config.displaySettings || {};
      } catch (error) {
        console.error('加载奖池配置失败', error);
        this.utils.showToast('加载奖池配置失败');
        this.existingGroups = {};
        this.remarksMap = {};
        this.displaySettingsMap = {};
      } finally {
        this.loadingPools = false;
      }
    },
    selectPoolToEdit: async function(poolId) {
      // G00为受保护的默认奖池，不允许在页面上修改
      if (poolId === 'G00') {
        this.utils.showToast('G00为默认奖池，受保护不可在页面修改。如需修改请直接编辑配置文件。');
        return;
      }
      
      this.isEditing = true;
      this.showPoolSelector = false;
      this.groupId = poolId;
      this.remark = this.remarksMap[poolId] || poolId;
      

      
      const poolPrizes = this.existingGroups[poolId] || [];
      this.prizes = this.normalizePrizeSlots(poolPrizes);
    },
    createEmptyPrize: function() {
      return {
        name: '',
        desc: '',
        weight: '1',
        img_url: null,
        originalImage: null,
        file: null,
        // GIF相关字段
        gif_url: null,
        originalGif: null,
        gifFile: null,
        gifLoadError: false,
        // PNG相关字段
        png_url: null,
        originalPng: null,
        pngFile: null,
        pngLoadError: false,
        isMystery: false,
        errors: {}
      };
    },
    addPrize: function() {
      if (this.prizes.length < this.prizeSlotCount) {
        this.prizes.push(this.createEmptyPrize());
      }
    },
    removePrize: function(index) {
      this.prizes.splice(index, 1);
      // 自动补充空奖品，保持总数固定
      while (this.prizes.length < this.prizeSlotCount) {
        this.prizes.push(this.createEmptyPrize());
      }
    },
    handleFileChange: function(event, index, type) {
      const file = event.target.files[0];
      if (!file) return;
      
      // 验证文件类型
      let validTypes;
      switch (type) {
        case 'icon':
          validTypes = ['image/png', 'image/jpeg', 'image/gif'];
          break;
        case 'gif':
          validTypes = ['image/gif'];
          break;
        case 'png':
          validTypes = ['image/png'];
          break;
        default:
          return;
      }

      if (!validTypes.includes(file.type)) {
        this.utils.showToast(`不支持的文件格式。请上传${validTypes.map(t => t.split('/')[1].toUpperCase()).join('、')}格式的文件`);
        event.target.value = '';
          return;
        }
        
      // 更新对应的文件
      switch (type) {
        case 'icon':
          this.prizes[index].file = file;
          break;
        case 'gif':
        this.prizes[index].gifFile = file;
          break;
        case 'png':
          this.prizes[index].pngFile = file;
          break;
      }

      // 清除原始图片URL（如果存在）
      switch (type) {
        case 'icon':
          this.prizes[index].originalImage = null;
          break;
        case 'gif':
          this.prizes[index].originalGif = null;
          break;
        case 'png':
          this.prizes[index].originalPng = null;
          break;
      }

      // 清除相关错误
      if (this.errors[index]) {
        switch (type) {
          case 'icon':
            delete this.errors[index].img;
            break;
          case 'gif':
            delete this.errors[index].gif;
            break;
          case 'png':
            delete this.errors[index].png;
            break;
        }
      }
    },
    generateFileHash: function(file) {
      // 实际项目中应使用真实的SHA1算法
      // 这里模拟一个随机哈希
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 10);
      return timestamp + random;
    },
    validateForm: function() {
      let isValid = true;
      this.errors = {};
      this.firstError = null;

      // 验证行数
      if (this.prizes.length !== this.prizeSlotCount) {
        this.errors.prizesCount = `奖品数量必须为${this.prizeSlotCount}个`;
        isValid = false;
      }

      // 验证每个奖品
      this.prizes.forEach((prize, index) => {
        // 验证权重
        if (!prize.weight || isNaN(prize.weight) || prize.weight <= 0) {
          if (!this.errors[index]) this.errors[index] = {};
          this.errors[index].weight = '权重必须大于0';
          if (!this.firstError) this.firstError = { index, field: 'weight' };
          isValid = false;
        }

        // 验证ICON图片
        if (!prize.img_url && !prize.file && !prize.originalImage) {
          if (!this.errors[index]) this.errors[index] = {};
          this.errors[index].img = '请上传奖品ICON图片';
          if (!this.firstError) this.firstError = { index, field: 'img' };
          isValid = false;
        }

        // 验证弹窗PNG图片（必填）
        if (!this.isEditing || prize.file || prize.gifFile || prize.pngFile) {  // 如果是新建或有任何图片更新
          if (!prize.png_url && !prize.pngFile && !prize.originalPng) {
            if (!this.errors[index]) this.errors[index] = {};
            this.errors[index].png = '请上传弹窗PNG图片';
            if (!this.firstError) this.firstError = { index, field: 'png' };
          isValid = false;
        }
        }
      });

      return isValid;
    },
    handleMysteryToggle: function(index) {
      const prize = this.prizes[index];
      if (prize.isMystery) {
        // 保存原始值
        prize._originalName = prize.name;
        prize._originalDesc = prize.desc;
        // 设置为神秘奖励
        prize.name = "神秘奖励";
        prize.desc = "神秘大奖等你开启";
      } else if (prize._originalName) {
        // 恢复原始值
        prize.name = prize._originalName;
        prize.desc = prize._originalDesc;
      }
    },
    validateAndSubmit: async function() {
      if (this.submitting) return;
      if (!this.validateForm()) {
        this.utils.showToast('表单验证失败，请检查所有输入项！');
        this.$nextTick(() => {
          if (this.firstError) {
            const { index, field } = this.firstError;
            let selector = '';
            if (field === 'name') selector = `input[name="prize-name-${index}"]`;
            if (field === 'desc') selector = `input[name="prize-desc-${index}"]`;
            if (field === 'weight') selector = `input[name="prize-weight-${index}"]`;
            if (field === 'img') selector = `input[name="prize-img-${index}"]`;
            const el = document.querySelector(selector);
            if (el) {
              el.focus();
              el.classList.add('input-error-blink');
              setTimeout(() => el.classList.remove('input-error-blink'), 1200);
            }
          }
        });
        return;
      }
      
      this.submitting = true;
      try {
        for (let i = 0; i < this.prizes.length; i++) {
          const prize = this.prizes[i];

          if (prize.file) {
            prize.img_url = await this.readFileAsDataUrl(prize.file);
            prize.originalImage = prize.img_url;
            prize.file = null;
          } else if (prize.originalImage) {
            prize.img_url = prize.originalImage;
          }

          if (prize.gifFile) {
            prize.gif_url = await this.readFileAsDataUrl(prize.gifFile);
            prize.originalGif = prize.gif_url;
            prize.gifFile = null;
          } else if (prize.originalGif) {
            prize.gif_url = prize.originalGif;
          }

          if (prize.pngFile) {
            prize.png_url = await this.readFileAsDataUrl(prize.pngFile);
            prize.originalPng = prize.png_url;
            prize.pngFile = null;
          } else if (prize.originalPng) {
            prize.png_url = prize.originalPng;
          }
        }

        const prizeArray = this.prizes.map((prize, index) => ({
          prize_id: `P${String(index + 1).padStart(2, '0')}`,
          name: prize.name,
          desc: prize.desc,
          weight: parseInt(prize.weight) || 1,
          img_url: prize.img_url,
          gif_url: prize.gif_url || null,
          png_url: prize.png_url || null,
          isMystery: prize.isMystery || false
        }));

        let config = await this.utils.getRewardConfig();
        if (!config.groups) config.groups = {};
        if (!config.remarks) config.remarks = {};
        if (!config.displaySettings) config.displaySettings = {};

        config.version = Date.now();
        config.groups[this.groupId] = prizeArray;
        config.remarks[this.groupId] = this.remark || this.groupId;

        const success = await this.utils.saveRewardConfig(config);
        if (success) {
          localStorage.setItem('lastGroupId', this.groupId);
          this.store.lastGroupId = this.groupId;
          this.utils.showToast(`奖池 ${this.groupId} 已${this.isEditing ? '更新' : '创建'}`);
          this.$router.push('/home');
        } else {
          this.utils.showToast('操作失败：本地配置保存失败');
        }

        return;
      } catch (error) {
        console.error('提交失败', error);
        this.utils.showToast('操作失败：' + (error.message || '未知错误'));
      } finally {
        this.submitting = false;
      }
    },

    // 确认删除奖池
    confirmDeletePool: function(poolId) {
      if (!this.store.isAdmin) {
        this.utils.showToast('删除操作需要管理员权限');
        return;
      }
      
      if (poolId === 'G00') {
        this.utils.showToast('默认奖池G00不可删除，只能修改');
        return;
      }
      
      this.poolToDelete = poolId;
      this.deleteConfirmText = '';
      this.showDeleteConfirm = true;
    },

    // 取消删除奖池
    cancelDeletePool: function() {
      this.showDeleteConfirm = false;
      this.poolToDelete = '';
      this.deleteConfirmText = '';
      this.deletingPool = false;
    },

    // 执行删除奖池
    executeDeletePool: async function() {
      if (this.deleteConfirmText !== this.poolToDelete) {
        this.utils.showToast('请正确输入奖池ID确认删除');
        return;
      }

      this.deletingPool = true;
      try {
        const poolId = this.poolToDelete;

        this.utils.showToast('正在删除本地配置信息...');
        let config = await this.utils.getRewardConfig();
        if (config.groups && config.groups[poolId]) {
          delete config.groups[poolId];
        }
        if (config.remarks && config.remarks[poolId]) {
          delete config.remarks[poolId];
        }
        if (config.displaySettings && config.displaySettings[poolId]) {
          delete config.displaySettings[poolId];
        }
        config.version = Date.now();

        const success = await this.utils.saveRewardConfig(config);
        if (!success) {
          throw new Error('保存本地配置失败');
        }

        try {
          const localLogs = JSON.parse(localStorage.getItem('lotteryLog') || '[]');
          const filteredLogs = localLogs.filter(log => log.groupId !== poolId);
          localStorage.setItem('lotteryLog', JSON.stringify(filteredLogs));
          this.store.lotteryLog = filteredLogs;
        } catch (e) {}

        this.existingGroups = config.groups || {};
        this.remarksMap = config.remarks || {};

        this.utils.showToast(`奖池 ${poolId} 已成功删除`);
        this.cancelDeletePool();
        
        if (this.isEditing && this.groupId === poolId) {
          await this.switchToCreateMode();
        }

      } catch (error) {
        console.error('删除奖池失败:', error);
        this.utils.showToast('删除失败: ' + (error.message || '未知错误'));
      } finally {
        this.deletingPool = false;
      }
    }
  }
};

// 全局注册组件
window.Config = Config; 
