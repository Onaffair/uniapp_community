<template>
    <view>
        <view>
            <Head title="活动地址" :go-back="true"></Head>
        </view>
        <view class="form-container">
            <uni-forms>
                <uni-forms-item>
                    <view class="form-item" @click="showCityPicker">
                        <text class="form-label">城市</text>
                        <view class="form-value">
                            <text class="value-text">{{ localForm.city?.name || "待选择" }}</text>
                            <uni-icons type="right" size="16"></uni-icons>
                        </view>
                    </view>
                </uni-forms-item>
                <uni-forms-item>
                    <view class="form-item">
                        <text class="form-label">详细地址</text>
                        <input
                            class="form-input"
                            type="text"
                            v-model="localForm.address"
                            placeholder="请输入详细地址"
                        />
                    </view>
                </uni-forms-item>
                
                <!-- 添加地图选择按钮 -->
<!--                <view class="map-select-btn" @click="chooseLocationFromMap" >
                    <uni-icons type="map" size="20"></uni-icons>
                    <text class="btn-text">{{ localForm.displayAddress ? '重新选择位置' : '从地图选择位置' }}</text>
                </view> -->
                
                <!-- 显示已选择的位置状态，但不直接显示经纬度 -->
                <view v-if="locationInfo.latitude" class="location-status">
                    <uni-icons type="checkmarkempty" size="22" color="#007aff"></uni-icons>
                    <text class="status-text">已成功选择位置</text>
                </view>
            </uni-forms>
        </view>
        
        <view class="btn-container">
            <button class="btn-confirm" @click="handleSubmit">确认</button>
        </view>

        <!-- 城市选择弹窗 -->
        <uni-popup ref="popup" type="bottom">
            <view class="picker-container">
                <view class="picker-header">
                    <text class="cancel-btn" @click="closePicker">取消</text>
                    <text class="title">选择城市</text>
                    <text class="confirm-btn" @click="confirmCitySelect">确定</text>
                </view>
                <picker-view class="picker-body" :value="selectedIndex" @change="handlePickerChange">
                    <picker-view-column>
                        <view class="picker-item" v-for="(item, index) in cityOptions" :key="index">
                            {{ item.text }}
                        </view>
                    </picker-view-column>
                </picker-view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useActivityStore } from '@/store/activityStore';

const activityStore = useActivityStore();
const popup = ref(null);

// 城市数据
const cityList = activityStore.cityList;

// 创建临时表单副本
const localForm = ref({
    city: null,
    displayAddress: '', // 用于显示的地址，不包含经纬度
    address: '' // 实际提交的地址，包含经纬度
});

// 位置信息
const locationInfo = ref({
    latitude: null,
    longitude: null,
    name: ''
});

// 初始化已选择的城市和位置信息
onMounted(() => {
    if (activityStore.formData?.city) {
        const city = cityList.find(c => c.id === activityStore.formData.city);
        if (city) {
            localForm.value.city = {
                id: city.id,
                name: city.name
            };
        }
    }
    
    // 初始化位置信息
    if (activityStore.formData?.address) {
        // 检查address是否包含经纬度信息
        const addressParts = activityStore.formData.address.split('|');
        if (addressParts.length >= 3) {
            // 格式: 地址|纬度|经度
            localForm.value.displayAddress = addressParts[0];
            localForm.value.address = activityStore.formData.address;
            locationInfo.value.latitude = parseFloat(addressParts[1]);
            locationInfo.value.longitude = parseFloat(addressParts[2]);
        } else {
            // 不包含经纬度信息的情况
            localForm.value.displayAddress = activityStore.formData.address;
            localForm.value.address = activityStore.formData.address;
        }
    }
});

// 城市选择器数据
const cityOptions = computed(() => cityList.map(c => ({ text: c.name, value: c.id })));
const selectedIndex = ref([0]);
const tempSelectedCity = ref(null);

// 显示城市选择器
const showCityPicker = () => {
    // 如果已有选择，定位到当前选择的索引
    if (localForm.value.city) {
        const index = cityOptions.value.findIndex(c => c.value === localForm.value.city.id);
        if (index !== -1) {
            selectedIndex.value = [index];
        }
    }
    popup.value.open('bottom');
};

// 关闭选择器
const closePicker = () => {
    popup.value.close();
};

// 处理选择器变化
const handlePickerChange = (e) => {
    const values = e.detail.value;
    selectedIndex.value = values;
    const selected = cityOptions.value[values[0]];
    tempSelectedCity.value = {
        id: selected.value,
        name: selected.text
    };
};

// 确认城市选择
const confirmCitySelect = () => {
    if (tempSelectedCity.value) {
        localForm.value.city = tempSelectedCity.value;
    } else {
        // 如果没有手动滑动选择，默认使用当前显示的
        const selected = cityOptions.value[selectedIndex.value[0]];
        localForm.value.city = {
            id: selected.value,
            name: selected.text
        };
    }
    closePicker();
};

// 从地图选择位置
const chooseLocationFromMap = () => {
	uni.location
    uni.chooseLocation({
        success: (res) => {
            console.log('选择位置成功:', res);
            // 更新位置信息
            locationInfo.value = {
                latitude: res.latitude,
                longitude: res.longitude,
                name: res.name
            };
            
            // 更新地址表单
            const displayAddress = res.address || res.name;
            localForm.value.displayAddress = displayAddress;
            
            // 将经纬度信息添加到address字段末尾，用"|"分隔
            localForm.value.address = `${displayAddress}|${res.latitude}|${res.longitude}`;
        },
        fail: (err) => {
            console.error('选择位置失败:', err);
            uni.showToast({
                title: '选择位置失败',
                icon: 'none'
            });
        }
    });
};

// 表单验证
const validateForm = () => {
    if (!localForm.value?.city?.id) {
        uni.showToast({
            title: "请选择城市",
            icon: "none"
        });
        return false;
    }

    // if (!localForm.value.displayAddress?.trim()) {
    //     uni.showToast({
    //         title: "请从地图选择位置",
    //         icon: "none"
    //     });
    //     return false;
    // }
	if (!localForm.value.address?.trim()){
		uni.showToast({
		    title: "请输入详细地址",
		    icon: "none"
		});
		return false;
	}
	
	
    
    // if (!locationInfo.value.latitude || !locationInfo.value.longitude) {
    //     uni.showToast({
    //         title: "请从地图选择有效位置",
    //         icon: "none"
    //     });
    //     return false;
    // }

    return true;
};

// 提交处理
const handleSubmit = () => {
    if (!validateForm()) return;
    
    // 验证通过后更新store，只提交city和address字段
    activityStore.updateFormData({
        city: localForm.value.city.id,
        address: localForm.value.address.trim()
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

.form-input {
    width: 400rpx;
    height: 60rpx;
    text-align: right;
    font-size: 28rpx;
}

.map-select-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 30rpx 0;
    padding: 20rpx;
    background-color: #f2f2f2;
    border-radius: 8rpx;
}

.btn-text {
    margin-left: 10rpx;
    font-size: 28rpx;
    color: #007aff;
}

.location-status {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20rpx;
    padding: 16rpx;
    background-color: #f0f9ff;
    border-radius: 8rpx;
}

.status-text {
    margin-left: 10rpx;
    font-size: 28rpx;
    color: #007aff;
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