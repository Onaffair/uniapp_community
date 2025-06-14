<template>
    <view class="profile-container">
        <!-- 未登录状态 -->
        <view v-if="isLogin === false" class="not-logged-in">
            <login/>
        </view>

        <!-- 已登录状态 -->
        <view v-else class="logged-in">
            <!-- 个人信息 -->
            <view class="user-info">
                <image class="avatar" :src="imgBaseUrl+userDetail.avatar" mode="aspectFill"></image>
                <view class="info">
                    <text class="name">{{ userDetail.username }}</text>
                    <text class="email">email: {{ userDetail.email }}</text>
                    <text class="phone">phone: {{ userDetail.phone }}</text>
                </view>
            </view>

            <!-- 个人信息设置 -->
            <view class="settings">
                <view class="cell" @tap="toggleSettings">
                    <text class="cell-title">个人信息设置</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view>

                <view v-if="showSettings" class="settings-form">
                    <view class="form-item">
                        <text class="form-label">头像</text>
                        <view class="form-input">
                            <img-uploader v-model:img-src="userDetail.avatar" :max-count="1" :replace="true" :show-delete="false"></img-uploader>
                        </view>
                    </view>

                    <view class="form-item">
                        <text class="form-label">名称</text>
                        <input class="form-input" v-model="editInfo.username" placeholder="请输入名称"/>
                    </view>

                    <view class="form-item">
                        <text class="form-label">邮箱</text>
                        <input class="form-input" v-model="editInfo.email" placeholder="请输入邮箱"/>
                    </view>

                    <view class="form-item">
                        <text class="form-label">手机号</text>
                        <input class="form-input" v-model="editInfo.phone" placeholder="请输入手机号"/>
                    </view>

                    <button class="save-button" type="primary" @tap="saveInfo">保存</button>
                </view>
            </view>

           <view class="cell" @tap="navigateTo('/pages/Chat/AIChat')">
               <text class="cell-title">AI帮个忙</text>
           </view>
            <!-- 我的关注、我的粉丝、系统消息 -->
            <view class="cell" @tap="navigateTo('/pages/PersonalCenter/MyFollow')">
                <text class="cell-title">我的关注</text>
                <text class="iconfont icon-arrow-right"></text>
            </view>

            <view class="cell" @tap="navigateTo('/pages/PersonalCenter/MyFan')">
                <text class="cell-title">我的粉丝</text>
                <text class="iconfont icon-arrow-right"></text>
            </view>

            <view class="cell" @tap="navigateTo('/pages/PersonalCenter/SystemInfo')">
                <text class="cell-title">系统消息</text>
                <text class="iconfont icon-arrow-right"></text>
            </view>
            <view class="cell" @tap="navigateTo('/pages/admin/Index')" v-if="userStore.getUser().role === 1">
                <text class="cell-title"> 我是管理员 </text>
                <text class="iconfont icon-arrow-right"></text>
            </view>
            <!-- 退出登录 -->
            <button class="logout-button" @tap="logout">退出登录</button>
        </view>
    </view>
</template>

<script setup>
import {ref, computed} from 'vue';
import {onShow} from '@dcloudio/uni-app'
import {useUserStore} from "@/store/userStore";
import {storeToRefs} from "pinia";
import {imgBaseUrl} from "@/util/basic-data";
import ImgUploader from "@/components/ImgUploader/ImgUploader.vue";
import Login from "@/components/Login/Login.vue";
import {userEditInfo, userQuit, bindWechat, unbindWechat} from "@/api/userAPI";
import {getFriendRequest} from "@/api";

const userStore = useUserStore();
// 登录状态
const {userDetail, isLogin} = storeToRefs(userStore);

// 页面显示时获取数据
onShow(() => {
    if (userStore.getIsLogin()) {
        // 获取好友请求
        getFriendRequest()
    }
})

// 编辑信息
const editInfo = computed(() => {
    return {
        avatar: userDetail.value.avatar,
        username: userDetail.value.username,
        email: userDetail.value.email,
        phone: userDetail.value.phone,
    };
});

// 是否显示设置表单
const showSettings = ref(false);

