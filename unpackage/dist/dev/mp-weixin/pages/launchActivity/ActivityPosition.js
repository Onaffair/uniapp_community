"use strict";
const common_vendor = require("../../common/vendor.js");
const store_activityStore = require("../../store/activityStore.js");
if (!Array) {
  const _easycom_Head2 = common_vendor.resolveComponent("Head");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_Head2 + _easycom_uni_icons2 + _easycom_uni_forms_item2 + _easycom_uni_forms2 + _easycom_uni_popup2)();
}
const _easycom_Head = () => "../../components/Head/Head.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_Head + _easycom_uni_icons + _easycom_uni_forms_item + _easycom_uni_forms + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "ActivityPosition",
  setup(__props) {
    const activityStore = store_activityStore.useActivityStore();
    const popup = common_vendor.ref(null);
    const cityList = activityStore.cityList;
    const localForm = common_vendor.ref({
      city: null,
      displayAddress: "",
      // 用于显示的地址，不包含经纬度
      address: ""
      // 实际提交的地址，包含经纬度
    });
    const locationInfo = common_vendor.ref({
      latitude: null,
      longitude: null,
      name: ""
    });
    common_vendor.onMounted(() => {
      var _a, _b;
      if ((_a = activityStore.formData) == null ? void 0 : _a.city) {
        const city = cityList.find((c) => c.id === activityStore.formData.city);
        if (city) {
          localForm.value.city = {
            id: city.id,
            name: city.name
          };
        }
      }
      if ((_b = activityStore.formData) == null ? void 0 : _b.address) {
        const addressParts = activityStore.formData.address.split("|");
        if (addressParts.length >= 3) {
          localForm.value.displayAddress = addressParts[0];
          localForm.value.address = activityStore.formData.address;
          locationInfo.value.latitude = parseFloat(addressParts[1]);
          locationInfo.value.longitude = parseFloat(addressParts[2]);
        } else {
          localForm.value.displayAddress = activityStore.formData.address;
          localForm.value.address = activityStore.formData.address;
        }
      }
    });
    const cityOptions = common_vendor.computed(() => cityList.map((c) => ({ text: c.name, value: c.id })));
    const selectedIndex = common_vendor.ref([0]);
    const tempSelectedCity = common_vendor.ref(null);
    const showCityPicker = () => {
      if (localForm.value.city) {
        const index = cityOptions.value.findIndex((c) => c.value === localForm.value.city.id);
        if (index !== -1) {
          selectedIndex.value = [index];
        }
      }
      popup.value.open("bottom");
    };
    const closePicker = () => {
      popup.value.close();
    };
    const handlePickerChange = (e) => {
      const values = e.detail.value;
      selectedIndex.value = values;
      const selected = cityOptions.value[values[0]];
      tempSelectedCity.value = {
        id: selected.value,
        name: selected.text
      };
    };
    const confirmCitySelect = () => {
      if (tempSelectedCity.value) {
        localForm.value.city = tempSelectedCity.value;
      } else {
        const selected = cityOptions.value[selectedIndex.value[0]];
        localForm.value.city = {
          id: selected.value,
          name: selected.text
        };
      }
      closePicker();
    };
    const chooseLocationFromMap = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          console.log("选择位置成功:", res);
          locationInfo.value = {
            latitude: res.latitude,
            longitude: res.longitude,
            name: res.name
          };
          const displayAddress = res.address || res.name;
          localForm.value.displayAddress = displayAddress;
          localForm.value.address = `${displayAddress}|${res.latitude}|${res.longitude}`;
        },
        fail: (err) => {
          console.error("选择位置失败:", err);
          common_vendor.index.showToast({
            title: "选择位置失败",
            icon: "none"
          });
        }
      });
    };
    const validateForm = () => {
      var _a, _b, _c;
      if (!((_b = (_a = localForm.value) == null ? void 0 : _a.city) == null ? void 0 : _b.id)) {
        common_vendor.index.showToast({
          title: "请选择城市",
          icon: "none"
        });
        return false;
      }
      if (!((_c = localForm.value.displayAddress) == null ? void 0 : _c.trim())) {
        common_vendor.index.showToast({
          title: "请从地图选择位置",
          icon: "none"
        });
        return false;
      }
      if (!locationInfo.value.latitude || !locationInfo.value.longitude) {
        common_vendor.index.showToast({
          title: "请从地图选择有效位置",
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
        city: localForm.value.city.id,
        address: localForm.value.address.trim()
      });
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: common_vendor.p({
          title: "活动地址",
          ["go-back"]: true
        }),
        b: common_vendor.t(((_a = localForm.value.city) == null ? void 0 : _a.name) || "待选择"),
        c: common_vendor.p({
          type: "right",
          size: "16"
        }),
        d: common_vendor.o(showCityPicker),
        e: localForm.value.displayAddress,
        f: common_vendor.o(($event) => localForm.value.displayAddress = $event.detail.value),
        g: common_vendor.p({
          type: "map",
          size: "20"
        }),
        h: common_vendor.t(localForm.value.displayAddress ? "重新选择位置" : "从地图选择位置"),
        i: common_vendor.o(chooseLocationFromMap),
        j: locationInfo.value.latitude
      }, locationInfo.value.latitude ? {
        k: common_vendor.p({
          type: "checkmarkempty",
          size: "22",
          color: "#007aff"
        })
      } : {}, {
        l: common_vendor.o(handleSubmit),
        m: common_vendor.o(closePicker),
        n: common_vendor.o(confirmCitySelect),
        o: common_vendor.f(cityOptions.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.text),
            b: index
          };
        }),
        p: selectedIndex.value,
        q: common_vendor.o(handlePickerChange),
        r: common_vendor.sr(popup, "4acc0978-7", {
          "k": "popup"
        }),
        s: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
