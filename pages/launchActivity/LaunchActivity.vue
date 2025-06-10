<template>
    <view>
        <view>
            <Head head-title="发布活动" :go-back="true"></Head>
        </view>
        <view>
            <LabelTitle :msg="'活动信息'"></LabelTitle>
            <uni-group>
                <view class="form-item" @click="showCategoryPicker">
                    <view class="form-label">
                        <uni-icons type="star" size="18" color="#333"></uni-icons>
                        <text class="custom-title">活动类别</text>
                    </view>
                    <view class="form-content">
                        <text :class="['custom-value', !isEmpty(activity.categoryId) ? 'highlight-text' : '']">
                            {{ isEmpty(activity.categoryId) ? "未设置" : getCategoryName(activity.categoryId) }}
                        </text>
                        <uni-icons type="right" size="16"></uni-icons>
                    </view>
                </view>
                
                <view class="form-item">
                    <view class="form-label">
                        <uni-icons type="info" size="18" color="#333"></uni-icons>
                        <text class="custom-title">活动标题</text>
                    </view>
                    <view class="form-content">
                        <input class="custom-input" type="text" maxlength="32" placeholder="请输入"
                               v-model="activity.title" />
                    </view>
                </view>
                
                <view class="form-item" @click="goToPage('/pages/launchActivity/ActivityContent')">
                    <view class="form-label">
                        <uni-icons type="compose" size="18" color="#333"></uni-icons>
                        <text class="custom-title">活动详细</text>
                    </view>
                    <view class="form-content">
                        <text class="custom-value">
                            {{ isEmpty(activity.content) || isEmpty(activity.highlight) ? "未完善" : "已设置" }}
                        </text>
                        <uni-icons type="right" size="16"></uni-icons>
                    </view>
                </view>
                
                <view class="form-item">
                    <view class="form-label">
                        <uni-icons type="image" size="18" color="#333"></uni-icons>
                        <text class="custom-title">添加照片(可选,最多4张)</text>
                    </view>
                    <view class="image-upload">
                        <ImgUploader 
                            v-model:img-src="imageList"
                            :max-count="4"
                        />
                    </view>
                </view>
            </uni-group>
            <LabelTitle :msg="'活动设置'"></LabelTitle>
            <uni-group>
                <view class="form-item" @click="goToPage('/pages/launchActivity/ActivityPeopleNum')">
                    <view class="form-label">
                        <uni-icons type="staff" size="18" color="#333"></uni-icons>
                        <text class="custom-title">活动人数</text>
                    </view>
                    <view class="form-content">
                        <text class="custom-value">
                            {{ isEmpty(activity.leastJoinNum) || isEmpty(activity.mostJoinNum) ? "未设置" : "已设置" }}
                        </text>
                        <uni-icons type="right" size="16"></uni-icons>
                    </view>
                </view>
                
                <view class="form-item" @click="goToPage('/pages/launchActivity/ActivityTime')">
                    <view class="form-label">
                        <uni-icons type="calendar" size="18" color="#333"></uni-icons>
                        <text class="custom-title">活动时间</text>
                    </view>
                    <view class="form-content">
                        <text class="custom-value">
                            {{ isEmpty(activity.beginTime) || isEmpty(activity.endTime) ? "未设置" : "已设置" }}
                        </text>
                        <uni-icons type="right" size="16"></uni-icons>
                    </view>
                </view>
                
                <view class="form-item" @click="goToPage('/pages/launchActivity/ActivityPosition')">
                    <view class="form-label">
                        <uni-icons type="location" size="18" color="#333"></uni-icons>
                        <text class="custom-title">活动地址</text>
                    </view>
                    <view class="form-content">
                        <text class="custom-value">
                            {{ (isEmpty(activity.address) ? '未设置' : '已设置') }}
                        </text>
                        <uni-icons type="right" size="16"></uni-icons>
                    </view>
                </view>
                
                <view class="form-item">
                    <view class="form-label">
                        <uni-icons type="help" size="18" color="#333"></uni-icons>
                        <text class="custom-title">其他说明</text>
                    </view>
                    <view class="form-content">
                        <text class="custom-value optional">选填</text>
                    </view>
                </view>
            </uni-group>
            
            <view class="rule">
                <text>查看活动审核规则</text>
            </view>
            
            <view class="btn-submit">
                <button 
                    @click="submitData" 
                    :disabled="!activityStore.isValid"
                    :style="{backgroundColor: activityStore.isValid ? '#ffb04f' : '#b5b5b5'}"
                >
                    确认发布
                </button>
            </view>
        </view>

        <!-- 分类选择弹窗 -->
        <uni-popup ref="categoryPopup" type="bottom">
            <view class="picker-container">
                <view class="picker-header">
                    <text class="cancel-btn" @click="closeCategoryPicker">取消</text>
                    <text class="title">选择活动类别</text>
                    <text class="confirm-btn" @click="confirmCategoryPicker">确定</text>
                </view>
                <picker-view class="picker-body" :value="categorySelectedIndex" @change="handleCategoryChange">
                    <picker-view-column>
                        <view class="picker-item" v-for="(item, index) in categoryColumns" :key="index">
                            {{ item.text }}
                        </view>
                    </picker-view-column>
                </picker-view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import { useActivityStore } from '@/store/activityStore';
