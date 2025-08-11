<template>
    <view class="chat-room">
        <!-- 聊天头部 -->
        <head-top :go-back="true" :head-title="targetName"/>

        <!-- 聊天记录 -->
        <scroll-view
            class="chat-history"
            scroll-y="true"
            :scroll-top="scrollTop"
            @scrolltoupper="loadMoreMessages"
            :scroll-into-view="scrollToView"
            :enable-back-to-top="true"

            id="chat-scroll"
        >
            <view class="loading-more" v-if="isLoadingMore">
                <text>加载更多消息...</text>
            </view>

            <chat-message
                v-for="message in currentChat.chat"
                :key="message.messageId"
                :avatar="getSenderAvatar(message)"
                :name="getSenderName(message)"
                :message="message.textContent"
                :time="message.createdAt"
                :is-me="message.sender === myAccount"
                :image-url="message.imageUrl"
                :account="message.sender"
                :id="`msg-${message.messageId}`"
            />
        </scroll-view>
        <!-- 输入框区域 -->
        <view class="input-area">
            <!-- 图片预览区域 -->
            <view class="image-preview-section" v-if="inputImg">
                <image :src="inputImg" class="preview-image" />
                <view class="remove-image" @tap="removeImage">×</view>
            </view>
            
            <view class="input-row">
                <view class="image-upload-section">
                    <ImgUploader
                        v-model:img-src="inputImg"
                        :max-count="1"
                        :is-preview="false"
                    >
                        <template #button>
                            <view class="up load-icon">
                                <text class="icon">📷</text>
                            </view>
                        </template>
                    </ImgUploader>
                </view>

                <view class="input-section">
                    <input
                        class="message-input"
                        v-model="inputMessage"
                        placeholder="请输入消息"
                        confirm-type="send"
                        @confirm="sendMessage"
                    />
                </view>

                <button class="send-button" @tap="sendMessage">发送</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import {ref, computed, onMounted, nextTick, watch} from 'vue';
import {useUserStore} from '@/store/userStore';
import {useWebSocketStore} from '@/store/websocketStore';
import {FriendMessage} from "@/util/ChatFormat";
import HeadTop from "@/components/Head/Head.vue";
import ChatMessage from "@/components/ChatMessage/ChatMessage.vue";
import {onLoad} from '@dcloudio/uni-app';

// 页面参数
const targetId = ref('');
const targetName = ref('');
const chatType = ref('');

// 从页面参数获取目标ID和名称
onLoad((options) => {
    targetId.value = options.targetId;
    targetName.value = options.targetName;
    chatType.value = options.type;
});

const userStore = useUserStore();
const ws = useWebSocketStore();

const myAccount = userStore.getUser().account;
const inputMessage = ref('');
const inputImg = ref('');
const scrollTop = ref(0);
const scrollToView = ref('');
const isLoadingMore = ref(false);

// 聊天记录
const currentChat = computed(() => {
    const friend = userStore.getFriend().find(f => f.account === targetId.value);
    if (friend) {
        return {
            targetId: targetId.value,
            targetName: targetName.value,
            chat: friend.chat || []
        };
    }
    return {targetId: targetId.value, targetName: targetName.value, chat: []};
});

// 初始化聊天记录
onMounted(() => {
    setTimeout(() => {
        scrollToBottom();
    }, 300);
});


// 滚动到底部
const scrollToBottom = () => {
    // 获取最后一条消息的ID
    const messages = currentChat.value.chat;
    if (messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        scrollToView.value = `msg-${lastMessage.messageId}`;
    }

    // 备用方法：直接设置scrollTop
    nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query.select('#chat-scroll').boundingClientRect(data => {
            if (data) {
                scrollTop.value = data.height * 10000; // 滚动到足够大的位置确保到底部
            }
        }).exec();
    });
};

// 加载更多消息（上拉时触发）
const loadMoreMessages = () => {
    if (isLoadingMore.value) return;

    isLoadingMore.value = true;

    setTimeout(() => {
        isLoadingMore.value = false;
    }, 250);
};

// 移除图片
const removeImage = () => {
    inputImg.value = '';
};

// 发送消息
const sendMessage = () => {
    if (!inputMessage.value.trim() && !inputImg.value) return;

    // 确保图片为string格式
    const imageToSend = Array.isArray(inputImg.value) ? 
        (inputImg.value.length > 0 ? inputImg.value[0] : '') : 
        (inputImg.value || '');

    const formatMessage = new FriendMessage(myAccount, targetId.value, inputMessage.value, imageToSend);

    // 通过 WebSocket 发送消息
    ws.sendMessage({
        type: chatType.value,
        data: formatMessage
    });

    // 清空输入框
    inputMessage.value = '';
    inputImg.value = '';

    // 滚动到底部
    setTimeout(() => {
        scrollToBottom();
    }, 300);
};

// 获取发送者头像
const getSenderAvatar = (message) => {
    return message.sender === myAccount
        ? userStore.getUser().avatar
        : userStore.getFriend().find(f => f.account === message.sender)?.avatar;
};

// 获取发送者名称
const getSenderName = (message) => {
    return message.sender === myAccount ? '我' :
        userStore.getFriend().find(f => f.account === message.sender)?.userName || '好友';
};

// 监听聊天记录变化，自动滚动到底部
watch(() => currentChat.value.chat.length, () => {
    setTimeout(() => {
        scrollToBottom();
    }, 300);
});
</script>

<style scoped>
.chat-room {
    position: relative;
    height: 100vh;
    background-color: #f7f8fa;
    overflow: hidden;
}

.chat-history {
    position: absolute;
    top: 96rpx; /* 头部高度 */
    bottom: 140rpx; /* 底部输入区域高度 */
    left: 0;
    right: 0;
    padding: 30rpx;
    background: #f7f8fa;
    overflow-y: auto;
}

.loading-more {
    text-align: center;
    padding: 20rpx 0;
    color: #999;
    font-size: 24rpx;
}

.input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx;
    background: #fff;
    border-top: 1px solid #eee;
    z-index: 1000;
}

.image-preview-section {
    position: relative;
    margin-bottom: 20rpx;
    display: inline-block;
}

.preview-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 8rpx;
    object-fit: cover;
}

.remove-image {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 40rpx;
    height: 40rpx;
    background: #ff4757;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: bold;
}

.input-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.image-upload-section {
    flex-shrink: 0;
}

.upload-icon {
    width: 80rpx;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx dashed #ddd;
}

.upload-icon .icon {
    font-size: 32rpx;
}

.input-section {
    flex: 1;
}

.message-input {
    width: 100%;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
}

.send-button {
    background-color: #007AFF;
    color: white;
    font-size: 28rpx;
    padding: 0 30rpx;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
}
</style>