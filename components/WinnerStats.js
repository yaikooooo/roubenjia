const WinnerStats = {
  name: 'WinnerStats',
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <header class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">中奖统计</h1>
        <button @click="$router.push('/home')" class="text-blue-500 hover:text-blue-700">&larr; 返回首页</button>
      </header>

      <div v-if="loading" class="text-center"><p>加载统计数据中...</p></div>
      <div v-else-if="error" class="text-center text-red-500"><p>{{ error }}</p></div>
      
      <div v-else>
        <!-- 店名选择 -->
        <div class="mb-6 bg-white rounded-lg shadow-md p-4">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">选择店铺</h2>
          <div v-if="availableStores.length === 0" class="text-center text-gray-500">
            <p>暂无店铺数据，请先进行抽奖</p>
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <button 
              v-for="store in availableStores" 
              :key="store" 
              @click="selectStore(store)"
              :class="[
                'p-4 border rounded-lg transition-all duration-200 hover:shadow-md',
                selectedStoreName === store ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'
              ]"
            >
              <h3 class="font-semibold">{{ store }}</h3>
              <p class="text-sm text-gray-500">{{ getStoreLogCount(store) }} 条记录</p>
            </button>
          </div>
        </div>

        <div v-if="selectedStoreName && currentStoreLogs.length > 0">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold text-gray-700">{{ selectedStoreName }} 的统计</h2>
            <button 
              v-if="store.isAdmin"
              @click="confirmDeleteStoreData" 
              class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              title="删除店铺数据（管理员）"
            >
              🗑️ 删除店铺数据
            </button>
          </div>

          <!-- 时间筛选器 -->
          <div class="mb-6 bg-white rounded-lg shadow-md p-4">
            <div class="flex flex-wrap items-center gap-4">
              <h3 class="text-lg font-semibold text-gray-700">时间筛选：</h3>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="filter in timeFilters" 
                  :key="filter.key"
                  @click="selectedTimeFilter = filter.key"
                  :class="[
                    'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    selectedTimeFilter === filter.key 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ filter.label }}
                </button>
              </div>
              <div class="text-sm text-gray-500">
                共 {{ filteredLogs.length }} 条记录 
                <span v-if="selectedTimeFilter !== 'all'">(已筛选)</span>
              </div>
            </div>
            
            <!-- 自定义日期范围 -->
            <div v-if="selectedTimeFilter === 'custom'" class="mt-4 flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">开始日期：</label>
                <input 
                  type="date" 
                  v-model="customStartDate"
                  class="px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">结束日期：</label>
                <input 
                  type="date" 
                  v-model="customEndDate"
                  class="px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <button 
                @click="applyCustomDateFilter"
                class="px-4 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
              >
                应用筛选
              </button>
            </div>
          </div>
          
          <!-- 奖池 Tabs -->
          <div class="mb-4 border-b border-gray-200">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <button 
                v-for="poolId in getPoolsForFilteredLogs()" 
                :key="poolId" 
                @click="selectedPoolId = poolId"
                :class="[
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                  selectedPoolId === poolId ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                奖池 {{ poolId }} ({{ getPoolStatsCount(poolId) }}条)
              </button>
            </nav>
          </div>

          <div v-if="selectedPoolId">
            <h3 class="text-xl font-medium text-gray-600 mb-3">
              奖池 {{ selectedPoolId }} 奖品统计
              <span class="text-sm text-gray-500">({{ getCurrentTimeFilterLabel() }})</span>
            </h3>
            <div class="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" class="divide-y divide-gray-200">
                <li v-for="(count, prizeName) in getStatsForPool(selectedPoolId)" :key="prizeName" class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-indigo-600 truncate">{{ prizeName }}</p>
                    <div class="flex items-center gap-4">
                      <p class="text-sm text-gray-900">{{ count }} 次</p>
                      <p class="text-xs text-gray-500">{{ getPercentage(count) }}%</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <!-- 在这里你可以使用 Chart.js 来渲染图表 -->
            <!-- <canvas ref="prizeChart" class="mt-4"></canvas> -->
          </div>
          <div v-else class="text-center text-gray-500"><p>请选择一个奖池查看统计。</p></div>
        </div>
        <div v-else-if="selectedStoreName" class="text-center text-gray-500">
          <p>该店铺暂无抽奖记录</p>
        </div>
        <div v-else class="text-center text-gray-500"><p>请选择一个店铺查看统计。</p></div>
      </div>

      <!-- 删除店铺数据确认弹窗 -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 class="text-xl font-bold mb-4 text-red-600">⚠️ 确认删除店铺数据</h2>
          <div class="mb-6">
            <p class="text-gray-700 mb-2">您即将删除店铺 <span class="font-bold text-red-600">{{ selectedStoreName }}</span> 的所有数据</p>
            <p class="text-sm text-gray-600 mb-2">此操作将会：</p>
            <ul class="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>删除该店铺的所有抽奖记录</li>
              <li>无法恢复任何历史数据</li>
            </ul>
            <p class="text-red-600 font-semibold mt-3">⚠️ 此操作不可恢复！</p>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              请输入店铺名称 "<span class="font-bold">{{ selectedStoreName }}</span>" 确认删除：
            </label>
            <input
              type="text"
              v-model="deleteConfirmText"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              :class="{'border-red-500': deleteConfirmText && deleteConfirmText !== selectedStoreName}"
              placeholder="输入店铺名称确认"
            />
          </div>
          
          <div v-if="deletingStore" class="mb-4 text-center">
            <div class="inline-flex items-center">
              <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500 mr-2"></div>
              <span class="text-gray-600">正在删除店铺数据...</span>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="cancelDeleteStore" 
              class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
              :disabled="deletingStore"
            >
              取消
            </button>
            <button 
              @click="executeDeleteStore" 
              :disabled="deleteConfirmText !== selectedStoreName || deletingStore"
              class="py-2 px-4 rounded-md"
              :class="deleteConfirmText === selectedStoreName && !deletingStore 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  inject: ['store', 'utils'],
  data() {
    return {
      loading: true,
      error: null,
      availableStores: [], // 可用的店铺列表
      selectedStoreName: null,
      selectedPoolId: null,
      currentStoreLogs: [], // 当前选中店铺的日志
      storeLogCounts: {}, // 各店铺的记录数量
      // 删除店铺数据相关
      showDeleteConfirm: false,
      deleteConfirmText: '',
      deletingStore: false,
      // 时间筛选相关
      selectedTimeFilter: 'all',
      customStartDate: '',
      customEndDate: '',
      timeFilters: [
        { key: 'all', label: '全部时间', type: 'all' },
        { key: 'current_month', label: '当月', type: 'month', offset: 0 },
        { key: 'last_month', label: '上月', type: 'month', offset: 1 },
        { key: 'last_2_month', label: '第3月', type: 'month', offset: 2 },
        { key: 'last_3_month', label: '第4月', type: 'month', offset: 3 },
        { key: 'last_4_month', label: '第5月', type: 'month', offset: 4 },
        { key: 'last_5_month', label: '第6月', type: 'month', offset: 5 },
        { key: 'custom', label: '自定义时间', type: 'custom' }
      ]
    };
  },
  computed: {
    // 根据时间筛选条件过滤日志
    filteredLogs() {
      if (!this.currentStoreLogs || this.currentStoreLogs.length === 0) {
        return [];
      }

      if (this.selectedTimeFilter === 'all') {
        return this.currentStoreLogs;
      }

      const currentFilter = this.timeFilters.find(f => f.key === this.selectedTimeFilter);
      
      if (this.selectedTimeFilter === 'custom') {
        // 自定义时间范围
        if (!this.customStartDate || !this.customEndDate) {
          return this.currentStoreLogs;
        }
        const startDate = new Date(this.customStartDate);
        const endDate = new Date(this.customEndDate);
        endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
        
        return this.currentStoreLogs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= startDate && logDate <= endDate;
        });
      }

      // 处理自然月过滤
      if (currentFilter.type === 'month') {
        const now = new Date();
        const targetMonth = new Date(now.getFullYear(), now.getMonth() - currentFilter.offset, 1);
        const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999);

        return this.currentStoreLogs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= monthStart && logDate <= monthEnd;
        });
      }

      return this.currentStoreLogs;
    }
  },
  async mounted() {
    try {
      this.loadFromLocalBackup();
    } catch (err) {
      console.error('加载本地统计数据失败:', err);
      this.error = '加载本地统计数据失败。';
    }
    this.loading = false;
  },
  methods: {
    // 备用方案：从本地localStorage加载
    loadFromLocalBackup() {
      try {
        const localLogs = JSON.parse(localStorage.getItem('lotteryLog') || '[]');
        if (localLogs.length > 0) {
          const localStores = [...new Set(localLogs.map(log => log.storeName || '未知店铺'))];
          this.availableStores = localStores.sort();
          
          // 计算每个店铺的记录数
          localStores.forEach(store => {
            this.storeLogCounts[store] = localLogs.filter(log => (log.storeName || '未知店铺') === store).length;
          });
          
          const localStoreName = localStorage.getItem('storeName');
          if (localStoreName && this.availableStores.includes(localStoreName)) {
            this.selectStoreFromLocal(localStoreName, localLogs);
          } else if (this.availableStores.length > 0) {
            this.selectStoreFromLocal(this.availableStores[0], localLogs);
          }
        }
      } catch (error) {
        console.error('从本地加载日志失败:', error);
        this.error = '加载统计数据失败，且本地数据也无法解析。';
      }
    },
    
    // 选择店铺并加载其日志
    selectStore(storeName) {
      const allLogs = JSON.parse(localStorage.getItem('lotteryLog') || '[]');
      this.selectStoreFromLocal(storeName, allLogs);
    },
    
    // 从本地数据选择店铺（备用方案）
    selectStoreFromLocal(storeName, allLogs) {
      this.selectedStoreName = storeName;
      this.selectedPoolId = null;
      this.currentStoreLogs = allLogs.filter(log => (log.storeName || '未知店铺') === storeName);
      
      this.selectedTimeFilter = 'all';
      this.customStartDate = '';
      this.customEndDate = '';

      this.$nextTick(() => {
        const pools = this.getPoolsForFilteredLogs();
        this.selectedPoolId = pools.length > 0 ? pools[0] : null;
      });
    },
    
    // 获取店铺记录数量
    getStoreLogCount(storeName) {
      return this.storeLogCounts[storeName] || 0;
    },
    
    // 获取当前店铺的奖池列表
    getPoolsForCurrentStore() {
      if (!this.currentStoreLogs || this.currentStoreLogs.length === 0) return [];
      const pools = this.currentStoreLogs.map(log => log.groupId);
      return [...new Set(pools)].sort();
    },

    // 获取筛选后数据的奖池列表
    getPoolsForFilteredLogs() {
      if (!this.filteredLogs || this.filteredLogs.length === 0) return [];
      const pools = this.filteredLogs.map(log => log.groupId);
      return [...new Set(pools)].sort();
    },

    // 获取指定奖池在筛选时间范围内的记录数
    getPoolStatsCount(poolId) {
      if (!this.filteredLogs || this.filteredLogs.length === 0) return 0;
      return this.filteredLogs.filter(log => log.groupId === poolId).length;
    },
    
    // 获取指定奖池的统计（使用筛选后的数据）
    getStatsForPool(poolId) {
      if (!this.filteredLogs || this.filteredLogs.length === 0) return {};
      const stats = {};
      this.filteredLogs
        .filter(log => log.groupId === poolId)
        .forEach(log => {
          const prizeName = log.prize.name;
          stats[prizeName] = (stats[prizeName] || 0) + 1;
        });
      return stats;
    },

    // 计算百分比
    getPercentage(count) {
      if (!this.selectedPoolId) return 0;
      const totalCount = this.getPoolStatsCount(this.selectedPoolId);
      if (totalCount === 0) return 0;
      return Math.round((count / totalCount) * 100);
    },

    // 获取当前时间筛选的标签
    getCurrentTimeFilterLabel() {
      if (this.selectedTimeFilter === 'all') {
        return '全部时间';
      }
      if (this.selectedTimeFilter === 'custom') {
        return `${this.customStartDate} 至 ${this.customEndDate}`;
      }
      
      const currentFilter = this.timeFilters.find(f => f.key === this.selectedTimeFilter);
      if (currentFilter.type === 'month') {
        const now = new Date();
        const targetMonth = new Date(now.getFullYear(), now.getMonth() - currentFilter.offset, 1);
        return `${targetMonth.getFullYear()}年${targetMonth.getMonth() + 1}月`;
      }
      
      return currentFilter.label;
    },

    // 应用自定义日期筛选
    applyCustomDateFilter() {
      if (!this.customStartDate || !this.customEndDate) {
        this.utils.showToast('请选择开始和结束日期');
        return;
      }
      
      if (new Date(this.customStartDate) > new Date(this.customEndDate)) {
        this.utils.showToast('开始日期不能晚于结束日期');
        return;
      }

      // 重新选择第一个可用的奖池
      const pools = this.getPoolsForFilteredLogs();
      if (pools.length > 0) {
        this.selectedPoolId = pools[0];
      } else {
        this.selectedPoolId = null;
      }
      
      this.utils.showToast('自定义时间筛选已应用');
    },
    
    // 确认删除店铺数据
    confirmDeleteStoreData() {
      if (!this.store.isAdmin) {
        this.utils.showToast('删除操作需要管理员权限');
        return;
      }
      
      this.deleteConfirmText = '';
      this.showDeleteConfirm = true;
    },

    // 取消删除店铺数据
    cancelDeleteStore() {
      this.showDeleteConfirm = false;
      this.deleteConfirmText = '';
      this.deletingStore = false;
    },

    // 执行删除店铺数据
    async executeDeleteStore() {
      if (this.deleteConfirmText !== this.selectedStoreName) {
        this.utils.showToast('请正确输入店铺名称确认删除');
        return;
      }

      this.deletingStore = true;
      try {
        const storeName = this.selectedStoreName;
        
        // 清除本地缓存数据
        delete this.storeLogCounts[storeName];
        this.availableStores = this.availableStores.filter(store => store !== storeName);
        
        // 清除本地localStorage中的相关数据
        try {
          const localLogs = JSON.parse(localStorage.getItem('lotteryLog') || '[]');
          const filteredLogs = localLogs.filter(log => (log.storeName || '未知店铺') !== storeName);
          localStorage.setItem('lotteryLog', JSON.stringify(filteredLogs));
          if (this.store && Array.isArray(this.store.lotteryLog)) {
            this.store.lotteryLog = filteredLogs;
          }
        } catch (error) {
          console.warn('清理本地数据时出现错误:', error);
        }

        this.utils.showToast(`店铺 ${storeName} 的数据已成功删除`);
        this.cancelDeleteStore();
        
        // 重置当前选择
        this.selectedStoreName = null;
        this.selectedPoolId = null;
        this.currentStoreLogs = [];

      } catch (error) {
        console.error('删除店铺数据失败:', error);
        this.utils.showToast('删除失败: ' + (error.message || '未知错误'));
      } finally {
        this.deletingStore = false;
      }
    },

    // 你需要在这里添加渲染图表的方法，例如：
    // renderChart() {
    //   if (!this.selectedPoolId || !this.selectedStoreName) return;
    //   const chartData = this.getStatsForPool(this.selectedPoolId);
    //   const ctx = this.$refs.prizeChart.getContext('2d');
    //   new Chart(ctx, {
    //     type: 'bar', // 或 'pie', 'line' 等
    //     data: {
    //       labels: Object.keys(chartData),
    //       datasets: [{
    //         label: '中奖次数',
    //         data: Object.values(chartData),
    //         backgroundColor: 'rgba(75, 192, 192, 0.2)',
    //         borderColor: 'rgba(75, 192, 192, 1)',
    //         borderWidth: 1
    //       }]
    //     },
    //     options: { scales: { y: { beginAtZero: true } } }
    //   });
    // }
  },
  watch: {
    // 监听时间筛选变化，自动选择第一个可用奖池
    selectedTimeFilter(newFilter) {
      // 重置自定义日期
      if (newFilter !== 'custom') {
        this.customStartDate = '';
        this.customEndDate = '';
      }
      
      // 重新选择奖池
      this.$nextTick(() => {
        const pools = this.getPoolsForFilteredLogs();
        if (pools.length > 0) {
          this.selectedPoolId = pools[0];
      } else {
        this.selectedPoolId = null;
      }
      });
    },

    // 监听筛选后的数据变化
    filteredLogs() {
      // 如果当前选择的奖池在筛选后的数据中不存在，重新选择
      const pools = this.getPoolsForFilteredLogs();
      if (this.selectedPoolId && !pools.includes(this.selectedPoolId)) {
        this.selectedPoolId = pools.length > 0 ? pools[0] : null;
      }
    }

    // selectedPoolId(newPool) {
    //   this.$nextTick(() => {
    //      this.renderChart(); // 当奖池变化时重新渲染图表
    //   });
    // }
  }
}; 
