"use strict";
const common_vendor = require("../../common/vendor.js");
const store_activityStore = require("../../store/activityStore.js");
if (!Array) {
  const _easycom_Head2 = common_vendor.resolveComponent("Head");
  const _component_label_title = common_vendor.resolveComponent("label-title");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_Head2 + _component_label_title + _easycom_uni_forms_item2 + _easycom_uni_forms2)();
}
const _easycom_Head = () => "../../components/Head/Head.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_Head + _easycom_uni_forms_item + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "ActivityContent",
  setup(__props) {
    const activityStore = store_activityStore.useActivityStore();
    const localForm = common_vendor.ref({
      highlight: activityStore.formData.highlight || "",
      content: activityStore.formData.content || ""
    });
    const highlightLength = common_vendor.computed(() => localForm.value.highlight.length);
    const phoneNumberRegex = /(1(3\d|4[5-9]|5[0-3,5-9]|6[2567]|7[0-8]|8\d|9[89])\d{8})/;
    const vxRegex = /微信|wechat|vx|wx/gi;
    const validateForm = () => {
      if (!localForm.value.highlight.trim()) {
        common_vendor.index.showToast({
          title: "活动亮点不能为空",
          icon: "none",
          position: "top"
        });
        return false;
      }
      if (!localForm.value.content.trim()) {
        common_vendor.index.showToast({
          title: "活动内容不能为空",
          icon: "none",
          position: "top"
        });
        return false;
      }
      if (localForm.value.content.trim().length < 50) {
        common_vendor.index.showToast({
          title: "活动内容不能小于50字",
          icon: "none",
          position: "top"
        });
        return false;
      }
      const forbiddenKeywords = [
        { regex: vxRegex, message: "内容不能包含微信联系方式" },
        { regex: phoneNumberRegex, message: "内容不能包含手机号码" },
        { regex: /QQ|qq|企鹅/gi, message: "内容不能包含QQ联系方式" }
      ];
      for (const { regex, message } of forbiddenKeywords) {
        if (regex.test(localForm.value.content)) {
          common_vendor.index.showToast({
            title: message,
            icon: "none",
            position: "top"
          });
          return false;
        }
      }
      return true;
    };
    const handleSubmit = () => {
      if (!validateForm())
        return;
      try {
        activityStore.updateFormData({
          highlight: localForm.value.highlight.trim(),
          content: localForm.value.content.trim()
        });
        common_vendor.index.navigateBack();
      } catch (error) {
        common_vendor.index.showToast({
          title: "保存失败，请稍后重试",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          ["head-title"]: "活动详情",
          ["go-back"]: true
        }),
        b: common_vendor.p({
          msg: "活动亮点"
        }),
        c: common_vendor.t(highlightLength.value),
        d: localForm.value.highlight,
        e: common_vendor.o(($event) => localForm.value.highlight = $event.detail.value),
        f: common_vendor.p({
          msg: "活动内容"
        }),
        g: localForm.value.content,
        h: common_vendor.o(($event) => localForm.value.content = $event.detail.value),
        i: common_vendor.o(handleSubmit)
      };
    };
  }
};
wx.createPage(_sfc_main);
