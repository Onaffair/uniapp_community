<template>
    <view class="repair-management">
        <!-- 页面标题 -->
        <view class="page-header">
            <text class="page-title">维修任务管理</text>
            <view class="header-actions">
                <button class="refresh-btn" @click="loadRepairRequests">
                    刷新
                </button>
            </view>
        </view>

        <!-- 统计卡片 -->
        <view class="stats-grid">
            <view class="stat-card pending">
                <view class="stat-icon">⏳</view>
                <view class="stat-info">
                    <text class="stat-number">{{ stats.pending }}</text>
                    <text class="stat-label">待分配</text>
                </view>
            </view>
            <view class="stat-card assigned">
                <view class="stat-icon">👨‍🔧</view>
                <view class="stat-info">
                    <text class="stat-number">{{ stats.assigned }}</text>
                    <text class="stat-label">已分配</text>
                </view>
            </view>
            <view class="stat-card progress">
                <view class="stat-icon">🔧</view>
                <view class="stat-info">
                    <text class="stat-number">{{ stats.inProgress }}</text>
                    <text class="stat-label">维修中</text>
                </view>
            </view>
            <view class="stat-card completed">
                <view class="stat-icon">✅</view>
                <view class="stat-info">
                    <text class="stat-number">{{ stats.completed }}</text>
                    <text class="stat-label">已完成</text>
                </view>
            </view>
        </view>

        <!-- 筛选器 -->
        <view class="filter-section">
            <view class="filter-tabs">
                <view 
                    v-for="filter in filters" 
                    :key="filter.value"
                    :class="['filter-tab', { active: activeFilter === filter.value }]"
                    @click="switchFilter(filter.value)"
                >
                    {{ filter.name }}
                    <text v-if="filter.count > 0" class="count-badge">{{ filter.count }}</text>
                </view>
            </view>
        </view>

        <!-- 维修请求列表 -->
        <view class="request-list">
            <view v-if="loading" class="loading">
                <text>加载中...</text>
            </view>
            <view v-else-if="filteredRequests.length === 0" class="empty">
                <text>暂无维修请求</text>
            </view>
            <view v-else>
                <view 
                    v-for="request in filteredRequests" 
                    :key="request.requestId"
                    class="request-item"
                >
                    <view class="request-header">
                        <view class="request-info">
                            <text class="appliance-type">{{ request.applianceType }}</text>
                            <text class="appliance-model">{{ request.applianceModel }}</text>
                        </view>
                        <text :class="['request-status', getStatusClass(request.requestStatus)]">{{ getStatusText(request.requestStatus) }}</text>
                    </view>
                    
                    <view class="request-content">
                        <text class="user-info">用户：{{ request.userAccount }}</text>
                        <text class="problem-desc">问题：{{ request.problemDescription.substring(0, 50) }}...</text>
                        <text class="submit-time">提交时间：{{ formatTime(request.createdAt) }}</text>
                        <text v-if="request.technicianAccount" class="technician-info">维修员：{{ request.technicianAccount }}</text>
                    </view>
                    
                    <view class="request-actions">
                        <button class="detail-btn" @click="viewRequestDetail(request)">查看详情</button>
                        <button 
                            v-if="request.requestStatus === 'pending'" 
                            class="assign-btn" 
                            @click="showAssignModal(request)"
                        >
                            分配任务
                        </button>
                        <button 
                            v-if="request.requestStatus === 'pending'" 
                            class="reject-btn" 
                            @click="rejectRequest(request)"
                        >
                            拒绝
                        </button>
                    </view>
                </view>
            </view>
        </view>

        <!-- 分配任务弹窗 -->
        <view v-if="showAssign" class="assign-modal" @click="closeAssignModal">
            <view class="assign-content" @click.stop>
                <view class="assign-header">
                    <text class="assign-title">分配维修任务</text>
                    <text class="close-btn" @click="closeAssignModal">×</text>
                </view>
                
                <view class="assign-info">
                    <view class="info-item">
                        <text class="info-label">家电类型：</text>
                        <text class="info-value">{{ selectedRequest?.applianceType }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">家电型号：</text>
                        <text class="info-value">{{ selectedRequest?.applianceModel }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">用户：</text>
                        <text class="info-value">{{ selectedRequest?.userAccount }}</text>
                    </view>
                </view>
                
                <view class="technician-selection">
                    <text class="selection-label">选择维修员：</text>
                    <view v-if="loadingTechnicians" class="loading-technicians">
                        <text>加载维修员列表...</text>
                    </view>
                    <view v-else class="technician-list">
                        <view 
                            v-for="technician in technicians" 
                            :key="technician.account"
                            :class="['technician-item', { selected: selectedTechnician === technician.account }]"
                            @click="selectTechnician(technician.account)"
                        >
                            <view class="technician-info">
                                <image v-if="technician.avatar" :src="technician.avatar" class="technician-avatar" />
                                <view v-else class="technician-avatar-placeholder">{{ technician.username?.charAt(0) || '维' }}</view>
                                <view class="technician-details">
                                    <text class="technician-name">{{ technician.username }}</text>
                                    <text class="technician-account">{{ technician.account }}</text>
                                </view>
                            </view>
                            <view v-if="selectedTechnician === technician.account" class="selected-icon">✓</view>
                        </view>
                    </view>
                </view>
                
                <view class="assign-actions">
                    <button class="cancel-btn" @click="closeAssignModal">取消</button>
                    <button 
                        class="confirm-assign-btn" 
                        @click="confirmAssign" 
                        :disabled="!selectedTechnician || assigning"
                    >
                        {{ assigning ? '分配中...' : '确认分配' }}
                    </button>
                </view>
            </view>
        </view>

        <!-- 详情弹窗 -->
        <view v-if="showDetail" class="detail-modal" @click="closeDetailModal">
            <view class="detail-content" @click.stop>
                <view class="detail-header">
                    <text class="detail-title">维修请求详情</text>
                    <text class="close-btn" @click="closeDetailModal">×</text>
                </view>
                
                <view class="detail-info">
                    <view class="info-section">
                        <text class="section-title">基本信息</text>
                        <view class="info-item">
                            <text class="info-label">家电类型：</text>
                            <text class="info-value">{{ selectedRequest?.applianceType }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">家电型号：</text>
                            <text class="info-value">{{ selectedRequest?.applianceModel }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">问题描述：</text>
                            <text class="info-value">{{ selectedRequest?.problemDescription }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">状态：</text>
                            <text :class="['info-value', getStatusClass(selectedRequest?.requestStatus)]">{{ getStatusText(selectedRequest?.requestStatus) }}</text>
                        </view>
                    </view>
                    
                    <view class="info-section">
                        <text class="section-title">用户信息</text>
                        <view class="info-item">
                            <text class="info-label">用户账号：</text>
                            <text class="info-value">{{ selectedRequest?.userAccount }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">提交时间：</text>
                            <text class="info-value">{{ formatTime(selectedRequest?.createdAt) }}</text>
                        </view>
                        <view v-if="selectedRequest?.technicianAccount" class="info-item">
                            <text class="info-label">分配维修员：</text>
                            <text class="info-value">{{ selectedRequest?.technicianAccount }}</text>
                        </view>
                        <view v-if="selectedRequest?.assignedAt" class="info-item">
                            <text class="info-label">分配时间：</text>
                            <text class="info-value">{{ formatTime(selectedRequest?.assignedAt) }}</text>
                        </view>
                        <view v-if="selectedRequest?.completedAt" class="info-item">
                            <text class="info-label">完成时间：</text>
                            <text class="info-value">{{ formatTime(selectedRequest?.completedAt) }}</text>
                        </view>
                    </view>
                    
                    <!-- 证据图片 -->
                    <view v-if="selectedRequest?.evidenceImages && selectedRequest.evidenceImages.length > 0" class="info-section">
                        <text class="section-title">证据图片</text>
                        <view class="evidence-images">
                            <image 
                                v-for="(img, index) in selectedRequest.evidenceImages" 
                                :key="index"
                                :src="img" 
                                class="evidence-img"
                                @click="previewImage(img, selectedRequest.evidenceImages)"
                            />
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {getAllRepairRequests, assignRepairTask, getAllTechnicians, rejectRepairRequest} from '@/api/adminAPI'

// 数据状态
const loading = ref(false)
const loadingTechnicians = ref(false)
const assigning = ref(false)
const repairRequests = ref([])
const technicians = ref([])
const activeFilter = ref('all')

// 弹窗状态
const showAssign = ref(false)
const showDetail = ref(false)
const selectedRequest = ref(null)
const selectedTechnician = ref('')

// 筛选器配置
const filters = computed(() => {
    const requestCounts = repairRequests.value.reduce((acc, request) => {
        acc[request.requestStatus] = (acc[request.requestStatus] || 0) + 1
        return acc
    }, {})
    
    return [
        { name: '全部', value: 'all', count: repairRequests.value.length },
        { name: '待分配', value: 'pending', count: requestCounts.pending || 0 },
        { name: '已分配', value: 'assigned', count: requestCounts.assigned || 0 },
        { name: '维修中', value: 'in_progress', count: requestCounts.in_progress || 0 },
        { name: '已完成', value: 'completed', count: requestCounts.completed || 0 },
        { name: '已拒绝', value: 'rejected', count: requestCounts.rejected || 0 }
    ]
})

// 统计信息
const stats = computed(() => {
    const requestCounts = repairRequests.value.reduce((acc, request) => {
        if (request.requestStatus === 'pending') acc.pending++
        if (request.requestStatus === 'assigned') acc.assigned++
        if (request.requestStatus === 'in_progress') acc.inProgress++
        if (request.requestStatus === 'completed') acc.completed++
        return acc
    }, { pending: 0, assigned: 0, inProgress: 0, completed: 0 })
    
    return requestCounts
})

// 过滤后的请求列表
const filteredRequests = computed(() => {
    if (activeFilter.value === 'all') {
        return repairRequests.value
    }
    return repairRequests.value.filter(request => request.requestStatus === activeFilter.value)
})

// 切换筛选器
const switchFilter = (filter) => {
    activeFilter.value = filter
}

// 加载维修请求列表
const loadRepairRequests = async () => {
    loading.value = true
    try {
        const res = await getAllRepairRequests()
        if (res.code === 200) {
            repairRequests.value = res.data?.records || []
        }
    } catch (error) {
        console.error('加载维修请求失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 加载维修员列表
const loadTechnicians = async () => {
    loadingTechnicians.value = true
    try {
        const res = await getAllTechnicians()
        if (res.code === 200) {
            technicians.value = res.data || []
        }
    } catch (error) {
        console.error('加载维修员列表失败:', error)
        uni.showToast({
            title: '加载维修员失败',
            icon: 'none'
        })
    } finally {
        loadingTechnicians.value = false
    }
}

// 查看请求详情
const viewRequestDetail = (request) => {
    selectedRequest.value = request
    showDetail.value = true
}

// 关闭详情弹窗
const closeDetailModal = () => {
    showDetail.value = false
    selectedRequest.value = null
}

// 显示分配弹窗
const showAssignModal = (request) => {
    selectedRequest.value = request
    selectedTechnician.value = ''
    showAssign.value = true
    loadTechnicians()
}

// 关闭分配弹窗
const closeAssignModal = () => {
    showAssign.value = false
    selectedRequest.value = null
    selectedTechnician.value = ''
}

// 选择维修员
const selectTechnician = (technicianAccount) => {
    selectedTechnician.value = technicianAccount
}

// 确认分配任务
const confirmAssign = async () => {
    if (!selectedTechnician.value) {
        uni.showToast({
            title: '请选择维修员',
            icon: 'none'
        })
        return
    }
    
    assigning.value = true
    try {
        const res = await assignRepairTask({
            requestId: selectedRequest.value.requestId,
            technicianAccount: selectedTechnician.value
        })
        
        if (res.code === 200) {
            // 更新本地数据
            const requestIndex = repairRequests.value.findIndex(r => r.requestId === selectedRequest.value.requestId)
            if (requestIndex !== -1) {
                repairRequests.value[requestIndex].requestStatus = 'assigned'
                repairRequests.value[requestIndex].technicianAccount = selectedTechnician.value
                repairRequests.value[requestIndex].assignedAt = new Date().toISOString()
            }
            
            closeAssignModal()
        }
    } catch (error) {
        console.error('分配任务失败:', error)
    } finally {
        assigning.value = false
    }
}

// 拒绝请求
const rejectRequest = async (request) => {
    uni.showModal({
        title: '确认拒绝',
        content: `确认拒绝 ${request.applianceType}（${request.applianceModel}）的维修请求吗？`,
        success: async (res) => {
            if (res.confirm) {
                try {
                    await rejectRepairRequest({requestId:request.requestId})
                    uni.showToast({
                        title: '已拒绝请求',
                        icon: 'success'
                    })
                    loadRepairRequests()

                } catch (error) {
                    console.error('拒绝请求失败:', error)
                    uni.showToast({
                        title: '操作失败',
                        icon: 'none'
                    })
                }
            }
        }
    })
}

// 预览图片
const previewImage = (current, urls) => {
    uni.previewImage({
        current,
        urls
    })
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        'pending': '待分配',
        'assigned': '已分配',
        'in_progress': '维修中',
        'completed': '已完成',
        'rejected': '已拒绝'
    }
    return statusMap[status] || status
}

// 获取状态样式类
const getStatusClass = (status) => {
    const classMap = {
        'pending': 'status-pending',
        'assigned': 'status-assigned',
        'in_progress': 'status-progress',
        'completed': 'status-completed',
        'rejected': 'status-rejected'
    }
    return classMap[status] || ''
}

// 格式化时间
const formatTime = (time) => {
    if (!time) return ''
    const date = new Date(time)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 页面加载时获取数据
onMounted(() => {
    loadRepairRequests()
})
</script>

<style scoped>
.repair-management {
    padding: 20px;
    background-color: #f5f5f5;
    min-height: 100vh;
}

/* 页面头部 */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
}

.refresh-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
}

/* 统计卡片 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-icon {
    font-size: 32px;
    margin-right: 15px;
}

.stat-info {
    flex: 1;
}

.stat-number {
    display: block;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 14px;
    color: #666;
}

.pending .stat-number {
    color: #f39c12;
}

.assigned .stat-number {
    color: #3498db;
}

.progress .stat-number {
    color: #9b59b6;
}

.completed .stat-number {
    color: #27ae60;
}

/* 筛选器 */
.filter-section {
    margin-bottom: 20px;
}

.filter-tabs {
    display: flex;
    background: white;
    border-radius: 8px;
    padding: 5px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow-x: auto;
}

.filter-tab {
    flex: 1;
    min-width: 80px;
    text-align: center;
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 14px;
    color: #666;
    position: relative;
    transition: all 0.3s;
    cursor: pointer;
    white-space: nowrap;
}

.filter-tab.active {
    background: #667eea;
    color: white;
}

.count-badge {
    position: absolute;
    top: 2px;
    right: 5px;
    background: #ff4757;
    color: white;
    font-size: 10px;
    padding: 2px 5px;
    border-radius: 10px;
    min-width: 16px;
    height: 16px;
    line-height: 12px;
}

.filter-tab.active .count-badge {
    background: rgba(255,255,255,0.3);
}

/* 请求列表 */
.request-list {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.loading, .empty {
    text-align: center;
    padding: 50px 0;
    color: #999;
}

.request-item {
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.request-item:last-child {
    border-bottom: none;
}

.request-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

.request-info {
    flex: 1;
}

.appliance-type {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
}

.appliance-model {
    font-size: 14px;
    color: #666;
}

.request-status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    color: white;
    font-weight: 500;
}

.status-pending {
    background: #f39c12;
}

.status-assigned {
    background: #3498db;
}

.status-progress {
    background: #9b59b6;
}

.status-completed {
    background: #27ae60;
}

.status-rejected {
    background: #e74c3c;
}

.request-content {
    margin-bottom: 15px;
}

.user-info, .problem-desc, .submit-time, .technician-info {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
}

.request-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.detail-btn, .assign-btn, .reject-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
}

.detail-btn {
    background: #f8f9fa;
    color: #666;
    border: 1px solid #ddd;
}

.assign-btn {
    background: #28a745;
    color: white;
}

.reject-btn {
    background: #dc3545;
    color: white;
}

/* 弹窗样式 */
.assign-modal, .detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.assign-content, .detail-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
}

.assign-header, .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
}

.assign-title, .detail-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.close-btn {
    font-size: 24px;
    color: #999;
    cursor: pointer;
}

.assign-info {
    padding: 0 20px;
    margin-bottom: 20px;
}

.info-item {
    display: flex;
    margin-bottom: 10px;
    align-items: flex-start;
}

.info-label {
    width: 80px;
    font-size: 14px;
    color: #666;
    flex-shrink: 0;
}

.info-value {
    flex: 1;
    font-size: 14px;
    color: #333;
    word-break: break-all;
}

.technician-selection {
    padding: 0 20px;
    margin-bottom: 20px;
}

.selection-label {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
}

.loading-technicians {
    text-align: center;
    padding: 20px;
    color: #999;
}

.technician-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 8px;
}

.technician-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
}

.technician-item:last-child {
    border-bottom: none;
}

.technician-item:hover {
    background-color: #f8f9fa;
}

.technician-item.selected {
    background-color: #e3f2fd;
}

.technician-info {
    display: flex;
    align-items: center;
    flex: 1;
}

.technician-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 12px;
}

.technician-avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #667eea;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    margin-right: 12px;
}

.technician-details {
    flex: 1;
}

.technician-name {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 2px;
}

.technician-account {
    font-size: 12px;
    color: #666;
}

.selected-icon {
    color: #667eea;
    font-size: 18px;
    font-weight: bold;
}

.assign-actions {
    display: flex;
    gap: 10px;
    padding: 0 20px 20px;
}

.cancel-btn {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    background: white;
    color: #666;
    border-radius: 8px;
    font-size: 14px;
}

.confirm-assign-btn {
    flex: 1;
    padding: 12px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
}

.confirm-assign-btn:disabled {
    opacity: 0.6;
}

/* 详情信息 */
.detail-info {
    padding: 0 20px 20px;
}

.info-section {
    margin-bottom: 25px;
}

.section-title {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid #667eea;
}

.evidence-images {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

.evidence-img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
    cursor: pointer;
}
</style>