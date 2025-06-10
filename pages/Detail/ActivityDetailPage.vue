<template>
    <view class="activity-detail">
        <!-- 顶部导航 -->
        <Head :go-back="true"/>

        <swiper :autoplay="true" :interval="3000" circular>
            <swiper-item v-for="(item, index) in activityInfo?.activity?.images" :key="index">
                <image
                    class="banner-image"
                    mode="aspectFill"
                    :src="imgBaseUrl+item"
                />
            </swiper-item>
        </swiper>

        <!-- 主要内容 -->
        <view class="content-container">
            <!-- 活动基本信息 -->
            <uni-card>
                <view class="title">{{ activityInfo?.activity?.title }}</view>
                <view class="meta">
                    <uni-tag type="primary">{{ categoryName }}</uni-tag>
                    <text class="stats">
                        <uni-icons type="star" size="16"/> {{ activityInfo?.activity?.collectNum }} 收藏
                        <uni-icons type="staff" size="16"/> {{ activityInfo?.activity?.joinNum }} 人参加
                    </text>
                </view>
                
                <!-- 时间信息 -->
                <view class="info-item">{{ timeRange }}</view>
                
                <!-- 地址信息 -->
                <view class="info-item location" @click="openLocation">
                    {{ activityInfo?.activity?.address }}
                    <uni-icons type="location" size="16"/>
                </view>
                
                <!-- 人数限制 -->
                <view class="info-item">
                    最少 {{ activityInfo?.activity?.leastJoinNum }} 人成行，最多 {{ activityInfo?.activity?.mostJoinNum }} 人
                </view>
            </uni-card>

            <!-- 组织者信息 -->
            <uni-card class="organizer-section">
                <view class="organizer-info" @click="goToUserDetail(activityInfo?.organizerInfo?.account)">
                    组织者：
                    <image
                        class="avatar-image"
                        mode="aspectFill"
                        :src="imgBaseUrl+activityInfo?.organizerInfo?.avatar"
                    />
                    {{ activityInfo?.organizerInfo?.name }}
                    <uni-icons type="right" size="16"/>
                </view>
            </uni-card>

            <!-- 活动亮点 -->
            <uni-card title="活动亮点">
                <uni-icons type="notification" size="16"/>
                <view class="highlight-content">{{ activityInfo?.activity?.highlight }}</view>
            </uni-card>

            <!-- 活动详情 -->
            <uni-card title="活动详情">
                <uni-icons type="info" size="16"/>
                <view class="content-text">{{ activityInfo?.activity?.content }}</view>
            </uni-card>
        </view>
        
        <!--评论区-->
        <view class="comment-section">
            <Comment
                v-for="(item, index) in activityInfo?.comments"
                :key="index"
                :userinfo="item?.userinfo"
                :comment="item?.comment"
                @onClickReply="handleReply"
            />
            <WriteComment
                :my-comment="myComment"
                @on-comment-success="refreshActivityInfo"
            />
        </view>
        
        <!-- 底部操作栏 -->
        <view class="action-bar">
            <view class="action-bar-content">
                <text class="icon-share" @click="generateShareContent">
                    <uni-icons type="redo" size="24"/>
                </text>
                <button
                    class="action-button"
                    :class="{'disabled': btnStatus.isDisabled}"
                    :disabled="btnStatus.isDisabled"
                    :style="{ backgroundColor: btnStatus.color }"
                    @click="btnStatus.fn()"
                >
                    {{ btnStatus.text }}
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { imgBaseUrl } from '@/util/basic-data'
import { useActivityStore } from '@/store/activityStore'
import { useUserStore } from '@/store/userStore'
import { cancelActivity, cancelJoinActivity, getActivityDetail, joinActivity } from '@/api/activityAPI'
import { joinGroup, quitGroup } from '@/api/GroupApI'
import dayjs from 'dayjs'

// 页面参数
const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

const activityInfo = ref({})
// 存储分离出的经纬度信息
const locationCoords = ref({
    latitude: null,
    longitude: null
})
const { activityStatusList, categoryList } = useActivityStore()
const userStore = useUserStore()
const { myActivity, userDetail } = userStore

// 计算属性
const categoryName = computed(() => categoryList.find(item => item.id === activityInfo.value.activity?.categoryId)?.name || '其他')
const timeRange = computed(() => {
    // 使用dayjs处理时间
    //yyyy/MM/dd HH:mm:ss
    const format = t => dayjs(t).format('YYYY/MM/DD HH:mm')
    return `${format(activityInfo.value.activity?.beginTime)} 至 ${format(activityInfo.value.activity?.endTime)}`
})

// 评论
const myComment = reactive({
    activityId: props.id,
    userId: userDetail?.account,
    textContent: '',
    imageUrl: null,
    rating: 0.0,
    replyHint: null,
    replyText: null,
})

