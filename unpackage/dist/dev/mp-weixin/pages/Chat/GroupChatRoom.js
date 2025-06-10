"use strict";
const common_vendor = require("../../common/vendor.js");
const store_userStore = require("../../store/userStore.js");
const store_websocketStore = require("../../store/websocketStore.js");
const util_ChatFormat = require("../../util/ChatFormat.js");
const util_basicData = require("../../util/basic-data.js");
const api_GroupApI = require("../../api/GroupApI.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (HeadTop + ChatMessage + ImgUploader + ImgUploader + _easycom_uni_popup)();
}
const HeadTop = () => "../../components/Head/Head.js";
const ChatMessage = () => "../../components/ChatMessage/ChatMessage.js";
const ImgUploader = () => "../../components/ImgUploader/ImgUploader.js";
const _sfc_main = {
  __name: "GroupChatRoom",
  setup(__props) {
    const targetId = common_vendor.ref("");
    const chatType = common_vendor.ref("");
    common_vendor.onLoad((options) => {
      targetId.value = options.targetId;
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
    const showGroupInfo = common_vendor.ref(false);
    const isEditing = common_vendor.ref(false);
    const isSubmitting = common_vendor.ref(false);
    const editData = common_vendor.ref({
      groupName: "",
      announcement: "",
      avatar: ""
    });
    const groupInfo = common_vendor.computed(() => {
      return userStore.getGroup().find((g) => g.group.groupId == targetId.value) || { group: {}, members: [] };
    });
    const isGroupOwner = common_vendor.computed(() => {
      var _a;
      return ((_a = groupInfo.value.group) == null ? void 0 : _a.ownerAccount) === myAccount;
    });
    const groupMembers = common_vendor.computed(() => {
      return groupInfo.value.members || [];
    });
    const chatMessages = common_vendor.computed(() => {
      return groupInfo.value.chat || [];
    });
    common_vendor.watch(showGroupInfo, (newVal) => {
      const popup = common_vendor.index.createSelectorQuery().in(this).select(".uni-popup");
      if (popup) {
        if (newVal) {
          popup.callMethod("open");
        } else {
          popup.callMethod("close");
        }
      }
    });
    common_vendor.onMounted(() => {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    });
    const scrollToBottom = () => {
      const messages = chatMessages.value;
      if (messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        scrollToView.value = `msg-${lastMessage.groupMessageId}`;
      }
      common_vendor.nextTick$1(() => {
        const query = common_vendor.index.createSelectorQuery().in(this);
        query.select("#chat-scroll").boundingClientRect((data) => {
          if (data) {
            scrollTop.value = data.height * 2;
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
      }, 1e3);
    };
    const getSenderAvatar = (message) => {
      var _a;
      return ((_a = groupMembers.value.find((m) => m.account === message.sender)) == null ? void 0 : _a.avatar) || "";
    };
    const getSenderName = (message) => {
      var _a;
      return ((_a = groupMembers.value.find((m) => m.account === message.sender)) == null ? void 0 : _a.name) || "该群员已退群";
    };
    const getMemberName = (account) => {
      var _a;
      return ((_a = groupMembers.value.find((m) => m.account === account)) == null ? void 0 : _a.name) || account;
    };
    const startEditing = () => {
      editData.value = {
        groupName: groupInfo.value.group.groupName || "",
        announcement: groupInfo.value.group.announcement || "",
        avatar: groupInfo.value.group.avatar || ""
      };
      isEditing.value = true;
    };
    const cancelEditing = () => {
      isEditing.value = false;
    };
    const saveGroupInfo = async () => {
      if (isSubmitting.value)
        return;
      if (!editData.value.groupName.trim()) {
        common_vendor.index.showToast({
          title: "群名称不能为空",
          icon: "none"
        });
        return;
      }
      try {
        isSubmitting.value = true;
        const groupData = {
          groupId: groupInfo.value.group.groupId,
          groupName: editData.value.groupName,
          announcement: editData.value.announcement,
          avatar: editData.value.avatar,
          ownerAccount: groupInfo.value.group.ownerAccount
        };
        const result = await api_GroupApI.updateGroup(groupData);
        if (result.code === 200) {
          userStore.updateGroupInfo(groupData);
          common_vendor.index.showToast({
            title: "群信息更新成功",
            icon: "success"
          });
          isEditing.value = false;
        } else {
          common_vendor.index.showToast({
            title: result.message || "更新失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "更新失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    const sendMessage = () => {
      if (!inputMessage.value.trim() && !inputImg.value)
        return;
      const formatMessage = new util_ChatFormat.GroupMessage(
        myAccount,
        targetId.value,
        inputMessage.value,
        inputImg.value
      );
      ws.sendMessage({
        type: "group",
        data: formatMessage
      });
      inputMessage.value = "";
      inputImg.value = "";
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    };
    common_vendor.watch(() => chatMessages.value.length, () => {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => showGroupInfo.value = true),
        b: common_vendor.p({
          ["go-back"]: true,
          ["head-title"]: groupInfo.value.group.groupName
        }),
        c: isLoadingMore.value
      }, isLoadingMore.value ? {} : {}, {
        d: common_vendor.f(chatMessages.value, (message, k0, i0) => {
          return {
            a: message.groupMessageId,
            b: `msg-${message.groupMessageId}`,
            c: "6d4cb16f-1-" + i0,
            d: common_vendor.p({
              avatar: getSenderAvatar(message),
              name: getSenderName(message),
              message: message.textContent,
              time: message.createdAt,
              ["is-me"]: message.sender === common_vendor.unref(myAccount),
              ["image-url"]: message.imageUrl,
              account: message.sender,
              id: `msg-${message.groupMessageId}`
            })
          };
        }),
        e: scrollTop.value,
        f: common_vendor.o(loadMoreMessages),
        g: scrollToView.value,
        h: common_vendor.o(sendMessage),
        i: inputMessage.value,
        j: common_vendor.o(($event) => inputMessage.value = $event.detail.value),
        k: common_vendor.o(sendMessage),
        l: common_vendor.o(($event) => inputImg.value = $event),
        m: common_vendor.p({
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
        }),
        n: isEditing.value && isGroupOwner.value
      }, isEditing.value && isGroupOwner.value ? {
        o: common_vendor.o(($event) => editData.value.avatar = $event),
        p: common_vendor.p({
          ["max-count"]: 1,
          modelValue: editData.value.avatar
        }),
        q: editData.value.groupName,
        r: common_vendor.o(($event) => editData.value.groupName = $event.detail.value)
      } : {
        s: groupInfo.value.group.avatar ? common_vendor.unref(util_basicData.imgBaseUrl) + groupInfo.value.group.avatar : "/static/images/default-group.png",
        t: common_vendor.t(groupInfo.value.group.groupName)
      }, {
        v: common_vendor.t(getMemberName(groupInfo.value.group.ownerAccount)),
        w: isGroupOwner.value && !isEditing.value
      }, isGroupOwner.value && !isEditing.value ? {
        x: common_vendor.o(startEditing)
      } : {}, {
        y: isEditing.value && isGroupOwner.value
      }, isEditing.value && isGroupOwner.value ? {
        z: editData.value.announcement,
        A: common_vendor.o(($event) => editData.value.announcement = $event.detail.value),
        B: common_vendor.o(saveGroupInfo),
        C: common_vendor.o(cancelEditing)
      } : {
        D: common_vendor.t(groupInfo.value.group.announcement || "暂无公告")
      }, {
        E: common_vendor.t(groupMembers.value.length),
        F: common_vendor.f(groupMembers.value, (member, k0, i0) => {
          return {
            a: common_vendor.unref(util_basicData.imgBaseUrl) + member.avatar,
            b: common_vendor.t(member.name),
            c: common_vendor.t(member.status === "online" ? "在线" : "离线"),
            d: common_vendor.n(member.status),
            e: member.account
          };
        }),
        G: common_vendor.sr("popup", "6d4cb16f-3"),
        H: common_vendor.p({
          type: "right",
          ["mask-click"]: true
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6d4cb16f"]]);
wx.createPage(MiniProgramPage);
