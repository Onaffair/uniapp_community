"use strict";
const store_userStore = require("../../store/userStore.js");
const common_vendor = require("../../common/vendor.js");
const api_userAPI = require("../../api/userAPI.js");
const api_activityAPI = require("../../api/activityAPI.js");
const store_websocketStore = require("../../store/websocketStore.js");
const api_GroupApI = require("../../api/GroupApI.js");
const _sfc_main = {
  __name: "Index",
  setup(__props) {
    const userStore = store_userStore.useUserStore();
    common_vendor.onBeforeMount(() => {
      if (userStore.getIsLogin()) {
        api_userAPI.reFreshToken().then((res) => {
          if ((res == null ? void 0 : res.code) !== 200)
            return;
          api_activityAPI.getJoinedActivity();
          api_activityAPI.getUserActivity().then((res2) => {
            userStore.setMyActivity(res2 == null ? void 0 : res2.data);
          });
          store_websocketStore.useWebSocketStore();
          api_userAPI.getFriend();
          api_userAPI.getFollowList().then((res2) => {
            userStore.setFollowData(res2 == null ? void 0 : res2.data);
          });
          api_userAPI.getFriendRequest().then((res2) => {
            userStore.setSystemInfo(res2 == null ? void 0 : res2.data);
          });
          api_GroupApI.geyMyGroup();
        });
      }
      api_activityAPI.getCityAndCategory();
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
};
wx.createPage(_sfc_main);
