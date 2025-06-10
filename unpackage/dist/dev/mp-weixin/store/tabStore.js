"use strict";
const common_vendor = require("../common/vendor.js");
common_vendor.defineStore("tab", () => {
  const tab = common_vendor.ref(0);
  const getTab = () => tab.value;
  const setTab = (val) => {
    tab.value = val;
  };
  return {
    tab,
    getTab,
    setTab
  };
}, {
  persist: {
    enabled: true,
    key: "tabStore"
  }
});
