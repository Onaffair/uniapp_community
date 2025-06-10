"use strict";
const common_vendor = require("../../common/vendor.js");
const store_userStore = require("../../store/userStore.js");
const _sfc_main = {
  __name: "Activity",
  setup(__props) {
    const activeTab = common_vendor.ref(0);
    const loading = common_vendor.ref(false);
    const finished = common_vendor.ref(false);
    const userStore = store_userStore.useUserStore();
    const myActivity = common_vendor.ref(userStore.getMyActivity() || []);
    const myParticipation = common_vendor.ref(userStore.getParticipation() || []);
    const loadInitiatedActivities = async () => {
      if (finished.value)
        return;
      loading.value = true;
      try {
        setTimeout(() => {
          loading.value = false;
          finished.value = true;
        }, 1e3);
      } catch (error) {
        console.error("加载发起的活动失败", error);
        loading.value = false;
      }
    };
    const loadParticipatedActivities = async () => {
      if (finished.value)
        return;
      loading.value = true;
      try {
        setTimeout(() => {
          loading.value = false;
          finished.value = true;
        }, 1e3);
      } catch (error) {
        console.error("加载参加的活动失败", error);
        loading.value = false;
      }
    };
    const onRefresh = () => {
      finished.value = false;
      if (activeTab.value === 0) {
        loadInitiatedActivities();
      } else {
        loadParticipatedActivities();
      }
    };
    const onLoadMore = () => {
      if (activeTab.value === 0) {
        loadInitiatedActivities();
      } else {
        loadParticipatedActivities();
      }
    };
    const navigateToDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/Detail/ActivityDetailPage?id=${id}`
      });
    };
    const goToCreateActivity = () => {
      common_vendor.index.navigateTo({
        url: "/pages/launchActivity/LaunchActivity"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !common_vendor.unref(userStore).getIsLogin()
      }, !common_vendor.unref(userStore).getIsLogin() ? {} : common_vendor.e({
        b: activeTab.value === 0 ? 1 : "",
        c: common_vendor.o(($event) => activeTab.value = 0),
        d: activeTab.value === 1 ? 1 : "",
        e: common_vendor.o(($event) => activeTab.value = 1),
        f: activeTab.value === 0
      }, activeTab.value === 0 ? common_vendor.e({
        g: common_vendor.f(myActivity.value, (activity, k0, i0) => {
          return {
            a: common_vendor.t(activity.title),
            b: common_vendor.t(activity.highlight),
            c: activity.id,
            d: common_vendor.o(($event) => navigateToDetail(activity.id), activity.id)
          };
        }),
        h: finished.value && myActivity.value.length === 0
      }, finished.value && myActivity.value.length === 0 ? {} : {}, {
        i: loading.value && !finished.value
      }, loading.value && !finished.value ? {} : {}, {
        j: finished.value && myActivity.value.length > 0
      }, finished.value && myActivity.value.length > 0 ? {} : {}) : {}, {
        k: activeTab.value === 1
      }, activeTab.value === 1 ? common_vendor.e({
        l: common_vendor.f(myParticipation.value, (activity, k0, i0) => {
          return {
            a: common_vendor.t(activity.title),
            b: common_vendor.t(activity.highlight),
            c: activity.id,
            d: common_vendor.o(($event) => navigateToDetail(activity.id), activity.id)
          };
        }),
        m: finished.value && myParticipation.value.length === 0
      }, finished.value && myParticipation.value.length === 0 ? {} : {}, {
        n: loading.value && !finished.value
      }, loading.value && !finished.value ? {} : {}, {
        o: finished.value && myParticipation.value.length > 0
      }, finished.value && myParticipation.value.length > 0 ? {} : {}) : {}, {
        p: common_vendor.o(onLoadMore),
        q: loading.value,
        r: common_vendor.o(onRefresh),
        s: common_vendor.o(goToCreateActivity)
      }));
    };
  }
};
wx.createPage(_sfc_main);
