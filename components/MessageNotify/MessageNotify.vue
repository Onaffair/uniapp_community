<template>
  <view
    class="message-notify"
    v-show="visible"
    @click="handleClick"
    :style="{ background: bgColor }"
  >
    <view class="notify-header">
      <text class="iconfont" :class="'icon-'+icon"></text>
      <text class="notify-title">{{ title }}</text>
      <text class="iconfont icon-cross close-icon" @click.stop="hide"></text>
    </view>
    <view class="notify-content">
      <view v-if="showLoading" class="loading-spinner"></view>
      <text class="message-text">{{ message }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '活动提醒'
  },
  icon: {
    type: String,
    default: 'fire-o'
  },
  bgColor: {
    type: String,
    default: 'linear-gradient(to right, #ff758c, #ff7eb3)'
  },
  loadingColor: {
    type: String,
    default: '#ffffff'
  },
  showLoading: {
    type: Boolean,
    default: true
  }
});

const visible = ref(false);
const message = ref('');
const duration = ref(0);
const onClick = ref(null);

const show = (options = {}) => {
  message.value = options.message || '您收到一条新消息';
  duration.value = options.duration || 3000;
  onClick.value = options.onClick || null;

  visible.value = true;
  if (duration.value > 0) {
    setTimeout(() => {
      hide();
    }, duration.value);
  }
};

const hide = () => {
  visible.value = false;
};

const handleClick = () => {
  if (onClick.value) {
    onClick.value();
  }
  hide();
};

defineExpose({ show, hide });
</script>

<style>
.message-notify {
  position: fixed;
  top: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 24rpx 0 rgba(0, 0, 0, 0.1);
  z-index: 9999;
  overflow: hidden;
  color: white;
}

.notify-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
}

.notify-header .iconfont {
  margin-right: 16rpx;
  font-size: 32rpx;
}

.notify-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: bold;
}

.close-icon {
  font-size: 28rpx;
  opacity: 0.8;
}

.notify-content {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s linear infinite;
  margin-right: 20rpx;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.message-text {
  font-size: 28rpx;
}
</style> 