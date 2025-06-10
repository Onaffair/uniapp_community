"use strict";
const common_vendor = require("../../common/vendor.js");
const util_basicData = require("../../util/basic-data.js");
const store_userStore = require("../../store/userStore.js");
const api_activityAPI = require("../../api/activityAPI.js");
if (!Math) {
  ImgUploader();
}
const ImgUploader = () => "../ImgUploader/ImgUploader.js";
const _sfc_main = {
  __name: "WriteComment",
  props: {
    myComment: {
      type: Object,
      default: () => ({
        activityId: "",
        userId: "",
        textContent: "",
        imageUrl: "",
        rating: 0,
        replyHint: null,
        replyText: ""
      })
    }
  },
  emits: ["onCommentSuccess"],
  setup(__props, { emit: __emit }) {
    const userStore = store_userStore.useUserStore();
    const emits = __emit;
    const props = __props;
    const myComment = common_vendor.reactive(props.myComment);
    const userDetail = userStore.getUser();
    const clearReply = () => {
      myComment.replyHint = null;
      myComment.replyText = null;
    };
    const setRating = (value) => {
      myComment.rating = value;
    };
    const submitComment = async () => {
      if (!myComment.textContent.trim() && !myComment.imageUrl) {
        common_vendor.index.showToast({
          title: "评论内容不能为空！",
          icon: "none"
        });
        return;
      }
      try {
        const res = await api_activityAPI.postActivityComment(myComment);
        if (res.code === 200) {
          myComment.textContent = "";
          myComment.imageUrl = "";
          myComment.rating = 0;
          myComment.replyHint = null;
          myComment.replyText = null;
          emits("onCommentSuccess");
          common_vendor.index.showToast({
            title: "评论成功",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "评论失败",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: myComment.replyHint
      }, myComment.replyHint ? {
        b: common_vendor.t(myComment.replyText),
        c: common_vendor.o(clearReply)
      } : {}, {
        d: common_vendor.f(5, (i, k0, i0) => {
          return {
            a: i,
            b: i <= myComment.rating ? 1 : "",
            c: common_vendor.o(($event) => setRating(i), i)
          };
        }),
        e: common_vendor.unref(util_basicData.imgBaseUrl) + ((_a = common_vendor.unref(userDetail)) == null ? void 0 : _a.avatar),
        f: myComment.textContent,
        g: common_vendor.o(($event) => myComment.textContent = $event.detail.value),
        h: common_vendor.o(($event) => myComment.imageUrl = $event),
        i: common_vendor.p({
          ["max-count"]: 1,
          ["is-preview"]: true,
          ["icon-style"]: {
            width: "70rpx",
            height: "70rpx"
          },
          ["img-style"]: {
            width: "70rpx",
            height: "70rpx"
          },
          ["img-src"]: myComment.imageUrl
        }),
        j: common_vendor.o(submitComment)
      });
    };
  }
};
wx.createComponent(_sfc_main);
