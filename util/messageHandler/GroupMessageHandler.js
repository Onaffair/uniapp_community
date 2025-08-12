export class GroupMessageHandler{

    constructor(userStore){
        this.userStore = userStore
    }

     handle(message){
        const groups = this.userStore.getGroup()
        if (!groups) return

        // 查找对应群组
        const group = groups.find(item =>
            item.group.groupId === message.groupId
        )

        if (!group) {
            console.warn('找不到消息对应的群组:', message)
            return
        }

        // 确保chat数组存在
        if (!group.chat) group.chat = []

        // 添加消息到聊天记录
        group.chat.push(message)
    }




}