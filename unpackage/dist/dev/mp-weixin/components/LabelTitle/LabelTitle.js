"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "LabelTitle",
  props: {
    msg: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(__props.msg)
      };
    };
  }
};
wx.createComponent(_sfc_main);
