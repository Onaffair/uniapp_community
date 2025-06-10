"use strict";
const common_vendor = require("../common/vendor.js");
const util__oss = require("../util/_oss.js");
const useOSSStore = common_vendor.defineStore("OSSStore", () => {
  const ossUploader = new util__oss.OSSUploader();
  const initialize = async () => {
    await ossUploader.init();
  };
  return {
    ossUploader,
    initialize
  };
});
exports.useOSSStore = useOSSStore;
