<template>
    <view class="comment-wrapper">
        <view class="comment-container">
            <!-- 用户信息 -->
            <view class="user-info">
                <image :src="imgBaseUrl + props.userinfo.avatar" class="user-avatar"/>
                <view class="user-details">
                    <text class="username">{{ props.userinfo.name }}</text>
                    <text class="comment-time">
                        {{
                            dayjs(props.comment.createdAt).format("YYYY-MM-DD HH:mm:ss")
                        }}
                    </text>
                </view>
            </view>
            <!-- 评分 -->
            <view class="rating">
                <text v-for="i in 5" :key="i" class="star" :class="{ filled: i <= props.comment.rating }">★</text>
            </view>

            <!-- 引用内容 -->
            <view v-if="props.comment.replyHint" class="quote">
                <text class="quote-icon">💬</text>
                <text class="quote-content">{{ props.comment.replyText }}</text>
            </view>

            <!-- 评论内容 -->
            <view class="comment-text">{{ props.comment.textContent }}</view>

            <!-- 评论图片 -->
            <view v-if="props.comment.imageUrl" class="comment-images" @click="previewImage">
                <image :src="imgBaseUrl+props.comment.imageUrl" class="comment-image" mode="aspectFill"/>
            </view>

            <!-- 回复按钮 -->
            <view class="reply-button">
                <button @click="reply" size="mini" type="primary">回复</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import {imgBaseUrl} from "@/util/basic-data";
import dayjs from "dayjs";

const props = defineProps({
    userinfo: {
        type: Object,
        required: true
    },
    comment: {
        type: Object,
        required: true
    }
});

const emits = defineEmits(['onClickReply']);

// 点击回复
const reply = () => {
    emits('onClickReply', props.comment.commentId, props.comment.textContent);
};

// 预览图片
const previewImage = () => {
    if (props.comment.imageUrl) {
        uni.previewImage({
            current: imgBaseUrl + props.comment.imageUrl,
            urls: [imgBaseUrl + props.comment.imageUrl]
        });
    }
};
</script>

<style>
/* 容器 */
.comment-wrapper {
    display: flex;
    justify-content: center;
    padding: 0 20rpx;
}

.comment-container {
    width: 90%; /* 控制评论宽度 */
    background: #fff;
    padding: 30rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
    margin-bottom: 30rpx;
}

/* 用户信息 */
.user-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.user-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
}

.user-details {
    display: flex;
    flex-direction: column;
}

.username {
    font-weight: bold;
    font-size: 28rpx;
}

.comment-time {
    font-size: 24rpx;
    color: gray;
}

/* 评分 */
.rating {
    display: flex;
    margin-bottom: 10rpx;
}

.star {
    font-size: 32rpx;
    color: lightgray;
}

.filled {
    color: gold;
}

/* 引用内容 */
.quote {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    padding: 10rpx;
    margin-top: 10rpx;
    border-left: 6rpx solid #1989fa;
    font-size: 24rpx;
    color: #555;
}

.quote-icon {
    margin-right: 10rpx;
}

/* 评论内容 */
.comment-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    line-height: 1.5;
}

/* 评论图片 */
.comment-images {
    display: flex;
    gap: 16rpx;
    margin-top: 20rpx;
}

.comment-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 10rpx;
}

/* 回复按钮 */
.reply-button {
    margin-top: 20rpx;
    display: flex;
    justify-content: flex-end;
}
</style> 