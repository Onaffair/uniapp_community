<!-- #ifdef H5 -->
<template>
    <div class="groups-management">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
            加载中...
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-state">
            {{ error }}
        </div>

        <!-- 群组列表 -->
        <template v-if="!loading && !error">
            <div class="action-bar">
                <div class="search-box">
                    <input type="text" v-model="searchTerm" placeholder="搜索群组...">
                    <button @click="searchGroups">搜索</button>
                </div>
                <div class="filters">
                    <select v-model="statusFilter">
                        <option value="all">所有状态</option>
                        <option value="active">活跃</option>
                        <option value="inactive">非活跃</option>
                        <option value="archived">已归档</option>
                    </select>
                    <select v-model="categoryFilter">
                        <option value="all">所有分类</option>
                        <option value="interest">兴趣爱好</option>
                        <option value="activity">活动群组</option>
                        <option value="study">学习交流</option>
                        <option value="other">其他类型</option>
                    </select>
                </div>
            </div>

            <div class="groups-table">
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>群组名称</th>
                        <th>创建者</th>
                        <th>成员数量</th>
                        <th>分类</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="group in paginatedGroups" :key="group.id">
                        <td>{{ group.id }}</td>
                        <td>{{ group.name }}</td>
                        <td>
                            <div class="user-info">
                  <span v-if="group.creatorAvatar" class="user-avatar-img">
                    <img :src="imgBaseUrl + group.creatorAvatar" alt="头像">
                  </span>
                                <span v-else class="user-avatar">{{ group.creator.charAt(0) }}</span>
                                <span>{{ group.creator }}</span>
                            </div>
                        </td>
                        <td>{{ group.memberCount }}</td>
                        <td>
                <span class="category-badge" :class="group.category">
                  {{ getCategoryText(group.category) }}
                </span>
                        </td>
                        <td>
                <span class="status-badge" :class="group.status">
                  {{ getStatusText(group.status) }}
                </span>
                        </td>
                        <td>
                            <div class="actions">
                                <button class="view-btn" @click="viewGroup(group)">查看</button>
<!--                                </button>-->
                                <button class="delete-btn" @click="deleteGroup(group)">删除</button>
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

        <!-- 群组详情弹窗 -->
        <div class="modal" v-if="showGroupModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>{{ currentGroup.name }}</h3>
                    <span class="close-btn" @click="showGroupModal = false">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="group-detail-item">
                        <strong>群组ID:</strong> {{ currentGroup.id }}
                    </div>
                    <div class="group-detail-item">
                        <strong>群组名称:</strong> {{ currentGroup.name }}
                    </div>
                    <div class="group-detail-item">
                        <strong>创建者:</strong> {{ currentGroup.creator }}
                    </div>
                    <div class="group-detail-item">
                        <strong>分类:</strong> {{ getCategoryText(currentGroup.category) }}
                    </div>
                    <div class="group-detail-item">
                        <strong>成员数量:</strong> {{ currentGroup.memberCount }}
                    </div>
                    <div class="group-detail-item">
                        <strong>状态:</strong> {{ getStatusText(currentGroup.status) }}
                    </div>
                    <div class="group-detail-item">
                        <strong>群组介绍:</strong>
                        <p class="group-description">{{ currentGroup.description }}</p>
                    </div>

                    <div class="members-section">
                        <h4>群组成员</h4>
                        <div class="members-list">
                            <div v-for="(member, index) in currentGroup.members" :key="index" class="member-item">
                <span v-if="member.avatar" class="member-avatar-img">
                  <img :src="imgBaseUrl + member.avatar" alt="头像">
                </span>
                                <span v-else class="member-avatar">{{ member.name.charAt(0) }}</span>
                                <div class="member-info">
                                    <div class="member-name">
                                        {{ member.name }}
                                        <span v-if="member.isOwner" class="owner-badge">群主</span>
                                    </div>
                                    <div class="member-role">{{ member.role === 'admin' ? '管理员' : '成员' }}</div>
                                </div>
                                <button
                                    v-if="member.role !== 'admin' && !member.isOwner"
                                    class="remove-member-btn"
                                    @click="removeMember(currentGroup.id, member.id, member.name)"
                                >
                                    移除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="delete-btn" @click="deleteGroup(currentGroup)">删除</button>
                    <button @click="showGroupModal = false">关闭</button>
                </div>
            </div>
        </div>

        <!-- 删除确认弹窗 -->
        <div class="modal" v-if="showDeleteModal">
            <div class="modal-content confirm-modal">
                <div class="modal-header">
                    <h3>确认删除</h3>
                    <span class="close-btn" @click="showDeleteModal = false">&times;</span>
                </div>
                <div class="modal-body">
                    <p>确定要删除群组 "{{ groupToDelete.name }}" 吗？</p>
                    <div class="delete-warning">
                        <p>此操作将会：</p>
                        <ul>
                            <li>删除群组的所有成员信息</li>
                            <li>删除群组的所有聊天消息</li>
                            <li>删除相关活动的所有评论</li>
                            <li>删除活动的所有参与记录</li>
                            <li>删除群组及其关联活动</li>
                        </ul>
                        <p><strong>此操作无法撤销！</strong></p>
                    </div>

                    <div v-if="loading" class="loading-indicator">
                        <p>正在处理，请稍候...</p>
                    </div>

                    <div v-if="error" class="error-message">
                        <p>{{ error }}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="delete-btn" @click="confirmDelete">确认删除</button>
                    <button @click="showDeleteModal = false">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {
    getAllGroups,
    updateGroupStatus as updateGroupStatusAPI,
    deleteGroup as deleteGroupAPI,
    deleteGroupMember
} from '@/api/adminAPI'
import {imgBaseUrl} from '@/util/basic-data.js'

