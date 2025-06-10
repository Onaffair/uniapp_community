<!-- #ifdef H5 -->
<template>
    <view class="dashboard">
        <!-- 加载状态 -->
        <view v-if="loading" class="loading">
            <text>加载中...</text>
        </view>

        <!-- 错误状态 -->
        <view v-else-if="error" class="error">
            <text>{{ error }}</text>
            <button @click="fetchAllData" class="retry-btn">重试</button>
        </view>

        <!-- 主要内容 -->
        <view v-else class="dashboard-content">
            <!-- 统计卡片 -->
            <view class="stats-grid">
                <view class="stat-card">
                    <view class="stat-icon user-icon">👥</view>
                    <view class="stat-info">
                        <text class="stat-number">{{ stats.userCount }}</text>
                        <text class="stat-label">用户总数</text>
                        <text class="stat-desc">较上周
                            <text :class="stats.userGrowth > 0 ? 'up' : 'down'">{{
                                    stats.userGrowth > 0 ? '+' : ''
                                }}{{ stats.userGrowth }}%
                            </text>
                        </text>
                    </view>
                </view>

                <view class="stat-card">
                    <view class="stat-icon activity-icon">🎯</view>
                    <view class="stat-info">
                        <text class="stat-number">{{ stats.activityCount }}</text>
                        <text class="stat-label">活动总数</text>
                        <text class="stat-desc">较上周
                            <text :class="stats.activityGrowth > 0 ? 'up' : 'down'">
                                {{ stats.activityGrowth > 0 ? '+' : '' }}{{ stats.activityGrowth }}%
                            </text>
                        </text>
                    </view>
                </view>

                <view class="stat-card">
                    <view class="stat-icon group-icon">👫</view>
                    <view class="stat-info">
                        <text class="stat-number">{{ stats.groupCount }}</text>
                        <text class="stat-label">群组总数</text>
                        <text class="stat-desc">较上周
                            <text :class="stats.groupGrowth > 0 ? 'up' : 'down'">{{
                                    stats.groupGrowth > 0 ? '+' : ''
                                }}{{ stats.groupGrowth }}%
                            </text>
                        </text>
                    </view>
                </view>

                <view class="stat-card">
                    <view class="stat-icon active-icon">⚡</view>
                    <view class="stat-info">
                        <text class="stat-number">{{ stats.activeToday }}</text>
                        <text class="stat-label">今日活跃</text>
                        <text class="stat-desc">较昨日
                            <text :class="stats.activeGrowth > 0 ? 'up' : 'down'">{{
                                    stats.activeGrowth > 0 ? '+' : ''
                                }}{{ stats.activeGrowth }}%
                            </text>
                        </text>
                    </view>
                </view>
            </view>

            <!-- 图表区域 -->
            <view class="charts-section">
                <!-- 用户增长趋势图 -->
                <view class="chart-card">
                    <view class="chart-header">
                        <text class="chart-title">用户增长趋势</text>
                    </view>
                    <view class="chart-content">
                        <view class="line-chart">
                            <view class="chart-y-axis">
                                <text v-for="(value, index) in yAxisValues" :key="index" class="y-axis-label">{{
                                        value
                                    }}
                                </text>
                            </view>
                            <view class="chart-area">
                                <view class="chart-grid">
                                    <view v-for="i in 5" :key="i" class="grid-line"></view>
                                </view>
                                <view class="chart-line">
                                    <view
                                        v-for="(point, index) in userGrowthData"
                                        :key="index"
                                        class="data-point"
                                        :style="{ left: (index * 100 / (userGrowthData.length - 1)) + '%', bottom: (point.value / Math.max(...userGrowthData.map(d => d.value)) * 100) + '%' }"
                                    ></view>
                                </view>
                            </view>
                            <view class="chart-x-axis">
                                <text v-for="(month, index) in months" :key="index" class="x-axis-label">{{
                                        month
                                    }}
                                </text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 活动分类统计饼图 -->
                <view class="chart-card">
                    <view class="chart-header">
                        <text class="chart-title">活动分类统计</text>
                    </view>
                    <view class="chart-content">
                        <view class="pie-chart-container">
                            <view class="pie-chart" :style="pieChartStyle">
                            </view>
                            <view class="pie-legend">
                                <view
                                    v-for="(category, index) in activityCategories"
                                    :key="category.id"
                                    class="legend-item"
                                    :class="{ highlighted: highlightedCategory === category.id }"
                                    @click="highlightCategory(category.id)"
                                >
                                    <view class="legend-color"
                                          :style="{ backgroundColor: getCategoryColor(index) }"></view>
                                    <text class="legend-text">{{ category.name }}
                                        ({{ activityCategoryCounts[category.id] || 0 }})
                                    </text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 最新数据 -->
            <view class="latest-section">
                <!-- 最新用户 -->
                <view class="latest-card">
                    <view class="latest-header">
                        <text class="latest-title">最新用户</text>
                        <text class="more-link" @click="navigateTo('/pages/admin/Users')">查看更多</text>
                    </view>
                    <view class="latest-content">
                        <view
                            v-for="user in latestUsers"
                            :key="user.id"
                            class="user-item"
                        >
                            <view class="user-avatar">
                                <image v-if="user.avatar" :src="imgBaseUrl + user.avatar" class="user-avatar-img"
                                       mode="aspectFill"/>
                                <view v-else class="user-avatar-placeholder">{{
                                        user.username?.charAt(0) || 'U'
                                    }}
                                </view>
                            </view>
                            <view class="user-info">
                                <text class="user-name">{{ user.username }}</text>
                                <text class="user-email">{{ user.email }}</text>
                            </view>
                            <view class="user-status">
                                <text :class="getStatusClass(user.status)">{{ getStatusText(user.status) }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 最新活动 -->
                <view class="latest-card">
                    <view class="latest-header">
                        <text class="latest-title">最新活动</text>
                        <text class="more-link" @click="navigateTo('/pages/admin/Activities')">查看更多</text>
                    </view>
                    <view class="latest-content">
                        <view
                            v-for="activity in latestActivities"
                            :key="activity.id"
                            class="activity-item"
                        >
                            <view class="activity-info">
                                <text class="activity-title">{{ activity.title }}</text>
                                <text class="activity-meta">{{ activity.address }} • {{
                                        formatDate(activity.beginTime)
                                    }}
                                </text>
                            </view>
                            <view class="activity-status">
                                <text :class="getActivityStatusClass(activity.status)">
                                    {{ getActivityStatusText(activity.status) }}
                                </text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {getAllUsers, getAllActivities, getAllGroups} from '@/api/adminAPI'
import {useActivityStore} from '@/store/activityStore'
import {imgBaseUrl} from '@/util/basic-data.js'

const activityStore = useActivityStore()

// 状态管理
const loading = ref(true)
const error = ref('')

// 统计数据
const stats = ref({
    userCount: 0,
    activityCount: 0,
    groupCount: 0,
    activeToday: 0,
    userGrowth: 0,
    activityGrowth: 0,
    groupGrowth: 0,
    activeGrowth: 0
})

// 用户增长数据
const userGrowthData = ref([])

// 月份数据
const months = computed(() => userGrowthData.value.map(item => item.month))

// Y轴数值
const yAxisValues = computed(() => {
    const maxValue = Math.max(...userGrowthData.value.map(d => d.value))
    return Array.from({length: 6}, (_, i) => Math.round(maxValue * (5 - i) / 5))
})

// 活动分类数据
const activityCategories = computed(() => {
    return activityStore.categoryList.filter(cat => cat.id !== 0) // 排除"所有分类"
})

const activityCategoryCounts = ref({})
const highlightedCategory = ref(null)

// 最新用户和活动
const latestUsers = ref([])
const latestActivities = ref([])

// 获取分类颜色
const getCategoryColor = (index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
    return colors[index % colors.length]
}

// 计算饼图样式
const pieChartStyle = computed(() => {
    return {
        background: `conic-gradient(${generateConicGradient()})`
    }
})

// 生成圆锥渐变
const generateConicGradient = () => {
    const total = Object.values(activityCategoryCounts.value).reduce((sum, count) => sum + count, 0)


    if (total === 0) return '#f0f0f0 0deg 360deg'

    let currentAngle = 0
    const segments = []

    activityCategories.value.forEach((category, index) => {
        const count = activityCategoryCounts.value[category.id] || 0
        const percentage = count / total
        const angle = percentage * 360
        const color = getCategoryColor(index)



        if (angle > 0) {
            segments.push(`${color} ${currentAngle}deg ${currentAngle + angle}deg`)
            currentAngle += angle
        }
    })



    if (segments.length === 0) {
        return '#f0f0f0 0deg 360deg'
    }

    return segments.join(', ')
}

// 获取饼图切片样式
const getPieSliceStyle = (index) => {
    return {
        backgroundColor: getCategoryColor(index)
    }
}

// 高亮分类
const highlightCategory = (categoryId) => {
    highlightedCategory.value = highlightedCategory.value === categoryId ? null : categoryId
}

// 获取用户状态文本
const getStatusText = (status) => {
    const statusMap = {
        'active': '活跃',
        'inactive': '非活跃',
        'banned': '已封禁'
    }
    return statusMap[status] || '未知'
}

// 获取用户状态样式类
const getStatusClass = (status) => {
    return `status-${status}`
}

// 获取活动状态文本
const getActivityStatusText = (status) => {
    const statusItem = activityStore.activityStatusList.find(item => item.id === status)
    return statusItem ? statusItem.name : '未知状态'
}

// 获取活动状态样式类
const getActivityStatusClass = (status) => {
    const statusMap = {
        1: 'status-waiting',
        2: 'status-active',
        3: 'status-full',
        4: 'status-ongoing',
        5: 'status-ended',
        6: 'status-cancelled'
    }
    return statusMap[status] || 'status-unknown'
}

// 格式化日期
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 页面导航
const navigateTo = (url) => {
    uni.navigateTo({url})
}

// 获取所有数据
const fetchAllData = async () => {
    try {
        loading.value = true
        error.value = ''

        // 并行获取所有数据
        const [usersRes, activitiesRes, groupsRes] = await Promise.all([
            getAllUsers(),
            getAllActivities(),
            getAllGroups()
        ])

        if (usersRes?.code === 200) {
            const usersData = usersRes.data || []
            processUsersData(usersData)
        } else if (Array.isArray(usersRes)) {
            // 如果直接返回数组
            processUsersData(usersRes)
        } else if (usersRes?.data && Array.isArray(usersRes.data)) {
            // 如果data字段是数组
            processUsersData(usersRes.data)
        }

        if (activitiesRes?.code === 200) {
            const activitiesData = activitiesRes.data || []
            processActivitiesData(activitiesData)
        } else if (Array.isArray(activitiesRes)) {
            // 如果直接返回数组
            processActivitiesData(activitiesRes)
        } else if (activitiesRes?.data && Array.isArray(activitiesRes.data)) {
            // 如果data字段是数组
            processActivitiesData(activitiesRes.data)
        }

        // 处理群组数据
        if (groupsRes?.code === 200) {
            const groupsData = groupsRes.data || []
            processGroupsData(groupsData)
        } else if (Array.isArray(groupsRes)) {
            // 如果直接返回数组
            processGroupsData(groupsRes)
        } else if (groupsRes?.data && Array.isArray(groupsRes.data)) {
            // 如果data字段是数组
            processGroupsData(groupsRes.data)
        }

    } catch (err) {
        console.error('获取数据失败:', err)
        error.value = '获取数据失败，请重试'
    } finally {
        loading.value = false
    }
}

// 处理用户数据
const processUsersData = (usersData) => {
    if (!Array.isArray(usersData)) {
        return
    }

    // 更新用户总数
    stats.value.userCount = usersData.length

    // 计算用户增长趋势数据（按月统计）
    const now = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(now.getMonth() - 5) // 获取半年内的数据（当前月+前5个月）

    // 初始化6个月的统计数据
    const monthlyData = Array(6).fill(0)
    const monthNames = []

    // 设置月份名称
    for (let i = 0; i < 6; i++) {
        const d = new Date()
        d.setMonth(now.getMonth() - 5 + i)
        monthNames.push(`${d.getMonth() + 1}月`)
    }

    // 统计每个月的新用户数量
    usersData.forEach(user => {
        if (!user.createdAt) return

        const createDate = new Date(user.createdAt)
        // 只统计半年内的数据
        if (createDate >= sixMonthsAgo) {
            // 计算与最早月份的月份差
            const monthDiff = (createDate.getFullYear() - sixMonthsAgo.getFullYear()) * 12 +
                createDate.getMonth() - sixMonthsAgo.getMonth()

            if (monthDiff >= 0 && monthDiff < 6) {
                monthlyData[monthDiff]++
            }
        }
    })

    // 更新用户增长数据
    userGrowthData.value = monthNames.map((month, index) => ({
        month,
        value: monthlyData[index]
    }))

    // 计算同比增长率（用最近一个月与上一个月比较）
    const currentMonth = monthlyData[5] || 0
    const prevMonth = monthlyData[4] || 1 // 避免除以0
    stats.value.userGrowth = Math.round(((currentMonth - prevMonth) / prevMonth) * 100)

    // 获取按创建时间排序的最新5个用户
    const sortedUsers = [...usersData].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

    latestUsers.value = sortedUsers.slice(0, 5).map(user => ({
        id: user.account,
        username: user.username || '未知用户',
        email: user.email || '',
        avatar: user.avatar || null,
        status: user.status === 'offline' ? 'inactive' : 'active'
    }))
}

// 处理活动数据
const processActivitiesData = (activitiesData) => {
    if (!Array.isArray(activitiesData)) {
        return
    }

    // 更新活动总数
    stats.value.activityCount = activitiesData.length

    // 更新活动增长率（示例：假设8%的增长）
    stats.value.activityGrowth = 8.0

    // 初始化所有分类计数为0
    const categoryCounts = {}
    activityCategories.value.forEach(category => {
        categoryCounts[category.id] = 0
    })

    // 计算活动分类统计
    activitiesData.forEach(activity => {
        const categoryId = activity.categoryId || 9 // 如果没有分类ID，归为"其他"(ID=9)
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1
    })

    activityCategoryCounts.value = categoryCounts


    // 获取按创建时间排序的最新5个活动
    const sortedActivities = [...activitiesData].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

    latestActivities.value = sortedActivities.slice(0, 5).map(activity => ({
        id: activity.id,
        title: activity.title || '未命名活动',
        address: activity.address || '未知地址',
        beginTime: activity.beginTime,
        status: activity.status
    }))
}

// 处理群组数据
const processGroupsData = (groupsData) => {
    if (!Array.isArray(groupsData)) return

    // 更新群组总数
    stats.value.groupCount = groupsData.length

    // 更新群组增长率（示例：假设-2%的增长，即下降）
    stats.value.groupGrowth = -2.0

    // 更新今日活跃和活跃增长（示例数据）
    stats.value.activeToday = 489
    stats.value.activeGrowth = 15.6
}

// 组件挂载时获取数据
onMounted(() => {
    fetchAllData()
})
</script>

<style scoped>
.dashboard {
    padding: 20rpx;
    background-color: #f5f7fa;
    min-height: 100vh;
}

/* 加载和错误状态 */
.loading, .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400rpx;
    color: #666;
}

