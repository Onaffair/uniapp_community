<template>
    <view class="chat-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <SessionSidebar
            :sessions="mySession"
            :active-session-id="chatRequest.sessionId"
            @new-session="handleNewSession"
            @select="args => changeCurrentChat(args)"
            @collapse-change="handleSidebarCollapse"
        />
        <view class="chat-container">
            <!-- 活动标题显示区域 -->
            <view v-if="chatRequest.sessionId && selectedActivityTitle" class="activity-header">
                <view class="activity-info">
                    <uni-icons type="flag" size="16" color="#42b983"></uni-icons>
                    <text class="activity-title">{{ selectedActivityTitle }}</text>
                </view>
            </view>
            <view class="chat-history">
                <AIMessage
                    v-for="(message, index) in chatHistory"
                    :key="message.id"
                    :message="message"
                    :user-avatar="userInfo.avatar"
                    :show-divider="index < chatHistory.length - 1"
                />
                <view v-if="isLoadingFromDs" class="message-bubble system">
                    <view class="message-header">
                        <text class="role-name">AI助手</text>
                        <view class="message-content">
                            <rich-text selectable="true" :nodes="parseMarkdown(markdownContentFromDs)" class="ai-response" />
                        </view>
                    </view>
                </view>

            </view>
            <view class="content-container">
                <!-- 输入区域 -->
                <view class="content-area">
                    <view class="input-box">
                     <textarea
                         v-model="chatRequest.content"
                         placeholder="输入问题..."
                         class="chat-textarea"
                     />
                    </view>
                    <view class="actions-container">
                        <view class="action-bar">
                            <view class="activity-selector" @click="showPopup" v-if="!chatRequest.sessionId">
                                <text>{{ selectedActivity }}</text>
                                <uni-icons type="bottom" size="14" color="#999"></uni-icons>
                            </view>
                            <view class="image-uploader">
                                <ImgUploader v-model:img-src="images" :max-count="5">
                                    <template #button><uni-icons type="image" size="50"/></template>
                                </ImgUploader>
                            </view>
                        </view>
                        <view class="action-right">
                            <view class="send-button-container">
                                <uni-icons
                                    v-if="!isImageAnalyzing && !isLoadingFromDs"
                                    type="arrow-up"
                                    class="send-button"
                                    @click="submit"
                                />
                                <view v-else class="send-button disabled">
                                    <uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
                                    <text class="analyzing-text">{{ isImageAnalyzing ? '解析中' : '发送中' }}</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <!-- 活动选择弹窗 -->
            <uni-popup ref="popup" type="bottom" style="z-index: 1000">
                <view class="popup-content">
                    <view class="popup-header">
                        <text class="popup-title">选择活动</text>
                        <view class="popup-close" @click="closePopup">
                            <uni-icons type="close" size="20" color="#666"></uni-icons>
                        </view>
                    </view>
                    <scroll-view scroll-y class="activity-list">
                        <view
                            v-for="activity in activities"
                            :key="activity.id"
                            class="activity-item"
                            @click="selectActivity(activity)"
                        >
                            <text>{{ activity.title }}</text>
                        </view>
                    </scroll-view>
                </view>
            </uni-popup>
        </view>
    </view>
</template>

<script setup>
import {computed, nextTick, reactive, ref, watch} from 'vue'
import { useAIChat } from '@/composables/useAIChat'
import { useUserStore } from "@/store/userStore";
import DOMPurify from 'dompurify'
import { marked } from "marked";
import {getMyAISessionHistory, getSessionChatHistory} from "@/api";
import {onShow} from '@dcloudio/uni-app'

marked.setOptions({
	gfm: true,
	breaks: false,
	pedantic: false
})

const userStore = useUserStore()
const userInfo = ref(userStore.getUser())
const activities = userStore.getMyActivity()
const mySession = computed(() => userStore.getMyAIChatSession())

// 页面显示时获取数据
onShow(() => {
    if (userStore.getIsLogin()) {
        // 获取AI会话历史
        getMyAISessionHistory()
    }
})