// 基础数据
const groups = ref([])
const loading = ref(false)
const error = ref(null)

// 搜索和过滤
const searchTerm = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 模态框
const showGroupModal = ref(false)
const showDeleteModal = ref(false)
const currentGroup = ref({})
const groupToDelete = ref({})

// 计算总页数
const totalPages = computed(() => Math.ceil(filteredGroups.value.length / pageSize.value))

// 过滤群组列表
const filteredGroups = computed(() => {
    let result = groups.value

    // 搜索过滤
    if (searchTerm.value) {
        result = result.filter(group =>
            group.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            group.creator.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
    }

    // 状态过滤
    if (statusFilter.value !== 'all') {
        result = result.filter(group => group.status === statusFilter.value)
    }

    // 分类过滤
    if (categoryFilter.value !== 'all') {
        result = result.filter(group => group.category === categoryFilter.value)
    }

    return result
})

// 获取分页后的群组列表
const paginatedGroups = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredGroups.value.slice(start, end)
})

// 获取分类文本
const getCategoryText = (category) => {
    const categoryMap = {
        interest: '兴趣爱好',
        activity: '活动群组',
        study: '学习交流',
        other: '其他类型'
    }
    return categoryMap[category] || '未知分类'
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        active: '活跃',
        inactive: '非活跃',
        archived: '已归档'
    }
    return statusMap[status] || '未知状态'
}

// 获取群组数据
const fetchGroups = async () => {
    loading.value = true
    error.value = null

    try {
        const data = await getAllGroups()

        // 将后端数据转换为前端所需格式
        groups.value = data.map(item => {
            // 找到群主
            const ownerMember = item.members?.find(m => m.account === item.group.ownerAccount) || {}

            return {
                id: item.group.groupId,
                name: item.group.groupName,
                creator: ownerMember.name || item.group.ownerAccount,
                creatorAvatar: ownerMember.avatar,
                category: getGroupCategory(item.group.activityId),
                status: getGroupStatus(item.group.status),
                memberCount: item.members?.length || 0,
                description: item.group.announcement || '暂无介绍',
                members: item.members?.map(member => ({
                    id: member.account,
                    name: member.name,
                    avatar: member.avatar,
                    role: member.role === 1 ? 'admin' : 'member',
                    isOwner: member.account === item.group.ownerAccount // 添加群主标识
                })) || []
            }
        })
    } catch (err) {
        console.error('获取群组列表失败:', err)
        error.value = '获取群组列表失败: ' + (err.message || '未知错误')
    } finally {
        loading.value = false
    }
}

// 根据群组的activityId判断分类
const getGroupCategory = (activityId) => {
    if (activityId) {
        return 'activity' // 活动群组
    } else {
        return 'other' // 默认其他类型
    }
}

