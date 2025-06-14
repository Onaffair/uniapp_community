<template>
    <view class="report-detail">
        <!-- 顶部导航 -->
        <Head title="举报详情" :go-back="true" />
        
        <view class="detail-container" v-if="reportDetail">
            <!-- 举报基本信息 -->
            <uni-card title="举报信息">
                <view class="info-section">
                    <view class="info-row">
                        <text class="label">举报ID:</text>
                        <text class="value">#{{ reportDetail.reportId }}</text>
                    </view>
                    <view class="info-row">
                        <text class="label">活动ID:</text>
                        <text class="value">{{ reportDetail.activityId }}</text>
                    </view>
                    <view class="info-row">
                        <text class="label">举报人:</text>
                        <text class="value">{{ reportDetail.reporter }}</text>
                    </view>
                    <view class="info-row">
                        <text class="label">举报类型:</text>
                        <text class="value">{{ getReportTypeText(reportDetail.reportType) }}</text>
                    </view>
                    <view class="info-row">
                        <text class="label">举报时间:</text>
                        <text class="value">{{ formatTime(reportDetail.createdAt) }}</text>
                    </view>
                    <view class="info-row">
                        <text class="label">当前状态:</text>
                        <uni-tag 
                            :type="getStatusTagType(reportDetail.reportStatus)"
                            :text="getStatusText(reportDetail.reportStatus)"
                        ></uni-tag>
                    </view>
                </view>
            </uni-card>
            
            <!-- 举报描述 -->
            <uni-card title="举报描述">
                <view class="description-content">
                    {{ reportDetail.description }}
                </view>
            </uni-card>
            
            <!-- 证据图片 -->
            <uni-card title="证据图片" v-if="reportDetail.evidenceImages && reportDetail.evidenceImages.length > 0">
                <view class="evidence-images">
                    <image 
                        v-for="(image, index) in reportDetail.evidenceImages"
                        :key="index"
                        :src="imgBaseUrl + image"
                        class="evidence-image"
                        mode="aspectFill"
                        @click="previewImage(image, reportDetail.evidenceImages)"
                    />
                </view>
            </uni-card>
            
            <!-- 处理信息 -->
            <uni-card title="处理信息" v-if="reportDetail.handlerAccount">
                <view class="info-section">
                    <view class="info-row">
                        <text class="label">处理人:</text>
                        <text class="value">{{ reportDetail.handlerAccount }}</text>
                    </view>
                    <view class="info-row">
                        <text class="label">处理措施:</text>
                        <text class="value">{{ getHandleActionText(reportDetail.handleAction) }}</text>
                    </view>
                    <view class="info-row">
                        <text class="label">处理时间:</text>
                        <text class="value">{{ formatTime(reportDetail.handledAt) }}</text>
                    </view>
                    <view class="info-row" v-if="reportDetail.handleComment">
                        <text class="label">处理备注:</text>
                        <text class="value">{{ reportDetail.handleComment }}</text>
                    </view>
                </view>
            </uni-card>
            
            <!-- 处理操作 -->
            <uni-card title="处理操作" v-if="canHandle">
                <view class="handle-section">
                    <view class="form-item">
                        <text class="label">处理措施 <text class="required">*</text></text>
                        <uni-data-select
                            v-model="handleForm.handleAction"
                            :localdata="handleActionOptions"
                            placeholder="请选择处理措施"
                        ></uni-data-select>
                    </view>
                    
                    <view class="form-item">
                        <text class="label">处理备注</text>
                        <textarea
                            v-model="handleForm.handleComment"
                            placeholder="请输入处理备注（可选）"
                            class="textarea"
                            maxlength="200"
                        ></textarea>
                    </view>
                    
                    <view class="handle-buttons">
                        <button 
                            class="handle-btn"
                            :disabled="!handleForm.handleAction"
                            :class="{ disabled: !handleForm.handleAction }"
                            @click="submitHandle"
                        >
                            提交处理
                        </button>
                    </view>
                </view>
            </uni-card>
        </view>
        
        <!-- 加载状态 -->
        <view class="loading-state" v-else>
            <uni-load-more status="loading"></uni-load-more>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getReportDetail, handleReport } from '../../api/adminAPI'
import { useUserStore } from '@/store/userStore'
import { imgBaseUrl } from '@/util/basic-data'
import dayjs from 'dayjs'

const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

const userStore = useUserStore()
const { userDetail } = userStore

