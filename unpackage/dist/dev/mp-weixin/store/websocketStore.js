"use strict";
const common_vendor = require("../common/vendor.js");
const store_userStore = require("./userStore.js");
const util_basicData = require("../util/basic-data.js");
const util_webSocketUtils = require("../util/webSocketUtils.js");
const api_userAPI = require("../api/userAPI.js");
const useWebSocketStore = common_vendor.defineStore("websocket", () => {
  const userStore = store_userStore.useUserStore();
  const wsInstance = common_vendor.ref(null);
  const isConnected = common_vendor.ref(false);
  const lastError = common_vendor.ref(null);
  const reconnectTimer = common_vendor.ref(null);
  const reconnectAttempts = common_vendor.ref(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3e3;
  const initWebSocket = () => {
    if (!userStore.isLogin || wsInstance.value)
      return;
    try {
      console.log("正在初始化WebSocket连接...");
      wsInstance.value = new util_webSocketUtils.WebSocketUtils(
        util_basicData.wsUrl,
        userStore.token
      );
      setupEventHandlers();
      wsInstance.value.connect();
    } catch (error) {
      console.error("WebSocket初始化错误", error);
      lastError.value = error;
      handleConnectionFailure();
    }
  };
  const setupEventHandlers = () => {
    if (!wsInstance.value)
      return;
    wsInstance.value.setOnOpenCallback(() => {
      console.log("WebSocket连接已建立");
      isConnected.value = true;
      lastError.value = null;
      reconnectAttempts.value = 0;
      clearReconnectTimer();
    });
    wsInstance.value.setOnCloseCallback((event) => {
      console.log("WebSocket连接已关闭", event);
      isConnected.value = false;
      handleConnectionFailure();
    });
    wsInstance.value.setOnErrorCallback((error) => {
      console.error("WebSocket连接发生错误", error);
      lastError.value = error;
      isConnected.value = false;
      handleConnectionFailure();
    });
    wsInstance.value.setOnMessageCallback(async (data) => {
      try {
        const parsedData = JSON.parse(data);
        console.log("收到WebSocket消息:", parsedData);
        if (parsedData.hasOwnProperty("friendMessageId")) {
          await handleFriendMessage(parsedData);
        } else if (parsedData.hasOwnProperty("friendRequestId")) {
          handleFriendRequest(parsedData);
        } else if (parsedData.hasOwnProperty("groupMessageId")) {
          handleGroupMessage(parsedData);
        }
      } catch (error) {
        console.error("消息解析失败:", error);
      }
    });
  };
  const handleFriendMessage = async (messageData) => {
    let friend = userStore.getFriend().find(
      (item) => item.account === messageData.sender || item.account === messageData.receiver
    );
    if (!friend) {
      try {
        const response = await api_userAPI.getFriend();
        if (response && response.code === 200) {
          friend = userStore.getFriend().find(
            (item) => item.account === messageData.sender || item.account === messageData.receiver
          );
        }
      } catch (error) {
        console.error("获取好友列表失败:", error);
      }
      if (!friend) {
        console.warn("找不到消息对应的好友:", messageData);
        return;
      }
    }
    if (!friend.chat)
      friend.chat = [];
    friend.chat.push(messageData);
  };
  const handleFriendRequest = (requestData) => {
    const systemInfo = userStore.getSystemInfo();
    if (!systemInfo)
      return;
    systemInfo.push(requestData);
    common_vendor.index.showToast({
      title: "收到新的好友请求",
      icon: "none"
    });
  };
  const handleGroupMessage = (messageData) => {
    const groups = userStore.getGroup();
    if (!groups)
      return;
    const group = groups.find(
      (item) => item.group.groupId === messageData.groupId
    );
    if (!group) {
      console.warn("找不到消息对应的群组:", messageData);
      return;
    }
    if (!group.chat)
      group.chat = [];
    group.chat.push(messageData);
  };
  const handleConnectionFailure = () => {
    cleanup();
    reconnectAttempts.value++;
    if (reconnectAttempts.value <= maxReconnectAttempts && userStore.isLogin) {
      scheduleReconnect();
    } else if (reconnectAttempts.value > maxReconnectAttempts) {
      console.error(`已达到最大重连次数(${maxReconnectAttempts})，停止重连`);
      common_vendor.index.showToast({
        title: "网络连接不稳定，请稍后重试",
        icon: "none",
        duration: 3e3
      });
    }
  };
  const cleanup = () => {
    if (wsInstance.value) {
      wsInstance.value.close().catch((error) => {
        console.error("关闭WebSocket连接失败:", error);
      }).finally(() => {
        wsInstance.value = null;
      });
    }
  };
  const clearReconnectTimer = () => {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value);
      reconnectTimer.value = null;
    }
  };
  const scheduleReconnect = () => {
    if (userStore.isLogin && !reconnectTimer.value) {
      const delay = reconnectDelay * Math.min(reconnectAttempts.value, 3);
      console.log(`将在${delay / 1e3}秒后尝试重连，当前尝试次数: ${reconnectAttempts.value}`);
      reconnectTimer.value = setTimeout(() => {
        reconnectTimer.value = null;
        if (!userStore.isLogin) {
          console.log("用户已登出，取消重连");
          return;
        }
        console.log("尝试重新连接WebSocket...");
        initWebSocket();
      }, delay);
    }
  };
  const sendMessage = async (message) => {
    if (!wsInstance.value || !isConnected.value) {
      console.warn("WebSocket未连接，无法发送消息");
      if (userStore.isLogin && !wsInstance.value) {
        console.log("WebSocket不存在，尝试重新初始化...");
        initWebSocket();
        common_vendor.index.showToast({
          title: "网络连接中，请稍后重试",
          icon: "none"
        });
      }
      return false;
    }
    try {
      const messageStr = typeof message === "object" ? JSON.stringify(message) : message;
      await wsInstance.value.sendMessage(messageStr);
      return true;
    } catch (error) {
      console.error("消息发送失败:", error);
      isConnected.value = false;
      handleConnectionFailure();
      return false;
    }
  };
  const reset = () => {
    cleanup();
    clearReconnectTimer();
    isConnected.value = false;
    lastError.value = null;
    reconnectAttempts.value = 0;
  };
  const forceReconnect = () => {
    reset();
    reconnectAttempts.value = 0;
    initWebSocket();
  };
  common_vendor.watch(() => userStore.isLogin, (newVal) => {
    if (newVal) {
      initWebSocket();
    } else {
      reset();
    }
  }, { immediate: true });
  common_vendor.watch(() => userStore.token, (newVal, oldVal) => {
    if (wsInstance.value && newVal !== oldVal) {
      console.log("Token已更新，重新连接WebSocket");
      wsInstance.value.setToken(newVal);
      forceReconnect();
    }
  });
  return {
    isConnected,
    lastError,
    sendMessage,
    initWebSocket,
    cleanup,
    forceReconnect
  };
});
exports.useWebSocketStore = useWebSocketStore;
