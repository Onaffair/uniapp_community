<!-- #ifdef H5 -->
<template>
    <div class="activities-management">
        <!-- 导航标签页 -->
        <div class="tab-navigation">
            <div class="tab-item" :class="{ active: currentTab === 'management' }" @click="currentTab = 'management'">
                活动管理
            </div>
            <div class="tab-item" :class="{ active: currentTab === 'review' }" @click="currentTab = 'review'">
                活动审核
            </div>
        </div>

        <!-- 活动管理页面 -->
        <div v-if="currentTab === 'management'">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
                加载中...
            </div>

            <!-- 错误提示 -->
            <div v-if="error" class="error-state">
                {{ error }}
            </div>

            <!-- 活动列表 -->
            <template v-if="!loading && !error">
            <div class="action-bar">
                <div class="search-box">
                    <input type="text" v-model="searchTerm" placeholder="搜索活动...">
                    <button @click="searchActivities" size="mini" style="height: 95%">搜索</button>
                </div>
                <div class="filters">
                    <select v-model="statusFilter" class="status-filter">
                        <option value="all">所有状态</option>
                        <option v-for="status in activityStatusList" :key="status.id" :value="status.id">
                            {{ status.name }}
                        </option>
                    </select>
                    <select v-model="categoryFilter" class="category-filter">
                        <option value="all">所有分类</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </option>
                    </select>
                    <select v-model="cityFilter" class="city-filter">
                        <option value="all">所有城市</option>
                        <option v-for="city in cities" :key="city.id" :value="city.id">
                            {{ city.name }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="activities-table">
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>标题</th>
                        <th>组织者</th>
                        <th>分类</th>
                        <th>城市</th>
                        <th>开始时间</th>
                        <th>结束时间</th>
                        <th>参与人数</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="activity in paginatedActivities" :key="activity.id">
                        <td>{{ activity.id }}</td>
                        <td>{{ activity.title }}</td>
                        <td>{{ activity.organizer }}</td>
                        <td>{{ getCategoryName(activity.categoryId) }}</td>
                        <td>{{ getCityName(activity.cityId) }}</td>
                        <td>{{ formatDateTime(activity.beginTime) }}</td>
                        <td>{{ formatDateTime(activity.endTime) }}</td>
                        <td>{{ activity.joinNum }}/{{ activity.mostJoinNum }}</td>
                        <td>
                <span class="status-badge" :class="getStatusClass(activity.status)">
                  {{ getStatusText(activity.status) }}
                </span>
                        </td>
                        <td>
                            <div class="actions">
                                <button class="view-btn" @click="viewActivity(activity)">查看</button>
                                <button class="edit-btn" @click="editActivity(activity)">编辑</button>
                                <template
                                    v-if="activity.status === 1 || activity.status === 2 || activity.status === 3 || activity.status === 4">
                                    <button class="ban-btn" @click="toggleActivityStatus(activity, 5)">
                                        结束活动
                                    </button>
                                </template>
                                <template v-else-if="activity.status === 5">
                                    <button class="activate-btn" @click="toggleActivityStatus(activity, 2)">
                                        重新开放
                                    </button>
                                </template>
                                <template v-if="activity.status !== 6">
                                    <button class="cancel-btn" @click="toggleActivityStatus(activity, 6)">
                                        取消活动
                                    </button>
                                </template>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
                <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
                <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</button>
            </div>
        </template>

        <!-- 活动详情弹窗 -->
        <div class="modal" v-if="showActivityModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>{{ currentActivity.title }} 的详细信息</h3>
                    <span class="close-btn" @click="showActivityModal = false">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="activity-detail-item">
                        <strong>ID:</strong> {{ currentActivity.id }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>标题:</strong> {{ currentActivity.title }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>组织者:</strong> {{ currentActivity.organizer }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>活动分类:</strong> {{ getCategoryName(currentActivity.categoryId) }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>开始时间:</strong> {{ formatDateTime(currentActivity.beginTime) }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>结束时间:</strong> {{ formatDateTime(currentActivity.endTime) }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>参与人数:</strong> {{ currentActivity.joinNum }}/{{ currentActivity.mostJoinNum }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>收藏数:</strong> {{ currentActivity.collectNum }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>评分:</strong> {{ currentActivity.rating }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>城市:</strong> {{ getCityName(currentActivity.cityId) }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>地址:</strong> {{
                            currentActivity.address ? currentActivity.address.split('|')[0] : '暂无'
                        }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>亮点:</strong> {{ currentActivity.highlight }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>内容:</strong> {{ currentActivity.content }}
                    </div>
                    <div class="activity-detail-item">
                        <strong>状态:</strong>
                        <span class="status-badge" :class="getStatusClass(currentActivity.status)">
              {{ getStatusText(currentActivity.status) }}
            </span>
                    </div>
                    <div class="activity-detail-item" v-if="currentActivity.images && currentActivity.images.length">
                        <strong>活动图片:</strong>
                        <div class="activity-images">
                            <img
                                v-for="(image, index) in currentActivity.images"
                                :key="index"
                                :src="image"
                                :alt="`活动图片 ${index + 1}`"
                                @click="previewImage(image)"
                            >
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="showActivityModal = false">关闭</button>
                </div>
            </div>
        </div>

        <!-- 编辑活动弹窗 -->
        <div class="modal" v-if="showEditModal">
            <div class="modal-content edit-modal">
                <div class="modal-header">
                    <h3>编辑活动</h3>
                    <span class="close-btn" @click="showEditModal = false">&times;</span>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="saveActivityEdit">
                        <div class="form-group">
                            <label for="editTitle">标题:</label>
                            <input
                                type="text"
                                id="editTitle"
                                v-model="editingActivity.title"
                                required
                                class="form-control"
                            >
                        </div>
                        <div class="form-group">
                            <label for="editOrganizer">组织者:</label>
                            <input
                                type="text"
                                id="editOrganizer"
                                v-model="editingActivity.organizer"
                                required
                                class="form-control"
                            >
                        </div>
                        <div class="form-group">
                            <label for="editCategory">活动分类:</label>
                            <select
                                id="editCategory"
                                v-model="editingActivity.categoryId"
                                class="form-control"
                                required
                            >
                                <option :value="null" disabled>请选择活动分类</option>
                                <option v-for="category in categories"
                                        :key="category.id"
                                        :value="category.id"
                                >
                                    {{ category.name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editCity">城市:</label>
                            <select
                                id="editCity"
                                v-model="editingActivity.cityId"
                                class="form-control"
                                required
                            >
                                <option :value="null" disabled>请选择城市</option>
                                <option v-for="city in cities"
                                        :key="city.id"
                                        :value="city.id"
                                >
                                    {{ city.name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editBeginTime">开始时间:</label>
                            <input
                                type="datetime-local"
                                id="editBeginTime"
                                v-model="editingActivity.beginTime"
                                required
                                class="form-control"
                            >
                        </div>
                        <div class="form-group">
                            <label for="editEndTime">结束时间:</label>
                            <input
                                type="datetime-local"
                                id="editEndTime"
                                v-model="editingActivity.endTime"
                                required
                                class="form-control"
                            >
                        </div>
                        <div class="form-group">
                            <label for="editMostJoinNum">最大参与人数:</label>
                            <input
                                type="number"
                                id="editMostJoinNum"
                                v-model="editingActivity.mostJoinNum"
                                required
                                min="1"
                                class="form-control"
                            >
                        </div>
                        <div class="form-group">
                            <label for="editAddress">地址:</label>
                            <input
                                type="text"
                                id="editAddress"
                                v-model="editingActivity.address"
                                required
                                class="form-control"
                            >
                        </div>
                        <div class="form-group">
                            <label for="editHighlight">亮点:</label>
                            <textarea
                                id="editHighlight"
                                v-model="editingActivity.highlight"
                                required
                                class="form-control"
                                rows="3"
                            ></textarea>
                        </div>
                        <div class="form-group">
                            <label for="editContent">内容:</label>
                            <textarea
                                id="editContent"
                                v-model="editingActivity.content"
                                required
                                class="form-control"
                                rows="5"
                            ></textarea>
                        </div>
                        <div class="form-group">
                            <label for="editStatus">状态:</label>
                            <select
                                id="editStatus"
                                v-model="editingActivity.status"
                                class="form-control"
                            >
                                <option v-for="status in activityStatusList" :key="status.id" :value="status.id">
                                    {{ status.name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>活动图片:</label>
                            <ImgUploader
                                v-model:imgSrc="editingActivity.images"
                                :maxCount="4"
                                :isPreview="true"
                            />
                            <div class="upload-tip">最多上传4张图片</div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="save-btn" @click="saveActivityEdit">保存</button>
                    <button @click="showEditModal = false">取消</button>
                </div>
            </div>
        </div>
    </div>
        
        <!-- 活动审核页面 -->
        <div v-if="currentTab === 'review'">
            <!-- 加载状态 -->
            <div v-if="reviewLoading" class="loading-state">
                加载中...
            </div>

            <!-- 错误提示 -->
            <div v-if="reviewError" class="error-state">
                {{ reviewError }}
            </div>

            <!-- 待审核活动列表 -->
            <template v-if="!reviewLoading && !reviewError">
                <div class="review-header">
                    <div class="header-content">
                        <div class="title-section">
                            <h3>待审核活动列表</h3>
                            <div class="stats-badge">
                                <span class="count">{{ pendingActivities.length }}</span>
                                <span class="label">待审核</span>
                            </div>
                        </div>
                        <button @click="fetchPendingActivities" class="refresh-btn">
                            <span class="refresh-icon">🔄</span>
                            刷新
                        </button>
                    </div>
                </div>

                <div class="pending-activities-table activities-table">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>标题</th>
                            <th>组织者</th>
                            <th>分类</th>
                            <th>城市</th>
                            <th>开始时间</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="activity in pendingActivities" :key="activity.id">
                            <td><span class="id-badge">{{ activity.id }}</span></td>
                            <td class="title-cell">
                                <div class="activity-title">{{ activity.title }}</div>
                            </td>
                            <td class="organizer-cell">
                                <div class="organizer-info">
                                    <span class="organizer-name">{{ activity.organizer }}</span>
                                </div>
                            </td>
                            <td>
                                <span class="category-tag">{{ getCategoryName(activity.categoryId) }}</span>
                            </td>
                            <td>
                                <span class="city-tag">{{ getCityName(activity.cityId) }}</span>
                            </td>
                            <td class="time-cell">{{ formatDateTime(activity.beginTime) }}</td>
                            <td class="time-cell">{{ formatDateTime(activity.createdAt) }}</td>
                            <td>
                                <div class="review-actions">
                                    <button @click="viewActivityDetail(activity)" class="view-btn" title="查看详情">
                                        <span class="btn-icon">👁️</span>
                                        查看
                                    </button>
                                    <button @click="approve(activity.id)" class="approve-btn" title="通过审核">
                                        <span class="btn-icon">✅</span>
                                        通过
                                    </button>
                                    <button @click="reject(activity.id)" class="reject-btn" title="拒绝审核">
                                        <span class="btn-icon">❌</span>
                                        拒绝
                                    </button>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    
                    <!-- 空状态 -->
                    <div v-if="pendingActivities.length === 0" class="empty-state">
                        <div class="empty-icon">📋</div>
                        <div class="empty-text">暂无待审核的活动</div>
                        <div class="empty-subtext">所有活动都已审核完成</div>
                    </div>
                </div>

                <!-- 分页 -->
                <div class="pagination" v-if="reviewPagination.total > 0">
                    <button 
                        @click="changeReviewPage(reviewPagination.current - 1)" 
                        :disabled="reviewPagination.current <= 1"
                        class="page-btn"
                    >
                        上一页
                    </button>
                    <span class="page-info">
                        第 {{ reviewPagination.current }} 页，共 {{ Math.ceil(reviewPagination.total / reviewPagination.pageSize) }} 页
                    </span>
                    <button 
                        @click="changeReviewPage(reviewPagination.current + 1)" 
                        :disabled="reviewPagination.current >= Math.ceil(reviewPagination.total / reviewPagination.pageSize)"
                        class="page-btn"
                    >
                        下一页
                    </button>
                </div>
            </template>
        </div>
        
        <!-- 活动详情查看模态框 -->
        <div v-if="showDetailModal" class="modal review-modal" @click="showDetailModal = false">
            <div class="modal-content review-detail-modal" @click.stop>
                <div class="modal-header">
                    <div class="header-info">
                        <h3>📋 活动详情审核</h3>
                        <div class="activity-id-badge">ID: {{ viewingActivity.id }}</div>
                    </div>
                    <button @click="showDetailModal = false" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="detail-grid">
                        <div class="detail-card">
                            <div class="card-header">
                                <span class="card-icon">📝</span>
                                <h4>基本信息</h4>
                            </div>
                            <div class="detail-item">
                                <label>活动标题:</label>
                                <span class="value-text">{{ viewingActivity.title }}</span>
                            </div>
                            <div class="detail-item">
                                <label>组织者:</label>
                                <span class="value-text organizer-name">{{ viewingActivity.organizer }}</span>
                            </div>
                            <div class="detail-item">
                                <label>活动分类:</label>
                                <span class="category-badge">{{ getCategoryName(viewingActivity.categoryId) }}</span>
                            </div>
                            <div class="detail-item">
                                <label>活动城市:</label>
                                <span class="city-badge">{{ getCityName(viewingActivity.cityId) }}</span>
                            </div>
                        </div>

                        <div class="detail-card">
                            <div class="card-header">
                                <span class="card-icon">📍</span>
                                <h4>时间地点</h4>
                            </div>
                            <div class="detail-item">
                                <label>活动地址:</label>
                                <span class="value-text address-text">{{ viewingActivity.address }}</span>
                            </div>
                            <div class="detail-item">
                                <label>开始时间:</label>
                                <span class="value-text time-text">{{ formatDateTime(viewingActivity.beginTime) }}</span>
                            </div>
                            <div class="detail-item">
                                <label>结束时间:</label>
                                <span class="value-text time-text">{{ formatDateTime(viewingActivity.endTime) }}</span>
                            </div>
                            <div class="detail-item">
                                <label>人数限制:</label>
                                <span class="value-text participant-count">{{ viewingActivity.leastJoinNum }} - {{ viewingActivity.mostJoinNum }}人</span>
                            </div>
                        </div>

                        <div class="detail-card full-width">
                            <div class="card-header">
                                <span class="card-icon">📄</span>
                                <h4>活动内容</h4>
                            </div>
                            <div class="content-section">
                                <div class="content-text">{{ viewingActivity.content }}</div>
                            </div>
                        </div>

                        <div class="detail-card full-width" v-if="viewingActivity.images && viewingActivity.images.length > 0">
                            <div class="card-header">
                                <span class="card-icon">🖼️</span>
                                <h4>活动图片</h4>
                                <span class="image-count">({{ viewingActivity.images.length }}张)</span>
                            </div>
                            <div class="images-gallery">
                                <div v-for="(image, index) in viewingActivity.images" :key="index" class="image-item">
                                    <img :src="image" :alt="`活动图片 ${index + 1}`" class="activity-image" @click="previewImage(image)">
                                    <div class="image-overlay">
                                        <span class="preview-text">点击预览</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer review-footer">
                    <div class="footer-actions">
                        <button @click="approve(viewingActivity.id)" class="approve-btn action-btn">
                            <span class="btn-icon">✅</span>
                            <span class="btn-text">通过审核</span>
                        </button>
                        <button @click="reject(viewingActivity.id)" class="reject-btn action-btn">
                            <span class="btn-icon">❌</span>
                            <span class="btn-text">拒绝审核</span>
                        </button>
                        <button @click="showDetailModal = false" class="close-btn action-btn">
                            <span class="btn-icon">🚪</span>
                            <span class="btn-text">关闭</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {
    getAllActivities,
    updateActivityStatus,
    updateActivityInfo,
    getPendingActivities,
    rejectActivity,
    approveActivity
} from '@/api/adminAPI'
import {useActivityStore} from '@/store/activityStore'
import ImgUploader from '@/components/ImgUploader/ImgUploader.vue'

const activityStore = useActivityStore()

// 当前标签页
const currentTab = ref('management')

// 活动数据
const activities = ref([])
const loading = ref(false)
const error = ref(null)

// 活动审核相关数据
const pendingActivities = ref([])
const reviewLoading = ref(false)
const reviewError = ref(null)
const reviewPagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
})

// 活动详情查看
const showDetailModal = ref(false)
const viewingActivity = ref({})

// 从 store 获取城市和类别数据
const cities = computed(() => activityStore.cityList)
const categories = computed(() => activityStore.categoryList)
const activityStatusList = computed(() => activityStore.activityStatusList)

// 搜索和筛选
const searchTerm = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const cityFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10) // 与之前保持一致，或根据参考文件调整为8

// 活动详情弹窗
const showActivityModal = ref(false)
const currentActivity = ref({})

// 活动编辑弹窗
const showEditModal = ref(false)
const editingActivity = ref({
    id: null,
    title: '',
    organizer: '',
    categoryId: null,
    cityId: null,
    beginTime: '',
    endTime: '',
    mostJoinNum: 1,
    address: '',
    highlight: '',
    content: '',
    status: 1,
    images: []
})

// 获取活动列表
const fetchActivities = async () => {
    loading.value = true
    error.value = null
    try {
        // 后端返回的数据结构中时间字段是 beginTime 和 endTime
        const data = await getAllActivities()
        activities.value = data.map(activity => ({
            ...activity,
        }));
    } catch (err) {
        error.value = '获取活动列表失败：' + (err.message || '未知错误')
        console.error('获取活动列表失败:', err)
    } finally {
        loading.value = false
    }
}

// 格式化日期时间 (确保能处理 beginTime 和 endTime)
const formatDateTime = (dateTime) => {
    if (!dateTime) return '暂无'
    return new Date(dateTime).toLocaleString()
}

// 获取城市名称
const getCityName = (cityId) => {
    if (!cityId) return '未知城市';
    const city = activityStore.cityList.find(c => c.id === cityId)
    return city ? city.name : `未知城市(ID:${cityId})`
}

// 获取类别名称
const getCategoryName = (categoryId) => {
    if (!categoryId) return '未分类';
    const category = activityStore.categoryList.find(c => c.id === categoryId)
    return category ? category.name : `未知分类(ID:${categoryId})`
}

// 获取状态文本
const getStatusText = (status) => {
    const statusObj = activityStore.activityStatusList.find(s => s.id === status);
    return statusObj ? statusObj.name : '未知状态';
}

// 获取状态样式类 (可以根据参考文件或自行定义)
const getStatusClass = (status) => {
    const classMap = {
        1: 'waiting',    // 等待报名
        2: 'registering', // 报名中
        3: 'full',       // 报名人数已满
        4: 'ongoing',    // 活动进行中
        5: 'ended',      // 活动已结束
        6: 'cancelled'   // 活动已取消
    };
    return classMap[status] || 'unknown';
}

// 筛选活动列表
const filteredActivities = computed(() => {
    let result = [...activities.value]

    // 搜索条件过滤
    if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        result = result.filter(activity =>
            (activity.title && activity.title.toLowerCase().includes(term)) ||
            (activity.organizer && activity.organizer.toLowerCase().includes(term))
        )
    }

    // 状态过滤
    if (statusFilter.value !== 'all') {
        result = result.filter(activity => activity.status === parseInt(statusFilter.value))
    }

    // 类别过滤
    if (categoryFilter.value !== 'all') {
        result = result.filter(activity => activity.categoryId === parseInt(categoryFilter.value))
    }

    // 城市过滤
    if (cityFilter.value !== 'all') {
        result = result.filter(activity => activity.cityId === parseInt(cityFilter.value))
    }

    return result
})

// 分页后的活动列表
const paginatedActivities = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredActivities.value.slice(start, end)
})

// 计算总页数
const totalPages = computed(() => Math.ceil(filteredActivities.value.length / pageSize.value))

// 搜索活动
const searchActivities = () => {
    currentPage.value = 1
}

// 切换页码
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

// 查看活动详情
const viewActivity = (activity) => {
    currentActivity.value = {...activity}
    showActivityModal.value = true
}

// 编辑活动
const editActivity = (activity) => {
    // 格式化时间为 datetime-local 格式
    const formatDateTimeLocal = (dateTime) => {
        if (!dateTime) return ''
        const date = new Date(dateTime)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    editingActivity.value = {
        id: activity.id,
        title: activity.title,
        organizer: activity.organizer,
        categoryId: activity.categoryId,
        cityId: activity.cityId,
        beginTime: formatDateTimeLocal(activity.beginTime),
        endTime: formatDateTimeLocal(activity.endTime),
        mostJoinNum: activity.mostJoinNum,
        address: activity.address ? activity.address.split('|')[0] : '',
        highlight: activity.highlight,
        content: activity.content,
        status: activity.status,
        images: activity.images || []
    }
    showEditModal.value = true
}

// 保存活动编辑
const saveActivityEdit = async () => {
    try {
        // 验证表单数据
        if (new Date(editingActivity.value.beginTime) >= new Date(editingActivity.value.endTime)) {
            uni.showToast({
                title: '结束时间必须晚于开始时间',
                icon: 'none'
            })
            return
        }

        if (!editingActivity.value.categoryId) {
            uni.showToast({
                title: '请选择活动分类',
                icon: 'none'
            })
            return
        }

        if (!editingActivity.value.cityId) {
            uni.showToast({
                title: '请选择城市',
                icon: 'none'
            })
            return
        }

        // 格式化时间为后端需要的格式（YYYY-MM-DD HH:mm:ss）
        const formatDateTimeForBackend = (dateTimeLocal) => {
            if (!dateTimeLocal) return ''
            // 将 datetime-local 格式 (YYYY-MM-DDTHH:mm) 转换为后端格式 (YYYY-MM-DD HH:mm:ss)
            const date = new Date(dateTimeLocal)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        }

        // 准备要发送的活动数据
        const activityData = {
            id: editingActivity.value.id,
            title: editingActivity.value.title,
            organizer: editingActivity.value.organizer,
            categoryId: parseInt(editingActivity.value.categoryId),
            cityId: parseInt(editingActivity.value.cityId),
            beginTime: formatDateTimeForBackend(editingActivity.value.beginTime),
            endTime: formatDateTimeForBackend(editingActivity.value.endTime),
            mostJoinNum: parseInt(editingActivity.value.mostJoinNum),
            address: editingActivity.value.address,
            highlight: editingActivity.value.highlight,
            content: editingActivity.value.content,
            status: parseInt(editingActivity.value.status),
            images: editingActivity.value.images
        }

        console.log('发送的活动数据:', activityData)

        // 调用后端API更新活动信息
        const result = await updateActivityInfo(activityData)

        if (result === true || (typeof result === 'object' && result.success)) {
            // 更新成功
            // 更新本地数据
            const index = activities.value.findIndex(a => a.id === editingActivity.value.id)
            if (index !== -1) {
                activities.value[index] = {
                    ...activities.value[index],
                    ...activityData
                }
            }

            showEditModal.value = false
            uni.showToast({
                title: `活动 ${editingActivity.value.title} 信息已成功更新`,
                icon: 'success'
            })
        } else {
            // 更新失败
            uni.showToast({
                title: `更新失败：${result.message || '服务器返回异常'}`,
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('更新活动信息失败:', error)
        uni.showToast({
            title: '更新活动信息失败：' + (error.message || '未知错误'),
            icon: 'none'
        })
    }
}


// 切换活动状态 (参考 Vue_preject 进行修改)
const toggleActivityStatus = async (activity, newStatus) => { // newStatus 参数根据按钮逻辑传入
    try {
        const statusText = getStatusText(newStatus);

        uni.showModal({
            title: '确认操作',
            content: `确定要将活动 "${activity.title}" 的状态修改为 "${statusText}" 吗？`,
            success: async (res) => {
                if (res.confirm) {
                    // 调用后端API更新活动状态
                    // 假设 updateActivityStatus API 接受活动ID和新的状态值
                    const result = await updateActivityStatus(activity.id, newStatus)

                    if (result === true || (typeof result === 'object' && result.success)) { // 假设后端成功返回 true 或 {success: true}
                        // 更新本地数据
                        const index = activities.value.findIndex(a => a.id === activity.id)
                        if (index !== -1) {
                            activities.value[index] = {...activities.value[index], status: newStatus}
                        }

                        uni.showToast({
                            title: `活动状态已更新为: ${statusText}`,
                            icon: 'success'
                        })
                    } else {
                        uni.showToast({
                            title: '状态更新失败: ' + (result.message || '请稍后重试'),
                            icon: 'none'
                        })
                    }
                }
            }
        });
    } catch (err) {
        console.error('更新活动状态失败:', err)
        uni.showToast({
            title: '状态更新失败：' + (err.message || '未知错误'),
            icon: 'none'
        })
    }
}

// 预览图片
const previewImage = (url) => {
    // 如果 currentActivity.images 是一个字符串数组
    let imageUrls = currentActivity.value.images;
    if (typeof url === 'string' && imageUrls && Array.isArray(imageUrls)) {
        uni.previewImage({
            urls: imageUrls,
            current: url
        });
    } else {
        console.warn('无法预览图片，数据格式不正确:', currentActivity.value.images);
        uni.showToast({title: '无法预览图片', icon: 'none'});
    }
}

// 获取待审核活动列表
const fetchPendingActivities = async () => {
    try {
        reviewLoading.value = true
        reviewError.value = null
        
        const response = await getPendingActivities({
            page: reviewPagination.value.current,
            pageSize: reviewPagination.value.pageSize
        })
        if (response && response.records) {
            pendingActivities.value = response.records
            reviewPagination.value.total = response.total
        }
    } catch (error) {
        console.error('获取待审核活动失败:', error)
        reviewError.value = '获取待审核活动失败'
        uni.showToast({
            title: '获取待审核活动失败',
            icon: 'none'
        })
    } finally {
        reviewLoading.value = false
    }
}

// 查看活动详情
const viewActivityDetail = (activity) => {
    viewingActivity.value = activity
    showDetailModal.value = true
}

// 审核活动 - 通过
const approve = async (activityId) => {
    try {
        uni.showModal({
            title: '确认操作',
            content: '确定要通过这个活动吗？',
            success: async (res) => {
                if (res.confirm) {
                    const response = await approveActivity(activityId)
                    if (response) {
                        uni.showToast({
                            title: '活动已通过审核',
                            icon: 'success'
                        })
                        await fetchPendingActivities()
                        showDetailModal.value = false
                    }
                }
            }
        })
    } catch (error) {
        console.error('审核活动失败:', error)
        uni.showToast({
            title: '审核失败',
            icon: 'none'
        })
    }
}

// 审核活动 - 拒绝
const reject = async (activityId) => {
    try {
        uni.showModal({
            title: '确认操作',
            content: '确定要拒绝这个活动吗？',
            success: async (res) => {
                if (res.confirm) {
                    const response = await rejectActivity(activityId)
                    if (response) {
                        uni.showToast({
                            title: '活动已被拒绝',
                            icon: 'success'
                        })
                        await fetchPendingActivities()
                        showDetailModal.value = false
                    }
                }
            }
        })
    } catch (error) {
        console.error('审核活动失败:', error)
        uni.showToast({
            title: '审核失败',
            icon: 'none'
        })
    }
}

// 审核分页变化
const onReviewPageChange = (page) => {
    reviewPagination.value.current = page
    fetchPendingActivities()
}

// 在组件挂载时获取数据
onMounted(async () => {
    await fetchActivities()
    await fetchPendingActivities()
})


</script>

<style scoped>
.activities-management {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    padding: 24px;
}

/* Tab导航样式 */
.tab-navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 24px;
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 4px;
    gap: 4px;
}

.tab-item {
    flex: 1;
    max-width: 200px;
    padding: 12px 24px;
    text-align: center;
    cursor: pointer;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    background-color: transparent;
    transition: all 0.3s ease;
    border: none;
    outline: none;
}

.tab-item:hover {
    color: #1890ff;
    background-color: rgba(24, 144, 255, 0.1);
}

.tab-item.active {
    color: #1890ff;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-weight: 600;
}

.action-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.search-box {
    display: flex;
    gap: 10px;
}

.search-box input {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    width: 250px;
}

.search-box button, .filters select {
    padding: 8px 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.filters {
    display: flex;
    gap: 10px;
}

.filters select {
    padding: 8px 12px;
    background-color: white;
    color: #333;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
}

.activities-table table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.activities-table th,
.activities-table td {
    border: 1px solid #e8e8e8;
    padding: 12px 16px;
    text-align: left;
}

.activities-table th {
    background-color: #fafafa;
    font-weight: 500;
}

.actions {
    display: flex;
    gap: 8px;
}

.actions button {
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.view-btn {
    background-color: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
}

.edit-btn {
    background-color: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
}

.ban-btn {
    background-color: #fff1f0;
    color: #ff4d4f;
    border: 1px solid #ffa39e;
}

.cancel-btn {
    background-color: #ffccc7;
    color: #cf1322;
    border: 1px solid #ff7875;
}

.activate-btn {
    background-color: #f9f0ff;
    color: #722ed1;
    border: 1px solid #d3adf7;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 2px;
    font-size: 12px;
    white-space: nowrap;
    display: inline-block;
    min-width: 80px;
    text-align: center;
}

.status-badge.waiting {
    background-color: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
}

.status-badge.registering {
    background-color: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
}

.status-badge.full {
    background-color: #fff7e6;
    color: #fa8c16;
    border: 1px solid #ffd591;
}

.status-badge.ongoing {
    background-color: #f9f0ff;
    color: #722ed1;
    border: 1px solid #d3adf7;
}

.status-badge.ended {
    background-color: #f9f9f9;
    color: #d9d9d9;
    border: 1px solid #f0f0f0;
}

.status-badge.cancelled {
    background-color: #fff1f0;
    color: #ff4d4f;
    border: 1px solid #ffa39e;
}

.status-badge.unknown {
    background-color: #f5f5f5;
    color: #8c8c8c;
    border: 1px solid #d9d9d9;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    gap: 16px;
}

.pagination button {
    padding: 6px 12px;
    background-color: white;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
}

.pagination button:disabled {
    color: #d9d9d9;
    cursor: not-allowed;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

/* 审核模态框特殊样式 */
.review-modal {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(12px);
}

.review-detail-modal {
    max-width: 1000px;
    width: 95%;
    max-height: 90vh;
    background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
    border: 2px solid rgba(99, 102, 241, 0.1);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
    border-radius: 20px;
}

/* 确保uni组件的层级高于模态框 */
:deep(.uni-modal) {
    z-index: 2000 !important;
}

:deep(.uni-image-preview) {
    z-index: 2000 !important;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 80%;
    max-width: 700px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e8e8e8;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.review-detail-modal .modal-header {
    padding: 25px 30px 20px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px 20px 0 0;
    margin-bottom: 0;
}

.header-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.header-info h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-id-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
}

.close-btn {
    font-size: 24px;
    cursor: pointer;
    color: #aaa;
}

.review-detail-modal .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.review-detail-modal .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg) scale(1.1);
}

/* 详情网格布局 */
.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 25px;
}

.detail-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(226, 232, 240, 0.6);
    transition: all 0.3s ease;
}

.detail-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.detail-card.full-width {
    grid-column: 1 / -1;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f1f5f9;
}

.card-icon {
    font-size: 1.2rem;
}

.card-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #334155;
}

.image-count {
    margin-left: auto;
    background: #e0e7ff;
    color: #3730a3;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 12px;
}

.detail-item label {
    font-weight: 600;
    color: #64748b;
    min-width: 80px;
    font-size: 0.9rem;
}

.value-text {
    color: #1e293b;
    font-weight: 500;
    flex: 1;
}

.organizer-name {
    color: #7c3aed;
    font-weight: 600;
}

.category-badge, .city-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.city-badge {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 2px 4px rgba(245, 87, 108, 0.3);
}

.address-text {
    color: #059669;
    font-weight: 500;
}

.time-text {
    color: #dc2626;
    font-weight: 500;
}

.participant-count {
    background: #fef3c7;
    color: #92400e;
    padding: 2px 8px;
    border-radius: 8px;
    font-weight: 600;
}

.content-section {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    border-left: 4px solid #3b82f6;
}

.content-text {
    line-height: 1.6;
    color: #374151;
    font-size: 0.95rem;
}

/* 图片画廊样式 */
.images-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
}

.image-item {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 1;
    cursor: pointer;
    transition: all 0.3s ease;
}

.image-item:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.activity-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s ease;
}

.image-item:hover .image-overlay {
    opacity: 1;
}

.preview-text {
    color: white;
    font-size: 0.8rem;
    font-weight: 500;
    text-align: center;
}

.modal-body .activity-detail-item {
    margin-bottom: 15px;
    font-size: 14px;
}

.modal-body .activity-detail-item strong {
    font-weight: 500;
    margin-right: 8px;
    color: #333;
}

.activity-images {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

.activity-images img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid #eee;
}

.modal-footer {
    text-align: right;
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #e8e8e8;
}

/* 审核页脚样式 */
.review-footer {
    background: #f8fafc;
    border-top: 1px solid rgba(226, 232, 240, 0.8);
    border-radius: 0 0 20px 20px;
    padding: 20px 30px;
    margin-top: 0;
}

.footer-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.approve-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
}

.approve-btn:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.reject-btn {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
}

.reject-btn:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.action-btn.close-btn {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    color: white;
}

.action-btn.close-btn:hover {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
}

.btn-icon {
    font-size: 1rem;
}

.btn-text {
    font-weight: 600;
}

.modal-footer button {
    padding: 8px 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.loading-state, .error-state {
    text-align: center;
    padding: 20px;
    font-size: 16px;
    color: #888;
}

/* 编辑弹窗样式 */
.edit-modal .modal-content {
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}

.form-control {
    width: 100%;
    padding: 8px 12px;
    height: auto;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
}

select.form-control {
    height: 38px;
}

textarea.form-control {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
}

.upload-tip {
    font-size: 12px;
    color: #999;
}

.save-btn {
    background-color: #52c41a !important;
}

.edit-btn {
    background-color: #52c41a;
    color: white;
}

.edit-btn:hover {
    background-color: #73d13d;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .activities-management {
        padding: 10px;
    }

    .tab-navigation {
        padding: 8px;
        gap: 8px;
    }

    .tab-item {
        padding: 8px 12px;
        font-size: 0.9rem;
    }

    .action-bar {
        flex-direction: column;
        gap: 10px;
    }

    .search-box {
        width: 100%;
    }

    .filters {
        flex-direction: column;
        gap: 8px;
    }

    .activities-table {
        font-size: 0.8rem;
    }

    .activities-table th,
    .activities-table td {
        padding: 8px 4px;
    }

    .action-buttons {
        flex-direction: column;
        gap: 4px;
    }

    .action-buttons button {
        padding: 4px 8px;
        font-size: 0.8rem;
    }

    .modal-content {
        width: 95%;
        margin: 10px;
        max-height: 90vh;
    }

    .edit-modal .modal-content {
        width: 95%;
        max-height: 95vh;
    }

    /* 审核模态框响应式 */
    .review-detail-modal {
        width: 98%;
        max-height: 95vh;
    }

    .detail-grid {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 15px;
    }

    .detail-card {
        padding: 15px;
    }

    .card-header h4 {
        font-size: 1rem;
    }

    .detail-item {
        flex-direction: column;
        gap: 4px;
    }

    .detail-item label {
        min-width: auto;
        font-size: 0.85rem;
    }

    .images-gallery {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 8px;
    }

    .footer-actions {
        flex-direction: column;
        gap: 12px;
    }

    .action-btn {
        padding: 10px 20px;
        font-size: 0.9rem;
    }

    .header-info {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
    }

    .header-info h3 {
        font-size: 1.2rem;
    }
}
</style>
<!-- #endif -->