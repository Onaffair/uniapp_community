"use strict";
const common_vendor = require("../common/vendor.js");
const alertFail = (tag, msg) => {
  console.log(tag, msg);
  common_vendor.index.showModal({
    title: "提示",
    content: msg,
    showCancel: false
  });
};
exports.alertFail = alertFail;
