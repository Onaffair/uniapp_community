"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
require("./store/activityStore.js");
require("./store/tabStore.js");
const store_userStore = require("./store/userStore.js");
const store_websocketStore = require("./store/websocketStore.js");
const api_userAPI = require("./api/userAPI.js");
const api_activityAPI = require("./api/activityAPI.js");
if (!Math) {
  "./pages/Home/Home.js";
  "./pages/Index/Index.js";
  "./pages/Register/Register.js";
  "./pages/Detail/ActivityDetailPage.js";
  "./pages/Detail/UserDetailPage.js";
  "./pages/launchActivity/LaunchActivity.js";
  "./pages/launchActivity/ActivityContent.js";
  "./pages/launchActivity/ActivityPeopleNum.js";
  "./pages/launchActivity/ActivityPosition.js";
  "./pages/launchActivity/ActivityTime.js";
  "./pages/Chat/MyChat.js";
  "./pages/Home/Activity.js";
  "./pages/PersonalCenter/PersonalCenter.js";
  "./pages/Chat/ChatRoom.js";
  "./pages/Chat/GroupChatRoom.js";
  "./pages/PersonalCenter/MyFan.js";
  "./pages/PersonalCenter/MyFollow.js";
  "./pages/PersonalCenter/SystemInfo.js";
  "./pages/Chat/AIChat.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    const userStore = store_userStore.useUserStore();
    common_vendor.onLaunch(() => {
      api_activityAPI.getCityAndCategory();
      if (userStore.getIsLogin()) {
        api_userAPI.reFreshToken().then((res) => {
          if ((res == null ? void 0 : res.code) !== 200)
            return;
          api_userAPI.getUserInfo().then((res2) => {
            userStore.setUser(res2 == null ? void 0 : res2.data);
          });
          api_activityAPI.getJoinedActivity();
          api_activityAPI.getUserActivity().then((res2) => {
            userStore.setMyActivity(res2 == null ? void 0 : res2.data);
          });
          store_websocketStore.useWebSocketStore();
          api_userAPI.getFriend();
          api_userAPI.getFollowList().then((res2) => {
            userStore.setFollowData(res2 == null ? void 0 : res2.data);
          });
        });
      }
    });
    return () => {
    };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  pinia.use(common_vendor.createPersistedState({
    storage: {
      getItem: (key) => {
        return common_vendor.index.getStorageSync(key);
      },
      setItem: (key, value) => {
        common_vendor.index.setStorageSync(key, value);
      },
      removeItem: (key) => {
        common_vendor.index.removeStorageSync(key);
      }
    }
  }));
  app.use(pinia);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