.retry-btn {
    margin-top: 20rpx;
    padding: 10rpx 20rpx;
    background-color: #007aff;
    color: white;
    border: none;
    border-radius: 8rpx;
}

.dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
}

/* 统计卡片 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
}

.stat-card {
    background: white;
    padding: 30rpx;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.stat-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
}

.user-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.activity-icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.group-icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.active-icon {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.stat-number {
    font-size: 48rpx;
    font-weight: bold;
    color: #2c3e50;
}

.stat-label {
    font-size: 28rpx;
    color: #7f8c8d;
}

.stat-desc {
    font-size: 24rpx;
    color: #95a5a6;
}

.up {
    color: #27ae60;
}

.down {
    color: #e74c3c;
}

/* 图表区域 */
.charts-section {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
}

.chart-card {
    background: white;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.chart-header {
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
}

.chart-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #2c3e50;
}

.chart-content {
    padding: 30rpx;
}

/* 折线图 */
.line-chart {
    position: relative;
    height: 400rpx;
}

.chart-y-axis {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 60rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    padding-right: 10rpx;
}

.y-axis-label {
    font-size: 24rpx;
    color: #95a5a6;
}

.chart-area {
    position: absolute;
    left: 70rpx;
    top: 0;
    right: 0;
    height: 100%;
}

