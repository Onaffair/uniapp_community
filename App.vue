<script setup>
import {useUserStore, useWebSocketStore} from "@/store";
import {onBeforeMount} from "vue";
import { onLaunch } from '@dcloudio/uni-app'

import {
    getCityAndCategory,
    reFreshToken,
    getUserInfo
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

                ws = useWebSocketStore();
            })
    }
})


</script>

<style>
	/*每个页面公共css */
</style>
