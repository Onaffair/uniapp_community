<script setup>
import {useUserStore, useWebSocketStore} from "@/store";
import {onBeforeMount} from "vue";
import { onLaunch } from '@dcloudio/uni-app'

import {
    getCityAndCategory,
    getFollowList,
    getFriend,
    getFriendRequest,
    getJoinedActivity,
    getUserActivity,
    getMyGroup,
    reFreshToken,
    getUserInfo, getMyAISessionHistory
} from "@/api";


const userStore = useUserStore();
let ws = null;
onLaunch(() =>{
    getCityAndCategory()
    if (userStore.getIsLogin()) {
        reFreshToken()
            .then((res) => {
                if (res?.code !== 200) return;
                getUserInfo()
                    .then(res => {
                        userStore.setUser(res?.data);
                    });
                getJoinedActivity();
                getUserActivity()
                    .then(res => {
                        userStore.setMyActivity(res?.data);
                    });
                getFriend();
                getFollowList()
                    .then(res => {
                        userStore.setFollowData(res?.data);
                    })
                getMyGroup()
                getFriendRequest()
                getMyAISessionHistory()

                ws = useWebSocketStore();

            })
    }
})


</script>

<style>
	/*每个页面公共css */
</style>
