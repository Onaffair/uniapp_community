<template>
    <view>
        <head-top :go-back="true" head-title="我的关注"/>
        <view v-if="following.length !== 0">
            <user-card
                v-for="user in following"
                :key="user.account"
                :user="user"
                btn-text="取关"
                @btn-click="unfollowUser"
            />
        </view>
        <view v-else class="empty-container">
            <image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
            <text class="empty-text">暂无关注</text>
        </view>
    </view>
</template>

<script setup>
import {computed} from 'vue';
import UserCard from "@/components/UserCard/UserCard.vue";
import HeadTop from "@/components/Head/Head.vue";
import {useUserStore} from "@/store/userStore";
import {getFollowList, unfollow} from "@/api/userAPI";

const userStore = useUserStore();
const following = computed(() => userStore.getFollowData()?.following || []);

const unfollowUser = async (userId) => {
    try {
        uni.showLoading({
            title: '处理中...'
        });

        await unfollow(userId);
        const res = await getFollowList();

        if (res && res.data) {
            userStore.setFollowData(res.data);
            uni.showToast({
                title: '取消关注成功',
                icon: 'success'
            });
        }
    } catch (error) {
        uni.showToast({
            title: '操作失败',
            icon: 'none'
        });
    } finally {
        uni.hideLoading();
    }
};
</script>

<style>
.empty-container {
    padding: 100rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}
</style> 