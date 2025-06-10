"use strict";
const common_vendor = require("../../common/vendor.js");
const util_basicData = require("../../util/basic-data.js");
const _sfc_main = {
  __name: "Comment",
  props: {
    userinfo: {
      type: Object,
      required: true
    },
    comment: {
      type: Object,
      required: true
    }
  },
  emits: ["onClickReply"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const reply = () => {
      emits("onClickReply", props.comment.commentId, props.comment.textContent);
    };
    const previewImage = () => {
      if (props.comment.imageUrl) {
        common_vendor.index.previewImage({
          current: util_basicData.imgBaseUrl + props.comment.imageUrl,
          urls: [util_basicData.imgBaseUrl + props.comment.imageUrl]
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(util_basicData.imgBaseUrl) + props.userinfo.avatar,
        b: common_vendor.t(props.userinfo.name),
        c: common_vendor.t(common_vendor.unref(common_vendor.dayjs)(props.comment.createdAt).format("YYYY-MM-DD HH:mm:ss")),
        d: common_vendor.f(5, (i, k0, i0) => {
          return {
            a: i,
            b: i <= props.comment.rating ? 1 : ""
          };
        }),
        e: props.comment.replyHint
      }, props.comment.replyHint ? {
        f: common_vendor.t(props.comment.replyText)
      } : {}, {
        g: common_vendor.t(props.comment.textContent),
        h: props.comment.imageUrl
      }, props.comment.imageUrl ? {
        i: common_vendor.unref(util_basicData.imgBaseUrl) + props.comment.imageUrl,
        j: common_vendor.o(previewImage)
      } : {}, {
        k: common_vendor.o(reply)
      });
    };
  }
};
wx.createComponent(_sfc_main);
