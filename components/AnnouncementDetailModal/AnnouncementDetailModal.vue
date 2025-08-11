<template>
    <view class="modal-overlay" v-if="visible" @tap="handleOverlayClick">
        <view class="modal-content" @tap.stop>
            <!-- 模态框头部 -->
            <view class="modal-header">
                <text class="modal-title">公告详情</text>
                <text class="iconfont icon-close" @tap="closeModal"></text>
            </view>

            <!-- 模态框内容 -->
            <scroll-view scroll-y="true" class="modal-body">
                <view class="announcement-detail" v-if="announcement">
                    <!-- 公告标题 -->
                    <view class="detail-title">
                        <text>{{ announcement.title }}</text>
                    </view>

                    <!-- 发布时间 -->
                    <view class="detail-meta">
                        <text class="iconfont icon-time"></text>
                        <text class="meta-text">发布时间：{{ formatDateTime(announcement.createdAt) }}</text>
                    </view>

                    <!-- 公告内容 -->
                    <view class="detail-content">
                        <text class="content-text">{{ announcement.content }}</text>
                    </view>

                    <!-- 图片展示 -->
                    <view class="detail-images" v-if="announcement.images && announcement.images.length > 0">
                        <text class="images-title">相关图片：</text>
                        <view class="images-grid">
                            <image 
                                v-for="(image, index) in imageList" 
                                :key="index"
                                :src="image"
                                class="detail-image"
                                mode="aspectFill"
                                @tap="previewImage(image, imageList)"
                                @error="handleImageError"
                            />
                        </view>
                    </view>
                </view>
            </scroll-view>

            <!-- 模态框底部 -->
            <view class="modal-footer">
                <button class="close-btn" @tap="closeModal">关闭</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { imgBaseUrl } from '@/util/basic-data'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    announcement: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close'])

// 处理图片列表
const imageList = computed(() => {
    if (!props.announcement?.images) return []
    
    try {
        const images = typeof props.announcement.images === 'string' 
            ? JSON.parse(props.announcement.images) 
            : props.announcement.images
        
        return Array.isArray(images) 
            ? images.map(img => img.startsWith('http') ? img : `${imgBaseUrl}${img}`)
            : []
    } catch (error) {
        console.error('解析图片数据失败:', error)
        return []
    }
})

// 格式化完整日期时间
const formatDateTime = (timeStr) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 预览图片
const previewImage = (current, urls) => {
    uni.previewImage({
        current,
        urls,
        fail: (error) => {
            console.error('预览图片失败:', error)
            uni.showToast({
                title: '图片预览失败',
                icon: 'error'
            })
        }
    })
}

// 图片加载失败处理
const handleImageError = (e) => {
    console.error('图片加载失败:', e)
}

// 关闭模态框
const closeModal = () => {
    emit('close')
}

// 点击遮罩层关闭
const handleOverlayClick = () => {
    closeModal()
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 900;
    padding: 40rpx;
}

.modal-content {
    background: #fff;
    border-radius: 24rpx;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;
}

.modal-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
}

.modal-header .iconfont {
    font-size: 40rpx;
    color: #666;
    padding: 8rpx;
}

.modal-body {
    flex: 1;
    max-height: 60vh;
}

.announcement-detail {
    padding: 32rpx;
}

.detail-title {
    margin-bottom: 24rpx;
}

.detail-title text {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
}

.detail-meta {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    padding: 16rpx 0;
    border-bottom: 1px solid #f0f0f0;
}

.detail-meta .iconfont {
    font-size: 28rpx;
    color: #999;
    margin-right: 8rpx;
}

.meta-text {
    font-size: 28rpx;
    color: #666;
}

.detail-content {
    margin-bottom: 32rpx;
}

.content-text {
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
    word-break: break-word;
}

.detail-images {
    margin-top: 32rpx;
}

.images-title {
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 16rpx;
    display: block;
}

.images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200rpx, 1fr));
    gap: 16rpx;
}

.detail-image {
    width: 100%;
    height: 200rpx;
    border-radius: 12rpx;
    background: #f5f5f5;
    cursor: pointer;
    transition: transform 0.2s;
}

.detail-image:active {
    transform: scale(0.95);
}

.modal-footer {
    padding: 24rpx 32rpx;
    border-top: 1px solid #f0f0f0;
    background: #fff;
}

.close-btn {
    width: 100%;
    height: 88rpx;
    background: #ff6b35;
    color: #fff;
    border: none;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:active {
    background: #e55a2b;
}
</style>