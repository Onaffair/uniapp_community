<template>
    <view class="repair-page">
        <!-- 自定义导航栏 -->
        <view class="custom-navbar">
            <view class="navbar-content">
                <view class="navbar-left" @click="goBack">
                    <text class="back-icon">‹</text>
                </view>
                <view class="navbar-title">我的报修</view>
                <view class="navbar-right"></view>
            </view>
        </view>

        <!-- 标签页切换 -->
        <view class="tab-bar">
            <view 
                v-for="(tab, index) in tabs" 
                :key="index"
                :class="['tab-item', { active: activeTab === index }]"
                @click="switchTab(index)"
            >
                {{ tab.name }}
            </view>
        </view>

        <!-- 内容区域 -->
        <view class="content">
            <!-- 报修历史 -->
            <view v-if="activeTab === 0" class="repair-history">
                <view v-if="loading" class="loading">
                    <text>加载中...</text>
                </view>
                <view v-else-if="repairList.length === 0" class="empty">
                    <text>暂无报修记录</text>
                </view>
                <view v-else>
                    <view 
                        v-for="item in repairList" 
                        :key="item.requestId"
                        class="repair-item"
                        @click="viewDetail(item)"
                    >
                        <view class="item-header">
                            <text class="appliance-type">{{ item.applianceType }}</text>
                            <text :class="['status', getStatusClass(item.requestStatus)]">{{ getStatusText(item.requestStatus) }}</text>
                        </view>
                        <view class="item-content">
                            <text class="model">型号：{{ item.applianceModel }}</text>
                            <text class="time">提交时间：{{ formatTime(item.createdAt) }}</text>
                            <text class="problem">问题：{{ item.problemDescription.substring(0, 50) }}...</text>
                        </view>
                        <view v-if="item.requestStatus === 'completed' && !item.hasReview" class="item-actions">
                            <button class="review-btn" @click.stop="showReviewModal(item)">评价服务</button>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 新建报修 -->
            <view v-if="activeTab === 1" class="new-repair">
                <view class="form">
                    <view class="form-item">
                        <text class="label">家电类型 *</text>
                        <input
                            v-model="repairForm.applianceType"
                            placeholder="请输入家电类型，如：冰箱、洗衣机等"
                        />
                    </view>
                    <view class="form-item">
                        <text class="label">家电型号 *</text>
                        <input 
                            v-model="repairForm.applianceModel"
                            placeholder="请输入家电型号"
                        />
                    </view>
                    
                    <view class="form-item">
                        <text class="label">问题描述 *</text>
                        <textarea 
                            v-model="repairForm.problemDescription" 
                            class="textarea" 
                            placeholder="请详细描述遇到的问题（至少10个字符）"
                            maxlength="500"
                        ></textarea>
                        <text class="char-count">{{ repairForm.problemDescription.length }}/500</text>
                    </view>
                    
                    <view class="form-item">
                        <text class="label">证据图片（最多5张）</text>
                        <ImgUploader 
                            v-model:imgSrc="repairForm.evidenceImages" 
                            :maxCount="5"
                        />
                    </view>
                    
                    <view class="form-actions">
                        <button class="submit-btn" @click="submitRepair" :disabled="submitting">
                            {{ submitting ? '提交中...' : '提交报修' }}
                        </button>
                    </view>
                </view>
            </view>
        </view>

        <!-- 评价弹窗 -->
        <view v-if="showReview" class="review-modal" @click="closeReviewModal">
            <view class="review-content" @click.stop>
                <view class="review-header">
                    <text class="review-title">服务评价</text>
                    <text class="close-btn" @click="closeReviewModal">×</text>
                </view>
                
                <view class="review-form">
                    <view class="rating-section">
                        <text class="rating-label">服务评分</text>
                        <view class="stars">
                            <text 
                                v-for="i in 5" 
                                :key="i"
                                :class="['star', { active: i <= reviewForm.rating }]"
                                @click="setRating(i)"
                            >
                                ★
                            </text>
                        </view>
                    </view>
                    
                    <view class="review-text-section">
                        <text class="review-label">评价内容</text>
                        <textarea 
                            v-model="reviewForm.reviewText" 
                            class="review-textarea" 
                            placeholder="请分享您的服务体验"
                            maxlength="200"
                        ></textarea>
                    </view>
                    
                    <view class="review-image-section">
                        <text class="review-label">评价配图（可选）</text>
                        <ImgUploader 
                            v-model:imgSrc="reviewForm.imageUrl" 
                            :maxCount="1"
                        />
                    </view>
                    
                    <view class="review-actions">
                        <button class="cancel-btn" @click="closeReviewModal">取消</button>
                        <button class="submit-review-btn" @click="submitReview" :disabled="reviewSubmitting">
                            {{ reviewSubmitting ? '提交中...' : '提交评价' }}
                        </button>
                    </view>
                </view>
            </view>
        </view>

        <!-- 详情弹窗 -->
        <view v-if="showDetail" class="detail-modal" @click="closeDetailModal">
            <view class="detail-content" @click.stop>
                <view class="detail-header">
                    <text class="detail-title">报修详情</text>
                    <text class="close-btn" @click="closeDetailModal">×</text>
                </view>
                
                <view class="detail-info">
                    <view class="info-item">
                        <text class="info-label">家电类型：</text>
                        <text class="info-value">{{ selectedItem?.applianceType }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">家电型号：</text>
                        <text class="info-value">{{ selectedItem?.applianceModel }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">问题描述：</text>
                        <text class="info-value">{{ selectedItem?.problemDescription }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">状态：</text>
                        <text :class="['info-value', getStatusClass(selectedItem?.requestStatus)]">{{ getStatusText(selectedItem?.requestStatus) }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">提交时间：</text>
                        <text class="info-value">{{ formatTime(selectedItem?.createdAt) }}</text>
                    </view>
                    <view v-if="selectedItem?.technicianAccount" class="info-item">
                        <text class="info-label">维修员：</text>
                        <text class="info-value">{{ selectedItem?.technicianAccount }}</text>
                    </view>
                    <view v-if="selectedItem?.assignedAt" class="info-item">
                        <text class="info-label">分配时间：</text>
                        <text class="info-value">{{ formatTime(selectedItem?.assignedAt) }}</text>
                    </view>
                    <view v-if="selectedItem?.completedAt" class="info-item">
                        <text class="info-label">完成时间：</text>
                        <text class="info-value">{{ formatTime(selectedItem?.completedAt) }}</text>
                    </view>
                    
                    <!-- 证据图片 -->
                    <view v-if="selectedItem?.evidenceImages && selectedItem.evidenceImages.length > 0" class="info-item">
                        <text class="info-label">证据图片：</text>
                        <view class="evidence-images">
                            <image 
                                v-for="(img, index) in selectedItem.evidenceImages" 
                                :key="index"
                                :src="img" 
                                class="evidence-img"
                                @click="previewImage(img, selectedItem.evidenceImages)"
                            />
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'
import { getUserRepairRequests, submitRepairRequest, submitServiceReview } from '@/api/repairAPI'
import ImgUploader from '@/components/ImgUploader/ImgUploader.vue'

const userStore = useUserStore()

// 标签页
const tabs = [
    { name: '报修历史' },
    { name: '新建报修' }
]
const activeTab = ref(0)

// 数据状态
const loading = ref(false)
const submitting = ref(false)
const reviewSubmitting = ref(false)
const repairList = ref([])

// 新建报修表单
const repairForm = ref({
    applianceType: '',
    applianceModel: '',
    problemDescription: '',
    evidenceImages: [],
    userAccount: userStore.getUser().account
})

// 评价相关
const showReview = ref(false)
const currentRepairItem = ref(null)
const reviewForm = ref({
    requestId: null,
    rating: 5,
    reviewText: '',
    imageUrl: ''
})

// 详情相关
const showDetail = ref(false)
const selectedItem = ref(null)

// 切换标签页
const switchTab = (index) => {
    activeTab.value = index
    if (index === 0) {
        loadRepairHistory()
    }
}

// 加载报修历史
const loadRepairHistory = async () => {
    loading.value = true
    try {
        const res = await getUserRepairRequests({userAccount: userStore.getUser().account})
        if (res.code === 200) {
            repairList.value = res.data || []
        }
    } catch (error) {
        console.error('加载报修历史失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 提交报修
const submitRepair = async () => {
    // 表单验证
    if (!repairForm.value.applianceType.trim()) {
        uni.showToast({
            title: '请输入家电类型',
            icon: 'none'
        })
        return
    }
    
    if (!repairForm.value.applianceModel.trim()) {
        uni.showToast({
            title: '请输入家电型号',
            icon: 'none'
        })
        return
    }
    
    if (!repairForm.value.problemDescription.trim() || repairForm.value.problemDescription.length < 10) {
        uni.showToast({
            title: '问题描述至少需要10个字符',
            icon: 'none'
        })
        return
    }
    
    submitting.value = true
    try {

        const res = await submitRepairRequest(repairForm.value)
        if (res.code === 200) {
            // 重置表单
            repairForm.value = {
                applianceType: '',
                applianceModel: '',
                problemDescription: '',
                evidenceImages: []
            }
            // 切换到历史记录页面
            activeTab.value = 0
            loadRepairHistory()
        }
    } catch (error) {
        console.error('提交报修失败:', error)
    } finally {
        submitting.value = false
    }
}

// 显示评价弹窗
const showReviewModal = (item) => {
    currentRepairItem.value = item
    reviewForm.value = {
        requestId: item.requestId,
        rating: 5,
        reviewText: '',
        imageUrl: ''
    }
    showReview.value = true
}

// 关闭评价弹窗
const closeReviewModal = () => {
    showReview.value = false
    currentRepairItem.value = null
}

// 设置评分
const setRating = (rating) => {
    reviewForm.value.rating = rating
}

// 提交评价
const submitReview = async () => {
    if (!reviewForm.value.reviewText.trim() && !reviewForm.value.imageUrl) {
        uni.showToast({
            title: '请填写评价内容或上传图片',
            icon: 'none'
        })
        return
    }
    reviewSubmitting.value = true
    try {
        const res = await submitServiceReview(reviewForm.value)
        if (res.code === 200) {
            closeReviewModal()
            loadRepairHistory() // 刷新列表
            uni.showToast({
                title:'提交成功，感谢您的评价'
            })
        }
    } catch (error) {
        console.error('提交评价失败:', error)
    } finally {
        reviewSubmitting.value = false
    }
}

// 查看详情
const viewDetail = (item) => {
    selectedItem.value = item
    showDetail.value = true
}

// 关闭详情弹窗
const closeDetailModal = () => {
    showDetail.value = false
    selectedItem.value = null
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

// 返回上一页
const goBack = () => {
    uni.navigateBack()
}

// 页面加载时获取数据
onMounted(() => {
    loadRepairHistory()
})
</script>

<style scoped>
.repair-page {
    min-height: 100vh;
    background-color: #f5f5f5;
}

/* 自定义导航栏 */
.custom-navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding-top: var(--status-bar-height, 44px);
}

.navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    padding: 0 15px;
}

.navbar-left {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.back-icon {
    font-size: 24px;
    color: white;
    font-weight: bold;
}

.navbar-title {
    font-size: 18px;
    font-weight: 600;
    color: white;
}

.navbar-right {
    width: 44px;
}

/* 标签页 */
.tab-bar {
    display: flex;
    background: white;
    border-bottom: 1px solid #eee;
}

.tab-item {
    flex: 1;
    text-align: center;
    padding: 15px 0;
    font-size: 16px;
    color: #666;
    position: relative;
}

.tab-item.active {
    color: #667eea;
    font-weight: 600;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 3px;
    background: #667eea;
    border-radius: 2px;
}

/* 内容区域 */
.content {
    padding: 15px;
}

/* 报修历史 */
.loading, .empty {
    text-align: center;
    padding: 50px 0;
    color: #999;
}

.repair-item {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.appliance-type {
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: white;
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

.item-content {
    margin-bottom: 10px;
}

.model, .time, .problem {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
}

.item-actions {
    text-align: right;
}

.review-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
}

/* 新建报修表单 */
.form {
    background: white;
    border-radius: 8px;
    padding: 20px;
}

.form-item {
    margin-bottom: 20px;
}

.label {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
    font-weight: 600;
}

.textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
}

.textarea {
    min-height: 100px;
    resize: vertical;
}

.char-count {
    display: block;
    text-align: right;
    font-size: 12px;
    color: #999;
    margin-top: 5px;
}

.form-actions {
    margin-top: 30px;
}

.submit-btn {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 15px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
}

.submit-btn:disabled {
    opacity: 0.6;
}

/* 弹窗样式 */
.review-modal, .detail-modal {
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

.review-content, .detail-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
}

.review-header, .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
}

.review-title, .detail-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.close-btn {
    font-size: 24px;
    color: #999;
    cursor: pointer;
}

.review-form {
    padding: 0 20px 20px;
}

.rating-section, .review-text-section, .review-image-section {
    margin-bottom: 20px;
}

.rating-label, .review-label {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 10px;
    font-weight: 600;
}

.stars {
    display: flex;
    gap: 5px;
}

.star {
    font-size: 24px;
    color: #ddd;
    cursor: pointer;
}

.star.active {
    color: #ffd700;
}

.review-textarea {
    width: 100%;
    min-height: 80px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
}

.review-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.cancel-btn {
    padding: 10px 20px;
    border: 1px solid #ddd;
    background: white;
    color: #666;
    border-radius: 6px;
}

.submit-review-btn {
    padding: 10px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
}

.submit-review-btn:disabled {
    opacity: 0.6;
}

/* 详情信息 */
.detail-info {
    padding: 0 20px 20px;
}

.info-item {
    display: flex;
    margin-bottom: 15px;
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
    border-radius: 6px;
    object-fit: cover;
}
</style>