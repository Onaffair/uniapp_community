<template>
<!--	<view>-->
<!--		<activity-reminder />-->
<!--		<view>-->
<!--			<head-top head-title="" :go-back="false"></head-top>-->
<!--		</view>-->
<!--		&lt;!&ndash; 主内容区域 &ndash;&gt;-->
<!--		<view class="content-area">-->
<!--			<home />-->
<!--		</view>-->
<!--	</view>-->
</template>

<script setup>
import HeadTop from "@/components/Head/Head.vue";
import Home from "@/pages/Home/Home.vue";
import { useUserStore } from "@/store/userStore";
import { onBeforeMount } from "vue";
import { getFollowList, getFriend, getFriendRequest, reFreshToken } from "@/api/userAPI";
import { getCityAndCategory, getJoinedActivity, getUserActivity } from "@/api/activityAPI";
import { useWebSocketStore } from "@/store/websocketStore";
import { getMyGroup } from "@/api/GroupApI";
import ActivityReminder from "@/components/ActivityReminder/ActivityReminder.vue";

const userStore = useUserStore();
let ws = null;

onBeforeMount(() => {
	if (userStore.getIsLogin()) {
		reFreshToken()
			.then((res) => {
				if (res?.code !== 200) return;

				getJoinedActivity();
				getUserActivity()
					.then(res => {
						userStore.setMyActivity(res?.data);
					});
				ws = useWebSocketStore();
				getFriend();
				getFollowList()
					.then(res => {
						userStore.setFollowData(res?.data);
					});
				getFriendRequest()
					.then(res => {
						userStore.setSystemInfo(res?.data);
					});
				getMyGroup();
			});
	}
	getCityAndCategory();
})
</script>

<!--<style>-->
<!--.content-area {-->
<!--	display: block;-->
<!--	height: calc(100vh - 100px);-->
<!--	overflow-y: auto;-->
<!--	padding-bottom: 50px; /* 为底部tabBar留出空间 */-->
<!--}-->
<!--</style>-->