// 将后端状态映射到前端显示状态
const getGroupStatus = (status) => {
    // 后端返回的是数字状态码
    const statusMap = {
        0: 'inactive',
        1: 'active',
        2: 'archived'
    }
    return statusMap[status] || 'inactive'
}

// 搜索群组
const searchGroups = () => {
    currentPage.value = 1
}

// 切换页面
const changePage = (page) => {
    currentPage.value = page
}

// 查看群组详情
const viewGroup = (group) => {
    currentGroup.value = group
    showGroupModal.value = true
}

// 更新群组状态
const updateGroupStatus = async (group, newStatus) => {
    try {
        await updateGroupStatusAPI(group.id, newStatus)

        // 更新本地数据
        const index = groups.value.findIndex(g => g.id === group.id)
        if (index !== -1) {
            groups.value[index].status = newStatus

            // 如果当前正在查看该群组，同时更新当前群组数据
            if (currentGroup.value.id === group.id) {
                currentGroup.value.status = newStatus
            }
        }

        uni.showToast({
            title: `群组 "${group.name}" 状态已更新为 ${getStatusText(newStatus)}`,
            icon: 'success'
        })

        // 如果在模态框中更新状态，关闭模态框
        if (showGroupModal.value) {
            showGroupModal.value = false
        }
    } catch (err) {
        console.error('更新群组状态失败:', err)
        uni.showToast({
            title: '更新群组状态失败: ' + (err.message || '未知错误'),
            icon: 'error'
        })
    }
}

// 删除群组
const deleteGroup = (group) => {
    groupToDelete.value = group
    showDeleteModal.value = true
}

// 确认删除
const confirmDelete = async () => {
    loading.value = true;
    try {
        const result = await deleteGroupAPI(groupToDelete.value.id);

        if (result.code === 200) {
            // 从本地数据中移除
            groups.value = groups.value.filter(g => g.id !== groupToDelete.value.id);

            uni.showToast({
                title: `群组 "${groupToDelete.value.name}" 已成功删除`,
                icon: 'success'
            });

            // 关闭所有模态框
            showDeleteModal.value = false;
            if (showGroupModal.value && currentGroup.value.id === groupToDelete.value.id) {
                showGroupModal.value = false;
            }
        } else {
            error.value = result.msg || '删除群组失败';
            uni.showToast({
                title: error.value,
                icon: 'error'
            });
        }
    } catch (err) {
        console.error('删除群组失败:', err);
        error.value = '删除群组失败: ' + (err.message || '未知错误');
        uni.showToast({
            title: error.value,
            icon: 'error'
        });
    } finally {
        loading.value = false;
    }
}

// 移除群组成员
const removeMember = async (groupId, userAccount, userName) => {
    // 添加确认对话框
    uni.showModal({
        title: '确认移除',
        content: `确定要移除成员 "${userName}" 吗？`,
        success: async (res) => {
            if (res.confirm) {
                try {
                    const result = await deleteGroupMember(groupId, userAccount)

                    if (result.code === 200) {
                        // 更新本地数据
                        const groupIndex = groups.value.findIndex(g => g.id === groupId)
                        if (groupIndex !== -1) {
                            // 从成员列表中移除
                            groups.value[groupIndex].members = groups.value[groupIndex].members.filter(
                                m => m.id !== userAccount
                            )
                            // 更新成员数量
                            groups.value[groupIndex].memberCount--

                            // 如果当前正在查看该群组，同时更新当前群组数据
                            if (currentGroup.value.id === groupId) {
                                currentGroup.value.members = currentGroup.value.members.filter(
                                    m => m.id !== userAccount
                                )
                                currentGroup.value.memberCount--
                            }
                        }

                        uni.showToast({
                            title: `成员 "${userName}" 已成功移除`,
                            icon: 'success'
                        })
                    } else {
                        uni.showToast({
                            title: result.msg || '移除成员失败',
                            icon: 'error'
                        })
                    }
                } catch (err) {
                    console.error('移除成员失败:', err)
                    uni.showToast({
                        title: '移除成员失败: ' + (err.message || '未知错误'),
                        icon: 'error'
                    })
                }
            }
        }
    })
}

// 页面加载时获取数据
onMounted(() => {
    fetchGroups()
})
</script>

