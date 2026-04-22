<template>
  <div class="audio-subtitle-container">
    <h1>音频字幕提取</h1>
    
    <div class="upload-section">
      <div class="drop-zone" @dragover="handleDragOver" @drop="handleDrop" @dragleave="handleDragLeave"
           @click="triggerFileSelect" :class="{ 'drag-over': isDraggingOver }">
        <p v-if="!audioFile">拖拽音频文件到这里或点击选择</p>
        <p v-else>已选择: {{ audioFile.name }}</p>
        <input type="file" ref="fileInput" @change="handleFileChange" accept="audio/*" style="display: none;">
      </div>
      
      <div class="controls">
        <button @click="loadAudio" :disabled="!audioFile || isProcessing" class="primary-btn">
          {{ isProcessing ? '处理中...' : '开始处理' }}
        </button>
        <button @click="clearAudio" v-if="audioFile" :disabled="isProcessing">清除</button>
      </div>
    </div>

    <!-- 显示音频波形 -->
    <div v-if="audioData" class="waveform-container">
      <h2>音频波形</h2>
      <canvas ref="waveformCanvas" class="waveform-canvas"></canvas>
    </div>

    <!-- 时间轴和字幕编辑 -->
    <div v-if="audioData" class="subtitle-editor">
      <h2>字幕编辑</h2>
      
      <div class="playback-controls">
        <button @click="playPauseAudio" class="control-btn">
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
        <input type="range" 
               v-model="currentTime" 
               :min="0" 
               :max="duration" 
               step="0.1" 
               class="time-slider"
               @input="seekAudio">
        <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>
      
      <div class="subtitle-list">
        <div v-for="(subtitle, index) in subtitles" :key="index" 
             :class="['subtitle-item', { active: isActiveSubtitle(index) }]"
             @click="selectSubtitle(index)">
          <div class="time-range">
            {{ formatTime(subtitle.start) }} - {{ formatTime(subtitle.end) }}
          </div>
          <div class="subtitle-text">
            <input type="text" 
                   v-model="subtitle.text" 
                   @blur="updateSubtitlesImage"
                   placeholder="输入字幕文本...">
          </div>
        </div>
      </div>
      
      <div class="subtitle-actions">
        <button @click="addSubtitleAtCurrentTime" class="secondary-btn">在当前位置添加字幕</button>
        <button @click="exportSubtitles" class="primary-btn">导出字幕</button>
      </div>
    </div>

    <!-- 预览和导出 -->
    <div v-if="subtitles.length > 0" class="preview-section">
      <h2>字幕预览</h2>
      <div class="subtitle-preview-area">
        <img :src="subtitlesImage" alt="字幕预览" v-if="subtitlesImage">
      </div>
      <button @click="downloadSubtitlesImage" class="primary-btn">下载字幕图片</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 响应式数据
const audioFile = ref(null);
const fileInput = ref(null);
const waveformCanvas = ref(null);
const isDraggingOver = ref(false);
const isProcessing = ref(false);
const audioData = ref(null);
const duration = ref(0);
const currentTime = ref(0);
const isPlaying = ref(false);
const subtitles = ref([]);
const subtitlesImage = ref('');
const audioContext = ref(null);
const audioSource = ref(null);
const analyser = ref(null);
const audioElement = ref(null);

// 文件处理方法
const handleDragOver = (e) => {
  e.preventDefault();
  isDraggingOver.value = true;
};

const handleDragLeave = () => {
  isDraggingOver.value = false;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDraggingOver.value = false;
  
  if (e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    if (file.type.startsWith('audio/')) {
      audioFile.value = file;
    }
  }
};

const triggerFileSelect = () => {
  fileInput.value.click();
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('audio/')) {
    audioFile.value = file;
  }
};

const loadAudio = async () => {
  if (!audioFile.value) return;
  
  isProcessing.value = true;
  
  try {
    // 创建音频元素
    const url = URL.createObjectURL(audioFile.value);
    audioElement.value = new Audio(url);
    
    // 等待音频元数据加载
    await new Promise((resolve) => {
      audioElement.value.onloadedmetadata = () => {
        duration.value = audioElement.value.duration;
        resolve();
      };
    });
    
    // 初始化Web Audio API
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
    audioSource.value = audioContext.value.createMediaElementSource(audioElement.value);
    analyser.value = audioContext.value.createAnalyser();
    
    audioSource.value.connect(analyser.value);
    analyser.value.connect(audioContext.value.destination);
    
    // 准备绘制波形
    drawWaveform();
    
    audioData.value = true;
  } catch (error) {
    console.error('加载音频失败:', error);
  } finally {
    isProcessing.value = false;
  }
};

