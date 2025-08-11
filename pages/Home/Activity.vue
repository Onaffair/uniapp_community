<template>
    <view v-if="!userStore.getIsLogin()" class="login-prompt">
        <text>请先登录</text>
    </view>

    <view v-else class="activity-container">
        <uni-segmented-control 
            :current="activeTab" 
            :values="tabItems"
            @clickItem="onTabChange" 
            style-type="button"
            active-color="#007aff"
        />
        <!-- 发起的活动 -->
        <view v-if="activeTab === 0" class="tab-content">
            <scroll-view 
                scroll-y 
                class="scroll-area" 
                @scrolltolower="loadInitiatedActivities"
                :refresher-enabled="true"
                :refresher-triggered="refreshing"
                @refresherrefresh="onRefresh"
            >
                <view 
                    v-for="activity in myActivity" 
                    :key="activity.id" 
                    class="activity-item"
                    @click="goToActivityDetail(activity.id)"
                >
                    <view class="activity-title">{{ activity.title }}</view>
                    <view class="activity-highlight">{{ activity.highlight }}</view>
                    <uni-icons type="arrowright" size="16" color="#c0c4cc" class="arrow-icon" />
                </view>
                <uni-load-more 
                    :status="loadStatus" 
                    :content-text="loadText"
                />
            </scroll-view>
        </view>
        
        <!-- 参加的活动 -->
        <view v-if="activeTab === 1" class="tab-content">
            <scroll-view 
                scroll-y 
                class="scroll-area" 
                @scrolltolower="loadParticipatedActivities"
                :refresher-enabled="true"
                :refresher-triggered="refreshing"
                @refresherrefresh="onRefresh"
            >
                <view 
                    v-for="activity in myParticipation" 
                    :key="activity.id" 
                    class="activity-item"
                    @click="goToActivityDetail(activity.id)"
                >
                    <view class="activity-title">{{ activity.title }}</view>
                    <view class="activity-highlight">{{ activity.highlight }}</view>
                    <uni-icons type="arrowright" size="16" color="#c0c4cc" class="arrow-icon" />
                </view>
                <uni-load-more 
                    :status="loadStatus" 
                    :content-text="loadText"
                />
            </scroll-view>
        </view>
        
        <!-- 悬浮加号按钮 -->
        <view class="floating-button" @click="goToCreateActivity">
            <uni-icons type="plus" size="24" color="#fff" />
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from "@/store/userStore"
import { getUserActivity, getJoinedActivity } from "@/api"
import {onShow} from '@dcloudio/uni-app'

const activeTab = ref(0)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const tabItems = ['发起的活动', '参加的活动']

const favoriteActivities = ref([])
const initiatedActivities = ref([])
const participatedActivities = ref([])

const userStore = useUserStore()
const myActivity = computed(() => userStore.getMyActivity())
const myParticipation = computed(() => userStore.getParticipation())

// 页面显示时获取数据
onShow(() => {
    if (userStore.getIsLogin()) {
        // 获取用户发起的活动
        getUserActivity().then(res => {
            if (res?.data) {
                userStore.setMyActivity(res.data)
            }
        })
        
        // 获取用户参加的活动
        getJoinedActivity().then(res => {
            if (res?.data) {
                userStore.setParticipation(res.data)
            }
        })
    }
})

// 加载状态
const loadStatus = computed(() => {
    if (loading.value) return 'loading'
    if (finished.value) return 'noMore'
    return 'more'
})

const loadText = computed(() => {
    return {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多数据了'
    }
})

// 切换标签页
const onTabChange = (e) => {
    activeTab.value = e.currentIndex
}

// 下拉刷新
const onRefresh = () => {
    refreshing.value = true
    setTimeout(() => {
        refreshing.value = false
    }, 1000)
}

