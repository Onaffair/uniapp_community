<template>
    <div class="users-management">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
            加载中...
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-state">
            {{ error }}
        </div>

        <!-- 用户列表 -->
        <template v-if="!loading && !error">
            <div class="action-bar">
                <div class="search-box">
                    <input type="text" v-model="searchTerm" placeholder="搜索用户...">
                    <button @click="searchUsers" size="mini" style="height: 95%">搜索</button>
                </div>
                <div class="filters">
                    <select v-model="statusFilter">
                        <option value="all">所有状态</option>
                        <option value="online">在线</option>
                        <option value="offline">离线</option>
                        <option value="banned">已禁用</option>
                    </select>
                </div>
            </div>

            <div class="users-table">
                <table>
                    <thead>
                    <tr>
                        <th>账号</th>
                        <th>用户名</th>
                        <th>邮箱</th>
                        <th>手机号</th>
                        <th>角色</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="user in paginatedUsers" :key="user.id">
                        <td>{{ user.account }}</td>
                        <td>
                            <div class="user-info">
                                <img v-if="user.avatar" :src="imgBaseUrl+ user.avatar" class="user-avatar" alt="avatar">
                                <span v-else class="user-avatar">{{ user.username.charAt(0) }}</span>
                                <span>{{ user.username }}</span>
                            </div>
                        </td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.phone }}</td>
                        <td>{{ getRoleText(user.role) }}</td>
                        <td>
                <span class="status-badge"
                      :class="user.status === 'online' ? 'active' : (user.status === 'offline' ? 'inactive' : 'banned')">
                  {{ getStatusText(user.status) }}
                </span>
                        </td>
                        <td>
                            <div class="actions">
                                <button class="view-btn" @click="viewUser(user)">查看</button>
                                <button class="edit-btn" @click="editUser(user)">编辑</button>
                                <button
                                    class="ban-btn"
                                    v-if="user.status !== 'banned'"
                                    @click="toggleUserStatus(user, 'banned')"
                                >
                                    封禁
                                </button>
                                <button
                                    class="activate-btn"
                                    v-else-if="user.status === 'banned'"
                                    @click="toggleUserStatus(user, 'offline')"
                                >
                                    激活
                                </button>
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

        <!-- 用户详情弹窗 -->
        <div class="modal" v-if="showUserModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>{{ currentUser.name }} 的详细信息</h3>
                    <span class="close-btn" @click="showUserModal = false">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="user-detail-item">
                        <strong>账号:</strong> {{ currentUser.account }}
                    </div>
                    <div class="user-detail-item">
                        <strong>用户名:</strong> {{ currentUser.username }}
                    </div>
                    <div class="user-detail-item">
                        <strong>邮箱:</strong> {{ currentUser.email }}
                    </div>
                    <div class="user-detail-item">
                        <strong>手机号:</strong> {{ currentUser.phone }}
                    </div>
                    <div class="user-detail-item">
                        <strong>角色:</strong> {{ getRoleText(currentUser.role) }}
                    </div>
                    <div class="user-detail-item">
                        <strong>状态:</strong> {{ getStatusText(currentUser.status) }}
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="showUserModal = false">关闭</button>
                </div>
            </div>
        </div>

        <!-- 编辑用户弹窗 -->
        <div class="modal" v-if="showEditModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>编辑用户</h3>
                    <span class="close-btn" @click="showEditModal = false">&times;</span>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="saveUserEdit">
                        <div class="form-group">
                            <label for="editName">用户名:</label>
                            <input
                                type="text"
                                id="editName"
                                v-model="editingUser.username"
                                required
                                class="form-control"
                            >
                        </div>
                        <div class="form-group">
                            <label for="editEmail">邮箱:</label>
                            <input
                                type="email"
                                id="editEmail"
                                v-model="editingUser.email"
                                required
                                class="form-control"
                            >
                        </div>
                        <div class="form-group">
                            <label for="editPhone">手机号:</label>
                            <input
                                type="text"
                                id="editPhone"
                                v-model="editingUser.phone"
                                required
                                class="form-control"
                            >
                        </div>
                        <div class="form-group">
                            <label for="editStatus">状态:</label>
                            <select
                                id="editStatus"
                                v-model="editingUser.status"
                                class="form-control"
                            >
                                <option value="online">在线</option>
                                <option value="offline">离线</option>
                                <option value="banned">已禁用</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editRole">用户身份:</label>
                            <select
                                id="editRole"
                                v-model="editingUser.role"
                                class="form-control"
                            >
                                <option value="0">普通用户</option>
                                <option value="1">管理员</option>
                                <option value="2">维修员</option>
                            </select>
                        </div>
                        <div class="form-group password-group">
                            <label for="editPassword">重置密码 (留空则不修改):</label>
                            <div class="password-input-container">
                                <input
                                    :type="passwordInputType"
                                    id="editPassword"
                                    v-model="editingUser.newPassword"
                                    placeholder="输入新密码"
                                    class="form-control"
                                >
                            </div>
                            <div class="password-hint"
                                 v-if="editingUser.newPassword && !validatePassword(editingUser.newPassword)">
                                密码长度不能少于3位
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="save-btn" @click="saveUserEdit">保存</button>
                    <button @click="showEditModal = false">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {getAllUsers, updateUser} from '@/api/adminAPI'
