"use strict";
const common_vendor = require("../../common/vendor.js");
const composables_useAIChat = require("../../composables/useAIChat.js");
const store_userStore = require("../../store/userStore.js");
if (!Array) {
  const _easycom_ImgUploader2 = common_vendor.resolveComponent("ImgUploader");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_ImgUploader2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_ImgUploader = () => "../../components/ImgUploader/ImgUploader.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_ImgUploader + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "AIChat",
  setup(__props) {
    common_vendor.marked.setOptions({
      gfm: true,
      breaks: false,
      pedantic: false
    });
    const userStore = store_userStore.useUserStore();
    const activities = userStore.getMyActivity();
    const chatRequest = common_vendor.reactive({
      sessionId: "",
      parentId: "",
      activityId: null,
      content: "",
      imageInfo: []
      // 图片信息,url, description
    });
    const selectedActivity = common_vendor.ref(null);
    const images = common_vendor.ref([]);
    const popup = common_vendor.ref(null);
    const {
      sendRequest: sendRequestToDs,
      markdownContent: markdownContentFromDs,
      isLoading: isLoadingFromDs,
      error: errorFromDs
    } = composables_useAIChat.useAIChat();
    const responseText = common_vendor.computed(() => {
      return common_vendor.purify.sanitize(common_vendor.marked.parse(markdownContentFromDs.value));
    });
    const submit = () => {
      var _a;
      if (!chatRequest.content.trim())
        return;
      chatRequest.activityId = (_a = selectedActivity.value) == null ? void 0 : _a.id;
      sendRequestToDs(chatRequest);
      markdownContentFromDs.value = "";
    };
    const showPopup = () => {
      popup.value.open("bottom");
    };
    const closePopup = () => {
      popup.value.close();
    };
    const selectActivity = (activity) => {
      selectedActivity.value = activity;
      closePopup();
    };
    common_vendor.watch(images, (newVal, oldVal) => {
      const addedUrls = newVal.filter((url) => !oldVal.includes(url));
      const removedUrls = oldVal.filter((url) => !newVal.includes(url));
      addedUrls.forEach((url) => {
        if (!chatRequest.imageInfo.some((i) => i.url === url)) {
          chatRequest.imageInfo.push({
            url,
            description: "分析中..."
          });
        }
        if (!url) {
          console.log("图片地址为空");
          return;
        }
        const aiInstance = composables_useAIChat.useAIChat({ endpoint: "/ai/image-analise" });
        const stopContentWatch = common_vendor.watch(() => aiInstance.markdownContent.value, (content) => {
          const target = chatRequest.imageInfo.find((i) => i.url === url);
          if (target)
            target.description = content;
        });
        const stopLoadingWatch = common_vendor.watch(() => aiInstance.isLoading.value, (isLoading) => {
          if (!isLoading) {
            stopContentWatch();
            stopLoadingWatch();
          }
        });
        aiInstance.sendRequest({ imageUrl: url }, "GET");
      });
      removedUrls.forEach((url) => {
        chatRequest.imageInfo = chatRequest.imageInfo.filter((i) => i.url !== url);
      });
    }, { deep: true });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => images.value = $event),
        b: common_vendor.p({
          ["max-count"]: 5,
          ["img-src"]: images.value
        }),
        c: chatRequest.content,
        d: common_vendor.o(($event) => chatRequest.content = $event.detail.value),
        e: common_vendor.t(selectedActivity.value ? selectedActivity.value.title : "选择活动"),
        f: common_vendor.p({
          type: "bottom",
          size: "14",
          color: "#999"
        }),
        g: common_vendor.o(showPopup),
        h: common_vendor.o(submit),
        i: common_vendor.unref(isLoadingFromDs),
        j: common_vendor.unref(isLoadingFromDs),
        k: common_vendor.unref(errorFromDs)
      }, common_vendor.unref(errorFromDs) ? {
        l: common_vendor.t(common_vendor.unref(errorFromDs))
      } : {}, {
        m: responseText.value,
        n: common_vendor.p({
          type: "close",
          size: "20",
          color: "#666"
        }),
        o: common_vendor.o(closePopup),
        p: common_vendor.f(common_vendor.unref(activities), (activity, k0, i0) => {
          return {
            a: common_vendor.t(activity.title),
            b: activity.id,
            c: common_vendor.o(($event) => selectActivity(activity), activity.id)
          };
        }),
        q: common_vendor.sr(popup, "47ed532f-2", {
          "k": "popup"
        }),
        r: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-47ed532f"]]);
wx.createPage(MiniProgramPage);
