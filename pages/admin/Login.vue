<!-- #ifdef H5 -->
<template>
    <div class="login-container">
        <div class="login-box">
            <h2>管理员登录</h2>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label for="account">账号</label>
                    <input
                        type="text"
                        id="account"
                        v-model="loginForm.account"
                        required
                        placeholder="请输入账号"
                    >
                </div>
                <div class="form-group">
                    <label for="password">密码</label>
                    <input
                        type="password"
                        id="password"
                        v-model="loginForm.password"
                        required
                        placeholder="请输入密码"
                    >
                </div>
                <div class="error-message" v-if="error">{{ error }}</div>
                <button type="submit" :disabled="loading">
                    {{ loading ? '登录中...' : '登录' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { postLoginInfo } from '@/api/userAPI'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const loginForm = ref({
    account: '',
    password: ''
})

const handleLogin = async () => {
    loading.value = true
    error.value = ''
    
    try {
        const res = await postLoginInfo(loginForm.value)
        if (res?.code === 200) {
            // 登录成功，跳转到管理后台首页
            router.push('/admin')
        } else {
            error.value = res?.msg || '登录失败'
        }
    } catch (err) {
        error.value = err?.message || '登录失败'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f2f5;
}

.login-box {
    width: 400px;
    padding: 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 8px;
    color: #333;
}

input {
    width: 100%;
    padding: 10px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
}

input:focus {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

button {
    width: 100%;
    padding: 12px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #40a9ff;
}

button:disabled {
    background-color: #d9d9d9;
    cursor: not-allowed;
}

.error-message {
    color: #ff4d4f;
    margin-bottom: 16px;
    text-align: center;
}
</style>
<!-- #endif --> 