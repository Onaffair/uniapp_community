"use strict";
const common_vendor = require("../../common/vendor.js");
const store_userStore = require("../../store/userStore.js");
const util_basicData = require("../../util/basic-data.js");
const api_userAPI = require("../../api/userAPI.js");
if (!Math) {
  (Login + ImgUploader)();
}
const ImgUploader = () => "../../components/ImgUploader/ImgUploader.js";
const Login = () => "../../components/Login/Login.js";
const _sfc_main = {
  __name: "PersonalCenter",
  setup(__props) {
    const userStore = store_userStore.useUserStore();
    const { userDetail, isLogin } = common_vendor.storeToRefs(userStore);
    const editInfo = common_vendor.computed(() => {
      return {
        avatar: userDetail.value.avatar,
        username: userDetail.value.username,
        email: userDetail.value.email,
        phone: userDetail.value.phone
      };
    });
    const showSettings = common_vendor.ref(false);
    const toggleSettings = () => {
      showSettings.value = !showSettings.value;
    };
    const saveInfo = async () => {
      try {
        await api_userAPI.userEditInfo(editInfo.value);
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      }
    };
    const navigateTo = (url) => {
      common_vendor.index.navigateTo({
        url
      });
    };
    const logout = async () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_userAPI.userQuit();
              common_vendor.index.switchTab({
                url: "/pages/Index/Index"
              });
            } catch (error) {
              common_vendor.index.showToast({
                title: "退出失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(isLogin) === false
      }, common_vendor.unref(isLogin) === false ? {} : common_vendor.e({
        b: common_vendor.unref(util_basicData.imgBaseUrl) + common_vendor.unref(userDetail).avatar,
        c: common_vendor.t(common_vendor.unref(userDetail).username),
        d: common_vendor.t(common_vendor.unref(userDetail).email),
        e: common_vendor.t(common_vendor.unref(userDetail).phone),
        f: common_vendor.o(toggleSettings),
        g: showSettings.value
      }, showSettings.value ? {
        h: common_vendor.o(($event) => common_vendor.unref(userDetail).avatar = $event),
        i: common_vendor.p({
          ["max-count"]: 1,
          replace: true,
          ["show-delete"]: false,
          ["img-src"]: common_vendor.unref(userDetail).avatar
        }),
        j: editInfo.value.username,
        k: common_vendor.o(($event) => editInfo.value.username = $event.detail.value),
        l: editInfo.value.email,
        m: common_vendor.o(($event) => editInfo.value.email = $event.detail.value),
        n: editInfo.value.phone,
        o: common_vendor.o(($event) => editInfo.value.phone = $event.detail.value),
        p: common_vendor.o(saveInfo)
      } : {}, {
        q: common_vendor.o(($event) => navigateTo("/pages/Chat/AIChat")),
        r: common_vendor.o(($event) => navigateTo("/pages/PersonalCenter/MyFollow")),
        s: common_vendor.o(($event) => navigateTo("/pages/PersonalCenter/MyFan")),
        t: common_vendor.o(($event) => navigateTo("/pages/PersonalCenter/SystemInfo")),
        v: common_vendor.o(logout)
      }));
    };
  }
};
wx.createPage(_sfc_main);
