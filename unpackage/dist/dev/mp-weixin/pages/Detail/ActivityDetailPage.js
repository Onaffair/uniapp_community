"use strict";
const common_vendor = require("../../common/vendor.js");
const util_basicData = require("../../util/basic-data.js");
const store_activityStore = require("../../store/activityStore.js");
const store_userStore = require("../../store/userStore.js");
const api_activityAPI = require("../../api/activityAPI.js");
const api_GroupApI = require("../../api/GroupApI.js");
if (!Array) {
  const _easycom_Head2 = common_vendor.resolveComponent("Head");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_Comment2 = common_vendor.resolveComponent("Comment");
  const _easycom_WriteComment2 = common_vendor.resolveComponent("WriteComment");
  (_easycom_Head2 + _easycom_uni_tag2 + _easycom_uni_icons2 + _easycom_uni_card2 + _easycom_Comment2 + _easycom_WriteComment2)();
}
const _easycom_Head = () => "../../components/Head/Head.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_Comment = () => "../../components/Comment/Comment.js";
const _easycom_WriteComment = () => "../../components/WriteComment/WriteComment.js";
if (!Math) {
  (_easycom_Head + _easycom_uni_tag + _easycom_uni_icons + _easycom_uni_card + _easycom_Comment + _easycom_WriteComment)();
}
const _sfc_main = {
  __name: "ActivityDetailPage",
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const activityInfo = common_vendor.ref({});
    const locationCoords = common_vendor.ref({
      latitude: null,
      longitude: null
    });
    const { activityStatusList, categoryList } = store_activityStore.useActivityStore();
    const userStore = store_userStore.useUserStore();
    const { myActivity, userDetail } = userStore;
    const categoryName = common_vendor.computed(() => {
      var _a;
      return ((_a = categoryList.find((item) => {
        var _a2;
        return item.id === ((_a2 = activityInfo.value.activity) == null ? void 0 : _a2.categoryId);
      })) == null ? void 0 : _a.name) || "其他";
    });
    const timeRange = common_vendor.computed(() => {
      var _a, _b;
      const format = (t) => common_vendor.dayjs(t).format("YYYY/MM/DD HH:mm");
      return `${format((_a = activityInfo.value.activity) == null ? void 0 : _a.beginTime)} 至 ${format((_b = activityInfo.value.activity) == null ? void 0 : _b.endTime)}`;
    });
    const myComment = common_vendor.reactive({
      activityId: props.id,
      userId: userDetail == null ? void 0 : userDetail.account,
      textContent: "",
      imageUrl: null,
      rating: 0,
      replyHint: null,
      replyText: null
    });
    const btnStatus = common_vendor.computed(() => {
      var _a, _b;
      const res = {
        color: "#FFCC00",
        fn: handleJoin,
        text: "立即报名",
        isDisabled: false
      };
      const status = (_b = (_a = activityInfo.value) == null ? void 0 : _a.activity) == null ? void 0 : _b.status;
      if (myActivity.find((item) => {
        var _a2, _b2;
        return (item == null ? void 0 : item.id) === ((_b2 = (_a2 = activityInfo == null ? void 0 : activityInfo.value) == null ? void 0 : _a2.activity) == null ? void 0 : _b2.id);
      }) && status < 3) {
        res.text = "取消活动";
        res.color = "#FF0000";
        res.fn = organizerCancelActivity;
        return res;
      }
      if (userStore.getParticipation().find((item) => {
        var _a2, _b2;
        return (item == null ? void 0 : item.id) === ((_b2 = (_a2 = activityInfo == null ? void 0 : activityInfo.value) == null ? void 0 : _a2.activity) == null ? void 0 : _b2.id);
      }) && status < 3) {
        res.text = "取消报名";
        res.fn = handleCancelJoin;
      } else {
        let item = activityStatusList.find((item2) => (item2 == null ? void 0 : item2.id) === status);
        if ((item == null ? void 0 : item.id) == 2) {
          res.text = "立即报名";
          res.fn = handleJoin;
        } else {
          res.text = item == null ? void 0 : item.name;
          res.color = "#999999";
          res.isDisabled = true;
        }
      }
      return res;
    });
    const handleJoin = async () => {
      await api_activityAPI.joinActivity(activityInfo.value.activity.id).then(async (res) => {
        if ((res == null ? void 0 : res.code) === 200) {
          await api_GroupApI.joinGroup(activityInfo.value.activity.id);
          common_vendor.index.showToast({
            title: "报名成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: res == null ? void 0 : res.msg,
            icon: "none"
          });
        }
      });
    };
    const handleCancelJoin = () => {
      common_vendor.index.showModal({
        title: "确认取消",
        content: "确定要执行此操作吗？",
        success: async (res) => {
          if (res.confirm) {
            await api_activityAPI.cancelJoinActivity(activityInfo.value.activity.id);
            await api_GroupApI.quitGroup(activityInfo.value.activity.id);
            refreshActivityInfo();
          }
        }
      });
    };
    const organizerCancelActivity = async () => {
      common_vendor.index.showModal({
        title: "确认取消",
        content: "确定要执行此操作吗？",
        success: async (res) => {
          if (res.confirm) {
            await api_activityAPI.cancelActivity(activityInfo.value.activity.id);
            refreshActivityInfo();
          }
        }
      });
    };
    const handleReply = (id, text) => {
      myComment.replyHint = id;
      myComment.replyText = text;
    };
    const processActivityData = (data) => {
      if (data && data.activity && data.activity.address) {
        const addressParts = data.activity.address.split("|");
        if (addressParts.length >= 3) {
          const displayAddress = addressParts[0];
          const latitude = parseFloat(addressParts[1]);
          const longitude = parseFloat(addressParts[2]);
          locationCoords.value = {
            latitude,
            longitude
          };
          data.activity.address = displayAddress;
        }
      }
      return data;
    };
    const refreshActivityInfo = () => {
      api_activityAPI.getActivityDetail(props.id).then((res) => {
        activityInfo.value = processActivityData(res);
      });
    };
    const generateShareContent = () => {
      const activity = activityInfo.value.activity;
      `🔥我分享了活动《${activity.title}》
${activity.highlight}`;
      common_vendor.index.share({
        provider: "weixin",
        scene: "WXSceneSession",
        type: 0,
        title: activity.title,
        summary: activity.highlight,
        success: function() {
          common_vendor.index.showToast({
            title: "分享成功",
            icon: "success"
          });
        },
        fail: function() {
          common_vendor.index.showToast({
            title: "分享失败",
            icon: "none"
          });
        }
      });
    };
    const openLocation = () => {
      var _a, _b;
      if (!locationCoords.value.latitude || !locationCoords.value.longitude) {
        common_vendor.index.showToast({
          title: "位置信息不完整",
          icon: "none"
        });
        return;
      }
      common_vendor.index.openLocation({
        latitude: locationCoords.value.latitude,
        longitude: locationCoords.value.longitude,
        name: (_a = activityInfo.value.activity) == null ? void 0 : _a.title,
        address: (_b = activityInfo.value.activity) == null ? void 0 : _b.address,
        fail: () => {
          common_vendor.index.showToast({
            title: "无法打开位置",
            icon: "none"
          });
        }
      });
    };
    const goToUserDetail = (userId) => {
      common_vendor.index.navigateTo({
        url: `/pages/Detail/UserDetailPage?id=${userId}`
      });
    };
    common_vendor.onMounted(() => {
      refreshActivityInfo();
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w;
      return {
        a: common_vendor.p({
          ["go-back"]: true
        }),
        b: common_vendor.f((_b = (_a = activityInfo.value) == null ? void 0 : _a.activity) == null ? void 0 : _b.images, (item, index, i0) => {
          return {
            a: common_vendor.unref(util_basicData.imgBaseUrl) + item,
            b: index
          };
        }),
        c: common_vendor.t((_d = (_c = activityInfo.value) == null ? void 0 : _c.activity) == null ? void 0 : _d.title),
        d: common_vendor.t(categoryName.value),
        e: common_vendor.p({
          type: "primary"
        }),
        f: common_vendor.p({
          type: "star",
          size: "16"
        }),
        g: common_vendor.t((_f = (_e = activityInfo.value) == null ? void 0 : _e.activity) == null ? void 0 : _f.collectNum),
        h: common_vendor.p({
          type: "staff",
          size: "16"
        }),
        i: common_vendor.t((_h = (_g = activityInfo.value) == null ? void 0 : _g.activity) == null ? void 0 : _h.joinNum),
        j: common_vendor.t(timeRange.value),
        k: common_vendor.t((_j = (_i = activityInfo.value) == null ? void 0 : _i.activity) == null ? void 0 : _j.address),
        l: common_vendor.p({
          type: "location",
          size: "16"
        }),
        m: common_vendor.o(openLocation),
        n: common_vendor.t((_l = (_k = activityInfo.value) == null ? void 0 : _k.activity) == null ? void 0 : _l.leastJoinNum),
        o: common_vendor.t((_n = (_m = activityInfo.value) == null ? void 0 : _m.activity) == null ? void 0 : _n.mostJoinNum),
        p: common_vendor.unref(util_basicData.imgBaseUrl) + ((_p = (_o = activityInfo.value) == null ? void 0 : _o.organizerInfo) == null ? void 0 : _p.avatar),
        q: common_vendor.t((_r = (_q = activityInfo.value) == null ? void 0 : _q.organizerInfo) == null ? void 0 : _r.name),
        r: common_vendor.p({
          type: "right",
          size: "16"
        }),
        s: common_vendor.o(($event) => {
          var _a2, _b2;
          return goToUserDetail((_b2 = (_a2 = activityInfo.value) == null ? void 0 : _a2.organizerInfo) == null ? void 0 : _b2.account);
        }),
        t: common_vendor.p({
          type: "notification",
          size: "16"
        }),
        v: common_vendor.t((_t = (_s = activityInfo.value) == null ? void 0 : _s.activity) == null ? void 0 : _t.highlight),
        w: common_vendor.p({
          title: "活动亮点"
        }),
        x: common_vendor.p({
          type: "info",
          size: "16"
        }),
        y: common_vendor.t((_v = (_u = activityInfo.value) == null ? void 0 : _u.activity) == null ? void 0 : _v.content),
        z: common_vendor.p({
          title: "活动详情"
        }),
        A: common_vendor.f((_w = activityInfo.value) == null ? void 0 : _w.comments, (item, index, i0) => {
          return {
            a: index,
            b: common_vendor.o(handleReply, index),
            c: "e33bd4ff-12-" + i0,
            d: common_vendor.p({
              userinfo: item == null ? void 0 : item.userinfo,
              comment: item == null ? void 0 : item.comment
            })
          };
        }),
        B: common_vendor.o(refreshActivityInfo),
        C: common_vendor.p({
          ["my-comment"]: myComment
        }),
        D: common_vendor.p({
          type: "redo",
          size: "24"
        }),
        E: common_vendor.o(generateShareContent),
        F: common_vendor.t(btnStatus.value.text),
        G: btnStatus.value.isDisabled ? 1 : "",
        H: btnStatus.value.isDisabled,
        I: btnStatus.value.color,
        J: common_vendor.o(($event) => btnStatus.value.fn())
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e33bd4ff"]]);
wx.createPage(MiniProgramPage);
