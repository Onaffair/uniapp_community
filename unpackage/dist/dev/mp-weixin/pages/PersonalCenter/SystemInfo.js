"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const store_userStore = require("../../store/userStore.js");
const store_websocketStore = require("../../store/websocketStore.js");
const api_userAPI = require("../../api/userAPI.js");
const util_ChatFormat = require("../../util/ChatFormat.js");
if (!Math) {
  (HeadTop + FriendRequest)();
}
const FriendRequest = () => "../../components/FriendRequest/FriendRequest.js";
const HeadTop = () => "../../components/Head/Head.js";
const delay = 250;
const _sfc_main = {
  __name: "SystemInfo",
  setup(__props) {
    const userStore = store_userStore.useUserStore();
    const requests = common_vendor.computed(() => userStore.getSystemInfo() || []);
    const requestsInfo = common_vendor.ref([]);
    let timer = null;
    common_vendor.onMounted(() => {
      const userList = requests.value.map((item) => item.sender);
      if (userList.length > 0) {
        api_userAPI.getRequesterInfo(userList).then((res) => res == null ? void 0 : res.data).then((res) => {
          if (res && Array.isArray(res)) {
            res.forEach((item) => {
              requestsInfo.value.push({
                ...item,
                ...requests.value.find((i) => i.sender === item.account)
              });
            });
          }
        }).catch((error) => {
          console.error("获取请求者信息失败", error);
        });
      }
    });
    const handleAccept = (request) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          common_vendor.index.showLoading({
            title: "处理中..."
          });
          const res = await api_userAPI.friendRequestAccept(request.friendRequestId);
          if (res.code === 200) {
            const ws = store_websocketStore.useWebSocketStore();
            const formatMessage = new util_ChatFormat.FriendMessage(
              userStore.getUser().account,
              request.sender,
              "我们已经是好友了,开始了聊天吧",
              ""
            );
            ws.sendMessage({
              type: "friend",
              data: formatMessage
            });
            const friendReqRes = await api_userAPI.getFriendRequest();
            if (friendReqRes == null ? void 0 : friendReqRes.data) {
              userStore.setSystemInfo(friendReqRes.data);
              const reqIndex = requestsInfo.value.findIndex((item) => item.friendRequestId === request.friendRequestId);
              if (reqIndex !== -1) {
                requestsInfo.value[reqIndex].status = 1;
              }
            }
            common_vendor.index.showToast({
              title: "已接受请求",
              icon: "success"
            });
          }
        } catch (error) {
          common_vendor.index.showToast({
            title: "操作失败",
            icon: "none"
          });
        } finally {
          common_vendor.index.hideLoading();
        }
      }, delay);
    };
    const handleReject = (request) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          common_vendor.index.showLoading({
            title: "处理中..."
          });
          const res = await api_userAPI.friendRequestRefuse(request.friendRequestId);
          if (res.code === 200) {
            const friendReqRes = await api_userAPI.getFriendRequest();
            if (friendReqRes == null ? void 0 : friendReqRes.data) {
              userStore.setSystemInfo(friendReqRes.data);
              const reqIndex = requestsInfo.value.findIndex((item) => item.friendRequestId === request.friendRequestId);
              if (reqIndex !== -1) {
                requestsInfo.value[reqIndex].status = 2;
              }
            }
            common_vendor.index.showToast({
              title: "已拒绝请求",
              icon: "success"
            });
          }
        } catch (error) {
          common_vendor.index.showToast({
            title: "操作失败",
            icon: "none"
          });
        } finally {
          common_vendor.index.hideLoading();
        }
      }, delay);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          ["go-back"]: true,
          ["head-title"]: "好友请求"
        }),
        b: requestsInfo.value.length !== 0
      }, requestsInfo.value.length !== 0 ? {
        c: common_vendor.f(requestsInfo.value, (request, k0, i0) => {
          return {
            a: request.friendRequestId,
            b: common_vendor.o(handleAccept, request.friendRequestId),
            c: common_vendor.o(handleReject, request.friendRequestId),
            d: "64bad7ca-1-" + i0,
            e: common_vendor.p({
              request
            })
          };
        })
      } : {
        d: common_assets._imports_0
      });
    };
  }
};
wx.createPage(_sfc_main);
