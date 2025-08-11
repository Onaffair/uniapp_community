<template>
    <view class="announcement-list-page">
        <!-- 顶部导航 -->
<!--        <view class="nav-bar">-->
<!--            <text class="iconfont icon-arrow-left" @tap="goBack"></text>-->
<!--            <text class="nav-title">公告列表</text>-->
<!--            <view class="nav-placeholder"></view>-->
<!--        </view>-->
        <Head :go-back="true" head-title="公告列表"></Head>

        <!-- 公告列表 -->
        <scroll-view 
            scroll-y="true" 
            class="content-scroll"
            :refresher-enabled="true"
            :refresher-triggered="isRefreshing"
            @refresherrefresh="onRefresh"
            @scrolltolower="loadMore"
        >
            <view class="announcement-list">
                <view 
                    v-for="announcement in announcements" 
                    :key="announcement.announcementId"
                    class="announcement-card"
                    :class="{ 'highlight': highlightId && announcement.announcementId == highlightId }"
                    @tap="showAnnouncementDetail(announcement)"
                >
                    <view class="card-header">
                        <text class="announcement-title">{{ announcement.title }}</text>
                        <text class="announcement-time">{{ formatTime(announcement.createdAt) }}</text>
                    </view>
                    <view class="card-content">
                        <text class="announcement-preview">{{ getPreviewContent(announcement.content) }}</text>
                    </view>
                    <view class="card-footer" v-if="announcement.images && announcement.images.length > 0">
                        <text class="has-images">📷 包含图片</text>
                    </view>
                </view>
            </view>

            <!-- 加载状态 -->
            <view class="loading-status" v-if="isLoading">
                <text>加载中...</text>
            </view>

            <!-- 没有更多数据 -->
            <view class="no-more" v-if="!hasMore && announcements.length > 0">
                <text>没有更多公告了</text>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="announcements.length === 0 && !isLoading">
                <text class="iconfont icon-empty"></text>
                <text class="empty-text">暂无公告</text>
            </view>
        </scroll-view>

        <!-- 公告详情模态框 -->
        <announcement-detail-modal 
            :visible="showModal" 
            :announcement="selectedAnnouncement"
            @close="closeModal"
        />
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAnnouncements } from '@/api/userAPI'
import AnnouncementDetailModal from '@/components/AnnouncementDetailModal/AnnouncementDetailModal.vue'
import { imgBaseUrl } from '@/util/basic-data'

const announcements = ref([])
const isLoading = ref(false)
const isRefreshing = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 10
const highlightId = ref(null)

// 模态框相关
const showModal = ref(false)
const selectedAnnouncement = ref(null)

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

// 获取内容预览
const getPreviewContent = (content) => {
    if (!content) return ''
    return content.length > 100 ? content.substring(0, 100) + '...' : content
}

// 加载公告列表
const loadAnnouncements = async (page = 1, isRefresh = false) => {
    if (isLoading.value) return
    
    isLoading.value = true
    
    try {
        const res = await getAnnouncements({ page, size: pageSize })
        
        if (res && res.data) {
            const newAnnouncements = res.data.records || []
            
            if (isRefresh || page === 1) {
                announcements.value = newAnnouncements
            } else {
                announcements.value = [...announcements.value, ...newAnnouncements]
            }
            
            hasMore.value = newAnnouncements.length === pageSize
            currentPage.value = page
        }
    } catch (error) {
        console.error('加载公告失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'error'
        })
    } finally {
        isLoading.value = false
        isRefreshing.value = false
    }
}

// 下拉刷新
const onRefresh = () => {
    isRefreshing.value = true
    currentPage.value = 1
    hasMore.value = true
    loadAnnouncements(1, true)
}

// 加载更多
const loadMore = () => {
    if (hasMore.value && !isLoading.value) {
        loadAnnouncements(currentPage.value + 1)
    }
}

// 显示公告详情
const showAnnouncementDetail = (announcement) => {
    selectedAnnouncement.value = announcement
    highlightId.value = announcement.announcementId
    showModal.value = true
}

// 关闭模态框
const closeModal = () => {
    showModal.value = false
    selectedAnnouncement.value = null
}

// 返回上一页
const goBack = () => {
    uni.navigateBack()
}

// 页面加载时获取数据
onMounted(() => {
    // 获取页面参数
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options || {}
    
    if (options.highlightId) {
        highlightId.value = options.highlightId
    }
    
    loadAnnouncements(1)
})
</script>

<style scoped>
.announcement-list-page {
    min-height: 100vh;
    background: #f5f5f5;
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav-bar .iconfont {
    font-size: 36rpx;
    color: #333;
    padding: 12rpx;
}

.nav-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
}

.nav-placeholder {
    width: 60rpx;
}

.content-scroll {
    height: calc(100vh - 120rpx);
}

.announcement-list {
    padding: 24rpx;
}

.announcement-card {
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    padding: 32rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
}

.announcement-card:active {
    transform: scale(0.98);
}

.announcement-card.highlight {
    border: 2px solid #ff6b35;
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
}

.announcement-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
    margin-right: 16rpx;
}

.announcement-time {
    font-size: 24rpx;
    color: #999;
    white-space: nowrap;
}

.card-content {
    margin-bottom: 16rpx;
}

.announcement-preview {
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
}

.card-footer {
    display: flex;
    align-items: center;
}

.has-images {
    font-size: 24rpx;
    color: #ff6b35;
}

.loading-status {
    text-align: center;
    padding: 40rpx;
    color: #999;
}

.no-more {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 28rpx;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 40rpx;
    color: #999;
}

.empty-state .iconfont {
    font-size: 120rpx;
    margin-bottom: 24rpx;
    opacity: 0.5;
}

.empty-text {
    font-size: 28rpx;
}
</style>