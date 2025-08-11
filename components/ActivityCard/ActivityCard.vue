<template>
    <view class="activity-card">
        <view class="activity-card-thumb">
            <image
                v-if="firstImage"
                class="thumb-image"
                mode="aspectFill"
                :src="imgBaseUrl+firstImage"
            />
            <view v-else class="default-thumb">
                <text class="iconfont icon-photo" style="font-size: 40rpx;"></text>
            </view>
        </view>
        <view class="activity-card-content">
            <view class="title" @click="goToDetail">{{ activity.title }}</view>
            <view class="meta-info" @click="goToDetail">
                <text class="category-tag">{{ categoryName }}</text>
                <view class="time">
                    <text class="iconfont icon-clock"></text>
                    <text>{{ timeRange }}</text>
                </view>
                <view class="location">
                    <text class="iconfont icon-location"></text>
                    <text>{{ displayAddress }}</text>
                </view>
            </view>
            <view class="stats">
                <view class="stat-item">
                    <text class="iconfont icon-friends"></text>
                    <text>{{ activity.joinNum }}/{{ activity.mostJoinNum }}</text>
                </view>
                <view class="stat-item">
                    <text class="iconfont icon-like"></text>
                    <text>{{ activity.collectNum }}</text>
                </view>
                <view class="stat-item">
                    <text class="iconfont icon-underway"></text>
                    <text>{{ currentStatus }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import {computed} from 'vue';
import {imgBaseUrl} from "@/util/basic-data";
import {useActivityStore} from "@/store/activityStore";
import dayjs from "dayjs";


const activityStore = useActivityStore()

const props = defineProps({
    activity: {
        type: Object,
        required: true
    }
});

// 状态映射
const statusMap = activityStore.activityStatusList;
// 分类映射
const categoryMap = activityStore.categoryList;

// 时间格式化
const formatTime = (timeString) => {
    return dayjs(timeString).format('YYYY年MM月DD日 HH:mm')
};

// 计算属性
const categoryName = computed(() => {
    const category = categoryMap.find(item => item.id === props.activity.categoryId);
    return category ? category.name : '未知分类';
});

const firstImage = computed(() => props.activity.images?.[0] || '');

const timeRange = computed(() => {
    return `${formatTime(props.activity.beginTime)} - ${formatTime(props.activity.endTime)}`;
});

const currentStatus = computed(() => {
    const status = props.activity.status;
    const item = statusMap.find(item => item.id === status);
    return item.name;
});

// 处理地址显示，提取实际地址部分
const displayAddress = computed(() => {
    const address = props.activity.address;
    if (!address) return '';
    
    // 检查地址是否包含经纬度信息（使用|分隔）
    const addressParts = address.split('|');
    if (addressParts.length >= 3) {
        // 只返回实际地址部分
        return addressParts[0];
    }
    
    // 如果不包含分隔符，直接返回原地址
    return address;
});

const goToDetail = () => {
    uni.navigateTo({
        url: `/pages/Detail/ActivityDetailPage?id=${props.activity.id}`
    });
};
</script>

<style lang="scss">
.activity-card {
    padding: 24rpx;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    background-color: #fff;
    display: flex;

    &-thumb {
        width: 180rpx;
        height: 180rpx;
        margin-right: 20rpx;

        .thumb-image {
            width: 100%;
            height: 100%;
            border-radius: 8rpx;
        }

        .default-thumb {
            width: 100%;
            height: 100%;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            border-radius: 8rpx;
        }
    }

    &-content {
        flex: 1;
        overflow: hidden;
    }
}

.title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.meta-info {
    font-size: 24rpx;
    color: #666;
    line-height: 1.5;

    .category-tag {
        display: inline-block;
        padding: 0 8rpx;
        border: 1rpx solid #2979ff;
        color: red;
        border-radius: 8rpx;
        margin-bottom: 8rpx;
    }
}

.time,
.location {
    display: flex;
    align-items: center;
    margin-top: 12rpx;

    .iconfont {
        margin-right: 8rpx;
    }
}

.stats {
    display: flex;
    justify-content: space-between;
    margin-top: 24rpx;
    padding: 16rpx 0;
    background: #f5f5f5;
    border-radius: 8rpx;
}

.stat-item {
    display: flex;
    align-items: center;
    font-size: 24rpx;

    .iconfont {
        margin-right: 8rpx;
    }
}
</style> 