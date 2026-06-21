const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const REWARD_CONFIG_PATH = path.join(ROOT_DIR, 'reward-config.json');

const requiredFiles = [
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
  'assets/LOGO1.png',
  'assets/sounds/xuli.mp3'
];

const optionalFiles = [
  'assets/BABNNER.gif',
  'MD/README.md',
  'MD/图片格式支持说明.md'
];

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

function checkConfiguredAssets(config) {
  return collectConfiguredAssetPaths(config).filter((assetPath) => !checkFile(assetPath));
}

function checkResources() {
  console.log('🔍 正在检查资源文件...\n');

  const missingFiles = [];
  const missingOptionalFiles = [];
  let configuredAssetPaths = [];

  requiredFiles.forEach((file) => {
    if (!checkFile(file)) {
      missingFiles.push(file);
    }
  });

  let configuredAssets = [];

  try {
    const rewardConfig = readRewardConfig();
    configuredAssetPaths = collectConfiguredAssetPaths(rewardConfig);
    missingFiles.push(...configuredAssetPaths.filter((assetPath) => !checkFile(assetPath)));
  } catch (error) {
    missingFiles.push(`reward-config.json 解析失败: ${error.message}`);
  }

  optionalFiles.forEach((file) => {
    if (!checkFile(file)) {
      missingOptionalFiles.push(file);
    }
  });

  if (missingFiles.length === 0) {
    console.log('✅ 所有必需资源文件检查通过！');
    console.log(`📦 已按当前奖池配置校验 ${configuredAssetPaths.length} 个实际引用资源`);

    if (missingOptionalFiles.length > 0) {
      console.log('\n⚠️  以下可选文件缺失（不影响运行）：');
      missingOptionalFiles.forEach((file) => {
        console.log(`   - ${file}`);
      });
    }

    console.log('\n🚀 系统可以正常启动！');
    return true;
  }

  console.log('❌ 发现缺失的必需资源文件：');
  missingFiles.forEach((file) => {
    console.log(`   - ${file}`);
  });

  console.log('\n💡 解决方案：');
  console.log('1. 确保 reward-config.json 中实际引用的本地资源都存在');
  console.log('2. 如果新增奖励复用旧资源，直接复用已有路径，不需要额外创建 P13-P16 文件');
  console.log('3. 检查文件路径和文件名是否正确');

  return false;
}

if (require.main === module) {
  const success = checkResources();
  process.exit(success ? 0 : 1);
}

module.exports = { checkResources };