// 数据状态
const reportDetail = ref(null)
const loading = ref(false)

// 处理表单
const handleForm = reactive({
    handleAction: '',
    handleComment: ''
})

// 处理措施选项
const handleActionOptions = ref([
    { value: 'accept', text: '接受举报' },
    { value: 'reject', text: '驳回举报' },
    { value: 'activity_removed', text: '删除活动' },
    { value: 'warning_sent', text: '发送警告' },
    { value: 'user_banned', text: '封禁用户' }
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

// 处理措施映射
const handleActionMap = {
    'accept': '接受举报',
    'reject': '驳回举报',
    'activity_removed': '删除活动',
    'warning_sent': '发送警告',
    'user_banned': '封禁用户'
}

// 是否可以处理
const canHandle = computed(() => {
    return reportDetail.value && 
           (reportDetail.value.reportStatus === 'pending' || reportDetail.value.reportStatus === 'processing')
})

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

// 获取处理措施文本
const getHandleActionText = (action) => {
    return handleActionMap[action] || action
}

// 格式化时间
const formatTime = (time) => {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 预览图片
const previewImage = (current, images) => {
    const urls = images.map(img => imgBaseUrl + img)
    const currentUrl = imgBaseUrl + current
    
    uni.previewImage({
        urls: urls,
        current: currentUrl
    })
}

// 加载举报详情
const loadReportDetail = async () => {
    loading.value = true
    
    try {
        const res = await getReportDetail(props.id)
        
        if (res.code === 200) {
            reportDetail.value = res.data
        } else {
            uni.showToast({
                title: res.msg || '加载失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('加载举报详情失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 提交处理
const submitHandle = async () => {
    if (!handleForm.handleAction) {
        uni.showToast({
            title: '请选择处理措施',
            icon: 'none'
        })
        return
    }
    
    uni.showModal({
        title: '确认处理',
        content: `确定要执行"${getHandleActionText(handleForm.handleAction)}"操作吗？`,
        success: async (res) => {
            if (res.confirm) {
                await doHandle()
            }
        }
    })
}

// 执行处理
const doHandle = async () => {
    try {
        uni.showLoading({
            title: '处理中...'
        })
        
        const handleData = {
            reportId: reportDetail.value.reportId,
            handlerAccount: userDetail?.account,
            handleAction: handleForm.handleAction,
            handleComment: handleForm.handleComment
        }
        
        const res = await handleReport(handleData)
        
        uni.hideLoading()
        
        if (res.code === 200) {
            uni.showToast({
                title: '处理成功',
                icon: 'success'
            })
            
            // 重新加载详情
            setTimeout(() => {
                loadReportDetail()
            }, 1000)
        } else {
            uni.showToast({
                title: res.msg || '处理失败',
                icon: 'none'
            })
        }
    } catch (error) {
        uni.hideLoading()
        console.error('处理举报失败:', error)
        uni.showToast({
            title: '处理失败',
            icon: 'none'
        })
    }
}

// 初始化
onMounted(() => {
    loadReportDetail()
})
</script>

<style scoped>
.report-detail {
    padding: 24rpx;
    padding-bottom: 100rpx;
}

.detail-container {
    margin-bottom: 24rpx;
}

.info-section {
    margin-top: 16rpx;
}

.info-row {
    display: flex;
    margin-bottom: 16rpx;
    align-items: flex-start;
}

.label {
    width: 160rpx;
    font-size: 28rpx;
    color: #666;
    flex-shrink: 0;
}

.value {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    word-break: break-all;
}

.required {
    color: #ff4757;
}

.description-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    white-space: pre-wrap;
    margin-top: 16rpx;
}

.evidence-images {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 16rpx;
}

.evidence-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 8rpx;
    border: 1px solid #f0f0f0;
}

.handle-section {
    margin-top: 16rpx;
}

.form-item {
    margin-bottom: 32rpx;
}

.textarea {
    width: 100%;
    min-height: 120rpx;
    padding: 20rpx;
    border: 1px solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 28rpx;
    line-height: 1.5;
    box-sizing: border-box;
    margin-top: 16rpx;
}

.handle-buttons {
    margin-top: 32rpx;
}

.handle-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background: #007aff;
    color: white;
    border: none;
    border-radius: 40rpx;
    font-size: 30rpx;
}

.handle-btn.disabled {
    background: #ccc;
    color: #999;
}

.loading-state {
    display: flex;
    justify-content: center;
    padding: 120rpx 0;
}
</style>