<template>
    <view class="technician-tasks">
        <!-- 页面头部 -->
        <view class="page-header">
            <text class="page-title">我的维修任务</text>
            <button class="refresh-btn" @click="loadTasks">
                刷新
            </button>
        </view>

        <!-- 统计卡片 -->
        <view class="stats-grid">
            <view class="stat-card total">
                <view class="stat-icon">📋</view>
                <view class="stat-info">
                    <text class="stat-number">{{ stats.total }}</text>
                    <text class="stat-label">总任务</text>
                </view>
            </view>
            <view class="stat-card pending">
                <view class="stat-icon">⏳</view>
                <view class="stat-info">
                    <text class="stat-number">{{ stats.pending }}</text>
                    <text class="stat-label">待开始</text>
                </view>
            </view>
            <view class="stat-card progress">
                <view class="stat-icon">🔧</view>
                <view class="stat-info">
                    <text class="stat-number">{{ stats.inProgress }}</text>
                    <text class="stat-label">进行中</text>
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

        <!-- 任务列表 -->
        <view class="task-list">
            <view v-if="loading" class="loading">
                <text>加载中...</text>
            </view>
            <view v-else-if="filteredTasks.length === 0" class="empty">
                <text>暂无任务</text>
            </view>
            <view v-else>
                <view 
                    v-for="task in filteredTasks" 
                    :key="task.requestId"
                    class="task-item"
                >
                    <view class="task-header">
                        <view class="task-info">
                            <text class="appliance-type">{{ task.applianceType }}</text>
                            <text class="appliance-model">{{ task.applianceModel }}</text>
                        </view>
                        <text :class="['task-status', getStatusClass(task.requestStatus)]">{{ getStatusText(task.requestStatus) }}</text>
                    </view>
                    
                    <view class="task-content">
                        <text class="user-info">用户：{{ task.userAccount }}</text>
                        <text class="problem-desc">问题：{{ task.problemDescription.substring(0, 50) }}...</text>
                        <text class="assign-time">分配时间：{{ formatTime(task.assignedAt) }}</text>
                        <text v-if="task.completedAt" class="complete-time">完成时间：{{ formatTime(task.completedAt) }}</text>
                    </view>
                    
                    <view class="task-actions">
                        <button class="detail-btn" @click="viewTaskDetail(task)">查看详情</button>
                        <button 
                            v-if="task.requestStatus === 'assigned' || task.requestStatus === 'in_progress'" 
                            class="complete-btn" 
                            @click="completeTask(task)"
                        >
                            完成任务
                        </button>
                    </view>
                </view>
            </view>
        </view>

        <!-- 任务详情弹窗 -->
        <view v-if="showDetail" class="detail-modal" @click="closeDetailModal">
            <view class="detail-content" @click.stop>
                <view class="detail-header">
                    <text class="detail-title">任务详情</text>
                    <text class="close-btn" @click="closeDetailModal">×</text>
                </view>
                
                <view class="detail-info">
                    <view class="info-section">
                        <text class="section-title">基本信息</text>
                        <view class="info-item">
                            <text class="info-label">家电类型：</text>
                            <text class="info-value">{{ selectedTask?.applianceType }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">家电型号：</text>
                            <text class="info-value">{{ selectedTask?.applianceModel }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">问题描述：</text>
                            <text class="info-value">{{ selectedTask?.problemDescription }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">任务状态：</text>
                            <text :class="['info-value', getStatusClass(selectedTask?.requestStatus)]">{{ getStatusText(selectedTask?.requestStatus) }}</text>
                        </view>
                    </view>
                    
                    <view class="info-section">
                        <text class="section-title">用户信息</text>
                        <view class="info-item">
                            <text class="info-label">用户账号：</text>
                            <text class="info-value">{{ selectedTask?.userAccount }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">提交时间：</text>
                            <text class="info-value">{{ formatTime(selectedTask?.createdAt) }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">分配时间：</text>
                            <text class="info-value">{{ formatTime(selectedTask?.assignedAt) }}</text>
                        </view>
                        <view v-if="selectedTask?.completedAt" class="info-item">
                            <text class="info-label">完成时间：</text>
                            <text class="info-value">{{ formatTime(selectedTask?.completedAt) }}</text>
                        </view>
                    </view>
                    
                    <!-- 问题图片 -->
                    <view v-if="selectedTask?.evidenceImages && selectedTask.evidenceImages.length > 0" class="info-section">
                        <text class="section-title">问题图片</text>
                        <view class="evidence-images">
                            <image 
                                v-for="(img, index) in selectedTask.evidenceImages" 
                                :key="index"
                                :src="img" 
                                class="evidence-img"
                                @click="previewImage(img, selectedTask.evidenceImages)"
                            />
                        </view>
                    </view>
                </view>
                
                <!-- 详情页面的操作按钮 -->
                <view class="detail-actions">
                    <button 
                        v-if="selectedTask?.requestStatus === 'assigned' || selectedTask?.requestStatus === 'in_progress'" 
                        class="complete-task-btn" 
                        @click="completeTaskFromDetail"
                        :disabled="completing"
                    >
                        {{ completing ? '完成中...' : '完成任务' }}
                    </button>
                </view>
            </view>
        </view>

        <!-- 确认弹窗 -->
        <view v-if="showConfirm" class="confirm-modal" @click="closeConfirmModal">
            <view class="confirm-content" @click.stop>
                <view class="confirm-header">
                    <text class="confirm-title">{{ confirmData.title }}</text>
                </view>
                
                <view class="confirm-body">
                    <text class="confirm-message">{{ confirmData.message }}</text>
                </view>
                
                <view class="confirm-actions">
                    <button class="cancel-btn" @click="closeConfirmModal">取消</button>
                    <button 
                        :class="['confirm-btn', confirmData.type]"
                        @click="handleConfirm"
                        :disabled="confirming"
                    >
                        {{ confirming ? '处理中...' : '确认' }}
                    </button>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTechnicianTasks, completeRepairTask } from '@/api/repairAPI'
import {useUserStore} from "@/store";

// 数据状态
const loading = ref(false)
const completing = ref(false)
const confirming = ref(false)
const tasks = ref([])
const activeFilter = ref('all')

// 弹窗状态
const showDetail = ref(false)
const showConfirm = ref(false)
const selectedTask = ref(null)
const confirmData = ref({
    title: '',
    message: '',
    type: '',
    action: null
})

// 筛选器配置
const filters = computed(() => {
    const taskCounts = tasks.value.reduce((acc, task) => {
        acc[task.requestStatus] = (acc[task.requestStatus] || 0) + 1
        return acc
    }, {})
    
    return [
        { name: '全部', value: 'all', count: tasks.value.length },
        { name: '待开始', value: 'assigned', count: taskCounts.assigned || 0 },
        { name: '进行中', value: 'in_progress', count: taskCounts.in_progress || 0 },
        { name: '已完成', value: 'completed', count: taskCounts.completed || 0 }
    ]
})

// 统计信息
const stats = computed(() => {
    const taskCounts = tasks.value.reduce((acc, task) => {
        acc.total++
        if (task.requestStatus === 'assigned') acc.pending++
        if (task.requestStatus === 'in_progress') acc.inProgress++
        if (task.requestStatus === 'completed') acc.completed++
        return acc
    }, { total: 0, pending: 0, inProgress: 0, completed: 0 })
    
    return taskCounts
})

// 过滤后的任务列表
const filteredTasks = computed(() => {
    if (activeFilter.value === 'all') {
        return tasks.value
    }
    return tasks.value.filter(task => task.requestStatus === activeFilter.value)
})

// 切换筛选器
const switchFilter = (filter) => {
    activeFilter.value = filter
}

// 加载任务列表
const loadTasks = async () => {
    loading.value = true
    try {
        const res = await getTechnicianTasks({technicianAccount:useUserStore().getUser().account})
        if (res.code === 200) {
            tasks.value = res.data || []
        }
    } catch (error) {
        console.error('加载任务失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 查看任务详情
const viewTaskDetail = (task) => {
    selectedTask.value = task
    showDetail.value = true
}

// 关闭详情弹窗
const closeDetailModal = () => {
    showDetail.value = false
    selectedTask.value = null
}



// 完成任务
const completeTask = (task) => {
    confirmData.value = {
        title: '完成任务',
        message: `确认完成 ${task.applianceType}（${task.applianceModel}）的维修任务吗？`,
        type: 'complete',
        action: () => executeCompleteTask(task.requestId)
    }
    showConfirm.value = true
}

// 从详情页完成任务
const completeTaskFromDetail = () => {
    confirmData.value = {
        title: '完成任务',
        message: `确认完成 ${selectedTask.value.applianceType}（${selectedTask.value.applianceModel}）的维修任务吗？`,
        type: 'complete',
        action: () => executeCompleteTask(selectedTask.value.requestId)
    }
    showConfirm.value = true
}

// 执行完成任务
const executeCompleteTask = async (requestId) => {
    completing.value = true
    confirming.value = true
    try {
        const res = await completeRepairTask(requestId )
        closeConfirmModal()
        if (res.code === 200) {
            // 更新本地数据
            const taskIndex = tasks.value.findIndex(t => t.requestId === requestId)
            if (taskIndex !== -1) {
                tasks.value[taskIndex].requestStatus = 'completed'
                tasks.value[taskIndex].completedAt = new Date().toISOString()
            }
            
            // 如果在详情页，也更新选中的任务
            if (selectedTask.value && selectedTask.value.requestId === requestId) {
                selectedTask.value.requestStatus = 'completed'
                selectedTask.value.completedAt = new Date().toISOString()
            }
            
            uni.showToast({
                title: '任务已完成',
                icon: 'success'
            })
        }else{
            uni.showToast({
                title:res.msg,
                icon:'error'
            })
        }
    } catch (error) {
        console.error('完成任务失败:', error)
        uni.showToast({
            title: '操作失败',
            icon: 'none'
        })
    } finally {
        completing.value = false
        confirming.value = false
    }
}

// 关闭确认弹窗
const closeConfirmModal = () => {
    showConfirm.value = false
    confirmData.value = {
        title: '',
        message: '',
        type: '',
        action: null
    }
}

// 处理确认操作
const handleConfirm = () => {
    if (confirmData.value.action) {
        confirmData.value.action()
    }
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
        'assigned': '待开始',
        'in_progress': '进行中',
        'completed': '已完成'
    }
    return statusMap[status] || status
}

// 获取状态样式类
const getStatusClass = (status) => {
    const classMap = {
        'assigned': 'status-assigned',
        'in_progress': 'status-progress',
        'completed': 'status-completed'
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
    loadTasks()
})
</script>

<style scoped>
.technician-tasks {
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
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
    font-size: 28px;
    margin-right: 12px;
}

.stat-info {
    flex: 1;
}

.stat-number {
    display: block;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 12px;
    color: #666;
}

.total .stat-number {
    color: #667eea;
}

.pending .stat-number {
    color: #f39c12;
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
    min-width: 70px;
    text-align: center;
    padding: 8px 12px;
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

/* 任务列表 */
.task-list {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.loading, .empty {
    text-align: center;
    padding: 50px 0;
    color: #999;
}

.task-item {
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.task-item:last-child {
    border-bottom: none;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

.task-info {
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

.task-status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    color: white;
    font-weight: 500;
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

.task-content {
    margin-bottom: 15px;
}

.user-info, .problem-desc, .assign-time, .complete-time {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
}

.task-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.detail-btn, .start-btn, .complete-btn {
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

.start-btn {
    background: #28a745;
    color: white;
}

.complete-btn {
    background: #17a2b8;
    color: white;
}

/* 弹窗样式 */
.detail-modal, .confirm-modal {
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

.detail-content, .confirm-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
}

.detail-header, .confirm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
}

.detail-title, .confirm-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.close-btn {
    font-size: 24px;
    color: #999;
    cursor: pointer;
}

/* 详情信息 */
.detail-info {
    padding: 0 20px;
    margin-bottom: 20px;
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

/* 详情操作按钮 */
.detail-actions {
    padding: 0 20px 20px;
    display: flex;
    gap: 10px;
}

.start-task-btn, .complete-task-btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    color: white;
    font-weight: 500;
}

.start-task-btn {
    background: #28a745;
}

.complete-task-btn {
    background: #17a2b8;
}

.start-task-btn:disabled, .complete-task-btn:disabled {
    opacity: 0.6;
}

/* 确认弹窗 */
.confirm-content {
    max-height: none;
    overflow: visible;
}

.confirm-header {
    justify-content: center;
    border-bottom: none;
    margin-bottom: 10px;
}

.confirm-body {
    padding: 0 20px 20px;
    text-align: center;
}

.confirm-message {
    font-size: 16px;
    color: #333;
    line-height: 1.5;
}

.confirm-actions {
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

.confirm-btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    color: white;
    font-weight: 500;
}

.confirm-btn.start {
    background: #28a745;
}

.confirm-btn.complete {
    background: #17a2b8;
}

.confirm-btn:disabled {
    opacity: 0.6;
}
</style>