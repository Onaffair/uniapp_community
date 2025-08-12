import {FriendMessageHandler} from "@/util/messageHandler/FriendMessageHandler";
import {FriendRequestHandler} from "@/util/messageHandler/FriendRequestHandler";
import {GroupMessageHandler} from "@/util/messageHandler/GroupMessageHandler";

export class MessageDispatcher {

    constructor(userStore) {
        this.handlers = {
            friendMessageId:new FriendMessageHandler(userStore),
            friendRequestId:new FriendRequestHandler(userStore),
            groupMessageId:new GroupMessageHandler(userStore),
        }
    }

    dispatch(rawData){
        try {
            const parsedData = JSON.parse(rawData);
            const typeKey = Object.keys(this.handlers).find(k => k in parsedData)
            if (!typeKey){
                console.warn("未知消息类型")
                return
            }
            console.log("开始分发消息")
            this.handlers[typeKey].handle(parsedData)

        }catch (e){
            console.error("消息解析错误:",e)
        }
    }
}