import {imgBaseUrl} from '@/util/basic-data.js'
import {encrypt} from "@/util";

// 用户数据
const users = ref([])
const loading = ref(false)
const error = ref(null)

// 搜索和筛选
const searchTerm = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

// 用户详情弹窗
const showUserModal = ref(false)
const currentUser = ref({})

// 编辑用户弹窗
const showEditModal = ref(false)
const editingUser = ref({})
const passwordVisible = ref(false)
const passwordInputType = computed(() => passwordVisible.value ? 'text' : 'password')

// 获取用户列表
const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
        const data = await getAllUsers()
        users.value = data.map(user => ({
            ...user,
            status: user.status
        }))
    } catch (err) {
        error.value = '获取用户列表失败：' + (err.message || '未知错误')
        console.error('获取用户列表失败:', err)
    } finally {
        loading.value = false
    }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
    if (!dateTime) return '暂无'
    return new Date(dateTime).toLocaleString()
}

// 筛选用户列表
const filteredUsers = computed(() => {
    let result = [...users.value]

    // 搜索条件过滤
    if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        result = result.filter(user =>
            user.account.toLowerCase().includes(term) ||
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.phone.includes(term)
        )
    }

    // 状态过滤
    if (statusFilter.value !== 'all') {
        result = result.filter(user => user.status === statusFilter.value)
    }

    return result
})

// 分页后的用户列表
const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredUsers.value.slice(start, end)
})

// 计算总页数
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value))

// 搜索用户
const searchUsers = () => {
    currentPage.value = 1
}

// 切换页码
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

// 获取状态文本
const getStatusText = (status) => {
    switch (status) {
        case 'online':
            return '在线'
        case 'offline':
            return '离线'
        case 'banned':
            return '已禁用'
        default:
            return '未知'
    }
}

// 获取角色文本
const getRoleText = (role) => {
    switch (role) {
        case 0:
            return '普通用户'
        case 1:
            return '管理员'
        case 2:
            return '维修员'
        default:
            return '未知'
    }
}

// 查看用户详情
const viewUser = (user) => {
    currentUser.value = {...user}
    showUserModal.value = true
}

// 编辑用户
const editUser = (user) => {
    editingUser.value = {...user, newPassword: ''} // 添加 newPassword 字段
    showEditModal.value = true
}

// 保存用户编辑
const saveUserEdit = async () => {
    try {
        // 验证密码长度
        if (editingUser.value.newPassword && !validatePassword(editingUser.value.newPassword)) {
            uni.showToast({
                title: '密码长度不能少于3位',
                icon: 'none'
            })
            return
        }

        const payload = {
            account: editingUser.value.account,
            username: editingUser.value.username,
            email: editingUser.value.email,
            phone: editingUser.value.phone,
            status: editingUser.value.status,
            role: parseInt(editingUser.value.role) // 添加角色信息
        }

        if (editingUser.value.newPassword) {
            payload.password = encrypt(editingUser.value.newPassword)
        }
        const result = await updateUser(payload)
        if (result) {
            uni.showToast({
                title: '用户信息更新成功',
                icon: 'success'
            })
            showEditModal.value = false
            await fetchUsers() // 重新获取用户列表以更新数据
        } else {
            uni.showToast({
                title: '用户信息更新失败',
                icon: 'error'
            })
        }
    } catch (error) {
        console.error('保存用户编辑失败:', error)
        uni.showToast({
            title: '保存失败：' + (error.message || '未知错误'),
            icon: 'error'
        })
    }
}

