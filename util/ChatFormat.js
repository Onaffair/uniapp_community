// ChatFormat.js
// 定义消息格式类

export class FriendMessage {
    constructor(sender, receiver, textContent = "", imageUrl = "") {
        this.sender = sender;
        this.receiver = receiver;
        this.textContent = textContent;
        this.imageUrl = imageUrl;
    }
}

export class FriendRequest {
    constructor(sender, receiver) {
        this.requestId = 0
        this.sender = sender
        this.receiver = receiver
        this.status = 0
        this.createdAt = ""
    }
}

export class GroupMessage {
    constructor(sender, groupId, textContent = "", imageUrl = "") {
        this.sender = sender;
        this.groupId = groupId;
        this.textContent = textContent;
        this.imageUrl = imageUrl;
    }
} 