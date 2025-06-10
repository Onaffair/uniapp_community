"use strict";
const common_vendor = require("../../common/vendor.js");
const util_basicData = require("../../util/basic-data.js");
const store_activityStore = require("../../store/activityStore.js");
const _sfc_main = {
  __name: "ActivityCard",
  props: {
    activity: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const activityStore = store_activityStore.useActivityStore();
    const props = __props;
    const statusMap = activityStore.activityStatusList;
    const categoryMap = activityStore.categoryList;
    const formatTime = (timeString) => {
      return common_vendor.dayjs(timeString).format("YYYY年MM月DD日 HH:mm");
    };
    const categoryName = common_vendor.computed(() => {
      const category = categoryMap.find((item) => item.id === props.activity.categoryId);
      return category ? category.name : "未知分类";
    });
    const firstImage = common_vendor.computed(() => {
      var _a;
      return ((_a = props.activity.images) == null ? void 0 : _a[0]) || "";
    });
    const timeRange = common_vendor.computed(() => {
      return `${formatTime(props.activity.beginTime)} - ${formatTime(props.activity.endTime)}`;
    });
    const currentStatus = common_vendor.computed(() => {
      const status = props.activity.status;
      const item = statusMap.find((item2) => item2.id === status);
      return item.name;
    });
    const displayAddress = common_vendor.computed(() => {
      const address = props.activity.address;
      if (!address)
        return "";
      const addressParts = address.split("|");
      if (addressParts.length >= 3) {
        return addressParts[0];
      }
      return address;
    });
    const goToDetail = () => {
      common_vendor.index.navigateTo({
        url: `/pages/Detail/ActivityDetailPage?id=${props.activity.id}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: firstImage.value
      }, firstImage.value ? {
        b: common_vendor.unref(util_basicData.imgBaseUrl) + firstImage.value
      } : {}, {
        c: common_vendor.t(__props.activity.title),
        d: common_vendor.o(goToDetail),
        e: common_vendor.t(categoryName.value),
        f: common_vendor.t(timeRange.value),
        g: common_vendor.t(displayAddress.value),
        h: common_vendor.o(goToDetail),
        i: common_vendor.t(__props.activity.joinNum),
        j: common_vendor.t(__props.activity.mostJoinNum),
        k: common_vendor.t(__props.activity.collectNum),
        l: common_vendor.t(currentStatus.value)
      });
    };
  }
};
wx.createComponent(_sfc_main);
