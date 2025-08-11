<!-- #ifdef H5 -->
<template>
    <div class="admin-layout">
        <div class="sidebar">
            <div class="logo">管理后台</div>
            <div class="menu">
                <div 
                    v-for="item in menuItems" 
                    :key="item.path"
                    :class="['menu-item', { active: currentComponent === item.component }]"
                    @click="switchPage(item.component)"
                >
                    {{ item.name }}
                </div>
            </div>
        </div>
        <div class="main-content">
            <div class="header">
                <div class="user-info">
                    <span>{{ userStore.user?.nickname || '管理员' }}</span>
                    <button class="logout-btn" @click="handleLogout">退出登录</button>
                </div>
            </div>
            <div class="content">
                <keep-alive>
                    <component :is="currentComponent"></component>
                </keep-alive>
            </div>
        </div>
        <div class="footer">
            <a href="https://beian.miit.gov.cn/" target="_blank">ICP备案：湘ICP备2025131765号-1</a>
        </div>
    </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { userQuit } from '@/api/userAPI'
import Dashboard from './Dashboard.vue'
import Users from './Users.vue'
import Activities from './Activities.vue'
import Groups from './Groups.vue'
import ReportManagePage from './ReportManagePage.vue'
import RepairManagement from './RepairManagement.vue'
import Announcements from './Announcements.vue'

const router = useRouter()
const userStore = useUserStore()

// 菜单项配置
const menuItems = [
    { name: '控制台', component: 'Dashboard' },
    { name: '用户管理', component: 'Users' },
    { name: '活动管理', component: 'Activities' },
    { name: '群组管理', component: 'Groups' },
    { name: '举报管理', component: 'ReportManagePage' },
    { name: '维修管理', component: 'RepairManagement' },
    { name: '公告管理', component: 'Announcements' }
]

// 当前显示的组件
const currentComponent = shallowRef(Dashboard)

// 切换页面
const switchPage = (component) => {
    currentComponent.value = component === 'Dashboard' ? Dashboard :
                            component === 'Users' ? Users :
                            component === 'Activities' ? Activities :
                            component === 'Groups' ? Groups :
                            component === 'ReportManagePage' ? ReportManagePage :
                            component === 'RepairManagement' ? RepairManagement :
                            component === 'Announcements' ? Announcements : null
}

// 退出登录
const handleLogout = async () => {
    try {
        await userQuit()
        userStore.quit()
        router.push('/admin/login')
    } catch (error) {
        console.error('退出登录失败:', error)
    }
}
</script>

<style lang="scss">
.admin-layout {
    display: flex;
    flex-direction: column;
}

.sidebar {
    position: fixed;

    width: 200px;
    height: 100%;
    background-color: #001529;
    color: white;
    padding: 20px 0;
}

.logo {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    padding: 20px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu {
    margin-top: 20px;
}

.menu-item {
    padding: 12px 24px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
    background-color: #1890ff;
}

.main-content {
    margin-left: 200px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.header {
    height: 64px;
    background-color: white;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 24px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.logout-btn {
    padding: 4px 12px;
    background-color: #ff4d4f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.logout-btn:hover {
    background-color: #ff7875;
}

.content {
    flex: 1;
    padding: 24px;
    background-color: #f0f2f5;
    overflow-y: auto;
}
.footer {
    height: 60px;
    background-color: #f0f2f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
    border-top: 1px solid #e8e8e8;
}

</style>

<!-- #endif -->