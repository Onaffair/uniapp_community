export class FriendRequestHandler {

    constructor(userStore) {
        this.userStore = userStore;
    }


     handle(message){
        const systemInfo = userStore.getSystemInfo()
        if (!systemInfo) return

        systemInfo.push(message)

        // 可以添加通知提示
        uni.showToast({
            title: '收到新的好友请求',
            icon: 'none'
        })
    }


}