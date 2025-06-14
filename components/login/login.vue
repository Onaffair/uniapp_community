<template>
    <view class="wrapper">
        <view class="container">
            <view class="title">hello，欢迎回来</view>
            <view class="account-form">
                <view class="account-form-group has-error">
                    <!-- 下面这行是为了避免自动填充，触发focus和blur事件 -->
                    <input type="text" name="txtuserName" style="display: none"/>
                    <input
                        type="text"
                        name="txtuserName"
                        class="account-form-control js-input-name"
                        v-model.trim="name"
                        autocomplete="off"
                        maxlength="20"
                        placeholder="用户名"
                    />
                </view>
                <view class="account-form-group has-error">
                    <!-- 下面这行是为了避免自动填充，触发focus和blur事件 -->
                    <input :type="inputType" name="txtPassword" style="display: none"/>
                    <input
                        :type="inputType"
                        name="txtPassword"
                        class="account-form-control js-input-password"
                        autocomplete="off"
                        v-model.trim="password"
                        maxlength="20"
                        placeholder="请输入密码"
                    />
                    <text
                        class="imwap-visibility js-showpw iconfont"
                        :class="passwordClass"
                        @click="togglePasswordVisibility"
                    ></text>
                </view>
                <view class="account-form-group button-row">
                    <view class="account-form-tip js-error"></view>
                    <view
                        class="account-form-btn js-btn-login"
                        @click="submit"
                    >
                        登录
                    </view>
                </view>
            </view>

            <!-- 第三方登录区域 -->
            <view class="third-party-login">
                <view class="divider">
                    <view class="line"></view>
                    <text class="text">其他登录方式</text>
                    <view class="line"></view>
                </view>

                <!-- 微信登录按钮 -->
                <view class="wx-login-btn" @click="handleWxLogin">
                    <view class="wx-icon-wrapper">
                        <image class="wx-icon" src="/static/images/wechat.png" mode="aspectFit"></image>
                    </view>
                    <text class="wx-text">微信登录</text>
                </view>
            </view>

            <view class="register-link">
                <text @click="goToRegister">没有账号 去注册</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import {ref} from 'vue';
import {encrypt} from '../../util/crypto';
import {postLoginInfo, wxLogin} from '@/api/userAPI';
import Login from "@/components/login/login.vue";

// 响应式数据
const name = ref('');
const password = ref('');
const inputType = ref('password');
const passwordClass = ref('icon-input-show');

// 切换密码可见性
const togglePasswordVisibility = () => {
    inputType.value = inputType.value === 'password' ? 'text' : 'password';
    passwordClass.value = passwordClass.value === 'icon-input-show' ? 'icon-input-password' : 'icon-input-show';
};

// 跳转到注册页面
const goToRegister = () => {
    uni.navigateTo({
        url: '/pages/Register/Register'
    });
};

// 微信登录处理
const handleWxLogin = () => {
    // #ifdef MP-WEIXIN
    // 直接获取用户信息，必须在用户点击事件中调用
    uni.getUserProfile({
        desc: '用于完善用户资料', // 声明获取用户个人信息后的用途
        success: (profileRes) => {
            const userInfo = profileRes.userInfo;
            
            uni.showLoading({
                title: '登录中...'
            });
            
            // 获取用户信息成功后，再获取微信登录凭证
            uni.login({
                provider: 'weixin',
                success: async (loginRes) => {
                    if (loginRes.code) {
                        try {
                            // 调用后端接口进行登录验证，同时传递用户信息
                            const res = await wxLogin({
                                code: loginRes.code,
                                userInfo
                            });

                            uni.hideLoading();

                            if (res?.code === 200) {
                                console.log('微信登录返回数据:', res.data);
                                
                                uni.showToast({
                                    title: '登录成功',
                                    icon: 'success',
                                    duration: 2000
                                });

                                // 登录成功后跳转到首页
                                setTimeout(() => {
                                    uni.switchTab({
                                        url: '/pages/Home/Home'
                                    });
                                }, 2000);
                            }
                        } catch (error) {
                            uni.hideLoading();
                            uni.showToast({
                                title: '微信登录失败',
                                icon: 'none'
                            });
                            console.error('微信登录失败:', error);
                        }
                    } else {
                        uni.hideLoading();
                        uni.showToast({
                            title: '微信登录授权失败',
                            icon: 'none'
                        });
                    }
                },
                fail: (err) => {
                    uni.hideLoading();
                    uni.showToast({
                        title: '微信登录失败',
                        icon: 'none'
                    });
                    console.error('微信登录失败:', err);
                }
            });
        },
        fail: (err) => {
            uni.showToast({
                title: '用户拒绝了授权',
                icon: 'none'
            });
            console.error('获取用户信息失败:', err);
        }
    });
    // #endif

    // #ifndef MP-WEIXIN
    uni.showToast({
        title: '请在微信小程序中使用微信登录',
        icon: 'none'
    });
    // #endif
};

