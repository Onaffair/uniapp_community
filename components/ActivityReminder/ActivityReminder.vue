<template>
	<MessageNotify ref="notify"></MessageNotify>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/store/userStore'
import MessageNotify from '@/components/MessageNotify/MessageNotify.vue'

const userStore = useUserStore()
const notify = ref()
const checkInterval = ref(null)
const notifiedActivities = ref(new Set())

// 检查即将开始的活动
const checkUpcomingActivities = () => {
  const activities = userStore.getParticipation()
  const now = new Date()

  activities.forEach(item => {
    const beginTime = new Date(item.beginTime)
    const timeDiff = beginTime - now

    // 修正时间范围：提前 1 小时检查（3600000ms = 1小时）
    if (timeDiff > 0 && timeDiff < 3600 * 100 && !notifiedActivities.value.has(item.id)) {
      showActivityNotify(item, timeDiff)
      notifiedActivities.value.add(item.id)
    }
  })
}

// 显示活动通知
const showActivityNotify = (activity, timeDiff) => {
  const minutes = Math.ceil(timeDiff / (60 * 1000))
  const message = `活动【${activity.title}】将在${minutes}分钟后开始`

  notify.value.show({
    message,
    duration: 5000, // 5秒后自动消失
    onClick: () => {
      // 点击通知跳转到活动详情
      uni.navigateTo({
        url: `/pages/Detail/ActivityDetailPage?id=${activity.id}`
      })
    }
  })
}

// 启动定时检查
onMounted(() => {
  // 清空历史记录，避免页面保留导致残留
  notifiedActivities.value.clear()
  checkInterval.value = setInterval(checkUpcomingActivities, 60 * 1000)
  checkUpcomingActivities()
})

// 清除定时器
onBeforeUnmount(() => {
  clearInterval(checkInterval.value)
  notifiedActivities.value.clear() // 卸载时清理
})
</script> 