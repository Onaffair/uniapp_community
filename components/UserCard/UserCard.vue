<template>
    <view class="user-card">
        <!-- 头像 -->
        <image
            class="avatar"
            :src="imgBaseUrl + user.avatar"
            mode="aspectFill"
            @click="goToUserDetail"
        />

        <!-- 用户信息 -->
        <view class="user-info" @click="goToUserDetail">
            <text class="name">{{ user.name }}</text>
            <text class="status" :class="{ online: user.status === 'online', offline: user.status === 'offline' }">
                {{ user.status === 'online' ? '在线' : '离线' }}
            </text>
        </view>

        <button
            v-if="btn_text"
            type="primary"
            class="action-btn"
            @click="btnClick">
            {{ btn_text }}
        </button>
    </view>
</template>

<script setup>
import {defineProps, defineEmits} from 'vue';
import {imgBaseUrl} from "@/util/basic-data";

// 接收用户信息
const props = defineProps({
    user: Object,
    btn_text: {
        type: String,
        default: null
    }
});

// 触发按钮点击事件
const emit = defineEmits(["btnClick"]);

const btnClick = () => {
    emit("btnClick", props.user.account);
};

// 跳转到用户详情
const goToUserDetail = () => {
    uni.navigateTo({
        url: `/pages/Detail/UserDetailPage?id=${props.user.account}`
    });
};
</script>

<style>
.user-card {
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

.user-info {
    flex: 1;
}

.name {
    display: block;
    font-weight: bold;
    font-size: 32rpx;
}

.status {
    display: block;
    font-size: 24rpx;
    color: #888;
}

.online {
    color: green;
}

.offline {
    color: red;
}

.action-btn {
    font-size: 24rpx;
}
</style> 