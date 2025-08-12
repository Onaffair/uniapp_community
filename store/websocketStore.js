// websocketStore.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useUserStore } from './userStore'
import { wsUrl } from '@/util'
import WebSocketUtils from '../util/webSocketUtils'
import {MessageDispatcher} from "@/util/messageDispatcher";

export const useWebSocketStore = defineStore('websocket', () => {
    // 状态
    const userStore = useUserStore()
    const wsInstance = ref(null)
    const isConnected = ref(false)
    const lastError = ref(null)
    const reconnectTimer = ref(null) 
    const reconnectAttempts = ref(0)
    const maxReconnectAttempts = 5
    const reconnectDelay = 3000 // 3秒重连间隔
    const dispatcher = new MessageDispatcher(userStore)


    // 初始化WebSocket连接
    const initWebSocket = () => {
        // 不重复初始化，确保登录状态
        if (!userStore.isLogin || wsInstance.value) return

        try {
            // console.log('正在初始化WebSocket连接...')
            
            // 使用WebSocketUtils创建连接
            wsInstance.value = new WebSocketUtils(
                wsUrl,
                userStore.token
            )
            
            // 设置事件处理
            setupEventHandlers()
            
            // 连接WebSocket
            wsInstance.value.connect()
        } catch (error) {
            // console.error('WebSocket初始化错误', error)
            lastError.value = error
            handleConnectionFailure()
        }
    }

    // 设置WebSocket事件处理器
    const setupEventHandlers = () => {
        if (!wsInstance.value) return

        // 连接打开事件
        wsInstance.value.setOnOpenCallback(() => {
            // console.log('WebSocket连接已建立')
            isConnected.value = true
            lastError.value = null
            reconnectAttempts.value = 0
            clearReconnectTimer()
        })

        // 连接关闭事件
        wsInstance.value.setOnCloseCallback((event) => {
            // console.log('WebSocket连接已关闭', event)
            isConnected.value = false
            handleConnectionFailure()
        })

        // 连接错误事件
        wsInstance.value.setOnErrorCallback((error) => {
            // console.error('WebSocket连接发生错误', error)
            lastError.value = error
            isConnected.value = false
            handleConnectionFailure()
        })

        // 接收消息事件
        wsInstance.value.setOnMessageCallback(async (data) => {
            dispatcher.dispatch(data)
        })
    }


    // 处理连接失败或断开
    const handleConnectionFailure = () => {
        cleanup()
        
        // 增加重连次数
        reconnectAttempts.value++
        
        // 如果未超过最大重连次数并且用户仍然登录，则调度重连
        if (reconnectAttempts.value <= maxReconnectAttempts && userStore.isLogin) {
            scheduleReconnect()
        } else if (reconnectAttempts.value > maxReconnectAttempts) {
            console.error(`已达到最大重连次数(${maxReconnectAttempts})，停止重连`)
            // 通知用户
            uni.showToast({
                title: '网络连接不稳定，请稍后重试',
                icon: 'none',
                duration: 3000
            })
        }
    }

    // 清理资源
    const cleanup = () => {
        if (wsInstance.value) {
            wsInstance.value.close().catch(error => {
                console.error('关闭WebSocket连接失败:', error)
            }).finally(() => {
                wsInstance.value = null
            })
        }
    }
    
    // 清除重连定时器
    const clearReconnectTimer = () => {
        if (reconnectTimer.value) {
            clearTimeout(reconnectTimer.value)
            reconnectTimer.value = null
        }
    }

    // 调度重连
    const scheduleReconnect = () => {
        if (userStore.isLogin && !reconnectTimer.value) {
            // 延时重连，时间随重连次数增加
            const delay = reconnectDelay * Math.min(reconnectAttempts.value, 3)
            
            console.log(`将在${delay / 1000}秒后尝试重连，当前尝试次数: ${reconnectAttempts.value}`)
            
            reconnectTimer.value = setTimeout(() => {
                reconnectTimer.value = null
                
                // 如果重新连接时用户已登出，则取消重连
                if (!userStore.isLogin) {
                    console.log('用户已登出，取消重连')
                    return
                }
                
                console.log('尝试重新连接WebSocket...')
                initWebSocket()
            }, delay)
        }
    }
    
    // 发送消息
    const sendMessage = async (message) => {
        if (!wsInstance.value || !isConnected.value) {
            console.warn('WebSocket未连接，无法发送消息')
            
            // 如果WebSocket断开但用户仍登录，尝试重连
            if (userStore.isLogin && !wsInstance.value) {
                console.log('WebSocket不存在，尝试重新初始化...')
                initWebSocket()
                
                // 通知用户
                uni.showToast({
                    title: '网络连接中，请稍后重试',
                    icon: 'none'
                })
            }
            
            return false
        }
        
        try {
            // 如果是对象，转为JSON字符串
            const messageStr = typeof message === 'object' ? 
                JSON.stringify(message) : message
                
            // 异步发送消息
            await wsInstance.value.sendMessage(messageStr)
            return true
        } catch (error) {
            console.error('消息发送失败:', error)
            
            // 连接可能已断开，但状态未更新
            isConnected.value = false
            handleConnectionFailure()
            
            return false
        }
    }

    // 重置状态
    const reset = () => {
        cleanup()
        clearReconnectTimer()
        isConnected.value = false
        lastError.value = null
        reconnectAttempts.value = 0
    }

    // 强制重连
    const forceReconnect = () => {
        reset()
        reconnectAttempts.value = 0 // 重置重连计数
        initWebSocket()
    }

    // 监听用户登录状态变化
    watch(() => userStore.isLogin, (newVal) => {
        if (newVal) {
            // 用户登录，初始化WebSocket
            initWebSocket()
        } else {
            // 用户登出，清理资源
            reset()
        }
    }, { immediate: true })

    // 监听token变化
    watch(() => userStore.token, (newVal, oldVal) => {
        // 只有在已连接且token变化时才更新
        if (wsInstance.value && newVal !== oldVal) {
            console.log('Token已更新，重新连接WebSocket')
            wsInstance.value.setToken(newVal)
            forceReconnect()
        }
    })

    return {
        isConnected,
        lastError,
        sendMessage,
        initWebSocket,
        cleanup,
        forceReconnect
    }
}) 