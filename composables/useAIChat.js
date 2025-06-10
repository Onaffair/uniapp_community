// composables/useAIChat.js
import { ref } from 'vue'
import { alertFail} from '@/util/showMessages'
import { useUserStore } from '@/store/userStore'
import { backUrl } from '@/util/basic-data'

export function useAIChat({ endpoint = '/ai/chat'} = {}) {
    const markdownContent = ref('')
    const isLoading = ref(false)
    const error = ref(null)
    /**
     * 发起 AI 对话请求并监听流式响应
     * @param payload {Object} 请求体数据（如 text, activity, images）
     */
    const sendRequest = async (payload,method='POST') => {
        isLoading.value = true
        markdownContent.value = ''
        error.value = null

        try {
            const token = useUserStore().getToken()
            const fullUrl = new URL(`api${endpoint}`,backUrl)

            if (method.toUpperCase() === "GET"){
                Object.entries(payload).forEach(([key,value]) =>{
                    fullUrl.searchParams.append(key,value)
                })
            }

            const options = {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            };

            if (method.toUpperCase() === "POST"){
                options.headers['Content-Type'] = 'application/json'
                options.body = JSON.stringify(payload)
            }

            const response = await fetch(fullUrl.href, options)

            if (!response.ok) {
                throw new Error(`HTTP 错误！状态码：${response.status}`)
            }

            if (!response.body) {
                throw new Error('ReadableStream 不可用')
            }
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = '' // 缓存未完成的 JSON 片段

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true }) // 累积数据

                // 按换行分割
                const lines = buffer.split('\n')
                buffer = lines.pop() // 保留未闭合的 JSON 片段

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        let dataStr = line.slice(5).trim()
                        if (!dataStr) continue // 忽略空行
                        try {
                            // 尝试解析当前行
                            const data = JSON.parse(dataStr)
                            if (data.content) {
                                markdownContent.value += data.content
                            }
                        } catch (e) {
                            // 重新加入缓冲区
                            buffer = dataStr
                            try {
                                const combined = buffer
                                const data = JSON.parse(combined)
                                buffer = ''
                                if (data.content) {
                                    markdownContent.value += data.content
                                }
                            } catch {
                                // 仍失败则保留缓冲区等待更多数据
                                console.warn('JSON 缓冲区未完成:', combined)
                            }
                        }
                    }
                }
            }
            // 最后处理剩余缓冲区
            if (buffer) {
                try {
                    const data = JSON.parse(buffer)
                    if (data.content) {
                        markdownContent.value += data.content
                    }
                } catch {
                    console.warn('最终缓冲区解析失败:', buffer)
                }
            }

            isLoading.value = false
        } catch (err) {
            console.error('AI 请求失败:', err)
            error.value = err.message
            alertFail('AI 回复失败', err.message)
            isLoading.value = false
        }
    }

   return {
        markdownContent,
        isLoading,
        error,
        sendRequest
   }
}