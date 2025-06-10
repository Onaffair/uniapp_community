"use strict";
const common_vendor = require("../../common/vendor.js");
const util_basicData = require("../../util/basic-data.js");
const _sfc_main = {
  __name: "UserCard",
  props: {
    user: Object,
    btn_text: {
      type: String,
      default: null
    }
  },
  emits: ["btnClick"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const btnClick = () => {
      emit("btnClick", props.user.account);
    };
    const goToUserDetail = () => {
      common_vendor.index.navigateTo({
        url: `/pages/Detail/UserDetailPage?id=${props.user.account}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(util_basicData.imgBaseUrl) + __props.user.avatar,
        b: common_vendor.o(goToUserDetail),
        c: common_vendor.t(__props.user.name),
        d: common_vendor.t(__props.user.status === "online" ? "在线" : "离线"),
        e: __props.user.status === "online" ? 1 : "",
        f: __props.user.status === "offline" ? 1 : "",
        g: common_vendor.o(goToUserDetail),
        h: __props.btn_text
      }, __props.btn_text ? {
        i: common_vendor.t(__props.btn_text),
        j: common_vendor.o(btnClick)
      } : {});
    };
  }
};
wx.createComponent(_sfc_main);
