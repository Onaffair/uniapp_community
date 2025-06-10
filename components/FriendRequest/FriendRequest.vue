<template>
  <view class="friend-request-card">
    <!-- 头像 -->
    <image class="avatar" :src="imgBaseUrl + request.avatar" mode="aspectFill" />

    <!-- 申请信息 -->
    <view class="request-info">
      <text class="name">{{ request.name }}</text>
      <text class="time">请求时间: {{ formatTime(request.createdAt) }}</text>
    </view>

    <!-- 按钮 -->
    <view class="actions" v-if="request.status === 0">
      <button type="primary" size="mini" @click="acceptRequest">同意</button>
      <button type="warn" size="mini" @click="rejectRequest">拒绝</button>
    </view>
    <view class="result" v-else>
      {{request.status === 1 ? "已同意" : "已拒绝"}}
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { imgBaseUrl } from "@/util/basic-data";

const props = defineProps({
  request: Object
});

const emit = defineEmits(["accept", "reject"]);

const acceptRequest = () => {
  emit("accept", props.request);
};

const rejectRequest = () => {
  emit("reject", props.request);
};

// 格式化时间
const formatTime = (timestamp) => {
  return timestamp.replace("T", " ").slice(0, 16);
};
</script>

<style>
.friend-request-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.request-info {
  flex: 1;
}

.name {
  display: block;
  font-weight: bold;
  font-size: 32rpx;
}

.time {
  display: block;
  font-size: 24rpx;
  color: #888;
}

.actions {
  display: flex;
  gap: 20rpx;
}

.result {
  font-size: 24rpx;
  color: #888;
}
</style> 