.chart-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.grid-line {
    height: 1rpx;
    background-color: #ecf0f1;
}

.chart-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
}

.data-point {
    position: absolute;
    width: 12rpx;
    height: 12rpx;
    background-color: #3498db;
    border-radius: 50%;
    transform: translate(-50%, 50%);
    box-shadow: 0 2rpx 8rpx rgba(52, 152, 219, 0.3);
}

.chart-x-axis {
    position: absolute;
    bottom: -40rpx;
    left: 70rpx;
    right: 0;
    display: flex;
    justify-content: space-between;
}

.x-axis-label {
    font-size: 24rpx;
    color: #95a5a6;
}

/* 饼图 */
.pie-chart-container {
    display: flex;
    align-items: center;
    gap: 40rpx;
}

.pie-chart {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    position: relative;
}

.pie-slice {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.pie-slice.highlighted {
    transform: scale(1.05);
}

.pie-legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 12rpx;
    border-radius: 8rpx;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.legend-item:hover,
.legend-item.highlighted {
    background-color: #f8f9fa;
}

.legend-color {
    width: 24rpx;
    height: 24rpx;
    border-radius: 4rpx;
}

.legend-text {
    font-size: 28rpx;
    color: #2c3e50;
}

/* 最新数据区域 */
.latest-section {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
}

.latest-card {
    background: white;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.latest-header {
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.latest-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #2c3e50;
}

.more-link {
    font-size: 28rpx;
    color: #3498db;
    cursor: pointer;
}

.latest-content {
    padding: 0 30rpx 30rpx;
}

/* 用户项 */
.user-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f1f2f6;
}

.user-item:last-child {
    border-bottom: none;
}

.user-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    overflow: hidden;
}

