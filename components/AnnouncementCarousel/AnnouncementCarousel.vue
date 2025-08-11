<template>
    <view class="announcement-carousel" v-if="announcements && announcements.length > 0">
        <view class="carousel-header">
            <text class="iconfont icon-notice"></text>
            <text class="header-title">最新公告</text>
            <uni-icons type="more" @tap="goToAnnouncementList"/>
        </view>
        <swiper
            class="announcement-swiper"
            :autoplay="true"
            :interval="3000"
            :duration="500"
            :vertical="true"
            :circular="true"
            :display-multiple-items="1"
        >
            <swiper-item
                v-for="announcement in announcements"
                :key="announcement.announcementId"
                @tap="handleAnnouncementClick(announcement)"
            >
                <view class="announcement-item">
                    <text class="announcement-title">{{ announcement.title }}</text>
                    <text class="announcement-time">{{ formatTime(announcement.createdAt) }}</text>
                </view>
            </swiper-item>
        </swiper>
    </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    announcements: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['clickAnnouncement', 'goToList'])

// 格式化时间
const formatTime = (timeStr) => {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
        return '今天'
    } else if (days === 1) {
        return '昨天'
    } else if (days < 7) {
        return `${days}天前`
    } else {
        return date.toLocaleDateString()
    }
}

// 点击公告
const handleAnnouncementClick = (announcement) => {
    emit('clickAnnouncement', announcement)
}

// 跳转到公告列表
const goToAnnouncementList = () => {
    emit('goToList')
}
</script>

<style scoped>
.announcement-carousel {
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 32rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.carousel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    border-bottom: 1px solid #f0f0f0;
    background: blueviolet;
    color: #fff;
}

.carousel-header .iconfont {
    margin-right: 12rpx;
    font-size: 36rpx;
}

.header-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
}

.more-btn {
    font-size: 28rpx;
    opacity: 0.8;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.2);
}

.announcement-swiper {
    height: 120rpx;
}



.announcement-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 24rpx;
    height: 100%;
    cursor: pointer;
    transition: background-color 0.2s;
}

.announcement-item:active {
    background-color: #f8f8f8;
}

.announcement-title {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4;
}

.announcement-time {
    font-size: 24rpx;
    color: #999;
    line-height: 1.2;
}
</style>