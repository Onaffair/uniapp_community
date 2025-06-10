<template>
  <view>
    <head-top :go-back="true" head-title="我的粉丝" />
    <view v-if="fans.length !== 0">
      <user-card
        v-for="user in fans"
        :key="user.account"
        :user="user"
      />
    </view>
    <view v-else class="empty-container">
      <image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
      <text class="empty-text">暂无粉丝</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import HeadTop from "@/components/Head/Head.vue";
import UserCard from "@/components/UserCard/UserCard.vue";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const fans = computed(() => userStore.getFollowData()?.follower || []);
</script>

<style>
.empty-container {
  padding: 100rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style> 