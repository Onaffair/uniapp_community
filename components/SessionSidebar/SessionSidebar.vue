<template>
    <!-- 侧边栏容器 -->
    <view class="sidebar-container" :class="{ collapsed: isCollapsed }">
        <!-- 顶部操作区 -->
        <view class="sidebar-header">
            <!-- 新建对话按钮 -->
            <view class="new-session-button" @click="handleNewSession">
                <uni-icons type="compose" size="24" color="#42b983"></uni-icons>
                <text v-if="!isCollapsed">开启新对话</text>
            </view>

            <!-- 折叠/展开按钮 -->
            <view class="collapse-button" @click="toggleCollapse">
                <uni-icons :type="isCollapsed ? 'right' : 'left'" size="18" color="#666"></uni-icons>
            </view>
        </view>

        <!-- 会话列表 -->
        <scroll-view scroll-y class="session-list">
            <!-- 分组：今天 -->
            <view v-if="sessions.length > 0" class="group-section">
<!--                <text v-if="!isCollapsed" class="group-title">今天</text>-->
                <view v-for="session in sessions"
                      :key="session.id"
                      class="session-item"
                      :class="{ active: activeSessionId === session.id }"
                      @click="handleSessionSelect(session)">
                    <uni-icons type="chat" size="20" color="#42b983"></uni-icons>
                    <view v-if="!isCollapsed" class="session-info">
                        <text class="session-title">{{ session.title }}</text>
                        <text class="session-time">{{ formatTime(session.createdAt) }}</text>
                    </view>
                </view>
            </view>

        </scroll-view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

// 定义props
const props = defineProps({
    sessions: {
        type: Array,
        default: () => []
    },
    activeSessionId: {
        type: String,
        default: ''
    }
})


// 定义emit事件
const emit = defineEmits(['select', 'new-session', 'collapse-change'])

// 折叠状态
const isCollapsed = ref(false)


// 日期格式化
const formatTime = (dateString) => {
    return dayjs(dateString).format('HH:mm')
}

const formatDate = (dateString) => {
    return dayjs(dateString).format('MM-DD')
}

const formatMonth = (dateString) => {
    return dayjs(dateString).format('YYYY-MM')
}

// 处理会话选择
const handleSessionSelect = (session) => {
    emit('select', session)
}

// 处理新建会话
const handleNewSession = () => {
    emit('new-session')
}

// 切换折叠状态
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
    emit('collapse-change', isCollapsed.value)
}

</script>

<style lang="scss" scoped>
.sidebar-container {
    width: 280rpx;
    height: 100%;
    background-color: #fff;
    border-right: 1px solid #eaeaea;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;

    &.collapsed {
        width: 80rpx;
    }

    .sidebar-header {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx 20rpx 20rpx;
        border-bottom: 1px solid #f0f0f0;
    }

    .session-list {
        flex: 1;
        padding: 20rpx 0;
        overflow-y: auto;
        height: calc(100% - 200rpx);
    }
}

.new-session-button {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 28rpx;
    color: #42b983;
    font-weight: 500;
    cursor: pointer;
    .collapsed & {
        justify-content: center;
    }
}

.collapse-button {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    border: 1px solid #e0e0e0;
    background-color: #f9f9f9;
}



.group-section {
    margin-bottom: 30rpx;
}

.group-title {
    display: block;
    padding: 10rpx 20rpx;
    font-size: 24rpx;
    color: #999;
}

.session-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    gap: 15rpx;
    border-left: 4rpx solid transparent;
    transition: all 0.2s;
    cursor: pointer;
    &.active {
        border-left-color: #42b983;
        background-color: #aaaaaa;
    }

    &:not(.active):active {
        background-color: #f9f9f9;
    }

    .collapsed & {
        justify-content: center;
        padding: 25rpx 20rpx;
    }
}

.session-info {
    flex: 1;
    overflow: hidden;
}

.session-title {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.session-time {
    font-size: 24rpx;
    color: #999;
}

/* 响应式调整 */
@media screen and (max-width: 767px) {
    .sidebar-container {
        width: 240rpx;

        &.collapsed {
            width: 70rpx;
        }
    }

    .session-title {
        font-size: 26rpx;
    }
}
</style>