const loadFavoriteActivities = async () => {
    loading.value = true
    setTimeout(() => {
        favoriteActivities.value.push(
            { id: 1, title: '收藏的活动 1', description: '这是一个收藏的活动' },
            { id: 2, title: '收藏的活动 2', description: '这是另一个收藏的活动' }
        )
        loading.value = false
        finished.value = true
    }, 1000)
}

const loadInitiatedActivities = async () => {
    if (loading.value || finished.value) return
    loading.value = true
    setTimeout(() => {
        initiatedActivities.value.push(
            { id: 3, title: '发起的活动 1', description: '这是一个发起的活动' },
            { id: 4, title: '发起的活动 2', description: '这是另一个发起的活动' }
        )
        loading.value = false
        finished.value = true
    }, 1000)
}

const loadParticipatedActivities = async () => {
    if (loading.value || finished.value) return
    loading.value = true
    setTimeout(() => {
        participatedActivities.value.push(
            { id: 5, title: '参加的活动 1', description: '这是一个参加的活动' },
            { id: 6, title: '参加的活动 2', description: '这是另一个参加的活动' }
        )
        loading.value = false
        finished.value = true
    }, 1000)
}

// 跳转到活动详情页面
const goToActivityDetail = (activityId) => {
    uni.navigateTo({
        url: `/pages/Detail/ActivityDetailPage?id=${activityId}`
    })
}

// 跳转到活动发布页面
const goToCreateActivity = () => {
    uni.navigateTo({
        url: '/pages/launchActivity/LaunchActivity'
    })
}
</script>

<style lang="scss" scoped>
.login-prompt {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 36rpx;
    color: #999;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    text {
        color: #fff;
        font-weight: 500;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
    }
}

.activity-container {
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
    
    ::v-deep .uni-segmented-control {
        margin: 20rpx;
        border-radius: 25rpx;
        overflow: hidden;
        box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    }
}

.tab-content {
    flex: 1;
    margin-top: 10rpx;
    padding: 0 20rpx;
}

.scroll-area {
    height: 100%;
    padding-bottom: 200rpx;
}

.activity-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 40rpx 30rpx;
    margin-bottom: 24rpx;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 24rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
    border: 1rpx solid rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6rpx;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    }
    
    &:active {
        transform: translateY(-4rpx);
        box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.12);
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }
}

.activity-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 16rpx;
    line-height: 1.4;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.activity-highlight {
    font-size: 28rpx;
    color: #64748b;
    line-height: 1.6;
    width: 100%;
    margin-bottom: 20rpx;
}

.arrow-icon {
    position: absolute;
    top: 50%;
    right: 30rpx;
    transform: translateY(-50%);
    opacity: 0.6;
    transition: all 0.3s ease;
}

.activity-item:active .arrow-icon {
    opacity: 1;
    transform: translateY(-50%) translateX(6rpx);
}

.floating-button {
    position: fixed;
    bottom: 180rpx;
    right: 40rpx;
    width: 140rpx;
    height: 140rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 12rpx 40rpx rgba(102, 126, 234, 0.4);
    z-index: 999;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &::before {
        content: '';
        position: absolute;
        top: -2rpx;
        left: -2rpx;
        right: -2rpx;
        bottom: -2rpx;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        border-radius: 50%;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    &:active {
        transform: scale(0.92);
        box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.6);
        
        &::before {
            opacity: 1;
        }
    }
    
    ::v-deep .uni-icons {
        filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
    }
}

/* 加载更多组件样式优化 */
::v-deep .uni-load-more {
    padding: 40rpx 0;
    
    .uni-load-more__text {
        color: #94a3b8;
        font-size: 26rpx;
    }
    
    .uni-load-more__img {
        width: 48rpx;
        height: 48rpx;
    }
}

/* 分段控制器样式优化 */
::v-deep .uni-segmented-control__item {
    font-weight: 600;
    font-size: 30rpx;
    transition: all 0.3s ease;
}

::v-deep .uni-segmented-control__item--button--active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: #fff !important;
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}
</style>