// 提交登录
const submit = async () => {
    const userName = name.value;
    const userPassword = password.value;

    if (validateUserName(userName) !== 'ok') {
        uni.showToast({
            title: '用户名格式不正确',
            icon: 'none'
        });
        return;
    }
    if (validatePassword(userPassword) !== 'ok') {
        uni.showToast({
            title: '密码格式不正确',
            icon: 'none'
        });
        return;
    }

    uni.showLoading({
        title: '登录中...'
    });

    try {
        const res = await postLoginInfo({
            account: userName,
            password: encrypt(userPassword)
        });

        uni.hideLoading();

        if (res?.code === 200) {
            uni.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 2000
            });

        }
    } catch (error) {
        uni.hideLoading();
        uni.showToast({
            title: '登录失败',
            icon: 'none'
        });
    }
};

// 验证用户名
const validateUserName = (userName) => {
    if (!userName) return '用户名不能为空';
    return 'ok';
};

// 验证密码
const validatePassword = (password) => {
    if (!password) return '密码不能为空';
    if (password.length < 3) return '密码长度为6-20位，请重新输入';
    return 'ok';
};
</script>

<style lang="scss">
.wrapper {
    background-color: #fff;
    height: 100%;
    width: 100%;
}

.container {
    padding: 32rpx;
    font-size: 28rpx;

    .title {
        font-size: 52rpx;
        font-weight: bold;
    }

    .account-form {
        text-align: center;
        margin-top: 40rpx;

        .account-form-group {
            position: relative;
            overflow: hidden;
            padding-bottom: 16rpx;

            .account-form-control {
                margin-bottom: 8rpx;
                padding-left: 8rpx;
                display: block;
                width: 100%;
                color: #787d82;
                box-sizing: border-box;
                border-bottom: 1px solid #d9dde1;
                height: 80rpx;
                font-size: 28rpx;
            }

            .account-form-tip {
                display: none;
                color: #ff2d50;
                clear: both;
                font-size: 24rpx;
                line-height: 32rpx;
                text-align: left;
            }

            .imwap-visibility {
                position: absolute;
                color: #333;
                top: 24rpx;
                right: 8rpx;
                font-size: 32rpx;
            }

            .account-form-btn {
                display: block;
                margin-top: 32rpx;
                color: #fff;
                background: #f9a74b;
                font-size: 32rpx;
                line-height: 88rpx;
                border-radius: 8rpx;
            }
        }
    }

    // 第三方登录区域
    .third-party-login {
        margin-top: 60rpx;

        .divider {
            display: flex;
            align-items: center;
            margin-bottom: 40rpx;

            .line {
                flex: 1;
                height: 1px;
                background-color: #eee;
            }

            .text {
                padding: 0 20rpx;
                color: #999;
                font-size: 24rpx;
            }
        }

        .wx-login-btn {
            display: flex;
            flex-direction: column;
            align-items: center;

            .wx-icon-wrapper {
                width: 100rpx;
                height: 100rpx;
                border-radius: 50%;
                background-color: #07c160;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 16rpx;
            }

            .wx-icon {
                width: 60rpx;
                height: 60rpx;
            }

            .wx-text {
                font-size: 28rpx;
                color: #333;
            }
        }
    }

    .register-link {
        margin-top: 40rpx;
        text-align: center;
        color: #1989fa;
        font-size: 28rpx;
    }
}
</style> 