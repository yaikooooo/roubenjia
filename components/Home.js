const Home = {
  name: 'Home',
  template: `
    <div class="container mx-auto px-4 py-8 max-w-3xl">
      <header class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">抽奖系统</h1>
        <p class="text-gray-600" v-if="store.lastGroupId">当前奖池: {{ store.lastGroupId }}</p>
        <p class="text-gray-600" v-else>未选择奖池</p>
      </header>
      
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-blue-500 text-white p-4">
            <h2 class="text-xl font-semibold">开始抽奖</h2>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">点击开始进行抽奖</p>
            <button 
              @click="$router.push('/draw')" 
              class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
              :disabled="!store.lastGroupId"
              :class="{'opacity-50 cursor-not-allowed': !store.lastGroupId}"
            >
              开始抽奖
            </button>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-green-500 text-white p-4">
            <h2 class="text-xl font-semibold">选择奖池</h2>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">从现有奖池中选择</p>
            <button 
              @click="$router.push('/select-pool')" 
              class="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none"
            >
              选择奖池
            </button>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-purple-500 text-white p-4">
            <h2 class="text-xl font-semibold">配置奖池</h2>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">创建或修改奖池配置</p>
            <button 
              @click="$router.push('/config')" 
              class="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none"
              :disabled="!store.isAdmin"
              :class="{'opacity-50 cursor-not-allowed': !store.isAdmin}"
            >
              配置奖池
            </button>
            <p v-if="!store.isAdmin" class="text-xs text-red-500 mt-2">需要管理员权限</p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-orange-500 text-white p-4">
            <h2 class="text-xl font-semibold">界面设置</h2>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">调整界面和特效设置</p>
            <button 
              @click="$router.push('/ui-config')" 
              class="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none"
              :disabled="!store.isAdmin"
              :class="{'opacity-50 cursor-not-allowed': !store.isAdmin}"
            >
              界面设置
            </button>
            <p v-if="!store.isAdmin" class="text-xs text-red-500 mt-2">需要管理员权限</p>
          </div>
        </div>
      </div>
      
      <!-- 新增：查看中奖情况入口 -->
      <div class="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-yellow-500 text-white p-4">
          <h2 class="text-xl font-semibold">中奖统计</h2>
        </div>
        <div class="p-6">
          <p class="text-gray-600 mb-4">查看各奖品的中奖情况统计</p>
          <button 
            @click="$router.push('/winner-stats')" 
            class="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none"
          >
            查看统计
          </button>
        </div>
      </div>

      <div v-if="store.lotteryLog && store.lotteryLog.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">中奖记录</h2>
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">奖池</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">奖品</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(log, index) in store.lotteryLog.slice().reverse()" :key="index">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(log.timestamp).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  G{{ log.groupId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                  <img v-if="log.prize.img_url" :src="log.prize.img_url" class="w-8 h-8 mr-2 object-contain">
                  {{ log.prize.name }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  inject: ['store'],
}; 
