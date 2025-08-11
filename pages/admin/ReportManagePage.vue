<template>
    <view class="report-manage">
        
        <!-- 筛选条件 -->
        <view class="filter-section">
            <uni-data-select
                v-model="filterStatus"
                :localdata="statusOptions"
                placeholder="全部状态"
                @change="onStatusChange"
            ></uni-data-select>
        </view>
        
        <!-- 举报列表 -->
        <view class="report-list">
            <uni-card 
                v-for="report in reportList" 
                :key="report.reportId"
                class="report-item"
                @click="goToReportDetail(report.reportId)"
            >
                <view class="report-header">
                    <view class="report-info">
                        <text class="report-id">#{{ report.reportId }}</text>
                        <uni-tag 
                            :type="getStatusTagType(report.reportStatus)"
                            :text="getStatusText(report.reportStatus)"
                        ></uni-tag>
                    </view>
                    <text class="report-time">{{ formatTime(report.createdAt) }}</text>
                </view>
                
                <view class="report-content">
                    <text class="activity-id">活动ID: {{ report.activityId }}</text>
                    <text class="report-type">举报类型: {{ getReportTypeText(report.reportType) }}</text>
                    <text class="reporter">举报人: {{ report.reporter }}</text>
                    <text class="description">{{ report.description }}</text>
                </view>
                
                <view class="report-footer">
                    <uni-icons type="right" size="16" color="#999" />
                </view>
            </uni-card>
        </view>
        
        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore">
            <uni-load-more 
                :status="loadStatus"
                @clickLoadMore="loadMoreReports"
            ></uni-load-more>
        </view>
        
        <!-- 空状态 -->
        <view class="empty-state" v-if="reportList.length === 0 && !loading">
            <uni-icons type="info" size="80" color="#ccc" />
            <text class="empty-text">暂无举报记录</text>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getReportList } from '../../api/adminAPI'
import dayjs from 'dayjs'

// 数据状态
const reportList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const loadStatus = ref('more')
const filterStatus = ref('')

// 分页参数
const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
})

// 状态选项
const statusOptions = ref([
    { value: '', text: '全部状态' },
    { value: 'pending', text: '待处理' },
    { value: 'processing', text: '处理中' },
    { value: 'resolved', text: '已处理' },
    { value: 'rejected', text: '已驳回' }
])

// 举报类型映射
const reportTypeMap = {
    'illegal_content': '违法违规内容',
    'false_information': '虚假信息',
    'fraud': '诈骗行为',
    'inappropriate': '不当内容',
    'other': '其他'
}

// 状态映射
const statusMap = {
    'pending': '待处理',
    'processing': '处理中',
    'resolved': '已处理',
    'rejected': '已驳回'
}

// 获取状态标签类型
const getStatusTagType = (status) => {
    const typeMap = {
        'pending': 'warning',
        'processing': 'primary',
        'resolved': 'success',
        'rejected': 'error'
    }
    return typeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
    return statusMap[status] || status
}

// 获取举报类型文本
const getReportTypeText = (type) => {
    return reportTypeMap[type] || type
}

// 格式化时间
const formatTime = (time) => {
    return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 加载举报列表
const loadReports = async (isRefresh = false) => {
    if (loading.value) return
    
    loading.value = true
    loadStatus.value = 'loading'
    
    try {
        const params = {
            current: isRefresh ? 1 : pagination.current,
            size: pagination.size
        }
        
        if (filterStatus.value) {
            params.status = filterStatus.value
        }
        
        const res = await getReportList(params)
        
        if (res.code === 200) {
            const { records, total, current, size } = res.data
            
            if (isRefresh) {
                reportList.value = records
                pagination.current = 1
            } else {
                reportList.value.push(...records)
            }
            
            pagination.total = total
            pagination.current = current
            
            // 判断是否还有更多数据
            hasMore.value = reportList.value.length < total
            loadStatus.value = hasMore.value ? 'more' : 'noMore'
        } else {
            uni.showToast({
                title: res.msg || '加载失败',
                icon: 'none'
            })
            loadStatus.value = 'more'
        }
    } catch (error) {
        console.error('加载举报列表失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
        loadStatus.value = 'more'
    } finally {
        loading.value = false
    }
}

// 加载更多
const loadMoreReports = () => {
    if (!hasMore.value || loading.value) return
    
    pagination.current += 1
    loadReports()
}

// 状态筛选改变
const onStatusChange = (value) => {
    filterStatus.value = value
    reportList.value = []
    pagination.current = 1
    hasMore.value = true
    loadReports(true)
}

// 跳转到举报详情
const goToReportDetail = (reportId) => {
    uni.navigateTo({
        url: `/pages/admin/ReportDetailPage?id=${reportId}`
    })
}

// 下拉刷新
const onRefresh = () => {
    reportList.value = []
    pagination.current = 1
    hasMore.value = true
    loadReports(true)
}

// 初始化
onMounted(() => {
    loadReports(true)
})
</script>

<style scoped>
.report-manage {
    padding: 24rpx;
    padding-bottom: 100rpx;
}

.filter-section {
    margin-bottom: 24rpx;
}

.report-list {
    margin-bottom: 24rpx;
}

.report-item {
    margin-bottom: 24rpx;
    cursor: pointer;
}

.report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
}

.report-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.report-id {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}

.report-time {
    font-size: 24rpx;
    color: #999;
}

.report-content {
    margin-bottom: 16rpx;
}

.activity-id,
.report-type,
.reporter {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 8rpx;
}

.description {
    display: block;
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
    margin-top: 12rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.report-footer {
    display: flex;
    justify-content: flex-end;
}

.load-more {
    margin: 32rpx 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
    margin-top: 24rpx;
}
</style>