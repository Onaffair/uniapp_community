<template>
    <view class="register-container">
        <!-- 自定义导航栏 -->
        <view class="custom-navbar">
            <view class="navbar-left" @tap="goBack">
                <text class="iconfont icon-arrow-left"></text>
            </view>
            <view class="navbar-title">注册</view>
        </view>

        <form @submit="onSubmit" class="register-form">
            <!-- 头像 -->
            <view class="form-item">
                <view class="form-label">头像</view>
                <view class="form-input">
                    <img-uploader
                        v-model="formData.avatar"
                        :max-count="1"
                        :is-preview="true"
                        :img-style="{width: '140rpx', height: '140rpx', borderRadius: '50%'}"
                    >
                    </img-uploader>
                </view>
            </view>

            <!-- 账号 -->
            <view class="form-item">
                <view class="form-label">账号</view>
                <view class="form-input">
                    <input 
                        v-model="formData.account"
                        name="account"
                        placeholder="请输入账号"
                        class="uni-input"
                    />
                </view>
            </view>
            <view class="error-message" v-if="errors.account">{{ errors.account }}</view>

            <!-- 用户名 -->
            <view class="form-item">
                <view class="form-label">用户名</view>
                <view class="form-input">
                    <input 
                        v-model="formData.username"
                        name="username"
                        placeholder="请输入用户名"
                        class="uni-input"
                    />
                </view>
            </view>
            <view class="error-message" v-if="errors.username">{{ errors.username }}</view>

            <!-- 密码 -->
            <view class="form-item">
                <view class="form-label">密码</view>
                <view class="form-input">
                    <input
                        v-model="formData.password"
                        type="password"
                        name="password"
                        placeholder="请输入密码"
                        class="uni-input"
                    />
                </view>
            </view>
            <view class="error-message" v-if="errors.password">{{ errors.password }}</view>

            <!-- 确认密码 -->
            <view class="form-item">
                <view class="form-label">确认密码</view>
                <view class="form-input">
                    <input
                        v-model="formData.confirmPassword"
                        type="password"
                        name="confirmPassword"
                        placeholder="请再次输入密码"
                        class="uni-input"
                    />
                </view>
            </view>
            <view class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</view>

            <!-- 邮箱 -->
            <view class="form-item">
                <view class="form-label">邮箱</view>
                <view class="form-input">
                    <input
                        v-model="formData.email"
                        name="email"
                        placeholder="请输入邮箱"
                        class="uni-input"
                    />
                </view>
            </view>

            <!-- 手机号 -->
            <view class="form-item">
                <view class="form-label">手机号</view>
                <view class="form-input">
                    <input
                        v-model="formData.phone"
                        name="phone"
                        placeholder="请输入手机号"
                        class="uni-input"
                    />
                </view>
            </view>

            <!-- 注册按钮 -->
            <view class="form-button">
                <button class="register-button" @tap="onSubmit">注册</button>
            </view>
        </form>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import ImgUploader from '@/components/ImgUploader/ImgUploader.vue';
import { encrypt } from "@/util/crypto";
import { postRegisterInfo } from "@/api/userAPI";

// 表单数据
const formData = ref({
    account: '',
    username: '',
    password: '',
    confirmPassword: '', // 新增确认密码字段
    email: '',
    phone: '',
    avatar: ''
});

// 错误信息
const errors = reactive({
    account: '',
    username: '',
    password: '',
    confirmPassword: ''
});

// 验证表单
const validateForm = () => {
    let isValid = true;
    
    // 重置错误信息
    errors.account = '';
    errors.username = '';
    errors.password = '';
    errors.confirmPassword = '';
    
    // 验证账号
    if (!formData.value.account.trim()) {
        errors.account = '账号不能为空';
        isValid = false;
    }
    
    // 验证用户名
    if (!formData.value.username.trim()) {
        errors.username = '用户名不能为空';
        isValid = false;
    }
    
    // 验证密码
    if (!formData.value.password) {
        errors.password = '密码不能为空';
        isValid = false;
    } else if (formData.value.password.length < 3) {
        errors.password = '密码长度不能少于3位';
        isValid = false;
    }
    
    // 验证确认密码
    if (formData.value.password !== formData.value.confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
    }
    
    return isValid;
};

const generateRegisterInfo = () => {
    return {
        account: formData.value.account,
        username: formData.value.username,
        password: encrypt(formData.value.password),
        email: formData.value.email,
        phone: formData.value.phone,
        avatar: formData.value.avatar
    }
};

// 提交注册
const onSubmit = async () => {
    if (!validateForm()) return;
    
    uni.showLoading({
        title: '注册中...'
    });
    
    try {
        const registerInfo = generateRegisterInfo();
        const res = await postRegisterInfo(registerInfo);
        
        uni.hideLoading();
        
        if (res?.code === 200) {
            uni.showToast({
                title: '注册成功',
                icon: 'success',
                duration: 2000
            });
            
            // 注册成功后跳转到首页
            setTimeout(() => {
                uni.switchTab({
                    url: '/pages/Home/Home'
                });
            }, 2000);
        } else {
            uni.showToast({
                title: res?.msg || '注册失败',
                icon: 'none'
            });
        }
    } catch (error) {
        uni.hideLoading();
        uni.showToast({
            title: '注册失败，请稍后再试',
            icon: 'none'
        });
    }
};

// 返回上一页
const goBack = () => {
    uni.navigateBack();
};
</script>

<style scoped>
.register-container {
    padding: 30rpx;
    min-height: 100vh;
    background-color: #f8f8f8;
}

/* 自定义导航栏 */
.custom-navbar {
    display: flex;
    align-items: center;
    height: 88rpx;
    padding: 0 30rpx;
    margin-bottom: 30rpx;
    position: relative;
}

.navbar-left {
    position: absolute;
    left: 30rpx;
    font-size: 36rpx;
    color: #333;
}

.navbar-title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.register-form {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
}

.form-item {
    display: flex;
    margin-bottom: 30rpx;
    align-items: center;
    border-bottom: 1rpx solid #eee;
    padding-bottom: 20rpx;
}

.form-label {
    width: 160rpx;
    font-size: 28rpx;
    color: #333;
}

.form-input {
    flex: 1;
}

.uni-input {
    height: 80rpx;
    font-size: 28rpx;
    color: #333;
}

.error-message {
    color: #ff4d4f;
    font-size: 24rpx;
    margin-top: -20rpx;
    margin-bottom: 20rpx;
    padding-left: 160rpx;
}

.form-button {
    margin-top: 50rpx;
}

.register-button {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background-color: #1989fa;
    color: #fff;
    font-size: 32rpx;
    border-radius: 45rpx;
}

.register-button:active {
    opacity: 0.8;
}
</style> 