const drawWaveform = () => {
  if (!analyser.value || !waveformCanvas.value) return;
  
  const canvas = waveformCanvas.value;
  const ctx = canvas.getContext('2d');
  
  // 设置画布尺寸
  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;
  
  const bufferLength = analyser.value.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  const draw = () => {
    if (!analyser.value) return;
    
    requestAnimationFrame(draw);
    analyser.value.getByteTimeDomainData(dataArray);
    
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 123, 255)';
    ctx.beginPath();
    
    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };
  
  draw();
};

const playPauseAudio = () => {
  if (!audioElement.value) return;
  
  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play();
  }
  
  isPlaying.value = !isPlaying.value;
};

const seekAudio = () => {
  if (audioElement.value) {
    audioElement.value.currentTime = currentTime.value;
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.floor(Math.abs(seconds) % 60);
  const ms = Math.floor((Math.abs(seconds) * 100) % 100);
  
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const isActiveSubtitle = (index) => {
  return subtitles.value[index].start <= currentTime.value && 
         subtitles.value[index].end >= currentTime.value;
};

const selectSubtitle = (index) => {
  currentTime.value = subtitles.value[index].start;
  seekAudio();
};

const addSubtitleAtCurrentTime = () => {
  subtitles.value.push({
    start: currentTime.value,
    end: currentTime.value + 3, // 默认持续3秒
    text: ''
  });
  
  updateSubtitlesImage();
};

const exportSubtitles = () => {
  // 这里可以实现导出字幕文件的功能
  console.log('导出字幕:', subtitles.value);
};

const updateSubtitlesImage = () => {
  // 模拟生成字幕图片，实际实现中需要根据音频内容和字幕文本生成图像
  // 这里仅生成一个占位符
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 800;
  canvas.height = 600;
  
  // 白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制标题
  ctx.fillStyle = '#000000';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('音频字幕预览', canvas.width / 2, 50);
  
  // 绘制字幕列表
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  
  subtitles.value.forEach((subtitle, index) => {
    const yPosition = 100 + index * 40;
    ctx.fillText(
      `${formatTime(subtitle.start)} - ${formatTime(subtitle.end)}: ${subtitle.text || '(无字幕文本)'}`,
      20,
      yPosition
    );
  });
  
  subtitlesImage.value = canvas.toDataURL('image/png');
};

const downloadSubtitlesImage = () => {
  if (!subtitlesImage.value) return;
  
  const link = document.createElement('a');
  link.href = subtitlesImage.value;
  link.download = 'audio-subtitles.png';
  link.click();
};

const clearAudio = () => {
  if (audioElement.value) {
    audioElement.value.pause();
    URL.revokeObjectURL(audioElement.value.src);
  }
  
  if (audioContext.value) {
    audioContext.value.close();
  }
  
  audioFile.value = null;
  audioData.value = null;
  duration.value = 0;
  currentTime.value = 0;
  isPlaying.value = false;
  subtitles.value = [];
  subtitlesImage.value = '';
};
</script>

<style scoped>
.audio-subtitle-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.upload-section {
  margin-bottom: 30px;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.drop-zone.drag-over {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.controls {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.primary-btn, .secondary-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.primary-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
}

.waveform-container {
  margin-bottom: 30px;
}

.waveform-canvas {
  width: 100%;
  height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.subtitle-editor {
  margin-bottom: 30px;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.control-btn {
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.time-slider {
  flex: 1;
  height: 5px;
  border-radius: 5px;
  background: #ddd;
  outline: none;
}

.subtitle-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
}

.subtitle-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 15px;
}

.subtitle-item.active {
  background-color: #e7f3ff;
}

.subtitle-item:last-child {
  border-bottom: none;
}

.time-range {
  width: 150px;
  font-family: monospace;
  color: #666;
}

.subtitle-text input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.subtitle-actions {
  display: flex;
  gap: 10px;
}

.preview-section {
  margin-top: 30px;
  text-align: center;
}

.subtitle-preview-area {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin: 15px 0;
  display: inline-block;
}

.subtitle-preview-area img {
  max-width: 100%;
  max-height: 400px;
}
</style>