<template>
    <view class="announcement-list-page">
        <!-- 顶部导航栏 -->
        <view class="top-bar">
            <view class="back-btn" @tap="goBack">
                <text class="iconfont icon-arrow-left"></text>
            </view>
            <text class="page-title">公告列表</text>
            <view class="placeholder"></view>
        </view>

        <!-- 公告列表 -->
        <scroll-view 
            class="content-scroll" 
            scroll-y 
            @scrolltolower="loadMore"
            :refresher-enabled="true"
            :refresher-triggered="refreshing"
            @refresherrefresh="onRefresh"
        >
            <view class="announcement-list">
                <view 
                    v-for="announcement in announcements" 
                    :key="announcement.announcementId"
                    class="announcement-item"
                    @tap="viewAnnouncementDetail(announcement)"
                >
                    <view class="announcement-content">
                        <text class="announcement-title">{{ announcement.title }}</text>
                        <text class="announcement-time">{{ formatTime(announcement.createdAt) }}</text>
                    </view>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
            </view>

            <!-- 加载状态 -->
            <view class="loading-more" v-if="loading">
                <text>加载中...</text>
            </view>
            
            <!-- 没有更多数据 -->
            <view class="no-more" v-if="noMore && announcements.length > 0">
                <text>没有更多公告了</text>
            </view>

            <!-- 空状态 -->
            <view class="empty-hint" v-if="!loading && announcements.length === 0">
                <text class="iconfont icon-empty"></text>
                <text>暂无公告</text>
            </view>
        </scroll-view>

        <!-- 公告详情模态框 -->
        <view class="modal-overlay" v-if="showModal" @tap="closeModal">
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">{{ selectedAnnouncement?.title }}</text>
                    <text class="modal-close" @tap="closeModal">×</text>
                </view>
                <view class="modal-body">
                    <text class="modal-time">{{ formatTime(selectedAnnouncement?.createdAt) }}</text>
                    <text class="modal-content-text">{{ selectedAnnouncement?.content }}</text>
                    <!-- 图片展示 -->
                    <view class="modal-images" v-if="selectedAnnouncement?.images">
                        <image 
                            v-for="(image, index) in parseImages(selectedAnnouncement.images)" 
                            :key="index"
                            :src="image" 
                            class="modal-image"
                            mode="aspectFit"
                            @tap="previewImage(image, parseImages(selectedAnnouncement.images))"
                        />
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAnnouncements } from '@/api/userAPI.js';

// 响应式数据
const announcements = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const noMore = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const showModal = ref(false);
const selectedAnnouncement = ref(null);

// 返回上一页
const goBack = () => {
    uni.navigateBack();
};

// 格式化时间
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
        return `${minutes}分钟前`;
    } else if (hours < 24) {
        return `${hours}小时前`;
    } else if (days < 7) {
        return `${days}天前`;
    } else {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
};

// 解析图片字符串
const parseImages = (imagesStr) => {
    if (!imagesStr) return [];
    try {
        return JSON.parse(imagesStr);
    } catch (e) {
        return [];
    }
};

// 预览图片
const previewImage = (current, urls) => {
    uni.previewImage({
        current,
        urls
    });
};

// 查看公告详情
const viewAnnouncementDetail = (announcement) => {
    selectedAnnouncement.value = announcement;
    showModal.value = true;
};

// 关闭模态框
const closeModal = () => {
    showModal.value = false;
    selectedAnnouncement.value = null;
};

// 加载公告列表
const loadAnnouncements = async (page = 1, isRefresh = false) => {
    if (loading.value) return;
    
    loading.value = true;
    
    try {
        const response = await getAnnouncements(page, pageSize.value);
        if (response.code === 200) {
            const newAnnouncements = response.data.records || [];
            
            if (isRefresh) {
                announcements.value = newAnnouncements;
                currentPage.value = 1;
                noMore.value = false;
            } else {
                if (page === 1) {
                    announcements.value = newAnnouncements;
                } else {
                    announcements.value.push(...newAnnouncements);
                }
            }
            
            // 判断是否还有更多数据
            if (newAnnouncements.length < pageSize.value) {
                noMore.value = true;
            }
        }
    } catch (error) {
        console.error('加载公告失败:', error);
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        });
    } finally {
        loading.value = false;
        refreshing.value = false;
    }
};

// 下拉刷新
const onRefresh = () => {
    refreshing.value = true;
    currentPage.value = 1;
    loadAnnouncements(1, true);
};

// 加载更多
const loadMore = () => {
    if (!loading.value && !noMore.value) {
        currentPage.value++;
        loadAnnouncements(currentPage.value);
    }
};

// 页面加载时获取数据
onMounted(() => {
    loadAnnouncements(1);
});
</script>

<style scoped>
.announcement-list-page {
    height: 100vh;
    background-color: #f8f8f8;
    display: flex;
    flex-direction: column;
}

.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 24rpx;
    background-color: #fff;
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: #f8f8f8;
}

.back-btn .iconfont {
    font-size: 32rpx;
    color: #333;
}

.page-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
}

.placeholder {
    width: 60rpx;
}

.content-scroll {
    flex: 1;
    padding: 0;
}

.announcement-list {
    background-color: #fff;
    margin: 20rpx;
    border-radius: 16rpx;
    overflow: hidden;
}

.announcement-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 24rpx;
    border-bottom: 1px solid #f8f8f8;
    transition: background-color 0.2s;
}

.announcement-item:last-child {
    border-bottom: none;
}

.announcement-item:active {
    background-color: #f8f8f8;
}

.announcement-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.announcement-title {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 12rpx;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.announcement-time {
    font-size: 26rpx;
    color: #999;
}

.announcement-item .iconfont {
    color: #ccc;
    font-size: 28rpx;
    margin-left: 16rpx;
}

.loading-more {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 28rpx;
}

.no-more {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 28rpx;
}

.empty-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 40rpx;
    color: #ccc;
}

.empty-hint .iconfont {
    font-size: 120rpx;
    margin-bottom: 24rpx;
}

.empty-hint text:last-child {
    font-size: 28rpx;
}

/* 模态框样式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 40rpx;
}

.modal-content {
    background-color: #fff;
    border-radius: 16rpx;
    max-height: 80vh;
    width: 100%;
    max-width: 600rpx;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 24rpx 16rpx;
    border-bottom: 1px solid #f0f0f0;
}

.modal-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    flex: 1;
    line-height: 1.4;
}

.modal-close {
    font-size: 48rpx;
    color: #999;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 16rpx;
}

.modal-body {
    padding: 24rpx;
    overflow-y: auto;
    flex: 1;
}

.modal-time {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 24rpx;
    display: block;
}

.modal-content-text {
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 24rpx;
    display: block;
}

.modal-images {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.modal-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 8rpx;
    background-color: #f8f8f8;
}
</style>