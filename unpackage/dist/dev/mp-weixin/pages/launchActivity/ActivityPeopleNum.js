"use strict";
const common_vendor = require("../../common/vendor.js");
const store_activityStore = require("../../store/activityStore.js");
if (!Array) {
  const _easycom_Head2 = common_vendor.resolveComponent("Head");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_Head2 + _easycom_uni_forms_item2 + _easycom_uni_forms2)();
}
const _easycom_Head = () => "../../components/Head/Head.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_Head + _easycom_uni_forms_item + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "ActivityPeopleNum",
  setup(__props) {
    const activityStore = store_activityStore.useActivityStore();
    const localForm = common_vendor.ref({
      leastJoinNum: activityStore.formData.leastJoinNum || "",
      mostJoinNum: activityStore.formData.mostJoinNum || ""
    });
    const validateForm = () => {
      const min = Number(localForm.value.leastJoinNum);
      const max = Number(localForm.value.mostJoinNum);
      if (min === 0 || max === 0 || !localForm.value.leastJoinNum || !localForm.value.mostJoinNum) {
        common_vendor.index.showToast({
          title: "报名人数不能为空或0",
          icon: "none"
        });
        return false;
      }
      if (min > max) {
        common_vendor.index.showToast({
          title: "最小人数不能大于最大人数",
          icon: "none"
        });
        return false;
      }
      if (max > 500) {
        common_vendor.index.showToast({
          title: "最大人数不能超过500",
          icon: "none"
        });
        return false;
      }
      if (min === 0 && max !== 0) {
        common_vendor.index.showToast({
          title: "最小人数为0时最大人数必须为0",
          icon: "none"
        });
        return false;
      }
      return true;
    };
    const handleSubmit = () => {
      if (!validateForm())
        return;
      activityStore.updateFormData({
        leastJoinNum: Number(localForm.value.leastJoinNum),
        mostJoinNum: Number(localForm.value.mostJoinNum)
      });
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          ["head-title"]: "活动人数",
          ["go-back"]: true
        }),
        b: localForm.value.leastJoinNum,
        c: common_vendor.o(($event) => localForm.value.leastJoinNum = $event.detail.value),
        d: localForm.value.mostJoinNum,
        e: common_vendor.o(($event) => localForm.value.mostJoinNum = $event.detail.value),
        f: common_vendor.o(handleSubmit)
      };
    };
  }
};
wx.createPage(_sfc_main);