const chatRequest = reactive({
	sessionId: null,
	parentId: null,
	activityId: null,
	content: '',
	imageInfo: [] // 图片信息,url, description
})

const chatHistory = ref([])

const images = ref([])
const popup = ref(null)

const {
	sendRequest: sendRequestToDs,
	markdownContent: markdownContentFromDs,
	isLoading: isLoadingFromDs,
	error: errorFromDs,
} = useAIChat()

const parseMarkdown = (content) => {
    if (!content) return '';
    // 使用marked解析Markdown
    const htmlContent = marked.parse(content);
    // 使用DOMPurify进行安全过滤
    return DOMPurify.sanitize(htmlContent);
};

const selectedActivity = computed(() =>{
    if (!chatRequest.activityId) return "选择活动"
    return activities.find(activity => activity.id === chatRequest.activityId).title
})

const selectedActivityTitle = computed(() => {
    if (!chatRequest.activityId) return null
    const activity = activities.find(activity => activity.id === chatRequest.activityId)
    return activity ? activity.title : null
})

// 图片解析状态
const isImageAnalyzing = computed(() => {
    return chatRequest.imageInfo.some(info => info.description === '分析中...')
})

// 显示活动选择弹窗
const showPopup = () => {
	popup.value.open('bottom')
}
// 关闭活动选择弹窗
const closePopup = () => {
	popup.value.close()
}
// 选择活动
const selectActivity = (activity) => {
	chatRequest.activityId = activity?.id
	closePopup()
}

watch(images, (newVal, oldVal) => {
	const addedUrls = newVal.filter(url => !oldVal.includes(url))
	const removedUrls = oldVal.filter(url => !newVal.includes(url))
	// 处理新增图片
	addedUrls.forEach(url => {
		// 立即创建初始条目
		if (!chatRequest.imageInfo.some(i => i.url === url)) {
			chatRequest.imageInfo.push({
				url,
				description: '分析中...'
			})
		}
        if (!url){
            console.log('图片地址为空')
            return
        }
		const aiInstance = useAIChat({ endpoint: '/ai/image-analise' })
		// 实时更新流式内容
		const stopContentWatch = watch(() => aiInstance.markdownContent.value, content => {
			const target = chatRequest.imageInfo.find(i => i.url === url)
			if (target) target.description = content
		})
		// 处理完成状态
		const stopLoadingWatch = watch(() => aiInstance.isLoading.value, isLoading => {
			if (!isLoading) {
				stopContentWatch()
				stopLoadingWatch()
			}
		})
		aiInstance.sendRequest({ imageUrl: url }, "GET")
	})

	// 处理删除图片
	removedUrls.forEach(url => {
		chatRequest.imageInfo = chatRequest.imageInfo.filter(i => i.url !== url)
	})
}, { deep: true })

const changeCurrentChat = async (session) =>{
    if (chatHistory.value.length !== 0 && chatHistory.value[0].sessionId === session.id) return
    const res = await getSessionChatHistory(session.id);
    chatHistory.value = [...res]
    chatRequest.activityId = session.activityId
    chatRequest.sessionId = session.id;

    nextTick(() =>{
        uni.pageScrollTo({
            scrollTop:99999999,
            duration:100
        })
    })

}
// 生成唯一ID的辅助函数
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const submit = () => {
    if (!chatRequest.content.trim() || isImageAnalyzing.value || isLoadingFromDs.value) return;
    // 添加用户消息到聊天历史
    const userMessage = {
        id: generateId(),
        role: 'user',
        content: chatRequest.content,
        createdAt: new Date(),
        sessionId: chatRequest.sessionId
    }
    chatHistory.value.push(userMessage);
    // 发送请求到后端
    sendRequestToDs(chatRequest);

    //监视AI回复，回复结束添加到回复历史并清空回复
    const unwatchResponse = watch(isLoadingFromDs,async (newVal,oldVal) =>{
        if (oldVal && !newVal){
            await getMyAISessionHistory()
                .then(res =>{
                    chatRequest.sessionId = res[0].id
                })
            chatHistory.value.push({
                role:'system',
                content: markdownContentFromDs.value,
                createdAt: new Date(),
                sessionId: chatRequest.sessionId
            })
            markdownContentFromDs.value = ''

            unwatchResponse()
        }
    },{
        immediate:true
    })
    // 清空输入框
    chatRequest.content = '';
    images.value = []
}

