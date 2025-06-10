"use strict";
const common_vendor = require("../../common/vendor.js");
const api_activityAPI = require("../../api/activityAPI.js");
const store_userStore = require("../../store/userStore.js");
const store_activityStore = require("../../store/activityStore.js");
const util_basicData = require("../../util/basic-data.js");
if (!Math) {
  ActivityCard();
}
const ActivityCard = () => "../../components/ActivityCard/ActivityCard.js";
const topNum = 3;
const _sfc_main = {
  __name: "Home",
  setup(__props) {
    const userStore = store_userStore.useUserStore();
    const activityStore = store_activityStore.useActivityStore();
    const categories = common_vendor.computed(() => activityStore.categoryList);
    const isLoading = common_vendor.ref(false);
    const isLoadingMore = common_vendor.ref(false);
    const selectedCategory = common_vendor.ref(0);
    const page = common_vendor.ref(1);
    const searchText = common_vendor.ref("");
    const topActivities = common_vendor.ref([]);
    const activities = api_activityAPI.getActivityList(selectedCategory, page, searchText);
    const onRefresh = () => {
      isLoading.value = true;
      page.value = 1;
      common_vendor.index.showToast({
        title: "刷新成功",
        icon: "success"
      });
    };
    const loadMore = async () => {
      if (isLoadingMore.value)
        return;
      isLoadingMore.value = true;
      page.value++;
    };
    const navigateToDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/Detail/ActivityDetailPage?id=${id}`
      });
    };
    common_vendor.onBeforeMount(() => {
      api_activityAPI.getTopActivity(topNum).then((res) => {
        if (res && res.data) {
          topActivities.value = res.data;
        }
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: searchText.value,
        b: common_vendor.o(($event) => searchText.value = $event.detail.value),
        c: common_vendor.unref(util_basicData.imgBaseUrl) + common_vendor.unref(userStore).getUser().avatar,
        d: common_vendor.f(categories.value, (category, k0, i0) => {
          return {
            a: common_vendor.t(category.name),
            b: category.id,
            c: common_vendor.n({
              active: selectedCategory.value === category.id
            }),
            d: common_vendor.o(($event) => selectedCategory.value = category.id, category.id)
          };
        }),
        e: common_vendor.f(topActivities.value, (item, k0, i0) => {
          return {
            a: common_vendor.unref(util_basicData.imgBaseUrl) + item.images[0],
            b: item.id,
            c: common_vendor.o(($event) => navigateToDetail(item.id), item.id)
          };
        }),
        f: common_vendor.unref(activities)
      }, common_vendor.unref(activities) ? {
        g: common_vendor.f(common_vendor.unref(activities), (item, k0, i0) => {
          return {
            a: item.id,
            b: "37daba7c-0-" + i0,
            c: common_vendor.p({
              activity: item
            })
          };
        })
      } : {}, {
        h: common_vendor.unref(activities) && common_vendor.unref(activities).length === 0
      }, common_vendor.unref(activities) && common_vendor.unref(activities).length === 0 ? {} : {}, {
        i: isLoadingMore.value
      }, isLoadingMore.value ? {} : {}, {
        j: isLoading.value,
        k: common_vendor.o(onRefresh),
        l: common_vendor.o(loadMore)
      });
    };
  }
};
wx.createPage(_sfc_main);
