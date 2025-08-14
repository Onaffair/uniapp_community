<template>
    <view class="chat-room">
        <!-- 群聊头部 -->
        <head-top :go-back="true" :head-title="groupInfo.group.groupName">
            <template #right>
                <text class="iconfont icon-more-o" @tap="openGroupInfo">=</text>
            </template>
        </head-top>

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
<!--            <view class="loading-more" v-if="isLoadingMore">-->
<!--                <text>加载更多消息...</text>-->
<!--            </view>-->

            <chat-message
                v-for="message in chatMessages"
                :key="message.groupMessageId"
                :avatar="getSenderAvatar(message)"
                :name="getSenderName(message)"
                :message="message.textContent"
                :time="message.createdAt"
                :is-me="message.sender === myAccount"
                :image-url="message.imageUrl"
                :account="message.sender"
                :id="`msg-${message.groupMessageId}`"
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
                            <view class="upload-icon">
                                <text class="icon">📷</text>
                            </view>
                        </template>
                    </ImgUploader>
                </view>
                
                <view class="input-section">
                    <input
                        class="message-input"
                        v-model="inputMessage"
                        placeholder="请输入群消息"
                        confirm-type="send"
                        @confirm="sendMessage"
                    />
                </view>
                
                <button class="send-button" @tap="sendMessage">发送</button>
            </view>
        </view>

        <!-- 群组信息弹窗 -->
        <uni-popup ref="groupInfoPopup" type="right" :mask-click="true" @maskClick="closeGroupInfo">
            <view class="group-info">
                <view class="group-header">
                    <template v-if="isEditing && isGroupOwner">
                        <view class="avatar-uploader">
                            <view>
                                <img-uploader
                                    v-model:img-src="editData.avatar"
                                    :max-count="1"
                                />
                            </view>
                        </view>
                        <input
                            v-model="editData.groupName"
                            class="edit-field"
                            placeholder="请输入群名称"
                        />
                    </template>
                    <template v-else>
                        <image
                            class="group-avatar"
                            :src="groupInfo.group.avatar ? imgBaseUrl + groupInfo.group.avatar : '/static/images/default-group.png'"
                            mode="aspectFill"
                        ></image>
                        <text class="group-name">{{ groupInfo.group.groupName }}</text>
                    </template>
                    <text class="group-owner">群主：{{ getMemberName(groupInfo.group.ownerAccount) }}</text>
                </view>

                <view class="announcement-block">
                    <view class="announcement-header">
                        <text class="block-title">群公告</text>
                        <button
                            v-if="isGroupOwner && !isEditing"
                            class="edit-button"
                            size="mini"
                            @tap="startEditing"
                        >
                            编辑群信息
                        </button>
                    </view>
                    <template v-if="isEditing && isGroupOwner">
            <textarea
                v-model="editData.announcement"
                class="edit-field announcement-textarea"
                placeholder="请输入群公告"
            />
                        <view class="edit-actions">
                            <button class="action-button save" @tap="saveGroupInfo">保存</button>
                            <button class="action-button cancel" @tap="cancelEditing">取消</button>
                        </view>
                    </template>
                    <template v-else>
                        <text class="announcement-content">{{ groupInfo.group.announcement || '暂无公告' }}</text>
                    </template>
                </view>

                <view class="member-title">
                    <text>群成员</text>
                    <text class="member-count">{{ groupMembers.length }}人</text>
                </view>

                <view class="member-list">
                    <view
                        v-for="member in groupMembers"
                        :key="member.account"
                        class="member-item"
                    >
                        <image
                            class="avatar"
                            :src="imgBaseUrl + member.avatar"
                            mode="aspectFill"
                        ></image>
                        <view class="member-info">
                            <text class="name">{{ member.name }}</text>
                            <text class="status" :class="member.status">{{
                                    member.status === 'online' ? '在线' : '离线'
                                }}
                            </text>
                        </view>
                    </view>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import {ref, computed, onMounted, nextTick, watch} from 'vue';
