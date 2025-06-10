<template>
    <view>
        <view>
            <Head head-title="活动详情" :go-back="true"></Head>
        </view>
        <view class="label-container">
            <label-title :msg="'活动亮点'"/>
            <text class="counter">{{ highlightLength }} / 150</text>
        </view>
        <view class="highlight-container">
            <uni-forms>
                <uni-forms-item>
                    <textarea
                        class="highlight-field"
                        v-model="localForm.highlight"
                        maxlength="150"
                        placeholder="请填写几句活动亮点，便于分享和推荐活动。"
                        auto-height
                    />
                </uni-forms-item>
            </uni-forms>
        </view>
        <view>
            <label-title :msg="'活动内容'"/>
        </view>
        <view class="content-container">
            <uni-forms>
                <uni-forms-item>
                    <textarea
                        class="content-field"
                        placeholder="填写活动详细介绍，不得出现微信等联系方式"
                        v-model="localForm.content"
                        auto-height
                    />
                </uni-forms-item>
            </uni-forms>
        </view>
        <view class="btn-container">
            <button class="btn-confirm" @click="handleSubmit">确认</button>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useActivityStore } from '@/store/activityStore';

const activityStore = useActivityStore();

// 创建响应式副本（使用深拷贝避免直接修改store）
const localForm = ref({
    highlight: activityStore.formData.highlight || '',
    content: activityStore.formData.content || ''
});

const highlightLength = computed(() => localForm.value.highlight.length);

// 验证规则
const phoneNumberRegex = /(1(3\d|4[5-9]|5[0-3,5-9]|6[2567]|7[0-8]|8\d|9[89])\d{8})/; // 更严格的手机号验证
const vxRegex = /微信|wechat|vx|wx/gi; // 增加更多微信关键词

const validateForm = () => {
    // 必填校验
    if (!localForm.value.highlight.trim()) {
        uni.showToast({
            title: "活动亮点不能为空",
            icon: "none",
            position: 'top'
        });
        return false;
    }
    
    if (!localForm.value.content.trim()) {
        uni.showToast({
            title: "活动内容不能为空",
            icon: "none",
            position: 'top'
        });
        return false;
    }

    // 内容长度校验
    if (localForm.value.content.trim().length < 50) {
        uni.showToast({
            title: "活动内容不能小于50字",
            icon: "none",
            position: 'top'
        });
        return false;
    }

    // 敏感信息校验
    const forbiddenKeywords = [
        { regex: vxRegex, message: "内容不能包含微信联系方式" },
        { regex: phoneNumberRegex, message: "内容不能包含手机号码" },
        { regex: /QQ|qq|企鹅/gi, message: "内容不能包含QQ联系方式" }
    ];

    for (const { regex, message } of forbiddenKeywords) {
        if (regex.test(localForm.value.content)) {
            uni.showToast({
                title: message,
                icon: "none",
                position: 'top'
            });
            return false;
        }
    }

    return true;
};

const handleSubmit = () => {
    if (!validateForm()) return;

    // 提交前进行最终校验
    try {
        activityStore.updateFormData({
            highlight: localForm.value.highlight.trim(),
            content: localForm.value.content.trim()
        });
        uni.navigateBack();
    } catch (error) {
        uni.showToast({
            title: "保存失败，请稍后重试",
            icon: "none"
        });
    }
};
</script>

<style>
.label-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 30rpx;
}

.counter {
    color: #ACACAC;
    text-align: right;
    font-size: 26rpx;
}

.highlight-container, .content-container {
    padding: 20rpx 30rpx;
}

.highlight-field {
    min-height: 300rpx;
    width: 100%;
    background-color: #f8f8f8;
    border-radius: 16rpx;
    padding: 20rpx;
    font-size: 28rpx;
    line-height: 1.5;
}

.content-field {
    min-height: 600rpx;
    width: 100%;
    background-color: #f8f8f8;
    border-radius: 16rpx;
    padding: 20rpx;
    font-size: 28rpx;
    line-height: 1.6;
}

.btn-container {
    display: flex;
    justify-content: center;
    margin: 40rpx 0;
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
</style> 