.user-avatar-img {
    width: 100%;
    height: 100%;
}

.user-avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32rpx;
    font-weight: bold;
}

.user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.user-name {
    font-size: 30rpx;
    font-weight: 500;
    color: #2c3e50;
}

.user-email {
    font-size: 26rpx;
    color: #7f8c8d;
}

.user-status {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
}

/* 活动项 */
.activity-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f1f2f6;
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.activity-title {
    font-size: 30rpx;
    font-weight: 500;
    color: #2c3e50;
}

.activity-meta {
    font-size: 26rpx;
    color: #7f8c8d;
}

.activity-status {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
}

/* 状态样式 */
.status-active {
    background-color: #d4edda;
    color: #155724;
}

.status-inactive {
    background-color: #f8d7da;
    color: #721c24;
}

.status-banned {
    background-color: #f5c6cb;
    color: #721c24;
}

.status-waiting {
    background-color: #fff3cd;
    color: #856404;
}

.status-full {
    background-color: #f8d7da;
    color: #721c24;
}

.status-ongoing {
    background-color: #d1ecf1;
    color: #0c5460;
}

.status-ended {
    background-color: #e2e3e5;
    color: #383d41;
}

.status-cancelled {
    background-color: #f5c6cb;
    color: #721c24;
}

.status-unknown {
    background-color: #e2e3e5;
    color: #6c757d;
}
</style>
<!-- #endif -->