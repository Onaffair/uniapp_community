<template>
    <view>
        <view>
            <Head head-title="活动人数" :go-back="true"></Head>
        </view>
        <view class="form-container">
            <uni-forms>
                <uni-forms-item>
                    <view class="form-item">
                        <text class="form-label">最少人数</text>
                        <input
                            class="form-input"
                            v-model="localForm.leastJoinNum"
                            type="number"
                            placeholder="请输入"
                        />
                    </view>
                </uni-forms-item>
                <uni-forms-item>
                    <view class="form-item">
                        <text class="form-label">最大人数</text>
                        <input
                            class="form-input"
                            v-model="localForm.mostJoinNum"
                            type="number"
                            placeholder="请输入"
                        />
                    </view>
                </uni-forms-item>
            </uni-forms>
        </view>
        
        <view class="btn-container">
            <button class="btn-confirm" @click="handleSubmit">确认</button>
        </view>
        
        <view class="instruction-container">
            <text class="instruction-title">说明：</text>
            <text class="instruction-text">1. 活动到期后，如果最小报名人数不为0，且报名人数小于需要人数，活动将自动取消</text>
            <text class="instruction-text">2. 如果最小报名人数为0，则最大报名人数无效</text>
            <text class="instruction-text">3. 最大报名人数暂时不能超过500人</text>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue';
import { useActivityStore } from '@/store/activityStore';

const activityStore = useActivityStore();

// 创建本地副本
const localForm = ref({
    leastJoinNum: activityStore.formData.leastJoinNum || '',
    mostJoinNum: activityStore.formData.mostJoinNum || ''
});

const validateForm = () => {
    const min = Number(localForm.value.leastJoinNum);
    const max = Number(localForm.value.mostJoinNum);

    // 空值校验
    if (min === 0 || max === 0 || !localForm.value.leastJoinNum || !localForm.value.mostJoinNum) {
        uni.showToast({
            title: "报名人数不能为空或0",
            icon: "none"
        });
        return false;
    }

    // 数值关系校验
    if (min > max) {
        uni.showToast({
            title: "最小人数不能大于最大人数",
            icon: "none"
        });
        return false;
    }

    // 最大值限制
    if (max > 500) {
        uni.showToast({
            title: "最大人数不能超过500",
            icon: "none"
        });
        return false;
    }

    // 当最小人数为0时的特殊处理
    if (min === 0 && max !== 0) {
        uni.showToast({
            title: "最小人数为0时最大人数必须为0",
            icon: "none"
        });
        return false;
    }

    return true;
};

const handleSubmit = () => {
    if (!validateForm()) return;

    // 更新store数据
    activityStore.updateFormData({
        leastJoinNum: Number(localForm.value.leastJoinNum),
        mostJoinNum: Number(localForm.value.mostJoinNum)
    });

    uni.navigateBack();
};
</script>

<style>
.form-container {
    padding: 30rpx;
    margin-top: 20rpx;
}

.form-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1px solid #eee;
}

.form-label {
    font-size: 30rpx;
    font-weight: bold;
}

.form-input {
    width: 200rpx;
    height: 60rpx;
    text-align: right;
    color: #ffb04f;
    font-size: 30rpx;
}

.btn-container {
    display: flex;
    justify-content: center;
    margin: 60rpx 0;
}

.btn-confirm {
    width: 400rpx;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #ffb04f;
    color: white;
    border-radius: 40rpx;
    font-size: 32rpx;
}

.instruction-container {
    padding: 0 40rpx;
    margin-top: 60rpx;
}

.instruction-title {
    display: block;
    color: #aaaaaa;
    font-size: 28rpx;
    margin-bottom: 20rpx;
}

.instruction-text {
    display: block;
    color: #aaaaaa;
    font-size: 26rpx;
    line-height: 1.6;
    letter-spacing: 1rpx;
    margin-bottom: 10rpx;
}
</style> 