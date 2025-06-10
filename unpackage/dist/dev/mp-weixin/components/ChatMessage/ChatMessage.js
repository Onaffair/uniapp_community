"use strict";
const common_vendor = require("../../common/vendor.js");
const util_basicData = require("../../util/basic-data.js");
const _sfc_main = {
  __name: "ChatMessage",
  props: {
    account: String,
    avatar: String,
    name: String,
    message: String,
    time: String,
    isMe: Boolean,
    imageUrl: String
  },
  setup(__props) {
    const props = __props;
    const formatTime = (timestamp) => {
      return common_vendor.dayjs(timestamp).format("MM:ss");
    };
    const processMessage = (text) => {
      if (!text)
        return "";
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(urlRegex, (url) => {
        return `<a href="${url}" style="color: #007bff; text-decoration: underline;">${url}</a>`;
      });
    };
    const processedMessage = common_vendor.computed(() => {
      return processMessage(props.message || "");
    });
    const handleLinkClick = (e) => {
      console.log("链接点击，需要自定义处理");
    };
    const goToUserDetail = () => {
      common_vendor.index.navigateTo({
        url: `/pages/Detail/UserDetailPage?id=${props.account}`
      });
    };
    const showImg = () => {
      common_vendor.index.previewImage({
        urls: [util_basicData.imgBaseUrl + props.imageUrl],
        current: util_basicData.imgBaseUrl + props.imageUrl
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(util_basicData.imgBaseUrl) + __props.avatar,
        b: common_vendor.o(goToUserDetail),
        c: common_vendor.t(__props.name),
        d: __props.message
      }, __props.message ? {
        e: processedMessage.value,
        f: common_vendor.o(handleLinkClick)
      } : {}, {
        g: __props.imageUrl
      }, __props.imageUrl ? {
        h: common_vendor.unref(util_basicData.imgBaseUrl) + __props.imageUrl,
        i: common_vendor.o(showImg)
      } : {}, {
        j: common_vendor.t(formatTime(__props.time)),
        k: __props.isMe ? 1 : ""
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2b027b6e"]]);
wx.createComponent(Component);
