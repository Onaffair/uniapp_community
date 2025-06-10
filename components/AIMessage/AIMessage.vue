<template>
    <view :class="['message-bubble', message.role]">
        <view class="message-header">
            <image :src="message.role === 'user' ? userAvatar : '/static/ai-avatar.png'" class="avatar"/>
            <text class="role-name">{{ message.role === 'user' ? '我' : 'AI助手' }}</text>
            <view v-if="message.role === 'system'" class="copy-btn">
                <uni-icons type="copy" size="22" color="#888">复制</uni-icons>
            </view>
        </view>
        <view class="message-content">
            <text v-if="message.role === 'user'">{{ message.content }}</text>
            <rich-text v-else selectable="true" :nodes="parseMarkdown(message.content)" class="ai-response"/>
        </view>
        <view v-if="showDivider" class="message-divider"></view>
    </view>
</template>

<script setup>
import {ref} from 'vue'
import {marked} from 'marked'
import DOMPurify from 'dompurify'
// import uniCopy from 'uni-copy'
const props = defineProps({
    message: Object,
    userAvatar: String,
    showDivider: Boolean
})
const parseMarkdown = (content) => {
    if (!content) return ''
    return DOMPurify.sanitize(marked.parse(content))
}
// const copyContent = () => {
//   uniCopy({
//     content: props.message.content,
//     success: () => uni.showToast({ title: '已复制', icon: 'success' })
//   })
// }
</script>

<style scoped>
.copy-btn {
    margin-left: auto;
    cursor: pointer;
}

.message-bubble {
    margin-bottom: 30rpx;
    border-radius: 16rpx;
    background-color: #fff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    overflow: hidden;

    &.user {
        .message-header {
            background-color: #e8f4ff;
            background-image: linear-gradient(to right, #e8f4ff, #f0f8ff);
        }

        .message-content {
            border-left: 4rpx solid #1890ff;
        }
    }

    &.system {
        .message-header {
            background-color: #f0f9eb;
            background-image: linear-gradient(to right, #f0f9eb, #f6ffed);
        }

        .message-content {
            border-left: 4rpx solid #52c41a;
        }
    }
}

.message-header {
    padding: 24rpx;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.3s ease;
}

.avatar {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    border: 2rpx solid #fff;
}

.role-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    letter-spacing: 1rpx;
}

.message-time {
    margin-left: auto;
    font-size: 24rpx;
    color: #999;
    opacity: 0.8;
}

.message-content {
    padding: 30rpx;
    font-size: 30rpx;
    line-height: 1.6;
    color: #333;

    .ai-response {
        ::v-deep p {
            margin-bottom: 24rpx;
        }

        ::v-deep strong {
            font-weight: 600;
            color: #222;
        }

        ::v-deep code {
            background-color: #f5f5f5;
            padding: 4rpx 8rpx;
            border-radius: 4rpx;
            font-family: monospace;
            font-size: 28rpx;
            color: #d56161;
        }

        ::v-deep pre {
            background-color: #f8f8f8;
            padding: 20rpx;
            border-radius: 8rpx;
            overflow-x: auto;
            margin: 20rpx 0;
        }

        ::v-deep img {
            width: 200rpx;
            height: auto;
            object-fit: fill;
        }
    }
}

.message-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e8e8e8, transparent);
    margin: 0 30rpx;
    opacity: 0.6;
}
</style>