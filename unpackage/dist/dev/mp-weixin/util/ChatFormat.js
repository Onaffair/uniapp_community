"use strict";
class FriendMessage {
  constructor(sender, receiver, textContent = "", imageUrl = "") {
    this.sender = sender;
    this.receiver = receiver;
    this.textContent = textContent;
    this.imageUrl = imageUrl;
  }
}
class GroupMessage {
  constructor(sender, groupId, textContent = "", imageUrl = "") {
    this.sender = sender;
    this.groupId = groupId;
    this.textContent = textContent;
    this.imageUrl = imageUrl;
  }
}
exports.FriendMessage = FriendMessage;
exports.GroupMessage = GroupMessage;