<style scoped>
.groups-management {
    padding: 20px;
}

.loading-state,
.error-state {
    text-align: center;
    padding: 20px;
    font-size: 16px;
}

.error-state {
    color: #ff4d4f;
}

.action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-box {
    display: flex;
    gap: 10px;
}

.search-box input {
    padding: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    width: 200px;
}

.filters {
    display: flex;
    gap: 10px;
}

.filters select {
    padding: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    min-width: 120px;
}

.groups-table {
    background: white;
    border-radius: 4px;
    overflow: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
}

th {
    background-color: #fafafa;
    font-weight: 500;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-avatar,
.member-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #1890ff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.user-avatar-img img,
.member-avatar-img img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.category-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.category-badge.interest {
    background-color: #e6f7ff;
    color: #1890ff;
}

.category-badge.activity {
    background-color: #f6ffed;
    color: #52c41a;
}

.category-badge.study {
    background-color: #fff7e6;
    color: #fa8c16;
}

.category-badge.other {
    background-color: #f9f0ff;
    color: #722ed1;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.status-badge.active {
    background-color: #f6ffed;
    color: #52c41a;
}

.status-badge.inactive {
    background-color: #f5f5f5;
    color: #8c8c8c;
}

.status-badge.archived {
    background-color: #fff1f0;
    color: #f5222d;
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
    border: 1px solid;
}

.view-btn {
    background-color: #e6f7ff;
    color: #1890ff;
    border-color: #1890ff;
}

.view-btn:hover {
    background-color: #1890ff;
    color: white;
}

.archive-btn {
    background-color: #fff7e6;
    color: #fa8c16;
    border-color: #fa8c16;
}

.archive-btn:hover {
    background-color: #fa8c16;
    color: white;
}

.activate-btn {
    background-color: #f9f0ff;
    color: #722ed1;
    border-color: #722ed1;
}

.activate-btn:hover {
    background-color: #722ed1;
    color: white;
}

.delete-btn {
    background-color: #fff1f0;
    color: #f5222d;
    border-color: #f5222d;
}

.delete-btn:hover {
    background-color: #f5222d;
    color: white;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
}

.pagination button {
    padding: 6px 12px;
    border: 1px solid #ddd;
    background-color: #fff;
    cursor: pointer;
    border-radius: 4px;
}

.pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
    background-color: #f0f0f0;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

/* 确保uni组件的层级高于模态框 */
:deep(.uni-modal) {
    z-index: 2000 !important;
}

.modal-content {
    background-color: white;
    border-radius: 4px;
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
}

.confirm-modal {
    max-width: 600px;
}

.modal-header {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
}

.close-btn {
    font-size: 24px;
    cursor: pointer;
    color: #999;
}

.modal-body {
    padding: 16px;
}

.group-detail-item {
    margin-bottom: 12px;
}

.group-description {
    margin-top: 8px;
    padding: 12px;
    background-color: #fafafa;
    border-radius: 4px;
    white-space: pre-wrap;
}

.members-section {
    margin-top: 24px;
}

.members-section h4 {
    margin-bottom: 16px;
}

.members-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.member-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background-color: #fafafa;
    border-radius: 4px;
}

.member-info {
    flex: 1;
}

.member-name {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

.owner-badge {
    font-size: 12px;
    padding: 2px 6px;
    background-color: #1890ff;
    color: white;
    border-radius: 4px;
}

.member-role {
    font-size: 12px;
    color: #666;
}

.remove-member-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background-color: #ff4d4f;
    color: white;
    cursor: pointer;
    font-size: 12px;
}

.delete-warning {
    margin-top: 16px;
    padding: 16px;
    background-color: #fff1f0;
    border-radius: 4px;
}

.delete-warning ul {
    margin: 8px 0;
    padding-left: 20px;
}

.delete-warning li {
    margin: 4px 0;
}

.loading-indicator {
    text-align: center;
    margin: 16px 0;
}

.error-message {
    color: #ff4d4f;
    margin: 16px 0;
}

.modal-footer {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.modal-footer button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}

.modal-footer button:not(.delete-btn) {
    background-color: white;
    border: 1px solid #d9d9d9;
}

.delete-btn {
    background-color: #ff4d4f;
    color: white;
    border: none;
}
</style>
<!-- #endif -->