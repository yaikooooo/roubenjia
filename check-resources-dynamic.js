const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const REWARD_CONFIG_PATH = path.join(ROOT_DIR, 'reward-config.json');

const requiredCoreFiles = [
  'index.html',
  'style.css',
  'main.js',
  'reward-config.json',
  'components/Draw.js',
  'components/Home.js',
  'components/Login.js',
  'components/SelectPool.js',
  'components/Config.js',
  'components/WinnerStats.js',
  'components/UIConfig.js',
  'assets/LOGO1.png',
  'assets/BABNNER.png',
  'assets/BJ.png',
  'assets/LOGO-NAME.png',
  'assets/LOGO1.png'
];

// 必需的音效文件（最基础的）
const requiredSoundFiles = [
  'assets/sounds/xuli.mp3' // 蓄力音效是必需的
];

// 可选的资源文件
const optionalFiles = [
  'assets/BABNNER.gif',
  'MD/README.md',
  'MD/图片格式支持说明.md'
];

// 支持的音频格式
const supportedAudioFormats = ['.mp3', '.wav', '.ogg', '.m4a'];

function checkFile(filePath) {
  try {
    return fs.existsSync(path.join(ROOT_DIR, filePath));
  } catch (error) {
    return false;
  }
}

function readRewardConfig() {
  const rawConfig = fs.readFileSync(REWARD_CONFIG_PATH, 'utf8');
  return JSON.parse(rawConfig);
}

function isLocalAssetPath(assetPath) {
  return typeof assetPath === 'string'
    && assetPath.length > 0
    && !assetPath.startsWith('http://')
    && !assetPath.startsWith('https://')
    && !assetPath.startsWith('data:');
}

function normalizeAssetPath(assetPath) {
  return assetPath.replace(/^\.\//, '').replace(/\\/g, '/');
}

function collectConfiguredAssetPaths(config) {
  const assetPaths = new Set();
  const resources = config?.ui_config?.resources || {};
  const groups = config?.groups || {};

  [resources.logo?.default, resources.banner?.default].forEach((assetPath) => {
    if (isLocalAssetPath(assetPath)) {
      assetPaths.add(normalizeAssetPath(assetPath));
    }
  });

  Object.values(groups).forEach((prizes) => {
    if (!Array.isArray(prizes)) {
      return;
    }

    prizes.forEach((prize) => {
      ['img_url', 'png_url', 'gif_url'].forEach((fieldName) => {
        const assetPath = prize?.[fieldName];
        if (isLocalAssetPath(assetPath)) {
          assetPaths.add(normalizeAssetPath(assetPath));
        }
      });
    });
  });

  return Array.from(assetPaths).sort();
}

function scanDirectory(dirPath) {
  try {
    const absoluteDirPath = path.join(ROOT_DIR, dirPath);
    if (!fs.existsSync(absoluteDirPath)) {
      return [];
    }
    
    const files = fs.readdirSync(absoluteDirPath);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return supportedAudioFormats.includes(ext);
    }).sort();
  } catch (error) {
    console.error(`扫描目录失败 ${dirPath}:`, error.message);
    return [];
  }
}

function scanSoundFiles() {
  console.log('🔍 扫描音效文件...');
  
  const soundDirs = [
    'assets/sounds/loop',
    'assets/sounds/reward',
    'assets/sounds/BJ'
  ];
  
  const soundFiles = {};
  
  soundDirs.forEach(dir => {
    const files = scanDirectory(dir);
    if (files.length > 0) {
      soundFiles[dir] = files;
      console.log(`   📁 ${dir}: 找到 ${files.length} 个音效文件`);
      files.forEach(file => {
        console.log(`      - ${file}`);
      });
    } else {
      console.log(`   📁 ${dir}: 无音效文件`);
    }
  });
  
  return soundFiles;
}