const btnStatus = computed(() => {
    const res = {
        color: '#FFCC00',
        fn: handleJoin,
        text: '立即报名',
        isDisabled: false
    }
    const status = activityInfo.value?.activity?.status

    if (myActivity.find(item => item?.id === activityInfo?.value?.activity?.id) && status < 3) {
        res.text = '取消活动'
        res.color = '#FF0000'
        res.fn = organizerCancelActivity
        return res
    }
    if (userStore.getParticipation().find(item => item?.id === activityInfo?.value?.activity?.id) && status < 3) {
        res.text = '取消报名'
        res.fn = handleCancelJoin
    } else {
        let item = activityStatusList.find(item => item?.id === status)
        if (item?.id == 2) {
            res.text = '立即报名'
            res.fn = handleJoin
        } else {
            res.text = item?.name
            res.color = '#999999'
            res.isDisabled = true
        }
    }
    return res
})

// 事件处理
const handleJoin = async () => {
    await joinActivity(activityInfo.value.activity.id)
        .then(async res => {
            if (res?.code === 200) {
                await joinGroup(activityInfo.value.activity.id)
                uni.showToast({
                    title: "报名成功",
                    icon: "success"
                })
            } else {
                uni.showToast({
                    title: res?.msg,
                    icon: "none"
                })
            }
        })
}

const handleCancelJoin = () => {
    uni.showModal({
        title: '确认取消',
        content: '确定要执行此操作吗？',
        success: async (res) => {
            if (res.confirm) {
                await cancelJoinActivity(activityInfo.value.activity.id)
                await quitGroup(activityInfo.value.activity.id)
                refreshActivityInfo()
            }
        }
    })
}

const organizerCancelActivity = async () => {
    uni.showModal({
        title: '确认取消',
        content: '确定要执行此操作吗？',
        success: async (res) => {
            if (res.confirm) {
                await cancelActivity(activityInfo.value.activity.id)
                refreshActivityInfo()
            }
        }
    })
}

const handleReply = (id, text) => {
    myComment.replyHint = id
    myComment.replyText = text
}

// 处理活动详情数据，分离经纬度信息
const processActivityData = (data) => {
    if (data && data.activity && data.activity.address) {
        const addressParts = data.activity.address.split('|');
        
        if (addressParts.length >= 3) {
            // 分离经纬度信息
            const displayAddress = addressParts[0];
            const latitude = parseFloat(addressParts[1]);
            const longitude = parseFloat(addressParts[2]);
            
            // 保存经纬度信息
            locationCoords.value = {
                latitude: latitude,
                longitude: longitude
            };
            
            // 修改原数据中的地址为纯地址
            data.activity.address = displayAddress;
        }
    }
    return data;
};

const refreshActivityInfo = () => {
    getActivityDetail(props.id)
        .then(res => {
            // 处理返回的数据，分离经纬度信息
            activityInfo.value = processActivityData(res);
        })
}

// 生成分享内容
const generateShareContent = () => {
    const activity = activityInfo.value.activity
    const shareText = `🔥我分享了活动《${activity.title}》\n${activity.highlight}`
    
    // 使用uni-app的分享API
    uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        title: activity.title,
        summary: activity.highlight,
        success: function() {
            uni.showToast({
                title: '分享成功',
                icon: 'success'
            })
        },
        fail: function() {
            uni.showToast({
                title: '分享失败',
                icon: 'none'
            })
        }
    })
}

// 打开地图位置
const openLocation = () => {
    // 使用保存的经纬度信息
    if (!locationCoords.value.latitude || !locationCoords.value.longitude) {
        uni.showToast({
            title: '位置信息不完整',
            icon: 'none'
        });
        return;
    }
    
    uni.openLocation({
        latitude: locationCoords.value.latitude,
        longitude: locationCoords.value.longitude,
        name: activityInfo.value.activity?.title,
        address: activityInfo.value.activity?.address,
        fail: () => {
            uni.showToast({
                title: '无法打开位置',
                icon: 'none'
            });
        }
    });
}

// 跳转到用户详情页
const goToUserDetail = (userId) => {
    uni.navigateTo({
        url: `/pages/Detail/UserDetailPage?id=${userId}`
    })
}

// 初始化加载数据
onMounted(() => {
    refreshActivityInfo()
})
</script>

<style scoped>
.activity-detail {
    padding-bottom: 120rpx;
}

.banner-image {
    width: 100%;
    height: 400rpx;
}

.content-container {
    padding: 24rpx;
}

.title {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
}

.meta {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 12rpx;
}

.stats {
    color: #666;
    font-size: 24rpx;
}

.info-item {
    margin: 20rpx 0;
    font-size: 28rpx;
    color: #333;
}

.location {
    display: flex;
    justify-content: space-between;
}

.highlight-content,
.content-text {
    white-space: pre-wrap;
    line-height: 1.6;
    color: #666;
    font-size: 28rpx;
    margin-top: 10rpx;
}

.action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24rpx;
    background: white;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.action-bar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.icon-share {
    margin: 0 auto;
    padding: 0 30rpx;
}

.action-button {
    width: 80%;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    color: #fff;
    font-size: 30rpx;
}

.disabled {
    opacity: 0.6;
}

.organizer-section {
    margin-top: 32rpx;
}

.organizer-info {
    display: flex;
    align-items: center;
}

.avatar-image {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    margin: 0 10rpx;
}

.comment-section {
    padding: 0 24rpx;
    margin-bottom: 100rpx;
}
</style> 