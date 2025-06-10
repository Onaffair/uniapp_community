<template>
  <view class="container">
    <button class="btn-sure" @click="navigateTo">确认</button>        
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: ''
  }
})

const navigateTo = () => {
  if (props.name) {
    uni.navigateTo({
      url: props.name
    })
  }
}
</script>

<style>
.container {
  display: flex;
  justify-content: center;
}

.btn-sure {
  width: 500rpx !important;
  height: 170rpx !important;
  border-radius: 20rpx !important;
  background: #ffb04f !important;
  font-weight: bold !important;
  font-size: 44rpx !important;
  color: white !important;
  line-height: 170rpx !important;
  border: none;
}
</style> 