function updateSoundConfig(soundFiles) {
  try {
    // 更新 SelectPool.js 中的硬编码音效列表
    const selectPoolPath = 'components/SelectPool.js';
    if (fs.existsSync(selectPoolPath)) {
      let content = fs.readFileSync(selectPoolPath, 'utf8');
      
      // 构建新的音效配置
      const loopFiles = soundFiles['assets/sounds/loop'] || [];
      const rewardFiles = soundFiles['assets/sounds/reward'] || [];
      const bjFiles = soundFiles['assets/sounds/BJ'] || [];
      
      // 替换硬编码的音效列表
      const newSoundConfig = `'assets/sounds/loop/': ${JSON.stringify(loopFiles)},
        'assets/sounds/reward/': ${JSON.stringify(rewardFiles)},
        'assets/sounds/BJ/': ${JSON.stringify(bjFiles)}`;
      
      // 查找并替换音效配置部分
      const soundConfigRegex = /'assets\/sounds\/loop\/': \[.*?\],\s*'assets\/sounds\/reward\/': \[.*?\]/s;
      
      if (soundConfigRegex.test(content)) {
        content = content.replace(soundConfigRegex, 
          `'assets/sounds/loop/': ${JSON.stringify(loopFiles)},
        'assets/sounds/reward/': ${JSON.stringify(rewardFiles)}`);
        
        fs.writeFileSync(selectPoolPath, content, 'utf8');
        console.log('✅ 已更新 SelectPool.js 中的音效配置');
      }
    }
  } catch (error) {
    console.error('❌ 更新音效配置失败:', error.message);
  }
}

function checkResources() {
  console.log('🔍 正在检查资源文件...\n');
  
  let missingFiles = [];
  let missingOptionalFiles = [];
  
  // 检查核心必需文件
  requiredCoreFiles.forEach(file => {
    if (!checkFile(file)) {
      missingFiles.push(file);
    }
  });
  
  // 检查必需的音效文件
  requiredSoundFiles.forEach(file => {
    if (!checkFile(file)) {
      missingFiles.push(file);
    }
  });

  let configuredAssetPaths = [];

  try {
    const rewardConfig = readRewardConfig();
    configuredAssetPaths = collectConfiguredAssetPaths(rewardConfig);
    configuredAssetPaths.forEach((assetPath) => {
      if (!checkFile(assetPath)) {
        missingFiles.push(assetPath);
      }
    });
  } catch (error) {
    missingFiles.push(`reward-config.json 解析失败: ${error.message}`);
  }
  
  // 检查可选文件
  optionalFiles.forEach(file => {
    if (!checkFile(file)) {
      missingOptionalFiles.push(file);
    }
  });
  
  // 扫描音效文件
  const soundFiles = scanSoundFiles();
  
  // 更新音效配置
  updateSoundConfig(soundFiles);
  
  console.log('\n📊 资源检查结果：');
  
  // 输出结果
  if (missingFiles.length === 0) {
    console.log('✅ 所有必需资源文件检查通过！');
    console.log(`📦 已按当前奖池配置校验 ${configuredAssetPaths.length} 个实际引用资源`);
    
    if (missingOptionalFiles.length > 0) {
      console.log('\n⚠️  以下可选文件缺失（不影响运行）：');
      missingOptionalFiles.forEach(file => {
        console.log(`   - ${file}`);
      });
    }
    
    // 显示音效文件统计
    const totalSounds = Object.values(soundFiles).reduce((sum, files) => sum + files.length, 0);
    console.log(`\n🎵 音效文件统计: 共找到 ${totalSounds} 个音效文件`);
    
    console.log('\n🚀 系统可以正常启动！');
    return true;
  } else {
    console.log('❌ 发现缺失的必需资源文件：');
    missingFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
    
    console.log('\n💡 解决方案：');
    console.log('1. 确保 reward-config.json 中实际引用的本地资源都存在');
    console.log('2. 如果新增奖励复用旧资源，直接复用已有路径，不需要额外创建 P13-P16 文件');
    console.log('3. 音效文件会自动扫描，支持 .mp3, .wav, .ogg, .m4a 格式');
    
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const success = checkResources();
  process.exit(success ? 0 : 1);
}

module.exports = { checkResources, scanSoundFiles }; 
