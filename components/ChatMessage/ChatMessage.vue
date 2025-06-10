<template>
    <view class="message" :class="{ 'me': isMe }">
        <image class="avatar" :src="imgBaseUrl+avatar" @click="goToUserDetail"/>
        <view class="content">
            <text class="name">{{ name }}</text>
            <rich-text
                v-if="message"
                class="message-content"
                :nodes="processedMessage"
                @tap="handleLinkClick"
            ></rich-text>
            <view class="message-image" v-if="imageUrl" @click="showImg">
                <image :src="imgBaseUrl+imageUrl" mode="widthFix"/>
            </view>
            <text class="time">{{ formatTime(time) }}</text>
        </view>
    </view>
</template>

<script setup>
import {computed} from 'vue';
import {imgBaseUrl} from "@/util/basic-data";
import dayjs from "dayjs";

const props = defineProps({
    account: String,
    avatar: String,
    name: String,
    message: String,
    time: String,
    isMe: Boolean,
    imageUrl: String,
});

// 格式化时间
const formatTime = (timestamp) => {
    return dayjs(timestamp).format("MM:ss");

};
// 处理消息内容，将URL转为可点击的链接
const processMessage = (text) => {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => {
        return `<a href="${url}" style="color: #007bff; text-decoration: underline;">${url}</a>`;
    });
};

const processedMessage = computed(() => {
    return processMessage(props.message || '');
});

// 处理链接点击
const handleLinkClick = (e) => {
    // 由于rich-text限制，UniApp中链接点击处理需要自定义处理
    // 实际应用中可能需要通过js获取点击位置内的链接
    console.log('链接点击，需要自定义处理');
};

// 跳转到用户详情
const goToUserDetail = () => {
    uni.navigateTo({
        url: `/pages/Detail/UserDetailPage?id=${props.account}`
    });
};

// 显示图片预览
const showImg = () => {
    uni.previewImage({
        urls: [imgBaseUrl + props.imageUrl],
        current: imgBaseUrl + props.imageUrl
    });
};
</script>

<style scoped>
.message {
    display: flex;
    align-items: flex-start;
    margin: 20rpx 0;
}

.message.me {
    flex-direction: row-reverse;
    text-align: right;
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin: 0 20rpx;
}

.content {
    max-width: 60%;
    display: flex;
    flex-direction: column;
}

.name {
    font-size: 24rpx;
    color: #888;
}

.message-content {
    padding: 16rpx 24rpx;
    border-radius: 16rpx;
    background: #f1f1f1;
    word-wrap: break-word;
    margin: 8rpx 0;
}

.message-image {
    max-height: 100%;
    margin: 8rpx 0;
}

.message-image image {
    max-width: 40%;
    border-radius: 16rpx;
}

.message.me .message-content {
    background: #07c160;
    color: white;
    border-radius: 24rpx 24rpx 0 24rpx;
    word-wrap: break-word;
    text-align: left;
}

.time {
    font-size: 20rpx;
    color: #aaa;
    margin-top: 10rpx;
}
</style> 