import {useUserStore} from '@/store/userStore';
import {useWebSocketStore} from '@/store/websocketStore';
import {GroupMessage} from "@/util/ChatFormat";
import HeadTop from "@/components/Head/Head.vue";
import ChatMessage from "@/components/ChatMessage/ChatMessage.vue";
import ImgUploader from "@/components/ImgUploader/ImgUploader.vue";
import {imgBaseUrl} from "@/util/basic-data";
import {updateGroup} from "@/api/GroupApI";
import {onLoad} from '@dcloudio/uni-app';

// 页面参数
const targetId = ref('');
const chatType = ref('');

// 从页面参数获取目标ID
onLoad((options) => {
    targetId.value = options.targetId;
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
const groupInfoPopup = ref(null);
const showGroupInfo = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);

// 编辑数据
const editData = ref({
    groupName: '',
    announcement: '',
    avatar: ''
});

// 从store获取群组数据
const groupInfo = computed(() => {
    return userStore.getGroup().find(g => g.group.groupId == targetId.value) || {group: {}, members: []};
});

// 判断当前用户是否为群主
const isGroupOwner = computed(() => {
    return groupInfo.value.group?.ownerAccount === myAccount;
});

// 群成员数据
const groupMembers = computed(() => {
    return groupInfo.value.members || [];
});

// 聊天记录
const chatMessages = computed(() => {
    return groupInfo.value.chat || [];
});

// 监听popup状态
watch(showGroupInfo, (newVal) => {
    if (groupInfoPopup.value) {
        if (newVal) {
            groupInfoPopup.value.open();
        } else {
            groupInfoPopup.value.close();
        }
    }
});

// 初始化聊天记录
onMounted(() => {
    setTimeout(() => {
        scrollToBottom();
    }, 0);
});

// 滚动到底部
const scrollToBottom = () => {
    // 获取最后一条消息的ID
    const messages = chatMessages.value;
    if (messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        scrollToView.value = `msg-${lastMessage.groupMessageId}`;
    }

};

// 加载更多消息（上拉时触发）
const loadMoreMessages = () => {
    if (isLoadingMore.value) return;

    isLoadingMore.value = true;
    // 这里应该添加加载历史消息的逻辑
    // ...

    setTimeout(() => {
        isLoadingMore.value = false;
    }, 1000);
};

// 获取发送者信息
const getSenderAvatar = (message) => {
    return groupMembers.value.find(m => m.account === message.sender)?.avatar || '';
};

const getSenderName = (message) => {
    return groupMembers.value.find(m => m.account === message.sender)?.name || '该群员已退群';
};

const getMemberName = (account) => {
    return groupMembers.value.find(m => m.account === account)?.name || account;
};

// 打开群组信息弹窗
const openGroupInfo = () => {
    showGroupInfo.value = true;
};

// 关闭群组信息弹窗
const closeGroupInfo = () => {
    showGroupInfo.value = false;
};

// 开始编辑群信息
const startEditing = () => {
    editData.value = {
        groupName: groupInfo.value.group.groupName || '',
        announcement: groupInfo.value.group.announcement || '',
        avatar: groupInfo.value.group.avatar || ''
    };
    isEditing.value = true;
};

// 取消编辑
const cancelEditing = () => {
    isEditing.value = false;
};

// 保存群组信息
const saveGroupInfo = async () => {
    if (isSubmitting.value) return;

    if (!editData.value.groupName.trim()) {
        uni.showToast({
            title: '群名称不能为空',
            icon: 'none'
        });
        return;
    }

    try {
        isSubmitting.value = true;
        console.log(editData.value)
        const groupData = {
            groupId: groupInfo.value.group.groupId,
            groupName: editData.value.groupName,
            announcement: editData.value.announcement,
            avatar: editData.value.avatar,
            ownerAccount: groupInfo.value.group.ownerAccount
        };

        const result = await updateGroup(groupData);

        if (result.code === 200) {
            // 更新本地数据
            userStore.updateGroupInfo(groupData);
            uni.showToast({
                title: '群信息更新成功',
                icon: 'success'
            });
            isEditing.value = false;
        } else {
            uni.showToast({
                title: result.message || '更新失败',
                icon: 'none'
            });
        }
    } catch (error) {
        uni.showToast({
            title: '更新失败: ' + (error.message || '未知错误'),
            icon: 'none'
        });
    } finally {
        isSubmitting.value = false;
    }
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

    const formatMessage = new GroupMessage(
        myAccount,
        targetId.value,
        inputMessage.value,
        imageToSend
    );
    console.log(formatMessage)
    // 通过WebSocket发送群消息
    ws.sendMessage({
        type: 'group',
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

// 监听聊天记录变化，自动滚动到底部
watch(() => chatMessages.value.length, () => {
    setTimeout(() => {
        scrollToBottom();
    }, 300);
});
</script>

<style scoped>
.chat-room {
    position: relative;
    height: 100vh;
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    overflow: hidden;
}

.chat-history {
    position: absolute;
    top: 96rpx; /* 头部高度 */
    bottom: 200rpx; /* 底部输入区域高度 */
    left: 0;
    right: 0;
    padding: 20rpx;
    overflow-y: auto;
    background: transparent;
}

.loading-more {
    text-align: center;
    padding: 20rpx 0;
    color: #6c757d;
    font-size: 24rpx;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 20rpx;
    margin: 10rpx 20rpx;
    backdrop-filter: blur(10rpx);
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
    flex-direction: row;
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

/* 群组信息弹窗样式 */
.group-info {
    width: 80vw;
    height: 100vh;
    background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
    padding: 30rpx;
    overflow-y: auto;
    box-shadow: -4rpx 0 20rpx rgba(0, 0, 0, 0.1);
}

.group-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40rpx;
    padding: 30rpx 20rpx;
    background: linear-gradient(135deg, #007AFF, #0056CC);
    border-radius: 20rpx;
    color: white;
    box-shadow: 0 8rpx 25rpx rgba(0, 122, 255, 0.3);
}

.group-avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    margin-bottom: 20rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.2);
}

.group-name {
    font-size: 36rpx;
    font-weight: 600;
    margin-bottom: 10rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.group-owner {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
}

.announcement-block {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 15rpx;
    padding: 25rpx;
    margin-bottom: 30rpx;
    border: 1px solid #e9ecef;
    box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
}

.announcement-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.block-title {
    font-weight: 600;
    font-size: 30rpx;
    color: #495057;
}

.edit-button {
    background-color: #007AFF;
    color: white;
    font-size: 24rpx;
    padding: 0 20rpx;
}

.announcement-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
}

.edit-field {
    width: 100%;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8rpx;
    padding: 10rpx 20rpx;
    font-size: 28rpx;
    margin-bottom: 20rpx;
}

.announcement-textarea {
    height: 160rpx;
    width: 100%;
}

.edit-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20rpx;
}

.action-button {
    margin-left: 20rpx;
    font-size: 28rpx;
    padding: 0 30rpx;
    height: 70rpx;
    line-height: 70rpx;
    border-radius: 8rpx;
}

.action-button.save {
    background-color: #007AFF;
    color: white;
}

.action-button.cancel {
    background-color: #f5f5f5;
    color: #333;
}

.member-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 30rpx 0 20rpx;
    padding-bottom: 10rpx;
    border-bottom: 1px solid #f5f5f5;
    font-size: 30rpx;
    font-weight: bold;
}

.member-count {
    font-size: 24rpx;
    color: #999;
    font-weight: normal;
}

.member-list {
    display: flex;
    flex-direction: column;
}

.member-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1px solid #f5f5f5;
}

.member-item:last-child {
    border-bottom: none;
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
}

.member-info {
    flex: 1;
}

.name {
    font-size: 28rpx;
    font-weight: 500;
    margin-bottom: 6rpx;
}

.status {
    font-size: 24rpx;
    color: #999;
}

.status.online {
    color: #4cd964;
}
</style>