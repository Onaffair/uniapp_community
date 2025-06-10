<template>
  <view class="sub-title">
    <text>{{ msg }}</text>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<style>
.sub-title {
  display: inline-flex;
  margin: 3%;
  font-size: 30rpx;
  height: 50rpx;
  background: #f7f7f7;
  font-weight: bold;
  text-align: left;
  letter-spacing: 2rpx;
  align-items: center;
  padding: 0 10rpx;
}
</style> 