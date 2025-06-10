"use strict";
const common_vendor = require("../../common/vendor.js");
const store_OSSStore = require("../../store/OSSStore.js");
const _sfc_main = {
  __name: "ImgUploader",
  props: {
    imgSrc: {
      type: [String, Array],
      default: () => []
    },
    maxCount: {
      type: Number,
      default: 1,
      validator: (v) => v >= 1
    },
    isPreview: {
      type: Boolean,
      default: true
    }
  },
  emits: ["update:imgSrc"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const ossStore = store_OSSStore.useOSSStore();
    const localImages = common_vendor.computed({
      get: () => {
        if (Array.isArray(props.imgSrc))
          return props.imgSrc;
        return props.imgSrc ? [props.imgSrc] : [];
      },
      set: (val) => {
        const output = props.maxCount === 1 ? val[0] || "" : val;
        emit("update:imgSrc", output);
      }
    });
    const fileList = common_vendor.computed(() => localImages.value);
    const handleSelect = async () => {
      const currentCount = localImages.value.length;
      const count = props.maxCount - currentCount;
      if (count <= 0)
        return;
      try {
        const res = await common_vendor.index.chooseImage({
          count,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"]
        });
        const urls = [];
        for (const file of res.tempFiles) {
          const res2 = await ossStore.ossUploader.upload(file);
          urls.push(res2);
        }
        localImages.value = [...localImages.value, ...urls];
      } catch (error) {
        console.error("选择图片失败", error);
        common_vendor.index.showToast({
          title: "选择图片失败",
          icon: "none"
        });
      }
    };
    const previewImage = (url, index) => {
      const urls = localImages.value;
      common_vendor.index.previewImage({
        current: index,
        urls,
        indicator: "number"
      });
    };
    const deleteImage = (index) => {
      localImages.value = localImages.value.filter((_, i) => i !== index);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.isPreview
      }, __props.isPreview ? {
        b: common_vendor.f(fileList.value, (item, index, i0) => {
          return {
            a: item,
            b: common_vendor.o(($event) => previewImage(item, index), index),
            c: common_vendor.o(($event) => deleteImage(index), index),
            d: index
          };
        })
      } : {}, {
        c: fileList.value.length < __props.maxCount
      }, fileList.value.length < __props.maxCount ? {
        d: common_vendor.o(handleSelect)
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5e0526b7"]]);
wx.createComponent(Component);
