import {getFriend} from "@/api";

export class FriendMessageHandler {

    constructor(userStore) {
        this.userStore = userStore
    }

    async handle(message) {
        // 查找好友
        let friend = this.userStore.getFriend().find(item =>
            item.account === message.sender ||
            item.account === message.receiver
        )

        // 如果好友不存在，重新获取好友列表
        if (!friend) {
            try {
                // 使用API获取最新好友列表
                const response = await getFriend()
                if (response && response.code === 200) {
                    // 更新好友列表后再次查找
                    friend = this.userStore.getFriend().find(item =>
                        item.account === message.sender ||
                        item.account === message.receiver
                    )
                }
            } catch (error) {
                console.error('获取好友列表失败:', error)
            }

            // 如果仍找不到好友，放弃处理该消息
            if (!friend) {
                console.warn('找不到消息对应的好友:', message)
                return
            }
        }

        // 确保chat数组存在
        if (!friend.chat) friend.chat = []

        // 添加消息到聊天记录
        friend.chat.push(message)
    }

}