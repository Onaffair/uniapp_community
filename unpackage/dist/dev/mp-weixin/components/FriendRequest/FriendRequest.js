"use strict";
const common_vendor = require("../../common/vendor.js");
const util_basicData = require("../../util/basic-data.js");
const _sfc_main = {
  __name: "FriendRequest",
  props: {
    request: Object
  },
  emits: ["accept", "reject"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const acceptRequest = () => {
      emit("accept", props.request);
    };
    const rejectRequest = () => {
      emit("reject", props.request);
    };
    const formatTime = (timestamp) => {
      return timestamp.replace("T", " ").slice(0, 16);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(util_basicData.imgBaseUrl) + __props.request.avatar,
        b: common_vendor.t(__props.request.name),
        c: common_vendor.t(formatTime(__props.request.createdAt)),
        d: __props.request.status === 0
      }, __props.request.status === 0 ? {
        e: common_vendor.o(acceptRequest),
        f: common_vendor.o(rejectRequest)
      } : {
        g: common_vendor.t(__props.request.status === 1 ? "已同意" : "已拒绝")
      });
    };
  }
};
wx.createComponent(_sfc_main);