import { storeToRefs } from 'pinia';
import { imgBaseUrl } from '@/util/basic-data';
import { launchActivity } from '@/api/activityAPI';
import { createGroup } from '@/api/GroupApI';
import ImgUploader from '@/components/ImgUploader/ImgUploader.vue';

const activityStore = useActivityStore();
const { formData: activity } = storeToRefs(activityStore);
const categoryPopup = ref(null);
const imageList = ref([]);
const categoryColumns = ref([]);
const categorySelectedIndex = ref([0]);
const tempCategorySelected = ref(null);

// 临时分类数据
const categoryList = activityStore.categoryList;

onMounted(() => {
    // 准备分类数据
    categoryColumns.value = categoryList.map(item => ({
        text: item.name,
        value: item.id
    }));
    
    // 初始化已有图片
    if (activity.value.images && activity.value.images.length > 0) {
        activity.value.images.forEach(item => {
            imageList.value.push({
                name: item,
                url: imgBaseUrl + item
            });
        });
    }
    
    // 如果已有选择的分类，设置正确的索引
    if (activity.value.categoryId) {
        const index = categoryColumns.value.findIndex(item => item.value === activity.value.categoryId);
        if (index !== -1) {
            categorySelectedIndex.value = [index];
        }
    }
});

// 监听imageList变化，更新活动图片
watch(imageList, (newImages) => {
    if (Array.isArray(newImages)) {
        // 将图片对象数组中的name字段提取出来，保存到activity.images中
        activity.value.images = newImages.map(item => item);
    } else if (typeof newImages === 'string') {
        // 如果是字符串，将其作为单个图片名称保存
        activity.value.images = newImages ? [newImages] : [];
    } else {
        // 处理空值或其他情况
        activity.value.images = [];
    }
}, { deep: true });

// 空值判断方法
const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'number' && value === 0) return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
};

// 分类名称获取
const getCategoryName = (id) => {
    return categoryList.find(item => item.id === id)?.name || '';
};

// 显示分类选择器
const showCategoryPicker = () => {
    categoryPopup.value.open('bottom');
};

// 关闭分类选择器
const closeCategoryPicker = () => {
    categoryPopup.value.close();
};

// 处理分类选择器变化
const handleCategoryChange = (e) => {
    const values = e.detail.value;
    categorySelectedIndex.value = values;
    const selected = categoryColumns.value[values[0]];
    tempCategorySelected.value = selected.value; // 只存储数字ID值
};

// 确认分类选择
const confirmCategoryPicker = () => {
    if (tempCategorySelected.value) {
        activity.value.categoryId = tempCategorySelected.value; // 只存储数字ID值
    } else if (categoryColumns.value[categorySelectedIndex.value[0]]) {
        // 如果没有手动滑动选择，使用当前显示的选项
        activity.value.categoryId = categoryColumns.value[categorySelectedIndex.value[0]].value; // 只存储数字ID值
    }
    closeCategoryPicker();
};

// 页面跳转
const goToPage = (url) => {
    uni.navigateTo({ url });
};

// 提交数据
const submitData = async () => {
    try {
        const res = await launchActivity(activityStore.formData);
        if (res?.data) {
            await createGroup(res.data);
            uni.showToast({
                title: '发布成功',
                icon: 'success'
            });
            // activityStore.clearFormData();
            uni.navigateBack();
        }
    } catch (error) {
        uni.showToast({
            title: '发布失败',
            icon: 'none'
        });
    }
};
</script>

<style scoped>
.form-item {
    display: flex;
    padding: 24rpx;
    border-bottom: 1px solid #eee;
    align-items: center;
}

.form-label {
    display: flex;
    align-items: center;
    width: 35%;
}

.form-content {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.custom-title {
    font-size: 30rpx;
    font-weight: bold;
    margin-left: 12rpx;
}

.custom-value {
    font-size: 28rpx;
    color: #666;
    margin-right: 12rpx;
}

.highlight-text {
    color: #ffb04f;
}

.optional {
    color: #999;
}

.custom-input {
    text-align: right;
    font-size: 28rpx;
    height: 60rpx;
    width: 100%;
}

.image-upload {
    width: 100%;
    padding: 20rpx 0;
}

.rule {
    color: #9acd32;
    display: flex;
    margin-top: 80rpx;
    justify-content: center;
    font-size: 30rpx;
}

.btn-submit {
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
    margin-bottom: 60rpx;
}

.btn-submit button {
    width: 400rpx;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    background-color: #ffb04f;
    color: white;
    font-size: 32rpx;
}

.btn-submit button[disabled] {
    background-color: #b5b5b5;
}

/* 选择器样式 */
.picker-container {
    background-color: #fff;
    width: 100%;
}

.picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 90rpx;
    padding: 0 30rpx;
    border-bottom: 1px solid #eee;
}

.cancel-btn, .confirm-btn {
    font-size: 28rpx;
    padding: 10rpx;
}

.cancel-btn {
    color: #999;
}

.confirm-btn {
    color: #ffb04f;
}

.title {
    font-size: 30rpx;
    font-weight: bold;
}

.picker-body {
    width: 100%;
    height: 500rpx;
}

.picker-item {
    line-height: 70rpx;
    text-align: center;
    font-size: 28rpx;
}
</style> 