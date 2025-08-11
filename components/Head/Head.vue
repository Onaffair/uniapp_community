<template>
    <view class="header">
        <view class="nav-left" v-if="goBack" @click="goBackDo">
            <text class="iconfont icon-left-arrow"> 返回</text>
        </view>
        <view class="header-tit ellipsis" v-if="headTitle">{{ headTitle }}</view>
        <view class="nav-right">
            <slot name="right"></slot>
        </view>
    </view>
</template>

<script setup>
import {defineProps} from 'vue';

const props = defineProps({
    headTitle: {
        type: String,
        default: ''
    },
    goBack: {
        type: Boolean,
        default: false
    }
});

const goBackDo = () => {

    uni.navigateBack()
};
</script>

<style>
.header {
    width: 100%;
    display: inline-flex;
    justify-content: space-between;
    height: 96rpx;
    line-height: 96rpx;
    text-align: center;
    background: #ffffff;
    z-index: 1001;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.nav-left {
    font-size: 28rpx;
    margin-left: 5%;
    left: 32rpx;
}

.header-tit {
    max-width: 60%;
    margin: 0 auto;
    color: #323233;
    font-weight: 500;
    font-size: 40rpx;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.nav-right {
    right: 32rpx;
}
</style>