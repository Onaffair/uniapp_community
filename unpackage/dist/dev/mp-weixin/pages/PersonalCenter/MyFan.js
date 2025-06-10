"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const store_userStore = require("../../store/userStore.js");
if (!Math) {
  (HeadTop + UserCard)();
}
const HeadTop = () => "../../components/Head/Head.js";
const UserCard = () => "../../components/UserCard/UserCard.js";
const _sfc_main = {
  __name: "MyFan",
  setup(__props) {
    const userStore = store_userStore.useUserStore();
    const fans = common_vendor.computed(() => {
      var _a;
      return ((_a = userStore.getFollowData()) == null ? void 0 : _a.follower) || [];
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          ["go-back"]: true,
          ["head-title"]: "我的粉丝"
        }),
        b: fans.value.length !== 0
      }, fans.value.length !== 0 ? {
        c: common_vendor.f(fans.value, (user, k0, i0) => {
          return {
            a: user.account,
            b: "7d6eef8a-1-" + i0,
            c: common_vendor.p({
              user
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
