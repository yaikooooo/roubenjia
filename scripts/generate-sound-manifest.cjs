const fs = require('fs');
const path = require('path');

const SUPPORTED_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a']);

function naturalSort(left, right) {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: 'base'
  });
}

function readAudioFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  return fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => SUPPORTED_AUDIO_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .sort(naturalSort);
}

function buildSoundManifest(projectRoot) {
  const soundsRoot = path.join(projectRoot, 'assets', 'sounds');
  return {
    generatedAt: new Date().toISOString(),
    loop: readAudioFiles(path.join(soundsRoot, 'loop')),
    reward: readAudioFiles(path.join(soundsRoot, 'reward')),
    background: readAudioFiles(path.join(soundsRoot, 'BJ')),
    voiceover: readAudioFiles(path.join(soundsRoot, 'peiyin'))
  };
}

function generateSoundManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, 'assets', 'sounds', 'manifest.json');
  const manifest = buildSoundManifest(projectRoot);
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`音频清单已生成 -> ${path.relative(projectRoot, manifestPath)}`);
  return manifest;
}

if (require.main === module) {
  const projectRoot = path.resolve(__dirname, '..');
  generateSoundManifest(projectRoot);
}

module.exports = {
  buildSoundManifest,
  generateSoundManifest
};
