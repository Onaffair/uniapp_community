"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const store_userStore = require("../../store/userStore.js");
const api_userAPI = require("../../api/userAPI.js");
if (!Math) {
  (HeadTop + UserCard)();
}
const UserCard = () => "../../components/UserCard/UserCard.js";
const HeadTop = () => "../../components/Head/Head.js";
const _sfc_main = {
  __name: "MyFollow",
  setup(__props) {
    const userStore = store_userStore.useUserStore();
    const following = common_vendor.computed(() => {
      var _a;
      return ((_a = userStore.getFollowData()) == null ? void 0 : _a.following) || [];
    });
    const unfollowUser = async (userId) => {
      try {
        common_vendor.index.showLoading({
          title: "处理中..."
        });
        await api_userAPI.unfollow(userId);
        const res = await api_userAPI.getFollowList();
        if (res && res.data) {
          userStore.setFollowData(res.data);
          common_vendor.index.showToast({
            title: "取消关注成功",
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
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          ["go-back"]: true,
          ["head-title"]: "我的关注"
        }),
        b: following.value.length !== 0
      }, following.value.length !== 0 ? {
        c: common_vendor.f(following.value, (user, k0, i0) => {
          return {
            a: user.account,
            b: common_vendor.o(unfollowUser, user.account),
            c: "3ef2ebec-1-" + i0,
            d: common_vendor.p({
              user,
              ["btn-text"]: "取关"
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
