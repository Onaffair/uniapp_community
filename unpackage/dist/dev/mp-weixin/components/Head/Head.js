"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "Head",
  props: {
    headTitle: {
      type: String,
      default: ""
    },
    goBack: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    const goBackDo = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.goBack
      }, __props.goBack ? {
        b: common_vendor.o(goBackDo)
      } : {}, {
        c: __props.headTitle
      }, __props.headTitle ? {
        d: common_vendor.t(__props.headTitle)
      } : {});
    };
  }
};
wx.createComponent(_sfc_main);