// 切换用户状态 (封禁/激活)
const toggleUserStatus = async (user, newStatus) => {
    try {
        // 转换为后端需要的数字状态
        let statusValue;
        if (newStatus === 'online') {
            statusValue = 1;
        } else if (newStatus === 'offline') {
            statusValue = 2;
        } else {
            statusValue = 0; // banned
        }

        const statusText = newStatus === 'offline' ? '激活' : '解封';

        const res = await uni.showModal({
            title: '提示',
            content: `确定要${statusText}用户 "${user.username}" 吗？`,
            showCancel: true,
            cancelText: '取消',
            confirmText: '确定'
        });

        if (res.confirm) {
            const result = await updateUser({
                id: user.id,
                status: statusValue
            })

            if (result) {
                uni.showToast({
                    title: `用户已${statusText}`,
                    icon: 'success'
                })
                await fetchUsers() // 重新获取用户列表以更新数据
            } else {
                uni.showToast({
                    title: '状态更新失败',
                    icon: 'error'
                })
            }
        } else if (res.cancel) {
            // 用户点击取消，不执行任何操作
            return;
        }
    } catch (error) {
        console.error('更新用户状态失败:', error)
        uni.showToast({
            title: '状态更新失败：' + (error.message || '未知错误'),
            icon: 'error'
        })
    }
}

// 密码可见性切换
const togglePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value
}

// 密码验证
const validatePassword = (password) => {
    return password.length >= 3
}

// 在组件挂载时获取用户列表
onMounted(async () => {
    await fetchUsers()
})
</script>

<style scoped>
.users-management {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    padding: 24px;
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

.status-filter {
    width: 120px;
}

.users-table {
    width: 100%;
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    background-color: #fafafa;
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
}

td {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 2px;
    font-size: 12px;
    white-space: nowrap;
    display: inline-block;
    min-width: 60px;
    text-align: center;
}

.status-badge.active {
    background-color: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
}

.status-badge.banned {
    background-color: #fff1f0;
    color: #ff4d4f;
    border: 1px solid #ffa39e;
}

.actions {
    display: flex;
    gap: 8px;
}

.view-btn, .ban-btn, .activate-btn, .edit-btn {
    padding: 4px 8px;
    border: none;
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
    background-color: #fffbe6;
    color: #faad14;
    border: 1px solid #ffe58f;
}

.ban-btn {
    background-color: #fff1f0;
    color: #ff4d4f;
    border: 1px solid #ffa39e;
}

.activate-btn {
    background-color: #f9f0ff;
    color: #722ed1;
    border: 1px solid #d3adf7;
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

/* 弹窗样式 */
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

.modal-content {
    background-color: white;
    border-radius: 4px;
    width: 500px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
    margin: 0;
}

.close-btn {
    font-size: 24px;
    cursor: pointer;
}

.modal-body {
    padding: 16px;
}

.user-detail-item {
    margin-bottom: 12px;
}

.modal-footer {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
    text-align: right;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.modal-footer button {
    padding: 8px 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.save-btn {
    background-color: #52c41a;
}

/* 加载状态样式 */
.loading-state {
    text-align: center;
    padding: 40px;
    font-size: 16px;
    color: #666;
}

/* 错误状态样式 */
.error-state {
    text-align: center;
    padding: 40px;
    color: #ff4d4f;
    background-color: #fff1f0;
    border: 1px solid #ffa39e;
    border-radius: 4px;
    margin: 20px 0;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #1890ff;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    flex-shrink: 0;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-control {
    width: calc(100% - 22px);
    height: 20%;
    padding: 10px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    box-sizing: border-box;
}

.password-group {
    position: relative;
}

.password-input-container {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    width: 20px;
    height: 20px;
    background-size: contain;
    background-repeat: no-repeat;
}

.password-visible {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>');
}

.password-hidden {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px"><path d="M12 7c-2.76 0-5 2.24-5 5 0 .5.1 1 .26 1.46L3.41 19.59c-.8-.8-.8-2.09 0-2.89L17.59 3.41c.8-.8 2.09-.8 2.89 0L20.59 4.41c.8.8.8 2.09 0 2.89L12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>');
}

.password-hint {
    color: red;
    font-size: 12px;
    margin-top: 5px;
}

.save-btn {
    margin-right: 10px;
}
</style>