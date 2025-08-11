<template>
    <view class="announcements-management">
        <!-- 页面标题 -->
        <view class="page-header">
            <text class="page-title">公告管理</text>
            <button class="btn-primary" @click="showCreateModal = true">发布公告</button>
        </view>

        <!-- 公告列表 -->
        <view class="announcements-list">
            <view v-if="loading" class="loading">加载中...</view>
            <view v-else-if="error" class="error">{{ error }}</view>
            <view v-else>
                <view 
                    v-for="announcement in announcements" 
                    :key="announcement.announcementId"
                    class="announcement-item"
                >
                    <view class="announcement-header">
                        <text class="announcement-title">{{ announcement.title }}</text>
                        <text class="announcement-date">{{ formatDate(announcement.createdAt) }}</text>
                    </view>
                    <view class="announcement-content">{{ announcement.content }}</view>
                    <view v-if="announcement.images && announcement.images.length > 0" class="announcement-images">
                        <image 
                            v-for="(image, index) in announcement.images" 
                            :key="index"
                            :src="imgBaseUrl + image" 
                            class="announcement-image"
                            mode="aspectFill"
                            @click="previewImage(image, announcement.images)"
                        />
                    </view>
                    <view class="announcement-actions">
                        <button class="btn-edit" @click="editAnnouncement(announcement)">编辑</button>
                        <button class="btn-delete" @click="deleteAnnouncement(announcement.announcementId)">删除</button>
                    </view>
                </view>
            </view>
        </view>

        <!-- 创建/编辑公告弹窗 -->
        <view v-if="showCreateModal" class="modal-overlay" @click="closeModal">
            <view class="modal-content" @click.stop>
                <view class="modal-header">
                    <text class="modal-title">{{ isEditing ? '编辑公告' : '发布公告' }}</text>
                    <text class="modal-close" @click="closeModal">×</text>
                </view>
                <view class="modal-body">
                    <view class="form-group">
                        <label>公告标题</label>
                        <input 
                            type="text" 
                            v-model="announcementForm.title" 
                            placeholder="请输入公告标题"
                            class="form-input"
                        />
                    </view>
                    <view class="form-group">
                        <label>公告内容</label>
                        <textarea 
                            v-model="announcementForm.content"
                            placeholder="请输入公告内容"
                            class="form-textarea"
                            rows="6"
                        ></textarea>
                    </view>
                    <view class="form-group">
                        <label>公告图片</label>
                        <ImgUploader 
                            v-model:img-src="announcementForm.images"
                            :max-count="5"
                            :is-preview="true"
                        />
                    </view>
                </view>
                <view class="modal-footer">
                    <button class="btn-cancel" @click="closeModal">取消</button>
                    <button class="btn-confirm" @click="submitAnnouncement" :disabled="submitting">
                        {{ submitting ? '提交中...' : (isEditing ? '更新' : '发布') }}
                    </button>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncementAPI } from '@/api/adminAPI'
import { imgBaseUrl } from '@/util/basic-data'
import ImgUploader from '@/components/ImgUploader/ImgUploader.vue'

// 数据状态
const loading = ref(false)
const error = ref('')
const announcements = ref([])
const showCreateModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)

// 公告表单
const announcementForm = reactive({
    announcementId: '',
    title: '',
    content: '',
    images: []
})

// 获取公告列表
const fetchAnnouncements = async () => {
    loading.value = true
    error.value = ''
    try {
        const res = await getAllAnnouncements()
        if (res.code === 200) {
            announcements.value = res.data || []
        } else {
            error.value = res.msg || '获取公告列表失败'
        }
    } catch (err) {
        error.value = '获取公告列表失败：' + (err.message || '未知错误')
        console.error('获取公告列表失败:', err)
    } finally {
        loading.value = false
    }
}

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
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

// 编辑公告
const editAnnouncement = (announcement) => {
    isEditing.value = true
    announcementForm.announcementId = announcement.announcementId
    announcementForm.title = announcement.title
    announcementForm.content = announcement.content
    announcementForm.images = announcement.images || []
    showCreateModal.value = true
}

