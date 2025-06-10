"use strict";
const common_vendor = require("../../common/vendor.js");
const util_basicData = require("../../util/basic-data.js");
const store_userStore = require("../../store/userStore.js");
const api_activityAPI = require("../../api/activityAPI.js");
const api_userAPI = require("../../api/userAPI.js");
if (!Array) {
  const _easycom_Head2 = common_vendor.resolveComponent("Head");
  const _easycom_ActivityCard2 = common_vendor.resolveComponent("ActivityCard");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_Head2 + _easycom_ActivityCard2 + _easycom_uni_icons2)();
}
const _easycom_Head = () => "../../components/Head/Head.js";
const _easycom_ActivityCard = () => "../../components/ActivityCard/ActivityCard.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_Head + _easycom_ActivityCard + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "UserDetailPage",
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const userStore = store_userStore.useUserStore();
    const userInfo = common_vendor.reactive({
      name: "加载中...",
      account: "",
      avatar: "",
      status: ""
    });
    const followData = common_vendor.reactive({
      following: [],
      follower: []
    });
    const activities = common_vendor.ref([]);
    const isFollowing = common_vendor.computed(() => !!userStore.getFollowData().following.find((item) => item.account === userInfo.account));
    const isFriend = common_vendor.computed(() => !!userStore.getFriend().find((item) => (item == null ? void 0 : item.account) === userInfo.account));
    const toggleFollow = async () => {
      try {
        if (isFollowing.value) {
          await api_userAPI.unfollow(props.id);
          common_vendor.index.showToast({
            title: "已取消关注",
            icon: "none"
          });
        } else {
          await api_userAPI.follow(props.id);
          common_vendor.index.showToast({
            title: "关注成功",
            icon: "success"
          });
        }
        const followListRes = await api_userAPI.getFollowList(props.id);
        Object.assign(followData, followListRes.data);
        const userFollowRes = await api_userAPI.getFollowList();
        userStore.setFollowData(userFollowRes == null ? void 0 : userFollowRes.data);
      } catch (error) {
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "error"
        });
      }
    };
    const sendFriendRequest = async () => {
      try {
        const res = await api_userAPI.addFriend(props.id);
        common_vendor.index.showToast({
          title: (res == null ? void 0 : res.msg) || "请求已发送",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: "发送请求失败",
          icon: "none"
        });
      }
    };
    const formatActivityTime = (time) => {
      return common_vendor.dayjs(time).format("YYYY-MM-DD HH:mm");
    };
    const loadData = async () => {
      try {
        const activityRes = await api_activityAPI.getUserActivity(props.id);
        activities.value = activityRes.data.map((activity) => {
          if (activity.beginTime) {
            activity.formattedTime = formatActivityTime(activity.beginTime);
          }
          return activity;
        });
        const userInfoRes = await api_userAPI.getUserInfo(props.id);
        Object.assign(userInfo, userInfoRes.data);
        const followRes = await api_userAPI.getFollowList(props.id);
        Object.assign(followData, followRes.data);
      } catch (error) {
        common_vendor.index.showToast({
          title: "加载数据失败",
          icon: "none"
        });
      }
    };
    common_vendor.onMounted(() => {
      loadData();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          ["go-back"]: true
        }),
        b: common_vendor.unref(util_basicData.imgBaseUrl) + userInfo.avatar,
        c: common_vendor.t(userInfo.name),
        d: common_vendor.t(userInfo.account),
        e: common_vendor.unref(userStore).getUser().account !== userInfo.account
      }, common_vendor.unref(userStore).getUser().account !== userInfo.account ? {
        f: common_vendor.t(followData.following.length),
        g: common_vendor.t(followData.follower.length),
        h: common_vendor.t(isFollowing.value ? "已关注" : "关注"),
        i: common_vendor.n(isFollowing.value ? "followed" : "follow"),
        j: common_vendor.o(toggleFollow),
        k: common_vendor.t(isFriend.value ? "已为好友" : "加为好友"),
        l: isFriend.value,
        m: common_vendor.o(sendFriendRequest)
      } : {}, {
        n: activities.value && activities.value.length !== 0
      }, activities.value && activities.value.length !== 0 ? {
        o: common_vendor.f(activities.value, (activity, index, i0) => {
          return {
            a: index,
            b: "bd14ade0-1-" + i0,
            c: common_vendor.p({
              activity
            })
          };
        })
      } : {
        p: common_vendor.p({
          type: "info",
          size: "30",
          color: "#ccc"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bd14ade0"]]);
wx.createPage(MiniProgramPage);
