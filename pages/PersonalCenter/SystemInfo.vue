<template>
  <view>
    <head-top :go-back="true" head-title="好友请求" />
    <view v-if="requestsInfo.length !== 0">
      <friend-request
        v-for="request in requestsInfo"
        :key="request.friendRequestId"
        :request="request"
        @accept="handleAccept"
        @reject="handleReject"
      />
    </view>
    <view v-else class="empty-container">
      <image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
      <text class="empty-text">暂无好友请求</text>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useUserStore } from "@/store/userStore";
import { useWebSocketStore } from "@/store/websocketStore";
import { friendRequestAccept, friendRequestRefuse, getFriendRequest, getRequesterInfo } from "@/api/userAPI";
import { FriendMessage } from "@/util/ChatFormat";
import FriendRequest from "@/components/FriendRequest/FriendRequest.vue";
import HeadTop from "@/components/Head/Head.vue";

const userStore = useUserStore();
const requests = computed(() => userStore.getSystemInfo() || []);
const requestsInfo = ref([]);

let timer = null;
const delay = 250;

onMounted(() => {
  const userList = requests.value.map(item => item.sender);
  if (userList.length > 0) {
    getRequesterInfo(userList)
      .then(res => res?.data)
      .then(res => {
        if (res && Array.isArray(res)) {
          res.forEach(item => {
            requestsInfo.value.push({
              ...item,
              ...requests.value.find(i => i.sender === item.account)
            });
          });
        }
      })
      .catch(error => {
        console.error('获取请求者信息失败', error);
      });
  }
});

const handleAccept = (request) => {
  clearTimeout(timer);

  timer = setTimeout(async () => {
    try {
      uni.showLoading({
        title: '处理中...'
      });
      
      const res = await friendRequestAccept(request.friendRequestId);
      
      if (res.code === 200) {
        const ws = useWebSocketStore();
        const formatMessage = new FriendMessage(
          userStore.getUser().account,
          request.sender,
          "我们已经是好友了,开始了聊天吧",
          ""
        );
        
        ws.sendMessage({
          type: "friend",
          data: formatMessage
        });
        
        const friendReqRes = await getFriendRequest();
        if (friendReqRes?.data) {
          userStore.setSystemInfo(friendReqRes.data);
          // 更新本地状态
          const reqIndex = requestsInfo.value.findIndex(item => item.friendRequestId === request.friendRequestId);
          if (reqIndex !== -1) {
            requestsInfo.value[reqIndex].status = 1;
          }
        }
        
        uni.showToast({
          title: '已接受请求',
          icon: 'success'
        });
      }
    } catch (error) {
      uni.showToast({
        title: '操作失败',
        icon: 'none'
      });
    } finally {
      uni.hideLoading();
    }
  }, delay);
};

const handleReject = (request) => {
  clearTimeout(timer);

  timer = setTimeout(async () => {
    try {
      uni.showLoading({
        title: '处理中...'
      });
      
      const res = await friendRequestRefuse(request.friendRequestId);
      
      if (res.code === 200) {
        const friendReqRes = await getFriendRequest();
        if (friendReqRes?.data) {
          userStore.setSystemInfo(friendReqRes.data);
          // 更新本地状态
          const reqIndex = requestsInfo.value.findIndex(item => item.friendRequestId === request.friendRequestId);
          if (reqIndex !== -1) {
            requestsInfo.value[reqIndex].status = 2;
          }
        }
        
        uni.showToast({
          title: '已拒绝请求',
          icon: 'success'
        });
      }
    } catch (error) {
      uni.showToast({
        title: '操作失败',
        icon: 'none'
      });
    } finally {
      uni.hideLoading();
    }
  }, delay);
};
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