<template>
    <view class="container">
        <!-- 顶部导航 -->
        <view class="top-bar">
            <view class="search-box">
                <input type="text" placeholder="搜索活动" v-model="searchText"/>
                <text class="iconfont icon-search"></text>
            </view>
            <image :src="imgBaseUrl+userStore.getUser().avatar" class="avatar" mode="aspectFill"></image>
        </view>

        <!-- 分类标签 -->
        <scroll-view scroll-x="true"  enable-flex="true" class="category-tabs" :show-scrollbar="false">
            <view
                v-for="category in categories"
                :key="category.id"
                :class="['tab-item', { active: selectedCategory === category.id }]"
                @tap="selectedCategory = category.id"
            >
                {{ category.name }}
            </view>
        </scroll-view>
        <!-- 下拉刷新 -->
        <scroll-view
            scroll-y="true"
            class="content-scroll"
            :refresher-enabled="false"
            :refresher-triggered="isLoading"
            @refresherrefresh="onRefresh"
            @scrolltolower="loadMore"
        >
            <!-- 轮播 -->
            <swiper class="swiper" indicator-dots autoplay circular>
                <swiper-item v-for="item in topActivities" :key="item.id" @tap="navigateToDetail(item.id)">
                    <image
                        class="swiper-image"
                        :src="imgBaseUrl+item.images[0]"
                        mode="aspectFill"
                    ></image>
                </swiper-item>
            </swiper>

            <activity-card
                v-if="activities"
                v-for="item in activities"
                :key="item.id"
                :activity="item"
            />

            <view v-if="activities && activities.length === 0" class="empty-hint">
                暂无活动
            </view>

        </scroll-view>
    </view>
</template>

<script setup>
import {computed, onBeforeMount, ref, watch} from 'vue';
import {getActivityList, getTopActivity} from "@/api/activityAPI";
import {useUserStore} from "@/store/userStore";
import {useActivityStore} from "@/store/activityStore";
import ActivityCard from "@/components/ActivityCard/ActivityCard.vue";
import {imgBaseUrl} from "@/util/basic-data";

const userStore = useUserStore();
const activityStore = useActivityStore();

// 分类标签数据
const categories = computed(() => activityStore.categoryList)

const isLoading = ref(false);
const selectedCategory = ref(0);
const page = ref(1);
const searchText = ref("");
const topNum = 3;
const topActivities = ref([]);

const activities = getActivityList(selectedCategory, page, searchText);

// 下拉刷新
const onRefresh = () => {
    isLoading.value = true;
    page.value = 1;
    uni.showToast({
        title: '刷新成功',
        icon: 'success',
    });
};
// 加载更多
const loadMore = async () => {
    page.value++;
};

// 跳转到详情页
const navigateToDetail = (id) => {
    uni.navigateTo({
        url: `/pages/Detail/ActivityDetailPage?id=${id}`
    });
};

onBeforeMount(() => {
    getTopActivity(topNum)
        .then(res => {
            if (res && res.data) {
                topActivities.value = res.data;
            }
        });
});

</script>

<style>
.container {
    padding: 24rpx;
    background: #f5f5f5;
    min-height: 100vh;
}

.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32rpx;
}

.search-box {
    flex: 1;
    position: relative;
    margin-right: 32rpx;
}

.search-box input {
    width: 100%;
    padding: 16rpx 64rpx 16rpx 24rpx;
    border-radius: 40rpx;
    border: 1px solid #ddd;
    background-color: #fff;
}

.search-box .iconfont {
    position: absolute;
    right: 16rpx;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
}

.category-tabs {
    display: flex;
    white-space: nowrap;
    padding-bottom: 16rpx;
    margin-bottom: 32rpx;
}

.tab-item {
    display: inline-block;
    padding: 12rpx 24rpx;
    margin-right: 24rpx;
    border-radius: 32rpx;
    background: #eee;
    font-size: 28rpx;
    color: #666;
}

.tab-item.active {
    background: #007bff;
    color: white;
}

.content-scroll {
    height: calc(100vh - 220rpx);
}

.swiper {
    width: 100%;
    height: 400rpx;
    margin-bottom: 32rpx;
}

.swiper-image {
    width: 100%;
    height: 100%;
    border-radius: 16rpx;
}

.empty-hint {
    text-align: center;
    padding: 40rpx;
    color: #999;
}

.loading {
    text-align: center;
    padding: 20rpx 0;
    color: #666;
}
</style> 