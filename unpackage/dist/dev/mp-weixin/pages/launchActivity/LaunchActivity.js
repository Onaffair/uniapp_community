"use strict";
const common_vendor = require("../../common/vendor.js");
const store_activityStore = require("../../store/activityStore.js");
const util_basicData = require("../../util/basic-data.js");
const api_activityAPI = require("../../api/activityAPI.js");
const api_GroupApI = require("../../api/GroupApI.js");
if (!Array) {
  const _easycom_Head2 = common_vendor.resolveComponent("Head");
  const _easycom_LabelTitle2 = common_vendor.resolveComponent("LabelTitle");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_group2 = common_vendor.resolveComponent("uni-group");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_Head2 + _easycom_LabelTitle2 + _easycom_uni_icons2 + _easycom_uni_group2 + _easycom_uni_popup2)();
}
const _easycom_Head = () => "../../components/Head/Head.js";
const _easycom_LabelTitle = () => "../../components/LabelTitle/LabelTitle.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_group = () => "../../uni_modules/uni-group/components/uni-group/uni-group.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_Head + _easycom_LabelTitle + _easycom_uni_icons + ImgUploader + _easycom_uni_group + _easycom_uni_popup)();
}
const ImgUploader = () => "../../components/ImgUploader/ImgUploader.js";
const _sfc_main = {
  __name: "LaunchActivity",
  setup(__props) {
    const activityStore = store_activityStore.useActivityStore();
    const { formData: activity } = common_vendor.storeToRefs(activityStore);
    const categoryPopup = common_vendor.ref(null);
    const imageList = common_vendor.ref([]);
    const categoryColumns = common_vendor.ref([]);
    const categorySelectedIndex = common_vendor.ref([0]);
    const tempCategorySelected = common_vendor.ref(null);
    const categoryList = activityStore.categoryList;
    common_vendor.onMounted(() => {
      categoryColumns.value = categoryList.map((item) => ({
        text: item.name,
        value: item.id
      }));
      if (activity.value.images && activity.value.images.length > 0) {
        activity.value.images.forEach((item) => {
          imageList.value.push({
            name: item,
            url: util_basicData.imgBaseUrl + item
          });
        });
      }
      if (activity.value.categoryId) {
        const index = categoryColumns.value.findIndex((item) => item.value === activity.value.categoryId);
        if (index !== -1) {
          categorySelectedIndex.value = [index];
        }
      }
    });
    common_vendor.watch(imageList, (newImages) => {
      if (Array.isArray(newImages)) {
        activity.value.images = newImages.map((item) => item);
      } else if (typeof newImages === "string") {
        activity.value.images = newImages ? [newImages] : [];
      } else {
        activity.value.images = [];
      }
    }, { deep: true });
    const isEmpty = (value) => {
      if (value === null || value === void 0)
        return true;
      if (typeof value === "string" && value.trim() === "")
        return true;
      if (typeof value === "number" && value === 0)
        return true;
      if (Array.isArray(value) && value.length === 0)
        return true;
      if (typeof value === "object" && Object.keys(value).length === 0)
        return true;
      return false;
    };
    const getCategoryName = (id) => {
      var _a;
      return ((_a = categoryList.find((item) => item.id === id)) == null ? void 0 : _a.name) || "";
    };
    const showCategoryPicker = () => {
      categoryPopup.value.open("bottom");
    };
    const closeCategoryPicker = () => {
      categoryPopup.value.close();
    };
    const handleCategoryChange = (e) => {
      const values = e.detail.value;
      categorySelectedIndex.value = values;
      const selected = categoryColumns.value[values[0]];
      tempCategorySelected.value = selected.value;
    };
    const confirmCategoryPicker = () => {
      if (tempCategorySelected.value) {
        activity.value.categoryId = tempCategorySelected.value;
      } else if (categoryColumns.value[categorySelectedIndex.value[0]]) {
        activity.value.categoryId = categoryColumns.value[categorySelectedIndex.value[0]].value;
      }
      closeCategoryPicker();
    };
    const goToPage = (url) => {
      common_vendor.index.navigateTo({ url });
    };
    const submitData = async () => {
      try {
        const res = await api_activityAPI.launchActivity(activityStore.formData);
        if (res == null ? void 0 : res.data) {
          await api_GroupApI.createGroup(res.data);
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "success"
          });
          common_vendor.index.navigateBack();
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "发布失败",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          ["head-title"]: "发布活动",
          ["go-back"]: true
        }),
        b: common_vendor.p({
          msg: "活动信息"
        }),
        c: common_vendor.p({
          type: "star",
          size: "18",
          color: "#333"
        }),
        d: common_vendor.t(isEmpty(common_vendor.unref(activity).categoryId) ? "未设置" : getCategoryName(common_vendor.unref(activity).categoryId)),
        e: common_vendor.n(!isEmpty(common_vendor.unref(activity).categoryId) ? "highlight-text" : ""),
        f: common_vendor.p({
          type: "right",
          size: "16"
        }),
        g: common_vendor.o(showCategoryPicker),
        h: common_vendor.p({
          type: "info",
          size: "18",
          color: "#333"
        }),
        i: common_vendor.unref(activity).title,
        j: common_vendor.o(($event) => common_vendor.unref(activity).title = $event.detail.value),
        k: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#333"
        }),
        l: common_vendor.t(isEmpty(common_vendor.unref(activity).content) || isEmpty(common_vendor.unref(activity).highlight) ? "未完善" : "已设置"),
        m: common_vendor.p({
          type: "right",
          size: "16"
        }),
        n: common_vendor.o(($event) => goToPage("/pages/launchActivity/ActivityContent")),
        o: common_vendor.p({
          type: "image",
          size: "18",
          color: "#333"
        }),
        p: common_vendor.o(($event) => imageList.value = $event),
        q: common_vendor.p({
          ["max-count"]: 4,
          ["img-src"]: imageList.value
        }),
        r: common_vendor.p({
          msg: "活动设置"
        }),
        s: common_vendor.p({
          type: "staff",
          size: "18",
          color: "#333"
        }),
        t: common_vendor.t(isEmpty(common_vendor.unref(activity).leastJoinNum) || isEmpty(common_vendor.unref(activity).mostJoinNum) ? "未设置" : "已设置"),
        v: common_vendor.p({
          type: "right",
          size: "16"
        }),
        w: common_vendor.o(($event) => goToPage("/pages/launchActivity/ActivityPeopleNum")),
        x: common_vendor.p({
          type: "calendar",
          size: "18",
          color: "#333"
        }),
        y: common_vendor.t(isEmpty(common_vendor.unref(activity).beginTime) || isEmpty(common_vendor.unref(activity).endTime) ? "未设置" : "已设置"),
        z: common_vendor.p({
          type: "right",
          size: "16"
        }),
        A: common_vendor.o(($event) => goToPage("/pages/launchActivity/ActivityTime")),
        B: common_vendor.p({
          type: "location",
          size: "18",
          color: "#333"
        }),
        C: common_vendor.t(isEmpty(common_vendor.unref(activity).address) ? "未设置" : "已设置"),
        D: common_vendor.p({
          type: "right",
          size: "16"
        }),
        E: common_vendor.o(($event) => goToPage("/pages/launchActivity/ActivityPosition")),
        F: common_vendor.p({
          type: "help",
          size: "18",
          color: "#333"
        }),
        G: common_vendor.o(submitData),
        H: !common_vendor.unref(activityStore).isValid,
        I: common_vendor.unref(activityStore).isValid ? "#ffb04f" : "#b5b5b5",
        J: common_vendor.o(closeCategoryPicker),
        K: common_vendor.o(confirmCategoryPicker),
        L: common_vendor.f(categoryColumns.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.text),
            b: index
          };
        }),
        M: categorySelectedIndex.value,
        N: common_vendor.o(handleCategoryChange),
        O: common_vendor.sr(categoryPopup, "bb8495f6-19", {
          "k": "categoryPopup"
        }),
        P: common_vendor.p({
          type: "bottom"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bb8495f6"]]);
wx.createPage(MiniProgramPage);