// 添加侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 处理侧边栏折叠状态变化
const handleSidebarCollapse = (collapsed) => {
    sidebarCollapsed.value = collapsed
}

const handleNewSession = () =>{
    chatHistory.value = []
    chatRequest.sessionId = null
    chatRequest.activityId = null
    chatRequest.imageInfo = []
    chatRequest.content = ''
    chatRequest.parentId = null
}

</script>

<style lang="scss" scoped>
.message-bubble {
    margin-bottom: 30rpx;
    border-radius: 16rpx;
    background-color: #fff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    overflow: hidden;

    &.user {
        .message-header {
            background-color: #e8f4ff;
            background-image: linear-gradient(to right, #e8f4ff, #f0f8ff);
        }
        .message-content {
            border-left: 4rpx solid #1890ff;
        }
    }

    &.system {
        .message-header {
            background-color: #f0f9eb;
            background-image: linear-gradient(to right, #f0f9eb, #f6ffed);
        }
        .message-content {
            border-left: 4rpx solid #52c41a;
        }
    }
}

.message-header {
    padding: 24rpx;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.3s ease;
}

.avatar {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    border: 2rpx solid #fff;
}

.role-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    letter-spacing: 1rpx;
}

.message-time {
    margin-left: auto;
    font-size: 24rpx;
    color: #999;
    opacity: 0.8;
}

.message-content {
    padding: 30rpx;
    font-size: 30rpx;
    line-height: 1.6;
    color: #333;

    .ai-response {
        ::v-deep p {
            margin-bottom: 24rpx;
        }
        ::v-deep strong {
            font-weight: 600;
            color: #222;
        }
        ::v-deep code {
            background-color: #f5f5f5;
            padding: 4rpx 8rpx;
            border-radius: 4rpx;
            font-family: monospace;
            font-size: 28rpx;
            color: #d56161;
        }
        ::v-deep pre {
            background-color: #f8f8f8;
            padding: 20rpx;
            border-radius: 8rpx;
            overflow-x: auto;
            margin: 20rpx 0;
        }
        ::v-deep img{
            width: 200rpx;
            height: auto;
            object-fit: fill;
        }
    }
}

.message-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e8e8e8, transparent);
    margin: 0 30rpx;
    opacity: 0.6;
}

