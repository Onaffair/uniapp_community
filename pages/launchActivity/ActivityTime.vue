<template>
    <view>
        <view>
            <Head head-title="活动时间" :go-back="true"></Head>
        </view>
        <view class="form-container">
            <uni-forms>
                <uni-forms-item>
                    <view class="form-item" @click="showBeginTimePicker">
                        <text class="form-label">开始时间</text>
                        <view class="form-value">
                            <text class="value-text">{{ localForm.beginTime || "请选择" }}</text>
                            <uni-icons type="right" size="16"></uni-icons>
                        </view>
                    </view>
                </uni-forms-item>
                <uni-forms-item>
                    <view class="form-item" @click="showEndTimePicker">
                        <text class="form-label">结束时间</text>
                        <view class="form-value">
                            <text class="value-text">{{ localForm.endTime || "请选择" }}</text>
                            <uni-icons type="right" size="16"></uni-icons>
                        </view>
                    </view>
                </uni-forms-item>
            </uni-forms>
        </view>
        
        <view class="btn-container">
            <button class="btn-confirm" @click="handleSubmit">确认</button>
        </view>
        
        <view class="instruction-container">
            <text class="instruction-title">说明：</text>
            <text class="instruction-text">1. 开始时间需要大于发布时间两天</text>
        </view>

        <!-- 开始时间选择器 -->
        <uni-datetime-picker
            ref="beginDatetimePicker"
            type="datetime"
            v-model="beginTimeValue"
            :start="minDate"
            :end="maxDate"
            @change="onBeginTimeChange"
        />

        <!-- 结束时间选择器 -->
        <uni-datetime-picker
            ref="endDatetimePicker"
            type="datetime"
            v-model="endTimeValue"
            :start="minEndDate"
            :end="maxDate"
            @change="onEndTimeChange"
        />
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useActivityStore } from '@/store/activityStore';
import dayjs from 'dayjs';

const activityStore = useActivityStore();
const beginDatetimePicker = ref(null);
const endDatetimePicker = ref(null);

// 创建临时表单副本
const localForm = ref({
    beginTime: '',
    endTime: ''
});

// 时间选择器值
const beginTimeValue = ref('');
const endTimeValue = ref('');

// 日期限制
const minDate = computed(() => {
    // 当前时间加两天
    return dayjs().add(2, 'day').format('YYYY-MM-DD HH:mm:ss');
});

const minEndDate = computed(() => {
    // 如果已选择开始时间，结束时间不能早于开始时间
    if (beginTimeValue.value) {
        return dayjs(beginTimeValue.value).format('YYYY-MM-DD HH:mm:ss');
    }
    return minDate.value;
});

const maxDate = computed(() => {
    // 允许选择的最大日期为当前日期加10个月
    return dayjs().add(10, 'month').format('YYYY-MM-DD HH:mm:ss');
});

// 初始化时从store加载数据
onMounted(() => {
    if (activityStore.formData.beginTime) {
        localForm.value.beginTime = activityStore.formData.beginTime;
        beginTimeValue.value = dayjs(activityStore.formData.beginTime).format('YYYY-MM-DD HH:mm:ss');
    }
    
    if (activityStore.formData.endTime) {
        localForm.value.endTime = activityStore.formData.endTime;
        endTimeValue.value = dayjs(activityStore.formData.endTime).format('YYYY-MM-DD HH:mm:ss');
    }
});

// 显示日期选择器
const showBeginTimePicker = () => {
    beginDatetimePicker.value.open();
};

const showEndTimePicker = () => {
    endDatetimePicker.value.open();
};

// 时间选择回调
const onBeginTimeChange = (e) => {
    if (e) {
        const formattedTime = dayjs(e).format('YYYY-MM-DD HH:mm');
        localForm.value.beginTime = formattedTime;
        beginTimeValue.value = e;
    }
};

const onEndTimeChange = (e) => {
    if (e) {
        const formattedTime = dayjs(e).format('YYYY-MM-DD HH:mm');
        localForm.value.endTime = formattedTime;
        endTimeValue.value = e;
    }
};

// 验证逻辑
const validateTime = () => {
    if (!localForm.value.beginTime || !localForm.value.endTime) {
        uni.showToast({
            title: "请选择完整的时间",
            icon: "none"
        });
        return false;
    }

    const start = dayjs(localForm.value.beginTime);
    const end = dayjs(localForm.value.endTime);

    // 时间顺序验证
    if (start.isAfter(end) || start.isSame(end)) {
        uni.showToast({
            title: "结束时间必须晚于开始时间",
            icon: "none"
        });
        return false;
    }

    // 开始时间限制验证
    const minValidDate = dayjs().add(2, 'day');
    if (start.isBefore(minValidDate)) {
        uni.showToast({
            title: "开始时间需晚于当前时间两天",
            icon: "none"
        });
        return false;
    }

    return true;
};

// 提交处理
const handleSubmit = () => {
    if (!validateTime()) return;

    // 验证通过后更新store
    activityStore.updateFormData({
        beginTime: localForm.value.beginTime,
        endTime: localForm.value.endTime
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

.form-value {
    display: flex;
    align-items: center;
}

.value-text {
    margin-right: 10rpx;
    font-size: 28rpx;
    color: #666;
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
}
</style> 