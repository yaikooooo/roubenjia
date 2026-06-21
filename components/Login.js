const Login = {
  name: 'Login',
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center">抽奖系统登录</h1>
        
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input 
              type="text" 
              v-model="username" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{'input-error': errors.username}"
              placeholder="请输入用户名"
            >
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input 
              type="password" 
              v-model="password" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{'input-error': errors.password}"
              placeholder="请输入密码"
            >
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>
          
          <div class="flex space-x-4">
            <button 
              type="submit" 
              class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              登录
            </button>
            <button 
              type="button" 
              @click="skipLogin" 
              class="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              跳过登录
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  inject: ['store', 'utils'],
  data() {
    return {
      username: '',
      password: '',
      errors: {
        username: '',
        password: ''
      }
    };
  },
  created() {
    // 如果URL包含skip参数，自动跳过登录
    if (window.location.search.includes('skip')) {
      this.skipLogin();
    }
  },
  methods: {
    // 登录验证
    handleLogin() {
      // 重置错误信息
      this.errors = {
        username: '',
        password: ''
      };

      // 表单验证
      if (!this.username) {
        this.errors.username = '请输入用户名';
      }
      
      if (!this.password) {
        this.errors.password = '请输入密码';
      }

      // 如果有错误，阻止提交
      if (this.errors.username || this.errors.password) {
        return;
      }

      // 验证账号密码
      if (this.username === 'admin' && this.password === '123456') {
        localStorage.setItem('isAdmin', 'true');
        this.store.isAdmin = true;
        this.$router.push('/home');
      } else {
        this.utils.showToast('账号或密码错误');
      }
    },
    
    // 跳过登录
    skipLogin() {
      localStorage.setItem('isAdmin', 'false');
      this.store.isAdmin = false;
      this.$router.push('/home');
    }
  }
}; 