// 关闭弹窗
const closeModal = () => {
    showCreateModal.value = false
    isEditing.value = false
    // 重置表单
    announcementForm.announcementId = ''
    announcementForm.title = ''
    announcementForm.content = ''
    announcementForm.images = []
}

// 提交公告
const submitAnnouncement = async () => {
    if (!announcementForm.title.trim()) {
        uni.showToast({
            title: '请输入公告标题',
            icon: 'none'
        })
        return
    }
    
    if (!announcementForm.content.trim()) {
        uni.showToast({
            title: '请输入公告内容',
            icon: 'none'
        })
        return
    }
    
    submitting.value = true
    try {
        const data = {
            title: announcementForm.title,
            content: announcementForm.content,
            images: announcementForm.images
        }
        
        let res
        if (isEditing.value) {
            data.announcementId = announcementForm.announcementId
            res = await updateAnnouncement(data)
        } else {
            res = await createAnnouncement(data)
        }
        
        if (res.code === 200) {
            uni.showToast({
                title: isEditing.value ? '更新成功' : '发布成功',
                icon: 'success'
            })
            closeModal()
            await fetchAnnouncements()
        } else {
            uni.showToast({
                title: res.msg || (isEditing.value ? '更新失败' : '发布失败'),
                icon: 'none'
            })
        }
    } catch (err) {
        console.error('提交公告失败:', err)
        uni.showToast({
            title: (isEditing.value ? '更新失败' : '发布失败') + '：' + (err.message || '未知错误'),
            icon: 'none'
        })
    } finally {
        submitting.value = false
    }
}

// 删除公告
const deleteAnnouncement = (announcementId) => {
    uni.showModal({
        title: '确认删除',
        content: '确定要删除这条公告吗？删除后无法恢复。',
        success: async (res) => {
            if (res.confirm) {
                try {
                    const result = await deleteAnnouncementAPI(announcementId)
                    if (result.code === 200) {
                        uni.showToast({
                            title: '删除成功',
                            icon: 'success'
                        })
                        await fetchAnnouncements()
                    } else {
                        uni.showToast({
                            title: result.msg || '删除失败',
                            icon: 'none'
                        })
                    }
                } catch (err) {
                    console.error('删除公告失败:', err)
                    uni.showToast({
                        title: '删除失败：' + (err.message || '未知错误'),
                        icon: 'none'
                    })
                }
            }
        }
    })
}

// 页面加载时获取公告列表
onMounted(() => {
    fetchAnnouncements()
})
</script>

<style scoped>
.announcements-management {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.page-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.btn-primary {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}

.btn-primary:hover {
    background-color: #0056b3;
}

.announcements-list {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading, .error {
    text-align: center;
    padding: 40px;
    color: #666;
}

.error {
    color: #f56565;
}

.announcement-item {
    border-bottom: 1px solid #eee;
    padding: 20px 0;
}

.announcement-item:last-child {
    border-bottom: none;
}

.announcement-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.announcement-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.announcement-date {
    color: #666;
    font-size: 14px;
}

.announcement-content {
    color: #555;
    line-height: 1.6;
    margin-bottom: 15px;
}

.announcement-images {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

.announcement-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    cursor: pointer;
}

.announcement-actions {
    display: flex;
    gap: 10px;
}

.btn-edit {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.btn-delete {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.btn-edit:hover {
    background-color: #218838;
}

.btn-delete:hover {
    background-color: #c82333;
}

/* 弹窗样式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 900;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.modal-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.modal-close {
    font-size: 24px;
    cursor: pointer;
    color: #999;
}

.modal-close:hover {
    color: #333;
}

.modal-body {
    padding: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #333;
}

.form-input, .form-textarea {
    width: 95%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.form-input:focus, .form-textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-textarea {
    resize: vertical;
    min-height: 120px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #eee;
}

.btn-cancel {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}

.btn-confirm {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}

.btn-cancel:hover {
    background-color: #5a6268;
}

.btn-confirm:hover {
    background-color: #0056b3;
}

.btn-confirm:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
}
</style>