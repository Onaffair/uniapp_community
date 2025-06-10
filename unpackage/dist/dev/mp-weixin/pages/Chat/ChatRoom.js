"use strict";
const common_vendor = require("../../common/vendor.js");
const store_userStore = require("../../store/userStore.js");
const store_websocketStore = require("../../store/websocketStore.js");
const util_ChatFormat = require("../../util/ChatFormat.js");
if (!Array) {
  const _easycom_ImgUploader2 = common_vendor.resolveComponent("ImgUploader");
  _easycom_ImgUploader2();
}
const _easycom_ImgUploader = () => "../../components/ImgUploader/ImgUploader.js";
if (!Math) {
  (HeadTop + ChatMessage + _easycom_ImgUploader)();
}
const HeadTop = () => "../../components/Head/Head.js";
const ChatMessage = () => "../../components/ChatMessage/ChatMessage.js";
const _sfc_main = {
  __name: "ChatRoom",
  setup(__props) {
    const targetId = common_vendor.ref("");
    const targetName = common_vendor.ref("");
    const chatType = common_vendor.ref("");
    common_vendor.onLoad((options) => {
      targetId.value = options.targetId;
      targetName.value = options.targetName;
      chatType.value = options.type;
    });
    const userStore = store_userStore.useUserStore();
    const ws = store_websocketStore.useWebSocketStore();
    const myAccount = userStore.getUser().account;
    const inputMessage = common_vendor.ref("");
    const inputImg = common_vendor.ref("");
    const scrollTop = common_vendor.ref(0);
    const scrollToView = common_vendor.ref("");
    const isLoadingMore = common_vendor.ref(false);
    const currentChat = common_vendor.computed(() => {
      const friend = userStore.getFriend().find((f) => f.account === targetId.value);
      if (friend) {
        return {
          targetId: targetId.value,
          targetName: targetName.value,
          chat: friend.chat || []
        };
      }
      return { targetId: targetId.value, targetName: targetName.value, chat: [] };
    });
    common_vendor.onMounted(() => {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    });
    const scrollToBottom = () => {
      const messages = currentChat.value.chat;
      if (messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        scrollToView.value = `msg-${lastMessage.messageId}`;
      }
      common_vendor.nextTick$1(() => {
        const query = common_vendor.index.createSelectorQuery().in(this);
        query.select("#chat-scroll").boundingClientRect((data) => {
          if (data) {
            scrollTop.value = data.height * 1e4;
          }
        }).exec();
      });
    };
    const loadMoreMessages = () => {
      if (isLoadingMore.value)
        return;
      isLoadingMore.value = true;
      setTimeout(() => {
        isLoadingMore.value = false;
      }, 250);
    };
    const sendMessage = () => {
      if (!inputMessage.value.trim() && !inputImg.value)
        return;
      const formatMessage = new util_ChatFormat.FriendMessage(myAccount, targetId.value, inputMessage.value, inputImg.value);
      ws.sendMessage({
        type: chatType.value,
        data: formatMessage
      });
      inputMessage.value = "";
      inputImg.value = "";
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    };
    const getSenderAvatar = (message) => {
      var _a;
      return message.sender === myAccount ? userStore.getUser().avatar : (_a = userStore.getFriend().find((f) => f.account === message.sender)) == null ? void 0 : _a.avatar;
    };
    const getSenderName = (message) => {
      var _a;
      return message.sender === myAccount ? "我" : ((_a = userStore.getFriend().find((f) => f.account === message.sender)) == null ? void 0 : _a.userName) || "好友";
    };
    common_vendor.watch(() => currentChat.value.chat.length, () => {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          ["go-back"]: true,
          ["head-title"]: targetName.value
        }),
        b: isLoadingMore.value
      }, isLoadingMore.value ? {} : {}, {
        c: common_vendor.f(currentChat.value.chat, (message, k0, i0) => {
          return {
            a: message.messageId,
            b: `msg-${message.messageId}`,
            c: "ef76d3e8-1-" + i0,
            d: common_vendor.p({
              avatar: getSenderAvatar(message),
              name: getSenderName(message),
              message: message.textContent,
              time: message.createdAt,
              ["is-me"]: message.sender === common_vendor.unref(myAccount),
              ["image-url"]: message.imageUrl,
              account: message.sender,
              id: `msg-${message.messageId}`
            })
          };
        }),
        d: scrollTop.value,
        e: common_vendor.o(loadMoreMessages),
        f: scrollToView.value,
        g: common_vendor.o(sendMessage),
        h: inputMessage.value,
        i: common_vendor.o(($event) => inputMessage.value = $event.detail.value),
        j: common_vendor.o(sendMessage),
        k: common_vendor.o(($event) => inputImg.value = $event),
        l: common_vendor.p({
          ["max-count"]: 1,
          ["icon-style"]: {
            width: "80rpx",
            height: "80rpx"
          },
          ["img-style"]: {
            width: "80rpx",
            height: "80rpx"
          },
          ["img-src"]: inputImg.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ef76d3e8"]]);
wx.createPage(MiniProgramPage);