.chat-layout {
    display: flex;
    height: 100vh;
    position: relative;
    --sidebar-width: 280rpx;  // 定义 CSS 变量
    background-color: #f5f7fa;
    
    &.sidebar-collapsed {
        --sidebar-width: 80rpx;  // 折叠时更新变量值
    }

    .sidebar-container {
        width: var(--sidebar-width);
        position: fixed;
        left: 0;
        top: 80rpx;
        bottom: 0;
        z-index: 100;
        overflow-y: auto;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        transition: width 0.3s ease;
        box-shadow: 2rpx 0 15rpx rgba(0, 0, 0, 0.05);

        &.collapsed {
            --sidebar-width: 80rpx;  // 更新变量值
            width: var(--sidebar-width);
        }
    }

    .chat-container {
        flex: 1;
        margin-left: calc(var(--sidebar-width));  // 使用变量
        display: flex;
        flex-direction: column;
        height: 100vh;
        transition: margin-left 0.3s ease, background-color 0.3s ease;  // 添加过渡效果

        .activity-header {
            background: linear-gradient(135deg, #42b983, #3aa876);
            padding: 20rpx 30rpx;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            
            .activity-info {
                display: flex;
                align-items: center;
                gap: 12rpx;
                
                .activity-title {
                    color: #fff;
                    font-size: 28rpx;
                    font-weight: 500;
                    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
                }
            }
        }

        .chat-history {
            flex: 1;
            padding: 30rpx;
            background-color: #f5f7fa;
            border-bottom: 1px solid #eaeaea;
        }

        .content-container {
            display: flex;
            flex-direction: column;
            padding: 20rpx 0 30rpx;
            background-color: #fff;
            box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.03);
            
            .content-area {
                display: flex;
                flex-direction: column;
                width: 80%;
                margin: 0 auto;
                background-color: #f9f9f9;
                border: none;
                border-radius: 24rpx;
                box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
            
                .input-box {
                    display: flex;
                    width: 100%;
            
                    .chat-textarea {
                        width: 100%;
                        padding: 24rpx;
                        font-size: 30rpx;
                        border: none;
                        border-radius: 24rpx 24rpx 0 0;
                        background-color: #fff;
                        color: #333;
                        min-height: 120rpx;
                    }
                }
            
                .actions-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16rpx 24rpx;
                    background-color: #f9f9f9;
                    border-radius: 0 0 24rpx 24rpx;
                    border-top: 1px solid rgba(0, 0, 0, 0.03);
                    
                    .action-bar {
                        display: flex;
                        align-items: center;
                        gap: 24rpx;
                        
                        .activity-selector {
                            display: flex;
                            align-items: center;
                            background-color: #fff;
                            border-radius: 12rpx;
                            border: 1px solid #eaeaea;
                            padding: 8rpx 16rpx;
                            transition: all 0.2s ease;
                            box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
                            
                            &:active {
                                transform: scale(0.98);
                                box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.02);
                            }
                        }
                        
                        .image-uploader {
                            display: flex;
                            align-items: center;
                        }
                    }
                    
                    .action-right {
                        display: flex;
                        align-items: center;
                    }
                }
            }
        }
    }
}

.send-button-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.send-button {
    background-color: #42b983;
    background-image: linear-gradient(135deg, #42b983, #3aa876);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 84rpx;
    height: 84rpx;
    box-shadow: 0 4rpx 12rpx rgba(66, 185, 131, 0.3);
    transition: all 0.2s ease;
    
    &:active {
        transform: scale(0.95);
        box-shadow: 0 2rpx 6rpx rgba(66, 185, 131, 0.2);
    }
    
    &.disabled {
        background-color: #f5f5f5;
        background-image: none;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
        cursor: not-allowed;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4rpx;
        width: 120rpx;
        height: 84rpx;
        border-radius: 42rpx;
        
        .analyzing-text {
            font-size: 20rpx;
            color: #999;
            line-height: 1;
        }
        
        &:active {
            transform: none;
        }
    }
}

.error {
    color: #ff4d4f;
    margin: 20rpx 0;
    font-size: 28rpx;
    padding: 10rpx 16rpx;
    background-color: #fff2f0;
    border-radius: 8rpx;
    border-left: 4rpx solid #ff4d4f;
}

.response-container {
    max-width: 100%;
    margin: 30rpx 0;
    padding: 24rpx;
    background-color: #fff;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

/* 弹窗样式 */
.popup-content {
    background-color: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding-bottom: env(safe-area-inset-bottom);
    max-height: 80vh;
    box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 36rpx;
    border-bottom: 1px solid #f0f0f0;
}

.popup-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
}

.popup-close {
    padding: 10rpx;
    border-radius: 50%;
    transition: background-color 0.2s ease;
    
    &:active {
        background-color: #f5f5f5;
    }
}

.activity-list {
    max-height: 600rpx;
}

.activity-item {
    padding: 36rpx;
    border-bottom: 1px solid #f5f5f5;
    transition: background-color 0.2s ease;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 0;
        height: 2px;
        background-color: #42b983;
        transition: width 0.3s ease;
    }
    
    &:active {
        background-color: #f9f9f9;
        
        &::after {
            width: 100%;
        }
    }
}
</style>