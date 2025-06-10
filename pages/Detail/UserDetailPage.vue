<template>
    <view class="user-profile">
        <!-- 顶部导航 -->
        <Head :go-back="true"/>

        <!-- 用户信息头部 -->
        <view class="user-header">
            <view class="avatar-section">
                <image
                    class="user-avatar"
                    mode="aspectFill"
                    :src="imgBaseUrl+userInfo.avatar"
                />
                <view class="user-meta">
                    <text class="username">{{ userInfo.name }}</text>
                    <text class="account">@{{ userInfo.account }}</text>
                </view>
            </view>
            <view v-if="userStore.getUser().account !== userInfo.account">
                <view class="stats-section">
                    <view class="stat-item">
                        <text class="stat-number">{{ followData.following.length }}</text>
                        <text class="stat-label">关注</text>
                    </view>
                    <view class="stat-item">
                        <text class="stat-number">{{ followData.follower.length }}</text>
                        <text class="stat-label">粉丝</text>
                    </view>
                </view>
                <view class="action-buttons">
                    <button
                        class="follow-btn"
                        :class="isFollowing ? 'followed' : 'follow'"
                        @click="toggleFollow"
                    >
                        {{ isFollowing ? '已关注' : '关注' }}
                    </button>
                    <button
                        class="add-friend-btn"
                        :disabled="isFriend"
                        @click="sendFriendRequest"
                    >
                        {{ isFriend ? "已为好友" : "加为好友" }}
                    </button>
                </view>
            </view>
        </view>

        <!-- 用户活动列表 -->
        <view class="activity-list">
            <text class="section-title">发布的活动</text>
            <block v-if="activities && activities.length !== 0">
                <ActivityCard
                    v-for="(activity, index) in activities"
                    :key="index"
                    :activity="activity"
                />
            </block>
            <view v-else class="empty-content">
                <uni-icons type="info" size="30" color="#ccc"></uni-icons>
                <text class="empty-text">暂无活动</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { imgBaseUrl } from '@/util/basic-data'
import { useUserStore } from '@/store/userStore'
import { getUserActivity } from '@/api/activityAPI'
import { addFriend, follow, getFollowList, getUserInfo, unfollow } from '@/api/userAPI'
import dayjs from 'dayjs'

// 页面参数
const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

const userStore = useUserStore()

// 用户信息
const userInfo = reactive({
    name: '加载中...',
    account: '',
    avatar: '',
    status: '',
})

const followData = reactive({
    following: [],
    follower: [],
})

const activities = ref([])

// 计算属性
const isFollowing = computed(() => !!userStore.getFollowData().following.find(item => item.account === userInfo.account))
const isFriend = computed(() => !!userStore.getFriend().find(item => item?.account === userInfo.account))

// 方法
const toggleFollow = async () => {
    try {
        if (isFollowing.value) {
            await unfollow(props.id)
            uni.showToast({
                title: '已取消关注',
                icon: 'none'
            })
        } else {
            await follow(props.id)
            uni.showToast({
                title: '关注成功',
                icon: 'success'
            })
        }
        
        // 刷新关注数据
        const followListRes = await getFollowList(props.id)
        Object.assign(followData, followListRes.data)
        
        // 刷新个人关注列表
        const userFollowRes = await getFollowList()
        userStore.setFollowData(userFollowRes?.data)
    } catch (error) {
        uni.showToast({
            title: '操作失败',
            icon: 'error'
        })
    }
}

const sendFriendRequest = async () => {
    try {
        const res = await addFriend(props.id)
        uni.showToast({
            title: res?.msg || '请求已发送',
            icon: 'success'
        })
    } catch (error) {
        uni.showToast({
            title: '发送请求失败',
            icon: 'none'
        })
    }
}

// 格式化活动时间
const formatActivityTime = (time) => {
    return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 加载数据
const loadData = async () => {
    try {
        // 获取用户发布的活动
        const activityRes = await getUserActivity(props.id)
        activities.value = activityRes.data.map(activity => {
            if (activity.beginTime) {
                activity.formattedTime = formatActivityTime(activity.beginTime)
            }
            return activity
        })
        
        // 获取用户信息
        const userInfoRes = await getUserInfo(props.id)
        Object.assign(userInfo, userInfoRes.data)
        
        // 获取关注信息
        const followRes = await getFollowList(props.id)
        Object.assign(followData, followRes.data)
    } catch (error) {
        uni.showToast({
            title: '加载数据失败',
            icon: 'none'
        })
    }
}

// 初始化
onMounted(() => {
    loadData()
})
</script>

<style scoped>
.user-profile {
    padding: 32rpx;
    background: #f7f8fa;
    min-height: 100vh;
}

.user-header {
    background: white;
    padding: 32rpx;
    border-radius: 24rpx;
    margin-bottom: 32rpx;
}

.avatar-section {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
}

.user-avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 80rpx;
}

.user-meta {
    margin-left: 32rpx;
}

.username {
    display: block;
    margin: 0;
    font-size: 36rpx;
    font-weight: bold;
}

.account {
    display: block;
    margin: 8rpx 0 0;
    color: #969799;
    font-size: 28rpx;
}

.stats-section {
    display: flex;
    gap: 48rpx;
    margin: 32rpx 0;
}

.stat-item {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
}

.stat-label {
    display: block;
    font-size: 24rpx;
    color: #969799;
}

.action-buttons {
    display: flex;
    margin-top: 20rpx;
}

.follow-btn, .add-friend-btn {
    height: 70rpx;
    line-height: 70rpx;
    font-size: 28rpx;
    border-radius: 35rpx;
}

.follow-btn {
    width: 30%;
    margin-right: 20rpx;
}

.follow {
    background-color: #007aff;
    color: #ffffff;
}

.followed {
    background-color: #f2f2f2;
    color: #333333;
}

.add-friend-btn {
    flex: 1;
    background-color: #4cd964;
    color: #ffffff;
}

.add-friend-btn[disabled] {
    background-color: #f2f2f2;
    color: #999999;
}

.section-title {
    display: block;
    margin: 32rpx 0;
    font-size: 32rpx;
    font-weight: 500;
    color: #323233;
}

.activity-list {
    background: white;
    border-radius: 24rpx;
    padding: 32rpx;
}

.empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
}

.empty-text {
    margin-top: 20rpx;
    color: #999;
    font-size: 28rpx;
}
</style> 