// 切换设置表单显示状态
const toggleSettings = () => {
    showSettings.value = !showSettings.value;
};

// 保存信息
const saveInfo = async () => {
    try {
        await userEditInfo(editInfo.value);
        uni.showToast({
            title: '保存成功',
            icon: 'success'
        });
    } catch (error) {
        uni.showToast({
            title: '保存失败',
            icon: 'none'
        });
    }
};

// 页面导航
const navigateTo = (url) => {
    uni.navigateTo({
        url
    });
};

// 退出登录
const logout = async () => {
    uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await userQuit();
                    // 可能需要重定向到登录页面或首页
                    uni.switchTab({
                        url: '/pages/Index/Index'
                    });
                } catch (error) {
                    uni.showToast({
                        title: '退出失败',
                        icon: 'none'
                    });
                }
            }
        }
    });
};

// 处理微信绑定/解绑
const toggleWechatBinding = () => {
    if (userDetail.value.isWechatBound) {
        // 解绑微信
        uni.showModal({
            title: '解绑微信',
            content: '确定要解绑微信账号吗？',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        const result = await unbindWechat();
                        if (result?.code === 200) {
                            // 更新用户信息
                            userDetail.value.isWechatBound = false;
                            uni.showToast({
                                title: '解绑成功',
                                icon: 'success'
                            });
                        }
                    } catch (error) {
                        uni.showToast({
                            title: '解绑失败',
                            icon: 'none'
                        });
                    }
                }
            }
        });
    } else {
        // 绑定微信
        // #ifdef MP-WEIXIN
        uni.showLoading({
            title: '正在请求...'
        });
        
        uni.login({
            provider: 'weixin',
            success: async (loginRes) => {
                if (loginRes.code) {
                    try {
                        const result = await bindWechat(loginRes.code);
                        uni.hideLoading();
                        
                        if (result?.code === 200) {
                            // 更新用户信息
                            userDetail.value.isWechatBound = true;
                            uni.showToast({
                                title: '绑定成功',
                                icon: 'success'
                            });
                        }
                    } catch (error) {
                        uni.hideLoading();
                        uni.showToast({
                            title: '绑定失败',
                            icon: 'none'
                        });
                    }
                } else {
                    uni.hideLoading();
                    uni.showToast({
                        title: '获取授权失败',
                        icon: 'none'
                    });
                }
            },
            fail: () => {
                uni.hideLoading();
                uni.showToast({
                    title: '微信登录授权失败',
                    icon: 'none'
                });
            }
        });
        // #endif
        
        // #ifndef MP-WEIXIN
        uni.showToast({
            title: '请在微信小程序中操作',
            icon: 'none'
        });
        // #endif
    }
};
</script>

<style>
.profile-container {
    padding: 40rpx;
}

.not-logged-in {
    display: flex;
    justify-content: center;
    margin-top: 200rpx;
}

.logged-in {
    display: flex;
    flex-direction: column;
    gap: 40rpx;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 40rpx;
}

.avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
}

.info {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
}

.name {
    font-size: 36rpx;
    font-weight: bold;
}

.email,
.phone {
    font-size: 28rpx;
    color: #666;
}

.cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1px solid #eee;
}

.cell-title {
    font-size: 32rpx;
}

.settings-form {
    padding: 20rpx;
    background-color: #f7f8fa;
    border-radius: 16rpx;
    margin-top: 20rpx;
}

.form-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1px solid #eee;
}

.form-label {
    width: 140rpx;
    font-size: 28rpx;
    color: #333;
}

.form-input {
    flex: 1;
}

.save-button {
    margin-top: 30rpx;
    background-color: #2979ff;
    color: #fff;
}

.logout-button {
    margin-top: 60rpx;
    background-color: #ff9800;
    color: #fff;
}

/* 绑定状态相关样式 */
.wechat-binding {
    margin-top: 20rpx;
}

.binding-status {
    display: flex;
    align-items: center;
}

.binding-text {
    font-size: 28rpx;
    color: #999;
    margin-right: 10rpx;
}

.binding-text.bound {
    color: #07c160;
}
</style>