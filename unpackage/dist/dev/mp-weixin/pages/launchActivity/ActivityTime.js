"use strict";
const common_vendor = require("../../common/vendor.js");
const store_activityStore = require("../../store/activityStore.js");
if (!Array) {
  const _easycom_Head2 = common_vendor.resolveComponent("Head");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  (_easycom_Head2 + _easycom_uni_icons2 + _easycom_uni_forms_item2 + _easycom_uni_forms2 + _easycom_uni_datetime_picker2)();
}
const _easycom_Head = () => "../../components/Head/Head.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
if (!Math) {
  (_easycom_Head + _easycom_uni_icons + _easycom_uni_forms_item + _easycom_uni_forms + _easycom_uni_datetime_picker)();
}
const _sfc_main = {
  __name: "ActivityTime",
  setup(__props) {
    const activityStore = store_activityStore.useActivityStore();
    const beginDatetimePicker = common_vendor.ref(null);
    const endDatetimePicker = common_vendor.ref(null);
    const localForm = common_vendor.ref({
      beginTime: "",
      endTime: ""
    });
    const beginTimeValue = common_vendor.ref("");
    const endTimeValue = common_vendor.ref("");
    const minDate = common_vendor.computed(() => {
      return common_vendor.dayjs().add(2, "day").format("YYYY-MM-DD HH:mm:ss");
    });
    const minEndDate = common_vendor.computed(() => {
      if (beginTimeValue.value) {
        return common_vendor.dayjs(beginTimeValue.value).format("YYYY-MM-DD HH:mm:ss");
      }
      return minDate.value;
    });
    const maxDate = common_vendor.computed(() => {
      return common_vendor.dayjs().add(10, "month").format("YYYY-MM-DD HH:mm:ss");
    });
    common_vendor.onMounted(() => {
      if (activityStore.formData.beginTime) {
        localForm.value.beginTime = activityStore.formData.beginTime;
        beginTimeValue.value = common_vendor.dayjs(activityStore.formData.beginTime).format("YYYY-MM-DD HH:mm:ss");
      }
      if (activityStore.formData.endTime) {
        localForm.value.endTime = activityStore.formData.endTime;
        endTimeValue.value = common_vendor.dayjs(activityStore.formData.endTime).format("YYYY-MM-DD HH:mm:ss");
      }
    });
    const showBeginTimePicker = () => {
      beginDatetimePicker.value.open();
    };
    const showEndTimePicker = () => {
      endDatetimePicker.value.open();
    };
    const onBeginTimeChange = (e) => {
      if (e) {
        const formattedTime = common_vendor.dayjs(e).format("YYYY-MM-DD HH:mm");
        localForm.value.beginTime = formattedTime;
        beginTimeValue.value = e;
      }
    };
    const onEndTimeChange = (e) => {
      if (e) {
        const formattedTime = common_vendor.dayjs(e).format("YYYY-MM-DD HH:mm");
        localForm.value.endTime = formattedTime;
        endTimeValue.value = e;
      }
    };
    const validateTime = () => {
      if (!localForm.value.beginTime || !localForm.value.endTime) {
        common_vendor.index.showToast({
          title: "请选择完整的时间",
          icon: "none"
        });
        return false;
      }
      const start = common_vendor.dayjs(localForm.value.beginTime);
      const end = common_vendor.dayjs(localForm.value.endTime);
      if (start.isAfter(end) || start.isSame(end)) {
        common_vendor.index.showToast({
          title: "结束时间必须晚于开始时间",
          icon: "none"
        });
        return false;
      }
      const minValidDate = common_vendor.dayjs().add(2, "day");
      if (start.isBefore(minValidDate)) {
        common_vendor.index.showToast({
          title: "开始时间需晚于当前时间两天",
          icon: "none"
        });
        return false;
      }
      return true;
    };
    const handleSubmit = () => {
      if (!validateTime())
        return;
      activityStore.updateFormData({
        beginTime: localForm.value.beginTime,
        endTime: localForm.value.endTime
      });
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          ["head-title"]: "活动时间",
          ["go-back"]: true
        }),
        b: common_vendor.t(localForm.value.beginTime || "请选择"),
        c: common_vendor.p({
          type: "right",
          size: "16"
        }),
        d: common_vendor.o(showBeginTimePicker),
        e: common_vendor.t(localForm.value.endTime || "请选择"),
        f: common_vendor.p({
          type: "right",
          size: "16"
        }),
        g: common_vendor.o(showEndTimePicker),
        h: common_vendor.o(handleSubmit),
        i: common_vendor.sr(beginDatetimePicker, "7d83f6c8-6", {
          "k": "beginDatetimePicker"
        }),
        j: common_vendor.o(onBeginTimeChange),
        k: common_vendor.o(($event) => beginTimeValue.value = $event),
        l: common_vendor.p({
          type: "datetime",
          start: minDate.value,
          end: maxDate.value,
          modelValue: beginTimeValue.value
        }),
        m: common_vendor.sr(endDatetimePicker, "7d83f6c8-7", {
          "k": "endDatetimePicker"
        }),
        n: common_vendor.o(onEndTimeChange),
        o: common_vendor.o(($event) => endTimeValue.value = $event),
        p: common_vendor.p({
          type: "datetime",
          start: minEndDate.value,
          end: maxDate.value,
          modelValue: endTimeValue.value
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
